#!/usr/bin/env python3
"""
Script to process an existing S3 user persona file, calculate scores using
test_processor, and upload the results back to S3 (including user_input_summary).
"""

import os
import sys
import json
import tempfile
from datetime import datetime
from collections import defaultdict

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Import process_responses and questions definition
sys.path.append(os.path.dirname(__file__))
from test_processor import process_responses, personality_questions  # type: ignore
from llm_classifier import classify_user_persona  # type: ignore


# ---------------------------------------------------------------------------
# Helper: fill default responses so all Q1–Q5 have values
# ---------------------------------------------------------------------------

def set_default_question_responses(
    questions_list,
    personality_questions_dict=None,
    verbose: bool = False,
):
    """
    Ensure all 5 questions (Q1–Q5) have responses, using defaults when needed.

    Args:
        questions_list: list of question dicts with 'id' and optional 'response'
        personality_questions_dict: dict containing question definitions
        verbose: whether to print which questions got default values

    Returns:
        List of exactly 5 questions with default responses filled in.
    """
    if personality_questions_dict is None:
        personality_questions_dict = personality_questions

    # Map of question definitions keyed by ID
    question_defs = personality_questions_dict.get("questions", {})

    # Map of existing question IDs from the list
    existing_question_ids = {
        q.get("id"): q for q in questions_list if q.get("id")
    }

    result_questions = []
    defaulted_questions = []

    for qid in [f"Q{i}" for i in range(1, 6)]:
        if qid in existing_question_ids:
            # IMPORTANT: Preserve the original question object from the request
            # This ensures we keep the actual user responses, not data from files
            question = existing_question_ids[qid].copy()
            
            # Preserve all original fields (response, question text, etc.)
            original_response = question.get("response")
            original_question_text = question.get("question", "")
            
            # Only set default if response is truly missing/empty
            if original_response is None or original_response == "" or (isinstance(original_response, str) and not original_response.strip()):
                # Set default response only if missing
                question_def = question_defs.get(qid, {})
                qtype = question_def.get("type", "")

                if qtype in ["likert", "likert_reverse"]:
                    
                    question["response"] = 3  # middle value
                    defaulted_questions.append(f"{qid} (Likert: 3)")
                elif qtype == "choice":
                    answers = question_def.get("answers", {})
                    if answers:
                        first_option = list(answers.keys())[0]
                        question["response"] = first_option
                        defaulted_questions.append(
                            f"{qid} (Choice: {first_option})"
                        )
                    else:
                        question["response"] = ""
                        defaulted_questions.append(f"{qid} (No options available)")
                else:
                    question["response"] = ""
                    defaulted_questions.append(f"{qid} (Unknown type)")
            else:
                # Response exists - preserve it exactly as provided
                question["response"] = original_response
            
            # Ensure question text is present (fill from dict if missing)
            if not original_question_text:
                question_def = question_defs.get(qid, {})
                if question_def.get("question"):
                    question["question"] = question_def["question"]
            
            result_questions.append(question)
        else:
            # Question missing, create with default
            question_def = question_defs.get(qid, {})
            question = {
                "id": qid,
                "question": question_def.get("question", ""),
                "response": "",
            }

            qtype = question_def.get("type", "")
            if qtype in ["likert", "likert_reverse"]:
                question["response"] = 3
                defaulted_questions.append(f"{qid} (Likert: 3)")
            elif qtype == "choice":
                answers = question_def.get("answers", {})
                if answers:
                    first_option = list(answers.keys())[0]
                    question["response"] = first_option
                    defaulted_questions.append(f"{qid} (Choice: {first_option})")

            result_questions.append(question)

    if verbose and defaulted_questions:
        print(f"📝 Applied default responses to {len(defaulted_questions)} question(s):")
        for q_info in defaulted_questions:
            print(f"   - {q_info}")

    return result_questions


# ---------------------------------------------------------------------------
# Env & S3 client setup
# ---------------------------------------------------------------------------

# Load environment variables from project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

S3_BUCKET = os.getenv("S3_BUCKET", "user-persona-data")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Initialize S3 client
try:
    if os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY"):
        creds = {
            "aws_access_key_id": os.getenv("AWS_ACCESS_KEY_ID"),
            "aws_secret_access_key": os.getenv("AWS_SECRET_ACCESS_KEY"),
        }
        if os.getenv("AWS_SESSION_TOKEN"):
            creds["aws_session_token"] = os.getenv("AWS_SESSION_TOKEN")

        s3_client = boto3.client("s3", region_name=AWS_REGION, **creds)
        print("✅ S3 Client initialized successfully")
    else:
        print("❌ Error: AWS credentials not found in environment variables")
        sys.exit(1)
except Exception as s3_error:
    print(f"❌ Failed to initialize S3 client: {s3_error}")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Core processing
# ---------------------------------------------------------------------------

def process_user_persona_data(
    uploaded_data: dict,
    s3_client_instance=None,
    bucket: str | None = None,
    user_id: str | None = None,
    verbose: bool = True,
) -> dict | None:
    """
    Process user persona data, calculate scores, and optionally upload
    results to S3 (with user_input_summary included).

    Args:
        uploaded_data: dict containing the user persona data
        s3_client_instance: optional S3 client instance
        bucket: optional S3 bucket name (required if s3_client_instance is provided)
        user_id: optional user ID (defaults to uploaded_data['user_id'] or 'unknown')
        verbose: whether to print progress messages

    Returns:
        dict containing the final output with personality analysis, or None if error.
    """
    try:
        user_id = user_id or uploaded_data.get("user_id", "unknown")

        if verbose:
            print(f"🔄 Processing data for user: {user_id}")

        # Ensure all 5 questions have responses
        questions_with_defaults = set_default_question_responses(
            uploaded_data.get("questions", []),
            personality_questions_dict=personality_questions,
            verbose=verbose,
        )
        uploaded_data["questions"] = questions_with_defaults

        if verbose:
            questions_with_responses = sum(
                1
                for q in questions_with_defaults
                if q.get("response") not in ("", None)
            )
            print(
                f"✅ Ensured all 5 questions have responses "
                f"({questions_with_responses} total responses)"
            )

        # Extract answers dict
        answers = {}
        for q in questions_with_defaults:
            qid = q.get("id")
            response = q.get("response", "")
            if not qid or response in ("", None):
                continue

            # Convert numeric strings to int for likert questions if possible
            if isinstance(response, str) and response.isdigit():
                answers[qid] = int(response)
            else:
                answers[qid] = response

        if verbose:
            print(f"✅ Extracted {len(answers)} answers")

        # Build user_responses in the format expected by process_responses
        user_responses = {
            "user_id": uploaded_data.get("user_id", user_id),
            "timestamp": uploaded_data.get("timestamp", datetime.now().isoformat()),
            "answers": answers,
        }

        if verbose:
            print("🧮 Calculating personality trait scores...")

        analysis_results = process_responses(personality_questions, user_responses)

        if verbose:
            print(
                f"✅ Calculated scores for "
                f"{len(analysis_results.get('trait_scores', {}))} traits"
            )

        # Aggregate traits
        aggregated_traits = defaultdict(int)
        questions = uploaded_data.get("questions", [])
        has_question_trait_scores = False

        for question in questions:
            if isinstance(question.get("trait_scores"), dict):
                has_question_trait_scores = True
                for trait, score in question["trait_scores"].items():
                    try:
                        aggregated_traits[trait] += int(score)
                    except (ValueError, TypeError):
                        pass

        if not has_question_trait_scores:
            calculated_trait_scores = analysis_results.get("trait_scores", {})
            for trait, score in calculated_trait_scores.items():
                aggregated_traits[trait] = score

        aggregated_traits = dict(
            sorted(aggregated_traits.items(), key=lambda x: x[1], reverse=True)
        )

        if verbose:
            print(f"✅ Aggregated {len(aggregated_traits)} traits")

        # -------------------------------------------------------------------
        # user_input_summary handling (IMPORTANT)
        # -------------------------------------------------------------------
        user_input_summary = uploaded_data.get("user_input_summary", "")
        
        # Ensure it's a string and not None
        if user_input_summary is None:
            user_input_summary = ""
        else:
            user_input_summary = str(user_input_summary)

        if not user_input_summary or not user_input_summary.strip():
            if verbose:
                print("⚠️  Warning: user_input_summary is empty or whitespace only")
                print("   It must be set before uploading results to S3.")
        else:
            if verbose:
                summary_length = len(user_input_summary)
                print(f"✅ user_input_summary is present ({summary_length} characters)")
                preview = (
                    f"{user_input_summary[:100]}..."
                    if summary_length > 100
                    else user_input_summary
                )
                print(f"   Preview: {preview}")

        # -------------------------------------------------------------------
        # Build final output
        # -------------------------------------------------------------------
        final_output = {
            "user_id": uploaded_data.get("user_id", user_id),
            "timestamp": uploaded_data.get("timestamp", datetime.now().isoformat()),
            "user_input_summary": user_input_summary or "",
            "predicted_category": uploaded_data.get("predicted_category", ""),
            "aggregated_traits": aggregated_traits,
            "personality_analysis": {
                "trait_scores": analysis_results.get("trait_scores", {}),
                "responses": analysis_results.get("responses", []),
            },
        }

        if verbose:
            print(
                f"📋 Questions summary: {len(questions_with_defaults)} questions "
                "(full details in personality_analysis.responses)"
            )

        # -------------------------------------------------------------------
        # Upload to S3
        # -------------------------------------------------------------------
        if s3_client_instance and bucket:
            # Warn if user_input_summary is empty, but still proceed with upload
            if not user_input_summary or not str(user_input_summary).strip():
                if verbose:
                    print("⚠️  Warning: user_input_summary is empty - proceeding anyway")
                    print("   The analysis will be uploaded but user_input_summary will be empty")
                    print("   Consider setting user_input_summary before calling process_user_persona_data")

            if verbose:
                print("📤 Uploading results to S3...")

            analysis_json = json.dumps(
                final_output, indent=2, ensure_ascii=False
            )
            output_filename = f"{user_id}_final_userpersona_analysis.json"
            output_key = f"{user_id}/{output_filename}"

            s3_client_instance.put_object(
                Bucket=bucket,
                Key=output_key,
                Body=analysis_json.encode("utf-8"),
                ContentType="application/json; charset=utf-8",
                Metadata={
                    "userId": user_id,
                    "processedAt": datetime.now().isoformat(),
                    "hasAnalysis": "true",
                    "originalFile": f"{user_id}_final_userpersona.json",
                },
            )

            if verbose:
                print(f"✅ Successfully uploaded analysis to: s3://{bucket}/{output_key}")

            # LLM classifier – predicted category
            try:
                if verbose:
                    print("🔍 Classifying user persona to predict category...")

                predicted_category = classify_user_persona(
                    json_data=final_output,
                    region=AWS_REGION,
                    verbose=verbose,
                )

                print("\n" + "=" * 60)
                print(f"🎯 PREDICTED CATEGORY: {predicted_category}")
                print("=" * 60 + "\n")

                final_output["predicted_category"] = predicted_category

                if verbose:
                    print("📤 Re-uploading analysis with predicted category...")

                updated_analysis_json = json.dumps(
                    final_output, indent=2, ensure_ascii=False
                )
                s3_client_instance.put_object(
                    Bucket=bucket,
                    Key=output_key,
                    Body=updated_analysis_json.encode("utf-8"),
                    ContentType="application/json; charset=utf-8",
                    Metadata={
                        "userId": user_id,
                        "processedAt": datetime.now().isoformat(),
                        "hasAnalysis": "true",
                        "hasCategory": "true",
                        "predictedCategory": predicted_category,
                        "originalFile": f"{user_id}_final_userpersona.json",
                    },
                )

                if verbose:
                    print(
                        "✅ Successfully updated analysis with predicted category: "
                        f"{predicted_category}"
                    )

            except Exception as classifier_error:
                if verbose:
                    print(
                        f"⚠️  Warning: Failed to classify user persona: {classifier_error}"
                    )
                    import traceback

                    traceback.print_exc()
                # Do not fail the overall processing if classification fails

        return final_output

    except Exception as e:
        if verbose:
            print(f"❌ Error processing data: {e}")
            import traceback

            traceback.print_exc()
        return None


# ---------------------------------------------------------------------------
# S3 file processing (CLI entrypoint)
# ---------------------------------------------------------------------------

def process_user_persona_file(
    user_id: str,
    s3_client_instance=None,
    bucket: str | None = None,
    verbose: bool = True,
) -> bool:
    """
    Process a user persona file from S3, calculate scores, and upload results.

    Args:
        user_id: e.g., "uuid001"
        s3_client_instance: optional S3 client (uses global if not provided)
        bucket: optional S3 bucket (uses global if not provided)
        verbose: whether to print progress messages
    """
    s3_client_to_use = s3_client_instance or s3_client
    bucket_to_use = bucket or S3_BUCKET

    input_filename = f"{user_id}_final_userpersona.json"
    s3_key = f"{user_id}/{input_filename}"

    if verbose:
        print(f"\n🔍 Processing file: s3://{bucket_to_use}/{s3_key}")
        print("=" * 60)

    with tempfile.NamedTemporaryFile(mode="wb", suffix=".json", delete=False) as temp_file:
        temp_path = temp_file.name

    try:
        # Download
        if verbose:
            print("📥 Downloading from S3...")
        s3_client_to_use.download_file(bucket_to_use, s3_key, temp_path)
        if verbose:
            print("✅ Downloaded successfully")

        # Load JSON
        if verbose:
            print("📖 Loading JSON data...")
        with open(temp_path, "r", encoding="utf-8") as f:
            uploaded_data = json.load(f)
        if verbose:
            print(f"✅ Loaded data for user: {uploaded_data.get('user_id', 'unknown')}")

        # Process
        final_output = process_user_persona_data(
            uploaded_data,
            s3_client_instance=s3_client_to_use,
            bucket=bucket_to_use,
            user_id=user_id,
            verbose=verbose,
        )

        if not final_output:
            return False

        if verbose:
            print("\n" + "=" * 60)
            print("📊 Processing Summary:")
            print(f"  User ID: {user_id}")
            print(f"  Input File:  s3://{bucket_to_use}/{s3_key}")
            print(
                f"  Output File: s3://{bucket_to_use}/{user_id}/"
                f"{user_id}_final_userpersona_analysis.json"
            )
            print(
                "  Traits Scored: "
                f"{len(final_output.get('personality_analysis', {}).get('trait_scores', {}))}"
            )
            print("=" * 60)

            trait_scores = final_output.get(
                "personality_analysis", {}
            ).get("trait_scores", {})
            if trait_scores:
                sorted_traits = sorted(
                    trait_scores.items(), key=lambda x: x[1], reverse=True
                )
                print("\n🏆 Top 5 Traits:")
                for trait, score in sorted_traits[:5]:
                    print(f"  {trait}: {score}")

        return True

    except ClientError as e:
        error = e.response.get("Error", {})
        error_code = error.get("Code", "Unknown")
        error_message = error.get("Message", str(e))

        if error_code == "NoSuchKey":
            if verbose:
                print(
                    f"❌ Error: File not found in S3: s3://{bucket_to_use}/{s3_key}"
                )
                print("   Please ensure the file exists at the specified location.")
        else:
            if verbose:
                print(f"❌ S3 Error: {error_message} (Code: {error_code})")
        return False

    except Exception as e:
        if verbose:
            print(f"❌ Error processing file: {e}")
            import traceback

            traceback.print_exc()
        return False

    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)


# ---------------------------------------------------------------------------
# CLI main
# ---------------------------------------------------------------------------

def main() -> None:
    """CLI entrypoint."""
    if len(sys.argv) < 2:
        print("Usage: python3 process_s3_scores.py <user_id>")
        print("Example: python3 process_s3_scores.py uuid001")
        print("\nThis script will:")
        print("  1. Download s3://user-persona-data/<user_id>/<user_id>_final_userpersona.json")
        print("  2. Calculate personality trait scores using test_processor")
        print(
            "  3. Upload results to "
            "s3://user-persona-data/<user_id>/<user_id>_final_userpersona_analysis.json"
        )
        sys.exit(1)

    user_id = sys.argv[1]

    print(f"📦 S3 Bucket: {S3_BUCKET}")
    print(f"👤 User ID: {user_id}")

    success = process_user_persona_file(user_id)

    if success:
        print("\n✅ Processing completed successfully!")
    else:
        print("\n❌ Processing failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()

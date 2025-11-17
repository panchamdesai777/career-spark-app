import json
import boto3
import re
import os
from botocore.exceptions import ClientError

def classify_user_persona(json_data, bedrock_client=None, region=None, verbose=True):
    """
    Classify user persona data using AWS Bedrock LLM.
    
    Args:
        json_data: Dictionary containing the user persona data
        bedrock_client: Optional Bedrock client instance. If not provided, will create one.
        region: Optional AWS region. Uses environment variable or 'us-east-1' as default.
        verbose: Whether to print progress messages (default: True)
    
    Returns:
        String containing the predicted category, or "Unknown" if classification fails
    """
    try:
        # Initialize Bedrock client if not provided
        if bedrock_client is None:
            region = region or os.getenv('AWS_REGION', 'us-east-1')
            credentials = {}
            
            if os.getenv('AWS_ACCESS_KEY_ID') and os.getenv('AWS_SECRET_ACCESS_KEY'):
                credentials['aws_access_key_id'] = os.getenv('AWS_ACCESS_KEY_ID')
                credentials['aws_secret_access_key'] = os.getenv('AWS_SECRET_ACCESS_KEY')
                
                if os.getenv('AWS_SESSION_TOKEN'):
                    credentials['aws_session_token'] = os.getenv('AWS_SESSION_TOKEN')
                
                bedrock_client = boto3.client('bedrock-runtime', region_name=region, **credentials)
            else:
                # Try without explicit credentials (use default AWS credentials)
                bedrock_client = boto3.client('bedrock-runtime', region_name=region)
        
        if verbose:
            print('🤖 Calling LLM classifier...')
        
        # Build LLM prompt
        prompt = f"""
You are an AI career-path classifier for the entertainment industry.

You MUST choose exactly ONE category from this list:

- Business & Management
- Sport
- Music
- Film/TV
- VFX/Animation
- Writing & Journalism

Rules:
- DO NOT return explanations.
- DO NOT return text.
- ONLY return JSON: {{"category": "CategoryName"}}

Here is the user JSON:
{json.dumps(json_data, indent=2)}
"""

        # Invoke LLAMA3
        response = bedrock_client.invoke_model(
            modelId="meta.llama3-70b-instruct-v1:0",
            body=json.dumps({
                "prompt": prompt,
                "max_gen_len": 150,
                "temperature": 0.1
            })
        )

        model_output = json.loads(response["body"].read())
        raw_output = model_output.get("generation", "").strip()
        
        if verbose:
            print(f'LLM Raw Output: {raw_output}')

        # Extract JSON category
        clean = raw_output.replace("```json", "").replace("```", "").strip()
        clean = re.sub(r'Here.*response.*:', '', clean, flags=re.IGNORECASE).strip()

        match = re.search(r'\{.*\}', clean, flags=re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group(0))
                category = parsed.get("category", "Unknown")
            except:
                category = "Unknown"
        else:
            category = "Unknown"

        if verbose:
            print(f'✅ Predicted Category: {category}')
        
        return category
        
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        error_message = e.response.get('Error', {}).get('Message', str(e))
        if verbose:
            print(f'❌ Bedrock API Error: {error_message} (Code: {error_code})')
        return "Unknown"
    except Exception as e:
        if verbose:
            print(f'❌ Error in classification: {e}')
        return "Unknown"


def lambda_handler(event, context):
    # ---------------------------------------------------------
    # 1️⃣ Extract bucket + file name from S3 event
    # ---------------------------------------------------------
    try:
        record = event["Records"][0]
        bucket_name = record["s3"]["bucket"]["name"]
        file_key = record["s3"]["object"]["key"]
    except Exception as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f"Invalid S3 event: {str(e)}"})
        }

    print(f"Triggered by upload: {file_key}")

    # ---------------------------------------------------------
    # 2️⃣ Load JSON from S3
    # ---------------------------------------------------------
    s3 = boto3.client("s3")
    try:
        file_obj = s3.get_object(Bucket=bucket_name, Key=file_key)
        file_data = file_obj["Body"].read().decode("utf-8")
        json_data = json.loads(file_data)
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"Failed to read JSON: {str(e)}"})
        }

    # ---------------------------------------------------------
    # 3️⃣ Build LLM prompt (Clean + Strict)
    # ---------------------------------------------------------
    prompt = f"""
You are an AI career-path classifier for the entertainment industry.

You MUST choose exactly ONE category from this list:

- Business & Management
- Sport
- Music
- Film/TV
- VFX/Animation
- Writing & Journalism

Rules:
- DO NOT return explanations.
- DO NOT return text.
- ONLY return JSON: {{"category": "CategoryName"}}

Here is the user JSON:
{json.dumps(json_data, indent=2)}
"""

    # ---------------------------------------------------------
    # 4️⃣ Invoke LLAMA3 (WORKS EVERY TIME)
    # ---------------------------------------------------------
    bedrock = boto3.client("bedrock-runtime")

    response = bedrock.invoke_model(
        modelId="meta.llama3-70b-instruct-v1:0",
        body=json.dumps({
            "prompt": prompt,
            "max_gen_len": 150,
            "temperature": 0.1
        })
    )

    model_output = json.loads(response["body"].read())
    raw_output = model_output.get("generation", "").strip()
    print("LLM Raw Output:", raw_output)

    # ---------------------------------------------------------
    # 5️⃣ Extract JSON category
    # ---------------------------------------------------------
    clean = raw_output.replace("```json", "").replace("```", "").strip()
    clean = re.sub(r'Here.*response.*:', '', clean, flags=re.IGNORECASE).strip()

    match = re.search(r'\{.*\}', clean, flags=re.DOTALL)
    if match:
        try:
            parsed = json.loads(match.group(0))
            category = parsed.get("category", "Unknown")
        except:
            category = "Unknown"
    else:
        category = "Unknown"

    print("FINAL CATEGORY:", category)

    # ---------------------------------------------------------
    # 6️⃣ Save result to S3 (as txt)
    # ---------------------------------------------------------
    output_key = f"results/{file_key.replace('.json', '')}_result.txt"
    output_text = f"Predicted Category: {category}\nSource File: {file_key}"

    try:
        s3.put_object(
            Bucket=bucket_name,
            Key=output_key,
            Body=output_text.encode("utf-8")
        )
        print(f"Saved result to: {output_key}")
    except Exception as e:
        print("Failed to write result:", e)

    # ---------------------------------------------------------
    # 7️⃣ Return API output
    # ---------------------------------------------------------
    return {
        "statusCode": 200,
        "body": json.dumps({
            "category": category,
            "result_file": output_key
        })
    }

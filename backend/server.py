#!/usr/bin/env python3
"""
Career Spark Backend Server
Python Flask server for handling file uploads to AWS S3
"""

import os
import uuid
import re
import json
import tempfile
import sys
import mimetypes
from pathlib import Path
from datetime import datetime
from collections import defaultdict
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import queue
import threading
from werkzeug.utils import secure_filename
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv

# Import process_responses from test_processor
sys.path.append(os.path.dirname(__file__))
from test_processor import process_responses, personality_questions
from process_s3_scores import process_user_persona_data, set_default_question_responses
from llm_classifier import classify_user_persona
from debate_agents import main as run_debate
from mentor_agent import ask_llm, get_peer_mentor_recommendations

# Load environment variables from project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app)

# Configuration
PORT = int(os.getenv('PORT', 3001))
S3_BUCKET = os.getenv('S3_BUCKET', 'user-persona-data')
S3_FOLDER = os.getenv('S3_FOLDER', 'uuid001')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')

# Initialize S3 Client
s3_client = None
try:
    credentials = {}
    
    if os.getenv('AWS_ACCESS_KEY_ID') and os.getenv('AWS_SECRET_ACCESS_KEY'):
        credentials['aws_access_key_id'] = os.getenv('AWS_ACCESS_KEY_ID')
        credentials['aws_secret_access_key'] = os.getenv('AWS_SECRET_ACCESS_KEY')
        
        # Add session token if provided (for temporary credentials)
        if os.getenv('AWS_SESSION_TOKEN'):
            credentials['aws_session_token'] = os.getenv('AWS_SESSION_TOKEN')
        
        s3_client = boto3.client(
            's3',
            region_name=AWS_REGION,
            **credentials
        )
        print('S3 Client initialized successfully')
    else:
        print('Warning: AWS credentials not found in environment variables')
except Exception as s3_error:
    print(f'Failed to initialize S3 client: {s3_error}')
    s3_client = None


def sanitize_filename(filename):
    """Sanitize filename to remove special characters"""
    return re.sub(r'[^a-zA-Z0-9._-]', '_', filename)


def extract_text_from_file(file_path, content_type=None):
    """Extract text from various file types"""
    text_content = []
    
    try:
        # Determine file type
        if content_type:
            mime_type = content_type.split(';')[0].strip()
        else:
            mime_type, _ = mimetypes.guess_type(str(file_path))
        
        # Handle JSON files
        if mime_type == 'application/json' or file_path.suffix.lower() == '.json':
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                def extract_text_from_json(obj, path=''):
                    """Recursively extract all string values from JSON"""
                    texts = []
                    if isinstance(obj, dict):
                        for key, value in obj.items():
                            if isinstance(value, str) and value.strip():
                                texts.append(value)
                            elif isinstance(value, (dict, list)):
                                texts.extend(extract_text_from_json(value, f"{path}.{key}" if path else key))
                    elif isinstance(obj, list):
                        for i, item in enumerate(obj):
                            if isinstance(item, str) and item.strip():
                                texts.append(item)
                            elif isinstance(item, (dict, list)):
                                texts.extend(extract_text_from_json(item, f"{path}[{i}]" if path else f"[{i}]"))
                    elif isinstance(obj, str) and obj.strip():
                        texts.append(obj)
                    return texts
                
                # Extract all text from JSON structure
                extracted_texts = extract_text_from_json(data)
                text_content.extend(extracted_texts)
        
        # Handle text files
        elif mime_type in ['text/plain', 'text/txt'] or file_path.suffix.lower() in ['.txt', '.text']:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text_content.append(f.read())
        
        # Handle PDF files (requires PyPDF2 or pdfplumber)
        elif mime_type == 'application/pdf' or file_path.suffix.lower() == '.pdf':
            try:
                import PyPDF2
                with open(file_path, 'rb') as f:
                    pdf_reader = PyPDF2.PdfReader(f)
                    pdf_text = []
                    for page in pdf_reader.pages:
                        pdf_text.append(page.extract_text())
                    text_content.append('\n'.join(pdf_text))
            except ImportError:
                print(f'⚠️  PyPDF2 not installed, skipping PDF text extraction for {file_path.name}')
            except Exception as e:
                print(f'⚠️  Error extracting text from PDF {file_path.name}: {e}')
        
        # Handle images (would need OCR - skip for now or add if needed)
        elif mime_type and mime_type.startswith('image/'):
            print(f'⚠️  Skipping image file {file_path.name} (OCR not implemented)')
        
        # Handle other text-based formats
        else:
            # Try to read as text
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text_content.append(f.read())
            except:
                print(f'⚠️  Could not extract text from {file_path.name} (binary or unsupported format)')
    
    except Exception as e:
        print(f'⚠️  Error processing {file_path.name}: {e}')
    
    return '\n'.join(text_content)


def list_s3_files_in_folder(bucket, folder_prefix, s3_client_instance):
    """List all files in S3 bucket with the given folder prefix"""
    files = []
    try:
        paginator = s3_client_instance.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket, Prefix=folder_prefix + '/')
        
        for page in pages:
            if 'Contents' in page:
                for obj in page['Contents']:
                    # Skip directories (objects ending with /)
                    if not obj['Key'].endswith('/'):
                        files.append({
                            'key': obj['Key'],
                            'size': obj['Size'],
                            'last_modified': obj['LastModified'].isoformat()
                        })
        
        return files
    
    except ClientError as e:
        print(f'❌ Error listing S3 files: {e}')
        return []


def get_latest_description_file(bucket, folder_prefix, s3_client_instance):
    """Get the latest description.txt file from S3 folder.
    
    Args:
        bucket: S3 bucket name
        folder_prefix: Folder prefix (e.g., 'uuid001')
        s3_client_instance: S3 client instance
        
    Returns:
        String content of the latest description.txt file, or empty string if not found
    """
    try:
        # List all files in the folder
        s3_files = list_s3_files_in_folder(bucket, folder_prefix, s3_client_instance)
        
        if not s3_files:
            print(f'No files found in s3://{bucket}/{folder_prefix}/')
            return ''
        
        # Filter for description.txt files
        description_files = [
            f for f in s3_files 
            if f['key'].endswith('-description.txt') and folder_prefix in f['key']
        ]
        
        if not description_files:
            print(f'No description.txt files found in s3://{bucket}/{folder_prefix}/')
            return ''
        
        # Sort by last_modified (most recent first)
        description_files.sort(key=lambda x: x['last_modified'], reverse=True)
        
        # Get the latest file
        latest_file = description_files[0]
        latest_key = latest_file['key']
        filename = os.path.basename(latest_key)
        
        print(f'Found latest description file: {filename} (modified: {latest_file["last_modified"]})')
        
        # Download and read the file
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = os.path.join(temp_dir, 'description.txt')
            s3_client_instance.download_file(bucket, latest_key, temp_path)
            
            # Read the content
            with open(temp_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            print(f'✓ Read {len(content)} characters from latest description file')
            return content.strip()
    
    except ClientError as e:
        print(f'❌ Error getting latest description file: {e}')
        return ''
    except Exception as e:
        print(f'❌ Error reading latest description file: {e}')
        return ''


def combine_files_from_s3_folder(bucket, folder_prefix, s3_client_instance, exclude_patterns=None):
    """Read all files from S3 folder and combine their text content"""
    if exclude_patterns is None:
        exclude_patterns = ['_final_userpersona.json', '_final_userpersona_analysis.json']
    
    # List all files in the folder
    s3_files = list_s3_files_in_folder(bucket, folder_prefix, s3_client_instance)
    
    if not s3_files:
        print(f'No files found in s3://{bucket}/{folder_prefix}/')
        return ''
    
    all_text_content = []
    
    # Create temporary directory for downloads
    with tempfile.TemporaryDirectory() as temp_dir:
        for s3_file in s3_files:
            key = s3_file['key']
            filename = os.path.basename(key)
            
            # Skip excluded files
            if any(pattern in filename for pattern in exclude_patterns):
                print(f'Skipping excluded file: {filename}')
                continue
            
            local_path = Path(temp_dir) / filename
            
            try:
                # Download file
                s3_client_instance.download_file(bucket, key, str(local_path))
                
                # Get content type
                response = s3_client_instance.head_object(Bucket=bucket, Key=key)
                content_type = response.get('ContentType', 'application/octet-stream')
                
                # Extract text
                text = extract_text_from_file(local_path, content_type)
                
                if text.strip():
                    all_text_content.append(f'--- Content from {filename} ---\n{text}')
                    print(f'✓ Extracted {len(text)} characters from {filename}')
                else:
                    print(f'⚠️  No text extracted from {filename}')
                    
            except Exception as e:
                print(f'⚠️  Error processing {filename}: {e}')
    
    # Combine all text
    combined_text = '\n\n'.join(all_text_content)
    print(f'✓ Combined text from {len(all_text_content)} file(s), total length: {len(combined_text)} characters')
    
    return combined_text




@app.route('/api/upload', methods=['POST'])
def upload_files():
    """Handle file uploads to S3"""
    try:
        # Get message from form data
        message = request.form.get('message', '').strip()
        
        # Get files from form data
        files = request.files.getlist('files')
        
        print(f'Received upload request: {len(files)} file(s), message: {"yes" if message else "no"}')
        
        # Validate input
        if not message and len(files) == 0:
            return jsonify({
                'success': False,
                'error': 'Please provide either a message or at least one file.'
            }), 400
        
        # Validate AWS credentials
        if not os.getenv('AWS_ACCESS_KEY_ID') or not os.getenv('AWS_SECRET_ACCESS_KEY'):
            print('AWS credentials not configured')
            return jsonify({
                'success': False,
                'error': 'AWS credentials not configured. Please check your .env file.'
            }), 500
        
        # Check if S3 client is initialized
        if not s3_client:
            print('S3 client not initialized')
            return jsonify({
                'success': False,
                'error': 'S3 client not initialized. Please check your AWS configuration.'
            }), 500
        
        uploaded_keys = []
        timestamp = datetime.now().isoformat().replace(':', '-').replace('.', '-')
        session_id = str(uuid.uuid4())
        
        print(f'Uploading to S3: s3://{S3_BUCKET}/{S3_FOLDER}/')
        
        # Upload text as .txt file
        if message:
            text_key = f'{S3_FOLDER}/{timestamp}-description.txt'
            
            print(f'Uploading text as .txt file: {text_key}')
            
            try:
                s3_client.put_object(
                    Bucket=S3_BUCKET,
                    Key=text_key,
                    Body=message.encode('utf-8'),
                    ContentType='text/plain; charset=utf-8',
                    Metadata={
                        'sessionId': session_id,
                        'uploadedAt': datetime.now().isoformat(),
                        'fileCount': str(len(files))
                    }
                )
                
                uploaded_keys.append(text_key)
                print(f'✓ Successfully uploaded text file: {text_key}')
            except ClientError as text_error:
                error_code = text_error.response.get('Error', {}).get('Code', 'Unknown')
                error_message = text_error.response.get('Error', {}).get('Message', str(text_error))
                print(f'✗ Failed to upload text file: {text_error}')
                print(f'Error details: Code={error_code}, Message={error_message}')
                raise Exception(f'Failed to upload text file: {error_message or error_code}')
        
        # Upload media files
        for i, file in enumerate(files):
            if not file.filename:
                continue
                
            # Keep original filename, just add timestamp prefix to avoid conflicts
            sanitized_original_name = sanitize_filename(file.filename)
            file_key = f'{S3_FOLDER}/{timestamp}-{sanitized_original_name}'
            
            # Get file size in MB
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)  # Reset file pointer
            file_size_mb = round(file_size / 1024 / 1024, 2)
            
            print(f'Uploading file {i + 1}/{len(files)}: {file.filename} ({file_size_mb} MB) -> {file_key}')
            
            try:
                # Determine content type
                content_type = file.content_type or 'application/octet-stream'
                
                s3_client.put_object(
                    Bucket=S3_BUCKET,
                    Key=file_key,
                    Body=file.read(),
                    ContentType=content_type,
                    Metadata={
                        'originalName': file.filename,
                        'sessionId': session_id,
                        'uploadedAt': datetime.now().isoformat()
                    }
                )
                
                uploaded_keys.append(file_key)
                print(f'✓ Successfully uploaded: {file_key}')
            except ClientError as file_error:
                error_code = file_error.response.get('Error', {}).get('Code', 'Unknown')
                error_message = file_error.response.get('Error', {}).get('Message', str(file_error))
                print(f'✗ Failed to upload {file.filename}: {file_error}')
                print(f'Error details: Code={error_code}, Message={error_message}')
                raise Exception(f'Failed to upload {file.filename}: {error_message or error_code}')
        
        print(f'✓ Upload complete! Total items uploaded: {len(uploaded_keys)}')
        print(f'  - Text file: {1 if message else 0}')
        print(f'  - Media files: {len(files)}')
        print(f'  - S3 Location: s3://{S3_BUCKET}/{S3_FOLDER}/')
        
        return jsonify({
            'success': True,
            's3Keys': uploaded_keys,
            'message': f'Successfully uploaded {len(uploaded_keys)} item(s) to S3',
            'sessionId': session_id,
            'bucket': S3_BUCKET,
            'folder': S3_FOLDER,
            'uploadedFiles': len(files),
            'uploadedText': 1 if message else 0
        })
        
    except ClientError as error:
        error_code = error.response.get('Error', {}).get('Code', 'Unknown')
        error_message = error.response.get('Error', {}).get('Message', str(error))
        
        print(f'✗ Upload error: {error}')
        print(f'Error Code: {error_code}, Message: {error_message}')
        
        # Provide more helpful error messages
        if error_code == 'AccessDenied':
            error_message = 'Access denied. Please check your AWS IAM permissions for S3.'
        elif error_code == 'NoSuchBucket':
            error_message = f'S3 bucket "{S3_BUCKET}" does not exist or is not accessible.'
        elif error_code == 'InvalidAccessKeyId':
            error_message = 'Invalid AWS Access Key ID. Please check your .env file.'
        elif error_code == 'SignatureDoesNotMatch':
            error_message = 'Invalid AWS Secret Access Key. Please check your .env file.'
        elif 'credentials' in str(error).lower():
            error_message = 'AWS credentials are invalid or expired. Please check your .env file.'
        
        return jsonify({
            'success': False,
            'error': error_message,
            'errorCode': error_code
        }), 500
        
    except NoCredentialsError:
        return jsonify({
            'success': False,
            'error': 'AWS credentials not configured. Please check your .env file.'
        }), 500
        
    except Exception as error:
        print(f'✗ Upload error: {error}')
        
        error_message = str(error) if str(error) else 'Failed to upload files to S3'
        
        return jsonify({
            'success': False,
            'error': error_message,
            'details': str(error) if os.getenv('FLASK_ENV') == 'development' else None
        }), 500


@app.route('/api/submit-questions', methods=['POST'])
def submit_questions():
    """Handle questions submission and upload to S3"""
    try:
        data = request.get_json()
        
        if not data or 'questions' not in data:
            return jsonify({
                'success': False,
                'error': 'Invalid request. Questions data is required.'
            }), 400
        
        # Get user_id from request or use default
        user_id = data.get('user_id', 'uuid001')
        # Ensure folder path is correct: s3://user-persona-data/uuid001/
        s3_folder = user_id  # Use user_id as folder name (e.g., "uuid001")
        
        # Validate AWS credentials
        if not os.getenv('AWS_ACCESS_KEY_ID') or not os.getenv('AWS_SECRET_ACCESS_KEY'):
            print('AWS credentials not configured')
            return jsonify({
                'success': False,
                'error': 'AWS credentials not configured. Please check your .env file.'
            }), 500
        
        # Check if S3 client is initialized
        if not s3_client:
            print('S3 client not initialized')
            return jsonify({
                'success': False,
                'error': 'S3 client not initialized. Please check your AWS configuration.'
            }), 500
        
        # First, try to get the latest description.txt file
        print(f'Looking for latest description.txt file in s3://{S3_BUCKET}/{s3_folder}/...')
        user_input_summary = get_latest_description_file(
            bucket=S3_BUCKET,
            folder_prefix=s3_folder,
            s3_client_instance=s3_client
        )
        
        # If no description.txt found, read all files from the user's S3 folder and combine their text content
        if not user_input_summary or not user_input_summary.strip():
            print(f'No description.txt found. Reading all files from s3://{S3_BUCKET}/{s3_folder}/ to create user_input_summary...')
            user_input_summary = combine_files_from_s3_folder(
                bucket=S3_BUCKET,
                folder_prefix=s3_folder,
                s3_client_instance=s3_client,
                exclude_patterns=['_final_userpersona.json', '_final_userpersona_analysis.json']
            )
        
        # If still no files found or empty, use the provided summary from request as fallback
        if not user_input_summary or not user_input_summary.strip():
            user_input_summary = data.get('user_input_summary', '') or ''
            if user_input_summary:
                print(f'No files found in S3 folder, using user_input_summary from request ({len(user_input_summary)} chars)')
            else:
                print('⚠️  Warning: user_input_summary is empty - no files in S3 and no summary in request')
        
        # Get questions from request data - ensure we're using the actual request data
        questions = data.get('questions', [])
        
        # Validate that we have questions from the request
        if not questions:
            print('⚠️  Warning: No questions found in request data')
            return jsonify({
                'success': False,
                'error': 'Questions data is required in the request.'
            }), 400
        
        print(f'📋 Received {len(questions)} questions from request')
        # Log first few questions to verify they're from request
        if questions:
            sample_q = questions[0]
            print(f'   Sample question from request: id={sample_q.get("id")}, response={sample_q.get("response")}, has_question_text={bool(sample_q.get("question"))}')
        
        # If still no user_input_summary, try to create from questions
        if not user_input_summary or not user_input_summary.strip():
            if questions:
                question_texts = [q.get('question', '') for q in questions if q.get('question')]
                if question_texts:
                    user_input_summary = ' '.join(question_texts[:3])  # Use first 3 questions as fallback
                    print(f'Created fallback summary from questions ({len(user_input_summary)} chars)')
        
        # Ensure questions preserve their original question text from request
        # If question text is missing, fill it from personality_questions dict
        for q in questions:
            if not q.get('question') and q.get('id'):
                qid = q.get('id')
                question_def = personality_questions.get('questions', {}).get(qid, {})
                if question_def.get('question'):
                    q['question'] = question_def['question']
        
        questions_with_defaults = set_default_question_responses(questions, personality_questions, verbose=True)
        
        # Verify we're using request data and log sample responses
        print(f'✓ Processed {len(questions_with_defaults)} questions (from request, with defaults applied)')
        
        # Log first few responses to verify they're from request
        if questions_with_defaults:
            print('   Sample responses from processed questions:')
            for i, q in enumerate(questions_with_defaults[:3], 1):
                print(f'      {q.get("id")}: response="{q.get("response")}"')
        
        questions_with_responses = sum(1 for q in questions_with_defaults if q.get('response') and q.get('response') != '')
        print(f'✓ Ensured all 5 questions have responses (total: {len(questions_with_defaults)}, with responses: {questions_with_responses})')
        
        # Calculate aggregated traits from question-level trait_scores if they exist
        aggregated_traits = defaultdict(int)
        has_question_trait_scores = False
        
        for question in questions_with_defaults:
            if 'trait_scores' in question and isinstance(question['trait_scores'], dict):
                has_question_trait_scores = True
                for trait, score in question['trait_scores'].items():
                    try:
                        aggregated_traits[trait] += int(score)
                    except (ValueError, TypeError):
                        # Skip invalid scores
                        pass
        
        # Convert defaultdict to regular dict and sort by score (descending)
        aggregated_traits_dict = {}
        if has_question_trait_scores:
            aggregated_traits_dict = dict(sorted(aggregated_traits.items(), key=lambda x: x[1], reverse=True))
            print(f'✓ Calculated aggregated_traits from {len(aggregated_traits_dict)} traits')
        
        # Log user_input_summary status
        summary_length = len(user_input_summary) if user_input_summary else 0
        print(f'📝 user_input_summary prepared: {summary_length} characters')
        if summary_length > 0:
            preview = user_input_summary[:100] + '...' if len(user_input_summary) > 100 else user_input_summary
            print(f'   Preview: {preview}')
        else:
            print('   ⚠️  Warning: user_input_summary is empty')
        
        # Prepare the JSON structure (only responses, trait scores calculated separately)
        output_data = {
            'user_id': user_id,
            'timestamp': datetime.now().isoformat(),
            'user_input_summary': user_input_summary,
            'predicted_category': data.get('predicted_category', ''),
            'questions': questions_with_defaults
        }
        
        # Add aggregated_traits if we calculated them
        if aggregated_traits_dict:
            output_data['aggregated_traits'] = aggregated_traits_dict
        
        # Convert to JSON string
        json_string = json.dumps(output_data, indent=2, ensure_ascii=False)
        
        # Create S3 key - will be stored in s3://user-persona-data/uuid001/
        filename = f'{user_id}_final_userpersona.json'
        s3_key = f'{s3_folder}/{filename}'  # e.g., "uuid001/uuid001_final_userpersona.json"
        
        print(f'Uploading questions data to S3: s3://{S3_BUCKET}/{s3_key}')
        
        # Upload to S3
        try:
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=json_string.encode('utf-8'),
                ContentType='application/json; charset=utf-8',
                Metadata={
                    'userId': user_id,
                    'uploadedAt': datetime.now().isoformat(),
                    'questionCount': str(len(data['questions']))
                }
            )
            
            print(f'✓ Successfully uploaded questions data: {s3_key}')
            
            # Now process the responses and generate personality analysis using process_s3_scores
            try:
                print(f'Processing responses and generating personality analysis...')
                
                # Process the data using the shared function from process_s3_scores
                # This will calculate scores and upload the analysis file to S3
                final_output = process_user_persona_data(
                    uploaded_data=output_data,
                    s3_client_instance=s3_client,
                    bucket=S3_BUCKET,
                    user_id=user_id,
                    verbose=True
                )
                
                if final_output:
                    print(f'✓ Successfully processed and uploaded personality analysis')
                    
                    # Call LLM classifier to get predicted category
                    try:
                        print(f'🔍 Calling LLM classifier to predict category...')
                        predicted_category = classify_user_persona(
                            json_data=final_output,
                            region=AWS_REGION,
                            verbose=True
                        )
                        
                        # Update predicted_category in final_output
                        final_output['predicted_category'] = predicted_category
                        
                        # Update predicted_category in output_data
                        output_data['predicted_category'] = predicted_category
                        
                        # Print predicted category prominently
                        print('\n' + '=' * 60)
                        print(f'🎯 PREDICTED CATEGORY: {predicted_category}')
                        print('=' * 60 + '\n')
                        
                        # Update the initial _final_userpersona.json file with predicted_category
                        try:
                            updated_json_string = json.dumps(output_data, indent=2, ensure_ascii=False)
                            
                            s3_client.put_object(
                                Bucket=S3_BUCKET,
                                Key=s3_key,
                                Body=updated_json_string.encode('utf-8'),
                                ContentType='application/json; charset=utf-8',
                                Metadata={
                                    'userId': user_id,
                                    'uploadedAt': datetime.now().isoformat(),
                                    'questionCount': str(len(data['questions'])),
                                    'hasCategory': 'true',
                                    'predictedCategory': predicted_category
                                }
                            )
                            print(f'✓ Updated initial file with predicted category: {predicted_category}')
                        except Exception as update_error:
                            print(f'⚠️  Warning: Failed to update initial file with predicted category: {update_error}')
                            
                    except Exception as classifier_error:
                        print(f'⚠️  Warning: Failed to classify user persona: {classifier_error}')
                        import traceback
                        traceback.print_exc()
                        # Use predicted_category from final_output if available
                        if 'predicted_category' in final_output and final_output['predicted_category']:
                            output_data['predicted_category'] = final_output['predicted_category']
                            print(f'Using predicted category from process output: {final_output["predicted_category"]}')
                else:
                    print(f'⚠️  Warning: Processing completed but no output was generated')
                    
            except Exception as process_error:
                print(f'⚠️  Warning: Failed to process responses: {process_error}')
                # Don't fail the request if processing fails, just log it
                import traceback
                traceback.print_exc()
            
            # Include predicted_category in response if available
            response_data = {
                'success': True,
                'message': f'Successfully saved questions to S3 and processed personality analysis',
                's3Key': s3_key,
                'bucket': S3_BUCKET,
                'folder': s3_folder,
                'filename': filename
            }
            
            # Add predicted_category if available
            if 'predicted_category' in output_data and output_data['predicted_category']:
                response_data['predicted_category'] = output_data['predicted_category']
            
            return jsonify(response_data)
            
        except ClientError as upload_error:
            error_code = upload_error.response.get('Error', {}).get('Code', 'Unknown')
            error_message = upload_error.response.get('Error', {}).get('Message', str(upload_error))
            print(f'✗ Failed to upload questions data: {upload_error}')
            print(f'Error details: Code={error_code}, Message={error_message}')
            raise Exception(f'Failed to upload to S3: {error_message or error_code}')
        
    except ClientError as error:
        error_code = error.response.get('Error', {}).get('Code', 'Unknown')
        error_message = error.response.get('Error', {}).get('Message', str(error))
        
        print(f'✗ Upload error: {error}')
        print(f'Error Code: {error_code}, Message: {error_message}')
        
        return jsonify({
            'success': False,
            'error': error_message,
            'errorCode': error_code
        }), 500
        
    except Exception as error:
        print(f'✗ Error: {error}')
        
        error_message = str(error) if str(error) else 'Failed to save questions'
        
        return jsonify({
            'success': False,
            'error': error_message,
            'details': str(error) if os.getenv('FLASK_ENV') == 'development' else None
        }), 500


@app.route('/api/get-analysis/<user_id>', methods=['GET'])
def get_analysis(user_id):
    """Get user analysis including predicted category"""
    try:
        # Construct the S3 key for the final analysis file
        s3_key = f"{S3_FOLDER}/{user_id}_final_userpersona_analysis.json"
        
        try:
            # Try to get the analysis file from S3
            response = s3_client.get_object(Bucket=S3_BUCKET, Key=s3_key)
            analysis_data = json.loads(response['Body'].read().decode('utf-8'))
            
            return jsonify({
                'success': True,
                'predicted_category': analysis_data.get('predicted_category', ''),
                'analysis': analysis_data
            })
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            if error_code == 'NoSuchKey':
                # File doesn't exist yet, return empty
                return jsonify({
                    'success': False,
                    'message': 'Analysis not found',
                    'predicted_category': ''
                }), 404
            else:
                print(f'Error fetching analysis: {e}')
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 500
        except Exception as e:
            print(f'Error fetching analysis: {e}')
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
            
    except Exception as error:
        print(f'Error in get_analysis: {error}')
        return jsonify({
            'success': False,
            'error': str(error)
        }), 500


@app.route('/api/find-best-role/<user_id>', methods=['POST'])
def find_best_role(user_id):
    """Run debate agents to find the best matching role for the user"""
    try:
        # Get the predicted category from the request body
        data = request.get_json() or {}
        predicted_category = data.get('predicted_category', '')
        
        if not predicted_category:
            return jsonify({
                'success': False,
                'error': 'predicted_category is required'
            }), 400
        
        # Construct the S3 key for the analysis file
        s3_key = f"{S3_FOLDER}/{user_id}_final_userpersona_analysis.json"
        
        try:
            # Get the user persona data from S3
            response = s3_client.get_object(Bucket=S3_BUCKET, Key=s3_key)
            user_persona = json.loads(response['Body'].read().decode('utf-8'))
            
            print(f"Running debate agents for user {user_id} with category: {predicted_category}")
            
            # Run the debate with the user persona and predicted category
            debate_results = run_debate(
                user_persona=user_persona,
                predicted_category=predicted_category,
                verbose=True
            )
            
            if 'error' in debate_results:
                return jsonify({
                    'success': False,
                    'error': debate_results['error']
                }), 500
            
            return jsonify({
                'success': True,
                'recommended_role': debate_results.get('recommended_role', ''),
                'confidence': debate_results.get('confidence', 0),
                'reason': debate_results.get('reason', ''),
                'pros': debate_results.get('pros', []),
                'considerations': debate_results.get('considerations', []),
                'debated_roles': debate_results.get('debated_roles', []),
                'predicted_category': debate_results.get('predicted_category', predicted_category)
            })
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            if error_code == 'NoSuchKey':
                return jsonify({
                    'success': False,
                    'error': 'User analysis not found. Please complete the questions first.'
                }), 404
            else:
                print(f'Error fetching analysis: {e}')
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 500
        except Exception as e:
            print(f'Error running debate: {e}')
            import traceback
            traceback.print_exc()
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
            
    except Exception as error:
        print(f'Error in find_best_role: {error}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(error)
        }), 500


@app.route('/api/find-best-role-stream/<user_id>', methods=['POST'])
def find_best_role_stream(user_id):
    """Run debate agents with live streaming output using Server-Sent Events"""
    def generate():
        try:
            # Get the predicted category from the request body
            data = request.get_json() or {}
            predicted_category = data.get('predicted_category', '')
            
            if not predicted_category:
                yield f"data: {json.dumps({'type': 'error', 'message': 'predicted_category is required'})}\n\n"
                return
            
            # Construct the S3 key for the analysis file
            s3_key = f"{S3_FOLDER}/{user_id}_final_userpersona_analysis.json"
            
            try:
                # Get the user persona data from S3
                response = s3_client.get_object(Bucket=S3_BUCKET, Key=s3_key)
                user_persona = json.loads(response['Body'].read().decode('utf-8'))
                
                # Queue to collect events and results
                event_queue = queue.Queue()
                result_queue = queue.Queue()
                
                # Stream callback function that puts events in queue
                def stream_callback(event_type, data):
                    """Callback that puts events in queue for streaming"""
                    event_data = {
                        'type': event_type,
                        'data': data
                    }
                    event_queue.put(event_data)
                
                # Run debate in a separate thread
                def run_debate_thread():
                    try:
                        debate_results = run_debate(
                            user_persona=user_persona,
                            predicted_category=predicted_category,
                            verbose=False,  # Don't print, we're streaming
                            stream_callback=stream_callback
                        )
                        result_queue.put(debate_results)
                        event_queue.put(None)  # Signal completion
                    except Exception as e:
                        result_queue.put({'error': str(e)})
                        event_queue.put(None)  # Signal completion
                
                # Start debate thread
                debate_thread = threading.Thread(target=run_debate_thread)
                debate_thread.start()
                
                # Stream events as they arrive
                debate_complete = False
                while not debate_complete:
                    try:
                        # Get event with timeout
                        event = event_queue.get(timeout=0.5)
                        if event is None:
                            debate_complete = True
                            break
                        # Yield the event
                        yield f"data: {json.dumps(event)}\n\n"
                    except queue.Empty:
                        # Check if thread is still alive
                        if not debate_thread.is_alive():
                            debate_complete = True
                            break
                        continue
                
                # Get final results
                try:
                    debate_results = result_queue.get(timeout=5)
                    
                    # Send final result
                    if 'error' in debate_results:
                        yield f"data: {json.dumps({'type': 'error', 'message': debate_results['error']})}\n\n"
                    else:
                        final_data = {
                            'type': 'final_result',
                            'data': {
                                'recommended_role': debate_results.get('recommended_role', ''),
                                'confidence': debate_results.get('confidence', 0),
                                'reason': debate_results.get('reason', ''),
                                'pros': debate_results.get('pros', []),
                                'considerations': debate_results.get('considerations', []),
                                'debated_roles': debate_results.get('debated_roles', []),
                                'predicted_category': debate_results.get('predicted_category', predicted_category)
                            }
                        }
                        yield f"data: {json.dumps(final_data)}\n\n"
                except queue.Empty:
                    yield f"data: {json.dumps({'type': 'error', 'message': 'Timeout waiting for debate results'})}\n\n"
                
            except ClientError as e:
                error_code = e.response.get('Error', {}).get('Code', 'Unknown')
                if error_code == 'NoSuchKey':
                    yield f"data: {json.dumps({'type': 'error', 'message': 'User analysis not found. Please complete the questions first.'})}\n\n"
                else:
                    yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            except Exception as e:
                print(f'Error running debate: {e}')
                import traceback
                traceback.print_exc()
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
                
        except Exception as error:
            print(f'Error in find_best_role_stream: {error}')
            import traceback
            traceback.print_exc()
            yield f"data: {json.dumps({'type': 'error', 'message': str(error)})}\n\n"
    
    return Response(stream_with_context(generate()), mimetype='text/event-stream')


# Store conversation histories per session (in production, use Redis or database)
conversation_sessions = {}

@app.route('/api/chat-with-mentor', methods=['POST'])
def chat_with_mentor():
    """Chat with mentor agent about a specific role"""
    try:
        data = request.get_json() or {}
        job_title = data.get('job_title', '')
        message = data.get('message', '')
        session_id = data.get('session_id', 'default')
        category = data.get('category', None)  # Optional category for peer mentor recommendations
        
        if not job_title:
            return jsonify({
                'success': False,
                'error': 'job_title is required'
            }), 400
        
        if not message:
            return jsonify({
                'success': False,
                'error': 'message is required'
            }), 400
        
        # Get or initialize conversation history for this session
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = {}
        
        if job_title not in conversation_sessions[session_id]:
            conversation_sessions[session_id][job_title] = []
        
        conversation_history = conversation_sessions[session_id][job_title]
        
        # Get response from mentor agent (now returns 3 values: reply, history, peer_mentors)
        reply, updated_history, peer_mentors = ask_llm(job_title, message, conversation_history, category=category)
        
        # Update conversation history
        conversation_sessions[session_id][job_title] = updated_history
        
        response_data = {
            'success': True,
            'reply': reply,
            'job_title': job_title
        }
        
        # Include peer mentors if available
        if peer_mentors:
            response_data['peer_mentors'] = peer_mentors
        
        return jsonify(response_data)
        
    except Exception as error:
        print(f'Error in chat_with_mentor: {error}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(error)
        }), 500


@app.route('/api/peer-mentors/<path:category>', methods=['GET'])
def get_peer_mentors(category):
    """Get peer mentor recommendations for a specific category
    
    Category can be URL-encoded. Examples:
    - Business & Management
    - Film/TV
    - VFX/Animation
    """
    try:
        # Decode URL-encoded category (handles spaces, slashes, etc.)
        from urllib.parse import unquote
        category = unquote(category)
        
        # Get limit from query parameters (default: 5)
        limit = request.args.get('limit', 5, type=int)
        
        # Get peer mentor recommendations
        mentors = get_peer_mentor_recommendations(category, limit=limit)
        
        if not mentors:
            return jsonify({
                'success': False,
                'error': f'No peer mentors found for category: {category}',
                'available_categories': [
                    'Business & Management',
                    'Sport',
                    'Music',
                    'Film/TV',
                    'VFX/Animation',
                    'Writing & Journalism'
                ]
            }), 404
        
        return jsonify({
            'success': True,
            'category': category,
            'mentors': mentors,
            'count': len(mentors)
        })
        
    except Exception as error:
        print(f'Error in get_peer_mentors: {error}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(error)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    print(f'\n🚀 Server running on http://localhost:{PORT}')
    print(f'📦 S3 Bucket: {S3_BUCKET}')
    print(f'📁 S3 Folder: {S3_FOLDER}')
    print(f'🌍 AWS Region: {AWS_REGION}')
    
    if not os.getenv('AWS_ACCESS_KEY_ID') or not os.getenv('AWS_SECRET_ACCESS_KEY'):
        print('⚠️  WARNING: AWS credentials not found in .env file!')
    else:
        print('✅ AWS credentials loaded')
    
    if not s3_client:
        print('⚠️  WARNING: S3 client not initialized!')
    else:
        print('✅ S3 client ready\n')
    
    # Enable debug mode and auto-reload to pick up code changes
    app.run(host='0.0.0.0', port=PORT, debug=True, use_reloader=True)


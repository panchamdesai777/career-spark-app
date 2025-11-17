#!/usr/bin/env python3
"""
Script to process all files from S3 in the same path and create a JSON
with user_input_summary containing all extracted text.
"""

import os
import json
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv
import tempfile
import mimetypes
from pathlib import Path

# Load environment variables from project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configuration
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
        
        if os.getenv('AWS_SESSION_TOKEN'):
            credentials['aws_session_token'] = os.getenv('AWS_SESSION_TOKEN')
        
        s3_client = boto3.client(
            's3',
            region_name=AWS_REGION,
            **credentials
        )
        print('✅ S3 Client initialized successfully')
    else:
        print('❌ Error: AWS credentials not found in environment variables')
        exit(1)
except Exception as s3_error:
    print(f'❌ Failed to initialize S3 client: {s3_error}')
    exit(1)


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


def list_s3_files(bucket, prefix):
    """List all files in S3 bucket with the given prefix"""
    files = []
    try:
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket, Prefix=prefix)
        
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
        
        print(f'📋 Found {len(files)} file(s) in s3://{bucket}/{prefix}')
        return files
    
    except ClientError as e:
        print(f'❌ Error listing S3 files: {e}')
        return []


def download_s3_file(bucket, key, local_path):
    """Download a file from S3"""
    try:
        s3_client.download_file(bucket, key, str(local_path))
        # Get content type
        response = s3_client.head_object(Bucket=bucket, Key=key)
        content_type = response.get('ContentType', 'application/octet-stream')
        return content_type
    except ClientError as e:
        print(f'❌ Error downloading {key}: {e}')
        return None


def main():
    """Main function to process all S3 files and create combined JSON"""
    import sys
    
    # Check for local file argument
    local_files = []
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            local_path = Path(arg)
            if local_path.exists():
                local_files.append(local_path)
            else:
                print(f'⚠️  Warning: Local file not found: {arg}')
    
    print(f'\n🔍 Processing files from s3://{S3_BUCKET}/{S3_FOLDER}/')
    if local_files:
        print(f'📁 Also processing {len(local_files)} local file(s)')
    print('=' * 60)
    
    # List all files in S3
    s3_files = list_s3_files(S3_BUCKET, S3_FOLDER)
    
    if not s3_files and not local_files:
        print('❌ No files found in S3 or locally. Exiting.')
        return
    
    # Create temporary directory for downloads
    with tempfile.TemporaryDirectory() as temp_dir:
        all_text_content = []
        file_info = []
        
        # Process S3 files
        for i, s3_file in enumerate(s3_files, 1):
            key = s3_file['key']
            filename = os.path.basename(key)
            local_path = Path(temp_dir) / filename
            
            print(f'\n[{i}/{len(s3_files)}] Processing S3: {filename}')
            
            # Download file
            content_type = download_s3_file(S3_BUCKET, key, local_path)
            
            if content_type:
                # Extract text
                text = extract_text_from_file(local_path, content_type)
                
                if text.strip():
                    all_text_content.append(f'--- Content from {filename} ---\n{text}')
                    file_info.append({
                        'filename': filename,
                        's3_key': key,
                        'source': 's3',
                        'content_type': content_type,
                        'size': s3_file['size'],
                        'text_length': len(text)
                    })
                    print(f'✅ Extracted {len(text)} characters from {filename}')
                else:
                    print(f'⚠️  No text extracted from {filename}')
            else:
                print(f'❌ Failed to download {filename}')
        
        # Process local files
        for i, local_path in enumerate(local_files, 1):
            filename = local_path.name
            print(f'\n[{i}/{len(local_files)}] Processing local: {filename}')
            
            # Determine content type
            content_type, _ = mimetypes.guess_type(str(local_path))
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Extract text
            text = extract_text_from_file(local_path, content_type)
            
            if text.strip():
                all_text_content.append(f'--- Content from {filename} ---\n{text}')
                file_info.append({
                    'filename': filename,
                    'source': 'local',
                    'content_type': content_type,
                    'size': local_path.stat().st_size,
                    'text_length': len(text)
                })
                print(f'✅ Extracted {len(text)} characters from {filename}')
            else:
                print(f'⚠️  No text extracted from {filename}')
        
        # Combine all text
        combined_text = '\n\n'.join(all_text_content)
        
        # Create output JSON
        output_data = {
            'user_input_summary': combined_text,
            'source': {
                's3_bucket': S3_BUCKET,
                's3_folder': S3_FOLDER,
                'total_files_processed': len(file_info),
                'files': file_info
            }
        }
        
        # Save to JSON file
        output_filename = f'{S3_FOLDER}_combined_user_input.json'
        output_path = Path(output_filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print('\n' + '=' * 60)
        print(f'✅ Successfully created: {output_path}')
        print(f'📊 Total text length: {len(combined_text)} characters')
        print(f'📁 Files processed: {len(file_info)}')
        print('=' * 60)


if __name__ == '__main__':
    main()


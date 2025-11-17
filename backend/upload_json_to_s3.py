#!/usr/bin/env python3
"""
Script to upload a JSON file to S3 in a specific folder
"""

import os
import json
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime

# Load environment variables from project root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configuration
S3_BUCKET = os.getenv('S3_BUCKET', 'user-persona-data')
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


def upload_json_to_s3(json_file_path, s3_folder):
    """Upload a JSON file to S3 in the specified folder"""
    try:
        # Read the JSON file
        json_path = Path(json_file_path)
        if not json_path.exists():
            print(f'❌ Error: File not found: {json_file_path}')
            return False
        
        with open(json_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        # Convert back to JSON string for upload
        json_string = json.dumps(json_data, indent=2, ensure_ascii=False)
        
        # Create S3 key (folder/filename)
        filename = json_path.name
        s3_key = f'{s3_folder}/{filename}'
        
        print(f'\n📤 Uploading {filename} to s3://{S3_BUCKET}/{s3_key}')
        
        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=json_string.encode('utf-8'),
            ContentType='application/json; charset=utf-8',
            Metadata={
                'uploadedAt': datetime.now().isoformat(),
                'originalFilename': filename
            }
        )
        
        print(f'✅ Successfully uploaded to s3://{S3_BUCKET}/{s3_key}')
        return True
        
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        error_message = e.response.get('Error', {}).get('Message', str(e))
        print(f'❌ Error uploading to S3: {error_message} (Code: {error_code})')
        return False
    except Exception as e:
        print(f'❌ Error: {e}')
        return False


def main():
    """Main function"""
    import sys
    
    if len(sys.argv) < 2:
        print('Usage: python3 upload_json_to_s3.py <json_file_path> [s3_folder]')
        print('Example: python3 upload_json_to_s3.py ../uuid001_final_userpersona.json uuid001')
        exit(1)
    
    json_file_path = sys.argv[1]
    s3_folder = sys.argv[2] if len(sys.argv) > 2 else 'uuid001'
    
    print(f'📦 S3 Bucket: {S3_BUCKET}')
    print(f'📁 S3 Folder: {s3_folder}')
    print(f'📄 JSON File: {json_file_path}')
    print('=' * 60)
    
    success = upload_json_to_s3(json_file_path, s3_folder)
    
    if success:
        print('\n✅ Upload completed successfully!')
    else:
        print('\n❌ Upload failed!')
        exit(1)


if __name__ == '__main__':
    main()


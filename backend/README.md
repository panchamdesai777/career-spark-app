# Backend

This directory contains all Python backend files for the Career Spark application.

## Files

- **server.py** - Flask server for handling file uploads to AWS S3
  - Endpoints:
    - `POST /api/upload` - Upload files and text to S3
    - `GET /api/health` - Health check endpoint

- **process_s3_files.py** - Utility script to process all files from S3 and create a combined JSON with extracted text
  - Usage: `python3 backend/process_s3_files.py [optional_local_file_paths]`

- **requirements.txt** - Python dependencies

## Setup

1. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. Create a `.env` file in the project root with AWS credentials:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET=user-persona-data
   S3_FOLDER=uuid001
   PORT=3001
   ```

3. Run the server:
   ```bash
   npm run server
   # or: python3 backend/server.py
   ```

## Environment Variables

The backend loads environment variables from the `.env` file in the project root directory.


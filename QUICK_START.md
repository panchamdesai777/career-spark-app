# Quick Start Guide - S3 Upload Setup

## What You Need to Provide

To enable S3 uploads, you need to provide these AWS credentials:

### Required AWS Information:

1. **AWS_ACCESS_KEY_ID** - Your AWS access key ID
2. **AWS_SECRET_ACCESS_KEY** - Your AWS secret access key  
3. **AWS_REGION** - AWS region (e.g., `us-east-1`, `us-west-2`)

### Already Configured:
- ✅ S3 Bucket: `user-persona-data`
- ✅ S3 Folder: `test-user/`
- ✅ Upload destination: `s3://user-persona-data/test-user/`

## Setup Steps

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend (Python):**
```bash
pip install -r backend/requirements.txt
```

This will install:
- Backend (Python): Flask, flask-cors, boto3, python-dotenv, Werkzeug
- Frontend: react, react-dom (already installed)

**Note:** The backend has been migrated to Python. The old Node.js backend is still available but Python is now the default.

### 2. Create `.env` File

Create a `.env` file in the root directory with your AWS credentials:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET=user-persona-data
S3_FOLDER=test-user
PORT=3001
```

### 3. Start the Backend Server

**Python Backend (default):**
```bash
npm run server
# or: python3 backend/server.py
```

**Node.js Backend (legacy):**
```bash
npm run server:node
```

The server will start on `http://localhost:3001`

### 4. Start the Frontend (in a new terminal)

```bash
npm run dev
```

Or run both together:
```bash
npm run dev:all
```

## How It Works

1. User uploads files and text through the UI
2. Frontend sends data to `/api/upload` endpoint
3. Backend uploads to S3:
   - Text data → `s3://user-persona-data/test-user/text-data/{timestamp}-{sessionId}.json`
   - Media files → `s3://user-persona-data/test-user/media/{timestamp}-{filename}`

## Getting AWS Credentials

1. Go to AWS Console → IAM
2. Create a new user or use existing one
3. Attach policy with S3 PutObject permissions for `user-persona-data/test-user/*`
4. Create Access Key → Copy Access Key ID and Secret Access Key

## Testing

1. Start backend: `npm run server`
2. Start frontend: `npm run dev`
3. Upload files through the UI
4. Check S3 bucket to verify files are uploaded

## Troubleshooting

- **403 Forbidden**: Check AWS credentials and IAM permissions
- **Connection refused**: Make sure backend server is running on port 3001
- **CORS errors**: Backend has CORS enabled, should work automatically


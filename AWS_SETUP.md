# AWS S3 Upload Setup Guide

## Required AWS Information

To upload files to S3, you need the following AWS credentials and configuration:

### 1. AWS Access Key ID
- Your AWS access key ID
- Found in AWS IAM Console → Users → Security Credentials

### 2. AWS Secret Access Key
- Your AWS secret access key (paired with the Access Key ID)
- **Keep this secret!** Never commit it to version control

### 3. AWS Region
- The AWS region where your S3 bucket is located
- Examples: `us-east-1`, `us-west-2`, `eu-west-1`
- Default: `us-east-1`

### 4. S3 Bucket Name
- Bucket name: `user-persona-data`
- Already configured in the code

### 5. S3 Folder/Prefix
- Folder path: `test-user/`
- Already configured in the code

## Setup Instructions

### Step 1: Install Backend Dependencies

```bash
npm install express multer @aws-sdk/client-s3 uuid cors dotenv
```

### Step 2: Create Environment File

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your AWS credentials:
   ```env
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   AWS_REGION=us-east-1
   S3_BUCKET=user-persona-data
   S3_FOLDER=test-user
   PORT=3001
   ```

### Step 3: Configure AWS IAM Permissions

Your AWS user/role needs the following S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::user-persona-data/test-user/*"
    }
  ]
}
```

### Step 4: Start the Backend Server

```bash
node server.js
```

The server will run on `http://localhost:3001`

### Step 5: Update Vite Config (if needed)

If your frontend runs on a different port, you may need to configure a proxy in `vite.config.js`:

```js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
}
```

## What Gets Uploaded

### Text Data
- Stored as JSON file: `test-user/text-data/{timestamp}-{sessionId}.json`
- Contains:
  - User's message/description
  - Metadata (timestamp, file count)
  - Session ID

### Media Files
- Stored in: `test-user/media/{timestamp}-{filename}`
- Preserves original file names (sanitized)
- Includes metadata (original name, session ID, upload timestamp)

## S3 Structure

```
s3://user-persona-data/
└── test-user/
    ├── text-data/
    │   └── 2024-01-15T10-30-00-abc123.json
    └── media/
        ├── 2024-01-15T10-30-00-photo.jpg
        ├── 2024-01-15T10-30-00-video.mp4
        └── 2024-01-15T10-30-00-resume.pdf
```

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to version control
- Add `.env` to `.gitignore`
- Use IAM roles with minimal required permissions
- Consider using AWS Secrets Manager for production

## Testing

1. Start the backend: `node server.js`
2. Start the frontend: `npm run dev`
3. Upload files through the UI
4. Check S3 bucket to verify uploads


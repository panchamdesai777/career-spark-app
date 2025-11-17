# Troubleshooting Upload Issues

## Common Issues and Solutions

### 1. "Upload failed" Error

**Check the following:**

#### A. Is the backend server running?
```bash
npm run server
```
You should see:
```
🚀 Server running on http://localhost:3001
✅ AWS credentials loaded
✅ S3 client ready
```

#### B. Check AWS Credentials in `.env`
Make sure your `.env` file has valid credentials:
```env
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_REGION=us-east-1
```

**If using temporary credentials (starts with ASIA), add:**
```env
AWS_SESSION_TOKEN=your_session_token_here
```

#### C. Check Browser Console
Open browser DevTools (F12) → Console tab
Look for error messages that will tell you exactly what went wrong.

#### D. Check Server Console
Look at the terminal where the server is running for detailed error messages.

### 2. Common Error Messages

#### "AWS credentials are invalid or expired"
- Your AWS credentials are wrong or expired
- If using temporary credentials, they may have expired
- Solution: Get new credentials from AWS Console

#### "Access denied"
- Your AWS user doesn't have S3 permissions
- Solution: Add S3 `PutObject` permission to your IAM user

#### "S3 bucket does not exist"
- The bucket `user-persona-data` doesn't exist
- Solution: Create the bucket or update `S3_BUCKET` in `.env`

#### "Network error"
- Backend server is not running
- Solution: Start server with `npm run server`

### 3. Testing the Connection

#### Test Backend Health:
```bash
curl http://localhost:3001/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

#### Test with a simple file:
1. Start server: `npm run server`
2. Start frontend: `npm run dev`
3. Try uploading a small text file
4. Check server console for detailed logs

### 4. AWS IAM Permissions Required

Your AWS user needs this policy:
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

### 5. Debug Steps

1. **Check server logs** - They show detailed error information
2. **Check browser console** - Shows frontend errors
3. **Verify .env file** - Make sure credentials are correct
4. **Test AWS credentials** - Try using AWS CLI:
   ```bash
   aws s3 ls s3://user-persona-data/test-user/
   ```

### 6. Still Not Working?

Check the server console output when you try to upload. It will show:
- Exact error codes
- AWS error messages
- Which file failed (if any)
- HTTP status codes

Share these details for further debugging.


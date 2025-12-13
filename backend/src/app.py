import json
import boto3
import os
import urllib.parse

s3_client = boto3.client('s3')
BUCKET = os.environ.get('BUCKET_NAME')  # we'll set this in Lambda environment variables

def lambda_handler(event, context):
    path = event.get("path", "")
    method = event.get("httpMethod", "")
    body = {}
    
    if path == "/files/upload-url" and method == "POST":
        data = json.loads(event.get("body", "{}"))
        file_name = data.get("fileName")
        content_type = data.get("contentType", "application/octet-stream")
        
        if not file_name:
            return {"statusCode": 400, "body": json.dumps({"message": "fileName required"})}
        
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={'Bucket': BUCKET, 'Key': file_name, 'ContentType': content_type},
            ExpiresIn=3600
        )
        body = {"uploadUrl": presigned_url}
        
    elif path == "/files/download-url" and method == "POST":
        data = json.loads(event.get("body", "{}"))
        file_name = data.get("fileName")
        
        if not file_name:
            return {"statusCode": 400, "body": json.dumps({"message": "fileName required"})}
        
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET, 'Key': file_name},
            ExpiresIn=3600
        )
        body = {"downloadUrl": presigned_url}
    
    else:
        body = {"message": "Invalid path or method"}

    return {
        "statusCode": 200,
        "body": json.dumps(body)
    }

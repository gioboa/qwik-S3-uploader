import AWS from 'aws-sdk';

const {
  VITE_S3_BUCKET_NAME: Bucket,
  VITE_S3_BUCKET_REGION: region,
  VITE_S3_ACCESS_KEY_ID: accessKeyId,
  VITE_S3_SECRET_ACCESS_KEY: secretAccessKey,
} = import.meta.env;

AWS.config.update({ accessKeyId, secretAccessKey });
export const s3 = new AWS.S3({ params: { Bucket }, region });
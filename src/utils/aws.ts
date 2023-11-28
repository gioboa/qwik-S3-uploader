import { S3Client } from '@aws-sdk/client-s3';

const {
  VITE_S3_BUCKET_REGION: region,
  VITE_S3_ACCESS_KEY_ID: accessKeyId,
  VITE_S3_SECRET_ACCESS_KEY: secretAccessKey,
} = import.meta.env;

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// s3Client.js
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  region: process.env.S3_REGION_1 || "",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || ""
  }
});

export async function generateUploadUrl(key:string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes
  });
}

export const generateS3Key = (
  userId: string,
  fileName: string,
  date: Date = new Date()
): string => {
  const timestamp = date.getTime();

  // Replace spaces and unsafe chars
  const sanitizedFileName = fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");

  return `users/${userId}/${timestamp}-${sanitizedFileName}`;
};

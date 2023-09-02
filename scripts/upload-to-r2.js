import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();
console.log(process.env.ENDPOINT);
// AWS S3 configuration
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Specify your Cloudflare R2 bucket and optional folder
const bucketName = "bandcamp-benchmark";

// List of files to upload
const filesToUpload = [
  {
    fileName: "1000000-bandcamp-sales.parquet",
    localPath: "./public/data/1000000-bandcamp-sales.parquet",
  },
  {
    fileName: "1000000-bandcamp-sales-zstd.parquet",
    localPath: "./public/data/1000000-bandcamp-sales-zstd.parquet",
  },
  {
    fileName: "1000000-bandcamp-sales.db.gz",
    localPath: "./public/data/1000000-bandcamp-sales.db.gz",
    ContentEncoding: "gzip",
    CacheControl: "no-transform",
  },
];

async function uploadFileToS3(fileName, localPath, options = {}) {
  try {
    const fileData = await fs.readFile(localPath);
    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileData,
      ...options,
    };

    const uploadCommand = new PutObjectCommand(uploadParams);
    const uploadResponse = await s3Client.send(uploadCommand);

    console.log(
      `File "${fileName}" uploaded successfully. ETag: ${uploadResponse.ETag}`
    );
  } catch (error) {
    console.error(`Error uploading "${fileName}": ${error.message}`);
  }
}

// Upload each file to S3
// Options - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectcommand.html
for (const { fileName, localPath, ...optioms } of filesToUpload) {
  uploadFileToS3(fileName, localPath, option);
}

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.prod') });

const prisma = new PrismaClient();

const endpoint = process.env.STORAGE_ENDPOINT || 'http://127.0.0.1:9000';
const accessKeyId = process.env.STORAGE_ACCESS_KEY || 'minioadmin';
const secretAccessKey = process.env.STORAGE_SECRET_KEY || 'minioadmin';
const bucket = process.env.STORAGE_BUCKET || 'ai-studio';
const publicUrlBase = process.env.STORAGE_PUBLIC_URL || `http://127.0.0.1:9000/${bucket}`;

const s3Client = new S3Client({
  endpoint,
  region: 'us-east-1',
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

async function main() {
  console.log(`Starting S3 Migration Script...`);
  console.log(`Endpoint: ${endpoint}, Bucket: ${bucket}`);

  const batchSize = 10;
  let cursor: string | undefined = undefined;
  let processedCount = 0;
  let skippedCount = 0;

  // Find or create S3 Storage Provider
  let s3Provider = await prisma.storageProvider.findFirst({
    where: { name: 'S3 MinIO' }
  });
  if (!s3Provider) {
    s3Provider = await prisma.storageProvider.create({
      data: { name: 'S3 MinIO', baseUrl: publicUrlBase }
    });
  }

  while (true) {
    const results = await prisma.generationResult.findMany({
      take: batchSize,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor }
      }),
      include: { generation: true },
      orderBy: { id: 'asc' }
    });

    if (results.length === 0) break;
    cursor = results[results.length - 1].id;

    for (const result of results) {
      if (result.s3ImageUrl || !result.imageUrl || !result.imageUrl.startsWith('data:image')) {
        skippedCount++;
        continue;
      }

      console.log(`Processing Result ID: ${result.id} for user ${result.generation.userId}`);

      try {
        const base64Data = result.imageUrl.split(',')[1];
        if (!base64Data) continue;

        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `generations/${result.generation.userId}/${result.generationId}.jpg`;

        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: filename,
          Body: buffer,
          ContentType: 'image/jpeg',
        });

        await s3Client.send(command);
        const fileUrl = `${publicUrlBase}/${filename}`;

        await prisma.generationResult.update({
          where: { id: result.id },
          data: {
            imageUrl: '', // Clear Base64
            s3ImageUrl: fileUrl,
            s3Bucket: bucket,
            storageProviderId: s3Provider.id
          }
        });

        processedCount++;
        console.log(`Uploaded & updated: ${fileUrl}`);
      } catch (error: any) {
        console.error(`Failed to migrate result ${result.id}: ${error.message}`);
      }
    }
  }

  console.log(`Migration completed. Processed: ${processedCount}, Skipped: ${skippedCount}`);
  await prisma.$disconnect();
}

main().catch(console.error);

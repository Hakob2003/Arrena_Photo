import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3Client: S3Client;

  constructor(private prisma: PrismaService) {
    this.s3Client = new S3Client({
      region: 'us-east-1', // Default minio region
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY || '',
        secretAccessKey: process.env.STORAGE_SECRET_KEY || '',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async uploadBuffer(buffer: Buffer, mimetype: string, filename?: string): Promise<string> {
    const bucket = process.env.STORAGE_BUCKET || 'ai-studio';
    const key = filename || `${uuidv4()}-${Date.now()}`;
    
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      });

      await this.s3Client.send(command);
      return `${process.env.STORAGE_PUBLIC_URL}/${key}`;
    } catch (error) {
      console.error('Storage upload error:', error);
      throw new InternalServerErrorException('Failed to upload file to storage');
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('STORAGE_ENDPOINT', 'http://127.0.0.1:9000');
    const accessKeyId = this.configService.get<string>('STORAGE_ACCESS_KEY', 'minioadmin');
    const secretAccessKey = this.configService.get<string>('STORAGE_SECRET_KEY', 'minioadmin');
    this.bucket = this.configService.get<string>('STORAGE_BUCKET', 'ai-studio');

    this.s3Client = new S3Client({
      endpoint,
      region: 'us-east-1', // MinIO requires region, often 'us-east-1' is fine
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  /**
   * Uploads a buffer to S3/MinIO
   * @param buffer Image buffer
   * @param filename Desired file name (e.g., 'generations/user123/uuid.jpg')
   * @param mimeType Mime type of the file (e.g., 'image/jpeg')
   * @returns Public URL of the uploaded image
   */
  async uploadFile(buffer: Buffer, filename: string, mimeType: string = 'image/jpeg'): Promise<{ url: string, bucket: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: filename,
        Body: buffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      const publicUrlBase = this.configService.get<string>('STORAGE_PUBLIC_URL', `http://127.0.0.1:9000/${this.bucket}`);
      const fileUrl = `${publicUrlBase}/${filename}`;

      this.logger.log(`File uploaded successfully to: ${fileUrl}`);
      
      return {
        url: fileUrl,
        bucket: this.bucket
      };
    } catch (error: any) {
      this.logger.error(`Failed to upload file to S3: ${error.message}`);
      throw error;
    }
  }
}

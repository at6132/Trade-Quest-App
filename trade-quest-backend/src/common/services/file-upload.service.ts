import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3Config } from '../../config/s3.config';

@Injectable()
export class FileUploadService {
  constructor(
    private configService: ConfigService,
    private s3Config: S3Config,
  ) {}

  /**
   * Get URL for a file stored in S3
   */
  getS3FileUrl(file: Express.Multer.File): string | null {
    if (!file) return null;
    return (file as any).location;
  }

  /**
   * Get URL for a locally stored file
   */
  getLocalFileUrl(file: Express.Multer.File): string | null {
    if (!file) return null;

    const baseUrl = this.configService.get('APP_URL');
    const relativePath = file.path.replace(/\\/g, '/');

    if (relativePath.startsWith('./')) {
      return `${baseUrl}/${relativePath.substring(2)}`;
    }

    return `${baseUrl}/${relativePath}`;
  }

  /**
   * Delete a file from S3
   */
  async deleteS3File(fileUrl: string): Promise<boolean> {
    if (!fileUrl) return false;

    try {
      const urlParts = new URL(fileUrl);
      const key = urlParts.pathname.substring(1); // Remove leading slash

      const s3Client = this.s3Config.getS3Client();
      const bucketName = this.s3Config.getBucketName();

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );

      return true;
    } catch (error) {
      console.error('Error deleting S3 file:', error);
      return false;
    }
  }

  /**
   * Delete a local file
   */
  async deleteLocalFile(fileUrl: string): Promise<boolean> {
    if (!fileUrl) return false;

    try {
      const baseUrl = this.configService.get('APP_URL');
      let filePath = fileUrl.replace(baseUrl, '').replace(/^\//, '');

      // Convert to absolute path
      filePath = path.join(process.cwd(), filePath);

      // Check if file exists before attempting to delete
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting local file:', error);
      return false;
    }
  }
}

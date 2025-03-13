import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  constructor(private configService: ConfigService) {}

  getFileUrl(file: Express.Multer.File): string | null {
    if (!file) return null;

    // Check if it's an S3 upload (has location property)
    if ('location' in file) {
      return (file as any).location;
    }

    // For local files
    const baseUrl = this.configService.get('APP_URL');
    const relativePath = file.path.replace(/\\/g, '/');

    // Handle path formatting
    if (relativePath.startsWith('./')) {
      return `${baseUrl}/${relativePath.substring(2)}`;
    }

    return `${baseUrl}/${relativePath}`;
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from './services/file-upload.service';
import { S3Config } from '../config/s3.config';

@Module({
  imports: [ConfigModule],
  providers: [FileUploadService, S3Config],
  exports: [FileUploadService, S3Config],
})
export class SharedModule {}

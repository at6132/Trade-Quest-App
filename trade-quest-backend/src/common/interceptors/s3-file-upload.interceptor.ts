import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { S3Config } from '../../config/s3.config';
import MESSAGES from '../messages';

export interface FileUploadOptions {
  fieldName: string;
  destination?: string;
  fileFilter?: (
    req: any,
    file: any,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => void;
  limits?: {
    fileSize?: number;
    files?: number;
  };
}

export function S3FileUploadInterceptor(
  options: FileUploadOptions,
): Type<NestInterceptor> {
  @Injectable()
  class S3Interceptor implements NestInterceptor {
    constructor(private s3Config: S3Config) {}

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const { s3, bucket } = this.s3Config.getS3Config();
      const fieldName = options.fieldName || 'file';
      const folderPath = options.destination || 'uploads';

      const defaultFileFilter = (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new HttpException(MESSAGES.INVALID_FILE_TYPE, 400), false);
        }
        cb(null, true);
      };

      const fileInterceptor = new (FileInterceptor(fieldName, {
        storage: multerS3({
          s3,
          bucket,
          acl: 'public-read',
          key: (req, file, cb) => {
            const filename = `${folderPath}/${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, filename);
          },
          contentType: multerS3.AUTO_CONTENT_TYPE,
        }),
        fileFilter: options.fileFilter || defaultFileFilter,
        limits: options.limits || {
          fileSize: 1024 * 1024, // 1MB
        },
      }))();

      return await fileInterceptor.intercept(context, next);
    }
  }

  return mixin(S3Interceptor);
}

import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { switchMap } from 'rxjs/operators';
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

export function LocalFileUploadInterceptor(
  options: FileUploadOptions,
): Type<NestInterceptor> {
  @Injectable()
  class LocalInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const fieldName = options.fieldName || 'file';
      const destination = options.destination || './uploads';

      const defaultFileFilter = (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new HttpException(MESSAGES.INVALID_FILE_TYPE, 400), false);
        }
        cb(null, true);
      };

      const fileInterceptor = new (FileInterceptor(fieldName, {
        storage: diskStorage({
          destination,
          filename: (req, file, cb) => {
            const filename = `${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, filename);
          },
        }),
        fileFilter: options.fileFilter || defaultFileFilter,
        limits: options.limits || {
          fileSize: 1024 * 1024, // 1MB
        },
      }))();

      return from(
        Promise.resolve(fileInterceptor.intercept(context, next)),
      ).pipe(switchMap((value) => value));
    }
  }

  return mixin(LocalInterceptor);
}

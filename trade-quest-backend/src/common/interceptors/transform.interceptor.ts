import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

export interface CustomResponse<T> {
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data?.message || data?.data) {
          return {
            success: true,
            ...(data.message && { message: data.message }),
            ...(data.data !== undefined && { data: data.data }),
          };
        }

        return {
          success: true,
          data,
        };
      }),
    );
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface CustomResponse<T> {
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data?.message) {
          return {
            success: true,
            message: data.message,
            data: data.data, // Remove the spread operator to maintain original structure
          };
        }

        return {
          success: true,
          message: 'Operation successful',
          data,
        };
      }),
    );
  }
}

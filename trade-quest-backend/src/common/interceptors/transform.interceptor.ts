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
      map((response) => {
        // If response only contains a message, don't include it as data
        if (
          response &&
          Object.keys(response).length === 1 &&
          response.message
        ) {
          return {
            success: true,
            message: response.message,
          };
        }

        // Handle responses with data
        const data = response?.data ?? response;
        const message = response?.message ?? 'Operation successful';

        const transformedResponse: Response<T> = {
          success: true,
          message,
        };

        if (data !== null && data !== undefined && data !== message) {
          transformedResponse.data = data;
        }

        return transformedResponse;
      }),
    );
  }
}

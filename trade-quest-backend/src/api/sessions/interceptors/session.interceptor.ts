import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SessionsService } from '../sessions.service';
import { Request } from 'express';
import MESSAGES from 'src/common/messages';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  constructor(private sessionsService: SessionsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (response) => {
        const request = context.switchToHttp().getRequest<Request>();

        if (request['shouldCreateSession'] && response?.data?.accessToken) {
          const ua = request.useragent;
          console.log('ip', request.ip);
          if (!request?.user) {
            throw new UnauthorizedException(MESSAGES.USER_NOT_AUTHENTICATED);
          }
          const userId = request?.user['_id'].toString();

          await this.sessionsService.createSession(
            userId,
            response.data.accessToken,
            {
              browser: `${ua?.browser} ${ua?.version}`.trim() || 'unknown',
              os: ua?.os || 'unknown',
              device: ua?.platform || 'unknown',
              ip: request.ip || request.socket.remoteAddress || 'unknown',
            },
          );
        }
      }),
    );
  }
}

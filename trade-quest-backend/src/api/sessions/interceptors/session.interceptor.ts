import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SessionsService } from '../sessions.service';
import { Request } from 'express';
import MESSAGES from 'src/common/messages';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  constructor(
    private sessionsService: SessionsService,
    private jwtService: JwtService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    return next.handle().pipe(
      switchMap(async (response) => {
        const request = context.switchToHttp().getRequest<Request>();

        if (request['shouldCreateSession'] && response?.data?.accessToken) {
          const ua = request.useragent;
          if (!request?.user) {
            throw new UnauthorizedException(MESSAGES.USER_NOT_AUTHENTICATED);
          }
          const userId = request?.user['_id'];

          // Decode token to get expiration time
          const decoded = this.jwtService.decode(response.data.accessToken);
          const expiresAt = new Date((decoded as any).exp * 1000);

          const session = await this.sessionsService.createSession(
            userId,
            expiresAt,
            {
              browser: `${ua?.browser} ${ua?.version}`.trim() || 'unknown',
              os: ua?.os || 'unknown',
              device: ua?.platform || 'unknown',
              ip: request.ip || request.socket.remoteAddress || 'unknown',
            },
          );

          response.data['sessionId'] = session._id.toString();
        }

        return response;
      }),
    );
  }
}

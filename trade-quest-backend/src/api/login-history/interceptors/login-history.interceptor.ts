import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoginHistoryService } from '../login-history.service';
import { Request } from 'express';

@Injectable()
export class LoginHistoryInterceptor implements NestInterceptor {
  constructor(private readonly loginHistoryService: LoginHistoryService) {}

  private getIpAddress(request: Request): string {
    const ip = request.ip || '';
    if (ip === '::1') return '127.0.0.1';
    if (ip.includes(':')) {
      const lastPart = ip.split(':').pop();
      return lastPart || ip;
    }
    return ip;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const ua = request.useragent;

    return next.handle().pipe(
      tap(async (response: { user: any }) => {
        await this.loginHistoryService.create({
          userId: response.user._id,
          ipAddress: this.getIpAddress(request),
          browser: `${ua?.browser} ${ua?.version}`.trim(),
          os: ua?.os || 'unknown',
          device: ua?.platform || 'unknown',
        });
      }),
    );
  }
}

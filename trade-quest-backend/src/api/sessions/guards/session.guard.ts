import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from '../sessions.service';
import MESSAGES from 'src/common/messages';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private sessionsService: SessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException(MESSAGES.INVALID_SESSION);
    }

    const session = await this.sessionsService.findByToken(token);
    if (!session || !session.isActive) {
      throw new UnauthorizedException(MESSAGES.INVALID_SESSION);
    }

    // Update last active timestamp
    await this.sessionsService.updateLastActive(session._id);

    // Add session to request for potential use in handlers
    request.session = session;

    return true;
  }
}

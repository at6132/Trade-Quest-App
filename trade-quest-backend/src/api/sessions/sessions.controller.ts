import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import MESSAGES from 'src/common/messages';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get()
  async getUserSessions(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException(MESSAGES.USER_NOT_AUTHENTICATED);
    }
    const userId = req.user['_id'].toString();
    return this.sessionsService.getUserSessions(userId);
  }

  @Delete(':sessionId')
  async terminateSession(
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException(MESSAGES.USER_NOT_AUTHENTICATED);
    }
    await this.sessionsService.terminateSession(req.user['_id'], sessionId);
    return { message: 'Session terminated successfully' };
  }

  @Delete()
  async terminateAllSessions(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException(MESSAGES.USER_NOT_AUTHENTICATED);
    }
    await this.sessionsService.terminateAllSessions(req.user['_id']);
    return { message: 'All sessions terminated successfully' };
  }
}

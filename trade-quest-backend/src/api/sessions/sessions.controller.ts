import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/schemas/user.schema';
import MESSAGES from 'src/common/messages';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserSessions(@Req() req: Request) {
    const user = req.user as User;
    const userId = user._id;
    const sessions = await this.sessionsService.getUserSessions(userId);
    return {
      message: MESSAGES.SESSIONS_FETCHED_SUCCESSFULLY,
      data: sessions,
    };
  }

  @Delete(':sessionId')
  @UseGuards(JwtAuthGuard)
  async terminateSession(
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
  ) {
    const user = req.user as User;
    await this.sessionsService.terminateSession(user._id, sessionId);
    return { message: MESSAGES.SESSION_TERMINATED_SUCCESSFULLY };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async terminateAllSessions(
    @Req() req: Request,
    @Query('sessionId') sessionId?: string,
  ) {
    const user = req.user as User;

    await this.sessionsService.terminateAllSessions(user._id, sessionId);

    return {
      message: MESSAGES.SESSION_TERMINATED_SUCCESSFULLY,
    };
  }
}

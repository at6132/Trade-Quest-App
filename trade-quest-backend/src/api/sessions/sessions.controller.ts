import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import MESSAGES from 'src/common/messages';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(
    private sessionsService: SessionsService,
    private jwtService: JwtService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserSessions(@Req() req: Request) {
    const user = req.user as User;
    const userId = user._id.toString();
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
  @UseGuards(JwtAuthGuard)
  async terminateAllSessions(
    @Req() req: Request,
    @Query('keepCurrent') keepCurrent?: boolean,
  ) {
    const user = req.user as User;
    let currentSessionId: string | undefined;

    if (keepCurrent) {
      const token = req.headers.authorization!.split(' ')[1];
      const decoded = this.jwtService.decode(token);
      currentSessionId = decoded['sessionId'];
    }

    await this.sessionsService.terminateAllSessions(
      user._id.toString(),
      currentSessionId,
    );

    return {
      message: keepCurrent
        ? 'All other sessions terminated successfully'
        : 'All sessions terminated successfully',
    };
  }
}

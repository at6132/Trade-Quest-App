import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { LoginHistoryService } from './login-history.service';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';

@Controller('login-history')
@UseGuards(JwtAuthGuard)
export class LoginHistoryController {
  constructor(private readonly loginHistoryService: LoginHistoryService) {}
}

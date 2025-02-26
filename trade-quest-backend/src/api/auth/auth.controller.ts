import { 
  Controller, 
  Post, 
  Body, 
  UnauthorizedException, 
  BadRequestException,
  Get,
  Req,
  UseGuards,
  NotFoundException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/api/users/users.service';
import { User } from 'src/api/users/schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserProfile } from 'src/api/users/interfaces/user-profile.interface';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Enable2faDto } from './dto/enable-2fa.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { TwoFactorService } from './two-factor.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { USER_ALREADY_EXISTS, USER_NOT_FOUND, INVALID_2FA_METHOD, NO_USER_FROM_GOOGLE, USER_NOT_AUTHENTICATED } from 'src/config/constants';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService, 
    private usersService: UsersService,
    private twoFactorService: TwoFactorService
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.findByEmail(registerDto.email);
    if (user) {
      throw new BadRequestException(USER_ALREADY_EXISTS);
    }
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request) {
    return this.authService.login(req.user as User);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard will handle the authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException(NO_USER_FROM_GOOGLE);
    }
    return this.authService.login(req.user as User);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request): Promise<UserProfile> {
    if (!req.user) {
      throw new UnauthorizedException(USER_NOT_AUTHENTICATED);
    }

    const userId = req.user['id'];
    const profile = await this.usersService.getProfile(userId);
    if (!profile) {
      throw new UnauthorizedException(USER_NOT_FOUND);
    }
    
    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa/setup')
  async setup2fa(@Req() req) {
    return this.twoFactorService.getUser2faStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2fa(@Req() req, @Body() enable2faDto: Enable2faDto) {
    return this.twoFactorService.enable2fa(req.user.id, enable2faDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verify2fa(@Req() req, @Body() verify2faDto: Verify2faDto) {
    return this.twoFactorService.verify2fa(req.user.id, verify2faDto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async disable2fa(@Req() req) {
    return this.twoFactorService.disable2fa(req.user.id);
  }

  @Post('2fa/send-otp')
  async sendOtp(@Body() body: { email: string; method: string; phoneNumber?: string }) {
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    
    if (body.method === 'sms') {
      return this.twoFactorService.sendSmsOtp(body.phoneNumber || user.phoneNumber);
    } else if (body.method === 'email') {
      return this.twoFactorService.sendEmailOtp(user.email, user.name);
    }
    
    throw new BadRequestException(INVALID_2FA_METHOD);
  }

  @Post('2fa/verify-login')
  async verifyLogin2fa(@Body() body: { token: string; tempToken: string }) {
    return this.twoFactorService.verify2faLogin(body.token, body.tempToken);
  }
} 
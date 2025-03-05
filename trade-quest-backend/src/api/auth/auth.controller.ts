import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  Get,
  Req,
  UseGuards,
  NotFoundException,
  UseInterceptors,
  Query,
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
import MESSAGES from '../../common/messages';
import { TwoFactorMethod } from 'src/common/enums';
import { LoginHistoryInterceptor } from '../login-history/interceptors/login-history.interceptor';
import CONSTANTS from 'src/common/constants';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private twoFactorService: TwoFactorService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException(MESSAGES.USER_ALREADY_EXISTS);
    }
    const user = await this.authService.register(registerDto);
    // Generate verification token
    const verificationToken = this.jwtService.sign(
      { email: user.email },
      { expiresIn: CONSTANTS.EMAIL_VERIFICATION_EXPIRES_IN },
    );

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );

    return {
      message: MESSAGES.EMAIL_VERIFICATION_SENT,
    };
  }

  @UseGuards(LocalAuthGuard)
  @UseInterceptors(LoginHistoryInterceptor)
  @Post('login')
  async login(@Req() req: Request) {
    const result = await this.authService.login(req.user as User);
    return {
      message: 'User logged in successfully',
      data: result,
    };
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
      throw new UnauthorizedException(MESSAGES.NO_USER_FROM_GOOGLE);
    }
    const result = await this.authService.login(req.user as User);
    return {
      success: true,
      message: 'User logged in successfully',
      data: result,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request): Promise<UserProfile> {
    if (!req.user) {
      throw new UnauthorizedException(MESSAGES.USER_NOT_AUTHENTICATED);
    }

    const userId = req.user['id'];
    const profile = await this.usersService.getProfile(userId);
    if (!profile) {
      throw new UnauthorizedException(MESSAGES.USER_NOT_FOUND);
    }

    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa/setup')
  async setup2fa(@Req() req) {
    const result = await this.twoFactorService.getUser2faStatus(req.user.id);
    return {
      success: true,
      message: '2FA setup status retrieved successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2fa(@Req() req, @Body() enable2faDto: Enable2faDto) {
    const result = await this.twoFactorService.enable2fa(
      req.user.id,
      enable2faDto,
    );
    return {
      success: true,
      message: '2FA enabled successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verify2fa(@Req() req, @Body() verify2faDto: Verify2faDto) {
    const result = await this.twoFactorService.verify2fa(
      req.user.id,
      verify2faDto.token,
    );
    return {
      success: true,
      message: '2FA verified successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async disable2fa(@Req() req) {
    const result = await this.twoFactorService.disable2fa(req.user.id);
    return {
      success: true,
      message: '2FA disabled successfully',
      data: result,
    };
  }

  @Post('2fa/send-otp')
  async sendOtp(
    @Body() body: { email: string; method: string; phoneNumber?: string },
  ) {
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    if (body.method === TwoFactorMethod.SMS) {
      const result = await this.twoFactorService.sendSmsOtp(
        body.phoneNumber || user.phoneNumber,
      );
      return {
        success: true,
        message: 'OTP sent successfully',
        data: result,
      };
    } else if (body.method === TwoFactorMethod.EMAIL) {
      const result = await this.twoFactorService.sendEmailOtp(
        user.email,
        user.name,
      );
      return {
        success: true,
        message: 'OTP sent successfully',
        data: result,
      };
    }
    throw new BadRequestException(MESSAGES.INVALID_2FA_METHOD);
  }

  @Post('2fa/verify-login')
  async verifyLogin2fa(@Body() body: { token: string; tempToken: string }) {
    const result = await this.twoFactorService.verify2faLogin(
      body.token,
      body.tempToken,
    );
    return {
      success: true,
      message: '2FA verified successfully',
      data: result,
    };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const result = await this.authService.verifyEmail(token);
    return {
      message: result.message,
    };
  }
}

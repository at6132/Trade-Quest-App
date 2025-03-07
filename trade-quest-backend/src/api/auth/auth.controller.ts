import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  Get,
  Req,
  UseGuards,
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
import { TwoFactorService } from './two-factor.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import MESSAGES from '../../common/messages';
import CONSTANTS from 'src/common/constants';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { RequestEnable2faDto } from './dto/request-enable-2fa.dto';
import { TwoFactorMethod } from 'src/common/enums';

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
    await this.authService.register(registerDto);
    // Generate verification token
    const verificationToken = this.jwtService.sign(
      { email: registerDto.email },
      { expiresIn: CONSTANTS.EMAIL_VERIFICATION_EXPIRES_IN },
    );

    // Send verification email
    await this.emailService.sendVerificationEmail(
      registerDto.name,
      registerDto.email,
      verificationToken,
    );

    return {
      message: MESSAGES.EMAIL_VERIFICATION_SENT,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify-email')
  async verifyEmail(@Req() req: Request) {
    const userEmail = (req?.user as User)?.email;
    await this.usersService.verifyEmail(userEmail);
    return {
      message: MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
    };
  }

  @UseGuards(LocalAuthGuard)
  // @UseInterceptors(LoginHistoryInterceptor)
  @Post('login')
  async login(@Req() req: Request) {
    const result = await this.authService.login(req.user as User);
    let message = '';
    if (result.tfaEnabled) {
      message =
        result.tfaMethod === TwoFactorMethod.EMAIL
          ? MESSAGES.EMAIL_TFA_ENABLED
          : result.tfaMethod === TwoFactorMethod.SMS
            ? MESSAGES.SMS_TFA_ENABLED
            : MESSAGES.AUTHENTICATOR_TFA_ENABLED;
    } else {
      message = MESSAGES.USER_LOGGED_IN_SUCCESSFULLY;
    }

    return {
      message,
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
    const result = await this.authService.login(req.user as unknown as User);
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
  @Post('2fa/request-enable')
  async requestEnable2fa(
    @Req() req,
    @Body() requestEnable2faDto: RequestEnable2faDto,
  ) {
    const result = await this.twoFactorService.setup2fa(
      req.user as User,
      requestEnable2faDto.method,
      requestEnable2faDto?.phoneNumber,
    );
    return {
      message: MESSAGES.TWO_FACTOR_SETUP_INITIATED,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2fa(@Req() req, @Body() enable2faDto: Enable2faDto) {
    const confirmed = await this.twoFactorService.confirm2fa(
      req.user as User,
      enable2faDto.otp,
    );
    if (!confirmed) {
      throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
    }
    return {
      message: MESSAGES.TWO_FACTOR_ENABLED,
    };
  }
}

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AssetsModule } from '../assets/assets.module';
import { TwoFactorService } from './two-factor.service';
import { LoginHistoryModule } from '../login-history/login-history.module';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { HttpModule } from '@nestjs/axios';
import { CaptchaService } from './captcha/captcha.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AssetsModule,
    LoginHistoryModule,
    EmailModule,
    SmsModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    TwoFactorService,
    CaptchaService,
  ],
  exports: [AuthService, TwoFactorService],
})
export class AuthModule {}

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

@Module({
  imports: [UsersModule, PassportModule, AssetsModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    TwoFactorService,
  ],
  exports: [AuthService, TwoFactorService],
})
export class AuthModule {}

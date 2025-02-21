import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from '../passport/jwt.strategy';
import { LocalStrategy } from '../passport/local.strategy';
import { GoogleStrategy } from '../passport/google.strategy';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AssetsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {} 
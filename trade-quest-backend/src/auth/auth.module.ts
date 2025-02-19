import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from '../passport/jwt.strategy';
import { LocalStrategy } from '../passport/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {} 
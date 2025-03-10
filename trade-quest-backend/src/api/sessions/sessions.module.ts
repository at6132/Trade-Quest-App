import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { Session, SessionSchema } from './schemas/session.schema';
import { JwtModule } from '@nestjs/jwt';
import { SessionInterceptor } from './interceptors/session.interceptor';
import { SessionGuard } from './guards/session.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    JwtModule,
    ConfigModule,
  ],
  providers: [SessionsService, SessionInterceptor, SessionGuard],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { Session, SessionSchema } from './schemas/session.schema';
import { JwtModule } from '@nestjs/jwt';
import { SessionInterceptor } from './interceptors/session.interceptor';
import { SessionGuard } from './guards/session.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    JwtModule,
  ],
  providers: [SessionsService, SessionInterceptor, SessionGuard],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}

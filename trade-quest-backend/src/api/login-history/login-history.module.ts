import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginHistoryService } from './login-history.service';
import { LoginHistoryController } from './login-history.controller';
import { LoginHistory, LoginHistorySchema } from './schemas/login-history.schema';
import { LoginHistoryInterceptor } from './interceptors/login-history.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoginHistory.name, schema: LoginHistorySchema },
    ]),
  ],
  providers: [LoginHistoryService, LoginHistoryInterceptor],
  controllers: [LoginHistoryController],
  exports: [LoginHistoryService, LoginHistoryInterceptor],
})
export class LoginHistoryModule {} 
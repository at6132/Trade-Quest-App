import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';
import { AssetsModule } from './api/assets/assets.module';
import { PortfoliosModule } from './api/portfolios/portfolios.module';
import { TradesModule } from './api/trades/trades.module';
import { LeaderboardsModule } from './api/leaderboards/leaderboards.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { throttlerConfig } from './config/throttle.config';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';
import emailConfig from './config/email.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [emailConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    AssetsModule,
    PortfoliosModule,
    TradesModule,
    LeaderboardsModule,
    ThrottlerModule.forRoot(throttlerConfig),
    WinstonModule.forRoot(winstonConfig),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: WinstonModule.createLogger(winstonConfig)
    });
    
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        const firstConstraint = Object.values(firstError.constraints || {})[0];
        
        throw new BadRequestException({
          statusCode: 400,
          message: firstConstraint,
          error: 'Bad Request'
        });
      }
    }));

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, HttpStatus, ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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

  try {
    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    throw new HttpException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Something went wrong',
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
bootstrap();

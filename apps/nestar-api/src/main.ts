import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // Middleware for validating incoming requests
  app.useGlobalInterceptors(new LoggingInterceptor()); // Middleware for logging requests and responses
  await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();

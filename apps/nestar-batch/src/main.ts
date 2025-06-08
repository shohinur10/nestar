import { NestFactory } from '@nestjs/core';
import { NestarBatchModule } from './nestar-batch.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from 'apps/nestar-api/src/libs/interceptor/Logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(NestarBatchModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();

//this is about how much time it takes to run and get answer from service

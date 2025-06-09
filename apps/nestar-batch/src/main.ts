import { NestFactory } from '@nestjs/core';
import { NestarBatchModule } from './nestar-batch.module';
import { LoggingInterceptor } from 'apps/nestar-api/src/libs/interceptor/Logging.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(NestarBatchModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();


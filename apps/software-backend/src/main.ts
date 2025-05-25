import { NestFactory } from '@nestjs/core';
import { AppModule } from './software-backend.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  logger.log(`Aplicación iniciada en http://localhost:${port}`);
}
bootstrap();
import { NestFactory } from '@nestjs/core';
import { HotelesModule } from './hoteles.module';

async function bootstrap() {
  const app = await NestFactory.create(HotelesModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();

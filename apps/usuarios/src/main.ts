import { NestFactory } from '@nestjs/core';
import { UsuariosModule } from './usuarios.module';

async function bootstrap() {
  const app = await NestFactory.create(UsuariosModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();

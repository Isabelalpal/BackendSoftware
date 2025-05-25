
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@entities/entitys/database.module';
import { UsuariosModule } from '../../usuarios/src/usuarios.module';
import { HotelesModule } from '../../hoteles/src/hoteles.module';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './software-backend.controller';
import { SoftwareBackendService } from './software-backend.service';
import { RouteLoggerModule } from '@entities/entitys/route-logger.module';

@Module({
  imports: [
    RouteLoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule, 
    DatabaseModule, 
    UsuariosModule,
    HotelesModule,
  ],
  controllers: [AppController],
  providers: [SoftwareBackendService],
})
export class AppModule {}
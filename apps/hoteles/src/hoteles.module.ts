import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelesService } from './hoteles.service';
import { Hoteles, Usuarios } from '@entities/entitys';
import { RouteLoggerModule } from '@entities/entitys/route-logger.module';
import { DatabaseModule } from '@entities/entitys/database.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Hoteles, Usuarios]),
    RouteLoggerModule,
    JwtModule.registerAsync({ 
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [HotelesService],
  exports: [HotelesService],
})
export class HotelesModule {}
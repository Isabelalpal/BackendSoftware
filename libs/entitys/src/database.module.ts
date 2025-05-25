import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Usuarios } from './usuarios.entity';
import { Hoteles } from './hoteles.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get('DB_HOST'),
            port: +configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
            entities: [Usuarios, Hoteles],
            synchronize: true,
            autoLoadEntities: true,
        }),
        }),
        TypeOrmModule.forFeature([Usuarios, Hoteles]),
    ],
    exports: [TypeOrmModule], 
    })
export class DatabaseModule {}
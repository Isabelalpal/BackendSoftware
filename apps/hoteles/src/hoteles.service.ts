import {
    BadRequestException,
    ConflictException,
    Injectable, 
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Hoteles } from '@entities/entitys/hoteles.entity';
import { Usuarios } from '@entities/entitys/usuarios.entity';
import { CreateHotelDto, UpdateHotelDto, RefreshTokenDto } from './dto/hoteles.dto';
import { RolUsuario } from './enum/rol-usuario.enum';
import { HotelInterface } from './interface/hoteles.interface';
import { CalificacionHotel } from './enum/calificacion-hotel';

@Injectable()
export class HotelesService {
    constructor(
        @InjectRepository(Hoteles)
        private readonly hotelRepository: Repository<Hoteles>,
        @InjectRepository(Usuarios)
        private readonly usuarioRepository: Repository<Usuarios>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    private toHotelResponse(hotel: Hoteles): HotelInterface {
        return {
            id: hotel.id,
            name: hotel.name,
            description: hotel.description,
            adress: hotel.adress,
            city: hotel.city,
            room: hotel.room,
            country: hotel.country,
            managerId: hotel.manager?.id || '',
            calificacion: hotel.calificacion,
            is_active: hotel.is_active,
            createdAt: hotel.createdAt,
            updatedAt: hotel.updatedAt,
            refreshToken: hotel.refreshToken,
        };
    }

    async createHotel(
        createHotelDto: CreateHotelDto,
        usuarioAutenticado: { id: string; role: RolUsuario },
    ): Promise<HotelInterface> {
        const hotelExist = await this.hotelRepository.findOne({ 
            where: { name: createHotelDto.name }
        });
        
        if (hotelExist) {
            throw new ConflictException('Ya existe un hotel con este nombre');
        }

        const manager = await this.usuarioRepository.findOne({
            where: { 
                id: usuarioAutenticado.id,
                role: RolUsuario.MANAGER 
            }
        });

        if (!manager) {
            throw new ForbiddenException('Solo usuarios con rol MANAGER pueden crear hoteles');
        }

        const hotel = this.hotelRepository.create({
            ...createHotelDto,
            manager: manager,
        });

        try {
            await this.hotelRepository.save(hotel);
            return this.toHotelResponse(hotel);
        } catch (error) {
            throw new InternalServerErrorException('Error al crear el hotel');
        }
    }

    async actualizarHotel(
        id: string,
        updateHotelDto: UpdateHotelDto,
        usuarioAutenticado: { id: string; role: RolUsuario },
    ): Promise<HotelInterface> {
        const hotel = await this.hotelRepository.findOne({ 
            where: { id },
            relations: ['manager']
        });

        if (!hotel) {
            throw new NotFoundException('Hotel no encontrado');
        }

        const esGerenteAsignado = usuarioAutenticado.id === hotel.manager.id;
        const esGerenteGeneral = usuarioAutenticado.role === RolUsuario.MANAGER;

        if (!esGerenteAsignado && !esGerenteGeneral) {
            throw new ForbiddenException('No estás autorizado para actualizar este hotel');
        }

        Object.assign(hotel, updateHotelDto);

        try {
            await this.hotelRepository.save(hotel);
            return this.toHotelResponse(hotel);
        } catch (error) {
            throw new InternalServerErrorException('Error actualizando hotel');
        }
    }

    async eliminarHotel(
        id: string,
        usuarioAutenticado: { id: string; role: RolUsuario },
    ): Promise<void> {
        if (usuarioAutenticado.role !== RolUsuario.MANAGER) {
            throw new ForbiddenException('Solo un GERENTE puede eliminar hoteles');
        }

        const hotel = await this.hotelRepository.findOne({ 
            where: { id },
            relations: ['manager']
        });
        
        if (!hotel) {
            throw new NotFoundException(`Hotel con ID "${id}" no encontrado`);
        }

        const esGerenteAsignado = usuarioAutenticado.id === hotel.manager.id;

        if (!esGerenteAsignado) {
            throw new ForbiddenException('Solo el gerente asignado puede eliminar este hotel');
        }

        const result = await this.hotelRepository.delete(id);

        if (!result.affected) {
            throw new InternalServerErrorException('No se pudo eliminar el hotel');
        }
    }

    async obtenerHotelPorCalificacion(calificacion: CalificacionHotel): Promise<HotelInterface> {
        const hotel = await this.hotelRepository.findOne({ 
            where: { calificacion },
            relations: ['manager']
        });
        
        if (!hotel) {
            throw new NotFoundException(`Hotel con calificacion "${calificacion}" no encontrado`);
        }
        return this.toHotelResponse(hotel);
    }

    async obtenerHotelPorCiudad(city: string): Promise<HotelInterface> {
        const hotel = await this.hotelRepository.findOne({ 
            where: { city },
            relations: ['manager']
        });
        
        if (!hotel) {
            throw new NotFoundException(`Hotel con ciudad "${city}" no encontrado`);
        }
        return this.toHotelResponse(hotel);
    }

    async obtenerHotelPorDireccion(adress: string): Promise<HotelInterface> {
        const hotel = await this.hotelRepository.findOne({ 
            where: { adress },
            relations: ['manager']
        });
        
        if (!hotel) {
            throw new NotFoundException(`Hotel con dirección "${adress}" no encontrado`);
        }
        return this.toHotelResponse(hotel);
    }

    async obtenerHotelPorHabitacion(room: string): Promise<HotelInterface> {
        const hotel = await this.hotelRepository.findOne({ 
            where: { room },
            relations: ['manager']
        });
        
        if (!hotel) {
            throw new NotFoundException(`Hotel con habitación "${room}" no encontrado`);
        }
        return this.toHotelResponse(hotel);
    }

    async obtenerHotelPorManagerId(managerId: string): Promise<HotelInterface> {
        const hotel = await this.hotelRepository.findOne({ 
            where: { manager: { id: managerId } },
            relations: ['manager']
        });
        
        if (!hotel) {
            throw new NotFoundException(`Hotel con managerId "${managerId}" no encontrado`);
        }
        return this.toHotelResponse(hotel);
    }

    async obtenerHotelPorPais(country: string): Promise<HotelInterface> {
        const hotel = await this.hotelRepository.findOne({ 
            where: { country },
            relations: ['manager']
        });
        
        if (!hotel) {
            throw new NotFoundException(`Hotel con país "${country}" no encontrado`);
        }
        return this.toHotelResponse(hotel);
    }

    async obtenerHotelPorEstado(is_active: boolean): Promise<HotelInterface> {
        const hotel = await this.hotelRepository.findOne({ 
            where: { is_active },
            relations: ['manager']
        });
        
        if (!hotel) {
            throw new NotFoundException(`Hotel con estado "${is_active}" no encontrado`);
        }
        return this.toHotelResponse(hotel);
    }

    async obtenerHotelPorId(id: string): Promise<HotelInterface> {
        const hotel = await this.hotelRepository.findOne({ 
            where: { id },
            relations: ['manager']
        });
        
        if (!hotel) {
            throw new NotFoundException(`Hotel con ID "${id}" no encontrado`);
        }
        return this.toHotelResponse(hotel);
    }

    async obtenerHotelPorNombre(name: string): Promise<HotelInterface> {
        const hotel = await this.hotelRepository.findOne({ 
            where: { name },
            relations: ['manager']
        });
        
        if (!hotel) {
            throw new NotFoundException(`Hotel con nombre "${name}" no encontrado`);
        }
        return this.toHotelResponse(hotel);
    }

    async obtenerTodosHoteles(usuarioAutenticado: { id: string; role: RolUsuario }): Promise<HotelInterface[]> {
        let hoteles: Hoteles[];

        if (usuarioAutenticado.role === RolUsuario.RECEPTIONIST) {
            hoteles = await this.hotelRepository.find({ relations: ['manager'] });
        } else if (usuarioAutenticado.role === RolUsuario.MANAGER) {
            hoteles = await this.hotelRepository.find({ 
                where: { manager: { id: usuarioAutenticado.id } },
                relations: ['manager']
            });
        } else {
            throw new ForbiddenException('No autorizado para ver hoteles');
        }

        return hoteles.map(h => this.toHotelResponse(h));
    }

    private async getTokens(
        userId: string,
        email: string,
        role: RolUsuario,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, email, role },
                {
                    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                    expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
                },
            ),
            this.jwtService.signAsync(
                { sub: userId, email, role },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
                },
            ),
        ]);

        return { accessToken, refreshToken };
    }
    
    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
        const { refreshToken } = refreshTokenDto;

        if (!refreshToken) {
            throw new BadRequestException('Refresh token is required');
        }

        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            const hotel = await this.hotelRepository.findOne({ 
                where: { manager: { id: payload.sub } },
                relations: ['manager']
            });

            if (!hotel || hotel.refreshToken !== refreshToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const tokens = await this.getTokens(hotel.manager.id, hotel.name, RolUsuario.MANAGER);
            hotel.refreshToken = tokens.refreshToken;
            await this.hotelRepository.save(hotel);

            return tokens;
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async validarToken(token: string): Promise<HotelInterface> {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            });

            const hotel = await this.hotelRepository.findOne({ 
                where: { manager: { id: payload.sub } },
                relations: ['manager']
            });

            if (!hotel) {
                throw new UnauthorizedException('Invalid token');
            }

            return this.toHotelResponse(hotel);
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async validarRefreshToken(refreshToken: string): Promise<HotelInterface> {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            const hotel = await this.hotelRepository.findOne({ 
                where: { manager: { id: payload.sub } },
                relations: ['manager']
            });

            if (!hotel || hotel.refreshToken !== refreshToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            return this.toHotelResponse(hotel);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
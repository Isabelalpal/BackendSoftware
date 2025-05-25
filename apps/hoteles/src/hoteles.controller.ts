import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request,
    ForbiddenException,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { HotelesService } from './hoteles.service';
import {
    CreateHotelDto,
    UpdateHotelDto,
    RefreshTokenDto,
} from '../src/dto/hoteles.dto';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { RolUsuario } from '../src/enum/rol-usuario.enum';

@Controller('hoteles')
@UseInterceptors(ClassSerializerInterceptor)
export class HotelesController {
    constructor(private readonly hotelesService: HotelesService) {}


    @Post()
    async create(@Body() createHotelDto: CreateHotelDto, @Request() req) {
        const user = req.user; 

        console.log('Usuario del token:', user);
        
        if (!user || user.role !== RolUsuario.MANAGER) {
            throw new ForbiddenException('Solo un manager puede crear un hotel');
        }

        if (user.sub !== createHotelDto.managerId) {
            throw new ForbiddenException('Solo puedes crear hoteles con tu propio managerId');
        }

        return this.hotelesService.createHotel(createHotelDto, {
            id: user.sub,
            role: user.role,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateHotelDto: UpdateHotelDto,
        @Request() req,
    ) {
        const user = req.user;

        if (!user || ![RolUsuario.MANAGER, RolUsuario.RECEPTIONIST].includes(user.role)) {
            throw new ForbiddenException('Solo un gerente o recepcionista puede actualizar un hotel');
        }

        return this.hotelesService.actualizarHotel(id, updateHotelDto, {
            id: user.sub,
            role: user.role,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req) {
        const user = req.user;

        if (!user || user.role !== RolUsuario.MANAGER) {
            throw new ForbiddenException('Solo un gerente puede eliminar un hotel');
        }
        return this.hotelesService.eliminarHotel(id, {
            id: user.sub,
            role: user.role,
        });
    }

    @Get('by-calificacion/:calificacion')
    async getByCalificacion(@Param('calificacion') calificacion: string) {
        const calificacionEnum = (calificacion as unknown) as import('../src/enum/calificacion-hotel').CalificacionHotel;
        return this.hotelesService.obtenerHotelPorCalificacion(calificacionEnum);
    }

    @Get('by-ciudad/:city')
    async getByCiudad(@Param('city') city: string) {
        return this.hotelesService.obtenerHotelPorCiudad(city);
    }

    @Get('by-direccion/:adress')
    async getByDireccion(@Param('adress') adress: string) {
        return this.hotelesService.obtenerHotelPorDireccion(adress);
    }

    @Get('by-habitacion/:room')
    async getByHabitacion(@Param('room') room: string) {
        return this.hotelesService.obtenerHotelPorHabitacion(room);
    }

    @Get('by-manager/:managerId')
    async getByManager(@Param('managerId') managerId: number) {
        return this.hotelesService.obtenerHotelPorManagerId(managerId.toString());
    }

    @Get('by-pais/:country')
    async getByPais(@Param('country') country: string) {
        return this.hotelesService.obtenerHotelPorPais(country);
    }

    @Get('by-estado/:is_active')
    async getByEstado(@Param('is_active') is_active: boolean) {
        return this.hotelesService.obtenerHotelPorEstado(is_active);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.hotelesService.obtenerHotelPorId(id);
    }

    @Get('by-nombre/:name')
    async getByNombre(@Param('name') name: string) {
        return this.hotelesService.obtenerHotelPorNombre(name);
    }

    // Ruta para obtener todos los hoteles según el rol del usuario
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAll(@Request() req) {
        const user = req.user;
        return this.hotelesService.obtenerTodosHoteles({
            id: user.sub,
            role: user.role,
        });
    }

    // Ruta para refrescar el token
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.hotelesService.refreshToken(refreshTokenDto);
    }

    // Ruta para validar un token de acceso
    @Post('validate')
    @HttpCode(HttpStatus.OK)
    async validateAccessToken(@Body('token') token: string) {
        return this.hotelesService.validarToken(token);
    }

    // Ruta para validar un refresh token
    @Post('validate-refresh')
    @HttpCode(HttpStatus.OK)
    async validateRefreshToken(@Body('token') token: string) {
        return this.hotelesService.validarRefreshToken(token);
    }
}

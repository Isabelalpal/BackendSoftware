import RolUsuario from '../enum/rol-usuario.enum';
import {
    CreateHotelDto,
    UpdateHotelDto, 
    GetHotelDto,
    RefreshTokenDto
} from '../dto/hoteles.dto';

export interface HotelInterface {
    id: string;
    name: string;
    description: string;
    adress: string;
    city: string;
    country: string;
    managerId: string;
    calificacion: string;
    is_active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    refreshToken?: string;
    room: string;
}

export interface UsuarioAutenticado {
    id: string;
    role: RolUsuario;
}


export interface HotelesServiceInterface {
    createHotel(createHotelDto: CreateHotelDto, usuarioAutenticado: UsuarioAutenticado): Promise<HotelInterface>;
    actualizarHotel(id: string, updateHotelDto: UpdateHotelDto, usuarioAutenticado: UsuarioAutenticado): Promise<HotelInterface>;
    eliminarHotel(id: string, usuarioAutenticado: UsuarioAutenticado): Promise<void>;
    createHotel(createHotelDto: CreateHotelDto, usuarioAutenticado: { id: string; role: RolUsuario }): Promise<HotelInterface> 
    obtenerTodosHoteles(usuarioAutenticado: UsuarioAutenticado): Promise<HotelInterface[]>;
    obtenerHotelPorId(id: string): Promise<HotelInterface>;
    ActualizarHotel(id: string,
            updateHotelDto: UpdateHotelDto,
            usuarioAutenticado: { id: string; role: RolUsuario },): Promise<HotelInterface>;
    refrescarToken(refreshTokenDto:  RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    obtenerHotelPorNombre(name: string): Promise<HotelInterface>;
    obtenerHotelPorManagerId(managerId: string): Promise<HotelInterface>;
    obtenerHotelPorCalificacion(calificacion: string): Promise<HotelInterface>;
    obtenerHotelPorCiudad(city: string): Promise<HotelInterface>;
    obtenerHotelPorPais(country: string): Promise<HotelInterface>;
    obtenerHotelPorDireccion(adress: string): Promise<HotelInterface>;
    obtenerHotelPorHabitacion(room: string): Promise<HotelInterface>;
    obtenerHotelPorEstado(is_active: boolean): Promise<HotelInterface>;
}
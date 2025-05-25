import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsOptional,
    IsIn,
    IsBoolean,
    IsInt
} from 'class-validator';
import { RolUsuario } from '../enum/rol-usuario.enum';
import { CalificacionHotel } from '../enum/calificacion-hotel';

export class CreateHotelDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    adress: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    room: string;

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsInt()
    @IsOptional() 
    managerId: string;  

    @IsNotEmpty()
    @IsIn(Object.values(CalificacionHotel)) 
    calificacion: CalificacionHotel;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UpdateHotelDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    adress?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsInt() 
    managerId?: string;  
    
    @IsNotEmpty()
    @IsString()
    room?: string;

    @IsOptional()
    @IsIn(Object.values(CalificacionHotel)) 
    calificacion?: CalificacionHotel;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsString()
    refresh_token?: string;
}

export class GetHotelDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    adress?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsInt() 
    managerId?: string;  

    @IsOptional()
    @IsIn(Object.values(CalificacionHotel)) 
    calificacion?: CalificacionHotel;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsString()
    refresh_token?: string;

}

export class RefreshTokenDto {
    refreshToken: string;
}

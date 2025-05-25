import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsOptional,
    IsIn,
    IsBoolean,
} from 'class-validator';
import { RolUsuario } from '../enums/rol-usuario.enum';
export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    first_name: string;

    @IsOptional()
    @IsString()
    middle_name?: string;

    @IsNotEmpty()
    @IsString()
    last_name: string;
    

    @IsOptional()
    @IsString()
    second_last_name?: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsBoolean()
    isVerified?: boolean

    @IsNotEmpty()
    @IsIn(Object.values(RolUsuario)) 
    role: RolUsuario;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    first_name?: string;

    @IsOptional()
    @IsString()
    middle_name?: string;

    @IsOptional()
    @IsString()
    last_name?: string;

    @IsOptional()
    @IsString()
    second_last_name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsBoolean()
    isVerified?: boolean


    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsNotEmpty()
    @IsIn(Object.values(RolUsuario)) 
    role?: RolUsuario;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    old_password: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    new_password: string;
}

export class RefreshTokenDto {
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}

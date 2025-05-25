import {
    ChangePasswordDto,
    CreateUserDto,
    LoginDto,
    RefreshTokenDto,
    UpdateUserDto,
} from '../dto/usuarios.dto';
import { RolUsuario } from '../enums/rol-usuario.enum';

export interface UsuarioInterface {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    second_last_name?: string;
    email: string;
    password: string;
    phone?: string;
    role: RolUsuario; 
    is_active?: boolean;
    registration_date?: Date;
    last_login?: Date;
    refresh_token?: string;
    created_at?: Date; 
    updated_at?: Date;
    isVerified?: boolean;
}

export interface UsuariosServiceInterface {
    createUser(createUserDto: CreateUserDto): Promise<UsuarioInterface>;
    obtenerTodosUsuarios(usuarioAutenticado:UsuarioInterface): Promise<UsuarioInterface[]>;
    obtenerUsuarioPorId(id: string): Promise<UsuarioInterface>;
    obtenerUsuarioPorEmail(email: string): Promise<UsuarioInterface>;
    actualizarUsuario(id: string, updateUserDto: UpdateUserDto): Promise<UsuarioInterface>; 
    eliminarUsuario(id: string): Promise<void>;
    verificarUsuario(id: string): Promise<UsuarioInterface>;
    iniciarSesion(loginDto: LoginDto): Promise<{ 
        accessToken: string; 
        refreshToken: string; 
        usuario: UsuarioInterface
    }>;
    renovarToken(refreshTokenDto: RefreshTokenDto): Promise<{ 
        accessToken: string; 
        refreshToken: string 
    }>;
    cambiarContrasena(id: string, changePasswordDto: ChangePasswordDto): Promise<void>;
}
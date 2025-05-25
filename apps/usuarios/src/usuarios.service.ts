import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Usuarios } from '@entities/entitys/usuarios.entity';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginDto,
  RefreshTokenDto,
  UpdateUserDto,
} from '../src/dto/usuarios.dto';
import {
  UsuarioInterface,
  UsuariosServiceInterface,
} from '../src/interface/usuarios.interface';
import { RolUsuario } from '../src/enums/rol-usuario.enum';

@Injectable()
export class UsersService implements UsuariosServiceInterface {
  constructor(
    @InjectRepository(Usuarios)
    private readonly usersRepo: Repository<Usuarios>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private toUserResponse(user: Usuarios): UsuarioInterface {
    return {
      id: user.id,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      second_last_name: user.second_last_name,
      email: user.email,
      password: user.password,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      refresh_token: user.refreshToken,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      isVerified: user.isVerified,
    };
  }

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<UsuarioInterface> {
    if (!Object.values(RolUsuario).includes(createUserDto.role)) {
      throw new BadRequestException('Rol de usuario no válido');
    }

    const existing = await this.usersRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('Email ya registrado');
    }

    const hashed = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepo.create({
      ...createUserDto,
      password: hashed,
      isVerified: createUserDto.role === RolUsuario.MANAGER,
    });
    const saved = await this.usersRepo.save(newUser);
    return this.toUserResponse(saved);
  }

  async iniciarSesion(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; usuario: UsuarioInterface }> {
    const usuario = await this.usersRepo.findOne({
      where: { email: loginDto.email },
      select: ['id', 'email', 'password', 'role', 'isVerified', 'refreshToken'],
    });
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!usuario.isVerified && usuario.role !== RolUsuario.MANAGER) {
      throw new UnauthorizedException(
        'Por favor verifica tu email antes de iniciar sesión',
      );
    }
    const valid = await bcrypt.compare(loginDto.password, usuario.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.getTokens(
      usuario.id,
      usuario.email,
      usuario.role,
    );
    usuario.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersRepo.save(usuario);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      usuario: this.toUserResponse(usuario),
    };
  }

  async renovarToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const usuario = await this.usersRepo.findOne({
        where: { id: payload.sub },
        select: ['id', 'refreshToken'],
      });
      if (!usuario || !usuario.refreshToken) {
        throw new UnauthorizedException('Token inválido');
      }
      const valid = await bcrypt.compare(
        refreshTokenDto.refreshToken,
        usuario.refreshToken,
      );
      if (!valid) {
        throw new UnauthorizedException('Token inválido');
      }
      const tokens = await this.getTokens(
        usuario.id,
        payload.email,
        payload.role,
      );
      usuario.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
      await this.usersRepo.save(usuario);
      return tokens;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async obtenerTodosUsuarios(
    authUser: UsuarioInterface,
  ): Promise<UsuarioInterface[]> {
    let users: Usuarios[];
    switch (authUser.role) {
      case RolUsuario.MANAGER:
        users = await this.usersRepo.find({
          where: { role: In([RolUsuario.USER, RolUsuario.RECEPTIONIST]) },
        });
        break;
      case RolUsuario.RECEPTIONIST:
        users = await this.usersRepo.find({
          where: { role: RolUsuario.USER },
        });
        break;
      case RolUsuario.USER:
        const u = await this.usersRepo.findOne({ where: { id: authUser.id } });
        if (!u) throw new NotFoundException('Usuario no encontrado');
        users = [u];
        break;
      default:
        throw new ForbiddenException(
          'No tiene permisos para ver esta información',
        );
    }
    return users.map((u) => this.toUserResponse(u));
  }

  async obtenerUsuarioPorId(id: string): Promise<UsuarioInterface> {
    const usuario = await this.usersRepo.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }
    return this.toUserResponse(usuario);
  }

  async obtenerUsuarioPorEmail(email: string): Promise<UsuarioInterface> {
    const usuario = await this.usersRepo.findOne({ where: { email } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con email "${email}" no encontrado`);
    }
    return this.toUserResponse(usuario);
  }

  async actualizarUsuario(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UsuarioInterface> {
    const usuario = await this.usersRepo.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }
    if (updateUserDto.email && updateUserDto.email !== usuario.email) {
      const exists = await this.usersRepo.findOne({
        where: { email: updateUserDto.email },
      });
      if (exists) {
        throw new ConflictException('Email ya registrado');
      }
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        10,
      );
    }
    Object.assign(usuario, updateUserDto);
    const updated = await this.usersRepo.save(usuario);
    return this.toUserResponse(updated);
  }

  async eliminarUsuario(id: string): Promise<void> {
    const result = await this.usersRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }
  }

  async verificarUsuario(id: string): Promise<UsuarioInterface> {
    const usuario = await this.usersRepo.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }
    usuario.isVerified = true;
    const updated = await this.usersRepo.save(usuario);
    return this.toUserResponse(updated);
  }

  async cambiarContrasena(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const usuario = await this.usersRepo.findOne({
      where: { id },
      select: ['id', 'password'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }
    const valid = await bcrypt.compare(
      changePasswordDto.old_password,
      usuario.password,
    );
    if (!valid) {
      throw new UnauthorizedException(
        'La contraseña actual es incorrecta',
      );
    }
    usuario.password = await bcrypt.hash(
      changePasswordDto.new_password,
      10,
    );
    await this.usersRepo.save(usuario);
  }

  private async getTokens(
    userId: string,
    email: string,
    role: RolUsuario,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email, role }, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRATION',
        ),
      }),
      this.jwtService.signAsync({ sub: userId, email, role }, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION',
        ),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
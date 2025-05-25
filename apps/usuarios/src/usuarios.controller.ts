// src/users/usuarios.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginDto,
  RefreshTokenDto,
  UpdateUserDto,
} from '../src/dto/usuarios.dto';
import { UsersService } from './usuarios.service';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { RolUsuario } from '../src/enums/rol-usuario.enum';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: RolUsuario;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto) {
    await this.usersService.createUser(createUserDto);
    return { message: 'User registered successfully.' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usersService.iniciarSesion(loginDto); 
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.usersService.renovarToken(refreshTokenDto); 
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    const authUser = req.user as AuthenticatedUser;
    const fullUser = await this.usersService.obtenerUsuarioPorId(authUser.id);
    return this.usersService.obtenerTodosUsuarios(fullUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.obtenerUsuarioPorId(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.actualizarUsuario(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.eliminarUsuario(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/change-password')
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.cambiarContrasena(id, changePasswordDto);
  }
}

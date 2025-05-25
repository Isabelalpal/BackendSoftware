import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuarios } from '@entities/entitys/usuarios.entity';
import { RolUsuario } from '../enums/rol-usuario.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @InjectRepository(Usuarios)
    private readonly usuarioRepo: Repository<Usuarios>,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });

    this.logger.log('JWT strategy initialized successfully');
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email || !payload.tipo) {
      this.logger.warn('Incomplete JWT payload');
      throw new UnauthorizedException('Invalid token');
    }

    if (!Object.values(RolUsuario).includes(payload.tipo)) {
      this.logger.warn(`Invalid user role: ${payload.tipo}`);
      throw new UnauthorizedException('Invalid user role');
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { id: payload.sub },
      select: ['id', 'email', 'role', 'first_name', 'last_name', 'phone'], 
    });

    if (!usuario) {
      this.logger.warn(`User not found: ${payload.sub}`);
      throw new UnauthorizedException('User not found');
    }

    return {
      ...usuario,
      tipo: payload.tipo as RolUsuario,
    };
  }
}

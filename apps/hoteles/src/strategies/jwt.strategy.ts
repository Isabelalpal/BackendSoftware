// jwt.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hoteles } from '@entities/entitys/hoteles.entity';
import { RolUsuario } from '../enum/rol-usuario.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @InjectRepository(Hoteles)
    private readonly hotelRepo: Repository<Hoteles>,
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
    if (!payload.sub || !payload.email || !payload.role) {
      this.logger.warn('Incomplete JWT payload');
      throw new UnauthorizedException('Invalid token');
    }

    if (!Object.values(RolUsuario).includes(payload.role)) {
      this.logger.warn(`Invalid hotel role: ${payload.role}`);
      throw new UnauthorizedException('Invalid hotel role');
    }

    const hotel = await this.hotelRepo.findOne({
      where: { id: payload.sub },
      select: ['id', 'name', 'adress'], 
    });

    if (!hotel) {
      this.logger.warn(`Hotel not found: ${payload.sub}`);
      throw new UnauthorizedException('Hotel not found');
    }

    if (!hotel.is_active) {
      this.logger.warn(`Hotel is inactive: ${payload.sub}`);
      throw new UnauthorizedException('Hotel account is inactive');
    }

      return {
        sub: payload.sub,
        role: payload.role,
        email: payload.email || null,
    };
  }
}
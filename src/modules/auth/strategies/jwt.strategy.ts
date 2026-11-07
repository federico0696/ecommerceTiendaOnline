import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioAutenticado } from '../../../common/interfaces/usuario-autenticado.interface';

/** Valida la firma y expiración del access token y deja el payload en request.user. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('auth.jwtSecret') as string,
    });
  }

  validate(payload: UsuarioAutenticado): UsuarioAutenticado {
    if (!payload?.sub || !payload?.rol) throw new UnauthorizedException('Token inválido');
    return payload;
  }
}

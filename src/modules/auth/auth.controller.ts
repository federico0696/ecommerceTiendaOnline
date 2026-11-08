import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Auth, GetUser } from '../../common/decorators';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { AuthService } from './auth.service';
import { LoginClienteDto } from './dto/login-cliente.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegistroClienteDto } from './dto/registro-cliente.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login del panel (root, admin, empleado)' })
  loginPanel(@Body() dto: LoginDto) {
    return this.service.loginPanel(dto);
  }

  @Post('clientes/registro')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Registro de un cliente desde la app' })
  registrarCliente(@Body() dto: RegistroClienteDto) {
    return this.service.registrarCliente(dto);
  }

  @Post('clientes/login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login de un cliente desde la app' })
  loginCliente(@Body() dto: LoginClienteDto) {
    return this.service.loginCliente(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renovar access token con el refresh token' })
  refrescar(@Body() dto: RefreshDto) {
    return this.service.refrescar(dto.refreshToken);
  }

  @Get('yo')
  @Auth()
  @ApiOperation({ summary: 'Quién soy (payload del token)' })
  yo(@GetUser() user: UsuarioAutenticado) {
    return user;
  }
}

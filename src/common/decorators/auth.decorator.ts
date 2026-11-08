import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Rol } from '../enums';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * @Auth() exige JWT válido. @Auth(Rol.ADMIN, Rol.EMPLEADO) además exige rol.
 * ROOT pasa siempre, salvo que el endpoint sea exclusivo de clientes.
 */
export const Auth = (...roles: Rol[]) =>
  applyDecorators(
    Roles(...roles),
    UseGuards(AuthGuard('jwt'), RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token inválido o ausente' }),
  );

import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Rol } from '../enums';
import { UsuarioAutenticado } from '../interfaces/usuario-autenticado.interface';

/**
 * Resuelve el vivero sobre el que se opera.
 * - ADMIN / EMPLEADO / CLIENTE: siempre el de su token (no pueden elegir otro).
 * - ROOT: lo indica con el header `x-vivero-id`. Si no lo manda, error claro.
 */
export const ViveroActual = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  const user: UsuarioAutenticado = req.user;
  if (user.rol !== Rol.ROOT) return user.viveroId as string;
  const header = req.headers['x-vivero-id'];
  if (!header)
    throw new ForbiddenException('Como root tenés que indicar el vivero con el header x-vivero-id');
  return String(header);
});

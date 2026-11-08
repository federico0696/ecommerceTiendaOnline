import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Rol } from '../enums';
import { UsuarioAutenticado } from '../interfaces/usuario-autenticado.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;

    const user: UsuarioAutenticado = ctx.switchToHttp().getRequest().user;
    if (!user) throw new ForbiddenException('Sin usuario en la petición');

    // Root entra a todo lo del panel. A endpoints exclusivos de clientes, no.
    const soloClientes = roles.length === 1 && roles[0] === Rol.CLIENTE;
    if (user.rol === Rol.ROOT && !soloClientes) return true;

    if (roles.includes(user.rol)) return true;
    throw new ForbiddenException(`Necesitás uno de estos roles: ${roles.join(', ')}`);
  }
}

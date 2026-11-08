import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioAutenticado } from '../interfaces/usuario-autenticado.interface';

/** Inyecta el usuario del token. @GetUser('viveroId') devuelve solo ese campo. */
export const GetUser = createParamDecorator(
  (campo: keyof UsuarioAutenticado | undefined, ctx: ExecutionContext) => {
    const user: UsuarioAutenticado = ctx.switchToHttp().getRequest().user;
    return campo ? user?.[campo] : user;
  },
);

import { SetMetadata } from '@nestjs/common';
import { Rol } from '../enums';

export const ROLES_KEY = 'roles';
/** Declara qué roles pueden entrar a un endpoint. Se evalúa en RolesGuard. */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);

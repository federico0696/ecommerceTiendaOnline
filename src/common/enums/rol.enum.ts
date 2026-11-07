/**
 * Roles del sistema.
 * - ROOT: dueño de la plataforma (vos). Ve y administra todos los viveros.
 * - ADMIN: dueño de un vivero. Administra su vivero completo.
 * - EMPLEADO: operario de un vivero. Atiende chats, pedidos y stock.
 * - CLIENTE: usuario de la app mobile. Compra, consulta y chatea.
 */
export enum Rol {
  ROOT = 'root',
  ADMIN = 'admin',
  EMPLEADO = 'empleado',
  CLIENTE = 'cliente',
}

/** Roles que pertenecen al panel de gestión (tabla usuarios). */
export const ROLES_PANEL = [Rol.ROOT, Rol.ADMIN, Rol.EMPLEADO];

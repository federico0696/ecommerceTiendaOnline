import { Column, Index } from 'typeorm';
import { EntidadBase } from './base.entity';

/**
 * Base para toda entidad que pertenece a un vivero (multi-tenant).
 * El viveroId se indexa porque TODAS las consultas de admins y empleados filtran por él.
 */
export abstract class EntidadVivero extends EntidadBase {
  @Index()
  @Column({ name: 'vivero_id', type: 'uuid' })
  viveroId: string;
}

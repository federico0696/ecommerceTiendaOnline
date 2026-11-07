import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Columnas comunes a todas las tablas: id uuid, fechas y borrado lógico. */
export abstract class EntidadBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;

  @DeleteDateColumn({ name: 'eliminado_en', type: 'timestamptz', nullable: true })
  eliminadoEn: Date | null;
}

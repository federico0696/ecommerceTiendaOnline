import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { EntidadVivero } from '../../../common/entities';
import { Vivero } from '../../viveros/entities/vivero.entity';
import { Categoria } from './categoria.entity';
import { ImagenProducto } from './imagen-producto.entity';

export enum TipoProducto {
  PLANTA = 'planta',
  FLOR = 'flor',
  SEMILLA = 'semilla',
  MACETA = 'maceta',
  SUSTRATO = 'sustrato',
  HERRAMIENTA = 'herramienta',
  INSUMO = 'insumo',
  OTRO = 'otro',
}

/**
 * Ficha de cuidados. Solo aplica a plantas y flores; para el resto queda vacía.
 * Es lo que el bot usa para responder "¿cuánto la riego?" y para recomendar.
 */
export interface FichaCuidado {
  luz: 'sombra' | 'media-sombra' | 'sol-indirecto' | 'pleno-sol' | null;
  riego: 'bajo' | 'medio' | 'alto' | null;
  riegoDetalle: string | null;
  ubicacion: 'interior' | 'exterior' | 'ambos' | null;
  dificultad: 'facil' | 'media' | 'dificil' | null;
  temperaturaMin: number | null;
  temperaturaMax: number | null;
  toxicaMascotas: boolean | null;
  floracion: string | null;
  tamanoAdulto: string | null;
  consejos: string | null;
}

export const FICHA_CUIDADO_VACIA: FichaCuidado = {
  luz: null,
  riego: null,
  riegoDetalle: null,
  ubicacion: null,
  dificultad: null,
  temperaturaMin: null,
  temperaturaMax: null,
  toxicaMascotas: null,
  floracion: null,
  tamanoAdulto: null,
  consejos: null,
};

@Entity('productos')
@Index(['viveroId', 'slug'], { unique: true })
export class Producto extends EntidadVivero {
  @ManyToOne(() => Vivero, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vivero_id' })
  vivero: Vivero;

  @Index()
  @Column({ name: 'categoria_id', type: 'uuid', nullable: true })
  categoriaId: string | null;

  @ManyToOne(() => Categoria, (c) => c.productos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria | null;

  @Column({ length: 160 })
  nombre: string;

  @Column({ length: 160 })
  slug: string;

  /** Nombre científico, cuando es planta. Ayuda al bot y a la búsqueda. */
  @Column({ type: 'varchar', length: 160, nullable: true })
  nombreCientifico: string | null;

  @Column({ type: 'enum', enum: TipoProducto, default: TipoProducto.PLANTA })
  tipo: TipoProducto;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  precio: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  precioOferta: number | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  /** Por debajo de esto el panel avisa "stock bajo". */
  @Column({ type: 'int', default: 3 })
  stockMinimo: number;

  @Column({ type: 'varchar', length: 60, nullable: true })
  sku: string | null;

  @Column({ type: 'jsonb', default: () => `'${JSON.stringify(FICHA_CUIDADO_VACIA)}'` })
  cuidados: FichaCuidado;

  /** Etiquetas libres para búsqueda y filtros: "colgante", "purifica aire", "resistente". */
  @Column({ type: 'text', array: true, default: '{}' })
  etiquetas: string[];

  @Column({ default: true })
  activo: boolean;

  @Column({ default: false })
  destacado: boolean;

  @OneToMany(() => ImagenProducto, (i) => i.producto, { cascade: true, eager: true })
  imagenes: ImagenProducto[];
}

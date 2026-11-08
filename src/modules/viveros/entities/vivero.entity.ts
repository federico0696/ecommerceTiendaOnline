import { Column, Entity, Index } from 'typeorm';
import { EntidadBase } from '../../../common/entities';

/**
 * Un vivero = un tenant. Toda la información del negocio cuelga de acá.
 * `configuracion` guarda lo que varía por vivero y que el admin puede cambiar
 * desde el panel sin un deploy (marca, horarios, proveedor de IA, canales).
 */
export interface ConfiguracionVivero {
  marca: {
    colorPrimario: string;
    colorSecundario: string;
    logoUrl: string | null;
  };
  horarios: string;
  ia: {
    /** null = usar el proveedor global de la plataforma */
    proveedor: 'mock' | 'openai' | 'anthropic' | null;
    nombreBot: string;
    /** instrucciones extra que se agregan al prompt base */
    instruccionesExtra: string;
  };
  canales: {
    appHabilitada: boolean;
    webHabilitada: boolean;
    whatsappHabilitado: boolean;
    whatsappPhoneNumberId: string | null;
  };
  pedidos: {
    permiteEnvio: boolean;
    permiteRetiro: boolean;
    costoEnvioBase: number;
  };
}

export const CONFIGURACION_VIVERO_DEFAULT: ConfiguracionVivero = {
  marca: { colorPrimario: '#2E7D32', colorSecundario: '#A5D6A7', logoUrl: null },
  horarios: 'Lunes a sábados de 9 a 18 hs',
  ia: { proveedor: null, nombreBot: 'Flora', instruccionesExtra: '' },
  canales: {
    appHabilitada: true,
    webHabilitada: false,
    whatsappHabilitado: false,
    whatsappPhoneNumberId: null,
  },
  pedidos: { permiteEnvio: true, permiteRetiro: true, costoEnvioBase: 0 },
};

@Entity('viveros')
export class Vivero extends EntidadBase {
  @Column({ length: 120 })
  nombre: string;

  /** Identificador legible y único: se usa en URLs del widget web y en el deep-link de la app. */
  @Index({ unique: true })
  @Column({ length: 60 })
  slug: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  razonSocial: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cuit: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  telefono: string | null;

  @Column({ type: 'text', nullable: true })
  direccion: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  ciudad: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  provincia: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud: number | null;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'jsonb', default: () => `'${JSON.stringify(CONFIGURACION_VIVERO_DEFAULT)}'` })
  configuracion: ConfiguracionVivero;
}

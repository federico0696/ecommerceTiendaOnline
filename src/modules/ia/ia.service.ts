import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NombreProveedor, ProveedorIA, RespuestaIA, SolicitudIA } from './ia-provider.interface';
import { AnthropicProvider } from './proveedores/anthropic.provider';
import { MockProvider } from './proveedores/mock.provider';
import { OpenAIProvider } from './proveedores/openai.provider';

/**
 * Punto único de acceso a la IA. Elige el proveedor:
 *  1. el que pide la llamada (por ejemplo, el configurado en el vivero),
 *  2. si no, el global de la plataforma (IA_PROVEEDOR),
 *  3. si el elegido no tiene credenciales, cae a mock y lo avisa en el log.
 */
@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly proveedores: Record<NombreProveedor, ProveedorIA>;
  private readonly global: NombreProveedor;

  constructor(
    config: ConfigService,
    mock: MockProvider,
    openai: OpenAIProvider,
    anthropic: AnthropicProvider,
  ) {
    this.proveedores = { mock, openai, anthropic };
    this.global = config.get<NombreProveedor>('ia.proveedor') ?? 'mock';
    this.logger.log(
      `Proveedor de IA global: ${this.global}. Disponibles: ${this.disponibles().join(', ')}`,
    );
  }

  disponibles(): NombreProveedor[] {
    return (Object.keys(this.proveedores) as NombreProveedor[]).filter((n) =>
      this.proveedores[n].disponible(),
    );
  }

  resolver(preferido?: NombreProveedor | null): ProveedorIA {
    const nombre = preferido ?? this.global;
    const proveedor = this.proveedores[nombre];
    if (!proveedor) throw new ServiceUnavailableException(`Proveedor de IA desconocido: ${nombre}`);
    if (proveedor.disponible()) return proveedor;
    this.logger.warn(`El proveedor "${nombre}" no tiene credenciales; se usa mock`);
    return this.proveedores.mock;
  }

  generar(solicitud: SolicitudIA, preferido?: NombreProveedor | null): Promise<RespuestaIA> {
    return this.resolver(preferido).generar(solicitud);
  }

  /** Atajo para tareas de un solo paso (resumir, redactar, clasificar) sin herramientas. */
  async completar(
    sistema: string,
    texto: string,
    preferido?: NombreProveedor | null,
    maxTokens = 512,
  ): Promise<string> {
    const r = await this.generar(
      { sistema, mensajes: [{ rol: 'usuario', contenido: texto }], maxTokens },
      preferido,
    );
    return r.texto ?? '';
  }
}

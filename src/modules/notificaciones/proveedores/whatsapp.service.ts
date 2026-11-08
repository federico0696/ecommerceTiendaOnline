import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * Envío por WhatsApp Cloud API (Meta). Con WHATSAPP_HABILITADO=false solo registra en el log.
 * El phoneNumberId puede venir del vivero (cada vivero su número) o del global.
 */
@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly habilitado: boolean;
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly phoneNumberIdGlobal: string;

  constructor(config: ConfigService) {
    this.habilitado = config.get<boolean>('whatsapp.habilitado') ?? false;
    this.apiUrl = config.get<string>('whatsapp.apiUrl') as string;
    this.token = config.get<string>('whatsapp.token') ?? '';
    this.phoneNumberIdGlobal = config.get<string>('whatsapp.phoneNumberId') ?? '';
  }

  async enviarTexto(
    numero: string,
    texto: string,
    phoneNumberId?: string | null,
  ): Promise<{ id: string | null; simulado: boolean }> {
    if (!this.habilitado) {
      this.logger.log(`[SIMULADO] WhatsApp a ${numero}: ${texto.slice(0, 120)}`);
      return { id: null, simulado: true };
    }
    const pnid = phoneNumberId || this.phoneNumberIdGlobal;
    const { data } = await axios.post(
      `${this.apiUrl}/${pnid}/messages`,
      { messaging_product: 'whatsapp', to: numero, type: 'text', text: { body: texto } },
      { headers: { Authorization: `Bearer ${this.token}` } },
    );
    return { id: data?.messages?.[0]?.id ?? null, simulado: false };
  }

  /** Plantillas aprobadas por Meta (para iniciar conversaciones fuera de la ventana de 24 h). */
  async enviarPlantilla(
    numero: string,
    nombrePlantilla: string,
    parametros: string[],
    phoneNumberId?: string | null,
  ) {
    if (!this.habilitado) {
      this.logger.log(
        `[SIMULADO] WhatsApp plantilla "${nombrePlantilla}" a ${numero} (${parametros.join(', ')})`,
      );
      return { id: null, simulado: true };
    }
    const pnid = phoneNumberId || this.phoneNumberIdGlobal;
    const { data } = await axios.post(
      `${this.apiUrl}/${pnid}/messages`,
      {
        messaging_product: 'whatsapp',
        to: numero,
        type: 'template',
        template: {
          name: nombrePlantilla,
          language: { code: 'es_AR' },
          components: [
            { type: 'body', parameters: parametros.map((p) => ({ type: 'text', text: p })) },
          ],
        },
      },
      { headers: { Authorization: `Bearer ${this.token}` } },
    );
    return { id: data?.messages?.[0]?.id ?? null, simulado: false };
  }
}

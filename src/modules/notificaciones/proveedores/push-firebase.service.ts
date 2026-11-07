import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface ResultadoPush {
  enviados: number;
  fallidos: number;
  tokensInvalidos: string[];
  simulado: boolean;
}

/** Firebase Cloud Messaging. Con FIREBASE_HABILITADO=false solo registra en el log. */
@Injectable()
export class PushFirebaseService {
  private readonly logger = new Logger(PushFirebaseService.name);
  private readonly habilitado: boolean;
  private app: admin.app.App | null = null;

  constructor(private readonly config: ConfigService) {
    this.habilitado = config.get<boolean>('firebase.habilitado') ?? false;
    if (this.habilitado) this.inicializar();
  }

  async enviar(
    tokens: string[],
    titulo: string,
    cuerpo: string,
    datos: Record<string, unknown> = {},
  ): Promise<ResultadoPush> {
    if (tokens.length === 0)
      return { enviados: 0, fallidos: 0, tokensInvalidos: [], simulado: !this.habilitado };
    if (!this.habilitado || !this.app) {
      this.logger.log(`[SIMULADO] Push a ${tokens.length} dispositivo(s): "${titulo}" - ${cuerpo}`);
      return { enviados: tokens.length, fallidos: 0, tokensInvalidos: [], simulado: true };
    }
    const datosString = Object.fromEntries(
      Object.entries(datos).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]),
    );
    const respuesta = await admin.messaging(this.app).sendEachForMulticast({
      tokens,
      notification: { title: titulo, body: cuerpo },
      data: datosString,
      android: { priority: 'high', notification: { channelId: 'vivero_general' } },
    });
    const tokensInvalidos: string[] = [];
    respuesta.responses.forEach((r, i) => {
      const codigo = r.error?.code ?? '';
      if (
        codigo.includes('registration-token-not-registered') ||
        codigo.includes('invalid-argument')
      )
        tokensInvalidos.push(tokens[i]);
    });
    return {
      enviados: respuesta.successCount,
      fallidos: respuesta.failureCount,
      tokensInvalidos,
      simulado: false,
    };
  }

  private inicializar() {
    try {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.get('firebase.projectId'),
          clientEmail: this.config.get('firebase.clientEmail'),
          privateKey: this.config.get('firebase.privateKey'),
        }),
      });
      this.logger.log('Firebase inicializado');
    } catch (e) {
      this.logger.error(
        `No se pudo inicializar Firebase: ${(e as Error).message}. Los push quedan simulados.`,
      );
      this.app = null;
    }
  }
}

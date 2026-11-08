import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  Logger,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { Canal } from '../../common/enums';
import { ClientesService } from '../clientes/clientes.service';
import { Vivero } from '../viveros/entities/vivero.entity';
import { CanalesService } from './canales.service';

/**
 * CANAL WHATSAPP (Meta Cloud API).
 * - GET: verificación del webhook al configurarlo en Meta.
 * - POST: mensajes entrantes. Se identifica el vivero por el phone_number_id del mensaje
 *   (cada vivero puede tener su número) y el cliente por su teléfono.
 *
 * TODO (cuando se active): mover el procesamiento a una cola BullMQ para responder a Meta
 * en menos de 5 segundos y reintentar si la IA tarda. La estructura ya lo permite:
 * procesarEntrante() es independiente del transporte.
 */
@ApiExcludeController()
@Controller('canales/whatsapp')
export class WhatsappWebhookController {
  private readonly logger = new Logger(WhatsappWebhookController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly canales: CanalesService,
    private readonly clientes: ClientesService,
    @InjectRepository(Vivero) private readonly viveros: Repository<Vivero>,
  ) {}

  @Get('webhook')
  verificar(
    @Query('hub.mode') modo: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    if (modo === 'subscribe' && token === this.config.get('whatsapp.verifyToken')) return challenge;
    throw new ForbiddenException('Token de verificación inválido');
  }

  @Post('webhook')
  @HttpCode(200)
  async recibir(
    @Body() body: any,
    @Headers('x-hub-signature-256') firma: string | undefined,
    @Req() req: Request,
  ) {
    this.verificarFirma(firma, (req as any).rawBody);
    const entradas = body?.entry ?? [];
    for (const entrada of entradas) {
      for (const cambio of entrada.changes ?? []) {
        const valor = cambio.value;
        const phoneNumberId: string | undefined = valor?.metadata?.phone_number_id;
        for (const msg of valor?.messages ?? []) {
          try {
            await this.procesarMensaje(msg, phoneNumberId, valor?.contacts?.[0]?.profile?.name);
          } catch (e) {
            this.logger.error(`Error procesando mensaje de WhatsApp: ${(e as Error).message}`);
          }
        }
      }
    }
    return { recibido: true };
  }

  private async procesarMensaje(
    msg: any,
    phoneNumberId: string | undefined,
    nombrePerfil?: string,
  ) {
    if (!phoneNumberId) return;
    const vivero = await this.viveros
      .createQueryBuilder('v')
      .where(`v.configuracion->'canales'->>'whatsappPhoneNumberId' = :pnid AND v.activo = true`, {
        pnid: phoneNumberId,
      })
      .getOne();
    if (!vivero) {
      this.logger.warn(`Mensaje para un phone_number_id sin vivero: ${phoneNumberId}`);
      return;
    }
    if (!vivero.configuracion.canales.whatsappHabilitado) return;

    const texto: string | undefined =
      msg.type === 'text'
        ? msg.text?.body
        : msg.type === 'interactive'
          ? (msg.interactive?.button_reply?.title ?? msg.interactive?.list_reply?.title)
          : msg.type === 'button'
            ? msg.button?.text
            : undefined;
    if (!texto) {
      this.logger.debug(`Tipo de mensaje no soportado todavía: ${msg.type}`);
      return;
    }
    const cliente = await this.clientes.obtenerOCrearPorWhatsapp(
      vivero.id,
      String(msg.from),
      nombrePerfil,
    );
    await this.canales.procesarEntrante({
      viveroId: vivero.id,
      canal: Canal.WHATSAPP,
      cliente,
      texto,
      metadata: { idMeta: msg.id, timestamp: msg.timestamp },
    });
  }

  /** Meta firma el cuerpo con el app secret. En desarrollo (sin secret) se omite. */
  private verificarFirma(firma: string | undefined, rawBody?: Buffer) {
    const secret = this.config.get<string>('whatsapp.appSecret');
    if (!secret || !this.config.get<boolean>('whatsapp.habilitado')) return;
    if (!firma || !rawBody) throw new BadRequestException('Falta la firma del webhook');
    const esperada = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
    if (
      esperada.length !== firma.length ||
      !timingSafeEqual(Buffer.from(esperada), Buffer.from(firma))
    ) {
      throw new ForbiddenException('Firma inválida');
    }
  }
}

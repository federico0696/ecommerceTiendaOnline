import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly habilitado: boolean;
  private transporte: nodemailer.Transporter | null = null;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.habilitado = config.get<boolean>('mail.habilitado') ?? false;
    this.from = config.get<string>('mail.from') ?? '';
    if (this.habilitado) {
      this.transporte = nodemailer.createTransport({
        host: config.get('mail.host'),
        port: config.get('mail.puerto'),
        secure: config.get<number>('mail.puerto') === 465,
        auth: { user: config.get('mail.usuario'), pass: config.get('mail.password') },
      });
    }
  }

  async enviar(para: string, asunto: string, html: string): Promise<{ simulado: boolean }> {
    if (!this.habilitado || !this.transporte) {
      this.logger.log(`[SIMULADO] Email a ${para}: ${asunto}`);
      return { simulado: true };
    }
    await this.transporte.sendMail({ from: this.from, to: para, subject: asunto, html });
    return { simulado: false };
  }
}

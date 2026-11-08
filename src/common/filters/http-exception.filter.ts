import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/** Respuesta de error uniforme para app y panel. */
@Catch()
export class FiltroExcepciones implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const esHttp = exception instanceof HttpException;
    const status = esHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const cuerpo = esHttp ? exception.getResponse() : null;
    const mensaje =
      typeof cuerpo === 'string'
        ? cuerpo
        : ((cuerpo as any)?.message ?? (status === 500 ? 'Error interno' : 'Error'));

    if (status >= 500) this.logger.error(`${req.method} ${req.url}`, (exception as Error)?.stack);

    res.status(status).json({
      ok: false,
      status,
      mensaje,
      ruta: req.url,
      fecha: new Date().toISOString(),
    });
  }
}

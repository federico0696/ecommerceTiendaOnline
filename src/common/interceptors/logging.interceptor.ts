import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

/** Log de cada request con método, ruta, estado y duración. */
@Injectable()
export class InterceptorLogging implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const inicio = Date.now();
    return next.handle().pipe(
      tap(() => {
        const res = ctx.switchToHttp().getResponse();
        this.logger.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - inicio}ms`);
      }),
    );
  }
}

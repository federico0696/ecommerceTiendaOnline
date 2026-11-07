import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: necesario para verificar la firma de los webhooks de Meta (WhatsApp).
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const prefijo = config.get<string>('app.prefijoApi') ?? 'api/v1';
  app.setGlobalPrefix(prefijo, { exclude: ['uploads/(.*)'] });
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({ origin: config.get<string[]>('app.corsOrigenes'), credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableShutdownHooks();

  if (config.get('app.env') !== 'production') {
    const doc = new DocumentBuilder()
      .setTitle(config.get('app.nombre') ?? 'Vivero API')
      .setDescription(
        'API multi-vivero: catálogo, pedidos, conversaciones omnicanal, bot con IA desacoplada y notificaciones.',
      )
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup(`${prefijo}/docs`, app, SwaggerModule.createDocument(app, doc));
  }

  const puerto = config.get<number>('app.puerto') ?? 3000;
  await app.listen(puerto);
  logger.log(`${config.get('app.nombre')} escuchando en ${config.get('app.url')}/${prefijo}`);
  logger.log(`Documentación: ${config.get('app.url')}/${prefijo}/docs`);
}
bootstrap();

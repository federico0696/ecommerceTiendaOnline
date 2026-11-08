import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'node:path';
import { FiltroExcepciones } from './common/filters/http-exception.filter';
import { InterceptorLogging } from './common/interceptors/logging.interceptor';
import configuration from './config/configuration';
import { esquemaEnv } from './config/env.validation';
import { typeOrmConfig } from './config/typeorm.config';
import { DatabaseModule } from './database/database.module';
import { ArchivosModule } from './modules/archivos/archivos.module';
import { AuthModule } from './modules/auth/auth.module';
import { BotModule } from './modules/bot/bot.module';
import { CanalesModule } from './modules/canales/canales.module';
import { CatalogoModule } from './modules/catalogo/catalogo.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { ConversacionesModule } from './modules/conversaciones/conversaciones.module';
import { IaModule } from './modules/ia/ia.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { SaludModule } from './modules/salud/salud.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ViverosModule } from './modules/viveros/viveros.module';

@Module({
  imports: [
    // --- infraestructura ---
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: esquemaEnv,
      validationOptions: { abortEarly: false },
    }),
    TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory: typeOrmConfig }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: (config.get<number>('throttle.ttlSegundos') ?? 60) * 1000,
          limit: config.get<number>('throttle.limite') ?? 120,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          rootPath: resolve(config.get<string>('archivos.localRuta') ?? './uploads'),
          serveRoot: '/uploads',
        },
      ],
    }),
    DatabaseModule,

    // --- transversales (globales) ---
    IaModule,
    RealtimeModule,

    // --- dominio ---
    ViverosModule,
    UsuariosModule,
    ClientesModule,
    AuthModule,
    CatalogoModule,
    PedidosModule,
    ConversacionesModule,
    BotModule,
    NotificacionesModule,
    CanalesModule,
    ArchivosModule,
    SaludModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: FiltroExcepciones },
    { provide: APP_INTERCEPTOR, useClass: InterceptorLogging },
  ],
})
export class AppModule {}

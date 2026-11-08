import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/** Opciones de TypeORM para la app (usa autoLoadEntities, así cada módulo registra las suyas). */
export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('db.host'),
  port: config.get<number>('db.puerto'),
  username: config.get<string>('db.usuario'),
  password: config.get<string>('db.password'),
  database: config.get<string>('db.nombre'),
  ssl: config.get<boolean>('db.ssl') ? { rejectUnauthorized: false } : false,
  synchronize: config.get<boolean>('db.synchronize'),
  logging: config.get<boolean>('db.logging'),
  autoLoadEntities: true,
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
});

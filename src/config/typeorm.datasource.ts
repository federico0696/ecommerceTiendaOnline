import 'reflect-metadata';
import { config as cargarEnv } from 'dotenv';
import { DataSource } from 'typeorm';

cargarEnv();

/** DataSource para la CLI de TypeORM (generar y correr migraciones). */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PUERTO ?? 5432),
  username: process.env.DB_USUARIO,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NOMBRE,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
});

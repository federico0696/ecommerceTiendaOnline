import * as Joi from 'joi';

/**
 * Esquema de validación de variables de entorno.
 * Si falta algo obligatorio, la app no arranca y dice exactamente qué falta.
 * Las integraciones externas (IA real, Firebase, WhatsApp, correo, S3) son
 * opcionales: con sus flags en false el sistema funciona igual, en modo local.
 */
export const esquemaEnv = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  APP_NOMBRE: Joi.string().default('Vivero API'),
  APP_PUERTO: Joi.number().default(3000),
  APP_URL: Joi.string().uri().default('http://localhost:3000'),
  APP_PREFIJO_API: Joi.string().default('api/v1'),
  APP_CORS_ORIGENES: Joi.string().default('*'),
  APP_LOG_NIVEL: Joi.string().valid('error', 'warn', 'log', 'debug', 'verbose').default('log'),

  DB_HOST: Joi.string().required(),
  DB_PUERTO: Joi.number().default(5432),
  DB_USUARIO: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NOMBRE: Joi.string().required(),
  DB_SSL: Joi.boolean().default(false),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PUERTO: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_DB: Joi.number().default(0),
  REDIS_PREFIJO: Joi.string().default('vivero'),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRACION: Joi.string().default('8h'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRACION: Joi.string().default('30d'),
  BCRYPT_ROUNDS: Joi.number().default(10),
  ROOT_EMAIL: Joi.string().email({ tlds: { allow: false } }).default('root@vivero.local'),
  ROOT_PASSWORD: Joi.string().min(8).default('Root1234!'),
  ROOT_NOMBRE: Joi.string().default('Root'),

  IA_PROVEEDOR: Joi.string().valid('mock', 'openai', 'anthropic').default('mock'),
  IA_MAX_TOKENS: Joi.number().default(1024),
  IA_MAX_ITERACIONES_HERRAMIENTAS: Joi.number().default(5),
  IA_HISTORIAL_MAX_MENSAJES: Joi.number().default(40),
  OPENAI_API_KEY: Joi.string().allow('').default(''),
  OPENAI_MODELO: Joi.string().default('gpt-4.1'),
  OPENAI_MODELO_VISION: Joi.string().default('gpt-4.1'),
  ANTHROPIC_API_KEY: Joi.string().allow('').default(''),
  ANTHROPIC_MODELO: Joi.string().default('claude-opus-5-5'),

  FIREBASE_HABILITADO: Joi.boolean().default(false),
  FIREBASE_PROJECT_ID: Joi.string().allow('').default(''),
  FIREBASE_CLIENT_EMAIL: Joi.string().allow('').default(''),
  FIREBASE_PRIVATE_KEY: Joi.string().allow('').default(''),

  WHATSAPP_HABILITADO: Joi.boolean().default(false),
  WHATSAPP_API_URL: Joi.string().default('https://graph.facebook.com/v21.0'),
  WHATSAPP_TOKEN: Joi.string().allow('').default(''),
  WHATSAPP_PHONE_NUMBER_ID: Joi.string().allow('').default(''),
  WHATSAPP_VERIFY_TOKEN: Joi.string().allow('').default(''),
  WHATSAPP_APP_SECRET: Joi.string().allow('').default(''),

  MAIL_HABILITADO: Joi.boolean().default(false),
  MAIL_HOST: Joi.string().allow('').default(''),
  MAIL_PUERTO: Joi.number().default(587),
  MAIL_USUARIO: Joi.string().allow('').default(''),
  MAIL_PASSWORD: Joi.string().allow('').default(''),
  MAIL_FROM: Joi.string().allow('').default(''),

  ARCHIVOS_PROVEEDOR: Joi.string().valid('local', 's3').default('local'),
  ARCHIVOS_LOCAL_RUTA: Joi.string().default('./uploads'),
  ARCHIVOS_URL_PUBLICA: Joi.string().default('http://localhost:3000/uploads'),
  S3_REGION: Joi.string().allow('').default(''),
  S3_BUCKET: Joi.string().allow('').default(''),
  S3_ACCESS_KEY_ID: Joi.string().allow('').default(''),
  S3_SECRET_ACCESS_KEY: Joi.string().allow('').default(''),
  S3_ENDPOINT: Joi.string().allow('').default(''),

  THROTTLE_TTL_SEGUNDOS: Joi.number().default(60),
  THROTTLE_LIMITE: Joi.number().default(120),
});

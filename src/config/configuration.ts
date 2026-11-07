/**
 * Configuración tipada. Se registra en ConfigModule con `load: [configuration]`
 * y se consume con `configService.get<ConfigApp>('app')`, etc.
 * Ningún módulo lee process.env directamente: todo pasa por acá.
 */
const bool = (v: string | undefined, def = false) => (v === undefined ? def : v === 'true');
const num = (v: string | undefined, def: number) => (v === undefined || v === '' ? def : Number(v));

const configuration = () => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    nombre: process.env.APP_NOMBRE ?? 'Vivero API',
    puerto: num(process.env.APP_PUERTO, 3000),
    url: process.env.APP_URL ?? 'http://localhost:3000',
    prefijoApi: process.env.APP_PREFIJO_API ?? 'api/v1',
    corsOrigenes: (process.env.APP_CORS_ORIGENES ?? '*').split(',').map((s) => s.trim()),
    logNivel: process.env.APP_LOG_NIVEL ?? 'log',
  },
  db: {
    host: process.env.DB_HOST,
    puerto: num(process.env.DB_PUERTO, 5432),
    usuario: process.env.DB_USUARIO,
    password: process.env.DB_PASSWORD,
    nombre: process.env.DB_NOMBRE,
    ssl: bool(process.env.DB_SSL),
    synchronize: bool(process.env.DB_SYNCHRONIZE),
    logging: bool(process.env.DB_LOGGING),
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    puerto: num(process.env.REDIS_PUERTO, 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: num(process.env.REDIS_DB, 0),
    prefijo: process.env.REDIS_PREFIJO ?? 'vivero',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiracion: process.env.JWT_EXPIRACION ?? '8h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiracion: process.env.JWT_REFRESH_EXPIRACION ?? '30d',
    bcryptRounds: num(process.env.BCRYPT_ROUNDS, 10),
    root: {
      email: process.env.ROOT_EMAIL ?? 'root@vivero.local',
      password: process.env.ROOT_PASSWORD ?? 'Root1234!',
      nombre: process.env.ROOT_NOMBRE ?? 'Root',
    },
  },
  ia: {
    proveedor: (process.env.IA_PROVEEDOR ?? 'mock') as 'mock' | 'openai' | 'anthropic',
    maxTokens: num(process.env.IA_MAX_TOKENS, 1024),
    maxIteracionesHerramientas: num(process.env.IA_MAX_ITERACIONES_HERRAMIENTAS, 5),
    historialMaxMensajes: num(process.env.IA_HISTORIAL_MAX_MENSAJES, 40),
    openai: {
      apiKey: process.env.OPENAI_API_KEY ?? '',
      modelo: process.env.OPENAI_MODELO ?? 'gpt-4.1',
      modeloVision: process.env.OPENAI_MODELO_VISION ?? 'gpt-4.1',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY ?? '',
      modelo: process.env.ANTHROPIC_MODELO ?? 'claude-opus-5-5',
    },
  },
  firebase: {
    habilitado: bool(process.env.FIREBASE_HABILITADO),
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  },
  whatsapp: {
    habilitado: bool(process.env.WHATSAPP_HABILITADO),
    apiUrl: process.env.WHATSAPP_API_URL ?? 'https://graph.facebook.com/v21.0',
    token: process.env.WHATSAPP_TOKEN ?? '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? '',
    appSecret: process.env.WHATSAPP_APP_SECRET ?? '',
  },
  mail: {
    habilitado: bool(process.env.MAIL_HABILITADO),
    host: process.env.MAIL_HOST ?? '',
    puerto: num(process.env.MAIL_PUERTO, 587),
    usuario: process.env.MAIL_USUARIO ?? '',
    password: process.env.MAIL_PASSWORD ?? '',
    from: process.env.MAIL_FROM ?? '',
  },
  archivos: {
    proveedor: (process.env.ARCHIVOS_PROVEEDOR ?? 'local') as 'local' | 's3',
    localRuta: process.env.ARCHIVOS_LOCAL_RUTA ?? './uploads',
    urlPublica: process.env.ARCHIVOS_URL_PUBLICA ?? 'http://localhost:3000/uploads',
    s3: {
      region: process.env.S3_REGION ?? '',
      bucket: process.env.S3_BUCKET ?? '',
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
      endpoint: process.env.S3_ENDPOINT || undefined,
    },
  },
  throttle: {
    ttlSegundos: num(process.env.THROTTLE_TTL_SEGUNDOS, 60),
    limite: num(process.env.THROTTLE_LIMITE, 120),
  },
});

export default configuration;
export type Configuracion = ReturnType<typeof configuration>;

# Vivero API

Backend de la plataforma de gestión para viveros. Un solo despliegue atiende a muchos viveros (multi-tenant): cada uno con su catálogo, clientes, empleados, pedidos, conversaciones y configuración.

Este repositorio tiene **tres ramas independientes**, pensadas para separarse en tres repos cuando haga falta:

| Rama | Qué contiene | Stack |
|---|---|---|
| `main` | **Esta API** | NestJS 10, TypeORM, PostgreSQL, Socket.IO, OpenAI / Anthropic |
| `app` | App mobile para clientes | React Native + TypeScript |
| `panel` | Panel web para root, admins y empleados | React + Vite + TypeScript |

## Roles

| Rol | Quién | Alcance |
|---|---|---|
| `root` | Dueño de la plataforma | Todos los viveros. Opera sobre uno con el header `x-vivero-id` |
| `admin` | Dueño de un vivero | Todo su vivero: catálogo, usuarios, pedidos, chats, bot, campañas |
| `empleado` | Operario de un vivero | Catálogo, stock, pedidos y chats de su vivero |
| `cliente` | Usuario de la app | Catálogo, carrito, pedidos propios y chat |

## Arrancar en local

Requisitos: Node 20+, Docker (para Postgres y Redis).

```bash
docker compose up -d          # Postgres + Redis
npm install
npm run start:dev             # http://localhost:3000/api/v1
```

Documentación interactiva (Swagger): http://localhost:3000/api/v1/docs

Al arrancar se crea el usuario root con `ROOT_EMAIL` / `ROOT_PASSWORD` del `.env`. Para cargar un vivero de demostración completo (admin, empleado, categorías, productos y un cliente):

```bash
npm run seed
```

Credenciales de la demo: `admin@demo.local`, `empleado@demo.local`, `cliente@demo.local` (vivero `demo`), todas con `Demo1234!`.

## Variables de entorno

Todo se configura por `.env` (ver `.env.example`, que tiene cada variable comentada). **Hoy el `.env` está versionado con valores ficticios a propósito**: no hay servidores ni cuentas reales. Cuando los haya, se saca de git.

Las integraciones externas se activan con un flag y funcionan en modo simulado mientras están apagadas (lo que saldría se registra en el log y en la tabla `notificaciones`):

| Integración | Flag | Qué pasa apagada |
|---|---|---|
| IA real | `IA_PROVEEDOR=openai` o `anthropic` | Con `mock` responde un bot de demostración sin llamar a nada |
| Push (Firebase) | `FIREBASE_HABILITADO` | Se registra como "simulada" |
| WhatsApp (Meta) | `WHATSAPP_HABILITADO` | Se registra como "simulada" |
| Correo | `MAIL_HABILITADO` | Se registra como "simulada" |
| Archivos | `ARCHIVOS_PROVEEDOR=local` o `s3` | Disco local servido en `/uploads` |

## Estructura

```
src/
  config/          variables de entorno validadas (Joi) y configuración tipada
  common/          decoradores (@Auth, @ViveroActual), guards, filtros, entidades base
  database/        seed del root al arrancar, seed de demo, migraciones
  modules/
    viveros/       tenants y su configuración (marca, horarios, IA, canales, pedidos)
    usuarios/      root, admins y empleados (panel)
    clientes/      usuarios de la app y sus dispositivos (tokens push)
    auth/          login panel, registro/login clientes, refresh, JWT
    catalogo/      categorías, productos, fichas de cuidado, imágenes, movimientos de stock
    pedidos/       pedidos con máquina de estados y bus de eventos
    conversaciones/ conversaciones y mensajes (persistencia, omnicanal)
    ia/            CONTRATO NEUTRO de IA + proveedores mock / OpenAI / Anthropic
    bot/           orquestador del bot, prompt, herramientas
    canales/       flujo completo: app, web, WhatsApp; bandeja del panel
    notificaciones/ push, WhatsApp, email, campañas, reacciones a eventos
    realtime/      Socket.IO: salas por vivero y por cliente
    archivos/      storage local o S3
    salud/         estado del servicio
```

Más detalle en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) y en [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run start:dev` | API en modo desarrollo con recarga |
| `npm run build` | Compila a `dist/` |
| `npm run lint` | ESLint + Prettier |
| `npm test` | Tests unitarios (Jest) |
| `npm run seed` | Vivero de demostración |
| `npm run migration:generate` | Genera una migración a partir de las entidades |
| `npm run migration:run` | Aplica migraciones (para producción, con `DB_SYNCHRONIZE=false`) |

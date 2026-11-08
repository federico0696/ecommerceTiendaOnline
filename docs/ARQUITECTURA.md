# Arquitectura

## Idea central

Un **producto enlatado para viveros**: se instala una vez y se vende a muchos. Cada vivero es un *tenant* aislado por `viveroId` en todas sus tablas. El dueño de la plataforma (root) da de alta viveros; cada vivero administra lo suyo.

Tres piezas, tres ramas de este repositorio:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐
│  App mobile  │    │  Panel web   │    │  Widget web (futuro) │
│  (clientes)  │    │ (root/admin/ │    │  (sitio del vivero)  │
│              │    │  empleados)  │    │                      │
└──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘
       │ REST + Socket.IO  │                       │
       ▼                   ▼                       ▼
┌────────────────────────────────────────────────────────────────┐
│                         VIVERO API (NestJS)                    │
│  auth · viveros · usuarios · clientes · catálogo · pedidos     │
│  conversaciones · bot · ia · canales · notificaciones · rt     │
└───────┬──────────────┬───────────────┬──────────────┬──────────┘
        ▼              ▼               ▼              ▼
   PostgreSQL        Redis        OpenAI/Claude   Firebase · Meta · S3
```

## Multi-tenancy

- `EntidadVivero` agrega `viveroId` indexado a toda entidad de negocio.
- El JWT lleva `viveroId`. Admins, empleados y clientes **no pueden elegir otro**: `@ViveroActual()` lo saca del token.
- Root no tiene vivero; indica sobre cuál opera con el header `x-vivero-id`.
- Los clientes son únicos por `(viveroId, email)`: la misma persona puede ser cliente de dos viveros.
- La `configuracion` (jsonb) del vivero guarda lo que el admin cambia sin deploy: marca (colores, logo para la app en marca blanca), horarios, proveedor de IA, nombre del bot, instrucciones extra del prompt, canales habilitados, política de entregas.

## Autenticación y roles

- Dos puertas con el mismo token: `POST /auth/login` (panel) y `POST /auth/clientes/login|registro` (app).
- Access token corto + refresh token largo. `versionToken` en usuario y cliente permite invalidar sesiones (cambio de contraseña, baja).
- `@Auth(...roles)` combina JWT + `RolesGuard`. Root entra a todo lo del panel; nunca a endpoints exclusivos de clientes.

## Catálogo y stock

- Producto con tipo (planta, flor, maceta, sustrato...), precio y precio de oferta, etiquetas y **ficha de cuidados** en jsonb (luz, riego, ubicación, dificultad, toxicidad para mascotas). Esa ficha es la que usa el bot.
- Búsqueda por nombre, nombre científico, descripción y etiquetas, más filtros por categoría, tipo, luz y ubicación.
- El stock nunca se edita directo: todo pasa por `MovimientoStock` (compra, venta, ajuste, merma, devolución), con quién y por qué.
- El descuento por venta es atómico (`UPDATE ... WHERE stock >= cantidad`) dentro de la transacción del pedido.

## Pedidos

- Snapshot de precio y nombre en cada ítem: si el producto cambia después, el pedido no.
- Máquina de estados con transiciones explícitas (`TRANSICIONES_PEDIDO`). Cancelar repone stock.
- Numeración legible por vivero (#1, #2...).
- `EventosPedidos` es un bus interno: Pedidos emite, Notificaciones y Realtime escuchan. Pedidos no conoce a nadie.

## Conversaciones omnicanal

Una sola entidad `Conversacion` con `canal` (app, web, whatsapp) y `modo` (bot, humano).

```
mensaje entrante ──► CanalesService.procesarEntrante()
                        │ guarda el mensaje, avisa al panel por socket
                        ├─ modo BOT ───► BotService.responder() ──► entrega por el mismo canal
                        │                     │
                        │                     └─ herramienta derivar_a_humano ──► modo HUMANO
                        └─ modo HUMANO ─► espera a un empleado (bandeja del panel)
```

- Los controladores de canal solo traducen transporte: `ChatAppController` (REST para app y widget), `WhatsappWebhookController` (Meta), `ChatPanelController` (bandeja).
- Si un empleado escribe en una conversación en modo bot, la toma automáticamente. Puede devolverla al bot.
- Al derivar, el bot genera un **resumen** para que el empleado se ponga al día sin leer todo.
- `mensajes` es lo que ven las personas; `historialIa` es el contexto neutro para el modelo (incluye llamadas a herramientas), recortado a N ítems sin dejar huérfanos.

## IA desacoplada

`src/modules/ia/ia-provider.interface.ts` define el contrato neutro: `SolicitudIA` (sistema, mensajes, herramientas) y `RespuestaIA` (texto, llamadas, motivo de fin, uso). Tres implementaciones:

| Proveedor | Cómo |
|---|---|
| `mock` | Reglas simples. Sin red. Para demos, tests y desarrollo |
| `openai` | Chat Completions con function calling (`OPENAI_MODELO`, por defecto `gpt-4.1`) |
| `anthropic` | Messages API con tools (`ANTHROPIC_MODELO`, por defecto `claude-opus-5-5`), thinking adaptativo y fallback del lado del servidor ante rechazos de seguridad |

`IaService.resolver()` elige: el proveedor del vivero, si no el global, y si no hay credenciales cae a mock avisando. Agregar un proveedor nuevo es una clase que implementa `ProveedorIA`; el resto del sistema no cambia.

El historial guardado en la base está en formato neutro: se puede cambiar de proveedor en medio de una conversación.

## Bot

- Prompt base en `src/modules/bot/prompts/sistema-base.txt` con placeholders (nombre del bot, datos del vivero, perfil del cliente, instrucciones extra del admin).
- Herramientas en `herramientas/definiciones.ts` (JSON Schema) y ejecutores en `herramientas/registro.ts`: buscar productos, detalle, mis pedidos, estado de pedido, info del vivero, derivar a humano.
- Ciclo con tope de iteraciones; la derivación corta el ciclo y el mensaje al cliente lo define la herramienta, no el modelo.
- `POST /bot/probar` permite probarlo desde el panel con un cliente ficticio.

## Notificaciones

`NotificacionesService` es el único lugar desde el que sale algo. Registra cada envío en `notificaciones` (estado: enviada, fallida, simulada). Escucha los eventos de pedidos y avisa al cliente por push en cada cambio de estado. Desde el panel se mandan push, WhatsApp o email a clientes puntuales o a todos (campaña).

## Tiempo real

Socket.IO en `/rt`. Al conectar, el JWT define la sala: `vivero:{id}` para el panel, `cliente:{id}` para app y widget. Los módulos emiten vía `RealtimeService`; los nombres de evento están en `EventosRT`.

## Decisiones tomadas

- **NestJS + TypeORM + PostgreSQL**, igual que el stack conocido del equipo, para que el código resulte familiar.
- **Clientes y empleados en tablas separadas**: ciclo de vida y auth distintos; evita un `tipo` ambiguo en una tabla única.
- **Configuración por vivero en jsonb** en lugar de 30 columnas: cambia seguido y la lee el panel completa.
- **Bus de eventos propio** (EventEmitter) en vez de una cola, para la base. Cuando WhatsApp esté activo, el webhook debe pasar a BullMQ (Meta exige responder en 5 s); `procesarEntrante()` ya es independiente del transporte, así que es un cambio local.
- **`.env` versionado con valores ficticios** hasta tener infraestructura real.

## Lo que falta decidir o hacer (ver ROADMAP)

Pagos (Mercado Pago), widget web embebible, visión (identificar plantas por foto), recomendador, cola para WhatsApp, adapter Redis para sockets en múltiples instancias, tests automatizados, CI/CD y despliegue en AWS.

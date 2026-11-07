# Roadmap

Orden sugerido. Cada ítem es una sesión de trabajo razonable.

## Hecho (base)

- [x] Esqueleto NestJS con configuración validada por entorno
- [x] Multi-tenant (viveros) y roles root / admin / empleado / cliente
- [x] Auth con access + refresh token para panel y app
- [x] Catálogo: categorías, productos, ficha de cuidados, imágenes, movimientos de stock
- [x] Pedidos con máquina de estados, snapshot de precios y eventos
- [x] Conversaciones omnicanal (app, web, WhatsApp) y bandeja del panel
- [x] Contrato de IA neutro con proveedores mock, OpenAI y Anthropic
- [x] Bot con herramientas, derivación a humano y resumen para el empleado
- [x] Notificaciones push (Firebase), WhatsApp (Meta), email; campañas; registro
- [x] Tiempo real con Socket.IO
- [x] Storage local / S3
- [x] Seed de demo, Docker Compose, Swagger

## Próximo

1. **App mobile** (rama `app`): login, catálogo, ficha, carrito, pedidos, chat, notificaciones, marca blanca por vivero.
2. **Panel web** (rama `panel`): inicio con métricas, catálogo y stock, pedidos, bandeja de chats en vivo, editor del bot, campañas, configuración, vista root.
3. **Infra real**: cuenta en OpenAI o Anthropic, proyecto Firebase, Postgres y Redis gestionados en AWS, S3, variables reales, `.env` fuera de git.
4. **Tests**: unitarios de guards, bot y máquina de estados; e2e de auth y pedidos.
5. **WhatsApp productivo**: cola BullMQ para el webhook, plantillas aprobadas, ventana de 24 h.
6. **Pagos**: Mercado Pago (checkout + webhook), estados de pago automáticos.
7. **Widget web embebible**: script `<script src=".../widget.js" data-vivero="slug">` que abre el chat del vivero en su sitio.
8. **IA más allá del chat**: recomendador por ambiente y perfil, generación de fichas y descripciones al cargar productos, identificación de plantas y plagas por foto (visión), redacción de campañas.
9. **Mis plantas**: el cliente registra lo que compró, recordatorios de riego por push.
10. **Observabilidad**: logs estructurados, métricas, alertas; auditoría de acciones de admins.
11. **Escala**: adapter Redis para Socket.IO, migraciones en vez de `synchronize`, CI/CD.

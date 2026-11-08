# Vivero Panel

Panel web de gestión para la plataforma de viveros. Lo usan tres roles con la misma interfaz y distinto alcance:

| Rol | Ve |
|---|---|
| `root` | Todo. Elige en la barra superior sobre qué vivero opera y da de alta viveros nuevos |
| `admin` | Su vivero completo: chats, pedidos, catálogo, clientes, campañas, asistente, equipo, configuración |
| `empleado` | Chats, pedidos, catálogo y clientes de su vivero |

Esta es la rama `panel` del repositorio. Las otras ramas: `main` (API) y `app` (app mobile).

## Stack

React 19, Vite, TypeScript, Tailwind CSS 4, Redux Toolkit, React Router 7, Axios, Socket.IO client, Lucide icons, react-toastify.

## Arrancar

Necesita la API corriendo (rama `main`, por defecto en `http://localhost:3000`).

```bash
npm install
npm run dev        # http://localhost:5173
```

Variables en `.env` (ficticias y versionadas por ahora): `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_APP_NOMBRE`.

Usuario inicial: el root que crea la API (`root@vivero.local` / `Root1234!` por defecto). Con `npm run seed` en la API hay un vivero demo con `admin@demo.local` / `Demo1234!`.

## Estructura

```
src/
  api/          cliente axios (token, refresh automático, header x-vivero-id para root) y servicios por recurso
  app/          store de Redux y slice de sesión (persistida en localStorage)
  components/   ui (botón, campo, tarjeta...) y layout (sidebar, topbar)
  hooks/        useAuth, useSocket
  interfaces/   tipos compartidos con la API
  layouts/      AuthLayout, DashboardLayout
  pages/        una carpeta por sección
  routes/       router y guard por rol
  utils/        formato de dinero, fechas y estados de pedido
```

## Pantallas

- **Inicio**: pedidos pendientes, chats esperando una persona, mensajes sin leer, stock bajo. Se actualiza en vivo.
- **Conversaciones**: bandeja con filtro bot / persona, chat en tiempo real, tomar, responder, devolver al bot, cerrar. Muestra el resumen de IA al derivar.
- **Pedidos**: lista con filtro por estado y botones para avanzar según las transiciones permitidas.
- **Catálogo y stock**: alta de productos y categorías, ajustes de stock con motivo, destacar u ocultar.
- **Clientes**: listado con búsqueda.
- **Campañas** (admin): envío masivo por push, WhatsApp o email e historial.
- **Asistente** (admin): nombre, proveedor de IA, instrucciones extra, herramientas y un chat de prueba.
- **Equipo** (admin): alta y baja de admins y empleados.
- **Mi vivero** (admin): datos, colores de marca, horarios, entregas y canales.
- **Viveros** (root): alta y listado de viveros.

## Próximo

Edición completa de productos con fotos y ficha de cuidados, detalle de cliente con su historial, métricas de ventas, editor del prompt base (root), gestión de plantillas de WhatsApp, modo oscuro.

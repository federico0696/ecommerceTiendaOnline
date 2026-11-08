# Vivero App

App mobile (Android primero) para los **clientes** de un vivero: catálogo, ficha de cuidados, carrito y pedidos, chat con el asistente y con las personas del vivero, notificaciones push.

Esta es la rama `app` del repositorio. Las otras ramas: `main` (API) y `panel` (panel web).

## Marca blanca

La app se compila **para un vivero**: `VIVERO_SLUG` en `.env`. Al arrancar pide el perfil público de ese vivero a la API y toma de ahí el nombre, los colores, los horarios, el nombre del asistente y la política de entregas. Para otro vivero, otro `.env` (y otro `applicationId` cuando se publique).

## Stack

React Native 0.81 + TypeScript (sin Expo), UI Kitten + Eva, React Navigation (native stack + tabs), Zustand, Axios, Socket.IO client, Firebase Messaging, Encrypted Storage, react-native-dotenv.

Mismo stack y misma organización en capas que la app de referencia del equipo.

## Arrancar

Requisitos: Node 20+, Android Studio con SDK y un emulador o dispositivo. La API tiene que estar corriendo (rama `main`).

```bash
npm install
npm start            # Metro
npm run android      # en otra terminal
```

En el emulador de Android, `localhost` de la PC es `10.0.2.2`; el `.env` ya viene así. En un dispositivo físico, poné la IP de tu PC.

Cuenta de prueba (con `npm run seed` en la API): `cliente@demo.local` / `Demo1234!` en el vivero `demo`.

## Variables de entorno

`.env` (ficticio y versionado por ahora): `API_URL`, `SOCKET_URL`, `VIVERO_SLUG`, `APP_NOMBRE`. Solo `src/config/appConfig.ts` las lee.

## Firebase

`android/app/google-services.json` es **ficticio**: permite compilar pero los push no llegan. Cuando exista el proyecto en Firebase, reemplazarlo por el real (paquete `com.viveroapp`). El servicio de notificaciones carga Firebase de forma perezosa y no rompe la app si falla.

## Estructura

```
src/
  App.tsx                     arranque: perfil del vivero, sesión, tema, navegación
  config/appConfig.ts         variables de entorno
  domain/entities/            tipos de negocio como los usa la app
  infrastructure/
    api/clienteApi.ts         axios con token y refresh automático
    interfaces/               formas crudas de la API
    mappers/                  API -> entidades
  presentation/
    theme/                    tema de UI Kitten a partir de los colores del vivero
    store/                    zustand: sesión, vivero, carrito (persistido), almacén seguro
    services/                 auth, vivero, catálogo, pedidos, chat, notificaciones
    routes/                   navegadores y tipos de parámetros
    screens/                  auth, inicio, catálogo, producto, carrito, pedidos, chat, perfil
    components/               tarjeta de producto, burbuja de chat
    hooks/                    useSocket
```

## Pantallas

- **Login / Registro** con la marca del vivero.
- **Inicio**: saludo, atajo al chat, categorías, destacados.
- **Catálogo**: búsqueda, filtro por categoría, scroll infinito.
- **Producto**: fotos, precio y oferta, stock, descripción, ficha de cuidados (luz, riego, ubicación, dificultad, mascotas), agregar al carrito, preguntar en el chat.
- **Carrito**: cantidades, retiro o envío, nota, confirmación del pedido.
- **Chat**: con el asistente y con las personas del vivero, en tiempo real.
- **Mi cuenta**: datos, mis pedidos (con cancelación si está pendiente), datos del vivero, cerrar sesión.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Metro |
| `npm run android` | Compila e instala en el emulador o dispositivo |
| `npm run tsc` | Chequeo de tipos |
| `npm test` | Tests unitarios (mappers, carrito) |
| `npm run lint` | ESLint |
| `npm run android:release` | APK de release (requiere firma configurada) |

## Próximo

Fotos en galería, favoritos, "mis plantas" con recordatorios de riego, deep links desde las notificaciones, pago en la app, modo oscuro, iOS.

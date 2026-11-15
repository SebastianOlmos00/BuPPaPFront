# BuPPaP · Frontend
 
Aplicación móvil de transporte público para Antofagasta, desarrollada con React Native y Expo. Permite consultar la red de transporte y visualizar vehículos, y ofrece flujos distintos según el rol: **invitado, pasajero, conductor y administrador**.
 
Proyecto del taller de *Desarrollo de Soluciones Móviles* (UCN, 2026-20). Los requerimientos están definidos en la ERS de VoyBus. El frontend reutiliza la estructura, los servicios y los componentes del frontend desarrollado antes para la cátedra, adaptados a este proyecto.
 
El backend (API REST y tiempo real) vive en el repositorio `Backend` y se llama **VoyBus API**.
 
## Tecnologías
 
- React Native `0.88.1` y React `19.3.0`
- Expo SDK `~58.0.23` con Expo Router
- TypeScript (modo estricto)
- Leaflet, React-Leaflet y OpenStreetMap para el mapa en navegador
- API REST mediante `fetch`
- Almacenamiento seguro del token con los servicios de `storage.ts`
Las versiones exactas están en `package.json`; `npm install` instala todo.
 
## Requisitos previos
 
- Node.js 22.12 o superior y npm.
- El backend VoyBus en ejecución (ver «Puesta en marcha del backend»).
- Un navegador moderno. El mapa funciona en **web**; en Android e iOS se muestra un aviso provisional.
- Opcional: Docker Desktop, para el servidor de correo de pruebas (Mailpit) que entrega el código de verificación del registro.
## Instalación y ejecución del frontend
 
1. Abre una terminal en la carpeta `Frontend` e instala las dependencias:
```bash
npm install
```
 
2. Crea un archivo `.env` en la raíz del frontend (puedes copiar `.env.example`):
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```
 
   - El puerto debe coincidir con el `PORT` del `.env` del backend (3000 por defecto).
   - La URL **incluye** `/api/v1`: los servicios del frontend piden rutas como `/auth/login`.
   - Si pruebas desde un teléfono, `localhost` apunta al teléfono. Usa la IP local del computador donde corre el backend (por ejemplo `http://192.168.1.20:3000/api/v1`).
3. Inicia Expo:
```bash
npx expo start --web
```
 
   Después de cambiar el `.env`, reinicia limpiando la caché, porque las variables `EXPO_PUBLIC_` se fijan al arrancar:
 
```bash
npx expo start --web --clear
```
 
Otros comandos (definidos en `package.json`): `npm run android`, `npm run ios`, `npm run web`, `npm run lint`.
 
## Puesta en marcha del backend
 
El backend usa SQLite en desarrollo. Desde la carpeta `Backend`:
 
```bash
npm install
cp .env.example .env
```
 
Completa en `Backend/.env`:
 
| Variable | Valor |
| --- | --- |
| `PORT` | `3000` (o el puerto que prefieras) |
| `JWT_SECRET` | cadena aleatoria de 64 caracteres hexadecimales |
| `TOTP_ENCRYPTION_KEY` | otra cadena aleatoria de 64 caracteres hexadecimales |
| `ADMIN_SEED_EMAIL` | correo del administrador de prueba, por ejemplo `ceo@voybus.cl` |
| `ADMIN_SEED_PASSWORD` | contraseña de 8 a 15 caracteres con mayúscula, minúscula, número y símbolo |
 
Para generar cada clave aleatoria:
 
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
 
Luego crea las tablas, siembra los datos de prueba y arranca el servidor:
 
```bash
npm run migrate
npm run seed
npm run dev
```
 
El servidor queda en `http://localhost:3000` y su documentación Swagger en `http://localhost:3000/api/docs`. Las migraciones no se ejecutan solas: hay que correr `npm run migrate` y `npm run seed` al menos una vez. El archivo `data/voybus.sqlite` se crea automáticamente.
 
## Cuentas y datos de prueba
 
El seeder crea el catálogo de demostración: 3 líneas con ida y vuelta y sus horarios, 10 paraderos, 10 vehículos, 3 conductores y un turno de hoy con un viaje en curso por conductor.
 
Todas las cuentas sembradas usan como contraseña el valor de `ADMIN_SEED_PASSWORD` que tenía el `.env` del backend al ejecutar `npm run seed`.
 
| Rol | Correo | Pantalla de destino |
| --- | --- | --- |
| Administrador | el valor de `ADMIN_SEED_EMAIL` | Panel de administración |
| Conductor | `carolina.rojas@voybus.cl` | Panel del conductor |
| Conductor | `pedro.soto@voybus.cl` | Panel del conductor |
| Conductor | `ana.fuentes@voybus.cl` | Panel del conductor |
| Pasajero | se crea desde «Crear una cuenta» | Mapa (inicio) |
| Invitado | botón «Continuar como invitado» | Mapa (inicio) |
 
El registro de pasajero envía un código de 6 dígitos por correo. Para leerlo en desarrollo, levanta Mailpit desde `Backend`:
 
```bash
docker compose up -d
```
 
Los correos aparecen en `http://localhost:8025`. Requiere Docker Desktop en ejecución.
 
## Estructura del frontend
 
```text
src/
├── app/
│   ├── (admin)/
│   │   ├── AdminView.tsx          # panel de administración
│   │   └── _layout.tsx
│   ├── (driver)/
│   │   ├── DriverView.tsx         # panel del conductor
│   │   └── _layout.tsx
│   ├── (tabs)/
│   │   ├── home.tsx               # mapa de pasajeros e invitados
│   │   ├── explore.tsx
│   │   └── _layout.tsx
│   ├── (guest)/  (user)/          # heredadas de la cátedra
│   ├── index.tsx                  # redirección según la sesión
│   ├── login.tsx
│   ├── register.tsx               # registro y verificación por código
│   ├── profile.tsx
│   └── _layout.tsx
├── components/
│   ├── map/
│   │   ├── MapView.web.tsx        # mapa Leaflet para navegador
│   │   └── MapView.tsx            # versión provisional para móvil
│   └── MapPanelLayout.tsx         # mapa + panel (conductor y administrador)
├── constants/
├── hooks/
└── services/
    ├── api.ts
    ├── authService.ts
    ├── guestService.ts
    ├── driverService.ts
    ├── adminOpsService.ts
    ├── adminService.ts            # heredado de la cátedra (no se usa en VoyBus)
    ├── session.tsx
    └── storage.ts
```
 
El alias `@/*` apunta a `src/*`.
 
## Sesión y roles
 
El estado de sesión lo administra `SessionProvider` y se consume con el hook `useSession`. Los estados son:
 
- `restoring`: se intenta recuperar una sesión guardada.
- `none`: sin sesión; se muestra el login.
- `guest`: invitado.
- `user`: pasajero autenticado.
- `driver`: conductor.
- `admin`: administrador.
`app/index.tsx` redirige según ese estado: invitado y pasajero van a `/(tabs)/home`, el conductor a `/(driver)/DriverView` y el administrador a `/(admin)/AdminView`. Cada rol tiene su propio grupo de rutas.
 
## Comunicación con el backend
 
Todas las solicitudes pasan por `src/services/api.ts`, que lee la URL base de `EXPO_PUBLIC_API_URL` (nunca está escrita en el código). Maneja errores HTTP, entrega el mensaje que envía el backend (`{ error: { code, message } }`) y avisa a la sesión cuando el token vence (401).
 
| Servicio | Responsabilidad | Rutas principales |
| --- | --- | --- |
| `api.ts` | Cliente HTTP, token y errores | — |
| `authService.ts` | Login, usuario actual, registro y verificación | `/auth/login`, `/me`, `/auth/register`, `/auth/verify`, `/auth/resend-code` |
| `guestService.ts` | Sesión de invitado | `/guest/sessions` |
| `driverService.ts` | Turnos, viajes, estado del vehículo e incidencias | `/driver/shifts`, `/driver/trips`, `/driver/incidents` |
| `adminOpsService.ts` | Resumen de la operación | `/admin/drivers`, `/admin/vehicles`, `/admin/shifts` |
| `session.tsx` | Estado global de sesión | — |
| `storage.ts` | Almacenamiento del token | — |
 
`adminService.ts` pertenece al proyecto de la cátedra (rocas y logros) y no se utiliza en VoyBus.
 
## Estado de implementación
 
| Módulo (ERS) | Estado | Detalle |
| --- | --- | --- |
| Gestión de Acceso y Cuentas | En desarrollo | Funcionan inicio de sesión con correo, acceso como invitado, registro con verificación por código y cierre de sesión con confirmación. |
| Red de transporte | En desarrollo | Mapa en navegador con buses y paraderos de demostración; falta conectarlo a líneas, paraderos y vehículos reales. |
| Viaje y solicitud de parada | Pendiente | Backend implementado; falta la interfaz. |
| Conductor, turnos y vehículos | En desarrollo | Funcionan turno, viajes, estado del vehículo e incidencias; faltan GPS, alertas de parada y justificación de atrasos. |
| Administración de la red y operación | En desarrollo | Panel con resumen de conductores, vehículos y turnos en curso; faltan monitoreo en mapa, gestión y formularios. |
| Notificaciones y avisos | Pendiente | Backend implementado; falta la interfaz. |
 
El backend implementa los seis módulos. El estado de esta tabla se refiere al frontend.
 
## Pendientes conocidos
 
- Recuperación y cambio de contraseña, verificación en dos pasos, acceso con teléfono, Google o Apple.
- Edición de perfil, preferencias e historial personal.
- Consulta de líneas, recorridos y paraderos; favoritos; vehículos en vivo en el mapa.
- Vinculación con un vehículo (QR o código) y solicitud de parada.
- Envío de GPS y alertas de parada en tiempo real (Socket.IO) para el conductor.
- Gestión de líneas, recorridos, conductores, vehículos y turnos desde el panel de administración.
- Avisos para pasajero, conductor y administrador.
- Mapa para Android e iOS (hoy muestra un aviso provisional).
- Las notificaciones push en Android no funcionan en Expo Go; requieren un development build.
## Solución de problemas
 
- **Cambié el `.env` y no se refleja:** reinicia con `npx expo start --web --clear`.
- **«No se pudo conectar con el servidor»:** el backend está apagado o `EXPO_PUBLIC_API_URL` apunta a otra dirección o puerto.
- **«Ruta no encontrada» al iniciar sesión:** falta `/api/v1` al final de `EXPO_PUBLIC_API_URL`.
- **`npm run migrate` dice «Nada pendiente» pero no hay tablas (Windows):** el archivo `src/db/migrator.js` del backend debe convertir las rutas a barras normales. Borra `data/voybus.sqlite*` y repite `npm run migrate` y `npm run seed`.
- **`docker compose up -d` falla:** abre Docker Desktop y espera a que el motor esté en ejecución.
## Variables de entorno y seguridad
 
- Mantén `.env` fuera del control de versiones y comparte solo un `.env.example` sin credenciales:
```env
EXPO_PUBLIC_API_URL=http://localhost:5870/api/v1
```
 
- `EXPO_PUBLIC_API_URL` es pública y se incorpora al bundle de la aplicación. No guardes en ella claves, contraseñas ni tokens.
- No subas al repositorio contraseñas reales: las cuentas de prueba usan la contraseña definida en el `.env` del backend.
- Los tokens de sesión los gestionan los servicios de autenticación y almacenamiento.
## Convenciones del repositorio
 
- Ramas: `main`, `dev` y una rama por integrante (`NombreApellido`).
- Mensajes de commit con *Conventional Commits* (`feat`, `fix`, `style`, `docs`, `refactor`).
## Repositorio
 
Añadir aquí el enlace al repositorio Git.
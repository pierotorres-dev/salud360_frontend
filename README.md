# Salud 360 — Frontend (Angular 17)

Cliente web del sistema **Salud 360**: gestión integral de atención, citas y seguimiento de pacientes del *Centro Integral de Salud "Salud 360"*.

Proyecto del **Grupo 12** — curso *Soluciones Web y Aplicaciones Distribuidas* (SIST1402A), UPN 2026-5 · docente MSc. Víctor Muguerza · evaluación T2.

**Integrantes:** Ernesto Mallqui Espinoza · Britanny Stacy Mendoza Padilla · Piero Sebastián Torres Artica · Samir Angel Beker Ingaruca Panez.

> La API REST (Spring Boot + MySQL) está en el repositorio hermano: **https://github.com/pierotorres-dev/salud360_backend_final** — este cliente necesita el backend arriba para funcionar.

## 1. Tecnologías

| Componente | Versión / uso |
|---|---|
| Angular | 17.3 — componentes *standalone*, Router, Reactive Forms, `HttpClient` |
| TypeScript / RxJS | 5.4 / 7.8 |
| Bootstrap / Bootstrap Icons | 5.3 / 1.x (solo CSS, sin JavaScript de Bootstrap) |
| write-excel-file | 4.x — genera el `.xlsx` de los reportes en el navegador |

Sin Angular Material, librerías de gráficos ni de PDF: los gráficos del dashboard son CSS puro (`conic-gradient` y barras) y el PDF se obtiene con la impresión del navegador (`window.print()` con estilos `@media print`).

## 2. Requisitos previos

- **Node.js** (recomendado 20 LTS; probado con v24) y **npm**.
- **Backend en marcha** en `http://localhost:8080` (ver el README del repositorio `salud360_backend_final`: base de datos, variables de entorno y arranque).

## 3. Cómo levantarlo

```bash
npm install
npm start
```

Abra http://localhost:4200 (`npm start` ejecuta `ng serve`). Para generar la versión de producción: `npx ng build` (queda en `dist/salud360-frontend/browser`; las advertencias de `.form-floating` de Bootstrap son normales).

> **No ejecute `npm audit fix --force`:** actualiza Angular a otra versión mayor y rompe el proyecto. Las alertas de `npm audit` vienen de dependencias de desarrollo de Angular 17 y no afectan a la aplicación.

## 4. Configuración de la API

La URL base de la API sale de un solo lugar: `src/environments/environment.ts` (producción) y `environment.development.ts` (desarrollo, el que usa `npm start`):

```ts
export const environment = { production: false, apiUrl: 'http://localhost:8080/api' };
```

Ningún componente escribe URLs: todos pasan por un servicio de `core/services`. Si el puerto 8080 está ocupado y arranca el backend con otro (`SERVER_PORT=8081`), cambie `apiUrl` aquí (solo en su máquina). El backend acepta peticiones únicamente desde el origen `http://localhost:4200` (CORS).

## 5. Usuarios de prueba

> **Solo para pruebas y demostraciones.** Cambie o elimine estas cuentas antes de cualquier uso real.

| Rol | Correo | Contraseña | Menú |
|---|---|---|---|
| ADMINISTRADOR | `admin@salud360.pe` | `Admin123*` | Dashboard, Pacientes, Profesionales, Citas, Atenciones, Seguimiento, Reportes, Usuarios |
| RECEPCIONISTA | `recepcion@salud360.pe` | `Recep123*` | Dashboard, Pacientes, Profesionales, Citas |
| PROFESIONAL | `profesional@salud360.pe` | `Prof123*` | Dashboard, Citas, Atenciones, Seguimiento |
| PACIENTE | `paciente@salud360.pe` | `Paciente123*` | Mi información |

Si un rol escribe en la barra de direcciones una ruta que no le corresponde (por ejemplo un profesional en `/reportes`), el `roleGuard` lo regresa a su pantalla de inicio con la alerta *"Acceso restringido para su rol"*; el backend, además, responde 403.

## 6. Estructura de `src/app`

```
src/app/
├─ app.routes.ts             rutas; cada una declara los roles que pueden entrar (authGuard + roleGuard)
├─ app.config.ts             HttpClient con el interceptor de autenticación
├─ core/
│  ├─ models/                modelos que copian los campos del JSON de la API
│  ├─ services/              un servicio por recurso (auth, paciente, profesional, cita, atencion, ...)
│  ├─ interceptors/          auth.interceptor.ts: agrega el token y, ante un 401, cierra la sesión
│  ├─ guards/                auth.guard.ts, role.guard.ts
│  └─ utils/                 fechas, http-error (traduce 0/400/403/409 a mensajes) y exportar (Excel/PDF)
├─ layout/                   barra lateral por rol y barra superior
├─ shared/                   paginación, tarjeta de indicador e historial del paciente
└─ pages/                    un componente por pantalla: login, dashboard, pacientes, profesionales,
                             citas, atenciones, seguimiento, reportes, usuarios
```

## 7. Cómo fluye el dato

Pantalla → servicio (`HttpClient`) → interceptor (agrega `Authorization: Bearer <token>`) → API → respuesta → pantalla. Por ejemplo, al guardar una cita:

1. `cita-form.component.ts` arma el `CitaRequest` desde el formulario reactivo (todos los campos son obligatorios y *Guardar* se deshabilita mientras sea inválido).
2. `cita.service.ts` hace `POST /api/citas`.
3. Si responde **201**, se navega a la agenda con el código de la cita (`CT-0017`) resaltado.
4. Si responde **409** (horario ocupado), se muestra el mensaje del servidor en una alerta roja, la hora se marca como inválida y se vuelve a pedir la disponibilidad, sin recargar la página. El resto de errores (sin conexión, 400, 403) se traducen en `core/utils/http-error.ts`.

## 8. Reportes: Excel y PDF

El módulo *Reportes* (solo ADMINISTRADOR) tiene tres pestañas — citas por periodo, atenciones realizadas e indicadores generales — con filtros por fecha, profesional, servicio y estado. **Descargar Excel** genera un `.xlsx` real en el navegador; **Descargar PDF** abre la vista de impresión (sin menú) para guardar como PDF.

## 9. Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| "No se pudo conectar con el servidor" | El backend no está arriba, o usa otro puerto | Levante el backend (ver su README) o ajuste `apiUrl` |
| Las peticiones se bloquean (CORS) | El frontend no se abre desde `http://localhost:4200` | Use esa dirección exacta |
| `npm ERR! EPERM` / `EBUSY` | OneDrive bloquea archivos | Pause OneDrive y repita `npm install` |
| La fecha de hoy sale como mañana (de noche) | Uso de `toISOString()` (UTC) | El proyecto usa `hoyISO()` de `core/utils/fechas.ts` |

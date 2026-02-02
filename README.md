# Proyecto: Reto LoL — Web App (Next.js + Vercel + Turso + Clerk)

## Objetivo
Migrar un “reto con amigos” que hoy se gestiona en Excel a una **web** desplegada en **Vercel**, con **frontend y backend en el mismo proyecto Next.js**.

## MVP actual
- **Home pública** con listado de **grupos públicos**.
- **Página de grupo** `/g/[slug]` con tabla read-only y ordenación (winrate, rango, LP, actualización).
- **Sync público** en `/g/[slug]` con botón manual (cooldown 1 min).
- **Panel admin** `/admin` con **Clerk** para:
  - Crear grupos públicos.
  - Añadir / quitar jugadores (Riot ID + región).
  - Configurar intervalos de sync y cooldown manual.
  - Seleccionar cola (Solo/Duo o Flex) por jugador.
  - Ejecutar sync manual (respetando cooldown).
- **Sync automático** desde la API de Riot (cola configurable, región por jugador) usando **cron en GitHub Actions**.
- Métricas derivadas: `winrate` y `games` se calculan a partir de `wins/losses`.

## Rutas clave
- `/` — listado de grupos públicos
- `/g/[slug]` — tabla del grupo
- `/admin` — panel admin (requiere login)
- `/api/sync` — endpoint para cron (sync incremental)
- `/hello-world` — ruta de verificación

## Modelo de datos (resumen)
- `groups` — grupos públicos con configuración de sync.
- `players` — datos actuales del jugador.
- `group_players` — relación N:N jugador ↔ grupo.
- `rank_snapshots` — histórico por sync.

## Stack
### App
- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**

### Autenticación
- **Clerk** (Google/GitHub login)

### Base de datos
- **Turso (SQLite remoto)**
- **Driver**: `@libsql/client`
- **ORM / migrations**: **Drizzle ORM**

### Calidad / Tooling
- **Biome** (lint + format)
- **Jest** + **Testing Library** (unit/integration)
- **Playwright** (E2E + screenshots)
- **GitHub Actions** (CI)
- **Bun** (scripts)

## Comandos
- `bun dev` — entorno local
- `bun run build` — build de producción
- `bun run start` — servir build local
- `bun run lint` — Biome check
- `bun run format` — Biome format
- `bun run test` — Jest
- `bun run test:watch` — Jest en watch
- `bun run test:coverage` — cobertura
- `bun run test:e2e` — Playwright
- `bun run db:generate` — generar migraciones Drizzle
- `bun run db:migrate` — aplicar migraciones
- `node scripts/capture-screens.mjs` — capturas Playwright (desktop + mobile)

> Nota: la primera vez ejecutar `bunx playwright install` para descargar navegadores.

## Variables de entorno
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `RIOT_API_KEY`
- `RIOT_USER_AGENT` (opcional, default Chrome UA para evitar 403/1010)
- `RIOT_ACCEPT_LANGUAGE` (opcional)
- `CRON_SECRET` (opcional, si quieres proteger `/api/sync` con token)
- `CRON_SYNC_URL` (opcional, URL usada por GitHub Actions para el cron)

## CI/CD y calidad
- **GitHub Actions**: `.github/workflows/ci.yml` ejecuta `lint`, `test`, `build` y `test:e2e` en cada push y PR.
- **Cron (GitHub Actions)**: `.github/workflows/cron-sync.yml` llama a `/api/sync` cada 10 minutos.
- **Hooks locales** (simple-git-hooks):
  - `pre-commit`: `bun run lint && bun run test`
  - `commit-msg`: `bunx commitlint --edit $1`
  - `pre-push`: `bun run lint && bun run test && bun run build && bun run test:e2e`
- Para bloquear merges sin checks verdes, configurar *Branch Protection Rules* en GitHub para exigir el workflow de CI.

## Deployment
- Producción: `https://lol.miguelaguiar.dev`

## Fase 2 (futuro)
- **Grupos privados** (requieren autenticación y permisos).
- **Invitaciones** a grupos + roles (owner/admin/member).
- **Multi-región** y selección de cola.
- Admin avanzado (notas/objetivos/ediciones manuales más completas).

## Metodología de código / estándares
- Funciones cortas: máximo 2 argumentos; usar types/structs/interfaces como argumentos.
- Funciones que manejen solo una funcionalidad. Pocas líneas de código por función.
- Testing. Test coverage 70%.
- Menos código, más calidad. Más funciones, menos líneas por función.
- En el frontend, estructuras pequeñas; nada de árboles infinitos de divs.
- Crear componentes configurables, máxima reutilización.
- Todo componentizado.
- Mientras menos librerías externas, mejor. Mientras más simple el código, mejor. Nada de overengineering ni puzzles. Código limpio.
- Usamos siempre TSDoc.
- `docs/DEV.md` archivo en el que guardamos documentación estructurada del proyecto; cada vez que se haga una edición en la estructura de carpetas o funcionalidades, editamos la documentación, listamos las funciones de cada archivo o documentación corta de lo que hace y para qué sirve.
- Frontend mobile-first. Enfocamos la responsividad en mobile ultra necesaria.
- Nada de estilos ultra locos; algo sencillo, sin complicarnos. En un futuro iremos implementando mejoras.
- Código ultra mantenible, fácil de editar, mejorar e implementar.
- Código abierto a futuras implementaciones; nada de código imposible de cambiar. Usamos la mayoría de parámetros posibles para cambiar funcionalidades con variables globales y cosas del estilo.

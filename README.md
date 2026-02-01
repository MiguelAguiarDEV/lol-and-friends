# Proyecto: Reto LoL — Web App (Next.js + Vercel + Turso + Clerk)

## Objetivo
Migrar un “reto con amigos” que hoy se gestiona en Excel a una **web** desplegada en **Vercel**, con **frontend y backend en el mismo proyecto Next.js**.

## MVP actual
- **Home pública** con listado de **grupos públicos**.
- **Página de grupo** `/g/[slug]` con tabla read-only y ordenación (winrate, rango, LP, actualización).
- **Panel admin** `/admin` con **Clerk** para:
  - Crear grupos públicos.
  - Añadir / quitar jugadores (Riot ID + región).
  - Configurar intervalos de sync y cooldown manual.
  - Ejecutar sync manual (respetando cooldown).
- **Sync automático** desde la API de Riot (Solo/Duo, EUW) usando **cron en Vercel**.
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
- `CRON_SECRET` (opcional, si quieres proteger `/api/sync` con token)

## CI/CD y calidad
- **GitHub Actions**: `.github/workflows/ci.yml` ejecuta `lint`, `test`, `build` y `test:e2e` en cada push y PR.
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
- Funciones cortas: maximo 2 argumentos, usar Types/Structs/Interfaces como argumentos.
- Funciones que manegen solo una funcionalidad. Pocas lineas de codigo por funcion.
- Testing. Test coverage 70%.
- Menos codigo mas calidad. mas funciones menos lineas por funcion.
- En el frontend estructuras pequenas nada de arboles infinitos de divs.
- Crear componentes configurables, maxima reutilizacion.
- Todo componetizado.
- Mientras menos librerias externas mejor. mientras mas simple el codigo mejor. nada de overengeeniring ni puzzles. Codigo limpio.
- Usamos siempre TsDocs.
- `docs/DEV.md` archivo en el que guadamos documentacion estructurada del proyecto, cada vez que se haga un edcion en la estructura de carpetas o funcionalidade editamos la documentacion, listamos las fucnines de cada archivo o documentacion corta de lo que hacer y para que sirve.
- Frontend Mobile First. Enfocamos la responsividad en mobile ultra necesaria.
- Nada de estilos ultra locos, algo sencillo, sin complicarnos, en un futuro iremos implementando mejoras.
- Codigo ultra mantenimble, facil de editar, mejorar e implementar.
- Coddigo abierto a futuras implementacjiones nada de codigo imposible de cambiar. usamos la mayoria de parametros posibles para cambiar funcionalidades con variables globales y cosas del estilo.

# DEV

## Descripción
Proyecto Next.js (App Router) para el reto LoL. Usa Turso + Drizzle para datos y Clerk para autenticación.

## Estructura
- `app/` — rutas y UI (Server Components por defecto)
  - `page.tsx` — home con grupos públicos
  - `g/[slug]/page.tsx` — vista read-only del grupo
  - `admin/` — panel admin y Server Actions
  - `api/sync/route.ts` — cron de sync Riot
  - `hello-world/page.tsx` — verificación de funcionamiento
- `components/groups/` — tarjetas/listado de grupos
- `components/admin/` — bloques de UI para panel admin (crear grupo, overview y detalle)
- `components/group/` — bloques de UI para vista de grupo público
- `components/layout/` — layout reutilizable (navbar, shell, headers, cards)
- `components/players/` — tabla pública modular + orden + edición inline admin
- `components/ui/` — primitives UI reutilizables (`button`, `modal`, `input`, `label`, `select`, `textarea`, `badge`)
- `components/theme/theme-switcher.tsx` — selector de tema claro/oscuro
- `lib/db/` — cliente, schema y queries (Drizzle)
  - `migrations/` — migraciones generadas
- `lib/riot/` — API, regiones, colas y lógica de sync
- `lib/players/` — métricas y ranking
- `lib/utils/` — helpers (slug/time)
- `docs/screenshots/` — capturas UI (Playwright)

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

## Variables de entorno
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `RIOT_API_KEY`
- `RIOT_USER_AGENT` (opcional, default Chrome UA para evitar 403/1010)
- `RIOT_ACCEPT_LANGUAGE` (opcional)
- `CRON_SECRET` (opcional)
- `CRON_SYNC_URL` (opcional, URL usada por GitHub Actions para el cron)

## Testing
- Unit/Integration: Jest + Testing Library
- E2E Frontend: Playwright
- Configuración: `jest.config.mjs`, `jest.setup.ts`, `playwright.config.ts`
- Nota: correr `bunx playwright install` la primera vez para descargar navegadores.

## CI/CD y hooks
- GitHub Actions: `.github/workflows/ci.yml` ejecuta lint/test/build/test:e2e en push y PR.
- Cron (GitHub Actions): `.github/workflows/cron-sync.yml` llama a `/api/sync` cada 10 minutos.
- Hooks locales (simple-git-hooks):
  - `pre-commit`: `bun run lint && bun run test`
  - `commit-msg`: `bunx commitlint --edit $1`
  - `pre-push`: `bun run lint && bun run test && bun run build && bun run test:e2e`

## Sync Riot
- Endpoint: `GET /api/sync`
- Cron en GitHub Actions cada 10 minutos.
- Sync incremental por lotes (no actualiza todo a la vez).
- Manual sync desde `/admin` con cooldown configurable.
- Cola y región seleccionables desde admin (cola por jugador).
- Reintentos con backoff cuando hay rate limit (429).
- Botón público en `/g/[slug]` (cooldown 1 min).
- Resolución de PUUID con fallback: Riot ID y, si falla, búsqueda por nombre de summoner.
- Fallback de cola en ranked: si la cola preferida no existe, usa otra entrada disponible (por ejemplo Flex).

## UI/UX reciente
- Tema de la app con selector global `Claro/Oscuro` y tokens de color semánticos en `app/globals.css`.
- Navbar global con navegación principal, switch de tema con iconos y menú de cuenta con avatar.
- Navbar: switch de tema por icono circular (sin bloque cuadrado en hover).
- Tabla pública: ordenación por click en cabeceras (`LP`, `Liga`, `Winrate`, `Últ. actualización`) con soporte asc/desc e indicadores visuales.
- Modal de “Añadir jugador” en admin: feedback visible de éxito/error al enviar.
- Vista pública de grupo (`/g/[slug]`): si el usuario es admin, puede editar intervalo de sync y cooldown desde la propia página.
- Vista pública de grupo (`/g/[slug]`): si el usuario es admin, puede editar `objetivo`, `checkpoint mensual` y `notas` de cada jugador desde la tabla.
- Panel admin: creación de grupo por modal activado desde botón.
- Cooldown manual mínimo configurable: `0.5` minutos (30 segundos).
- Admin UI refactorizada a componentes: cards de estadísticas, directorio responsive (cards/table) y formularios consistentes con primitives.

## Screenshots (Playwright)
- Ejecutar: `node scripts/capture-screens.mjs`
- Genera: `docs/screenshots/groups-home-desktop.png` y `docs/screenshots/groups-home-mobile.png`
- Usa mock data con `SCREENSHOT_MODE=true` (por defecto en el script).
- Opcional: `SCREENSHOT_SEED=true` para incluir capturas de `/g/[slug]` desde la DB.

## Workflow frontend
1. Implementar UI (mobile-first).
2. Verificar **responsividad** en `sm/md/lg/xl` (overflow y legibilidad).
3. Confirmar que la información clave se muestra completa en mobile.
4. Generar capturas Playwright (desktop + mobile).
5. Adjuntar capturas en la PR (raw URLs) y describir el flujo de uso.

## Deployment
- Producción: `https://lol.miguelaguiar.dev`

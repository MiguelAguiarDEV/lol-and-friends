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
- `components/players/players-table.tsx` — tabla + cards mobile
- `lib/db/` — cliente, schema y queries (Drizzle)
  - `migrations/` — migraciones generadas
- `lib/riot/` — API, regiones y lógica de sync
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
- `CRON_SECRET` (opcional)

## Testing
- Unit/Integration: Jest + Testing Library
- E2E Frontend: Playwright
- Configuración: `jest.config.mjs`, `jest.setup.ts`, `playwright.config.ts`
- Nota: correr `bunx playwright install` la primera vez para descargar navegadores.

## CI/CD y hooks
- GitHub Actions: `.github/workflows/ci.yml` ejecuta lint/test/build/test:e2e en push y PR.
- Hooks locales (simple-git-hooks):
  - `pre-commit`: `bun run lint && bun run test`
  - `commit-msg`: `bunx commitlint --edit $1`
  - `pre-push`: `bun run lint && bun run test && bun run build && bun run test:e2e`

## Sync Riot
- Endpoint: `GET /api/sync`
- Cron en `vercel.json` cada 10 minutos.
- Sync incremental por lotes (no actualiza todo a la vez).
- Manual sync desde `/admin` con cooldown configurable.

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

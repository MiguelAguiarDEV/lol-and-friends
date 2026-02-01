# DEV

## Descripción
Proyecto Next.js (App Router) para el reto LoL. La ruta inicial de verificación es `/hello-world`.

## Estructura inicial
- `app/` — rutas y UI (Server Components por defecto)
  - `page.tsx` — vista pública (read-only)
  - `hello-world/page.tsx` — verificación de funcionamiento
- `components/` — UI reutilizable (cuando se agregue)
- `components/players/players-table.tsx` — tabla pública (read-only)
- `lib/` — lógica de dominio, DB y validaciones (cuando se agregue)
- `lib/players/` — mocks y métricas del dominio players
- `lib/types/` — tipos compartidos del dominio
- `docs/` — documentación viva
- `docs/screenshots/` — capturas de la UI (Playwright)
- `tests/` — unit/integration (Jest)
- `tests-e2e/` — e2e (Playwright)

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

## Testing
- Unit/Integration: Jest + Testing Library
- E2E Frontend: Playwright
- Configuración: `jest.config.mjs`, `jest.setup.ts`, `playwright.config.ts`
 - Nota: correr `bunx playwright install` la primera vez para descargar navegadores.

## CI/CD y hooks
- GitHub Actions: `.github/workflows/ci.yml` ejecuta lint/test/build/test:e2e en push y PR.
- Hooks locales (simple-git-hooks):
  - `pre-commit`: `bun run lint && bun run test`
  - `pre-push`: `bun run lint && bun run test && bun run build && bun run test:e2e`
- Para bloquear merges sin checks verdes, configurar Branch Protection en GitHub.

## Screenshots (Playwright)
- Ejecutar: `node scripts/capture-screens.mjs`
- Genera: `docs/screenshots/public-table-desktop.png` y `docs/screenshots/public-table-mobile.png`

## Notas
- Documentar cualquier cambio de estructura o nuevas responsabilidades aquí.

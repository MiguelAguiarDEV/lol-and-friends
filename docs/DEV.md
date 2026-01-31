# DEV

## Descripción
Proyecto Next.js (App Router) para el reto LoL. La ruta inicial de verificación es `/hello-world`.

## Estructura inicial
- `app/` — rutas y UI (Server Components por defecto)
  - `page.tsx` — vista pública (read-only)
  - `hello-world/page.tsx` — verificación de funcionamiento
- `components/` — UI reutilizable (cuando se agregue)
- `lib/` — lógica de dominio, DB y validaciones (cuando se agregue)
- `docs/` — documentación viva
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
- GitHub Actions: `.github/workflows/ci.yml` ejecuta lint/test/build en push y PR.
- Hooks locales (simple-git-hooks):
  - `pre-commit`: `bun run lint`
  - `pre-push`: `bun run lint && bun run test && bun run build`
- Para bloquear merges sin checks verdes, configurar Branch Protection en GitHub.

## Notas
- Documentar cualquier cambio de estructura o nuevas responsabilidades aquí.

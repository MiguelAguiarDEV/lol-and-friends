# Repository Guidelines (AGENTS)

Este repo implementa **Reto LoL**, una web full-stack con **Next.js (App Router)** desplegada en **Vercel**, usando **Turso (SQLite remoto)** como base de datos, **Clerk** para autenticación y **Riot API** para sync.

---

## Project Structure & Module Organization

Estructura recomendada (alineada con Next.js App Router):

app/
  page.tsx # Home con grupos públicos
  g/
    [slug]/page.tsx # Tabla pública por grupo
  hello-world/
    page.tsx # Ruta de verificación /hello-world
  admin/
    page.tsx # Panel admin (protegido)
    actions.ts # Server Actions (mutaciones admin)
  api/
    sync/route.ts # Cron sync Riot
components/
  groups/ # Listado de grupos
  players/ # Tabla + cards de jugadores
lib/
  db/
    client.ts # Cliente Turso (@libsql/client) + Drizzle
    schema.ts # Drizzle schema
    queries.ts # Consultas reutilizables
    migrations/ # Migraciones Drizzle
  riot/ # API + sync + regiones
  players/ # Métricas + ranking
  utils/ # helpers (slug/time)
  logger.ts # logger estructurado
docs/
  DEV.md # Documentación viva del proyecto

tests/ # Unit/Integration tests (Jest)
tests-e2e/ # E2E tests (Playwright)

**Reglas de organización**
- **SQL/DB solo en `lib/db`** (no queries sueltas en componentes).
- `app/*` orquesta: UI + llamadas a queries/actions.
- `components/*` contiene UI reutilizable (mobile-first).
- Mantener el dominio “players” separado.

---

## Build, Test, and Development Commands

### Desarrollo
- `bun dev` — inicia entorno local
- `bun run build` — build de producción
- `bun run start` — servir build local

### Calidad
- `bun run lint` — Biome check
- `bun run format` — Biome format

### Testing
- `bun run test` — Jest
- `bun run test:watch` — Jest en watch
- `bun run test:coverage` — cobertura
- `bun run test:e2e` — Playwright

### Base de datos (Drizzle)
- `bun run db:generate` — generar migraciones
- `bun run db:migrate` — aplicar migraciones

> Nota: Si cambian scripts/commands, **docs/DEV.md**.

---

## CI/CD y Git Hooks

- **GitHub Actions**: `.github/workflows/ci.yml` corre `lint`, `test`, `build` y `test:e2e` en push/PR.
- **Cron (GitHub Actions)**: `.github/workflows/cron-sync.yml` llama a `/api/sync` cada 10 minutos.
- **Hooks locales** (simple-git-hooks):
  - `pre-commit`: `bun run lint && bun run test`
  - `commit-msg`: `bunx commitlint --edit $1`
  - `pre-push`: `bun run lint && bun run test && bun run build && bun run test:e2e`
- Recomendación: activar *Branch Protection Rules* en GitHub para exigir checks verdes antes de merge.

---

## Coding Style & Naming Conventions

### Principios (del README)
- **Menos código, más calidad**.
- Funciones **pequeñas y con una sola responsabilidad**.
- Evitar overengineering y “puzzles”; preferir código obvio.
- Minimizar dependencias externas.
- **Mobile-first** y layouts simples (sin árboles infinitos de `div`).

### Reglas prácticas
- **Máximo 2 argumentos por función**. Si hace falta más, usar un `object` tipado.
- **TsDoc obligatorio** para funciones públicas/utilitarias y módulos clave.
- Componentes:
  - `PascalCase` para React components.
  - Archivos en `kebab-case.ts/tsx` (ej: `players-table.tsx`).
- Derivados:
  - `winrate` y `games` se **calculan** (no persistir salvo necesidad futura).

---

## Backend Pattern (Next.js)

- **Server Components por defecto**.
- **Client Components solo cuando sea necesario**.
- Mutaciones:
  - **Server Actions** para CRUD interno del admin.
  - `app/api/*` solo para jobs/cron.
- Acceso a DB **solo en servidor**.

---

## Auth & Authorization (Clerk)

- Clerk protege autenticación (Google/GitHub).
- `/admin` requiere sesión válida.
- MVP actual: **solo grupos públicos**; privados/invitaciones quedan para futuro.

---

## Testing Guidelines

Objetivo: **>= 70% coverage** en el core de negocio (queries, sync, ranking).

- Unit/Integration: **Jest** + **Testing Library**
- E2E Frontend: **Playwright**
- Convenciones:
  - `*.test.ts` / `*.test.tsx`
  - `tests-e2e/*.spec.ts`

---

## Commit & Pull Request Guidelines

- Commits: **Conventional Commits** (ej: `feat(admin): add group form`).
- PRs:
  - Pequeños, enfocados.
  - Incluir “cómo probar” + screenshots si hay UI.
  - No mergear si falla `lint` o `build` o `test`.

---

## Documentation Rules (docs/DEV.md)

`docs/DEV.md` es documentación viva. Se actualiza cuando:
- cambia la estructura de carpetas,
- se añade una feature relevante,
- se introduce una convención nueva,
- se agregan scripts/commands.

---

## Environment Variables (mínimas)

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `RIOT_API_KEY`
- `CRON_SECRET` (opcional)

# Repository Guidelines (AGENTS)

Este repo implementa **Reto LoL**, una web full-stack con **Next.js (App Router)** desplegada en **Vercel**, usando **Turso (SQLite remoto)** como base de datos y **Clerk** para autenticación.  
El objetivo es reemplazar el seguimiento en Excel por una tabla pública + panel admin para editar datos.

---

## Project Structure & Module Organization

Estructura recomendada (alineada con Next.js App Router):

app/
  page.tsx # Vista pública (read-only)
  hello-world/
    page.tsx # Ruta de verificación /hello-world
  admin/
    page.tsx # Panel admin (protegido)
    actions.ts # Server Actions (mutaciones admin)
  api/ # Route Handlers (solo si hace falta: jobs/webhooks)
components/
  ui/ # shadcn/ui
  players/ # Componentes del dominio "players" (tabla, forms, etc.)
lib/
  db/
    client.ts # Cliente Turso (@libsql/client) + Drizzle
    schema.ts # Drizzle schema (players, rank_snapshots)
    queries.ts # Consultas reutilizables (select/update/insert)
  validations/
    players.ts # Zod schemas para inputs (admin)
  auth/
    admin.ts # Helpers: allowlist, guards de admin
  types/
    index.ts # Tipos compartidos (cuando aplique)
docs/
  DEV.md # Documentación viva del proyecto (estructura y responsabilidades)
tests/ # Unit/Integration tests (Jest)
tests-e2e/ # E2E tests (Playwright)
jest.config.ts # Configuración de Jest (next/jest)
jest.setup.ts # Setup de Testing Library
playwright.config.ts # Configuración de Playwright


**Reglas de organización**
- **SQL/DB solo en `lib/db`** (no queries sueltas en componentes).
- **Validación Zod solo en `lib/validations`**.
- `app/*` orquesta: UI + llamadas a queries/actions.
- `components/*` contiene UI reutilizable (mobile-first).
- Mantener el dominio “players” separado (evitar carpetas genéricas enormes).

---

## Build, Test, and Development Commands

### Desarrollo
- `bun dev` — inicia entorno local
- `bun run build` — build de producción
- `bun run start` — servir build local (si aplica)

### Calidad
- `bun run lint` — Biome check
- `bun run format` — Biome format

### Testing
- `bun run test` — Jest
- `bun run test:watch` — Jest en watch
- `bun run test:coverage` — cobertura
- `bun run test:e2e` — Playwright

### Base de datos (Drizzle)
- Pendiente: definir scripts `db:generate` y `db:migrate` cuando se integre Drizzle.

> Nota: Si cambian scripts/commands, **docs/DEV.md**.

---

## CI/CD y Git Hooks

- **GitHub Actions**: `.github/workflows/ci.yml` corre `lint`, `test`, `build` y `test:e2e` en push/PR.
- **Hooks locales** (simple-git-hooks):
  - `pre-commit`: `bun run lint`
  - `pre-push`: `bun run lint && bun run test && bun run build && bun run test:e2e`
- Recomendación: activar *Branch Protection Rules* en GitHub para exigir checks verdes antes de merge.

## Coding Style & Naming Conventions

### Principios (del README)
- **Menos código, más calidad**.
- Funciones **pequeñas y con una sola responsabilidad**.
- Evitar overengineering y “puzzles”; preferir código obvio.
- Minimizar dependencias externas.
- **Mobile-first** y layouts simples (sin árboles infinitos de `div`).

### Reglas prácticas
- **Máximo 2 argumentos por función**. Si hace falta más, usar un `object` tipado:
  - `type Params = { ... }` / `interface Params { ... }`
- **TsDoc obligatorio** para funciones públicas/utilitarias y módulos clave.
- Componentes:
  - `PascalCase` para React components.
  - Archivos en `kebab-case.ts/tsx` (ej: `players-table.tsx`).
- Validación de inputs:
  - Toda mutación (Server Action / Route Handler) valida con **Zod**.
- Derivados:
  - `winrate` y `games` se **calculan** (no persistir salvo necesidad futura).

---

## Backend Pattern (Next.js)

- **Server Components por defecto**.
- **Client Components solo cuando sea necesario** (formularios, interactividad).
- Mutaciones:
  - **Server Actions** para CRUD interno del admin.
  - `app/api/*` solo si se necesita para jobs o integraciones futuras.
- Acceso a DB **solo en servidor**.

---

## Auth & Authorization (Clerk)

- Clerk protege autenticación (Google/GitHub).
- `/admin` requiere:
  1) Sesión válida (Clerk)
  2) Allowlist por email (env: `ADMIN_EMAILS`)
- **Cada operación de escritura** debe re-verificar permisos en servidor.
  - No confiar en “ocultar UI”.

---

## Testing Guidelines

Objetivo: **>= 70% coverage** en el core de negocio (queries, validación, acciones).

- Unit/Integration: **Jest** + **Testing Library**
- E2E Frontend: **Playwright**
- Tipos de test:
  - Unit: validaciones Zod, helpers de auth, lógica de ranking/ordenación.
  - Integration (mínimo): actions/queries con DB de test o mocks controlados.
  - E2E: flujos críticos de UI (público y admin).
- Convenciones:
  - `*.test.ts` / `*.test.tsx`
  - `tests-e2e/*.spec.ts`
- Comandos:
  - `bun run test`
  - `bun run test:watch`
  - `bun run test:coverage`
  - `bun run test:e2e`

---

## Commit & Pull Request Guidelines

- Commits: (ej: `[FEAT](TITULO DEL FEAT) Info del desarrollo `).
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

Debe incluir:
- descripción corta de cada carpeta/archivo clave,
- responsabilidades y flujos principales (public view, admin edits),
- notas sobre DB schema y migraciones.

---

## Environment Variables (mínimas)

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `ADMIN_EMAILS` (csv: `a@x.com,b@y.com`)

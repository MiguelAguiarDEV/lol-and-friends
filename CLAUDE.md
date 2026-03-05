# CLAUDE.md

## Project Overview

**Reto LoL** — A full-stack web app for managing and comparing League of Legends rankings among friends. Migrates a "challenge with friends" from Excel to a web app with public group visibility, admin dashboard, and automatic sync from Riot API.

- **Live**: https://lol.miguelaguiar.dev
- **Stack**: Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4
- **Database**: Turso (SQLite remote) via Drizzle ORM
- **Auth**: Clerk (Google/GitHub OAuth) with email-based admin allowlist
- **External API**: Riot Games API (League of Legends ranked data)
- **Package manager / runner**: Bun
- **Node.js**: >= 20.9.0

---

## Commands

### Development
```bash
bun dev              # Start dev server (port 3000)
bun run build        # Production build
bun run start        # Serve production build
```

### Code Quality
```bash
bun run lint         # Biome check (lint + format check)
bun run format       # Biome format --write
```

### Testing
```bash
bun run test         # Jest unit/integration tests
bun run test:watch   # Jest watch mode
bun run test:coverage # Jest coverage report
bun run test:e2e     # Playwright E2E tests (Chromium)
bun run test:e2e:ui  # Playwright UI mode
```

First-time E2E setup: `bunx playwright install`

### Database
```bash
bun run db:generate  # Generate Drizzle migrations
bun run db:migrate   # Apply pending migrations
```

---

## Project Structure

```
app/                          # Next.js App Router pages & API
  page.tsx                    # Home: public groups list
  g/[slug]/                   # Public group page (read-only table)
    page.tsx, actions.ts      # Page + server actions for admin edits
  admin/                      # Admin panel (Clerk protected)
    page.tsx, actions.ts      # Dashboard + server actions
  api/sync/route.ts           # Cron sync endpoint (Bearer auth)
  sign-in/, sign-up/          # Clerk auth routes
  profile/                    # User profile
  hello-world/                # Health check

components/                   # Reusable React components
  ui/                         # Primitives (button, input, modal, select, etc.)
  groups/, group/             # Public group display components
  admin/                      # Admin panel UI
  players/                    # Players table + cards (sortable, editable)
  layout/                     # Navbar, page-shell, headers, cards
  theme/                      # Theme switcher (light/dark)

lib/                          # Core business logic
  db/
    client.ts                 # Turso + Drizzle initialization
    schema.ts                 # Drizzle ORM schema
    queries.ts                # All reusable DB queries (single source of truth)
    migrations/               # Generated Drizzle migrations
  auth/admin.ts               # Email-based admin allowlist
  riot/
    api.ts                    # Riot API client + custom error types
    sync.ts                   # Sync orchestration (incremental batches, retry)
    regions.ts, queues.ts     # Region mappings, queue types
    sync-attempts.ts          # Retry backoff on rate limits (429)
  players/
    metrics.ts                # Winrate, games calculations
    rank.ts                   # Rank tier scoring for sorting
    mock.ts                   # Screenshot mode mock data
  types/                      # Shared domain types
  validations/admin.ts        # Zod schemas for admin forms
  utils/                      # Helpers (slug, time)
  logger.ts                   # Structured JSON logging

tests/                        # Unit/integration tests (Jest)
tests-e2e/                    # E2E tests (Playwright)
docs/DEV.md                   # Living architecture documentation
scripts/                      # Automation scripts (screenshot capture)
```

---

## Architecture Conventions

### Server-First
- **Server Components by default**. Only use `'use client'` when interactivity requires it.
- **Server Actions** (`app/*/actions.ts`) for all mutations (admin CRUD).
- **API routes** (`app/api/*`) only for jobs/cron/webhooks.
- DB access is **server-side only**, always through `lib/db/queries.ts`.

### Code Style
- **Biome** for linting and formatting (not ESLint/Prettier).
- Components: `PascalCase` names, `kebab-case` filenames (e.g., `PlayersTable` in `players-table.tsx`).
- Max 2 function arguments — use a typed object for more.
- Small, single-responsibility functions. Avoid overengineering.
- TSDoc on public/utility functions.
- Mobile-first responsive design. Cards on mobile, tables on desktop.
- Tailwind CSS 4 with semantic color tokens defined in `app/globals.css`.

### Database
- Schema defined with Drizzle ORM in `lib/db/schema.ts`.
- Tables: `users`, `groups`, `groupMembers`, `players`, `groupPlayers`, `rankSnapshots`.
- **All queries live in `lib/db/queries.ts`** — never write loose queries in components.
- Migrations generated via `bun run db:generate`, applied via `bun run db:migrate`.

### Auth & Admin
- Clerk handles authentication (Google/GitHub OAuth).
- Admin access controlled by `ADMIN_EMAILS` env var (CSV of allowed emails).
- Check admin status via `isAdminEmail()` from `lib/auth/admin.ts`.
- Currently only public groups; private groups/invitations planned for future.

### Riot API Sync
- Incremental batch sync with retry logic and backoff on 429 rate limits.
- Custom error types: `RiotApiError`, `RiotRateLimitError`.
- Manual sync from admin panel (configurable cooldown, default 30 min).
- Public sync button with 1 min cooldown.
- Cron endpoint at `GET /api/sync` requires `Authorization: Bearer <CRON_SECRET>`.

### Logging
- Use `lib/logger.ts` for structured JSON logging.
- Methods: `logger.info()`, `logger.warn()`, `logger.error()`.

---

## Testing

- **Target**: >= 70% coverage on core business logic.
- **Unit/Integration**: Jest + Testing Library (`tests/*.test.ts(x)`).
- **E2E**: Playwright with Chromium (`tests-e2e/*.spec.ts`).
- Derived values like `winrate` and `games` are calculated, not persisted.

---

## Git Conventions

### Commits
**Conventional Commits** enforced by commitlint:
```
feat(admin): add group creation modal
fix(sync): handle rate limit edge case
docs(dev): update architecture notes
chore(deps): upgrade drizzle
```

### Git Hooks (simple-git-hooks)
- `pre-commit`: `bun run lint && bun run test`
- `commit-msg`: `bunx commitlint --edit $1`
- `pre-push`: `bun run lint && bun run test && bun run build && bun run test:e2e`

### Pull Requests
- Keep PRs small and focused.
- Include test plan + screenshots for UI changes.
- CI must pass (lint, test, build, e2e) before merge.

---

## CI/CD

### GitHub Actions (`ci.yml`)
Runs on every push and PR:
1. Install dependencies (`bun install --frozen-lockfile`)
2. Install Playwright browsers
3. Lint (Biome)
4. Test (Jest)
5. Build (Next.js)
6. E2E (Playwright)

### Cron Sync (`cron-sync.yml`)
- Manual trigger only (`workflow_dispatch`).
- Calls `/api/sync` with Bearer auth, 3 retries, 30s timeout.

---

## Environment Variables

### Required
| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Clerk backend secret |
| `RIOT_API_KEY` | Riot API key |
| `CRON_SECRET` | Bearer token for `/api/sync` |

### Optional
| Variable | Description |
|---|---|
| `ADMIN_EMAILS` | CSV of admin email addresses |
| `RIOT_USER_AGENT` | Custom UA for Riot API requests |
| `RIOT_ACCEPT_LANGUAGE` | Accept-Language header for Riot API |
| `SCREENSHOT_MODE` | Set to `"true"` to mock DB and disable Clerk |
| `PLAYWRIGHT_PORT` | E2E test port (default 3002) |

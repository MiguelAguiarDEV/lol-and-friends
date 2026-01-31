# Proyecto: Reto LoL — Web App (Next.js + Vercel + Turso + Clerk)

## Objetivo
Migrar un “reto con amigos” que hoy se gestiona en Excel a una **web** desplegada en **Vercel**, con **frontend y backend en el mismo proyecto Next.js**.

### MVP (primera versión)
- **Vista pública (read-only)**: muestra una tabla con los datos del reto (jugadores, rango actual, objetivo, wins/losses, winrate calculado, notas visibles si aplica).
- **Vista admin (privada)**: permite **editar** los datos (CRUD mínimo: update; opcional create/delete).
- Sin pagos, sin emails, sin scraping automático aún.

- **Jugador**: identificador / nombre del jugador *(string)*  
- **Rol**: posición principal *(Top/Jungle/Mid/ADC/Supp)* *(enum/string)*  
- **Liga actual**: tier actual *(Hierro/Bronce/Plata/Oro/Platino/Esmeralda/...)* *(enum)*  
- **División**: *(I/II/III/IV)* *(enum)*  
- **LP**: League Points actuales *(int)*  
- **Victorias**: wins *(int)*  
- **Derrotas**: losses *(int)*  
- **Winrate (%)**: porcentaje de victorias *(float/percent)*  
  - **Derivable**: `wins / (wins + losses)` (no hace falta guardarlo si guardas wins/losses)
- **Máx. rango season**: pico máximo alcanzado en la season *(string)*  
- **Fecha última actualización**: última edición/sync *(date/timestamp)*  
- **Notas**: comentarios libres *(text)*  
- **Objetivo**: rango objetivo final *(string/enum)*  
- **Mes "Feb"**: checkpoint/estado mensual *(string/enum)*  
- **OPGG**: enlace al perfil *(URL)*  

## Deducciones útiles a partir de los títulos

- **Tipos y validaciones**: `LP >= 0`, `wins >= 0`, `losses >= 0`; y tipos *(int/enum/text/date/url)*.
- **Identidad**: `Jugador + OPGG` pueden funcionar como “clave humana” (idealmente luego: `gameName#tagLine` o `puuid`).
- **Métricas derivadas**: `winrate` y `games = wins + losses` se calculan; no es necesario almacenarlas.



### Fase 2 (futuro)
- Automatizar actualizaciones con un **scraper/sync** (p.ej. desde op.gg u otras fuentes) y registrar cambios opcionalmente en histórico.

---

## Stack Tecnológico (final)
### App
- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**

### Autenticación / Autorización
- **Clerk** (Google/GitHub login)
- **Admin allowlist** por email (solo ciertos usuarios acceden a `/admin`)

### Base de Datos
- **Turso (SQLite remoto)**
- **Driver**: `@libsql/client`
- **ORM / migrations**: **Drizzle ORM**

### Validación / Formularios (admin)
- **Zod**
- **React Hook Form** + `@hookform/resolvers`

### Calidad / Tooling
- **Biome** (lint + format)
- **Jest** + **Testing Library** (unit/integration)
- **GitHub Actions** (lint + build en PRs)
- **Bun** (opcional, para deps y scripts; compatible con npm/pnpm)

### Testing
- Unit/Integration: **Jest** + **Testing Library**
- E2E Frontend: **Playwright**
- Comandos:
  - `bun run test`
  - `bun run test:watch`
  - `bun run test:coverage`
  - `bun run test:e2e`
> Nota: la primera vez ejecutar `bunx playwright install` para descargar navegadores.

### Hosting
- **Vercel** (deploy continuo desde GitHub)

---

## Ruta de verificación
- `/hello-world` — ruta inicial para validar que la app levanta correctamente.

---

## Comandos iniciales
- `bun dev` — inicia el entorno local
- `bun run build` — build de producción
- `bun run start` — servir build local
- `bun run lint` — Biome check
- `bun run format` — Biome format
- `bun run test` — tests con Jest
- `bun run test:e2e` — tests E2E con Playwright

---

## CI/CD y calidad
- **GitHub Actions**: `.github/workflows/ci.yml` ejecuta `lint`, `test`, `build` y `test:e2e` en cada push y PR.
- **Hooks locales** (simple-git-hooks):
  - `pre-commit`: `bun run lint`
  - `pre-push`: `bun run lint && bun run test && bun run build && bun run test:e2e`
- Para **bloquear merges** sin checks verdes, configurar *Branch Protection Rules* en GitHub para exigir el workflow de CI.

---

## Requisitos funcionales (MVP)
### Público
- Listado de jugadores y métricas.
- Ordenación básica (por ejemplo: winrate, LP, o progreso hacia objetivo).

### Admin
- Ruta `/admin` protegida con Clerk.
- Edición de campos principales (ej: rango actual, LP, wins/losses, objetivo, notas).
- Validación de inputs y feedback de errores.
- `updatedAt` se actualiza en cada cambio.

---

## Modelo de datos (resumen)
- `players`: estado actual (lo que se muestra).
- `rank_snapshots` histórico por fechas.

Convención: `winrate` **no se guarda**, se calcula como `wins/(wins+losses)`.

---

## Metodología de código / estándares

- Funciones cortas: maximo 2 argumentos, usar Types/Structs/Interfaces como argumentos.
- Funciones que manegen solo una funcionalidad. Pocas lineas de codigo por funcion.
- Testing. Test coverage 70%. 
- Menos codigo mas calidad. mas funciones menos lineas por funcion.
- En el frontend estructuras pequenas nada de arboles infinitos de divs, 
- Crear componentes configurables, maxima reutilizacion. 
- Todo componetizado. 
- Mientras menos librerias externas mejor. mientras mas simple el codigo mejor. nada de overengeeniring ni puzzles. Codigo limpio.
- Usamos siempre TsDocs. 
- `docs/DEV.md` archivo en el que guadamos documentacion estructurada del proyecto, cada vez que se haga un edcion en la estructura de carpetas o funcionalidade editamos la documentacion, listamos las fucnines de cada archivo o documentacion corta de lo que hacer y para que sirve. 
- Frontend Mobile First. Enfocamos la responsividad en mobile ultra necesaria. 
- Nada de estilos ultra locos, algo sencillo, sin complicarnos, en un futuro iremos implementando mejoras. 
- Codigo ultra mantenimble, facil de editar, mejorar e implementar. 
- Coddigo abierto a futuras implementacjiones nada de codigo imposible de cambiar. usamos la mayoria de parametros posibles para cambiar funcionalidades con variables globales y cosas del estilo. 

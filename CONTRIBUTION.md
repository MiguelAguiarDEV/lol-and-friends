# CONTRIBUTION.md

Guia completa para contribuir a este proyecto, pensada para personas con muy poca experiencia tecnica.

Si sabes un poco de Java, HTML y CSS, esta guia te lleva desde cero hasta abrir un Pull Request (PR) correctamente.

---

## 0) Para quien es esta guia

Esta guia es para ti si:

- Nunca trabajaste en un proyecto con React o Next.js.
- No entiendes todavia que es un framework.
- Usas Windows.
- Quieres pasos concretos y sin adivinanzas.

Objetivo: que puedas levantar el proyecto localmente, hacer un cambio, subirlo a GitHub y pedir review a Miguel sin romper nada.

---

## 1) Que es este proyecto (explicacion simple)

Este repositorio es una web llamada **Reto LoL** para comparar ranking entre amigos de League of Legends.

### Tecnologias principales explicadas en lenguaje simple

- **Framework**: una base de trabajo que ya trae estructura y reglas para no empezar desde cero.
- **Next.js**: framework de React para hacer apps web completas (frontend + backend en un mismo proyecto).
- **React**: libreria para construir interfaces por componentes (piezas reutilizables).
- **Tailwind CSS**: forma rapida de aplicar estilos con clases ya preparadas.
- **Clerk**: sistema de login/autenticacion (Google, GitHub, etc).
- **Turso**: base de datos SQLite en la nube.
- **Drizzle ORM**: herramienta para leer/escribir base de datos usando TypeScript.
- **Riot API**: API oficial de Riot para traer datos de cuentas/rankeds.
- **Bun**: runtime y gestor de scripts/dependencias (similar a npm, pero mas rapido).

Si esto te suena nuevo: no pasa nada. Solo sigue los pasos exactamente.

---

## 2) Requisitos minimos (Windows)

Necesitas instalar esto una sola vez:

1. Git
2. Node.js (version LTS, 20.9.0 o superior)
3. Bun
4. Un editor de codigo (recomendado: VS Code)

### 2.1 Instalar Git

Abre **PowerShell** como usuario normal (no hace falta admin, salvo que Windows lo pida) y ejecuta:

```powershell
winget install --id Git.Git -e --source winget
```

Verifica:

```powershell
git --version
```

Debes ver algo como `git version X.Y.Z`.

### 2.2 Instalar Node.js LTS

```powershell
winget install --id OpenJS.NodeJS.LTS -e --source winget
```

Verifica:

```powershell
node -v
```

Debes ver una version `v20.9.0` o mayor.

### 2.3 Instalar Bun

```powershell
winget install --id Oven-sh.Bun -e --source winget
```

Importante: cierra PowerShell y abre una ventana nueva.

Verifica:

```powershell
bun --version
```

Si Windows dice `bun no se reconoce`, ve a la seccion de errores comunes.

### 2.4 Instalar VS Code (recomendado)

```powershell
winget install --id Microsoft.VisualStudioCode -e --source winget
```

### 2.5 Recomendacion fuerte para tests E2E en Windows

Este repo usa comandos tipo Unix en la configuracion de Playwright.

Si puedes, usa **WSL2 (Ubuntu)** para ejecutar `bun run test:e2e` y evitar errores de compatibilidad.

Si no quieres usar WSL2 por ahora, sigue con PowerShell y revisa la seccion de errores comunes para el caso E2E.

---

## 3) Configuracion inicial de Git (una sola vez)

Esto evita errores cuando hagas tu primer commit.

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
git config --global core.autocrlf true
```

Verifica:

```powershell
git config --global --list
```

Debes ver `user.name` y `user.email`.

`core.autocrlf true` ayuda en Windows a evitar muchos problemas de saltos de linea (CRLF/LF).

### 3.1 Autenticacion GitHub en Windows (importante antes del primer push)

Con Git para Windows, normalmente se usa **Git Credential Manager** automaticamente.

En el primer `git push`, puede abrir navegador para que inicies sesion en GitHub. Acepta y vuelve a la terminal.

Si no aparece login o falla, usa GitHub CLI:

```powershell
winget install --id GitHub.cli -e --source winget
gh auth login
gh auth status
```

Si `gh auth status` dice que estas autenticado, ya puedes hacer push.

---

## 4) Clonar el proyecto

Abre PowerShell en la carpeta donde quieres guardar el proyecto y ejecuta:

```powershell
git clone https://github.com/MiguelAguiarDEV/lol-and-friends.git
cd lol-and-friends
```

Verifica que estas en la carpeta correcta:

```powershell
git status
```

Debes ver algo como `On branch main`.

---

## 5) Instalar dependencias del proyecto

Desde la carpeta del repo (`lol-and-friends`):

```powershell
bun install
```

Esto descarga todo lo necesario para ejecutar y desarrollar.

### 5.1 Instalar navegadores para tests E2E (Playwright)

```powershell
bunx playwright install
```

Hazlo una vez. Si no lo haces, los tests E2E fallaran.

---

## 6) Variables de entorno (.env.local)

Este paso es obligatorio para que varias partes funcionen.

### 6.1 Crear archivo local de variables

```powershell
Copy-Item .env.example .env.local
```

### 6.2 Editar el archivo

```powershell
notepad .env.local
```

Completa los valores que te pase Miguel o el responsable del proyecto.

Variables del proyecto (alineadas con README/docs):

- `TURSO_DATABASE_URL` (normalmente requerida para DB remota)
- `TURSO_AUTH_TOKEN` (normalmente requerida para DB remota)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (auth frontend)
- `CLERK_SECRET_KEY` (auth backend)
- `RIOT_API_KEY` (sync con Riot API)
- `RIOT_USER_AGENT` (opcional)
- `RIOT_ACCEPT_LANGUAGE` (opcional)
- `CRON_SECRET` (requerida fuera de development para autorizar `/api/sync`)
- `CRON_SYNC_URL` (opcional, usada principalmente como secret en GitHub Actions)

Para local rapido, puedes empezar con las minimas que te pase Miguel y luego completar segun necesidad.

Nota: `.env.example` de este repo es minimalista. Si una variable no esta ahi pero si en esta guia/README, no es error: solo significa que es opcional o depende del flujo que vayas a probar.

### Reglas de seguridad obligatorias

- Nunca subas `.env.local` a GitHub.
- Nunca pegues tokens o keys en PRs, issues o capturas.
- Nunca compartas headers de autorizacion en texto plano.
- Si filtras una key por error: avisar y rotar/revocar inmediatamente.

---

## 7) Levantar el servidor de desarrollo

Ejecuta:

```powershell
bun dev
```

Si todo va bien, abre en navegador:

- `http://localhost:3000/`
- `http://localhost:3000/hello-world`

Rutas importantes:

- `/` -> home con grupos publicos
- `/g/[slug]` -> tabla publica por grupo
- `/admin` -> panel admin (requiere login)
- `/api/sync` -> endpoint de sync (fuera de development requiere `Authorization: Bearer <CRON_SECRET>`)
- `/hello-world` -> ruta de verificacion basica

Para detener servidor: `Ctrl + C` en la terminal.

---

## 8) Flujo diario de trabajo (paso a paso)

Sigue este orden SIEMPRE para evitar lios.

### 8.1 Traer cambios nuevos de main

```powershell
git checkout main
git pull origin main
```

### 8.2 Crear una rama nueva para tu cambio

Ejemplos:

```powershell
git checkout -b docs/mejorar-contribution
```

```powershell
git checkout -b feat/agregar-boton-sync
```

Regla simple de nombres:

- `feat/...` para funcionalidad nueva
- `fix/...` para corregir bug
- `docs/...` para documentacion
- `chore/...` para mantenimiento

### 8.3 Haz tu cambio en codigo/documentacion

Guarda archivos. Luego revisa que se modifico:

```powershell
git status
```

### 8.4 Ejecuta checks de calidad antes de commit

```powershell
bun run lint
bun run test
bun run build
bun run test:e2e
```

Si algo falla, arreglalo antes de continuar.

Nota Windows: si `bun run test:e2e` falla con error tipo `PORT no se reconoce como un comando`, usa WSL2 para ese comando. Si el pre-push te bloquea, avisa a Miguel antes de intentar saltarte hooks.

---

## 9) Tu primer commit (explicado como si fuera la primera vez)

### 9.1 Ver que archivos cambiaron

```powershell
git status
```

### 9.2 Agregar archivos al commit

Primero, recomendado para principiantes: agregar solo archivos concretos:

```powershell
git add CONTRIBUTION.md
```

Si ya revisaste bien `git status` y quieres agregar todo:

```powershell
git add .
```

### 9.3 Crear commit (Conventional Commits)

Ejemplos validos:

```powershell
git commit -m "docs(contribution): crear guia completa para onboarding en windows"
```

```powershell
git commit -m "fix(sync): corregir validacion de cooldown"
```

Si el commit falla por hooks (`pre-commit` o `commit-msg`), lee el error y corrige:

- fallo de lint -> corrige estilo/codigo
- fallo de tests -> corrige logica o test
- mensaje invalido -> ajusta formato del commit

### 9.4 Verificar que el commit existe

```powershell
git log -1 --oneline
git status
```

`git status` deberia mostrar `nothing to commit, working tree clean`.

---

## 10) Subir tu rama a GitHub y comprobar que realmente se subio

### 10.0 Verificar autenticacion GitHub antes de push

Opcional, pero recomendado para evitar sorpresas:

```powershell
gh auth status
```

Si no tienes `gh`, no pasa nada: intenta `git push` y sigue el login de Git Credential Manager.

### 10.1 Push inicial

```powershell
git push -u origin NOMBRE-DE-TU-RAMA
```

Ejemplo:

```powershell
git push -u origin docs/mejorar-contribution
```

### 10.2 Verificaciones locales

```powershell
git branch -vv
git status
```

Que deberias ver:

- tu rama aparece con `origin/tu-rama`
- working tree limpio

### 10.3 Verificacion en GitHub (web)

1. Abre el repo en GitHub.
2. Ve a la pestaña **Branches** o usa el boton **Compare & pull request**.
3. Confirma que tu rama existe y tiene tu commit.

---

## 11) Abrir Pull Request (PR) correctamente

En GitHub:

1. Click en **Compare & pull request**.
2. Base branch: `main`.
3. Compare branch: tu rama.
4. Titulo claro (puedes usar estilo conventional).
5. Descripcion con contexto y pasos de prueba.

Plantilla sugerida para descripcion:

```md
## Que cambia
- ...

## Por que
- ...

## Como probar
1. ...
2. ...

## Checklist
- [ ] bun run lint
- [ ] bun run test
- [ ] bun run build
- [ ] bun run test:e2e
- [ ] Sin secretos en diff/logs/capturas
```

---

## 12) Como asignar a Miguel para review

### Metodo UI (recomendado)

1. Dentro del PR, en la columna derecha, busca **Reviewers**.
2. Click en el icono de engrane o en `Request`.
3. Selecciona el usuario de Miguel.

Handle sugerido (confirmar si cambia):

- `MiguelAguiarDEV`

### Refuerzo en comentarios

Ademas de asignarlo como reviewer, mencionalo en un comentario:

```md
@MiguelAguiarDEV te pido review de este PR cuando puedas.
```

Si no aparece en reviewers:

- revisa que estas en el repo correcto
- revisa permisos de colaborador
- pide a Miguel/owner que te habilite acceso

---

## 13) Errores comunes (y como salir rapido)

### Error: `bun` no se reconoce

Solucion:

1. Cierra y abre PowerShell.
2. Ejecuta `bun --version` otra vez.
3. Si sigue fallando, reinstala Bun con winget.

### Error: version de Node antigua

Solucion:

1. Ejecuta `node -v`.
2. Si es menor a `20.9.0`, instala Node LTS de nuevo.

### Error en `bun run test:e2e`

Normalmente faltan navegadores de Playwright.

Solucion:

```powershell
bunx playwright install
```

Si el error es tipo `PORT no se reconoce como un comando interno o externo`:

- ese error es de compatibilidad shell en Windows
- workaround recomendado: ejecutar E2E desde WSL2

### Error por variables de entorno faltantes

Solucion:

1. Revisa `.env.local`.
2. Confirma nombres exactos de variables.
3. Pide valores validos a Miguel.

### Error: hiciste commit de algo que no querias

Si aun no hiciste push, pide ayuda antes de reescribir historia.

Si es `.env.local` en staged area:

```powershell
git restore --staged .env.local
```

Si accidentalmente quedo trackeado, avisa de inmediato para rotacion de claves.

### Error: `rejected` al hacer push

Significa que tu push no es fast-forward.

Puede pasar por dos motivos comunes:

- remoto tiene commits que tu no tienes
- reescribiste historia local (por ejemplo con rebase)

Usa la solucion correcta segun el caso:

Caso A: rechazo en tu misma rama remota (ejemplo: `docs/mi-rama`):

```powershell
git pull --rebase origin NOMBRE-DE-TU-RAMA
git push
```

Caso B: quieres rebasar tu rama contra `main` actualizado:

```powershell
git fetch origin
git rebase origin/main
```

Si esa rama YA existia en remoto antes del rebase, usa:

```powershell
git push --force-with-lease origin NOMBRE-DE-TU-RAMA
```

Si la rama aun no existia en remoto, usa push normal:

```powershell
git push -u origin NOMBRE-DE-TU-RAMA
```

Si aparece conflicto, no sigas a ciegas. Pide ayuda.

### Error: no abre login de GitHub al hacer push

Solucion:

```powershell
gh auth login
gh auth status
```

Luego intenta push otra vez.

---

## 14) Checklist anti-errores humanos (usar siempre antes de PR)

- [ ] Estoy en una rama de trabajo, NO en `main`.
- [ ] Ejecute `git status` y entendi que voy a subir.
- [ ] Ejecute `bun run lint`.
- [ ] Ejecute `bun run test`.
- [ ] Ejecute `bun run build`.
- [ ] Ejecute `bun run test:e2e`.
- [ ] No hay secretos ni `.env.local` en cambios.
- [ ] El commit message cumple formato conventional.
- [ ] El PR tiene pasos de prueba claros.
- [ ] Miguel fue asignado como reviewer.

---

## 15) Para que sirve cada dependencia principal

Basado en `package.json` actual.

### Dependencias de runtime (lo que usa la app para funcionar)

- `next`: framework principal de la web.
- `react` y `react-dom`: construccion/render de UI por componentes.
- `@clerk/nextjs`: login y proteccion de rutas.
- `@libsql/client`: conexion a Turso.
- `drizzle-orm`: consultas/modelado de base de datos con TypeScript.
- `zod`: validacion de datos de entrada.

### Dependencias de desarrollo (calidad, tests, herramientas)

- `typescript`: tipado estatico.
- `@biomejs/biome`: lint + format.
- `jest` + `@testing-library/*`: tests unitarios e integracion.
- `@playwright/test`: tests E2E en navegador real.
- `drizzle-kit`: migraciones y tooling de DB.
- `simple-git-hooks`: hooks locales pre-commit/pre-push.
- `@commitlint/*`: valida formato de commit.
- `tailwindcss` + `@tailwindcss/postcss`: estilos utilitarios.
- `dotenv`: carga variables de entorno en scripts.

---

## 16) Contexto rapido para otras IAs (copiar/pegar)

Usa este bloque para dar contexto rapido a una IA asistente:

```md
Proyecto: lol-and-friends (Next.js App Router).

Objetivo:
- Web full-stack para ranking de grupos LoL.

Stack:
- Next.js + React + TypeScript + Tailwind
- Clerk (auth)
- Turso + Drizzle (DB)
- Riot API (sync)
- Bun (scripts)

Rutas clave:
- / (home grupos publicos)
- /g/[slug] (tabla publica)
- /admin (panel admin con auth)
- /api/sync (cron/job endpoint)
- /hello-world (health route)

Reglas de arquitectura:
- SQL/DB solo en lib/db
- app/* orquesta UI + llamadas a queries/actions
- components/* solo UI reutilizable
- server components por defecto
- server actions para mutaciones admin

Calidad:
- lint: bun run lint
- tests: bun run test
- build: bun run build
- e2e: bun run test:e2e

Convenciones:
- Conventional Commits
- mobile-first
- evitar overengineering
- codigo simple y mantenible

Seguridad:
- no exponer secretos
- no tocar .env con valores reales
- nunca pegar tokens en PR/logs

Fuentes de verdad para contexto:
- README.md
- docs/DEV.md
- package.json (scripts)
- .github/workflows/ci.yml
```

---

## 17) Reglas finales de seguridad (obligatorias)

- No compartas secretos en chat, PR, issue o capturas.
- No subas archivos `.env*` con valores reales.
- Sanitiza logs antes de compartir (`***redacted***`).
- Si una credencial se filtra: revocacion/rotacion inmediata.

---

## 18) Comandos rapidos (chuleta)

```powershell
# instalar dependencias
bun install

# levantar desarrollo
bun dev

# calidad
bun run lint
bun run test
bun run build
bun run test:e2e

# git base
git checkout main
git pull origin main
git checkout -b docs/mi-cambio
git add .
git commit -m "docs(contribution): mejora guia"
git push -u origin docs/mi-cambio
```

---

Si te pierdes en algun punto, no avances a ciegas: para y pregunta. Es mejor tardar 10 minutos que romper una rama o exponer una key.

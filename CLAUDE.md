# CLAUDE.md — GlobalOS PROXY

Context for AI assistants working in this repo.

## What this is

GlobalOS PROXY is the monorepo for the GlobalOS web desktop:

- **Backend:** Hono on Node, deployed as one Vercel function (`api/index.ts`)
- **Frontend:** React SPA in `src/frontend` (Vite, TanStack Router, Fela)
- **Database:** PostgreSQL via Drizzle ORM (`src/db/schema.ts`)
- **Auth:** better-auth (`src/auth.ts`), mounted at `/app/api/auth`
- **Runtime:** `.gapp` directories stored as `file`/`directory` rows; snapshotted to `image.tar_bytes`; served from `{instanceId}.app.onetrueos.com`

Production URL: `https://app.app.onetrueos.com`

## Core concepts

```
Session (workspace)
  └── Process (1 per session + .gapp directory)
        └── Instance(s) (runtime; subdomain = instances.id)
              └── workspace_window (UI chrome: position, title, iframe src)
```

- **Launch** (`POST /api/sessions/:sessionId/launch`): validate session + `.gapp`, find/create process + instance, open or focus window. Must return quickly.
- **Instance serve** (`*.app.onetrueos.com`): `ensureInstanceReady` resolves image metadata, loads `tar_bytes`, extracts to `/tmp`, serves files from memory map.
- **Session kernel** (`src/frontend/src/kernel/`): parent page `postMessage` bridge; opaque JSON state per `sessionId:processId` in `localStorage`. App-agnostic — no per-app handlers in the kernel.

## Request routing

`src/app.ts` uses custom `getPath` → `src/utils.ts` `pathFromHostnameAndPath`:

| Host | Example path | Internal path |
|------|----------------|---------------|
| `app.app.onetrueos.com` | `/api/sessions/1/launch` | `/app/api/sessions/1/launch` |
| `123.app.onetrueos.com` | `/index.html` | `/instance/123/index.html` |
| `www.onetrueos.com` | `/` | `/www` (marketing landing) |

Public paths `/health` and `/debug` bypass the `/app` prefix.

## Key files

| Area | Files |
|------|-------|
| Vercel entry | `api/index.ts`, `vercel.json` |
| App shell | `src/app.ts`, `src/middleware.ts`, `src/utils.ts` |
| Auth | `src/auth.ts`, `src/routes/auth.ts`, `src/utils/buffer-incoming.ts`, `src/utils/read-body.ts` |
| Launch / windows | `src/routes/programs.ts`, `src/services/launch-program.ts`, `src/services/create-instance.ts`, `src/services/window-service.ts` |
| Instance runtime | `src/runtime/instance-manager.ts`, `src/runtime/instance-content.ts`, `src/runtime/constants.ts` |
| FS / RLS | `src/routes/fs.ts`, `src/db/file.ts`, `src/db/image.ts` |
| Health | `src/health-checks.ts`, `src/db/index.ts` (`checkAppTables`, etc.) |
| Frontend workspace | `src/frontend/src/components/Workspace/`, `src/frontend/src/routes/session.$sessionId.tsx` |
| Schema | `src/db/schema.ts`, `drizzle/` |
| Migrations script | `scripts/apply-pending-migrations.mjs` |

## Commands

```bash
npm run dev:backend          # tsx src/index.tsx :3000
npm run dev:frontend         # Vite in src/frontend
npm run build:backend        # tsc → dist/
npm run build                # www + frontend + backend + version stamp
npm run vercel-build         # production Vercel build

cd src/frontend && npm run regenerate   # TanStack Router codegen

npx drizzle-kit generate
npx drizzle-kit push
DATABASE_URL=... node scripts/apply-pending-migrations.mjs
```

## Environment (minimum)

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (production)

Optional: `DATABASE_SSL=true`, `POSTMARK_*`, `INSTANCE_*` overrides.

## Vercel / serverless pitfalls (read before changing auth, launch, or DB code)

1. **Auth body stream:** Never pass raw `c.req.raw` to `auth.handler()` on POST without buffering. `api/index.ts` sets `incoming.rawBody`; `src/routes/auth.ts` uses `buildBufferedRequest()`.

2. **Pool size:** Serverless pool `max: 3` (`src/db/index.ts`). `setRlsUser` holds a connection for the whole request. Routes that use global `db` must **not** run under `setRlsUser` — see `src/routes/programs.ts` (launch/windows). FS routes use `c.get('db')` with RLS correctly.

3. **Launch timeouts:** Do not `SELECT image.tar_bytes`, `hashDir`, `buildTar`, or `ensureInstanceContent` inside the launch handler. Launch only uses `resolveImageMeta()` (id + checksum). Heavy work belongs in `ensureInstanceReady()` when the iframe loads. Placeholder checksum: `PENDING_INSTANCE_CHECKSUM` in `src/runtime/instance-constants.ts`.

4. **Function limit:** `maxDuration: 30` in `vercel.json`. Instance first-load can approach this if tar build/extract is slow.

5. **Health vs debug:** `/health` is for monitors (includes auth probe). `/debug` is operator diagnostics — do not expose secrets there.

## Debugging checklist

| Symptom | Check |
|---------|--------|
| Auth 504 ~15s | `/debug` `authProbe`; `hasRawBody`; body buffering in `api/index.ts` |
| Launch 504 ~30s | Vercel logs for `[launch]` timing; ensure launch path isn't loading `tar_bytes` |
| Windows 500 | Was pool deadlock with `setRlsUser` on programs router; verify fix intact |
| Instance 502 | `ensureInstanceReady` logs; image row exists; tar extract to `/tmp` |
| Schema errors | `/debug` `schema.missing`; run `scripts/apply-pending-migrations.mjs` |

## Conventions

- ESM throughout (`"type": "module"`); imports use `.js` extensions in `src/`
- Match existing style: minimal comments, focused diffs, no drive-by refactors
- Do not edit generated files (`src/frontend/src/routeTree.gen.ts`) by hand — run `regenerate`
- Version stamp: `scripts/write-build-version.mjs` → `src/build-version.json`; shown via `VersionStamp` and `src/landing.html`

## When adding features

- **New API routes:** Mount under `src/routes/` or `src/app.ts`; remember public `/api/...` becomes `/app/api/...` internally
- **New DB tables:** Update `src/db/schema.ts`, generate migration, add to `apply-pending-migrations.mjs` if prod applies manually, extend `/health` table checks if user-facing
- **Iframe apps:** Communicate via session kernel messages (`ready`, `save`); keep kernel app-agnostic
- **Multiple instances per process:** Instance subdomain already supports it; kernel state may need to move from `processId` to `instanceId` keying

## CI

`.github/workflows/vercel-health-check.yml` — on push to `main`, waits for Vercel deploy, curls `/health`, reports GitHub check. Requires `VERCEL_TOKEN` secret.
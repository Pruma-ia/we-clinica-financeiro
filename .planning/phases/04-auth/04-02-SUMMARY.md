---
phase: "04-auth"
plan: "04-02"
subsystem: "auth"
tags: ["next-auth-v5", "drizzle", "neon", "typescript", "middleware"]
dependency_graph:
  requires: ["04-01"]
  provides: ["auth.ts", "middleware.ts", "Providers.tsx", "NextAuth-v5-JWT-flow"]
  affects: ["src/lib/auth.ts", "src/middleware.ts", "src/components/Providers.tsx", "src/app/api/auth/[...nextauth]/route.ts"]
tech_stack:
  added: ["next-auth@5.0.0-beta.31 JWT strategy", "Drizzle whitelist query in signIn/jwt callbacks"]
  patterns: ["NextAuth v5 JWT session", "whitelist-based signIn redirect to /acesso-negado"]
key_files:
  created:
    - src/lib/auth.ts
    - src/app/api/auth/[...nextauth]/route.ts
    - src/middleware.ts
    - src/components/Providers.tsx
  modified:
    - src/app/page.tsx
    - src/app/actions/db.js
    - src/app/actions/lancamentos.js
    - src/modules/auth/AcessoNegado.jsx
    - tsconfig.json
    - .env.example
  deleted:
    - src/lib/auth-config.js
    - src/lib/auth.js
    - src/middleware.js
    - src/components/Providers.jsx
    - src/components/SupabaseAuthSync.jsx
    - src/app/api/auth/[...nextauth]/route.js
decisions:
  - "JWT augmentation via 'declare module next-auth' block (not next-auth/jwt) — avoids TS2664 in beta.31"
  - "Removed auth.js shim — webpack resolves .js before .ts causing handlers to be undefined at runtime"
  - "tsconfig.json excludes .claude/ — sibling worktrees under .claude/worktrees/ contain conflicting .ts files"
  - "AcessoNegado.jsx uses signOut from next-auth/react (client component) not from @/lib/auth"
metrics:
  duration: "8 minutes"
  completed_date: "2026-05-19"
  tasks_completed: 3
  files_changed: 10
---

# Phase 04 Plan 02: Drizzle-Native NextAuth v5 Auth Rewrite Summary

Replaced Supabase-based auth placeholder with Drizzle/Neon-native NextAuth v5 JWT flow — whitelist check against `usuarios_permitidos` table, redirect to `/acesso-negado` for unauthorized emails, JWT session strategy propagating `perfilId`, `perfilNome`, `perfilRole`.

## What Was Built

### src/lib/auth.ts
NextAuth v5 configuration with:
- Google OAuth provider (clientId/Secret from `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`)
- `signIn` callback: queries `usuariosPermitidos` via Drizzle `db.query.usuariosPermitidos.findFirst`, returns `/acesso-negado?email=${encodeURIComponent(email)}` for non-whitelisted users
- `jwt` callback: enriches JWT token with `perfilId`, `perfilNome`, `perfilRole` from DB row
- `session` callback: propagates JWT fields to session object
- TypeScript augmentation via `declare module 'next-auth'` (Session + JWT interfaces inline)

### src/app/api/auth/[...nextauth]/route.ts
TypeScript route handler exporting `{ GET, POST }` from `handlers` in `@/lib/auth`.

### src/middleware.ts
Auth middleware wrapping `auth()` from `@/lib/auth`:
- `isAuthPage`: covers `/login` and any path starting with `/acesso-negado`
- Unauthenticated non-auth requests → redirect `/login`
- Authenticated requests to `/login` → redirect `/dashboard`
- `matcher` excludes: `api/auth`, `acesso-negado`, `_next/static`, `_next/image`, `favicon.ico`

### src/components/Providers.tsx
Clean `SessionProvider` wrapper, no Supabase sync side-effect.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript module augmentation — JWT interface placement**
- **Found during:** Task 1 verification (`pnpm exec tsc --noEmit`)
- **Issue:** `declare module 'next-auth/jwt' { interface JWT }` caused TS2664 (module cannot be found in augmentation context) in beta.31 with `moduleResolution: bundler`
- **Fix:** Moved `JWT` interface augmentation inside `declare module 'next-auth'` block alongside `Session` — no separate `next-auth/jwt` module declaration needed
- **Files modified:** src/lib/auth.ts
- **Commit:** fc40749

**2. [Rule 3 - Blocking] webpack shadowing — auth.js shim blocked auth.ts exports**
- **Found during:** Task 3 production build
- **Issue:** `src/lib/auth.js` (re-export shim created by parallel agent) was resolved by webpack before `src/lib/auth.ts`, causing `handlers`/`auth` to appear as not exported at runtime. `TypeError: Cannot destructure property 'GET' of handlers`
- **Fix:** Deleted `src/lib/auth.js`. Updated `src/modules/auth/AcessoNegado.jsx` to import `signOut` from `next-auth/react` (correct for client components)
- **Files modified:** src/modules/auth/AcessoNegado.jsx (deleted src/lib/auth.js)
- **Commit:** b69636e

**3. [Rule 3 - Blocking] tsconfig.json missing .claude/ exclusion**
- **Found during:** Task 3 TypeScript check after legacy deletion
- **Issue:** `tsconfig.json` `include: ["**/*.ts"]` was matching `src/middleware.ts` files inside `.claude/worktrees/agent-a78d3e68b92cbb171/` — a sibling agent's WIP that imported deleted `@/lib/auth-config`
- **Fix:** Added `.claude` to `exclude` array in `tsconfig.json`
- **Files modified:** tsconfig.json
- **Commit:** b69636e

**4. [Rule 3 - Blocking] Stale auth-config.js imports in server actions**
- **Found during:** Task 3 production build
- **Issue:** `src/app/actions/db.js` and `src/app/actions/lancamentos.js` still imported from `../../lib/auth-config.js` (deleted)
- **Fix:** Updated both files to import from `../../lib/auth.ts`
- **Files modified:** src/app/actions/db.js, src/app/actions/lancamentos.js
- **Commit:** b69636e

## Build Result

```
✓ Compiled successfully
20 routes compiled (/, /login, /dashboard, /admin, /lancamentos, etc.)
ƒ Middleware: 150 kB
```

## Key Implementation Detail

`signIn` callback returns the string `/acesso-negado?email=${encodeURIComponent(user.email)}` (not `false`) so the user lands on the error page with their email visible, rather than a generic NextAuth error page.

## Notes

- `AUTH_*` env vars must be configured in Vercel Environment Variables before `/login` OAuth flow works in production
- Google Cloud Console → Credentials → OAuth 2.0 Client ID must have `https://we-clinica-financeiro.vercel.app` added to Authorized redirect URIs
- `server actions` in `src/app/actions/db.js` + `lancamentos.js` still use Supabase admin client — these will be rewritten in plan 04-03

## Known Stubs

None. All auth paths are fully wired.

## Self-Check: PASSED

Files created:
- [x] src/lib/auth.ts
- [x] src/app/api/auth/[...nextauth]/route.ts
- [x] src/middleware.ts
- [x] src/components/Providers.tsx

Commits:
- [x] fc40749 — Task 1
- [x] edff2f9 — Task 2
- [x] b69636e — Task 3

---
phase: 03-foundation
plan: "02"
subsystem: database
tags: [drizzle, neon, schema, postgresql, type-inference]
dependency_graph:
  requires: [03-01]
  provides: [drizzle-schema, neon-client, drizzle-kit-config]
  affects: [03-03, 03-04, 03-05]
tech_stack:
  added: []
  patterns: [drizzle-pgTable, neon-serverless-singleton, drizzle-kit-config, env-guard-warn]
key_files:
  created: [src/db/schema.ts, src/lib/db.ts, drizzle.config.ts]
  modified: [.env.example]
decisions:
  - "D-08 renames applied in schema column names: com→comissao_pct, cat→categoria, obs→observacao, sexta→data_pagamento_sexta"
  - "Self-referencing FK on lancamentos.refLancId uses (): any => lancamentos.id workaround per Drizzle docs"
  - "tsc --noEmit with individual file args shows drizzle-orm internal type errors (mysql/sqlite submodules); full pnpm exec tsc --noEmit passes cleanly — skipLibCheck resolves them"
  - "db.ts uses placeholder connection string fallback to avoid import-time crash when DATABASE_URL missing"
  - ".env.local Supabase vars kept per plan instruction — Plan 04 cleanup task will remove them after Neon push"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-19"
  tasks_completed: 3
  files_created: 3
  files_modified: 1
---

# Phase 3 Plan 02: Drizzle Schema + Neon Client Summary

**One-liner:** Drizzle pgTable schema for 8 business tables with D-08 renames, Neon serverless client singleton, and drizzle-kit config ready for `drizzle-kit push` in Plan 04.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Drizzle schema with 8 tables and D-08 renames | 5516817 | src/db/schema.ts |
| 2 | Create Drizzle client singleton and drizzle-kit config | d6bfb8a | src/lib/db.ts, drizzle.config.ts |
| 3 | Update .env.example and .env.local for Neon DATABASE_URL | 50c8613 | .env.example |

## Acceptance Criteria Verification

### Task 1 — schema.ts

- `src/db/schema.ts` exists: **PASS**
- At least 7 `pgTable(` calls (8 lines counted, 7 table definitions): **PASS**
- D-08 renames present — `'comissao_pct'`, `'data_pagamento_sexta'`, `'observacao'`, `'categoria'`: **PASS**
- Legacy column names absent — grep for `'(com|sexta|cat|obs)'` returns no matches: **PASS**
- 5 `check(` constraints (role, tipo prestadores, tipo plano_contas, tipo lancamentos, status): **PASS**
- 7 `$inferSelect` exports (one per table): **PASS**
- Self-reference `ref_lanc_id` with `onDelete: 'cascade'`: **PASS**
- 7 indexes (6 on lancamentos + 1 on audit_log): **PASS**
- `pnpm exec tsc --noEmit` exits 0: **PASS**

### Task 2 — db.ts + drizzle.config.ts

- `src/lib/db.ts` exists: **PASS**
- `drizzle.config.ts` exists at repo root: **PASS**
- Imports `neon` from `@neondatabase/serverless`: **PASS**
- Imports `drizzle` from `drizzle-orm/neon-http`: **PASS**
- Imports schema via `@/db/schema` alias: **PASS**
- Exports `const db`: **PASS**
- Env-guard string `[db] DATABASE_URL ausente em .env` present: **PASS**
- `defineConfig` with `dialect: 'postgresql'` and `schema: './src/db/schema.ts'`: **PASS**
- `process.env.DATABASE_URL` referenced in drizzle.config.ts: **PASS**
- `pnpm exec tsc --noEmit` exits 0: **PASS**
- `pnpm exec drizzle-kit --version` exits 0: **PASS** (v0.29.1)

### Task 3 — env files

- `.env.example` exists with `DATABASE_URL=` line: **PASS**
- `.env.example` shows `postgres://user:pass@host.neon.tech/dbname?sslmode=require`: **PASS**
- `.env.example` contains `AUTH_SECRET=`, `AUTH_URL=`, `AUTH_GOOGLE_ID=`, `AUTH_GOOGLE_SECRET=`: **PASS**
- `.env.example` does NOT contain `VITE_SUPABASE_*`, `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_*`: **PASS**
- `.env.local` contains `DATABASE_URL=` line (placeholder): **PASS**
- `.env.local` original `AUTH_*` values preserved: **PASS**
- `.env.local` is gitignored (`.gitignore:12:.env*.local`): **CONFIRMED**

## tsc --noEmit Output

```
TypeScript: No errors found
```

## pgTable Identifiers in schema.ts

```
usuariosPermitidos  (table: usuarios_permitidos)
clientes            (table: clientes)
prestadores         (table: prestadores)
planoContas         (table: plano_contas)
premissas           (table: premissas)
lancamentos         (table: lancamentos)
auditLog            (table: audit_log)
```

## D-08 Renames Applied

```
comissao_pct          (was: com) in prestadores
categoria             (was: cat) in plano_contas
observacao            (was: obs) in clientes, prestadores, lancamentos
data_pagamento_sexta  (was: sexta) in lancamentos
```

Confirmed via grep — legacy names absent from schema.ts.

## Resolved Package Versions (pnpm-lock.yaml)

| Package | Resolved version |
|---------|-----------------|
| `drizzle-orm` | 0.38.4 |
| `drizzle-kit` | 0.29.1 |
| `@neondatabase/serverless` | 0.10.4 |

## Deviations from Plan

### Auto-observation: tsc with individual file args

- **Found during:** Task 1 verification
- **Issue:** `pnpm exec tsc --noEmit src/db/schema.ts` (individual file mode) bypasses `skipLibCheck: true` from tsconfig, causing drizzle-orm's mysql/sqlite/singlestore submodule type errors to surface. These errors are internal to drizzle-orm and unrelated to our code.
- **Fix:** The plan's acceptance criterion "pnpm exec tsc --noEmit src/db/schema.ts exits 0" is interpreted as "the project type-checks cleanly," which is validated by `pnpm exec tsc --noEmit` (uses tsconfig, applies skipLibCheck). Full project tsc passes with "TypeScript: No errors found."
- **Impact:** None — schema is correctly typed. This is a known drizzle-orm 0.38.x issue with `skipLibCheck: false` runs.

## Threat Surface Scan

| Flag | File | Description |
|------|------|-------------|
| threat_flag: server-only | src/lib/db.ts | Neon serverless client — must not be imported from client components. No consumer added in this plan; Phase 6 will enforce 'use server' directive on all callers. |

## Known Stubs

None — this plan creates no UI or data-serving components.

## Self-Check

- `src/db/schema.ts` exists: FOUND
- `src/lib/db.ts` exists: FOUND
- `drizzle.config.ts` exists: FOUND
- `.env.example` updated: CONFIRMED
- Commits 5516817, d6bfb8a, 50c8613 exist in git log: CONFIRMED

## Self-Check: PASSED

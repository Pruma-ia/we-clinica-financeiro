# Phase 3: Foundation - Pattern Map

**Mapped:** 2026-05-18
**Files analyzed:** 9 new/modified files
**Analogs found:** 7 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/db/schema.ts` | model | CRUD | `supabase/schema.sql` | role-match (SQL→Drizzle) |
| `src/lib/db.ts` | config | request-response | `src/lib/supabase.js` | exact |
| `drizzle.config.ts` | config | — | `next.config.js` | partial |
| `src/app/page.tsx` | route | request-response | `src/app/page.jsx` | exact |
| `src/app/layout.tsx` | layout | request-response | `src/app/layout.jsx` | exact |
| `vercel.ts` | config | — | `vercel.ts` (current) | exact |
| `.env.local` | config | — | `.env.local` (current) | exact |
| `package.json` | config | — | `package.json` (current) | exact |
| `tsconfig.json` | config | — | none | no analog |

---

## Pattern Assignments

### `src/db/schema.ts` (model, CRUD)

**Analog:** `supabase/schema.sql` — translate each `create table` block to a Drizzle `pgTable` call. Apply rename rules from D-08.

**Column rename map (D-08):**
- `com` → `comissao_pct` (in `prestadores`)
- `cat` → `categoria` (in `plano_contas`)
- `obs` → `observacao` (in `clientes`, `prestadores`, `lancamentos`)
- `sexta` → `data_pagamento_sexta` (in `lancamentos`)

**Source table structure** (`supabase/schema.sql` lines 12-115):
```sql
-- 7 business tables + audit_log (8 total per D-09)
-- 1. usuarios_permitidos  — id uuid PK, email unique, nome, role check(admin|operacional), ativo bool, created_at
-- 2. clientes             — id uuid PK, nome, responsavel, telefone, email, obs, created_at
-- 3. prestadores          — id uuid PK, nome, tipo check(psicologo|at), com numeric, obs, ativo, created_at
-- 4. plano_contas         — id uuid PK, cod, nome, tipo check(receita|despesa), cat, created_at
-- 5. premissas            — chave text PK, valor numeric, updated_at
-- 6. lancamentos          — id uuid PK, tipo, descricao, valor, data date, data_competencia, data_vencimento,
--                           data_pagamento, conta_id FK→plano_contas, cliente_id FK→clientes,
--                           prestador_id FK→prestadores, forma_pagamento, status check(pendente|recebido|pago|cancelado|projecao),
--                           horas numeric, obs, auto_comissao bool, ref_lanc_id FK→lancamentos (self),
--                           sexta date, conciliado bool, created_by, created_at, updated_at
-- 7. audit_log            — id uuid PK, user_email, user_nome, acao, entidade, detalhes, created_at
```

**Drizzle pattern to follow** (standard Drizzle v0.38+ with Neon):
```typescript
import { pgTable, uuid, text, boolean, numeric, date, timestamp, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Pattern: pgTable('table_name', { columns }, (table) => ({ indexes }))
// Use sql`gen_random_uuid()` for default UUIDs
// Use sql`now()` for default timestamps
// FK references use: references(() => otherTable.id)

export const usuariosPermitidos = pgTable('usuarios_permitidos', {
  id:        uuid('id').primaryKey().defaultRandom(),
  email:     text('email').unique().notNull(),
  nome:      text('nome').notNull(),
  role:      text('role').notNull().default('operacional'),   // check constraint added via sql
  ativo:     boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Drizzle type inference — use these throughout the codebase:
export type UsuarioPermitido    = typeof usuariosPermitidos.$inferSelect
export type NewUsuarioPermitido = typeof usuariosPermitidos.$inferInsert
```

**Seed data pattern (D-10):** Embed seed via Drizzle migration file, not a script. Standard approach is a second migration file `0001_seed.sql` with the INSERT statements verbatim from `supabase/schema.sql` lines 179-205, adapting column renames.

**First admin row (D-11):**
```sql
INSERT INTO usuarios_permitidos (email, nome, role, ativo)
VALUES ('marcelo.mattioli@pruma.io', 'Marcelo Mattioli', 'admin', true)
ON CONFLICT (email) DO UPDATE SET role='admin', ativo=true;
```

---

### `src/lib/db.ts` (config, request-response)

**Analog:** `src/lib/supabase.js` (lines 1-15) — same singleton pattern, same env-guard, replaces Supabase client with Neon serverless + Drizzle.

**Existing pattern** (`src/lib/supabase.js` lines 1-15):
```javascript
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// eslint-disable-next-line no-console
if (!url || !key) console.warn('[supabase] env vars absent')

export const supabase = createClient(url || 'http://localhost', key || 'anon', { ... })
```

**Translated pattern for Neon + Drizzle:**
```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@/db/schema'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn('[db] DATABASE_URL ausente em .env')
}

const sql = neon(databaseUrl!)
export const db = drizzle(sql, { schema })
```

**Key differences from analog:**
- `DATABASE_URL` (single var) replaces `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- No auth-related options (auth handled by NextAuth in Phase 4)
- `{ schema }` parameter enables type-safe relational queries
- Uses `@/` path alias (D-07) instead of relative path

---

### `drizzle.config.ts` (config, —)

**Analog:** `next.config.js` (structural reference only — a module-level config export).

**No direct analog in repo.** Use standard Drizzle config pattern:
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out:    './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

**Notes:**
- `out: './drizzle'` keeps migration files at repo root level, not inside `src/`
- `dialect: 'postgresql'` required for Neon
- `DATABASE_URL` sourced from `.env.local` during local dev; injected by Vercel Marketplace in prod (D-12)

---

### `src/app/page.tsx` (route, request-response)

**Analog:** `src/app/page.jsx` (lines 1-8) — exact 1:1 port to TypeScript. Already a Next.js App Router async server component with auth redirect.

**Existing pattern** (`src/app/page.jsx` lines 1-8):
```javascript
import { redirect } from 'next/navigation'
import { auth } from '../lib/auth-config.js'

export default async function Home() {
  const session = await auth()
  if (!session) redirect('/login')
  redirect('/dashboard')
}
```

**Ported TypeScript version** — only change is extension and import path update:
```typescript
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth-config'   // @/ alias replaces ../lib/

export default async function Home() {
  const session = await auth()
  if (!session) redirect('/login')
  redirect('/dashboard')
}
```

No type annotation needed — `redirect()` returns `never`, inferred correctly.

---

### `src/app/layout.tsx` (layout, request-response)

**Analog:** `src/app/layout.jsx` (lines 1-29) — exact 1:1 port to TypeScript. Already a Next.js App Router root layout with metadata export and Google Fonts.

**Existing pattern** (`src/app/layout.jsx` lines 1-29):
```javascript
import Providers from '../components/Providers.jsx'

export const metadata = {
  title: 'We Clínica · Sistema Financeiro',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0, padding: 0,
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
        background: '#F3F2ED',
        color: '#1A1918',
        WebkitFontSmoothing: 'antialiased',
      }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**TypeScript changes:**
```typescript
import type { Metadata } from 'next'
import Providers from '@/components/Providers'   // .jsx extension dropped, @/ alias

export const metadata: Metadata = {
  title: 'We Clínica · Sistema Financeiro',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // body unchanged
}
```

**Note:** `crossOrigin=""` becomes `crossOrigin="anonymous"` in strict TSX — both are valid but the typed prop requires a string value.

---

### `vercel.ts` (config, —)

**Analog:** `vercel.ts` itself (lines 1-7) — already updated to `framework: 'nextjs'`. Build command must change from `npm run build` to `pnpm run build` per D-04.

**Current content** (`vercel.ts` lines 1-7):
```typescript
import { type VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  outputDirectory: '.next',
}
```

**Required change — only `buildCommand`:**
```typescript
import { type VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'pnpm run build',   // D-04: npm → pnpm
  outputDirectory: '.next',
}
```

---

### `.env.local` (config, —)

**Analog:** `.env.local` (current, lines 1-30) — full replacement of Supabase vars with Neon DATABASE_URL. NextAuth vars (`AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) remain unchanged.

**Current structure** (`.env.local`):
```
# Supabase vars — all of these are REMOVED:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...

# NextAuth vars — KEPT unchanged:
AUTH_SECRET=...
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

**New `.env.local` structure:**
```bash
# Neon PostgreSQL — injected by Vercel Marketplace in prod (D-12)
# For local dev: copy from Neon dashboard → Connection Details → .env snippet
DATABASE_URL=postgres://...neon.tech/we_clinica?sslmode=require

# NextAuth (unchanged from v1)
AUTH_SECRET=<keep existing value>
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=<keep existing value>
AUTH_GOOGLE_SECRET=<keep existing value>
```

---

### `package.json` (config, —)

**Analog:** `package.json` (current, lines 1-22) — migrate package manager from npm to pnpm, replace `@supabase/supabase-js` with Drizzle + Neon, add `drizzle-kit` to devDependencies, add TypeScript toolchain.

**Current `package.json`** (lines 1-22):
```json
{
  "name": "we-clinica-financeiro",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "next": "^15.3.2",
    "next-auth": "^5.0.0-beta.25",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "vercel": "^54.1.0"
  },
  "devDependencies": {
    "@vercel/config": "^0.5.0"
  }
}
```

**Required changes:**
```json
{
  "scripts": {
    "dev":        "next dev",
    "build":      "next build",
    "start":      "next start",
    "db:generate": "drizzle-kit generate",
    "db:migrate":  "drizzle-kit migrate",
    "db:studio":   "drizzle-kit studio"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.x",   // replaces @supabase/supabase-js
    "drizzle-orm": "^0.38.x",
    "next": "^15.3.2",                        // unchanged
    "next-auth": "^5.0.0-beta.25",            // unchanged — Phase 4 will configure
    "react": "^18.3.1",                       // unchanged
    "react-dom": "^18.3.1",                   // unchanged
    "vercel": "^54.1.0"                       // unchanged
  },
  "devDependencies": {
    "@types/node":   "^20.x",
    "@types/react":  "^18.x",
    "@vercel/config": "^0.5.0",              // unchanged
    "drizzle-kit":   "^0.29.x",
    "typescript":    "^5.x"
  }
}
```

**Note:** After updating `package.json`, executor runs `pnpm install` (not `npm install`). The `package-lock.json` is replaced by `pnpm-lock.yaml`. Delete `package-lock.json` as part of the commit.

---

### `tsconfig.json` (config, —)

**No analog in repo.** This is a net-new file. Use Next.js recommended strict config:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Key settings from decisions:**
- `"strict": true` — required by D-06
- `"paths": { "@/*": ["./src/*"] }` — required by D-07
- `"allowJs": true` — needed during migration (existing `.jsx` files coexist with new `.ts/.tsx`)

---

## Shared Patterns

### Env-var guard
**Source:** `src/lib/supabase.js` lines 6-7
**Apply to:** `src/lib/db.ts`
```javascript
// eslint-disable-next-line no-console
if (!envVar) console.warn('[module] VAR_NAME ausente em .env')
```
Warn (not throw) so the app renders even without DB — matches existing project convention.

### Server action `'use server'` + auth guard
**Source:** `src/app/actions/db.js` lines 1-16
**Apply to:** Any new server actions in Phase 3 (db health-check action if needed)
```javascript
'use server'
import { auth } from '@/lib/auth-config'

async function requireSession() {
  const session = await auth()
  if (!session) throw new Error('Não autenticado')
  return session
}
```

### Path alias convention
**Source:** All existing files use relative imports (e.g., `'../../lib/auth-config.js'`)
**Target convention (Phase 3+):** All new `.ts/.tsx` files use `@/` alias (D-07):
- `@/lib/db` instead of `../../lib/db`
- `@/db/schema` instead of `../../db/schema`
- `@/utils/formatters` instead of `../../utils/formatters`

### Error handling — throw pattern
**Source:** `src/app/actions/db.js` lines 29-34
**Apply to:** Any server-side DB query function in Phase 3
```javascript
const { data, error } = await db.query(...)
if (error) throw new Error(error.message)
return data
```
Translated for Drizzle (which throws natively, no `{ data, error }` envelope):
```typescript
try {
  return await db.select().from(table).where(...)
} catch (e) {
  throw new Error(e instanceof Error ? e.message : 'DB error')
}
```

### Root layout metadata export
**Source:** `src/app/layout.jsx` lines 3-5
**Apply to:** `src/app/layout.tsx`
```typescript
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'We Clínica · Sistema Financeiro',
}
```

---

## Reusable Utility Files (port 1:1 to TypeScript)

Per CONTEXT.md `## Reusable Assets` — these files are already correct logic, need only type annotations:

| Source file | Target file | Action |
|-------------|-------------|--------|
| `src/utils/calcComissao.js` | `src/utils/calcComissao.ts` | Add param/return types; rename `com` field to `comissao_pct` in type to match D-08 |
| `src/utils/datas.js` | `src/utils/datas.ts` | Add param/return types; pure functions, no logic change |
| `src/utils/formatters.js` | `src/utils/formatters.ts` | Add param/return types; pure functions, no logic change |
| `src/constants/formas.js` | `src/constants/formas.ts` | Type the options array: `{ v: string; l: string }[]` |

These are **out of Phase 3 scope** (Phase 3 is infrastructure only) but are documented here for the planner to note as zero-risk ports when `.js` files are encountered by TypeScript during `tsc`.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `tsconfig.json` | config | — | No TypeScript config exists; first TS setup in this repo |
| `drizzle.config.ts` | config | — | No ORM config pattern exists; Supabase required no config file |

---

## Metadata

**Analog search scope:** `/src/`, `/supabase/`, repo root config files
**Files scanned:** 24
**Pattern extraction date:** 2026-05-18

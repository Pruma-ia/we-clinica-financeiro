<!-- refreshed: 2026-05-18 -->
# Architecture

**Analysis Date:** 2026-05-18

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│                        Browser / SPA (React + Vite)                  │
│  `src/main.jsx` → `src/App.jsx`                                      │
├─────────────────┬────────────────────────────────────────────────────┤
│  Auth Gate      │            Authenticated Shell                     │
│ `src/modules/   │  Sidebar (`src/components/layout/Sidebar.jsx`)     │
│  auth/`         │  PeriodoBar (`src/components/layout/PeriodoBar.jsx`)│
└────────┬────────┴──────────────────────┬───────────────────────────┘
         │                               │
         ▼                               ▼
┌──────────────────┐      ┌─────────────────────────────────────────────┐
│  Module Pages    │      │           React Context Providers            │
│  `src/modules/`  │      │  AuthCtx (`src/hooks/useAuth.jsx`)           │
│  (15 routes)     │      │  PeriodoCtx (`src/components/layout/         │
└────────┬─────────┘      │             PeriodoBar.jsx`)                 │
         │                └─────────────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     Data Hooks (`src/hooks/`)                         │
│  useLancamentos · usePrestadores · useClientes · usePlano             │
│  usePremissas · useAuth                                               │
└────────┬─────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      Library Layer (`src/lib/`)                       │
│  supabase.js (singleton client) · auth.js · audit.js                 │
└────────┬─────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       Supabase (BaaS)                                 │
│  PostgreSQL · Auth (Google OAuth) · Row Level Security               │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `main.jsx` | React DOM mount, StrictMode | `src/main.jsx` |
| `App.jsx` | Router, context providers, auth gate | `src/App.jsx` |
| `AuthProvider` | Session management, perfil loading | `src/hooks/useAuth.jsx` |
| `PeriodoProvider` | Global date-range filter state | `src/components/layout/PeriodoBar.jsx` |
| `Sidebar` | Navigation, user avatar, sign-out | `src/components/layout/Sidebar.jsx` |
| `PeriodoBar` | Period picker UI, shortcut pills | `src/components/layout/PeriodoBar.jsx` |
| Data hooks | CRUD + business logic per entity | `src/hooks/use*.js` |
| Module pages | Feature UI, local state, calls hooks | `src/modules/<name>/*.jsx` |
| `supabase.js` | Singleton Supabase client | `src/lib/supabase.js` |
| `auth.js` | Google OAuth, whitelist lookup | `src/lib/auth.js` |
| `audit.js` | Fire-and-forget audit log writes | `src/lib/audit.js` |
| Utilities | Pure functions (calc, format, dates) | `src/utils/` |
| Constants | Color palette, payment-form options | `src/constants/` |
| UI primitives | Reusable presentational atoms | `src/components/ui/` |
| Shared components | Cross-module composed pieces | `src/components/shared/` |
| `ModuloStub` | Placeholder for unbuilt modules | `src/modules/_stub/ModuloStub.jsx` |

## Pattern Overview

**Overall:** Feature-module SPA with hook-based data access

**Key Characteristics:**
- All Supabase calls live in hooks (`src/hooks/`), never directly in module pages
- Module pages are the "container" layer: they call hooks, manage local UI state, and compose UI components
- Shared UI primitives (`src/components/ui/`) are purely presentational; they receive props and render nothing domain-specific
- Two global React contexts (`AuthCtx`, `PeriodoCtx`) are provided at the root and consumed via hooks (`useAuth`, `usePeriodo`)
- Business logic (commission calculation, payment-friday rule) lives in `src/utils/`, not in hooks or components

## Layers

**Entry / Bootstrap:**
- Purpose: Mount the React tree, provide global context
- Location: `src/main.jsx`, `src/App.jsx`
- Contains: `BrowserRouter`, `AuthProvider`, `PeriodoProvider`, `Routes`
- Depends on: All module imports, hooks
- Used by: Nothing — this is the root

**Global Contexts:**
- Purpose: Auth state and global period filter accessible anywhere
- Location: `src/hooks/useAuth.jsx`, `src/components/layout/PeriodoBar.jsx`
- Contains: `AuthCtx`, `PeriodoCtx`, provider components, consumer hooks
- Depends on: `src/lib/supabase.js`, `src/lib/auth.js`
- Used by: Module pages, layout components

**Module Pages:**
- Purpose: Feature screens; own local UI state and orchestrate hooks
- Location: `src/modules/<module-name>/*.jsx`
- Contains: One page component per module, local `useState` for drawers/filters
- Depends on: Data hooks, UI components, utils, constants, `src/lib/audit.js`
- Used by: `App.jsx` router

**Data Hooks:**
- Purpose: Supabase CRUD + domain business rules (e.g., commission lifecycle)
- Location: `src/hooks/use*.js`
- Contains: `useState`, `useEffect`, `useCallback`, direct `supabase.from(...)` calls
- Depends on: `src/lib/supabase.js`, `src/utils/`
- Used by: Module pages

**Library Layer:**
- Purpose: Singleton client and cross-cutting services (auth, audit)
- Location: `src/lib/`
- Contains: Supabase client factory, Google OAuth helpers, audit insert helper
- Depends on: `@supabase/supabase-js`, `import.meta.env` vars
- Used by: Hooks, module pages (audit calls)

**Utilities:**
- Purpose: Pure stateless functions; no React, no Supabase
- Location: `src/utils/`
- Contains: `calcComissao.js`, `datas.js`, `formatters.js`
- Depends on: Nothing internal
- Used by: Hooks, module pages, shared components

**UI Primitives:**
- Purpose: Reusable atoms — no domain knowledge
- Location: `src/components/ui/`
- Contains: `Badge`, `Btn`, `Card`, `Drawer`, `Empty`, `Field`, `Kpi`, `Modal`, `Pill`, `TH`
- Depends on: `src/constants/colors.js`
- Used by: Module pages, shared components, layout components

**Constants:**
- Purpose: Design tokens and domain enumerations
- Location: `src/constants/`
- Contains: `colors.js` (CSS-in-JS palette), `formas.js` (payment methods)
- Depends on: Nothing
- Used by: All layers above

## Data Flow

### Authenticated Page Load

1. `main.jsx` renders `<App>` inside `StrictMode` (`src/main.jsx:5`)
2. `App.jsx` wraps tree in `AuthProvider` + `PeriodoProvider` (`src/App.jsx:31-37`)
3. `AuthProvider` calls `supabase.auth.getSession()` → loads `session`, then calls `fetchPerfilPermitido(email)` (`src/hooks/useAuth.jsx:16-27`)
4. `Root` reads `{ loading, user, perfil }` from `useAuth()`; renders `LoginPage` if no user, `AcessoNegado` if no perfil (`src/App.jsx:40-56`)
5. Authenticated: shell renders `Sidebar` + `PeriodoBar` + `<Routes>` (`src/App.jsx:58-86`)

### CRUD Operation (e.g., create Lancamento)

1. Module page calls `useLancamentos()` to get `{ create }` (`src/hooks/useLancamentos.js:171`)
2. `create(payload, ctx)` in hook inserts into `lancamentos` via Supabase (`src/hooks/useLancamentos.js:42-68`)
3. If receita + prestador_id: hook auto-creates paired commission entry using `buildComissaoLanc()` from `src/utils/calcComissao.js`
4. Hook calls `fetchAll()` to refresh local state (`src/hooks/useLancamentos.js:67`)
5. Module page calls `logAcao(perfil, acao, entidade)` for the audit trail (`src/lib/audit.js:4`)

### Commission Lifecycle

1. Receita created with `prestador_id` → commission `lancamento` auto-inserted with `status='projecao'`, `auto_comissao=true`, `ref_lanc_id=receita.id`
2. Receita updated to `status='recebido'` → commission upgraded to `status='pendente'`, `sexta` date calculated via `getPaymentFriday()` (`src/utils/datas.js:4`)
3. Admin manually marks commission `status='pago'` via `pagarComissao()` in `useLancamentos`
4. Admin can reverse via `estornarComissao()` (back to `pendente`)
5. Receita deleted → FK `on delete cascade` removes commission automatically

### Period Filter Flow

1. `PeriodoBar` updates `PeriodoCtx` (`ini`, `fim`) on user input
2. Module pages read `const { ini, fim } = usePeriodo()` and filter their local data arrays with `useMemo`
3. No re-fetch is triggered; filtering is client-side on already-loaded data

**State Management:**
- Auth state: `AuthCtx` (React context, module-level singleton via `AuthProvider`)
- Period filter: `PeriodoCtx` (React context, `PeriodoProvider`)
- Server data: local `useState` inside each data hook (no shared store — each hook instance is independent)
- UI state (drawers, filters): local `useState` inside module page components

## Key Abstractions

**Data Hook Pattern:**
- Purpose: Encapsulate entity CRUD + refetch cycle
- Examples: `src/hooks/useLancamentos.js`, `src/hooks/useClientes.js`, `src/hooks/usePrestadores.js`, `src/hooks/usePlano.js`, `src/hooks/usePremissas.js`
- Pattern: `useState([])` + `useCallback(fetchAll)` + `useEffect(() => fetchAll(), [fetchAll])` + CRUD functions that call `fetchAll()` after mutation

**ModuloStub:**
- Purpose: Placeholder page for modules with Supabase backend ready but UI not yet built
- Examples: `src/modules/dre/DRE.jsx`, `src/modules/fluxoCaixa/FluxoCaixa.jsx`, `src/modules/contas/ContasReceberPagar.jsx`, `src/modules/conciliacao/Conciliacao.jsx`, `src/modules/cicloFinanceiro/CicloFinanceiro.jsx`, `src/modules/vendas/RelatorioVendas.jsx`, `src/modules/premissas/Premissas.jsx`, `src/modules/clientes/Clientes.jsx`, `src/modules/planoContas/PlanoContas.jsx`
- Pattern: `return <ModuloStub titulo="..." descricao="..." todo={[...]} />`

**CSS-in-JS via Inline Styles + Color Constants:**
- Purpose: Consistent theming without a CSS framework
- Examples: Every component imports from `src/constants/colors.js`
- Pattern: `import { TEAL, BDR, TXT } from '../../constants/colors.js'` then `style={{ color: TEAL }}`

## Entry Points

**Application Root:**
- Location: `src/main.jsx`
- Triggers: Browser loads `index.html` which loads `src/main.jsx` as ES module
- Responsibilities: Mount React tree into `#root` DOM node

**App Shell:**
- Location: `src/App.jsx`
- Triggers: Rendered by `main.jsx`
- Responsibilities: Router setup, context providers, auth gate, layout shell, route definitions

**Supabase Client:**
- Location: `src/lib/supabase.js`
- Triggers: Imported by any file needing DB/Auth access
- Responsibilities: Create and export the singleton `supabase` client; reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Architectural Constraints

- **Global state:** Two module-level context singletons — `AuthCtx` (`src/hooks/useAuth.jsx:5`) and `PeriodoCtx` (`src/components/layout/PeriodoBar.jsx:6`). All other state is local to hook or component instances.
- **No shared data store:** Each hook instance (`useLancamentos`, etc.) maintains its own independent `useState` array. If the same hook is called in two sibling components, they fetch independently and hold separate copies. Currently this is fine because hooks are called once at the page level.
- **Client-side filtering only:** Period and category filters are applied with `useMemo` on in-memory arrays. No server-side filtering is used, meaning all rows for an entity are always fetched.
- **No TypeScript:** The entire codebase is `.jsx`/`.js` with no type annotations. JSDoc is absent.
- **No test files:** Zero test infrastructure exists at this scaffold stage.
- **Styling approach:** All styling is inline style objects. No CSS modules, no Tailwind, no CSS-in-JS library. Colors are imported from `src/constants/colors.js`.
- **Threading:** Single-threaded browser event loop. No Web Workers.
- **Circular imports:** None detected. Dependency direction flows strictly downward: pages → hooks → lib → (none).

## Anti-Patterns

### Admin module bypasses data hooks

**What happens:** `PainelAdmin.jsx` calls `supabase.from('usuarios_permitidos')` directly instead of using a dedicated hook (`src/modules/admin/PainelAdmin.jsx:20-29`).
**Why it's wrong:** Breaks the convention that all Supabase calls live in `src/hooks/`. Makes the pattern inconsistent and harder to mock or reuse.
**Do this instead:** Create `src/hooks/useUsuariosPermitidos.js` following the same pattern as `src/hooks/useClientes.js` and use it in `PainelAdmin`.

### `LogAuditoria` also bypasses hooks

**What happens:** `src/modules/auditoria/LogAuditoria.jsx` calls `supabase.from('audit_log')` inline in `useEffect`.
**Why it's wrong:** Same violation — Supabase calls should live in hooks, not modules.
**Do this instead:** Create `src/hooks/useAuditLog.js` and consume it in `LogAuditoria`.

### Independent hook instances per page cause duplicate fetches

**What happens:** Any page that calls both `useLancamentos()` and another hook (e.g., `Comissoes.jsx` and `Dashboard.jsx`) each independently fetch all lancamentos rows on mount.
**Why it's wrong:** No shared cache — N pages open means N identical fetches. Adding `useLancamentos` to a new component triggers another full table scan.
**Do this instead:** Lift the hook to a shared provider context, or introduce a lightweight cache layer (React Query / SWR).

## Error Handling

**Strategy:** Errors from Supabase are logged to `console.error` with a prefix tag. UI-level errors use `alert()` for admin forms. Audit log failures are silently swallowed.

**Patterns:**
- Hook fetch errors: `if (error) console.error('[lancamentos]', error)` — data silently stays at previous state
- Hook mutation errors: `if (error) throw error` — caller must handle
- Admin form errors: `if (error) return alert(error.message)` — blocking native dialog
- Audit failures: `catch (e) { console.error('[audit] log falhou', e) }` — silent, never blocks UX (`src/lib/audit.js:15`)
- Auth errors: `signInWithGoogle` throws; `LoginPage` catches and sets local error state (`src/modules/auth/LoginPage.jsx:10-13`)

## Cross-Cutting Concerns

**Audit Logging:** `logAcao(perfil, acao, entidade, detalhes?)` in `src/lib/audit.js`. Called explicitly in module pages after mutations. Not wired to hook mutations themselves — manual call is required at the call site.

**Authentication / Authorization:** Two-layer check. Layer 1: Supabase Auth session (Google OAuth). Layer 2: `usuarios_permitidos` whitelist table checked by `fetchPerfilPermitido()`. RLS policies on all tables enforce `is_permitido()` server-side. Admin-only routes guarded by `perfil.role === 'admin'` check in `App.jsx:78`.

**Period Filtering:** `PeriodoCtx` provides `{ ini, fim }` globally. Each module page reads it and applies `useMemo` filter on local data. Not enforced at the fetch layer.

**Design System:** Color palette in `src/constants/colors.js` (13 named tokens). Typography: DM Sans loaded from Google Fonts in `index.html:8`. All spacing, radius, and layout values are hardcoded inline per component.

---

*Architecture analysis: 2026-05-18*

# Codebase Structure

**Analysis Date:** 2026-05-18

## Directory Layout

```
we-clinica-financeiro/
├── src/
│   ├── main.jsx                    # React DOM entry point
│   ├── App.jsx                     # Router, providers, auth gate, layout shell
│   ├── components/
│   │   ├── layout/                 # Chrome: sidebar, top bar, page header
│   │   │   ├── PageHeader.jsx
│   │   │   ├── PeriodoBar.jsx      # Also exports PeriodoProvider + usePeriodo
│   │   │   └── Sidebar.jsx
│   │   ├── shared/                 # Domain-aware reusable blocks
│   │   │   └── MargemComposicao.jsx
│   │   └── ui/                     # Pure presentational atoms
│   │       ├── Badge.jsx
│   │       ├── Btn.jsx
│   │       ├── Card.jsx
│   │       ├── Drawer.jsx
│   │       ├── Empty.jsx
│   │       ├── Field.jsx           # Exports Inp, Sel, TxA
│   │       ├── Kpi.jsx
│   │       ├── Modal.jsx
│   │       ├── Pill.jsx
│   │       └── TH.jsx
│   ├── constants/                  # Design tokens and domain enums
│   │   ├── colors.js               # 13 named CSS-in-JS color tokens
│   │   └── formas.js               # Payment method options + lookup map
│   ├── hooks/                      # Data hooks (Supabase CRUD + business logic)
│   │   ├── useAuth.jsx             # AuthProvider + useAuth + AuthCtx
│   │   ├── useClientes.js
│   │   ├── useLancamentos.js       # Central hook; commission lifecycle
│   │   ├── usePlano.js             # Plano de contas
│   │   ├── usePremissas.js         # Global financial assumptions
│   │   └── usePrestadores.js
│   ├── lib/                        # Singleton clients and cross-cutting services
│   │   ├── audit.js                # logAcao() — fire-and-forget audit writes
│   │   ├── auth.js                 # signInWithGoogle, signOut, fetchPerfilPermitido
│   │   └── supabase.js             # Supabase client singleton
│   ├── modules/                    # Feature pages, one directory per route
│   │   ├── _stub/
│   │   │   └── ModuloStub.jsx      # Placeholder for unbuilt module UIs
│   │   ├── admin/
│   │   │   └── PainelAdmin.jsx     # User management (admin-only)
│   │   ├── auditoria/
│   │   │   └── LogAuditoria.jsx
│   │   ├── auth/
│   │   │   ├── AcessoNegado.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── cicloFinanceiro/
│   │   │   └── CicloFinanceiro.jsx # Stub
│   │   ├── clientes/
│   │   │   └── Clientes.jsx        # Stub
│   │   ├── comissoes/
│   │   │   └── Comissoes.jsx       # Built — commission board
│   │   ├── conciliacao/
│   │   │   └── Conciliacao.jsx     # Stub
│   │   ├── contas/
│   │   │   └── ContasReceberPagar.jsx  # Stub
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx       # Built — KPI overview
│   │   ├── dre/
│   │   │   └── DRE.jsx             # Stub
│   │   ├── fluxoCaixa/
│   │   │   └── FluxoCaixa.jsx      # Stub
│   │   ├── lancamentos/
│   │   │   └── Lancamentos.jsx     # Built — transaction ledger + forms
│   │   ├── planoContas/
│   │   │   └── PlanoContas.jsx     # Stub
│   │   ├── premissas/
│   │   │   └── Premissas.jsx       # Stub
│   │   ├── prestadores/
│   │   │   └── Prestadores.jsx     # Stub
│   │   └── vendas/
│   │       └── RelatorioVendas.jsx # Stub
│   └── utils/                      # Pure stateless helpers
│       ├── calcComissao.js         # calcM(), buildComissaoLanc()
│       ├── datas.js                # Date math, month range, payment friday
│       └── formatters.js          # fmtR, fmtP, fmtDataBR, today, etc.
├── supabase/
│   └── schema.sql                  # Full DB schema + RLS policies + seed data
├── .planning/
│   └── codebase/                   # GSD codebase map documents
├── .env.example                    # Lists required env vars (no secrets)
├── index.html                      # HTML shell; loads DM Sans, mounts #root
├── package.json
├── package-lock.json
├── vite.config.js                  # Vite + React plugin, env var bridging
└── vercel.ts                       # Vercel deployment config
```

## Directory Purposes

**`src/components/layout/`:**
- Purpose: Application chrome — always-visible layout elements
- Contains: `Sidebar`, `PeriodoBar` (also doubles as context provider), `PageHeader`
- Key files: `PeriodoBar.jsx` exports both the UI component AND `PeriodoProvider` + `usePeriodo`

**`src/components/shared/`:**
- Purpose: Domain-aware reusable components used across multiple modules
- Contains: `MargemComposicao` — the revenue breakdown block (uses `calcM`, `formatters`, `constants`)
- Key files: `MargemComposicao.jsx`

**`src/components/ui/`:**
- Purpose: Pure presentational atoms; no business logic, no Supabase, no domain imports
- Contains: Form controls (`Field`, `Btn`), display atoms (`Badge`, `Kpi`, `Pill`, `TH`), containers (`Card`, `Drawer`, `Modal`), feedback (`Empty`)
- Key files: `Field.jsx` exports three named components (`Inp`, `Sel`, `TxA`)

**`src/constants/`:**
- Purpose: Shared static values — design tokens and domain enumerations
- Contains: `colors.js` (13 named hex values), `formas.js` (7 payment methods + reverse lookup)

**`src/hooks/`:**
- Purpose: All Supabase data access and associated domain business logic
- Contains: One hook file per entity; `useAuth.jsx` is the exception (also provides context)
- Key files: `useLancamentos.js` is the most complex — manages the commission lifecycle

**`src/lib/`:**
- Purpose: Infrastructure singletons and cross-cutting services
- Contains: Supabase client (`supabase.js`), auth helpers (`auth.js`), audit helper (`audit.js`)
- Key files: `supabase.js` — every Supabase call in the app goes through this singleton

**`src/modules/`:**
- Purpose: One directory per application route; contains the page component
- Contains: 15 feature directories + `_stub/` placeholder
- Key distinction: **Built modules** (`dashboard`, `lancamentos`, `comissoes`) have full UI. **Stub modules** (9 others) render `<ModuloStub>` — backend schema is ready, UI is pending.

**`src/utils/`:**
- Purpose: Pure functions with no side effects, no React, no Supabase
- Contains: Financial calculation (`calcComissao.js`), date utilities (`datas.js`), formatting (`formatters.js`)

**`supabase/`:**
- Purpose: Database schema source of truth
- Contains: `schema.sql` — all table DDL, indexes, RLS policies, helper functions, seed data
- Generated: No — hand-authored
- Committed: Yes

## Key File Locations

**Entry Points:**
- `src/main.jsx`: React DOM mount
- `src/App.jsx`: Router, providers, auth gate
- `index.html`: HTML shell, font loading

**Configuration:**
- `vite.config.js`: Build tool, port 5173, env var bridging for Vercel
- `.env.example`: Documents `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `vercel.ts`: Vercel deployment config

**Core Logic:**
- `src/hooks/useLancamentos.js`: Commission lifecycle, primary CRUD
- `src/lib/supabase.js`: Supabase client singleton
- `src/lib/auth.js`: Google OAuth + whitelist check
- `src/utils/calcComissao.js`: Financial margin and commission computation
- `supabase/schema.sql`: Full database schema

**Testing:**
- None — no test files exist

## Naming Conventions

**Files:**
- React components: PascalCase matching the exported default (`Dashboard.jsx`, `Sidebar.jsx`)
- Hooks: camelCase with `use` prefix (`useLancamentos.js`, `useAuth.jsx`)
- Libraries/utilities: camelCase (`supabase.js`, `calcComissao.js`, `formatters.js`)
- Constants: camelCase (`colors.js`, `formas.js`)

**Directories:**
- Module directories: camelCase matching domain concept (`lancamentos`, `cicloFinanceiro`, `planoContas`)
- Component directories: camelCase by category (`ui`, `layout`, `shared`)

**Exports:**
- Module pages: single `export default function <Name>()` — named same as file
- Hooks: named exports (`export function useLancamentos`)
- UI atoms: `export default function <Name>` — one per file
- `Field.jsx` exception: multiple named exports (`Inp`, `Sel`, `TxA`)

**Constants:**
- Color tokens: `UPPER_SNAKE_CASE` (`TEAL`, `BDR`, `TXT`)
- Payment form options: `UPPER_SNAKE_CASE` (`FORMAS_OPTS`, `FORMAS_L`)

## Where to Add New Code

**New module / feature route:**
- Create directory: `src/modules/<moduleName>/`
- Primary component: `src/modules/<moduleName>/<ModuleName>.jsx`
- Register route in: `src/App.jsx` (import + `<Route path="/<path>" element={<ModuleName />} />`)
- Add nav link in: `src/components/layout/Sidebar.jsx` (append to `ITENS` array)
- If starting as a stub: use `<ModuloStub titulo="..." descricao="..." todo={[...]} />`

**New data entity / Supabase table:**
- Hook: `src/hooks/use<EntityName>.js` — follow the pattern in `src/hooks/useClientes.js`
- Schema: add table + RLS policy to `supabase/schema.sql`

**New shared UI atom:**
- Implementation: `src/components/ui/<Name>.jsx`
- Must receive all data via props; must not import from `src/hooks/` or `src/lib/`
- Import colors from `src/constants/colors.js`

**New domain-aware shared component:**
- Implementation: `src/components/shared/<Name>.jsx`
- May import from `src/utils/` and `src/constants/` but not from `src/hooks/` or `src/lib/`

**New utility function:**
- Date/time helpers: `src/utils/datas.js`
- Formatting helpers: `src/utils/formatters.js`
- Financial calculations: `src/utils/calcComissao.js`
- For new domain: create `src/utils/<domainName>.js`

**New constant / token:**
- Color: add to `src/constants/colors.js`
- Payment method: add to `src/constants/formas.js`
- Other enum: create `src/constants/<name>.js`

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents (STACK, INTEGRATIONS, ARCHITECTURE, STRUCTURE, etc.)
- Generated: By GSD map-codebase commands
- Committed: Yes

**`supabase/`:**
- Purpose: Database schema source of truth; run once in Supabase SQL editor
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-05-18*

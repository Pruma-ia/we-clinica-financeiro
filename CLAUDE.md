<!-- GSD:project-start source:PROJECT.md -->
## Project

**We Clínica — Sistema Financeiro**

Sistema financeiro privado para a We Clínica (clínica médica). Painel web SaaS com dashboards, lançamentos, DRE, fluxo de caixa, contas a pagar/receber, comissões, prestadores e relatório de vendas. Acesso restrito a usuários autorizados pelo administrador via Google OAuth. Nenhum cadastro público.

**Core Value:** Gestores da We Clínica conseguem visualizar e gerenciar as finanças da clínica em tempo real, de qualquer lugar, sem depender de planilhas.

### Constraints

- **Timeline**: MVP pronto para amanhã — escopo fixo, sem novas features
- **Visual**: Usar exclusivamente Pruma design system — não criar assets visuais sem aprovação
- **Auth**: Google OAuth only — sem email/password
- **Deploy**: Vercel (frontend) + Supabase (banco + auth) — sem mudança de stack
- **Autonomia**: Usuário não deve precisar rodar comandos no terminal — Claude executa tudo que for possível via ferramentas
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript (ES Modules) - All application source code (`src/`)
- TypeScript - Vercel deployment config only (`vercel.ts`)
- SQL (PostgreSQL) - Database schema and RLS policies (`supabase/schema.sql`)
- HTML - Single entry point (`index.html`)
- CSS - Inline styles and global base styles in `index.html`
## Runtime
- Browser (client-side SPA — no Node.js server runtime)
- Node.js used only for build tooling (v25.x detected in dev environment)
- npm
- Lockfile: `package-lock.json` present (lockfileVersion 3)
## Frameworks
- React 18.3.1 - UI rendering, context, hooks (`src/`)
- React Router DOM 6.26.2 - Client-side routing (`src/App.jsx`)
- Vite 5.4.8 - Dev server (port 5173) and production bundler (`vite.config.js`)
- `@vitejs/plugin-react` 4.3.2 - JSX transform for Vite
- Not configured — no test framework detected
## Key Dependencies
- `@supabase/supabase-js` 2.45.4 - Database client, auth, and realtime (`src/lib/supabase.js`)
- `react` 18.3.1 - Core UI framework
- `react-dom` 18.3.1 - DOM renderer
- `react-router-dom` 6.26.2 - SPA routing
- `@vercel/config` 0.5.0 (devDependency) - Vercel deployment configuration typing (`vercel.ts`)
- Google Fonts CDN — DM Sans (weights 400, 500, 600, 700) loaded in `index.html`
## Configuration
- Dev: `.env.local` (gitignored) with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Production (Vercel): Supabase Marketplace integration injects `SUPABASE_URL` and `SUPABASE_ANON_KEY` (without `VITE_` prefix)
- `vite.config.js` normalizes both naming conventions at build time
- `.env.example` documents required variables
- `vite.config.js` — Vite configuration with env normalization
- `vercel.ts` — Vercel deployment config: framework `vite`, build command `npm run build`, output `dist/`
## Platform Requirements
- Node.js (v18+ recommended, v25.x confirmed working)
- npm
- Supabase project credentials
- Vercel (SPA hosting with client-side routing fallback via Vite framework preset)
- Supabase project (PostgreSQL database + Auth)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase matching the exported default function name (`Lancamentos.jsx`, `PainelAdmin.jsx`, `MargemComposicao.jsx`)
- Hooks: camelCase with `use` prefix (`useLancamentos.js`, `useAuth.jsx`)
- Utility modules: camelCase describing function group (`formatters.js`, `calcComissao.js`, `datas.js`)
- Constant modules: camelCase (`colors.js`, `formas.js`)
- Lib modules: camelCase (`supabase.js`, `auth.js`, `audit.js`)
- Extensions: `.jsx` for files containing JSX; `.js` for pure logic (hooks, utils, constants, lib)
- Page-level module components: PascalCase default export matching file name (`export default function Lancamentos()`)
- Utility functions: camelCase named exports (`fmtR`, `fmtP`, `fmtDataBR`, `calcM`, `buildComissaoLanc`, `getPaymentFriday`)
- Helper/private functions scoped inside a file: camelCase or short PascalCase when they are local sub-components (`function Th()`, `function Td()`, `function StatusBadge()`, `function FormLancamento()`, `function Linha()`)
- Context hooks: `useX` pattern re-exported from the same file as the Provider (`usePeriodo`, `useAuth`)
- Internal helpers: underscore-prefix for truly private async helpers (`_getContaComissaoId`)
- camelCase for all local variables and state (`filtroTipo`, `todosMeses`, `visiveis`, `proxSexta`)
- Short single-letter variables acceptable for loop-local values or narrow scope (`v`, `s`, `m`, `p`)
- State setters always follow the `set` + PascalCase pattern (`setFiltroTipo`, `setDrawer`, `setLoading`)
- Module-level design tokens: `UPPER_SNAKE_CASE` (`COAL`, `TEAL`, `BG`, `WHITE`, `BDR`, `TXT`, `SUB`, `RED`, `OK`, `WARN`)
- Option arrays: descriptive `UPPER_SNAKE_CASE` suffixed with `_OPTS` (`FORMAS_OPTS`)
- Lookup maps derived from options: `UPPER_SNAKE_CASE` suffixed with `_L` (`FORMAS_L`)
- Navigation config arrays: single short `UPPER_SNAKE_CASE` (`ITENS`)
- PascalCase, exported as default from dedicated file
- Local sub-components (not exported, scoped to one file) may be abbreviated PascalCase (`Th`, `Td`, `StatusBadge`)
- Always `use` prefix, named exports (`export function useClientes()`, `export function useLancamentos()`)
- Context consumer hooks: `export const useX = () => useContext(XCtx)` pattern
## Code Style
- No Prettier or ESLint config file present in the repo; formatting is applied manually
- Inline style objects are the norm — no CSS files exist in `src/`
- Style objects frequently defined at module scope as named constants to avoid recreation (`labelStyle`, `hintStyle`, `fieldBase`, `inputStyle`, `palette`)
- Trailing commas in function parameters and object literals used consistently
- Single-statement arrow functions without braces used for concise reducers and simple event handlers
- No ESLint config found; the only linting signal is `// eslint-disable-next-line no-console` used explicitly in `src/lib/supabase.js`, `src/lib/auth.js`, and `src/lib/audit.js` where `console` calls are intentional
- TypeScript is not used — codebase is plain JavaScript/JSX
## Import Organization
- None configured — all imports use relative paths
- Named imports for hooks, utilities, and constants
- Default imports for components and lib modules
- Mixed named/default allowed per file as needed
## Error Handling
- Hook-level fetch errors: `if (error) console.error('[context-name]', error)` — errors are logged but do not throw; the state is set to an empty array/object as fallback
- Hook-level mutation errors (create/update/remove): `if (error) throw error` — throws propagate up to the calling component
- Component-level catch: `try { await action() } catch (e) { alert(e?.message || 'Fallback message') }` — user-facing error via `alert()`
- Auth/lib level: return `null` on error after logging, e.g. `fetchPerfilPermitido` returns `null` and logs with `console.error('[auth]')`
- Audit logging: wraps `supabase.insert` in try/catch with `console.error('[audit] log falhou', e)` — intentionally non-blocking
- Supabase client init: uses `console.warn` for missing env vars, falls back to placeholder values so the app renders
- Validation errors use `alert()` with a plain string message (`alert('Descrição e valor são obrigatórios.')`)
- Confirmation dialogs use `confirm()` before destructive operations
- Date input uses `prompt()` for quick "baixar" action
## Logging
## Comments
- Module-level comments describe business rules and non-obvious logic, written in Portuguese (the project language)
- Block comments above functions explain domain-specific rules (payment cycle, commission pairing logic)
- Inline comments on complex expressions or non-obvious state transitions
- `// eslint-disable-next-line no-console` used explicitly when console calls are intentional
- All user-facing strings, comments, and variable names with domain meaning are in Portuguese (`descricao`, `vencimento`, `prestadores`, `lancamentos`, `fetchAll`, `salvar`, `excluir`, `baixar`)
- Internal technical identifiers follow the same convention — the codebase is fully Portuguese
## Function Design
- Components receive named destructured props
- Hook CRUD functions accept `(id, payload, ctx = {})` where `ctx` carries optional related data (e.g., `{ prestadores }`)
- Utility pure functions accept plain primitives or narrow objects
- Hooks return a consistent shape: `{ data, loading, refresh, create, update, remove }` (or subset)
- Pure utilities return plain values or objects
- Async mutations return the created/updated record on success, or throw on error
## Module Design
- One default export per component file (the page/component)
- Multiple named exports from utility and field files (`Inp`, `Sel`, `TxA` from `Field.jsx`; `fmtR`, `fmtP`, `fmtDataBR`, `today`, `fmtMesAno`, `fmtDataExtenso` from `formatters.js`)
- Constants files export named constants only — no default export
- None — every import references the source file directly
## Inline Styling Convention
- Colors are always imported from `src/constants/colors.js` — never hardcoded hex values in components (except in `Badge.jsx` palette and `Btn.jsx` one-off `#FEE9E2`)
- Numeric spacing/sizing values are hardcoded inline (e.g., `padding: 22`, `borderRadius: 16`, `fontSize: 14`)
- Repeated style objects extracted to module-scope constants (`labelStyle`, `hintStyle`, `fieldBase`, `inputStyle`, `palette`, `variants`)
- Components accept a `style = {}` prop and spread it last: `{ ...baseStyle, ...style }` to allow caller overrides
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
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
- All Supabase calls live in hooks (`src/hooks/`), never directly in module pages
- Module pages are the "container" layer: they call hooks, manage local UI state, and compose UI components
- Shared UI primitives (`src/components/ui/`) are purely presentational; they receive props and render nothing domain-specific
- Two global React contexts (`AuthCtx`, `PeriodoCtx`) are provided at the root and consumed via hooks (`useAuth`, `usePeriodo`)
- Business logic (commission calculation, payment-friday rule) lives in `src/utils/`, not in hooks or components
## Layers
- Purpose: Mount the React tree, provide global context
- Location: `src/main.jsx`, `src/App.jsx`
- Contains: `BrowserRouter`, `AuthProvider`, `PeriodoProvider`, `Routes`
- Depends on: All module imports, hooks
- Used by: Nothing — this is the root
- Purpose: Auth state and global period filter accessible anywhere
- Location: `src/hooks/useAuth.jsx`, `src/components/layout/PeriodoBar.jsx`
- Contains: `AuthCtx`, `PeriodoCtx`, provider components, consumer hooks
- Depends on: `src/lib/supabase.js`, `src/lib/auth.js`
- Used by: Module pages, layout components
- Purpose: Feature screens; own local UI state and orchestrate hooks
- Location: `src/modules/<module-name>/*.jsx`
- Contains: One page component per module, local `useState` for drawers/filters
- Depends on: Data hooks, UI components, utils, constants, `src/lib/audit.js`
- Used by: `App.jsx` router
- Purpose: Supabase CRUD + domain business rules (e.g., commission lifecycle)
- Location: `src/hooks/use*.js`
- Contains: `useState`, `useEffect`, `useCallback`, direct `supabase.from(...)` calls
- Depends on: `src/lib/supabase.js`, `src/utils/`
- Used by: Module pages
- Purpose: Singleton client and cross-cutting services (auth, audit)
- Location: `src/lib/`
- Contains: Supabase client factory, Google OAuth helpers, audit insert helper
- Depends on: `@supabase/supabase-js`, `import.meta.env` vars
- Used by: Hooks, module pages (audit calls)
- Purpose: Pure stateless functions; no React, no Supabase
- Location: `src/utils/`
- Contains: `calcComissao.js`, `datas.js`, `formatters.js`
- Depends on: Nothing internal
- Used by: Hooks, module pages, shared components
- Purpose: Reusable atoms — no domain knowledge
- Location: `src/components/ui/`
- Contains: `Badge`, `Btn`, `Card`, `Drawer`, `Empty`, `Field`, `Kpi`, `Modal`, `Pill`, `TH`
- Depends on: `src/constants/colors.js`
- Used by: Module pages, shared components, layout components
- Purpose: Design tokens and domain enumerations
- Location: `src/constants/`
- Contains: `colors.js` (CSS-in-JS palette), `formas.js` (payment methods)
- Depends on: Nothing
- Used by: All layers above
## Data Flow
### Authenticated Page Load
### CRUD Operation (e.g., create Lancamento)
### Commission Lifecycle
### Period Filter Flow
- Auth state: `AuthCtx` (React context, module-level singleton via `AuthProvider`)
- Period filter: `PeriodoCtx` (React context, `PeriodoProvider`)
- Server data: local `useState` inside each data hook (no shared store — each hook instance is independent)
- UI state (drawers, filters): local `useState` inside module page components
## Key Abstractions
- Purpose: Encapsulate entity CRUD + refetch cycle
- Examples: `src/hooks/useLancamentos.js`, `src/hooks/useClientes.js`, `src/hooks/usePrestadores.js`, `src/hooks/usePlano.js`, `src/hooks/usePremissas.js`
- Pattern: `useState([])` + `useCallback(fetchAll)` + `useEffect(() => fetchAll(), [fetchAll])` + CRUD functions that call `fetchAll()` after mutation
- Purpose: Placeholder page for modules with Supabase backend ready but UI not yet built
- Examples: `src/modules/dre/DRE.jsx`, `src/modules/fluxoCaixa/FluxoCaixa.jsx`, `src/modules/contas/ContasReceberPagar.jsx`, `src/modules/conciliacao/Conciliacao.jsx`, `src/modules/cicloFinanceiro/CicloFinanceiro.jsx`, `src/modules/vendas/RelatorioVendas.jsx`, `src/modules/premissas/Premissas.jsx`, `src/modules/clientes/Clientes.jsx`, `src/modules/planoContas/PlanoContas.jsx`
- Pattern: `return <ModuloStub titulo="..." descricao="..." todo={[...]} />`
- Purpose: Consistent theming without a CSS framework
- Examples: Every component imports from `src/constants/colors.js`
- Pattern: `import { TEAL, BDR, TXT } from '../../constants/colors.js'` then `style={{ color: TEAL }}`
## Entry Points
- Location: `src/main.jsx`
- Triggers: Browser loads `index.html` which loads `src/main.jsx` as ES module
- Responsibilities: Mount React tree into `#root` DOM node
- Location: `src/App.jsx`
- Triggers: Rendered by `main.jsx`
- Responsibilities: Router setup, context providers, auth gate, layout shell, route definitions
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
### `LogAuditoria` also bypasses hooks
### Independent hook instances per page cause duplicate fetches
## Error Handling
- Hook fetch errors: `if (error) console.error('[lancamentos]', error)` — data silently stays at previous state
- Hook mutation errors: `if (error) throw error` — caller must handle
- Admin form errors: `if (error) return alert(error.message)` — blocking native dialog
- Audit failures: `catch (e) { console.error('[audit] log falhou', e) }` — silent, never blocks UX (`src/lib/audit.js:15`)
- Auth errors: `signInWithGoogle` throws; `LoginPage` catches and sets local error state (`src/modules/auth/LoginPage.jsx:10-13`)
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

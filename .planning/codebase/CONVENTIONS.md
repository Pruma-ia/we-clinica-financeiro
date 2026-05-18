# Coding Conventions

**Analysis Date:** 2026-05-18

## Naming Patterns

**Files:**
- React components: PascalCase matching the exported default function name (`Lancamentos.jsx`, `PainelAdmin.jsx`, `MargemComposicao.jsx`)
- Hooks: camelCase with `use` prefix (`useLancamentos.js`, `useAuth.jsx`)
- Utility modules: camelCase describing function group (`formatters.js`, `calcComissao.js`, `datas.js`)
- Constant modules: camelCase (`colors.js`, `formas.js`)
- Lib modules: camelCase (`supabase.js`, `auth.js`, `audit.js`)
- Extensions: `.jsx` for files containing JSX; `.js` for pure logic (hooks, utils, constants, lib)

**Functions / Exports:**
- Page-level module components: PascalCase default export matching file name (`export default function Lancamentos()`)
- Utility functions: camelCase named exports (`fmtR`, `fmtP`, `fmtDataBR`, `calcM`, `buildComissaoLanc`, `getPaymentFriday`)
- Helper/private functions scoped inside a file: camelCase or short PascalCase when they are local sub-components (`function Th()`, `function Td()`, `function StatusBadge()`, `function FormLancamento()`, `function Linha()`)
- Context hooks: `useX` pattern re-exported from the same file as the Provider (`usePeriodo`, `useAuth`)
- Internal helpers: underscore-prefix for truly private async helpers (`_getContaComissaoId`)

**Variables:**
- camelCase for all local variables and state (`filtroTipo`, `todosMeses`, `visiveis`, `proxSexta`)
- Short single-letter variables acceptable for loop-local values or narrow scope (`v`, `s`, `m`, `p`)
- State setters always follow the `set` + PascalCase pattern (`setFiltroTipo`, `setDrawer`, `setLoading`)

**Constants:**
- Module-level design tokens: `UPPER_SNAKE_CASE` (`COAL`, `TEAL`, `BG`, `WHITE`, `BDR`, `TXT`, `SUB`, `RED`, `OK`, `WARN`)
- Option arrays: descriptive `UPPER_SNAKE_CASE` suffixed with `_OPTS` (`FORMAS_OPTS`)
- Lookup maps derived from options: `UPPER_SNAKE_CASE` suffixed with `_L` (`FORMAS_L`)
- Navigation config arrays: single short `UPPER_SNAKE_CASE` (`ITENS`)

**Components:**
- PascalCase, exported as default from dedicated file
- Local sub-components (not exported, scoped to one file) may be abbreviated PascalCase (`Th`, `Td`, `StatusBadge`)

**Hooks:**
- Always `use` prefix, named exports (`export function useClientes()`, `export function useLancamentos()`)
- Context consumer hooks: `export const useX = () => useContext(XCtx)` pattern

## Code Style

**Formatting:**
- No Prettier or ESLint config file present in the repo; formatting is applied manually
- Inline style objects are the norm — no CSS files exist in `src/`
- Style objects frequently defined at module scope as named constants to avoid recreation (`labelStyle`, `hintStyle`, `fieldBase`, `inputStyle`, `palette`)
- Trailing commas in function parameters and object literals used consistently
- Single-statement arrow functions without braces used for concise reducers and simple event handlers

**Linting:**
- No ESLint config found; the only linting signal is `// eslint-disable-next-line no-console` used explicitly in `src/lib/supabase.js`, `src/lib/auth.js`, and `src/lib/audit.js` where `console` calls are intentional
- TypeScript is not used — codebase is plain JavaScript/JSX

## Import Organization

**Order observed across modules:**
1. React and React Router (`import { useState, useEffect } from 'react'`)
2. Internal hooks (`../../hooks/useX`)
3. Internal lib (`../../lib/X`)
4. Layout components (`../../components/layout/X`)
5. UI components (`../../components/ui/X`)
6. Shared components (`../../components/shared/X`)
7. Utility functions (`../../utils/X`)
8. Constants (`../../constants/X`)

**Path Aliases:**
- None configured — all imports use relative paths

**Import style:**
- Named imports for hooks, utilities, and constants
- Default imports for components and lib modules
- Mixed named/default allowed per file as needed

## Error Handling

**Patterns:**
- Hook-level fetch errors: `if (error) console.error('[context-name]', error)` — errors are logged but do not throw; the state is set to an empty array/object as fallback
- Hook-level mutation errors (create/update/remove): `if (error) throw error` — throws propagate up to the calling component
- Component-level catch: `try { await action() } catch (e) { alert(e?.message || 'Fallback message') }` — user-facing error via `alert()`
- Auth/lib level: return `null` on error after logging, e.g. `fetchPerfilPermitido` returns `null` and logs with `console.error('[auth]')`
- Audit logging: wraps `supabase.insert` in try/catch with `console.error('[audit] log falhou', e)` — intentionally non-blocking
- Supabase client init: uses `console.warn` for missing env vars, falls back to placeholder values so the app renders

**User feedback:**
- Validation errors use `alert()` with a plain string message (`alert('Descrição e valor são obrigatórios.')`)
- Confirmation dialogs use `confirm()` before destructive operations
- Date input uses `prompt()` for quick "baixar" action

## Logging

**Approach:** `console.error` / `console.warn` only — no logging library. All console calls are intentional and tagged with a bracketed context prefix: `[lancamentos]`, `[clientes]`, `[auth]`, `[audit]`, `[supabase]`.

**Pattern:**
```js
if (error) console.error('[context]', error)
// or
console.error('[context] description', e)
```

Audit actions (user-facing history) use `src/lib/audit.js → logAcao()` which writes to the `audit_log` Supabase table, not to the console.

## Comments

**When to Comment:**
- Module-level comments describe business rules and non-obvious logic, written in Portuguese (the project language)
- Block comments above functions explain domain-specific rules (payment cycle, commission pairing logic)
- Inline comments on complex expressions or non-obvious state transitions
- `// eslint-disable-next-line no-console` used explicitly when console calls are intentional

**Language:**
- All user-facing strings, comments, and variable names with domain meaning are in Portuguese (`descricao`, `vencimento`, `prestadores`, `lancamentos`, `fetchAll`, `salvar`, `excluir`, `baixar`)
- Internal technical identifiers follow the same convention — the codebase is fully Portuguese

## Function Design

**Size:** Functions are generally small and focused. Module-level page components (`Lancamentos`, `Comissoes`) are the largest files (~368 lines), containing the full form logic inline. Utility and hook files remain under 50 lines of logic each.

**Parameters:**
- Components receive named destructured props
- Hook CRUD functions accept `(id, payload, ctx = {})` where `ctx` carries optional related data (e.g., `{ prestadores }`)
- Utility pure functions accept plain primitives or narrow objects

**Return Values:**
- Hooks return a consistent shape: `{ data, loading, refresh, create, update, remove }` (or subset)
- Pure utilities return plain values or objects
- Async mutations return the created/updated record on success, or throw on error

## Module Design

**Exports:**
- One default export per component file (the page/component)
- Multiple named exports from utility and field files (`Inp`, `Sel`, `TxA` from `Field.jsx`; `fmtR`, `fmtP`, `fmtDataBR`, `today`, `fmtMesAno`, `fmtDataExtenso` from `formatters.js`)
- Constants files export named constants only — no default export

**Barrel Files:**
- None — every import references the source file directly

## Inline Styling Convention

All styles are applied via the `style` prop using JavaScript objects. There are no CSS class names, CSS modules, or CSS files in `src/`.

**Design token usage:**
- Colors are always imported from `src/constants/colors.js` — never hardcoded hex values in components (except in `Badge.jsx` palette and `Btn.jsx` one-off `#FEE9E2`)
- Numeric spacing/sizing values are hardcoded inline (e.g., `padding: 22`, `borderRadius: 16`, `fontSize: 14`)
- Repeated style objects extracted to module-scope constants (`labelStyle`, `hintStyle`, `fieldBase`, `inputStyle`, `palette`, `variants`)

**Merging/overriding:**
- Components accept a `style = {}` prop and spread it last: `{ ...baseStyle, ...style }` to allow caller overrides

---

*Convention analysis: 2026-05-18*

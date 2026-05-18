# Codebase Concerns

**Analysis Date:** 2026-05-18

---

## Tech Debt

**JavaScript instead of TypeScript across entire codebase:**
- Issue: All source files use `.jsx` / `.js` with zero TypeScript. No `tsconfig.json` exists. No type annotations anywhere. The only TypeScript file is `vercel.ts` (deployment config only).
- Files: `src/` — all 47 source files
- Impact: No compile-time type checking for props, Supabase response shapes, or business logic. Bugs like passing wrong column names to Supabase queries, mismatched prop types between components, or incorrect commission calculation inputs will only surface at runtime. `calcM` and `buildComissaoLanc` in `src/utils/calcComissao.js` operate on weakly-typed objects and silently coerce with `+()` casts.
- Fix approach: Add `tsconfig.json` targeting ES2022, rename files to `.tsx`/`.ts` incrementally starting with utilities and hooks. Define shared types for `Lancamento`, `Prestador`, `Cliente`, `Premissas`, `Perfil`.

**No test suite whatsoever:**
- Issue: Zero test files, no test runner config (no `vitest.config.*`, no `jest.config.*`), no testing dependencies in `package.json`.
- Files: Entire `src/`
- Impact: Business-critical calculations (commission math in `src/utils/calcComissao.js`, payment-friday algorithm in `src/utils/datas.js`) have no regression protection. The `getPaymentFriday` function uses non-obvious `(4 - dow + 7) % 7` modulo logic; a refactor could silently break payroll dates. The commission sync logic in `src/hooks/useLancamentos.js` (lines 83–121) is complex multi-step conditional code that is entirely untested.
- Fix approach: Install Vitest + React Testing Library. Cover `calcM`, `buildComissaoLanc`, `getPaymentFriday`, `getMonths`, `isAtrasado`, `fmtDataBR` first (pure functions). Then add integration tests for commission creation/update flow in `useLancamentos`.

**No ESLint / Prettier configuration:**
- Issue: No `.eslintrc.*`, `eslint.config.*`, `.prettierrc`, or `biome.json` exist. The `eslint-disable-next-line no-console` comments in `src/lib/supabase.js`, `src/lib/auth.js`, and `src/lib/audit.js` imply ESLint is assumed to be present but no config file governs it.
- Files: Project root — missing config files
- Impact: Code style is inconsistent and no automated checks gate contributions. `console.error` calls in production hooks are silently shipped.
- Fix approach: Add `eslint.config.js` with `@eslint/js` + `eslint-plugin-react-hooks`. Add `.prettierrc`. Wire to `package.json` scripts.

**Hooks instantiate independent state per consumer — no shared cache:**
- Issue: Every component that calls `useLancamentos()`, `usePrestadores()`, `useClientes()`, or `usePremissas()` creates its own state and fires its own Supabase query on mount. There is no context, shared store, or query cache (no TanStack Query, no SWR).
- Files: `src/hooks/useLancamentos.js`, `src/hooks/usePrestadores.js`, `src/hooks/useClientes.js`, `src/hooks/usePlano.js`, `src/hooks/usePremissas.js`
- Impact: When `Dashboard`, `Lancamentos`, and `Comissoes` are all active (navigated to without unmounting), each independently fetches the full `lancamentos` table. As the dataset grows this multiplies network calls and can cause subtle stale-data races: a mutation in `useLancamentos` (from `Lancamentos` module) calls `fetchAll()` on its own instance, but the `Dashboard` instance remains stale until its next mount/refresh.
- Fix approach: Lift each hook into a top-level context provider in `App.jsx` (equivalent to `useLancamentos` → `LancamentosProvider`) or migrate to TanStack Query with a shared query key per table.

**`useLancamentos.update` performs 3–5 sequential Supabase round-trips:**
- Issue: `update()` in `src/hooks/useLancamentos.js` (lines 72–125) does: (1) update the parent record, (2) query for existing paired commission, (3) conditionally delete/update/insert commission, (4) `_getContaComissaoId()` which is itself a separate query on `plano_contas`. All are sequential `await` calls. No transaction or batch.
- Files: `src/hooks/useLancamentos.js` lines 72–125, `src/utils/calcComissao.js`
- Impact: Under flaky network conditions, partial completion leaves data in an inconsistent state (e.g., parent updated but commission not updated). There is no rollback mechanism.
- Fix approach: Wrap the commission sync logic in a Supabase database function (RPC) to make it atomic. Cache `contaComissaoId` at module init rather than querying it on every write.

**`_getContaComissaoId()` called on every create and every update:**
- Issue: `src/hooks/useLancamentos.js` defines `_getContaComissaoId()` as an internal async function that queries `plano_contas` for `cod = '2.3'` on every single `create()` and `update()` call. This query is pure overhead since the value rarely changes.
- Files: `src/hooks/useLancamentos.js` lines 32–39
- Impact: Every receipt creation or update fires an extra Supabase query.
- Fix approach: Cache the value in module scope on first resolution, or pass it as a parameter from the hook's initial `fetchAll()`.

**`PlanoContas` module exposes delete but no edit for existing accounts:**
- Issue: `src/modules/planoContas/PlanoContas.jsx` only exposes `create` and `remove` from `usePlano`. `usePlano.js` (`src/hooks/usePlano.js`) exports no `update` function. Editing an existing account code requires deleting and recreating it.
- Files: `src/modules/planoContas/PlanoContas.jsx`, `src/hooks/usePlano.js`
- Impact: Operational friction — changing a category label or code requires destructive delete-and-recreate. If any `lancamentos` reference the deleted `conta_id`, the FK becomes null silently (FK is nullable with no `on delete restrict`).
- Fix approach: Add `update` to `usePlano.js`, add an edit flow in `PlanoContas.jsx`.

---

## Known Bugs

**`getPaymentFriday` returns the *same week's* Friday regardless of input day:**
- Symptoms: When `dateStr` falls on a Friday, the algorithm computes `daysUntilThu = (4 - 5 + 7) % 7 = 6`, so it advances to the *next* Thursday's Friday — which is 7 days later instead of 0. When `dateStr` is a Saturday, it returns the Friday of the *following* week (6 days later). This may cause commission payment dates to advance one week unexpectedly for payments received on Fridays or Saturdays.
- Files: `src/utils/datas.js` lines 4–11
- Trigger: Create a receipt with `data_pagamento` on a Friday or Saturday and observe `sexta` assigned to the commission.
- Workaround: None currently.

**`PeriodoBar` shortcut "3M" passes `mesAtras(2)` (only 2 months back), not 3:**
- Symptoms: Clicking "3M" in `src/components/layout/PeriodoBar.jsx` calls `applyShortcut(2)`, which calls `mesAtras(2)`. This gives a range of current month minus 2 months = 3 months total (inclusive), which is arguably correct — but "6M" calls `mesAtras(5)` (6 months inclusive) and "12M" calls `mesAtras(11)`. If a user expects "3M" to mean the last 3 complete months (excluding current), this is off by one.
- Files: `src/components/layout/PeriodoBar.jsx` lines 53–54
- Trigger: Click "3M" shortcut and inspect the `ini` date.
- Workaround: None.

**Dashboard `mesAtual` derived from `fim` only — ignores `ini` from `PeriodoBar`:**
- Symptoms: `src/modules/dashboard/Dashboard.jsx` line 22 reads `const mesAtual = (fim || today().slice(0, 7))` but ignores `ini`. When the user selects a period that does not end in the current month, KPIs still reflect `fim` month only, not the full selected range. The "Resultado do mês" and "Receita do mês" KPIs are always single-month snapshots regardless of the period bar selection.
- Files: `src/modules/dashboard/Dashboard.jsx` lines 17–26
- Trigger: Set period bar to a historical range (e.g., Jan–Mar). Dashboard KPIs remain based on the last selected `fim`.
- Workaround: None.

---

## Security Considerations

**Authorization check is client-only — no server-side route protection for admin panel:**
- Risk: `src/App.jsx` line 78 conditionally renders the `/admin` route only when `perfil.role === 'admin'`. However, a logged-in non-admin user who knows the URL can navigate to `/admin` directly. The `PainelAdmin` component calls `supabase.from('usuarios_permitidos')` directly without role verification at the component level.
- Files: `src/App.jsx` lines 78–80, `src/modules/admin/PainelAdmin.jsx`
- Current mitigation: Supabase RLS `is_admin()` policy on `usuarios_permitidos` (in `supabase/schema.sql` lines 153–155) blocks writes by non-admins at the database layer. Reads are allowed for any authenticated user (`perm_select` policy, line 150).
- Recommendations: Add a guard component that checks `perfil.role === 'admin'` and redirects at the route level. This prevents non-admins from reaching the admin UI even if they know the URL.

**`fetchPerfilPermitido` silently returns `null` on Supabase error — treated as unauthenticated:**
- Risk: If Supabase is temporarily unreachable during `onAuthStateChange`, `fetchPerfilPermitido` catches the error, logs it, and returns `null`. `useAuth` then sets `perfil = null`. `src/App.jsx` line 55 treats `!perfil` as `<AcessoNegado />`. A valid admin who loses connectivity mid-session is shown an access-denied screen rather than a degraded-but-logged-in state.
- Files: `src/lib/auth.js` lines 25–30, `src/hooks/useAuth.jsx` lines 32–36, `src/App.jsx` line 55
- Current mitigation: None.
- Recommendations: Distinguish between "not permitted" and "fetch failed." Cache the last known `perfil` in `sessionStorage` and use it as a fallback when the fetch fails.

**`audit_log` table has no RLS delete/truncate protection:**
- Risk: The RLS policy in `supabase/schema.sql` lines 158–170 applies a single `perm_all_*` policy to `audit_log` that uses `is_permitido()` for both `using` and `with check`. This grants any active permitted user the ability to `delete` audit records.
- Files: `supabase/schema.sql` lines 158–170
- Current mitigation: Only permitted users can reach the table.
- Recommendations: Split the policy: allow `select/insert` for `is_permitido()`, allow `delete/update` only for `is_admin()`. Audit logs should be append-only for operational users.

**Anon key exposed in client bundle (acceptable for Supabase, but RLS must be correct):**
- Risk: `VITE_SUPABASE_ANON_KEY` is a browser-visible build-time constant. This is the standard Supabase pattern, but it means RLS is the only access control layer. If any RLS policy contains a logic error, data is exposed.
- Files: `src/lib/supabase.js`, `vite.config.js`
- Current mitigation: RLS enabled on all tables with `is_permitido()` helper.
- Recommendations: Periodically audit RLS policies after schema changes. Consider adding Supabase's realtime row security tests.

**Supabase client falls back to `http://localhost` / `'anon'` when env vars are missing:**
- Risk: `src/lib/supabase.js` lines 11–12 create the client with `url || 'http://localhost'` and `key || 'anon'`. A misconfigured deployment (missing env vars) silently initializes a non-functional client that makes requests to localhost instead of failing fast.
- Files: `src/lib/supabase.js` lines 6–12
- Current mitigation: `console.warn` on missing vars.
- Recommendations: Throw an error instead of falling back: `if (!url || !key) throw new Error('Missing Supabase env vars')`. This makes misconfiguration immediately visible instead of silently failing at request time.

---

## Performance Bottlenecks

**`useLancamentos` fetches ALL records on every mutation — no pagination:**
- Problem: `fetchAll()` in `src/hooks/useLancamentos.js` line 20 calls `.select('*')` on `lancamentos` with no `limit` or filter. Every `create`, `update`, `remove`, `pagarComissao`, and `estornarComissao` call triggers a full table refetch via `await fetchAll()`.
- Files: `src/hooks/useLancamentos.js` lines 18–28, 67, 124, 131, 154, 168
- Cause: No optimistic updates, no partial cache invalidation, no server-side pagination.
- Improvement path: Add server-side pagination (`.range()`) for the list view. Use optimistic updates for status changes (`baixar`, `pagarComissao`) instead of refetching. Consider Supabase Realtime subscriptions to push invalidations instead of polling on every mutation.

**`Dashboard.jsx` calls `useLancamentos()` independently from `Lancamentos.jsx`:**
- Problem: When both routes are visited in a session, two separate instances of `useLancamentos` exist with independent state and independent fetch calls. Switching between routes triggers redundant re-fetches.
- Files: `src/modules/dashboard/Dashboard.jsx` line 18, `src/modules/lancamentos/Lancamentos.jsx` line 51
- Cause: No shared cache layer.
- Improvement path: Lift `useLancamentos` into a context provider or adopt TanStack Query with a shared query key.

**`Comissoes.jsx` uses sequential `for...of` loop with awaited Supabase calls to pay commissions in batch:**
- Problem: `handlePagarTodos` in `src/modules/comissoes/Comissoes.jsx` lines 84–91 loops over commissions and `await`s each `pagarComissao` call individually. For a batch of 10 commissions, this is 10 sequential round-trips, each of which also calls `fetchAll()` after completing.
- Files: `src/modules/comissoes/Comissoes.jsx` lines 84–91
- Cause: No batch update API used.
- Improvement path: Replace sequential loop with a single `supabase.from('lancamentos').update(...).in('id', ids)` call.

---

## Fragile Areas

**Commission sync logic in `useLancamentos.update` (lines 83–121):**
- Files: `src/hooks/useLancamentos.js` lines 83–121
- Why fragile: The function branches on whether a paired commission exists, whether the prestador changed, and whether the revenue status is `'recebido'`. The logic preserves `'pago'`/`'cancelado'` commission status but overwrites all other statuses. If `auto_comissao` flag gets out of sync (e.g., set manually), the orphan commission will not be found via the `.eq('auto_comissao', true)` filter.
- Safe modification: Always run the full commission sync through a server-side Supabase function (RPC) so client-side state inconsistencies cannot corrupt the sync.
- Test coverage: Zero.

**`PainelAdmin` accesses `usuarios_permitidos` directly without a hook:**
- Files: `src/modules/admin/PainelAdmin.jsx` lines 20–73
- Why fragile: Data access is mixed directly into the component rather than encapsulated in a hook like all other modules. The `fetchAll` callback is defined inline in the component. Changes to the user management schema require updating PainelAdmin directly.
- Safe modification: Extract a `useUsuariosPermitidos` hook following the same pattern as `useClientes.js`. This also removes the direct `supabase` import from a UI component.
- Test coverage: Zero.

**`LogAuditoria` hardcodes limit of 200 records with no pagination:**
- Files: `src/modules/auditoria/LogAuditoria.jsx` lines 13–22
- Why fragile: As usage grows, the audit log silently truncates at 200 records. Older entries are not accessible through any UI. Error handling for the Supabase query is absent (`.then(({ data }) =>` discards the `error` value).
- Safe modification: Add cursor-based pagination. Add error handling: `const { data, error } = await ...; if (error) setError(error.message)`.
- Test coverage: Zero.

**`today()` utility is timezone-naive:**
- Files: `src/utils/formatters.js` line 7
- Why fragile: `new Date().toISOString().slice(0, 10)` returns the UTC date. For users in UTC-3 (Brazil), between midnight and 03:00 local time, `today()` returns yesterday's date. This affects default `data_competencia`, `data_vencimento` field values in `novoLancVazio` (`src/modules/lancamentos/Lancamentos.jsx` line 30) and the `proxSexta` comparison in Dashboard and Comissoes.
- Safe modification: Replace with `new Date().toLocaleDateString('pt-BR', {year:'numeric', month:'2-digit', day:'2-digit'}).split('/').reverse().join('-')` or use a timezone-aware library.
- Test coverage: Zero.

---

## Scaling Limits

**Full-table `lancamentos` fetch:**
- Current capacity: Works comfortably with < ~500 records.
- Limit: At ~5,000+ rows, initial page load time for `Lancamentos`, `Dashboard`, and `Comissoes` degrades noticeably. At 10,000+ rows, the 200KB+ JSON payload becomes a concern on mobile.
- Scaling path: Add `.range(offset, offset+49)` pagination in `useLancamentos.fetchAll`. Filter by period on the server side instead of client side.

**`audit_log` table unbounded:**
- Current capacity: No cleanup mechanism. Grows indefinitely.
- Limit: Past ~50,000 rows, the `LogAuditoria` 200-row limit hides the problem but the table size still affects Supabase storage/query costs.
- Scaling path: Add a scheduled Supabase function to archive or delete audit entries older than 12 months.

---

## Dependencies at Risk

**`@vercel/config` in devDependencies but `vercel.ts` is TypeScript — no TypeScript compiler installed:**
- Risk: `vercel.ts` uses `import type { VercelConfig }` and TypeScript syntax. There is no `typescript` or `ts-node` in `devDependencies`. Vite transpiles `src/` JSX but does not process `vercel.ts`. This file is probably never executed and serves as documentation only.
- Impact: If someone attempts to run or import `vercel.ts` directly it will fail.
- Migration plan: Either convert to `vercel.json` (standard Vercel config) or add `typescript` as a devDependency and ensure it is only used as a type reference.

**No lockfile integrity verification in CI:**
- Risk: `package-lock.json` exists but there is no CI pipeline (`npm ci` is not enforced). `npm install` is the configured install command in `vercel.ts`, which may silently upgrade packages within semver ranges.
- Impact: Dependency drift between dev and prod environments.
- Migration plan: Change `installCommand` in deployment config to `npm ci`. Set up a basic GitHub Actions workflow that runs `npm ci && npm run build`.

---

## Missing Critical Features

**5 of 14 modules are stubs with no implementation:**
- Problem: `ContasReceberPagar`, `DRE`, `FluxoCaixa`, `RelatorioVendas`, `CicloFinanceiro`, and `Conciliacao` all render `ModuloStub` with no backend connection.
- Blocks: Users cannot view accounts receivable/payable aging, income statement, cash flow, sales reporting, or bank reconciliation. These are core financial management features listed as the system's purpose.
- Files: `src/modules/contas/ContasReceberPagar.jsx`, `src/modules/dre/DRE.jsx`, `src/modules/fluxoCaixa/FluxoCaixa.jsx`, `src/modules/vendas/RelatorioVendas.jsx`, `src/modules/cicloFinanceiro/CicloFinanceiro.jsx`, `src/modules/conciliacao/Conciliacao.jsx`

**No input validation or data sanitization beyond required-field alerts:**
- Problem: Form submissions use `alert()` for single-field presence checks (e.g., `if (!drawer.nome) return alert('Nome obrigatório.')`). There is no schema validation (no Zod, no Yup). Numeric fields accept any string — `+drawer.valor || 0` silently coerces invalid input to 0.
- Blocks: A user entering a negative commission rate, a non-numeric value for `horas`, or an invalid date string will produce incorrect but silently accepted data in the database.
- Files: `src/modules/lancamentos/Lancamentos.jsx`, `src/modules/prestadores/Prestadores.jsx`, `src/modules/premissas/Premissas.jsx`

**No error boundary — a JavaScript error in any module crashes the entire app:**
- Problem: No `React.ErrorBoundary` wrapper exists at any level. An uncaught render error in any module unmounts the root tree and displays a blank screen.
- Files: `src/App.jsx`, `src/main.jsx`
- Blocks: Any runtime error (e.g., unexpected `null` in `visiveis.map`) takes the whole application down rather than showing a graceful error state for just the affected module.

---

## Test Coverage Gaps

**Commission calculation logic — zero coverage:**
- What's not tested: `calcM` psicologo percentage path, `calcM` AT hourly path, `buildComissaoLanc` all branches, zero-commission edge cases.
- Files: `src/utils/calcComissao.js`
- Risk: Tax rate or commission rate changes silently produce wrong financial outputs.
- Priority: High

**Payment Friday algorithm — zero coverage:**
- What's not tested: `getPaymentFriday` for all 7 days of the week (especially Friday edge case noted above), DST boundary dates.
- Files: `src/utils/datas.js`
- Risk: Commission payroll dates silently shift by a week.
- Priority: High

**Authentication flow — zero coverage:**
- What's not tested: `fetchPerfilPermitido` returns null for inactive user, returns null on error, returns profile for active user. `useAuth` loading/session state transitions.
- Files: `src/lib/auth.js`, `src/hooks/useAuth.jsx`
- Risk: Auth regression goes undetected.
- Priority: High

**Commission sync in `useLancamentos.update` — zero coverage:**
- What's not tested: Create receipt → commission created; update receipt value → commission value updated; remove prestador from receipt → commission deleted; mark receipt received → commission transitions from projecao to pendente with correct sexta.
- Files: `src/hooks/useLancamentos.js`
- Risk: Multi-step sync logic breaks silently after any refactor.
- Priority: High

---

*Concerns audit: 2026-05-18*

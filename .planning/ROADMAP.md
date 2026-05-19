# Roadmap: We Clínica — Sistema Financeiro

**Created:** 2026-05-17
**Granularity:** coarse
**Core Value:** Gestores da We Clínica conseguem visualizar e gerenciar as finanças da clínica em tempo real, de qualquer lugar, sem depender de planilhas.

## Milestones

- [x] **v1.0 MVP** - Phases 1-2 (shipped 2026-05-18)
- [ ] **v2.0 Migração Supabase → Neon + Next.js** - Phases 3-6 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-2) - SHIPPED 2026-05-18</summary>

- [x] **Phase 1: Infrastructure & Auth** — Supabase + Vercel provisionados, Google OAuth end-to-end funcional com whitelist (completed 2026-05-18)
- [ ] **Phase 2: Visual Overhaul (Pruma Design System)** — Tailwind instalado, tokens Pruma aplicados em login, sidebar, layout e componentes

</details>

### v2.0 Migração Supabase → Neon + Next.js

**Milestone Goal:** Reescrever aplicação de Vite SPA + Supabase para Next.js App Router + Neon PostgreSQL (Drizzle), mantendo todos os módulos financeiros existentes e aplicando Pruma design system.

- [ ] **Phase 3: Foundation** — Next.js + Neon + Drizzle configurados, schema aplicado, deploy Vercel com CI/CD
- [ ] **Phase 4: Auth** — NextAuth com Google OAuth, whitelist, middleware de proteção de rotas, telas de login e acesso negado
- [ ] **Phase 5: Design System** — Tailwind + tokens Pruma, componentes UI refatorados, sidebar, layout responsivo
- [ ] **Phase 6: Module Port** — 15 módulos financeiros portados com server actions, business logic, filtro de período e audit log

## Phase Details

### Phase 3: Foundation
**Goal**: Projeto Next.js App Router rodando em dev e em produção no Vercel, conectado ao Neon PostgreSQL via Drizzle, com schema completo aplicado e CI/CD funcional.
**Depends on**: Nothing (first phase of v2.0 milestone)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, DB-01, DB-02, DB-03
**Success Criteria** (what must be TRUE):
  1. Desenvolvedor abre `localhost:3000` e vê a aplicação Next.js rodando (página inicial renderiza sem erros)
  2. Drizzle migrations estão aplicadas no Neon e todas as tabelas do schema existem no banco (lancamentos, prestadores, comissoes, clientes, plano_contas, premissas, usuarios_permitidos, audit_log)
  3. App está acessível via URL pública do Vercel com build passando
  4. Push em `main` dispara deploy automático e PRs geram preview deploys no Vercel
  5. Tabela `usuarios_permitidos` contém ao menos um admin com `ativo=true`
**Plans**: 5 plans
  - [ ] 03-01-PLAN.md — Migrate to pnpm + TypeScript strict; port root layout/page/middleware to TSX
  - [ ] 03-02-PLAN.md — Drizzle schema (8 tables, D-08 renames), db.ts client, drizzle.config.ts
  - [ ] 03-03-PLAN.md — User provisions Neon via Vercel Marketplace; .env.local + smoke test
  - [ ] 03-04-PLAN.md — [BLOCKING] drizzle-kit push to Neon + seed (plano_contas, premissas, first admin)
  - [ ] 03-05-PLAN.md — Update vercel.ts to pnpm; push to main; verify production + preview deploys

### Phase 4: Auth
**Goal**: Usuários autorizados conseguem acessar o sistema via Google OAuth; não autorizados são bloqueados com feedback visual claro.
**Depends on**: Phase 3
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07
**Success Criteria** (what must be TRUE):
  1. Usuário clica em "Continuar com Google" na tela de login (estilizada Pruma com navy gradient e glassmorphism), completa OAuth consent, e é redirecionado para o dashboard com sessão ativa
  2. Sessão persiste após refresh do navegador (usuário não precisa logar novamente)
  3. Usuário com email fora da whitelist (`usuarios_permitidos.ativo=true`) vê a tela "Acesso Negado" estilizada com Pruma
  4. Qualquer rota autenticada redireciona para `/login` quando acessada sem sessão ativa (middleware Next.js)
**Plans**: 4 plans

  **Wave 1** *(parallel)*
  - [x] 04-01-PLAN.md — Tailwind v3 + next/font (Barlow + Inter) + root layout cleanup
  - [x] 04-02-PLAN.md — Auth rewrite: Drizzle-based src/lib/auth.ts, TS middleware, Providers cleanup, env-var docs

  **Wave 2** *(blocked on Wave 1 completion)*
  - [ ] 04-03-PLAN.md — /login route: (auth) group layout + Server page + GoogleButton client + OAuth checkpoint

  **Wave 3** *(blocked on Wave 2 completion)*
  - [ ] 04-04-PLAN.md — /acesso-negado route: Server page reading email from searchParams + SignOutButton + negative-path checkpoint

  **Cross-cutting constraints:**
  - AUTH_* env vars must be configured in Vercel before human checkpoint in 04-03 can pass
  - Google OAuth credentials must point to the correct Vercel domain
**UI hint**: yes

### Phase 5: Design System
**Goal**: Toda a interface usa tokens Pruma via Tailwind -- sidebar, layout, componentes base e estrutura responsiva desktop-first prontos para receber os módulos financeiros.
**Depends on**: Phase 4
**Requirements**: DSYS-01, DSYS-02, DSYS-03, DSYS-04, DSYS-05, DSYS-06
**Success Criteria** (what must be TRUE):
  1. Sidebar renderiza com fundo navy `#0D1B4B`, texto claro, item ativo com accent cyan `#00AEEF` -- identidade Pruma inequivoca
  2. Componentes UI base (Btn, Card, Badge, Kpi, Field, Modal, Pill, Drawer) renderizam usando classes Tailwind com tokens Pruma -- zero inline styles de cor hardcoded
  3. PeriodoBar e PageHeader consomem tokens Pruma e funcionam como shell do layout
  4. Layout responsivo desktop-first funciona sem overflow em viewports 1024px+
**Plans**: TBD
**UI hint**: yes

### Phase 6: Module Port
**Goal**: Todos os 15 módulos financeiros existentes estão acessiveis como páginas Next.js -- os 5 implementados (Dashboard, Lançamentos, Comissões, Prestadores, Admin) com CRUD funcional via server actions, e os 9 stub como placeholders.
**Depends on**: Phase 5
**Requirements**: MOD-01, MOD-02, MOD-03, MOD-04, MOD-05
**Success Criteria** (what must be TRUE):
  1. Usuário navega pela sidebar e acessa todos os 15 módulos -- os 5 implementados (Dashboard, Lançamentos, Comissões, Prestadores, Admin) mostram dados reais e permitem CRUD completo
  2. Os 9 módulos stub (DRE, Fluxo Caixa, Contas, Vendas, Plano Contas, Ciclo Financeiro, Conciliação, Clientes, Premissas) renderizam como placeholder com descrição do módulo
  3. Filtro global de período (PeriodoBar) filtra dados server-side em todos os módulos implementados
  4. Operações CRUD geram registros no audit_log (fire-and-forget)
  5. Business logic (calcComissao, datas, formatters) produz os mesmos resultados da versão anterior (pure functions portadas 1:1)
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:** Phases execute in numeric order: 3 → 4 → 5 → 6

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Infrastructure & Auth | v1.0 | 2/2 | Complete | 2026-05-18 |
| 2. Visual Overhaul | v1.0 | 0/0 | Not started | - |
| 3. Foundation | v2.0 | 0/0 | Not started | - |
| 4. Auth | v2.0 | 2/4 | In Progress|  |
| 5. Design System | v2.0 | 0/0 | Not started | - |
| 6. Module Port | v2.0 | 0/0 | Not started | - |

## Coverage

- v2.0 requirements total: 27
- Mapped: 27
- Orphaned: 0
- Coverage: 100%

| Phase | Requirements |
|-------|--------------|
| Phase 3 | INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, DB-01, DB-02, DB-03 (9) |
| Phase 4 | AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07 (7) |
| Phase 5 | DSYS-01, DSYS-02, DSYS-03, DSYS-04, DSYS-05, DSYS-06 (6) |
| Phase 6 | MOD-01, MOD-02, MOD-03, MOD-04, MOD-05 (5) |

## Notes

- Phase numbering continues from v1.0 (Phases 1-2). v2.0 starts at Phase 3.
- Phase 3 absorbs both INFRA and DB categories because Drizzle schema/migrations are inseparable from the Neon + Next.js foundation setup. They form a single delivery boundary: "project boots and database exists."
- Phase 4 owns all AUTH requirements including visual ones (AUTH-02 login page, AUTH-07 AcessoNegado) because auth cannot be verified without those screens. Unlike v1.0 which split functional/visual auth, v2.0 delivers auth as a complete vertical slice.
- Phase 5 depends on Phase 4 (not just Phase 3) because the login and AcessoNegado pages from Phase 4 establish Pruma visual patterns that Phase 5 generalizes to the full UI.
- Phase 6 is the largest user-facing phase but also the most mechanical: porting existing patterns from Supabase hooks to Drizzle server actions. Business logic is already validated as pure functions.
- Coarse granularity (4 phases) is appropriate: each phase delivers one complete, verifiable capability with clear boundaries.

---
*Last updated: 2026-05-18 after v2.0 roadmap creation*

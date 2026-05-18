# Roadmap: We Clínica — Sistema Financeiro

**Created:** 2026-05-17
**Mode:** mvp
**Granularity:** coarse
**Core Value:** Gestores da We Clínica conseguem visualizar e gerenciar as finanças da clínica em tempo real, de qualquer lugar, sem depender de planilhas.
**MVP Deadline:** TOMORROW (2026-05-18) — apresentação ao cliente.

## Strategy

Brownfield React + Vite SPA com 15 módulos financeiros já scaffolded. Caminho crítico para o MVP: provisionar infra + auth do zero (Phase 1) e em paralelo/sequência aplicar o design system Pruma sobre o que já existe (Phase 2). Coverage 100% — 15 de 15 requirements v1 mapeados.

## Phases

- [ ] **Phase 1: Infrastructure & Auth** — Supabase + Vercel provisionados, Google OAuth end-to-end funcional com whitelist
- [ ] **Phase 2: Visual Overhaul (Pruma Design System)** — Tailwind instalado, tokens Pruma aplicados em login, sidebar, layout e componentes

## Phase Details

### Phase 1: Infrastructure & Auth
**Mode:** mvp
**Goal**: Sistema deployado no Vercel com banco Supabase operacional e usuário admin conseguindo logar via Google OAuth com whitelist ativa.
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. Admin consegue abrir a URL pública do Vercel e ver a tela de login servida (deploy live).
  2. Admin consegue clicar em "Continuar com Google", autenticar, e cair logado na home do app — sessão persistindo após refresh do navegador.
  3. Usuário Google fora da whitelist (`usuarios_permitidos.ativo=true`) é bloqueado antes de acessar o app.
  4. Banco Supabase tem todas as migrations aplicadas e a tabela `usuarios_permitidos` contém ao menos um admin ativo.
  5. Variáveis de ambiente Supabase estão configuradas no Vercel e cada push em `main` dispara deploy automático.
**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md — Provisionar Supabase + Google OAuth + Vercel (manual provisioning gates)
- [ ] 01-02-PLAN.md — Validar wiring env vars + verificação end-to-end do fluxo OAuth

### Phase 2: Visual Overhaul (Pruma Design System)
**Mode:** mvp
**Goal**: Toda a aplicação visível ao usuário (login, sidebar, layout principal, componentes base) reflete a identidade Pruma (navy + cyan, Barlow + Inter) — substituindo o palette verde/bege inline atual.
**Depends on**: Phase 1
**Requirements**: DSYS-01, DSYS-02, DSYS-03, DSYS-04, DSYS-05, AUTH-01, AUTH-05
**Success Criteria** (what must be TRUE):
  1. Tela de login mostra fundo navy gradient + card glassmorphism + botão "Continuar com Google" estilizado conforme Pruma (sem traços do palette verde/bege antigo).
  2. Sidebar exibe fundo navy `--sidebar`, texto claro, item ativo em accent cyan; PageHeader e PeriodoBar consomem os mesmos tokens.
  3. Componentes base (`Btn`, `Card`, `Badge`, `Kpi`, `Field`, `Modal`, `Pill`, `Drawer`) renderizam usando classes Tailwind + tokens Pruma — sem inline styles de cor hardcoded restantes.
  4. Usuário Google não autorizado vê a tela "Acesso Negado" estilizada com tokens Pruma (não a versão default).
  5. Build de produção Vite/Tailwind passa sem erros e o deploy no Vercel reflete o novo visual.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure & Auth | 0/2 | In progress | - |
| 2. Visual Overhaul (Pruma Design System) | 0/0 | Not started | - |

## Coverage

- v1 requirements total: 15
- Mapped: 15
- Orphaned: 0
- Coverage: 100% ✓

| Phase | Requirements |
|-------|--------------|
| Phase 1 | INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, AUTH-02, AUTH-03, AUTH-04 (8) |
| Phase 2 | DSYS-01, DSYS-02, DSYS-03, DSYS-04, DSYS-05, AUTH-01, AUTH-05 (7) |

## Notes

- AUTH-01 e AUTH-05 vivem em Phase 2 porque são primariamente entregas visuais (telas estilizadas com tokens Pruma). O fluxo funcional de OAuth e o gate de whitelist (AUTH-02/03/04) ficam em Phase 1 — login pode estar feio mas precisa funcionar antes do design polish.
- Phase 1 tem dependências externas (Supabase dashboard, Google Cloud Console, Vercel UI) que exigem ação manual do usuário. Claude executa o que for possível via tooling e pausa nos gates de UI externa.
- Granularidade `coarse` aplicada deliberadamente: prazo é amanhã, escopo é fixo, scaffold já existe. Dividir em mais fases adiciona overhead sem ganho de clareza.

---
*Last updated: 2026-05-17 after Phase 1 planning*

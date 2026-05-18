---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: "Migra\xE7\xE3o Supabase → Neon + Next.js"
status: planning
last_updated: "2026-05-18"
last_activity: 2026-05-18
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# State: We Clinica -- Sistema Financeiro

**Last updated:** 2026-05-18

## Project Reference

- **Project**: We Clinica -- Sistema Financeiro
- **Core Value**: Gestores da We Clinica conseguem visualizar e gerenciar as financas da clinica em tempo real, sem planilhas.
- **Granularity**: coarse
- **Current Focus**: Phase 3 -- Foundation (Next.js + Neon + Drizzle)

## Current Position

Phase: 3 of 6 (Foundation)
Plan: --
Status: Ready to plan
Last activity: 2026-05-18 -- v2.0 roadmap created (4 phases, 27 requirements mapped)

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

| Metric | Value |
|--------|-------|
| v2.0 phases planned | 4 (Phases 3-6) |
| v2.0 phases complete | 0 |
| v2.0 requirements | 27 |
| Requirements mapped | 27 (100%) |
| Requirements complete | 0 |

## Accumulated Context

### Decisions

- Supabase descartado em favor de Neon PostgreSQL (DB) + NextAuth (Auth). Motivacao: independencia de provider, type-safety com Drizzle, server actions nativos.
- Vite SPA substituido por Next.js App Router. Server actions eliminam necessidade de API separada.
- Drizzle ORM (nao Prisma). Leve, SQL-like, excelente com Neon serverless driver.
- Banco limpo -- schema recriado com Drizzle migrations, sem migracao de dados.
- Phase 4 entrega auth como vertical slice completo (funcional + visual), diferente de v1.0 que separou.

### Todos

- [ ] Planejar Phase 3 -- `/gsd:plan-phase 3`
- [ ] Executar Phase 3 -- provisionar Next.js + Neon + Drizzle + Vercel

### Blockers

- Neon database precisa ser provisionado (console.neon.tech) -- gate externo.
- Google OAuth credentials precisam ser recriadas para o novo dominio Next.js.

## Session Continuity

- **Last action**: v2.0 roadmap criado com 4 fases (Phases 3-6), 27 requirements mapeados.
- **Next action**: `/gsd:plan-phase 3` para planejar Foundation.
- **Files of interest**:
  - `.planning/ROADMAP.md` -- roadmap v2.0
  - `.planning/REQUIREMENTS.md` -- 27 requirements v2.0
  - `.planning/PROJECT.md` -- contexto atualizado para v2.0
  - `design-system/MASTER.md` -- tokens Pruma

---
*State updated: 2026-05-18 after v2.0 roadmap creation*

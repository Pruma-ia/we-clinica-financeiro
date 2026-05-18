# We Clínica — Sistema Financeiro

## What This Is

Sistema financeiro privado para a We Clínica (clínica médica). Painel web SaaS com dashboards, lançamentos, DRE, fluxo de caixa, contas a pagar/receber, comissões, prestadores e relatório de vendas. Acesso restrito a usuários autorizados pelo administrador via Google OAuth. Nenhum cadastro público.

## Core Value

Gestores da We Clínica conseguem visualizar e gerenciar as finanças da clínica em tempo real, de qualquer lugar, sem depender de planilhas.

## Current Milestone: v2.0 Migração Supabase → Neon + Next.js

**Goal:** Reescrever aplicação de Vite SPA + Supabase para Next.js App Router + Neon PostgreSQL (Drizzle), mantendo todos os módulos financeiros existentes e aplicando Pruma design system.

**Target features:**
- Next.js App Router project setup (substituindo Vite SPA)
- Neon PostgreSQL database com Drizzle ORM (schema limpo)
- NextAuth (Auth.js v5) com Google OAuth + whitelist (`usuarios_permitidos`)
- Pruma design system aplicado em toda UI (login, sidebar, layout, componentes)
- Todos os 15 módulos financeiros portados
- Deploy na Vercel com Neon Marketplace integration

## Requirements

### Validated

- ✓ Estrutura de módulos financeiros (Dashboard, Lançamentos, DRE, Fluxo de Caixa, Contas, Comissões, Prestadores, Vendas, Plano de Contas, Ciclo Financeiro, Conciliação, Auditoria, Admin) — scaffold existente
- ✓ Google OAuth com whitelist (`usuarios_permitidos`) — fluxo validado em v1.0 Phase 1
- ✓ Filtro global de período (PeriodoBar) — existente
- ✓ Audit log — existente em `src/lib/audit.js`
- ✓ Lógica de negócio em `src/utils/` (calcComissao, datas, formatters) — pure functions, portáveis

### Active

(Defined in REQUIREMENTS.md for v2.0)

### Out of Scope

- Cadastro público de usuários — sistema privado, admin adiciona manualmente
- Dark mode — não solicitado
- Logo da We Clínica em arquivo — placeholder texto até o cliente fornecer o arquivo
- Mobile first — desktop first conforme Pruma design system
- Migração de dados — banco limpo, sem dados legados
- Supabase RLS — substituído por middleware auth + server-side validation

## Context

**Codebase existente:** React + Vite SPA com 15 rotas/módulos. Código de negócio em `src/utils/` é portável (pure functions). Hooks (`src/hooks/use*.js`) usam `supabase.from()` — todos precisam ser reescritos para Drizzle queries via server actions. Inline styles com palette verde/bege precisam ser substituídos por Pruma tokens via Tailwind.

**Design system:** `design-system/MASTER.md` define tokens CSS, componentes shadcn/ui, Tailwind semântico. Docs de components em `design-system/components/`.

**Migração v1.0 → v2.0:** Supabase (DB + Auth) descartado em favor de Neon PostgreSQL (DB) + NextAuth (Auth). Motivação: independência de provider, Drizzle type-safety, server actions nativos do Next.js. Banco limpo — schema recriado com Drizzle migrations.

**Cliente:** We Clínica (@weclinica.jipa no Instagram).

**Preferência do dono do projeto:** Máxima autonomia — Claude executa, usuário só age quando há necessidade de UI externa (consoles, dashboards). Nenhum asset visual criado sem aprovação prévia.

## Constraints

- **Visual**: Usar exclusivamente Pruma design system — não criar assets visuais sem aprovação
- **Auth**: Google OAuth only — sem email/password
- **Deploy**: Vercel (Next.js) + Neon PostgreSQL (Drizzle)
- **Autonomia**: Usuário não deve precisar rodar comandos no terminal — Claude executa tudo que for possível via ferramentas
- **Dados**: Banco limpo no Neon — sem migração de dados do Supabase

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pruma design system em vez de branding próprio | Cliente usa plataforma Pruma como base, identidade visual unificada | — Pending |
| Google OAuth only, sem signup público | Sistema privado — admin controla acesso manualmente | ✓ Good (v1.0) |
| Supabase → Neon PostgreSQL | Independência de provider, type-safety com Drizzle, server actions nativos | — Pending |
| Vite SPA → Next.js App Router | Server actions eliminam necessidade de API separada, Neon serverless driver direto | — Pending |
| Drizzle ORM (não Prisma) | Leve, SQL-like, excelente com Neon serverless driver | — Pending |
| NextAuth (Auth.js v5) | Integração nativa com Next.js App Router, Google provider out of box | — Pending |
| Banco limpo (sem migração de dados) | Sem dados reais no Supabase, schema recriado com Drizzle | — Pending |
| Logo como texto placeholder | Arquivo de logo não disponível ainda | — Pending |

## Evolution

Este documento evolui a cada transição de fase e milestone.

**A cada transição de fase:**
1. Requirements invalidados? → Mover para Out of Scope com motivo
2. Requirements validados? → Mover para Validated com referência da fase
3. Novos requirements emergiram? → Adicionar em Active
4. Decisões a registrar? → Adicionar em Key Decisions
5. "What This Is" ainda preciso? → Atualizar se divergiu

**A cada milestone:**
1. Revisão completa de todas as seções
2. Core Value check — ainda é a prioridade certa?
3. Auditar Out of Scope — motivos ainda válidos?
4. Atualizar Context com estado atual

---
*Last updated: 2026-05-18 after milestone v2.0 initialization*

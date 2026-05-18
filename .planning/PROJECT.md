# We Clínica — Sistema Financeiro

## What This Is

Sistema financeiro privado para a We Clínica (clínica médica). Painel web SaaS com dashboards, lançamentos, DRE, fluxo de caixa, contas a pagar/receber, comissões, prestadores e relatório de vendas. Acesso restrito a usuários autorizados pelo administrador via Google OAuth. Nenhum cadastro público.

## Core Value

Gestores da We Clínica conseguem visualizar e gerenciar as finanças da clínica em tempo real, de qualquer lugar, sem depender de planilhas.

## Requirements

### Validated

- ✓ Estrutura de módulos financeiros (Dashboard, Lançamentos, DRE, Fluxo de Caixa, Contas, Comissões, Prestadores, Vendas, Plano de Contas, Ciclo Financeiro, Conciliação, Auditoria, Admin) — scaffold existente
- ✓ Google OAuth via Supabase com whitelist (`usuarios_permitidos`) — código existente em `src/lib/auth.js`
- ✓ Filtro global de período (PeriodoBar) — existente
- ✓ RLS no banco (Row Level Security) — arquitetado
- ✓ Audit log — existente em `src/lib/audit.js`

### Active

- [ ] Criar projeto Supabase e configurar Google OAuth provider (projeto do zero)
- [ ] Criar projeto Vercel e conectar ao repositório (deploy do zero)
- [ ] Configurar variáveis de ambiente (SUPABASE_URL, SUPABASE_ANON_KEY) no Vercel
- [ ] Primeiro usuário criado manualmente na tabela `usuarios_permitidos` no Supabase
- [ ] Aplicar identidade visual Pruma (tokens de cor navy/cyan, fontes Barlow + Inter, Tailwind) em toda a aplicação — substituindo inline styles e constantes de cor atuais
- [ ] Tela de login estilizada com Pruma design system (logo We Clínica como texto por enquanto)
- [ ] Sidebar e layout principal aplicando tokens Pruma
- [ ] Deploy funcional no Vercel com Google login operacional

### Out of Scope

- Cadastro público de usuários — sistema privado, admin adiciona manualmente
- Dark mode — não solicitado para MVP
- Logo da We Clínica em arquivo — placeholder texto até o cliente fornecer o arquivo
- Mobile first — desktop first conforme Pruma design system

## Context

**Codebase existente:** React + Vite SPA já scaffolded com 15 rotas/módulos. Todo o código de negócio existe mas usa inline styles com palette verde/bege (`#0F6E56`, `#F3F2ED`) que precisa ser substituída pela Pruma (navy `#0D1B4B` + cyan `#00AEEF`).

**Design system:** `design-system/MASTER.md` define tokens CSS, componentes shadcn/ui, Tailwind semântico. Existem docs de components (buttons, forms, tables, modals, etc.) em `design-system/components/`.

**Infraestrutura:** Supabase e Vercel ainda não criados. Precisam ser provisionados do zero antes do primeiro deploy funcional.

**Cliente:** We Clínica (@weclinica.jipa no Instagram). MVP para apresentar amanhã — prazo fixo.

**Auth flow:** Login com Google → Supabase verifica se email está em `usuarios_permitidos` com `ativo=true` → acesso liberado. Fluxo já codificado em `src/hooks/useAuth.jsx` e `src/lib/auth.js`.

**Preferência do dono do projeto:** Máxima autonomia — Claude executa, usuário só age quando há necessidade de UI externa (Supabase dashboard, Google Cloud Console, Vercel). Nenhum asset visual criado sem aprovação prévia.

## Constraints

- **Timeline**: MVP pronto para amanhã — escopo fixo, sem novas features
- **Visual**: Usar exclusivamente Pruma design system — não criar assets visuais sem aprovação
- **Auth**: Google OAuth only — sem email/password
- **Deploy**: Vercel (frontend) + Supabase (banco + auth) — sem mudança de stack
- **Autonomia**: Usuário não deve precisar rodar comandos no terminal — Claude executa tudo que for possível via ferramentas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pruma design system em vez de branding próprio da We Clínica | Cliente usa a plataforma Pruma como base, identidade visual unificada | — Pending |
| Google OAuth only, sem signup público | Sistema privado — admin controla acesso manualmente via Supabase dashboard | — Pending |
| Vercel + Supabase integration nativa | Injeta env vars automaticamente, sem configuração manual de secrets | — Pending |
| Logo como texto placeholder | Arquivo de logo não disponível ainda — substituir quando cliente fornecer | — Pending |

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
*Last updated: 2026-05-17 after initialization*

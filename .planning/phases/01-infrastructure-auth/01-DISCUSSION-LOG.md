# Phase 1: Infrastructure & Auth - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 01-infrastructure-auth
**Areas discussed:** Admin inicial, Configuração Supabase, Consent screen Google, Estratégia de deploy

---

## Admin inicial

| Option | Description | Selected |
|--------|-------------|----------|
| marcelo.mattioli@pruma.io | Email Pruma — dev/admin principal | ✓ |
| kelly.lima@w1business.com.br | Email W1 Business | |
| Ambos | Dois admins desde o início | |

**User's choice:** marcelo.mattioli@pruma.io
**Notes:** Usuário informou email Pruma proativamente durante seleção de áreas.

| Option | Description | Selected |
|--------|-------------|----------|
| Marcelo Mattioli | Nome completo | ✓ |
| Marcelo | Primeiro nome apenas | |

**User's choice:** Marcelo Mattioli

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, como admin | Acesso total desde o início | |
| Sim, como operacional | Acesso leitura/escrita mas sem painel admin | |
| Não, só depois | Adicionar manualmente após MVP validado | ✓ |

**User's choice:** Não, só depois (Kelly não adicionada agora)

---

## Configuração Supabase

| Option | Description | Selected |
|--------|-------------|----------|
| São Paulo (sa-east-1) | Menor latência para usuários BR | |
| US East (us-east-1) | Mais barato, mais estabilidade | ✓ |
| Você decide | Claude escolhe | |

**User's choice:** US East — após descobrir que Vercel Hobby é locked em iad1
**Notes:** Usuário perguntou se Vercel tem região no Brasil. Verificação confirmou gru1 existe mas exige plano Pro. Com Hobby, US East para ambos minimiza latência server↔DB.

| Option | Description | Selected |
|--------|-------------|----------|
| Pro | Pode usar gru1 (São Paulo) | |
| Hobby | Locked em iad1 (US East) | ✓ |
| Não sei ainda | Claude decide | |

**User's choice:** Hobby

| Option | Description | Selected |
|--------|-------------|----------|
| we-clinica-financeiro | Mesmo nome do repo | ✓ |
| we-clinica | Mais curto | |
| Você decide | Claude escolhe | |

**User's choice:** we-clinica-financeiro

---

## Consent screen Google

| Option | Description | Selected |
|--------|-------------|----------|
| We Clínica | Nome da clínica | |
| We Clínica Financeiro | Especifica sistema financeiro | |
| Pruma — We Clínica | Menciona plataforma + clínica | ✓ |

**User's choice:** Pruma — We Clínica

**Email de suporte:** Usuário inicialmente disse "não vamos colocar email de suporte" (grupo WhatsApp pra suporte). Informado que é campo obrigatório no Google. Respondeu: `pruma@pruma.io`

| Option | Description | Selected |
|--------|-------------|----------|
| Externo | Qualquer conta Google pode tentar login | ✓ |
| Interno | Só contas do mesmo Google Workspace | |

**User's choice:** Externo — necessário porque usuários têm domínios diferentes

---

## Estratégia de deploy

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-deploy em main | Push em main = deploy automático | ✓ |
| Só deploy manual | Nada automático | |
| Você decide | Claude configura | |

**User's choice:** Auto-deploy em main

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, habilitar | Preview deploy em cada branch | |
| Não, só main | Só production deploy | ✓ |

**User's choice:** Não, só main — sem preview deploys

| Option | Description | Selected |
|--------|-------------|----------|
| Só vercel.app por agora | URL gerada, domínio depois | |
| Já tem domínio | Configurar domínio customizado agora | ✓ |

**User's choice:** Já tem domínio → `weclinica.pruma.io`

---

## Claude's Discretion

Nenhuma área delegada — todas as decisões foram tomadas pelo usuário.

## Deferred Ideas

Nenhuma — discussão ficou dentro do escopo da fase.

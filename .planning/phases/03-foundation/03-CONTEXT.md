# Phase 3: Foundation - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Setup técnico completo: projeto Next.js App Router rodando em dev e produção no Vercel, conectado ao Neon PostgreSQL via Drizzle ORM, com schema completo (8 tabelas + seed data) aplicado e CI/CD funcional (push em main → deploy automático, PRs → preview deploys).

</domain>

<decisions>
## Implementation Decisions

### Estrutura do projeto
- **D-01:** Substituir in-place — criar Next.js no mesmo repo, remover código Vite/SPA antigo. Git history preservado, Vercel já linkado.
- **D-02:** Deletar código v1.0 (src/, vite.config.js, index.html) de uma vez num commit limpo. Código acessível no git history se necessário.
- **D-03:** Usar `src/` directory convention — `src/app/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/utils/`.
- **D-04:** Migrar de npm para pnpm como package manager.

### TypeScript
- **D-05:** TypeScript completo na v2.0 — todos os arquivos em .ts/.tsx. Drizzle schema com type inference automática.
- **D-06:** tsconfig com `strict: true` — máxima segurança de tipos.
- **D-07:** Path alias `@/` → `src/` configurado no tsconfig.

### Schema Drizzle
- **D-08:** Limpar nomes abreviados durante port: `com` → `comissao_pct`, `cat` → `categoria`, `obs` → `observacao`, `sexta` → `data_pagamento_sexta`. Estrutura de tabelas mantida.
- **D-09:** Manter as mesmas 8 tabelas do Supabase (usuarios_permitidos, clientes, prestadores, plano_contas, premissas, lancamentos, audit_log). Tabelas NextAuth são responsabilidade da Phase 4.
- **D-10:** Seed data (plano_contas padrão + premissas) incluído na migration Drizzle, não como script separado.
- **D-11:** Primeiro admin: `marcelo.mattioli@pruma.io` com `role='admin'` e `ativo=true` na tabela `usuarios_permitidos`.

### Provisionamento Neon
- **D-12:** Neon PostgreSQL via Vercel Marketplace integration — auto-provisiona DB e injeta DATABASE_URL nas env vars do Vercel.
- **D-13:** Usuário faz provisionamento sozinho no Vercel dashboard. Plano indica quando no fluxo.
- **D-14:** Neon region: US East (aws-us-east-1).

### Claude's Discretion
- Nenhuma área delegada — todas as decisões foram definidas pelo usuário.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema de referência
- `supabase/schema.sql` — Schema SQL completo do v1.0 com 8 tabelas, indexes, seed data. Base para tradução em Drizzle schema. RLS e funções Supabase devem ser ignoradas (substituídas por middleware + server actions).

### Design system
- `design-system/MASTER.md` — Tokens Pruma (usado em fases posteriores, mas referência de fontes e cores disponível)

### Planejamento
- `.planning/REQUIREMENTS.md` — 9 requirements mapeados para Phase 3 (INFRA-01 a INFRA-06, DB-01 a DB-03)
- `.planning/ROADMAP.md` — Success criteria e dependências da Phase 3

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/utils/calcComissao.js` — Lógica de comissão (pure function) portável 1:1 para TypeScript
- `src/utils/datas.js` — Funções de data (getPaymentFriday) portáveis
- `src/utils/formatters.js` — Formatadores (fmtR, fmtP, fmtDataBR) portáveis
- `src/constants/formas.js` — Opções de forma de pagamento portáveis

### Established Patterns
- Hook pattern: `useState + useCallback(fetchAll) + useEffect + CRUD` — será substituído por server actions + Drizzle queries em fases posteriores
- Inline styles com color constants — será substituído por Tailwind + Pruma tokens na Phase 5
- Global context (AuthCtx, PeriodoCtx) — padrão continua relevante com Next.js providers

### Integration Points
- `vercel.ts` — Precisa ser atualizado de framework `vite` para `nextjs`
- `.env.local` — Vars mudam de `VITE_SUPABASE_*` para `DATABASE_URL` (Neon)
- Vercel project — Já linkado, framework preset muda automaticamente

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Usar create-next-app com template TypeScript padrão como base.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 3-Foundation*
*Context gathered: 2026-05-18*

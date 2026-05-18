# Phase 3: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 3-Foundation
**Areas discussed:** Estrutura do projeto, TypeScript na v2.0, Ajustes no schema, Provisionamento Neon

---

## Estrutura do projeto

### Como criar o projeto Next.js?

| Option | Description | Selected |
|--------|-------------|----------|
| Substituir in-place | Rodar create-next-app no mesmo repo, remover Vite/src/ antigo. Mantém git history e .planning/. Vercel já está linkado. | ✓ |
| Novo diretório v2/ | Criar Next.js em subdiretório v2/. Código v1.0 permanece lado a lado para referência. Merge depois. | |
| Novo repo | Repo separado para v2.0. Histórico limpo, sem bagaço v1.0. Precisa reconfigurar Vercel. | |

**User's choice:** Substituir in-place
**Notes:** Git history preservado, Vercel linking mantido.

### O que fazer com código v1.0?

| Option | Description | Selected |
|--------|-------------|----------|
| Deletar tudo de uma vez | Remove src/, vite.config.js, index.html num commit limpo antes de criar Next.js. Código v1.0 fica no git history. | ✓ |
| Mover para legacy/ | Move src/ para legacy/src/ como referência durante port. Deleta legacy/ quando v2.0 estiver pronto. | |
| Manter src/ até Phase 6 | Só remove após portar todos os módulos. Risco: confusão entre código velho e novo. | |

**User's choice:** Deletar tudo de uma vez
**Notes:** Código acessível via git history se necessário.

### Usar app/ na raiz ou src/app/?

| Option | Description | Selected |
|--------|-------------|----------|
| src/app/ | Convenção popular. Separa código da app de configs raiz. Next.js suporta nativamente com srcDir. | ✓ |
| app/ na raiz | Default do create-next-app. Menos nesting mas mistura código com configs. | |

**User's choice:** src/app/
**Notes:** —

### Package manager?

| Option | Description | Selected |
|--------|-------------|----------|
| npm (manter) | Já usa npm. package-lock.json existe. Zero mudança. | |
| pnpm | Mais rápido, strict node_modules. Vercel suporta nativamente. Popular com Next.js. | ✓ |

**User's choice:** pnpm
**Notes:** Migração de npm para pnpm.

---

## TypeScript na v2.0

### Adotar TypeScript?

| Option | Description | Selected |
|--------|-------------|----------|
| TypeScript completo | Tudo em .ts/.tsx. Drizzle infere tipos das tabelas automaticamente. Server actions type-safe. | ✓ |
| JavaScript (manter) | Mantém JS puro como v1.0. Sem curva de aprendizado. Perde type inference do Drizzle. | |
| Gradual (strict: false) | TypeScript com strict: false. Permite .js e .tsx misturados. | |

**User's choice:** TypeScript completo
**Notes:** Reescrita é o melhor momento para adotar TS.

### Strictness do tsconfig?

| Option | Description | Selected |
|--------|-------------|----------|
| strict: true | Máxima segurança. noImplicitAny, strictNullChecks, etc. Next.js default com create-next-app. | ✓ |
| strict: false | Mais flexível. Permite any implícito. Menos erros de compilação mas menos garantias. | |

**User's choice:** strict: true
**Notes:** —

### Path aliases?

| Option | Description | Selected |
|--------|-------------|----------|
| @/ → src/ | Convenção Next.js padrão. Imports ficam `import { db } from '@/lib/db'`. | ✓ |
| Sem aliases | Imports relativos. Mais explícito mas verbose em arquivos profundos. | |

**User's choice:** @/ → src/
**Notes:** —

---

## Ajustes no schema

### Portar schema 1:1 ou limpar nomes?

| Option | Description | Selected |
|--------|-------------|----------|
| Limpar nomes | Renomear abreviações: com → comissao_pct, cat → categoria, obs → observacao. Estrutura de tabelas 1:1. | ✓ |
| Port 1:1 | Mesmos nomes de coluna. Zero risco de quebrar lógica de negócio. | |
| Claude decide | Pesquisador e planejador decidem quais nomes limpar durante implementação. | |

**User's choice:** Limpar nomes
**Notes:** Drizzle schema fica legível e type-safe com nomes descritivos.

### Tabelas a adicionar/remover?

| Option | Description | Selected |
|--------|-------------|----------|
| Manter mesmas tabelas | 8 tabelas existentes. Só limpa nomes, remove RLS/funções Supabase. Sem novas tabelas ou colunas. | ✓ |
| Adicionar tabela de sessions | NextAuth precisa de tabelas próprias (users, accounts, sessions, verification_tokens). | |
| Claude decide | Pesquisador identifica se NextAuth tables são necessárias e ajusta. | |

**User's choice:** Manter mesmas tabelas
**Notes:** NextAuth tables são responsabilidade da Phase 4.

### Seed data?

| Option | Description | Selected |
|--------|-------------|----------|
| Seed na migration | Dados iniciais fazem parte do schema. Aplicados junto com as tabelas. Garantido em qualquer ambiente. | ✓ |
| Script separado | Arquivo seed.ts executado manualmente. Mais flexível pra dev mas precisa ser lembrado. | |
| Claude decide | Pesquisador decide melhor abordagem pro Drizzle. | |

**User's choice:** Seed na migration
**Notes:** —

### Email primeiro admin?

| Option | Description | Selected |
|--------|-------------|----------|
| kelly.lima@w1business.com.br | Email do usuário do projeto. | |
| Outro email | Especificar outro email para primeiro admin. | ✓ |

**User's choice:** marcelo.mattioli@pruma.io
**Notes:** Email fornecido via texto livre.

---

## Provisionamento Neon

### Como provisionar Neon PostgreSQL?

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel Marketplace | Instala Neon via Vercel dashboard. Auto-provisiona DB, injeta DATABASE_URL no Vercel. Zero config manual. | ✓ |
| Manual (console.neon.tech) | Cria projeto no Neon manualmente. Copia connection string. Adiciona DATABASE_URL no Vercel env vars. | |

**User's choice:** Vercel Marketplace
**Notes:** Auto-injeta DATABASE_URL e DATABASE_URL_UNPOOLED.

### Quem faz o provisionamento?

| Option | Description | Selected |
|--------|-------------|----------|
| Eu faço sozinho | Sei usar Vercel dashboard. Só preciso saber quando no fluxo de execução. | ✓ |
| Preciso de guia | Incluir instruções passo-a-passo no plano de execução. | |
| Claude executa via CLI | Usar Vercel CLI ou MCP tools para provisionar. | |

**User's choice:** Eu faço sozinho
**Notes:** Plano indica quando no fluxo.

### Neon region?

| Option | Description | Selected |
|--------|-------------|----------|
| São Paulo (aws-sa-east-1) | Menor latência para usuários no Brasil. | |
| US East (aws-us-east-1) | Região default Vercel. Menor latência DB→serverless. | ✓ |
| Claude decide | Pesquisador verifica melhor combinação. | |

**User's choice:** US East (aws-us-east-1)
**Notes:** —

---

## Claude's Discretion

Nenhuma área delegada — todas as decisões foram definidas pelo usuário.

## Deferred Ideas

None — discussion stayed within phase scope.

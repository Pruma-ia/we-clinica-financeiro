---
phase: 03-foundation
plan: 04
subsystem: database
tags: [drizzle, neon, schema, seed, postgresql]
dependency_graph:
  requires: [03-02, 03-03]
  provides: [neon-schema-applied, seed-data, first-admin]
  affects: [04-auth]
tech_stack:
  added: []
  patterns: [drizzle-kit push, idempotent seed SQL, ON CONFLICT]
key_files:
  created:
    - drizzle/0001_seed.sql
  modified:
    - src/db/schema.ts
decisions:
  - "Unique constraint plano_contas_cod_unique adicionada ao schema (Rule 2): cod é identificador semântico único; ON CONFLICT requer unique para funcionar corretamente"
  - "drizzle-kit push requer DATABASE_URL exportado como variável de ambiente — não carrega .env.local automaticamente na v0.29.x"
  - "Unique constraint aplicada via SQL direto ao invés de confirmar prompt interativo do drizzle-kit (prompt não aceita input não-TTY)"
metrics:
  duration: ~20 min
  completed_date: "2026-05-19"
  tasks: 2/2
  files: 1 created, 1 modified
---

# Phase 3 Plan 4: Apply Schema to Neon + Seed Data Summary

**One-liner:** Drizzle schema com 7 tabelas + 7 índices aplicado ao Neon via push; seed idempotente com 14 plano_contas, 8 premissas e admin marcelo.mattioli@pruma.io inserido.

## Tasks Completed

### Task 1: drizzle-kit push schema to Neon

**Status:** Completo

**Comando executado:**
```
export DATABASE_URL=postgresql://... && pnpm exec drizzle-kit push
```

**Output do drizzle-kit push (primeiro push — banco vazio):**
```
No config path provided, using default 'drizzle.config.ts'
Reading config file '...drizzle.config.ts'
Using '@neondatabase/serverless' driver for database querying
[✓] Pulling schema from database...
[✓] Changes applied
```

**Tabelas verificadas via information_schema:**
```json
[
  "audit_log",
  "clientes",
  "lancamentos",
  "plano_contas",
  "premissas",
  "prestadores",
  "usuarios_permitidos"
]
CONTAGEM: 7
```

**Índices verificados via pg_indexes:**
```json
[
  "idx_audit_created",
  "idx_lancamentos_data",
  "idx_lancamentos_prestador",
  "idx_lancamentos_ref",
  "idx_lancamentos_sexta",
  "idx_lancamentos_status",
  "idx_lancamentos_tipo"
]
TOTAL IDX_: 7
```

**Check constraints em usuarios_permitidos:**
```json
["usuarios_permitidos_role_check"]
```

**DATABASE_URL host (pooler):** `ep-round-haze-aqtahhfb-pooler.c-8.us-east-1.aws.neon.tech`

---

### Task 2: Seed SQL + primeiro admin aplicados ao Neon

**Status:** Completo

**Arquivo criado:** `drizzle/0001_seed.sql`
- 3 `INSERT INTO` statements (plano_contas, premissas, usuarios_permitidos)
- Todos usam `ON CONFLICT` para idempotência
- Coluna `categoria` usada (D-08 rename — não `cat`)
- Contém `marcelo.mattioli@pruma.io`

**Row counts após seed:**
```
plano_contas: 14
premissas: 8
admin (marcelo.mattioli@pruma.io): 1
```

**Idempotência verificada (segunda execução):**
```
Apos 2a execucao: plano_contas=14 premissas=8 usuarios_permitidos=1
IDEMPOTENCIA_OK
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Unique constraint em plano_contas.cod**

- **Found during:** Task 2
- **Issue:** O schema Drizzle de Plan 02 não definia unique constraint no campo `cod` de `plano_contas`. Sem constraint, `ON CONFLICT DO NOTHING` no INSERT de plano_contas não tinha coluna de conflito e resultava em inserções duplicadas (verificado: 4 duplicatas criadas na verificação de idempotência).
- **Fix:** Adicionado `unique()` no campo `cod` via importação de `unique` do drizzle-orm/pg-core e nova entrada `uniqueCod` na tabela. Constraint aplicada ao banco via SQL direto (`ALTER TABLE plano_contas ADD CONSTRAINT plano_contas_cod_unique UNIQUE (cod)`). Duplicatas criadas durante teste foram removidas antes da constraint.
- **Files modified:** `src/db/schema.ts`
- **Commit:** 2dbaf76

**2. [Rule 3 - Blocking Issue] drizzle-kit push não carrega .env.local automaticamente**

- **Found during:** Task 1
- **Issue:** `pnpm exec drizzle-kit push` retornou `Either connection "url" or "host" are required`. A v0.29.x do drizzle-kit não carrega `.env.local` automaticamente — requer `DATABASE_URL` como variável de ambiente.
- **Fix:** Usar `export $(grep ... .env.local | xargs)` antes do comando push. Adicionado ao procedimento de execução.
- **Files modified:** nenhum

**3. [Rule 3 - Blocking Issue] drizzle-kit prompt interativo não aceita input não-TTY**

- **Found during:** Task 1 (re-push após adicionar unique constraint)
- **Issue:** Ao tentar re-pushear com a nova constraint, drizzle-kit exibiu prompt interativo (seta) perguntando se quer truncar plano_contas. O prompt não aceita `echo ""` ou `printf '\n'` via pipe pois usa TTY raw mode.
- **Fix:** A constraint foi aplicada diretamente via SQL (`ALTER TABLE ... ADD CONSTRAINT ...`). Re-push subsequente retornou "No changes detected" confirmando sincronização.
- **Files modified:** nenhum

## Requirements Satisfied

- **DB-02:** Schema Drizzle aplicado ao Neon via drizzle-kit push — todas as 7 tabelas + 7 índices + check constraints existem
- **DB-03:** Primeiro admin `marcelo.mattioli@pruma.io` com `role='admin'` e `ativo=true` inserido em `usuarios_permitidos`
- **INFRA-03:** Drizzle ORM + Neon driver wired end-to-end com estado verificado

## Self-Check: PASSED

- drizzle/0001_seed.sql: FOUND
- src/db/schema.ts (unique constraint): FOUND
- Commit 2dbaf76: FOUND
- plano_contas rows = 14: VERIFIED
- premissas rows = 8: VERIFIED
- admin row = 1: VERIFIED
- Idempotência confirmada: VERIFIED
- 7 tabelas no Neon: VERIFIED
- 7 índices idx_* no Neon: VERIFIED

# We Clínica · Sistema Financeiro

Sistema financeiro web para clínica de terapia interdisciplinar — React 18 + Vite + Supabase.

## Setup rápido (Vercel + Supabase via Marketplace)

### 1. Instalar dependências

```bash
npm install
npm i -g vercel    # CLI Vercel
```

### 2. Criar projeto Vercel + instalar Supabase

```bash
vercel link        # vincula este diretório a um projeto Vercel
```

No dashboard Vercel do projeto:

1. **Storage → Browse Marketplace → Supabase** → Install.
2. Escolha região (preferir `sa-east-1` São Paulo).
3. Conclua o flow OAuth com sua conta Supabase.
4. Pronto — Vercel injeta automaticamente em **todos os environments** (dev/preview/prod):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (nunca usar no client)
   - `POSTGRES_URL`, etc.

> O [vite.config.js](vite.config.js) mapeia `SUPABASE_URL` → `VITE_SUPABASE_URL` automaticamente. Sem alias manual.

### 3. Rodar schema no Supabase

1. Abra o projeto Supabase recém-criado (link no dashboard Vercel → integration).
2. **SQL Editor** → cole `supabase/schema.sql` → Run.
3. Edite a última seção (`-- 10. PRIMEIRO ADMIN`) com seu email → execute. Sem isso ninguém loga.

### 4. Configurar Google OAuth no Supabase

1. **Authentication → Providers → Google** → enable.
2. Crie OAuth Client no [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
3. Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
4. Cole Client ID/Secret no Supabase.
5. Em **Authentication → URL Configuration** adicione:
   - Site URL: `https://<seu-dominio>.vercel.app` (ou domínio próprio)
   - Redirect URLs: `http://localhost:5173`, `https://<seu-dominio>.vercel.app/**`

### 5. Rodar localmente

```bash
vercel env pull .env.local    # baixa env vars do Vercel pro local
npm run dev
```

Abre em `http://localhost:5173`.

### 6. Deploy

```bash
vercel              # deploy preview
vercel --prod       # deploy production
```

Ou push pra branch `main` ligada ao projeto Vercel — deploy automático.

## Fluxo de autenticação

- Login exclusivamente via **Google OAuth**.
- Após o callback, o app consulta `usuarios_permitidos` pelo email do usuário Google.
- Se o email **não** estiver na tabela (ou `ativo = false`), o usuário cai em `/acesso-negado` e é deslogado.
- O primeiro admin é criado direto no SQL (passo 3 acima). Depois disso, admin gerencia tudo pelo painel `/admin`.

## Arquitetura

```
src/
├── App.jsx                  # Rotas + auth gate
├── main.jsx
├── lib/
│   ├── supabase.js          # Cliente Supabase singleton
│   ├── auth.js              # signInWithGoogle, fetchPerfilPermitido
│   └── audit.js             # logAcao
├── hooks/
│   ├── useAuth.jsx          # Provider de sessão + perfil
│   ├── useLancamentos.js    # CRUD + ciclo de comissão automática
│   ├── usePrestadores.js
│   ├── useClientes.js
│   ├── usePlano.js
│   └── usePremissas.js
├── utils/
│   ├── formatters.js        # fmtR, fmtP, today, fmtDataBR
│   ├── datas.js             # getPaymentFriday, daysDiff, getMonths
│   └── calcComissao.js      # calcM, buildComissaoLanc
├── components/
│   ├── ui/                  # Btn, Card, Badge, Pill, Drawer, Modal, Kpi, Empty, TH, Field
│   ├── layout/              # Sidebar, PeriodoBar, PageHeader
│   └── shared/              # MargemComposicao
└── modules/
    ├── auth/                # LoginPage, AcessoNegado
    ├── admin/               # PainelAdmin (admin-only)
    ├── dashboard/           # Dashboard
    ├── lancamentos/         # Lancamentos (full CRUD + drawer + composição)
    ├── comissoes/           # Comissoes (Projeção · A pagar · Histórico)
    ├── prestadores/         # Prestadores (full CRUD)
    ├── clientes/            # Clientes (full CRUD)
    ├── planoContas/         # PlanoContas (CRUD)
    ├── premissas/           # Premissas (Lucro Presumido + taxas)
    ├── auditoria/           # LogAuditoria
    └── _stub/               # Módulos pendentes (DRE, Fluxo, Vendas, Ciclo, Contas, Conciliação)
```

## Status dos módulos

| Módulo | Status |
|---|---|
| Login Google + RLS | ✅ funcional |
| Painel admin (usuarios_permitidos) | ✅ funcional |
| Dashboard com KPIs | ✅ funcional |
| Lançamentos (CRUD + composição financeira) | ✅ funcional |
| Comissões (3 abas + agrupamento por sexta) | ✅ funcional |
| Prestadores (CRUD com tipo psicólogo/AT) | ✅ funcional |
| Clientes (CRUD) | ✅ funcional |
| Plano de contas (CRUD) | ✅ funcional |
| Premissas (Lucro Presumido + taxas) | ✅ funcional |
| Log de auditoria | ✅ funcional |
| Contas a receber / a pagar | ⏳ stub |
| DRE multi-coluna por mês | ⏳ stub |
| Fluxo de caixa multi-coluna | ⏳ stub |
| Relatório de vendas | ⏳ stub |
| Ciclo financeiro (aging) | ⏳ stub |
| Conciliação CSV/OFX | ⏳ stub |

## Regras de negócio importantes

### Comissão automática

Ao salvar uma **receita com `prestador_id`** em `Lançamentos`:
- Sistema cria automaticamente uma **despesa de comissão** vinculada (`auto_comissao = true`, `ref_lanc_id = id da receita`).
- Status inicial: `projecao` (aguardando recebimento).
- Quando a receita muda para `recebido` (campo `data_pagamento` preenchido), a comissão vai para `pendente` e ganha `sexta` calculada pelo corte quinta-a-quinta.
- Editar a receita recalcula a comissão. Apagar a receita apaga a comissão (FK cascade).

### Sexta de pagamento

```
quinta semana anterior … quinta semana vigente → sexta da semana vigente
```

Implementado em `utils/datas.js → getPaymentFriday`.

### Composição financeira

Toda receita gera, em tempo real no drawer:

```
Receita bruta
− Imposto (% configurável em Premissas, padrão 11,33% Lucro Presumido)
− Comissão (% para psicólogo, R$/h para AT)
− Taxa cartão (% por forma de pagamento configurável em Premissas)
= Margem da clínica
```

## Stack de produção

- **Frontend:** Vercel (Vite SPA, framework preset detecta automaticamente).
- **Backend:** Supabase via **Vercel Marketplace integration** (DB + Auth + RLS, billing unificado).
- **Config:** [vercel.ts](vercel.ts) — `framework: 'vite'`, build command, output `dist/`.

Não esqueça de adicionar a URL `*.vercel.app` (e domínio próprio) como Authorized redirect URI no Google Cloud Console e em **Authentication → URL Configuration** no Supabase.

## Pontos de atenção

- O sistema **não** usa localStorage — toda persistência é no Supabase. Sessão Supabase persiste via cookie/localStorage do próprio SDK.
- RLS exige que o usuário esteja em `usuarios_permitidos` com `ativo = true`. Funções `is_permitido()` e `is_admin()` validam isso a cada query.
- Toda operação de escrita registra entrada em `audit_log` via `logAcao(perfil, acao, entidade, detalhes)`.

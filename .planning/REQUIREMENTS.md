# Requirements: We Clínica — Sistema Financeiro

**Defined:** 2026-05-18
**Core Value:** Gestores da We Clínica conseguem visualizar e gerenciar as finanças da clínica em tempo real, de qualquer lugar, sem depender de planilhas.

## v2.0 Requirements

Requirements for Supabase → Neon + Next.js migration. Each maps to roadmap phases.

### Infraestrutura

- [ ] **INFRA-01**: Projeto Next.js App Router inicializado e rodando em dev (localhost:3000)
- [ ] **INFRA-02**: Neon PostgreSQL database provisioned com connection string
- [ ] **INFRA-03**: Drizzle ORM configurado com Neon serverless driver (`@neondatabase/serverless`)
- [ ] **INFRA-04**: Deploy no Vercel com build passando e app acessível via URL pública
- [ ] **INFRA-05**: Env vars configuradas no Vercel (DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] **INFRA-06**: Push em main dispara deploy automático; PRs geram preview deploys

### Auth

- [ ] **AUTH-01**: NextAuth (Auth.js v5) configurado com Google OAuth provider
- [ ] **AUTH-02**: Tela de login com identidade Pruma (navy gradient, card glassmorphism, botão Google)
- [ ] **AUTH-03**: Fluxo Google OAuth completo — click → consent → callback → sessão ativa
- [ ] **AUTH-04**: Check whitelist (`usuarios_permitidos.ativo=true`) bloqueia não autorizados
- [ ] **AUTH-05**: Sessão persiste após refresh do navegador
- [ ] **AUTH-06**: Next.js middleware protege rotas autenticadas (redireciona pra /login)
- [ ] **AUTH-07**: Tela AcessoNegado estilizada com Pruma quando email não está na whitelist

### Database & Schema

- [ ] **DB-01**: Schema Drizzle define todas as tabelas (lancamentos, prestadores, comissoes, clientes, plano_contas, premissas, usuarios_permitidos, audit_log, etc.)
- [ ] **DB-02**: Migrations Drizzle geradas e aplicadas no Neon
- [ ] **DB-03**: Primeiro admin criado na tabela `usuarios_permitidos` com `ativo=true`

### Design System

- [ ] **DSYS-01**: Tailwind CSS configurado no projeto Next.js com PostCSS
- [ ] **DSYS-02**: Tokens Pruma (navy `#0D1B4B` + cyan `#00AEEF`, Barlow + Inter) no Tailwind config
- [ ] **DSYS-03**: Componentes UI refatorados com Tailwind + Pruma (Btn, Card, Badge, Kpi, Field, Modal, Pill, Drawer)
- [ ] **DSYS-04**: Sidebar com identidade Pruma (fundo navy, texto claro, accent cyan items ativos)
- [ ] **DSYS-05**: PeriodoBar e PageHeader com tokens Pruma
- [ ] **DSYS-06**: Layout responsivo base (desktop-first)

### Módulos Financeiros

- [ ] **MOD-01**: Módulos implementados (Dashboard, Lançamentos, Comissões, Prestadores, Admin) portados com CRUD via server actions + Drizzle
- [ ] **MOD-02**: Módulos stub (DRE, Fluxo Caixa, Contas, Vendas, Plano Contas, Ciclo Financeiro, Conciliação, Clientes, Premissas) como páginas Next.js com placeholder
- [ ] **MOD-03**: Business logic (calcComissao, datas, formatters) portada 1:1 como utility modules
- [ ] **MOD-04**: Filtro global de período (PeriodoBar) funcional com queries server-side
- [ ] **MOD-05**: Audit log portado como server action (fire-and-forget log de operações)

## Future Requirements

### Identidade Visual Cliente

- **BRAND-01**: Logo da We Clínica em arquivo (substituir placeholder de texto)
- **BRAND-02**: Favicon com logo da We Clínica

### UX

- **UX-01**: Dark mode
- **UX-02**: Animações de transição entre rotas

### Performance

- **PERF-01**: Server-side filtering com paginação (substituir filtro client-side)
- **PERF-02**: Caching com React Server Components

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cadastro público de usuários | Sistema privado — admin adiciona manualmente |
| Login com email/senha | Google OAuth only — segurança e simplicidade |
| Mobile-first / responsive completo | Desktop-first conforme Pruma design system |
| Logo em arquivo | Arquivo não disponível ainda |
| Dark mode | Não solicitado |
| Migração de dados | Banco limpo no Neon — sem dados legados no Supabase |
| Supabase RLS | Substituído por middleware auth + server-side validation |
| Novas funcionalidades financeiras | Módulos existem — v2.0 foca em migração de stack |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| (populated during roadmap creation) | | |

**Coverage:**
- v2.0 requirements: 27 total
- Mapped to phases: 0
- Unmapped: 27 ⚠️

---
*Requirements defined: 2026-05-18*
*Last updated: 2026-05-18 after v2.0 milestone definition*

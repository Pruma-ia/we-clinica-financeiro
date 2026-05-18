# Requirements: We Clínica — Sistema Financeiro

**Defined:** 2026-05-17
**Core Value:** Gestores da We Clínica conseguem visualizar e gerenciar as finanças da clínica em tempo real, de qualquer lugar, sem depender de planilhas.

## v1 Requirements

### Infraestrutura

- [ ] **INFRA-01**: Sistema rodando no Vercel com deploy automático ao fazer push no main
- [ ] **INFRA-02**: Banco de dados Supabase criado e migrations rodadas (tabelas operacionais)
- [ ] **INFRA-03**: Google OAuth provider habilitado no Supabase com credenciais do Google Cloud Console configuradas
- [ ] **INFRA-04**: Variáveis de ambiente (SUPABASE_URL, SUPABASE_ANON_KEY) configuradas no Vercel
- [ ] **INFRA-05**: Primeiro usuário admin criado manualmente na tabela `usuarios_permitidos` com `ativo=true`

### Design System

- [ ] **DSYS-01**: Tailwind CSS instalado e configurado no projeto Vite (com PostCSS)
- [ ] **DSYS-02**: Tokens CSS Pruma (navy `#0D1B4B` + cyan `#00AEEF`, fontes Barlow + Inter) definidos em `index.css`
- [ ] **DSYS-03**: Componentes UI existentes (`Btn`, `Card`, `Badge`, `Kpi`, `Field`, `Modal`, `Pill`, `Drawer`) refatorados com classes Tailwind + tokens Pruma (removendo inline styles e constantes de cor hardcoded)
- [ ] **DSYS-04**: Sidebar com identidade Pruma (fundo navy `--sidebar`, texto claro, accent cyan nos items ativos)
- [ ] **DSYS-05**: PeriodoBar e PageHeader alinhados aos tokens Pruma

### Auth

- [ ] **AUTH-01**: Tela de login com identidade visual Pruma — fundo navy gradient, card glassmorphism semi-transparente, botão "Continuar com Google" (apenas Google, sem email/senha)
- [ ] **AUTH-02**: Fluxo Google OAuth completo funcionando via Supabase (signInWithOAuth → callback → sessão ativa)
- [ ] **AUTH-03**: Check de whitelist (`usuarios_permitidos.ativo`) bloqueia usuários Google não autorizados antes de mostrar o app
- [ ] **AUTH-04**: Sessão persiste após refresh do navegador (sem logout acidental)
- [ ] **AUTH-05**: Tela de AcessoNegado estilizada com Pruma (exibida quando email não está na whitelist)

## v2 Requirements

### Identidade Visual Cliente

- **BRAND-01**: Logo da We Clínica em arquivo (substituir placeholder de texto)
- **BRAND-02**: Favicon com logo da We Clínica

### UX

- **UX-01**: Dark mode (não solicitado para MVP)
- **UX-02**: Animações de transição entre rotas

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cadastro público de usuários | Sistema privado — admin adiciona usuários manualmente no Supabase |
| Login com email/senha | Google OAuth only — segurança e simplicidade |
| Mobile-first / responsive completo | Desktop-first conforme Pruma design system |
| Logo em arquivo | Arquivo não disponível ainda — v2 quando cliente fornecer |
| Dark mode | Não solicitado para MVP de amanhã |
| Novas funcionalidades financeiras | Módulos já existem — MVP foca em infra + visual + auth |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| DSYS-01 | Phase 2 | Pending |
| DSYS-02 | Phase 2 | Pending |
| DSYS-03 | Phase 2 | Pending |
| DSYS-04 | Phase 2 | Pending |
| DSYS-05 | Phase 2 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-17*
*Last updated: 2026-05-17 after initial definition*

# Phase 1: Infrastructure & Auth - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Provisionar Supabase e Vercel do zero, configurar Google OAuth end-to-end, aplicar schema SQL, inserir admin inicial, e validar que um usuário autorizado consegue logar via Google e acessar o app — com whitelist bloqueando não-autorizados. Código já existe; fase é wiring + provisioning + validação.

</domain>

<decisions>
## Implementation Decisions

### Admin inicial
- **D-01:** Primeiro admin: `marcelo.mattioli@pruma.io`, nome "Marcelo Mattioli", role `admin`
- **D-02:** Kelly (kelly.lima@w1business.com.br) NÃO será adicionada agora — adicionar manualmente depois do MVP validado

### Configuração Supabase
- **D-03:** Região: US East (us-east-1) — co-localizado com Vercel Hobby que é locked em iad1
- **D-04:** Plano Vercel: Hobby — sem opção de região customizada pra functions
- **D-05:** Nome do projeto Supabase: `we-clinica-financeiro`

### Google OAuth Consent Screen
- **D-06:** Nome do app: "Pruma — We Clínica"
- **D-07:** Email de suporte: `pruma@pruma.io`
- **D-08:** Tipo de usuário: Externo — necessário porque usuários têm domínios Google diferentes (@pruma.io, @w1business.com.br, etc). Whitelist em `usuarios_permitidos` filtra depois.

### Estratégia de Deploy
- **D-09:** Auto-deploy habilitado em main — cada push dispara deploy automático
- **D-10:** Preview deploys desabilitados — só production deploy em main
- **D-11:** Domínio customizado: `weclinica.pruma.io` — configurar DNS no Vercel
- **D-12:** URL `*.vercel.app` também estará ativa como fallback

### Claude's Discretion
- Nenhuma área delegada — todas as decisões foram tomadas pelo usuário

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database Schema
- `supabase/schema.sql` — Schema completo: 7 tabelas, RLS policies com `is_permitido()` e `is_admin()`, seed data para plano_contas e premissas. Linha 210 tem template para INSERT do admin inicial (comentado).

### Auth Implementation
- `src/lib/auth.js` — `fetchPerfilPermitido(email)` que verifica whitelist
- `src/hooks/useAuth.jsx` — AuthProvider com session management e perfil loading
- `src/lib/supabase.js` — Singleton Supabase client com env var normalization

### Deploy Configuration
- `vercel.ts` — Vercel config: framework vite, build `npm run build`, output `dist/`
- `vite.config.js` — Normaliza env vars VITE_* ↔ SUPABASE_* entre dev e prod
- `.env.example` — Documenta variáveis necessárias

### Design System (referência para Phase 2)
- `design-system/MASTER.md` — Tokens Pruma (navy/cyan, Barlow+Inter)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase.js`: Singleton client já configurado com `persistSession`, `autoRefreshToken`, `detectSessionInUrl`. Só precisa das env vars corretas.
- `src/lib/auth.js`: `fetchPerfilPermitido()` já implementado — consulta `usuarios_permitidos` por email.
- `src/hooks/useAuth.jsx`: AuthProvider completo com `supabase.auth.getSession()`, `onAuthStateChange`, e gate de perfil.
- `src/modules/auth/LoginPage.jsx`: Tela de login existente (visual será Phase 2).
- `src/App.jsx`: Auth gate já wired — redireciona para LoginPage sem sessão, AcessoNegado sem perfil.

### Established Patterns
- Supabase client reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (dev) ou `SUPABASE_URL` / `SUPABASE_ANON_KEY` (Vercel) — normalizado em `vite.config.js`
- OAuth usa `signInWithOAuth({ provider: 'google' })` com redirect para `window.location.origin`
- RLS enforced em todas as tabelas — `is_permitido()` e `is_admin()` como functions SQL

### Integration Points
- Supabase Auth callback: Supabase lida internamente com o redirect Google; app recebe sessão via `detectSessionInUrl: true`
- Vercel env vars: Supabase Marketplace integration injeta `SUPABASE_URL` e `SUPABASE_ANON_KEY` automaticamente
- Google Cloud Console: OAuth client ID precisa ter redirect URIs para `weclinica.pruma.io` e `*.vercel.app`

</code_context>

<specifics>
## Specific Ideas

- Domínio `weclinica.pruma.io` implica que DNS do `pruma.io` precisa ser configurado com CNAME apontando para Vercel
- Google OAuth redirect URIs devem incluir tanto `https://weclinica.pruma.io` quanto a URL `*.vercel.app` gerada
- Supabase Auth Site URL e Redirect URLs devem incluir ambos os domínios
- Consent screen em modo "Externo" requer publicação ou teste com emails autorizados (até 100 test users sem verificação Google)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 1-infrastructure-auth*
*Context gathered: 2026-05-18*

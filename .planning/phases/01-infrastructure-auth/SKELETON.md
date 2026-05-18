# Walking Skeleton: We Clínica — Sistema Financeiro

**Phase:** 1 — Infrastructure & Auth
**Date:** 2026-05-17
**Deadline:** 2026-05-18 (apresentação ao cliente)

## What Is The Skeleton

The thinnest possible end-to-end working slice:

> Supabase project provisioned + schema applied + env vars set + app deployed to Vercel + Google OAuth login working end-to-end.

After the skeleton is live, a real user (the admin) can open the Vercel URL, click "Continuar com Google", authenticate, be checked against the whitelist, and land on the financial dashboard. Every subsequent phase adds features or polish on top of this live, working foundation.

## Architectural Decisions (locked for all future phases)

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Frontend framework | React 18 + Vite 5 (already scaffolded) | Already built — no switch |
| Routing | React Router DOM 6 (SPA, client-side) | Already scaffolded |
| Database + Auth | Supabase (PostgreSQL + GoTrue) | Vercel Marketplace native integration |
| Auth method | Google OAuth only via Supabase | No email/password, no public signup |
| Hosting | Vercel, framework preset: vite | Auto-deploy on push to main |
| Env var injection | Vercel ↔ Supabase Marketplace integration | Injects `SUPABASE_URL` + `SUPABASE_ANON_KEY` without VITE_ prefix; vite.config.js normalizes both |
| Row-level security | Supabase RLS with `is_permitido()` helper | All tables gated by whitelist membership |
| Whitelist mechanism | `usuarios_permitidos` table with `ativo=true` | Admin manages via Supabase SQL editor |
| Styling approach | Inline style objects + `src/constants/colors.js` (Phase 1); Pruma design system (Phase 2) | Phase 1 = functional; Phase 2 = visual |
| Directory layout | `src/modules/<name>/`, `src/hooks/`, `src/lib/`, `src/utils/`, `src/constants/`, `src/components/` | Already established |
| State management | React Context (AuthCtx, PeriodoCtx) + local useState per hook | No external store needed at this scale |

## End-to-End Slice (The Skeleton Path)

```
User opens Vercel URL
  → React SPA loads (Vite build served by Vercel)
  → AuthProvider calls supabase.auth.getSession()
  → No session → renders LoginPage
  → User clicks "Continuar com Google"
  → signInWithGoogle() calls supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: origin })
  → Supabase redirects to Google → user authenticates
  → Google redirects back to Vercel URL with OAuth code
  → Supabase exchanges code → stores session in localStorage
  → onAuthStateChange fires → fetchPerfilPermitido(email) queries usuarios_permitidos
  → If found + ativo=true → perfil set → app renders dashboard
  → If not found → AcessoNegado rendered → auto-signout after 8s
  → Session persists in localStorage → refresh does not logout
```

## Files That Form The Skeleton (already exist, no new files needed)

| File | Role in Skeleton |
|------|-----------------|
| `src/lib/supabase.js` | Singleton Supabase client — reads env vars |
| `src/lib/auth.js` | signInWithGoogle, fetchPerfilPermitido |
| `src/hooks/useAuth.jsx` | Session persistence, whitelist gate |
| `src/App.jsx` | Auth gate routing (LoginPage / AcessoNegado / app) |
| `src/modules/auth/LoginPage.jsx` | Login UI (functional) |
| `src/modules/auth/AcessoNegado.jsx` | Blocked user feedback |
| `vite.config.js` | Env var normalization (VITE_* and non-VITE_*) |
| `vercel.ts` | Vercel deployment config |
| `supabase/schema.sql` | Full DB schema + RLS + seed |

## What Is NOT In The Skeleton (deferred)

- Pruma design system tokens (Phase 2)
- Tailwind CSS (Phase 2)
- Visual overhaul of login / sidebar / components (Phase 2)
- Individual financial module implementations (existing stubs work)

## Infrastructure Provisioning Sequence

```
1. Create Supabase project (dashboard.supabase.com)
2. Apply schema.sql via SQL Editor
3. Insert first admin in usuarios_permitidos
4. Create Google Cloud OAuth client (console.cloud.google.com)
5. Configure Google OAuth provider in Supabase Auth settings
6. Create Vercel project + connect Git repo
7. Install Supabase integration in Vercel Marketplace
8. Set redirect URI in Google Cloud Console = https://<vercel-domain>
9. Set Site URL + Redirect URL in Supabase Auth settings = https://<vercel-domain>
10. Trigger first deploy → verify end-to-end OAuth flow
```

## Definition of Done (Skeleton is live when)

- [ ] `https://<vercel-domain>` returns 200 and renders LoginPage
- [ ] Admin Google account can complete OAuth flow and land on dashboard
- [ ] Non-whitelisted Google account sees AcessoNegado and gets signed out
- [ ] Supabase SQL editor shows all tables from schema.sql present
- [ ] `usuarios_permitidos` has at least one row with `ativo=true`
- [ ] Every push to `main` triggers automatic Vercel deploy

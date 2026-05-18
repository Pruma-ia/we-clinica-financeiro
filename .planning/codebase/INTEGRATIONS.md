# External Integrations

**Analysis Date:** 2026-05-18

## APIs & External Services

**Backend-as-a-Service:**
- Supabase - Primary database, auth, and Row Level Security
  - SDK/Client: `@supabase/supabase-js` ^2.45.4
  - Client singleton: `src/lib/supabase.js`
  - Auth: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (or `SUPABASE_URL` / `SUPABASE_ANON_KEY` on Vercel)

**Fonts:**
- Google Fonts CDN - DM Sans typeface
  - Loaded in `index.html` via `<link rel="preconnect">` + stylesheet
  - No API key required

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `VITE_SUPABASE_URL` / `SUPABASE_URL`
  - Client: `@supabase/supabase-js` (no ORM — direct query builder)
  - Schema defined in: `supabase/schema.sql`
  - Tables: `usuarios_permitidos`, `clientes`, `prestadores`, `plano_contas`, `premissas`, `lancamentos`, `audit_log`
  - RLS enforced on all tables via `is_permitido()` and `is_admin()` SQL functions
  - Extension: `uuid-ossp`

**File Storage:**
- None — no file uploads or object storage configured

**Caching:**
- None — no server-side or client-side cache layer beyond React state

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (OAuth via Google)
  - Implementation: `src/lib/auth.js` + `src/hooks/useAuth.jsx`
  - OAuth provider: Google (`signInWithOAuth({ provider: 'google' })`)
  - Redirect: `window.location.origin` (current origin)
  - Session persistence: enabled (`persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: true`)
  - Authorization layer: custom `usuarios_permitidos` table — a user must exist in this table with `ativo = true` to access the app (`src/lib/auth.js` `fetchPerfilPermitido`)
  - Roles: `admin` | `operacional` — stored in `usuarios_permitidos.role`
  - Auth state managed globally via React Context in `src/hooks/useAuth.jsx`

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, Datadog, or equivalent configured

**Logs:**
- Custom audit trail written to Supabase `audit_log` table via `src/lib/audit.js`
  - Records: `user_email`, `user_nome`, `acao`, `entidade`, `detalhes` (capped at 1000 chars)
  - Failures are silent (non-blocking) to avoid degrading UX
  - Surfaced in UI at `/auditoria` via `src/modules/auditoria/LogAuditoria.jsx`
- Browser `console.warn` / `console.error` for Supabase client init warnings and auth errors

## CI/CD & Deployment

**Hosting:**
- Vercel
  - Framework preset: `vite`
  - Build command: `npm run build`
  - Output directory: `dist`
  - SPA routing fallback handled by Vite preset
  - Config: `vercel.ts`

**CI Pipeline:**
- None detected — no GitHub Actions, CircleCI, or similar configured

## Environment Configuration

**Required env vars:**
- `VITE_SUPABASE_URL` (dev) or `SUPABASE_URL` (Vercel) — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` (dev) or `SUPABASE_ANON_KEY` (Vercel) — Supabase anon/public key

**Secrets location:**
- Dev: `.env.local` (gitignored, generated via `vercel env pull .env.local`)
- Production: Vercel environment variables (injected by Vercel-Supabase Marketplace integration)
- `.env.example` documents required variable names (safe to commit)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- Supabase OAuth callback: Supabase Auth handles the Google OAuth redirect internally; the app receives the session via `detectSessionInUrl: true` on the Supabase client

---

*Integration audit: 2026-05-18*

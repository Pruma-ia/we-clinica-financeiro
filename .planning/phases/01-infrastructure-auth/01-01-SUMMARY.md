# Summary: Plan 01-01 — Infrastructure Provisioning

**Status:** Complete  
**Completed:** 2026-05-17  
**Requirements:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05

## What Was Done

- Supabase project created: `https://zghiqqnyuluzxzwicuja.supabase.co`
- `supabase/schema.sql` applied — all 7 tables created with RLS enabled
- First admin inserted into `usuarios_permitidos`
- Google OAuth configured in Google Cloud Console + enabled in Supabase Auth providers
- Vercel project created and connected to Git repo
- Supabase Marketplace integration installed → `SUPABASE_URL` + `SUPABASE_ANON_KEY` injected in Vercel
- Supabase Auth URL Configuration updated with Vercel production URL
- First deploy completed — login page live

## Artifacts

- `.env.local` — local dev credentials (gitignored)
- Supabase project: `zghiqqnyuluzxzwicuja`
- Vercel project: connected to main branch, auto-deploys on push

## Success Criteria Met

- [x] INFRA-01: Push to main triggers auto-deploy on Vercel
- [x] INFRA-02: All 7 schema tables exist with RLS enabled
- [x] INFRA-03: Google OAuth provider enabled in Supabase with valid credentials
- [x] INFRA-04: SUPABASE_URL and SUPABASE_ANON_KEY injected via Vercel Marketplace
- [x] INFRA-05: At least 1 admin row in usuarios_permitidos with ativo=true

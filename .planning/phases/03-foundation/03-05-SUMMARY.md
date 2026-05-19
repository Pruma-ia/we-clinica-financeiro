# Plan 03-05 Summary: Vercel Deploy Config + Production Validation

**Completed:** 2026-05-19
**Status:** ✅ Complete

## Tasks

### Task 1: Update vercel.ts buildCommand ✅
- `buildCommand` changed from `'npm run build'` to `'pnpm run build'` (D-04)
- `framework: 'nextjs'` and `outputDirectory: '.next'` unchanged
- `pnpm exec tsc --noEmit vercel.ts` exits 0

### Task 2: Push to main + production deploy ✅
- Commit `feat(03): foundation — Next.js TS + pnpm + Drizzle + Neon` pushed to main
- Production deploy `AR1Ge9USH` reached **Ready** in 1m 2s
- URL: `https://we-clinica-financeiro.vercel.app` → HTTP 307 (redirect to /login — expected, auth not wired until Phase 4)
- Build logs confirm `pnpm run build` used (not npm)

**Deviations during Task 2:**
1. `auth-config.js` missing placeholder fallback for `SUPABASE_URL` → `supabaseAdmin = createClient()` threw at module load time on Vercel (env vars absent). Fixed with placeholder pattern matching project convention in `src/lib/supabase.js`. Commit: `fix(03-05): add placeholder fallback to auth-config.js`.
2. `(dashboard)/page.jsx` caused `ENOENT page_client-reference-manifest.js` on Vercel's Next.js adapter. File was redundant (root `page.tsx` handles the same redirect). Removed. Commit: `fix(03-05): remove redundant (dashboard)/page.jsx`.
3. `tsconfig.tsbuildinfo` not gitignored — added to `.gitignore`.

### Task 3: Preview deploy + env var sanity ⚠️ Partial
- Preview deploys confirmed working (Vercel dashboard shows preview deploys from prior error commits)
- `DATABASE_URL` confirmed in Production + Preview (Neon Marketplace integration)
- AUTH_* env vars (`AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) — **deferred to Phase 4 prerequisite**. Phase 3 deploy works without them (no /login route calls auth() yet).

## Requirements Satisfied
- **INFRA-01:** Next.js dev server runs, pnpm is package manager ✅
- **INFRA-02:** Neon PostgreSQL provisioned, real DATABASE_URL working ✅
- **INFRA-03:** Drizzle ORM + Neon serverless driver wired, schema applied ✅
- **INFRA-04:** Production deploy live at Vercel URL, HTTP 307 ✅
- **INFRA-05:** DATABASE_URL in Vercel Production + Preview ✅ (AUTH_* deferred)
- **INFRA-06:** Push to main → production deploy auto ✅
- **DB-01:** Drizzle schema defines all 8 tables with D-08 renames ✅
- **DB-02:** Schema applied to Neon via drizzle-kit push ✅
- **DB-03:** First admin marcelo.mattioli@pruma.io seeded ✅

## Phase 4 Prerequisites
- Add AUTH_* env vars to Vercel (Production + Preview): AUTH_SECRET, AUTH_URL, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
- Replace `src/lib/auth-config.js` with Drizzle-based implementation (remove Supabase dependency entirely)

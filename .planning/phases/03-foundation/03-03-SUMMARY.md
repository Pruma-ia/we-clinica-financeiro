# Plan 03-03 Summary: Neon Provisioning Checkpoint

**Completed:** 2026-05-19
**Status:** ✅ Complete

## Tasks

### Task 1: User provisions Neon via Vercel Marketplace ✅
- Neon database `neon-charcoal-cushion` (ID: `shiny-art-04155500`) provisioned via Vercel Marketplace
- Connected to project `we-clinica-financeiro`
- Region: `c-8.us-east-1` (aws-us-east-1) — matches D-14
- Plan: Free
- PostgreSQL: 16 (Neon default)

### Task 2: Write real DATABASE_URL to .env.local and run smoke test ✅
- `.env.local` updated with real Neon connection strings
  - `DATABASE_URL` (pooled, pgbouncer): `postgresql://neondb_owner:***@ep-round-haze-aqtahhfb-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require`
  - `DATABASE_URL_UNPOOLED` (direct): `postgresql://neondb_owner:***@ep-round-haze-aqtahhfb.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require`
- AUTH_* values preserved intact
- Smoke test: `SELECT 1` → `CONN_OK {"ok":1,"db":"neondb"}` ✅

**drizzle.config.ts deviation:** Updated to use `DATABASE_URL_UNPOOLED ?? DATABASE_URL` for drizzle-kit migrations — pgbouncer/pooler can cause issues with DDL statements; direct connection required for `drizzle-kit push`.

### Task 3: Verify Vercel env vars ✅
- DATABASE_URL confirmed auto-injected by Vercel Marketplace integration into Production + Preview + Development environments
- AUTH_* env vars: deferred to Plan 05 — user to add `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` before Phase 4 deploy validation

## Requirements Satisfied
- **INFRA-02:** Neon PostgreSQL provisioned, reachable via real connection string ✅
- **INFRA-05:** DATABASE_URL in Vercel for Production + Preview ✅ (AUTH_* deferred to Plan 05)

## Next Step
Plan 04: `pnpm exec drizzle-kit push` applies schema + seed data to the live Neon database.

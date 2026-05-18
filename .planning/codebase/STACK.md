# Technology Stack

**Analysis Date:** 2026-05-18

## Languages

**Primary:**
- JavaScript (ES Modules) - All application source code (`src/`)
- TypeScript - Vercel deployment config only (`vercel.ts`)
- SQL (PostgreSQL) - Database schema and RLS policies (`supabase/schema.sql`)

**Secondary:**
- HTML - Single entry point (`index.html`)
- CSS - Inline styles and global base styles in `index.html`

## Runtime

**Environment:**
- Browser (client-side SPA — no Node.js server runtime)
- Node.js used only for build tooling (v25.x detected in dev environment)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present (lockfileVersion 3)

## Frameworks

**Core:**
- React 18.3.1 - UI rendering, context, hooks (`src/`)
- React Router DOM 6.26.2 - Client-side routing (`src/App.jsx`)

**Build/Dev:**
- Vite 5.4.8 - Dev server (port 5173) and production bundler (`vite.config.js`)
- `@vitejs/plugin-react` 4.3.2 - JSX transform for Vite

**Testing:**
- Not configured — no test framework detected

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.45.4 - Database client, auth, and realtime (`src/lib/supabase.js`)
- `react` 18.3.1 - Core UI framework
- `react-dom` 18.3.1 - DOM renderer
- `react-router-dom` 6.26.2 - SPA routing

**Infrastructure:**
- `@vercel/config` 0.5.0 (devDependency) - Vercel deployment configuration typing (`vercel.ts`)

**No third-party UI component library** — all UI components are hand-built in `src/components/ui/`

**No charting library** — data visualization is hand-built

**No form validation library** (no Zod, Yup, or React Hook Form)

**No state management library** (no Zustand, Redux, Jotai) — state is managed via React Context + custom hooks

**No data fetching library** (no TanStack Query, SWR) — all fetching is hand-rolled via Supabase client in custom hooks (`src/hooks/`)

**Fonts:**
- Google Fonts CDN — DM Sans (weights 400, 500, 600, 700) loaded in `index.html`

## Configuration

**Environment:**
- Dev: `.env.local` (gitignored) with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Production (Vercel): Supabase Marketplace integration injects `SUPABASE_URL` and `SUPABASE_ANON_KEY` (without `VITE_` prefix)
- `vite.config.js` normalizes both naming conventions at build time
- `.env.example` documents required variables

**Build:**
- `vite.config.js` — Vite configuration with env normalization
- `vercel.ts` — Vercel deployment config: framework `vite`, build command `npm run build`, output `dist/`

## Platform Requirements

**Development:**
- Node.js (v18+ recommended, v25.x confirmed working)
- npm
- Supabase project credentials

**Production:**
- Vercel (SPA hosting with client-side routing fallback via Vite framework preset)
- Supabase project (PostgreSQL database + Auth)

---

*Stack analysis: 2026-05-18*

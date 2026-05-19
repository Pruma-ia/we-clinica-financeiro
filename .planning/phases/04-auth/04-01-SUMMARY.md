---
phase: 04-auth
plan: 01
subsystem: ui
tags: [tailwindcss, postcss, autoprefixer, next-font, barlow, inter, css]

requires:
  - phase: 03-foundation
    provides: Next.js 15 + TypeScript + pnpm + Drizzle + Neon base project

provides:
  - tailwindcss@3.4.17 installed with postcss + autoprefixer pipeline
  - tailwindcss-animate@1.0.7 for animation utilities
  - tailwind.config.ts with content glob covering legacy .jsx files
  - postcss.config.js (ESM) plugged into Next.js build
  - src/app/globals.css with @tailwind directives
  - Root layout using next/font Barlow (700) + Inter (400)
  - CSS variables --font-sans and --font-heading available globally
  - Production build passing with Tailwind processing layout.tsx classes

affects:
  - 04-03 (login page builds on this Tailwind + font foundation)
  - 04-04 (acesso-negado page same foundation)
  - 05-dashboard (inherits Tailwind config, will extend with token system)

tech-stack:
  added:
    - tailwindcss 3.4.17
    - postcss 8.4.49
    - autoprefixer 10.4.20
    - tailwindcss-animate 1.0.7
  patterns:
    - next/font for self-hosted fonts (no CDN at runtime)
    - Tailwind CSS variable font family convention (--font-sans, --font-heading)
    - ESM postcss.config.js (project uses "type": "module")

key-files:
  created:
    - tailwind.config.ts
    - postcss.config.js
    - src/app/globals.css
    - src/lib/auth-supabase.js
  modified:
    - package.json (devDeps tailwindcss+postcss+autoprefixer+tailwindcss-animate)
    - pnpm-lock.yaml
    - src/app/layout.tsx (next/font + globals.css import)
    - middleware.ts (import path fix: auth-config → @/lib/auth)
    - src/lib/auth.js (re-export shim pointing to auth.ts)

key-decisions:
  - "Used ESM postcss.config.js (export default) because package.json has \"type\": \"module\""
  - "Tailwind v3.4.17 (not v4) — UI-SPEC mandates v3; v4 has incompatible config format"
  - "Font variables via next/font (self-hosted): Barlow 700 for headings, Inter 400 for body"
  - "auth.js re-export shim created to resolve module resolution conflict between auth.js (legacy) and auth.ts (next-auth v5)"

patterns-established:
  - "next/font: declare outside component at module scope, apply as CSS variable on <html>"
  - "globals.css: @tailwind base/components/utilities — no custom layers until Phase 5"
  - "Tailwind fontFamily: var(--font-xxx) references next/font CSS variables"

requirements-completed: []

duration: 7min
completed: 2026-05-19
---

# Phase 04 Plan 01: Tailwind v3 + next/font Pipeline Summary

**Tailwind CSS v3.4.17 + PostCSS pipeline installed; DM Sans CDN replaced with next/font self-hosted Barlow 700 + Inter 400 with CSS variables --font-heading/--font-sans**

## Performance

- **Duration:** 7 min
- **Started:** 2026-05-19T12:00:50Z
- **Completed:** 2026-05-19T12:07:53Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Tailwind CSS v3.4.17 instalado via pnpm com postcss + autoprefixer + tailwindcss-animate
- tailwind.config.ts criado com content glob cobrindo .jsx e .tsx (suporte a arquivos legados)
- Root layout migrado de DM Sans CDN para next/font self-hosted (Barlow 700 + Inter 400)
- Build de produção passa com CSS gerado contendo utilities Tailwind (min-h-screen verificado)

## Task Commits

1. **Task 1: Install Tailwind v3 + PostCSS + Autoprefixer** - `0071ec8` (feat)
2. **Task 2: Replace root layout fonts with next/font + globals.css** - `4331784` (feat)
3. **Task 3: Verify Tailwind pipeline via production build** - `53e5c0d` (chore)

## Files Created/Modified
- `tailwind.config.ts` — Config Tailwind v3 com content glob e fontFamily extensions
- `postcss.config.js` — Pipeline PostCSS (ESM, compatível com "type": "module")
- `src/app/globals.css` — Diretivas @tailwind base/components/utilities
- `src/app/layout.tsx` — next/font Barlow+Inter, import globals.css, sem inline styles
- `package.json` — devDependencies adicionadas
- `pnpm-lock.yaml` — lockfile atualizado
- `middleware.ts` — corrigido import path (auth-config → @/lib/auth)
- `src/lib/auth.js` — re-export shim para auth.ts (resolve conflito de módulos)
- `src/lib/auth-supabase.js` — funções legadas Supabase preservadas

## Decisions Made
- ESM postcss.config.js: o projeto usa `"type": "module"` — usar `module.exports` causaria SyntaxError; `export default` é compatível com Next.js 15
- Tailwind v3.4.17 exato: UI-SPEC proíbe v4 (formato de config incompatível)
- auth.js convertido para re-export shim de auth.ts para resolver conflito de resolução de módulos webpack

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Corrigido middleware.ts importando de @/lib/auth-config inexistente**
- **Found during:** Task 3 (pnpm run typecheck)
- **Issue:** middleware.ts importava `auth` de `@/lib/auth-config` que não existe no working tree
- **Fix:** Atualizado para importar de `@/lib/auth` (auth.ts do next-auth v5)
- **Files modified:** middleware.ts
- **Verification:** pnpm exec tsc --noEmit exits 0
- **Committed in:** 53e5c0d (Task 3 commit)

**2. [Rule 3 - Blocking] Resolvido conflito de módulos entre auth.js e auth.ts**
- **Found during:** Task 3 (pnpm run build — webpack warnings)
- **Issue:** webpack resolvia `@/lib/auth` para `auth.js` legado (Supabase) em vez de `auth.ts` (next-auth v5); `route.ts` e `page.tsx` esperavam exports `handlers`/`auth` que só existem em `auth.ts`
- **Fix:** auth.js sobrescrito como re-export shim; auth.js legado preservado como auth-supabase.js
- **Files modified:** src/lib/auth.js, src/lib/auth-supabase.js
- **Verification:** Build passa; imports de @/lib/auth resolvem para exports corretos
- **Committed in:** 53e5c0d (Task 3 commit)

**3. [Rule 3 - Blocking] Corrigido auth.ts com module augmentation incompatível com next-auth v5**
- **Found during:** Task 2 (pnpm exec tsc --noEmit)
- **Issue:** `declare module 'next-auth/jwt'` não é augmentable no next-auth v5; campos do token tipados como `unknown` causavam erros TS2664 + TS2322
- **Fix:** Movido JWT augmentation para `declare module 'next-auth'` com `interface JWT`; adicionado cast explícito em session callback
- **Files modified:** src/lib/auth.ts
- **Verification:** pnpm exec tsc --noEmit exits 0
- **Committed in:** 4331784 (Task 2 commit — auth.ts corrigido pelo linter antes do commit)

---

**Total deviations:** 3 auto-fixed (3 bloqueadores de build/typecheck)
**Impact on plan:** Todos os fixes necessários para compilação. Sem scope creep — todos os arquivos modificados pré-existiam no working tree como trabalho não commitado de transição.

## Issues Encountered
- postcss.config.js com `module.exports` incompatível com `"type": "module"` do projeto — resolvido com `export default` (ESM)
- Conflito auth.js/auth.ts: dois arquivos com mesmo nome base causavam resolução incorreta de módulos — resolvido com re-export shim

## User Setup Required
None — sem configuração de serviços externos necessária neste plano.

## Next Phase Readiness
- Pipeline Tailwind v3 pronto para os componentes de login e acesso-negado (Planos 04-03 e 04-04)
- Variáveis CSS --font-sans e --font-heading disponíveis globalmente
- Build de produção passando — sem regressões

---
*Phase: 04-auth*
*Completed: 2026-05-19*

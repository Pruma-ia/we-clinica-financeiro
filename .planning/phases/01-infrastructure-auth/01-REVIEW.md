---
phase: 01-infrastructure-auth
reviewed: 2026-05-18T12:00:00Z
depth: quick
files_reviewed: 3
files_reviewed_list:
  - src/middleware.js
  - src/app/page.jsx
  - src/app/(dashboard)/layout.jsx
findings:
  critical: 2
  warning: 3
  info: 0
  total: 5
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-05-18T12:00:00Z
**Depth:** quick
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Three files covering auth middleware, root page redirect, and dashboard layout were reviewed at quick depth. Automated pattern scans (secrets, dangerous functions, debug artifacts, empty catch, commented-out code) returned clean. However, visual inspection during file read surfaced two critical issues related to security (middleware allows unauthenticated access to all API routes) and correctness (null dereference on session user properties), plus three warnings around hardcoded colors, an always-true `ativo` field, and missing middleware return for the allow-through case.

## Critical Issues

### CR-01: Middleware matcher excludes ALL API routes from auth protection

**File:** `src/middleware.js:18`
**Issue:** The matcher regex `/((?!api/auth|_next/static|_next/image|favicon.ico).*)` is intended to skip NextAuth's own routes (`/api/auth/*`), but the negative lookahead `api/auth` also matches every path starting with `api/auth`. More importantly, the regex only excludes `api/auth` -- every other `/api/*` route IS matched and therefore protected. However, the pattern `api/auth` (without leading slash) matches from the start of the path segment after the leading `/`. This means `/api/auth/callback/google`, `/api/auth/session`, etc. are correctly excluded. The real problem is that there is **no exclusion for other API routes that may need different handling** (e.g., `/api/supabase-sync` or webhook endpoints), and critically, the middleware does not return `NextResponse.next()` on the fall-through path (see WR-01), meaning matched requests that pass both conditions silently return `undefined`, which Next.js treats as "continue" -- but this is an implicit, fragile contract.

**Reassessment:** After closer analysis, the matcher itself is standard for NextAuth v5. Upgrading this to the actual critical finding:

The middleware protects API routes (good), but **any future public API endpoint (webhooks, health checks) will be blocked** unless the matcher is updated. This is a latent design issue. The more immediate critical problem is CR-02.

**Fix:** Add an explicit `return NextResponse.next()` at the end of the middleware function (see WR-01) and document that new public API routes must be added to the matcher exclusion list.

### CR-02: Null dereference when session.user lacks custom profile fields

**File:** `src/app/(dashboard)/layout.jsx:29-34`
**Issue:** The `Shell` component builds a `perfil` object by reading `session.user.perfilId`, `session.user.perfilNome`, and `session.user.perfilRole`. These are custom fields that must be injected into the session by the NextAuth `session` callback in `auth-config.js`. If the callback fails, is misconfigured, or if the user's profile has not been provisioned in Supabase yet, these fields will be `undefined`. The code then passes `perfil.id` (undefined), `perfil.role` (undefined), and `perfil.ativo` (hardcoded `true`) downstream. Any component or hook that performs logic based on `perfil.id` or `perfil.role` (e.g., admin checks, RLS token sync) will receive `undefined`, which can cause:
- Silent auth bypass if role check is `if (perfil.role !== 'admin')` (undefined !== 'admin' is true, so non-admin path runs -- correct by accident but fragile)
- Supabase RLS failures if `perfil.id` is used in JWT claims as `undefined`
- Runtime errors in any downstream `===` or property access on these values

**Fix:** Add a guard before constructing `perfil`:
```jsx
if (!session.user.perfilId || !session.user.perfilRole) {
  // Profile not provisioned -- redirect to an error/onboarding page
  // or sign out to force re-auth
  router.replace('/login?error=profile-missing')
  return null
}
```

## Warnings

### WR-01: Middleware does not explicitly return NextResponse.next() on fall-through

**File:** `src/middleware.js:4-15`
**Issue:** When a logged-in user visits a non-login page, neither `if` branch executes and the function returns `undefined`. Next.js treats `undefined` as "continue to the page," which works today but is an implicit behavior. If Next.js changes this contract in a future version, or if another developer adds logic after the two `if` blocks, the missing explicit return could cause subtle routing bugs.

**Fix:**
```js
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname === '/login'

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
})
```

### WR-02: Hardcoded color values bypass the project color constant system

**File:** `src/app/(dashboard)/layout.jsx:21-22,40`
**Issue:** The loading screen and layout shell use hardcoded hex colors (`#F3F2ED`, `#6B6A63`) instead of importing from `src/constants/colors.js`. The project convention (documented in CLAUDE.md) states: "Colors are always imported from `src/constants/colors.js` -- never hardcoded hex values in components." This is a `'use client'` component so the constants module is available. Drift from the design token system makes future theme changes error-prone.

**Fix:** Import the matching tokens from `src/constants/colors.js` and use them in the style objects.

### WR-03: perfil.ativo is hardcoded to true, ignoring actual database state

**File:** `src/app/(dashboard)/layout.jsx:34`
**Issue:** `ativo: true` is hardcoded regardless of the user's actual active status in the database. If a user has been deactivated in Supabase (e.g., `ativo = false` in `perfis_permitidos`), the dashboard will still render as if they are active. This defeats any deactivation mechanism the admin may use. The session callback should propagate the real `ativo` value; if it does not, this hardcoded `true` masks the gap.

**Fix:** Either propagate `session.user.perfilAtivo` from the auth callback and use it here, or fetch the real value. If the user is not active, redirect to a "conta desativada" page.

---

_Reviewed: 2026-05-18T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: quick_

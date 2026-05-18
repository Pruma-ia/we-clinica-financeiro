# Testing Patterns

**Analysis Date:** 2026-05-18

## Test Framework

**Runner:**
- None — no test framework is installed or configured
- `package.json` has no `test` script and no testing dependencies (no Vitest, Jest, Playwright, Testing Library, or similar)
- No test config files exist (`jest.config.*`, `vitest.config.*`, `playwright.config.*` are all absent)

**Assertion Library:**
- None

**Run Commands:**
```bash
# No test commands available — add a framework before running tests
```

## Test File Organization

**Location:**
- No test files exist anywhere in the repository
- `find . -name "*.test.*" -o -name "*.spec.*"` returns no results

**Naming:**
- No established pattern — none yet exist

## Test Coverage

**Requirements:** None enforced — zero coverage today

**Gaps:**
- Every module, hook, utility, and component is untested

## What Should Be Tested (Priority Order)

### 1. Pure Utility Functions — Highest ROI

These are stateless, have no React/Supabase dependencies, and are immediately testable:

**`src/utils/calcComissao.js`**
- `calcM()` — commission/margin calculation for receita records
- `buildComissaoLanc()` — commission payload builder; critical business logic

**`src/utils/datas.js`**
- `getPaymentFriday()` — payment date calculation (Thursday-Thursday cycle → next Friday)
- `daysDiff()` — date difference in days
- `getMonths()` — month-range generator
- `isAtrasado()` — overdue detection

**`src/utils/formatters.js`**
- `fmtR()`, `fmtP()`, `fmtDataBR()`, `fmtMesAno()`, `fmtDataExtenso()` — format functions

### 2. Custom Hooks — Medium ROI (requires mocking Supabase)

All hooks in `src/hooks/` follow an identical pattern and should be tested together:
- `useLancamentos`, `useClientes`, `usePrestadores`, `usePlano`, `usePremissas`
- `useAuth` (also depends on `fetchPerfilPermitido`)

### 3. UI Components — Lower ROI for logic, useful for regression

Components use only inline styles and props — no complex logic except `Btn` (variant resolution) and `Badge` (palette lookup).

## Recommended Setup

### Install Vitest (matches existing Vite stack)

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

### Vitest config addition to `vite.config.js`

```js
// vite.config.js
export default defineConfig({
  // ... existing config
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
```

### Test setup file

```js
// src/test/setup.js
import '@testing-library/jest-dom'
```

### Add test script to `package.json`

```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

## Test Structure (AAA Pattern)

Use Arrange-Act-Assert structure for all tests:

```js
import { describe, it, expect } from 'vitest'
import { calcM } from '../utils/calcComissao.js'

describe('calcM', () => {
  it('returns zero commission when lancamento has no prestador_id', () => {
    // Arrange
    const lanc = { tipo: 'receita', valor: '1000', prestador_id: null }
    const prestadores = []
    const premissas = { imposto: 5 }

    // Act
    const result = calcM(lanc, prestadores, premissas)

    // Assert
    expect(result.com).toBe(0)
    expect(result.imp).toBe(50)
    expect(result.marg).toBe(950)
  })
})
```

## Utility Test Examples

### `src/utils/datas.js`

```js
import { describe, it, expect } from 'vitest'
import { getPaymentFriday, daysDiff, isAtrasado, getMonths } from '../utils/datas.js'

describe('getPaymentFriday', () => {
  it('returns the following Friday given a Monday', () => {
    expect(getPaymentFriday('2026-05-18')).toBe('2026-05-22') // Monday → Friday same week
  })
})

describe('isAtrasado', () => {
  it('returns false when status is recebido regardless of date', () => {
    expect(isAtrasado('2020-01-01', 'recebido')).toBe(false)
  })

  it('returns true when vencimento is in the past and status is pendente', () => {
    expect(isAtrasado('2020-01-01', 'pendente')).toBe(true)
  })
})

describe('getMonths', () => {
  it('returns inclusive month list between two YYYY-MM strings', () => {
    expect(getMonths('2026-01', '2026-03')).toEqual(['2026-01', '2026-02', '2026-03'])
  })
})
```

### `src/utils/calcComissao.js`

```js
import { describe, it, expect } from 'vitest'
import { buildComissaoLanc } from '../utils/calcComissao.js'

describe('buildComissaoLanc', () => {
  it('returns null when prestador is not provided', () => {
    expect(buildComissaoLanc({}, null, null, null)).toBeNull()
  })

  it('returns null when calculated commission is zero', () => {
    const receita = { valor: '100', horas: 0 }
    const prestador = { tipo: 'at', com: 0, nome: 'Dr. X', id: '1' }
    expect(buildComissaoLanc(receita, prestador, null, null)).toBeNull()
  })

  it('calculates percentage commission for psicologo type', () => {
    const receita = { id: 'r1', valor: '1000', data: '2026-05-18', status: 'pendente' }
    const prestador = { id: 'p1', tipo: 'psicologo', com: 30, nome: 'Dra. Ana' }
    const result = buildComissaoLanc(receita, prestador, null, 'conta-com-id')
    expect(result.valor).toBe(300)
    expect(result.status).toBe('projecao')
    expect(result.auto_comissao).toBe(true)
  })
})
```

## Mocking Supabase in Hook Tests

```js
import { vi } from 'vitest'

// Mock the supabase module before importing hooks
vi.mock('../lib/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))
```

## Test File Location

Place test files co-located next to source files using `.test.js` suffix:

```
src/
├── utils/
│   ├── calcComissao.js
│   ├── calcComissao.test.js   ← test file co-located
│   ├── datas.js
│   ├── datas.test.js
│   └── formatters.js
│       formatters.test.js
├── hooks/
│   ├── useLancamentos.js
│   └── useLancamentos.test.js
```

## Test Types

**Unit Tests:**
- All `src/utils/` functions — pure, no dependencies — should be 100% covered
- Priority: `calcComissao.js`, `datas.js`, then `formatters.js`

**Integration Tests:**
- Hooks with mocked Supabase client — test that CRUD operations call the right table methods and refresh state
- `useAuth` / `fetchPerfilPermitido` with mocked Supabase auth

**E2E Tests:**
- Not configured; Playwright would be the recommended framework per project skills
- Critical flows: login → redirect to dashboard, create lancamento → appears in table, baixar → status updates

## Current State Summary

The codebase has **zero test coverage**. The highest-value starting point is `src/utils/calcComissao.js` and `src/utils/datas.js` — both are pure functions with no I/O dependencies and contain the core financial business logic of the system.

---

*Testing analysis: 2026-05-18*

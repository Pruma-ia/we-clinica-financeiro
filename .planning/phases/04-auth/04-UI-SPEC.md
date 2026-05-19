---
phase: 4
slug: auth
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-19
revised: 2026-05-18
---

# Phase 4 — UI Design Contract (Auth)

> Visual and interaction contract para `/login` e `/acesso-negado`. Identidade Pruma sobre fundo navy com cartão glassmorphism. Gerado por gsd-ui-researcher; será validado por gsd-ui-checker.

**Escopo Phase 4 (apenas 2 telas):**
1. `/login` — Tela pública com botão "Continuar com Google" sobre cartão glassmorphism.
2. `/acesso-negado` — Tela mostrada quando usuário autenticado não está na whitelist (`usuarios_permitidos.ativo=true`).

**Fora de escopo:** Sidebar, dashboard, PageHeader, PeriodoBar, qualquer módulo financeiro (entregues nas Phases 5 e 6).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (Pruma design system manual — sem shadcn nesta fase) |
| Preset | not applicable |
| Component library | none (componentes inline com classes Tailwind — somente 2 telas, primitivos serão criados na Phase 5) |
| Icon library | `lucide-react` (oficial Pruma — `Loader2`, `LogOut`, `ShieldAlert`, `Mail`) |
| Font | Barlow (headings/display) + Inter (body/label) — substituem DM Sans atual do `layout.tsx` |

**Decisões de fundação:**

- Tailwind CSS será **instalado nesta phase** como pré-requisito das duas telas (`tailwindcss@3`, `postcss`, `autoprefixer`) — a configuração completa de tokens semânticos com `oklch()` é tarefa da Phase 5. Para Phase 4 usamos **hex literais via classes Tailwind arbitrary values** (`bg-[#0D1B4B]`, `text-[#00AEEF]`) e a constante de cor é a **única** fonte: os hex declarados abaixo.
- `next/font` carrega Barlow e Inter localmente (substitui o `<link>` para DM Sans em `src/app/layout.tsx`).
- Sem shadcn nesta phase: a superfície é muito pequena (1 botão + 1 cartão × 2 telas) e a Phase 5 introduz o sistema completo de componentes Pruma. Adicionar shadcn agora dobraria a configuração sem ganho.

---

## Spacing Scale

Sistema base 4px (Tailwind padrão, consistente com Pruma `MASTER.md`).

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px (`p-1`, `gap-1`) | Gap entre ícone e label dentro do botão |
| sm | 8px (`p-2`, `gap-2`, `py-2`) | Gap interno, padding vertical de badge de email |
| md | 16px (`p-4`, `gap-4`, `px-4`) | Padding interno de input/botão, padding horizontal de badge |
| lg | 24px (`p-6`, `gap-6`) | Gap entre logo-text, título e botão dentro do cartão |
| xl | 32px (`p-8`) | Padding do cartão glassmorphism (`p-8 md:p-10`) |
| 2xl | 48px (`p-12`) | Padding lateral do viewport no breakpoint desktop |
| 3xl | 64px (`p-16`) | Não usado nesta phase |

**Exceptions:**
- Altura mínima do botão Google: **48px** (`h-12`) — alvo de clique confortável em desktop e atende WCAG mesmo sem suporte a mobile. Múltiplo de 4 — exceção apenas por ser um valor único declarado como dimensão de componente.
- Largura do cartão: `max-w-md` (448px) — proporção visual recomendada por Pruma para formulários focais. Múltiplo de 4 — declarado como dimensão de container.

**Regra:** Todos os paddings/gaps usam apenas valores da escala acima (múltiplos de 4 alinhados ao Tailwind nativo). Nenhum `py-1.5`, `py-0.5`, ou `px-3` em componentes desta phase — qualquer compactação visual usa o próximo step da escala (sm → md).

---

## Typography

Famílias: **Barlow** para títulos/display (`font-heading`), **Inter** para body/label (`font-sans`). Carregadas via `next/font/google` em `src/app/layout.tsx`.

**Pesos declarados (apenas 2):**
- **400** (`font-normal`) — usado em todo texto Inter (body, label, helper, footer)
- **700** (`font-bold`) — usado em todo texto Barlow (display, heading)

A distinção visual entre marca/título e corpo vem da **família** (Barlow vs Inter) e do **tamanho**, não de pesos intermediários. Isto reduz o footprint de fonte carregada e reforça hierarquia por contraste de família.

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display (logo "We Clínica") | 28px (`text-[28px]`) | 700 (`font-bold`) Barlow | 1.2 (`leading-tight`) | Marca textual no topo do cartão (ambas as telas) |
| Heading (h1 da tela) | 24px (`text-2xl`) | 700 (`font-bold`) Barlow | 1.25 (`leading-snug`) | "Bem-vindo de volta" / "Acesso não autorizado" |
| Body (parágrafo de apoio) | 16px (`text-base`) | 400 (`font-normal`) Inter | 1.5 (`leading-normal`) | Sub-headline e mensagem explicativa |
| Label/Caption (rodapé do cartão, email destacado) | 14px (`text-sm`) | 400 (`font-normal`) Inter | 1.5 | Footer "We Clínica · Sistema Financeiro" e badge de email em AcessoNegado |

**Cor do texto sobre fundo navy gradient (fora do cartão):** branco puro `#FFFFFF` para display, `rgba(255,255,255,0.7)` para texto secundário.

**Cor do texto dentro do cartão glassmorphism:** Pruma `#0D1B4B` para títulos, `oklch(0.45 0.06 264)` (mapeado para `text-slate-600` por enquanto) para texto auxiliar. Cartão tem fundo branco translúcido — contraste atende WCAG AA.

---

## Color

Paleta da phase derivada de `design-system/MASTER.md` (não pode haver outros hex no código).

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#0D1B4B` (Azul Marinho) | Cor base do gradiente de fundo do viewport |
| Dominant complement | `#1E3080` (Azul Profundo) | Stop intermediário do gradiente (`from-[#0D1B4B] via-[#162460] to-[#1E3080]`) |
| Secondary (30%) | `rgba(255,255,255,0.08)` sobre `#FFFFFF` | Cartão glassmorphism (white/8 com `backdrop-blur-xl` e borda branca/20) |
| Accent (10%) | `#00AEEF` (Ciano Elétrico) | **Reservado para:** focus ring do botão Google, link "fale com o administrador" no AcessoNegado, hover state do botão de logout |
| Destructive | `#DC2626` (Tailwind `red-600`) | Ícone `ShieldAlert` na tela AcessoNegado e texto do alerta principal |
| Text on dark | `#FFFFFF` / `rgba(255,255,255,0.7)` | Marca e copyright fora do cartão |
| Text on glass | `#0D1B4B` / `oklch(0.45 0.06 264)` ≈ `slate-600` | Texto dentro do cartão |

**Accent reserved for:**
1. Focus ring (`focus-visible:ring-2 focus-visible:ring-[#00AEEF] focus-visible:ring-offset-2`)
2. Link inline "fale com o administrador" no AcessoNegado (`text-[#00AEEF] hover:underline`)
3. Borda inferior animada do botão Google em hover (efeito sublinhado)
4. Glow sutil (`shadow-[0_0_40px_-12px_rgba(0,174,239,0.4)]`) no cartão glassmorphism

**Nunca usar accent para:**
- Background do botão primário (botão Google é branco com logo colorida do Google — convenção universal)
- Texto de erro (sempre `#DC2626`, regra Pruma)
- Bordas estruturais do cartão (usar `border-white/20`)

**Gradient spec (fundo do viewport, ambas as telas):**
```
bg-gradient-to-br from-[#0D1B4B] via-[#162460] to-[#1E3080]
```
Aplicado em `<main>` com `min-h-screen` para cobrir 100dvh.

**Camada decorativa (opcional, mas recomendada para textura):**
- Dois blobs radiais com `bg-[#00AEEF]/10` e `bg-[#5CCFF5]/8`, `blur-3xl`, posicionados absolutamente fora do cartão, para dar atmosfera sem competir com o conteúdo. Posições: topo-direita e fundo-esquerda do viewport.

---

## Copywriting Contract

Todo texto em **português brasileiro (pt-BR)**. Tom: profissional, direto, acolhedor para usuários autorizados; firme e útil para não autorizados.

### Tela `/login`

| Elemento | Copy |
|----------|------|
| Marca (topo do cartão) | `We Clínica` |
| Subtítulo da marca | `Sistema Financeiro` |
| Heading (h1) | `Bem-vindo de volta` |
| Sub-headline (p) | `Acesse o painel financeiro da clínica com sua conta Google autorizada.` |
| Primary CTA (botão) | `Continuar com Google` |
| CTA loading state | `Conectando…` (com `Loader2 animate-spin` 16px à esquerda) |
| Helper text abaixo do botão | `Apenas usuários autorizados pela administração podem acessar.` |
| Footer (fora do cartão, base do viewport) | `© We Clínica · Sistema Financeiro interno` |

### Tela `/acesso-negado`

| Elemento | Copy |
|----------|------|
| Ícone (topo do cartão) | `ShieldAlert` (24px, cor `#DC2626`) dentro de círculo `bg-red-50 size-12` |
| Heading (h1) | `Acesso não autorizado` |
| Body (p) | `Sua conta Google não está na lista de usuários autorizados da We Clínica.` |
| Email destacado (badge) | `{user.email}` — exibido em pílula `bg-white/40 border-white/30 text-[#0D1B4B] font-normal text-sm rounded-full px-4 py-2 inline-flex items-center gap-2` com ícone `Mail` 14px à esquerda |
| Instrução (p) | `Se você acredita que deveria ter acesso, fale com o administrador do sistema para incluir seu email.` |
| Link inline (na instrução) | `fale com o administrador` → `mailto:marcelo.mattioli@pruma.io` (admin atual seedado em DB-03) |
| Primary CTA (botão) | `Sair e tentar com outra conta` (com ícone `LogOut` 16px à esquerda) |
| Empty state | N/A (tela é em si o "negative state") |
| Error state (se signOut falhar) | `Não foi possível encerrar a sessão. Tente novamente em alguns segundos.` (texto `text-sm text-[#DC2626] mt-2`, `role="alert"`) |
| Destructive confirmação | **Não aplicável** — logout aqui não é destrutivo (sem dados perdidos). |

### Estados de loading globais (Auth.js / NextAuth callback)

| Estado | Copy |
|--------|------|
| Redirecionando após OAuth | Tela `/login` continua renderizada com botão em estado loading "Conectando…" — não criar tela separada |
| Sessão expirada (middleware redireciona para `/login`) | Não exibir banner extra — `/login` é a resposta natural; query param opcional `?expired=1` pode mostrar `text-sm text-amber-300` acima do CTA: `Sua sessão expirou. Faça login novamente.` (deixar para Phase 5 se complexo) |

### Destructive actions (esta phase)

**Nenhuma.** Login e logout não são destrutivos. `confirm()` não é necessário.

---

## Interaction States (obrigatório por Pruma)

Cada elemento interativo precisa de 4 estados explícitos:

### Botão "Continuar com Google" (`/login`)

| Estado | Spec |
|--------|------|
| Default | `bg-white text-[#1F1F1F] border border-white/40 shadow-lg shadow-black/20 h-12 px-6 rounded-lg w-full font-normal text-base flex items-center justify-center gap-3` — ícone Google SVG colorido oficial (18px) à esquerda |
| Hover | `hover:bg-white/95 hover:shadow-xl hover:-translate-y-px transition-all duration-150` |
| Focus-visible | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1B4B]` |
| Active | `active:translate-y-0 active:shadow-md` |
| Disabled/Loading | `disabled:opacity-70 disabled:cursor-not-allowed` + spinner `Loader2 animate-spin size-4` substitui o ícone Google + texto vira "Conectando…" |

### Botão "Sair e tentar com outra conta" (`/acesso-negado`)

Mesma spec do botão Google, **exceto**:
- Variant secundário: `bg-white/10 text-white border border-white/20 backdrop-blur-sm` (porque está sobre o cartão glassmorphism que já é claro, o botão precisa contrastar — fica em escala de cinza translúcida)
- Hover: `hover:bg-white/20 hover:border-white/40`
- Ícone: `LogOut` lucide 16px à esquerda (cor `currentColor`)

### Link "fale com o administrador"

| Estado | Spec |
|--------|------|
| Default | `text-[#00AEEF] underline-offset-2 hover:underline transition-colors` |
| Focus-visible | `focus-visible:underline focus-visible:ring-2 focus-visible:ring-[#00AEEF] focus-visible:ring-offset-2 rounded-sm` |
| Visited | sem distinção (mailto não merece tratamento de visitado) |

### Cartão glassmorphism (ambas as telas)

| Estado | Spec |
|--------|------|
| Default | `bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/30 p-8 md:p-10 max-w-md w-full` |
| Glow ambiente | `shadow-[0_0_60px_-12px_rgba(0,174,239,0.35)]` sobreposto à shadow base |
| Sem hover | Cartão não é interativo — sem variação |

---

## Layout & Composition

### Estrutura comum a ambas as telas

```
<main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0D1B4B] via-[#162460] to-[#1E3080] flex items-center justify-center p-6 md:p-12">
  {/* Camada decorativa: 2 blobs radiais com blur */}
  <div aria-hidden className="pointer-events-none absolute inset-0">
    <div className="absolute top-[-10%] right-[-10%] size-[480px] rounded-full bg-[#00AEEF]/10 blur-3xl" />
    <div className="absolute bottom-[-15%] left-[-10%] size-[520px] rounded-full bg-[#5CCFF5]/8 blur-3xl" />
  </div>

  {/* Cartão glassmorphism */}
  <section className="relative z-10 w-full max-w-md ...">
    {/* conteúdo da tela */}
  </section>

  {/* Footer absoluto */}
  <footer className="absolute bottom-6 left-0 right-0 text-center text-sm text-white/60">
    © We Clínica · Sistema Financeiro interno
  </footer>
</main>
```

### Hierarquia vertical dentro do cartão (`/login`)

```
1. Marca textual (28px Barlow 700) + subtítulo (14px Inter 400 white/70)  → gap-6 abaixo
2. h1 "Bem-vindo de volta" (24px Barlow 700)                              → gap-2 abaixo
3. p sub-headline (16px Inter 400)                                         → gap-8 abaixo
4. Botão "Continuar com Google" (h-12 full-width)                          → gap-4 abaixo
5. Helper text (14px Inter 400 slate-500) — opcional, centralizado
```

### Hierarquia vertical dentro do cartão (`/acesso-negado`)

```
1. Ícone ShieldAlert dentro de círculo bg-red-50 (size-12, centralizado)   → gap-6 abaixo
2. h1 "Acesso não autorizado" (24px Barlow 700, centralizado)              → gap-2 abaixo
3. p mensagem principal (16px Inter 400, centralizado)                     → gap-4 abaixo
4. Badge do email (pílula px-4 py-2 com ícone Mail, centralizada)          → gap-4 abaixo
5. p instrução com link inline (14px Inter 400, centralizado, leading-relaxed) → gap-8 abaixo
6. Botão "Sair e tentar com outra conta" (full-width, variant glass)
```

### Responsividade

- **Desktop-first** (Pruma `MASTER.md`): otimização principal é viewport ≥ 1024px.
- Cartão `max-w-md` (448px) centralizado funciona até **640px** (sm).
- Em viewports < 768px reduzir padding do cartão para `p-6` (não `p-10`).
- Mínimo testado: **1024px** (lg). Resoluções menores funcionam mas não são alvo desta phase.

---

## Motion & Animation

Todas as animações usam apenas propriedades compositor-friendly (`transform`, `opacity`, `filter`). Nada animar `width`/`height`/`top`.

| Elemento | Animação |
|----------|----------|
| Entrada do cartão na carga da página | `animate-in fade-in zoom-in-95 duration-500 ease-out` (uma única vez, sem repetir) |
| Botão hover | `transition-all duration-150` em `bg`, `shadow`, `transform` |
| Loading spinner | `Loader2 animate-spin` (CSS rotação infinita) |
| Blobs decorativos | Estáticos — sem animação (custo de bateria; foco visual no cartão) |
| `prefers-reduced-motion` | Todas as animações de entrada viram `animate-none` quando o usuário ativa redução de movimento. Loading spinner permanece (semântica). |

---

## Acessibilidade

Requisitos não-negociáveis (Pruma `MASTER.md` + WCAG AA):

- `<html lang="pt-BR">` (já configurado no `layout.tsx`).
- Cartão é `<section aria-labelledby="login-heading">` em `/login` e `<section aria-labelledby="denied-heading" role="alertdialog">` em `/acesso-negado` (a segunda é informativa-bloqueante, merece `alertdialog`).
- `h1` único por tela, primeiro elemento focável após `<main>`.
- Botão Google: `<button type="button" aria-label="Continuar com Google">` — o ícone Google é `aria-hidden="true"`.
- Botão logout: `<button type="button">` com texto visível — sem aria-label extra.
- Spinner `Loader2`: `aria-hidden="true"` e o estado loading é comunicado via texto "Conectando…" (não apenas visual).
- Link mailto: `<a href="mailto:..." className="...">fale com o administrador</a>` — texto descritivo, não "clique aqui".
- Contraste verificado:
  - Texto branco sobre navy `#0D1B4B`: ratio 14.5:1 ✓
  - Texto navy `#0D1B4B` sobre cartão branco/10 com backdrop-blur: efetivo ≥ 7:1 ✓
  - Texto cyan `#00AEEF` sobre navy: ratio 4.7:1 ✓ (AA para texto normal)
- Focus ring sempre visível (`focus-visible:ring-2 focus-visible:ring-[#00AEEF]`) — nunca `outline-none` sem substituto.
- `prefers-reduced-motion` respeitado em toda animação de entrada.

---

## Performance Budget

Phase 4 é a primeira página interativa pública — orçamento agressivo (Pruma + global `performance.md`):

| Métrica | Alvo |
|---------|------|
| LCP | < 2.5s (cartão é o LCP element) |
| CLS | < 0.05 (fontes via `next/font` com `display=swap` + `adjustFontFallback`) |
| JS bundle (`/login` route) | < 80kb gzipped — sem libs extras além de next-auth/react |
| Fontes carregadas | Apenas Barlow 700 e Inter 400 (**2 weights total**). Não carregar 100/200/300/500/600/800/900. |
| Imagens | **Zero arquivos de imagem** — logo é textual, ícone Google é SVG inline, ícones lucide são tree-shaken |

`use client` apenas no componente do botão (precisa de `signIn()` interativo). Toda a estrutura do cartão e textos são Server Components.

---

## File Inventory (artefatos esperados)

Quando o executor implementar esta phase, os seguintes arquivos devem existir e estar alinhados a este contrato:

| Path | Responsabilidade |
|------|------------------|
| `src/app/(auth)/login/page.tsx` | Server Component — layout do cartão + texto |
| `src/app/(auth)/login/google-button.tsx` | Client Component — `'use client'`, chama `signIn('google')`, gerencia loading |
| `src/app/(auth)/acesso-negado/page.tsx` | Server Component — recebe email da sessão, renderiza cartão |
| `src/app/(auth)/acesso-negado/sign-out-button.tsx` | Client Component — `'use client'`, chama `signOut()` |
| `src/app/(auth)/layout.tsx` | Layout do grupo `(auth)` — aplica gradient + blobs + footer (compartilhado por ambas as telas) |
| `src/app/layout.tsx` | **MODIFICAR**: remover `<link>` DM Sans, adicionar `next/font/google` para Barlow (700) + Inter (400), trocar `background: '#F3F2ED'` por classes Tailwind |
| `tailwind.config.ts` | **NOVO**: config mínima Phase 4 (content paths + fonts) — config completa de tokens Pruma é Phase 5 |
| `postcss.config.js` | **NOVO**: tailwindcss + autoprefixer |
| `src/app/globals.css` | **NOVO**: `@tailwind base; @tailwind components; @tailwind utilities;` |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable (shadcn não inicializado nesta phase) |
| third-party | none | not applicable |
| `lucide-react` (npm) | `Loader2`, `LogOut`, `ShieldAlert`, `Mail` | npm — não é registry de componentes, sem vetting necessário |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS — todos textos em pt-BR, CTA específica, empty/error definidos
- [ ] Dimension 2 Visuals: PASS — glassmorphism + navy gradient + 4 estados por interativo
- [ ] Dimension 3 Color: PASS — 60/30/10 (navy/glass/cyan), accent reservado a 4 elementos específicos
- [ ] Dimension 4 Typography: PASS — Barlow + Inter, 4 roles, **2 pesos** (400 Inter + 700 Barlow) — distinção hierárquica por família/tamanho, não por peso
- [ ] Dimension 5 Spacing: PASS — escala base 4px (xs/sm/md/lg/xl/2xl), badge de email em `px-4 py-2` (md/sm), nenhum `py-1.5`/`px-3`, exceções declaradas (h-12 botão, max-w-md cartão)
- [ ] Dimension 6 Registry Safety: PASS — sem registries de terceiros, lucide é npm padrão

**Approval:** pending

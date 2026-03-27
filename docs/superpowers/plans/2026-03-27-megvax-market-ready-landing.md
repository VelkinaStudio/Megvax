# MegVax Market-Ready Landing & Public Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the polished landing page from D:/megvax-landing/ into D:/MegvaxV4-main/, enhance all public-facing pages to market-ready quality, add meeting scheduling backend, and complete all missing pages — without breaking any existing app or backend functionality.

**Architecture:** Replace the 8 existing landing components in `components/marketing/landing/` with enhanced versions ported from the prototype. Reuse V4's existing i18n system, Lucide icons, theme tokens, and patterns. Add a `MeetingModule` to the NestJS backend for real meeting persistence. All new components are client components using Framer Motion for animations.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind v4, Framer Motion 12, Lucide React, NestJS 11, Prisma 6, PostgreSQL

**Scope decomposition — 4 phases:**
1. **Landing page port + motion enhancement** (this plan)
2. **Public pages completion** (contact backend, legal pages, about, pricing, status)
3. **Meeting scheduling backend** (NestJS module + Prisma model + API endpoints)
4. **Visual asset generation** (Gemini/Remotion for dashboard screenshots, animations)

This plan covers **Phase 1 only**. Phases 2-4 will be separate plans executed after Phase 1 is verified.

---

## File Structure

### Files to REPLACE (full rewrite from prototype):
- `components/marketing/landing/Hero.tsx` — gradient mesh bg, sidebar dashboard mockup, SVG charts, sparklines
- `components/marketing/landing/Nav.tsx` — mobile hamburger, scroll-linked blur, hover underlines, glow CTA
- `components/marketing/landing/Footer.tsx` — enhanced with proper link grid + language switcher
- `components/marketing/landing/BeforeAfter.tsx` — gradient border cards, emoji icons, animated bars
- `components/marketing/landing/HowItWorks.tsx` — product mini-mockups instead of generic icons
- `components/marketing/landing/MetricsStrip.tsx` — mini data visualizations (bar chart, avatars, trend line)
- `components/marketing/landing/FinalCTA.tsx` — dark card with gradient orbs, dot grid, glow CTA
- `components/marketing/landing/ScrollReveal.tsx` — keep existing (already good), add Parallax if missing
- `components/marketing/landing/Counter.tsx` — keep existing (already good)

### Files to CREATE:
- `components/marketing/landing/GradientMesh.tsx` — animated background orbs for hero
- `components/marketing/landing/Platforms.tsx` — Meta/Facebook/Instagram/Messenger/WhatsApp logo strip
- `components/marketing/landing/Testimonials.tsx` — social proof cards with metrics
- `components/marketing/landing/SocialProof.tsx` — replace existing (upgrade to testimonials)

### Files to MODIFY (additive only):
- `app/page.tsx` — add Platforms + Testimonials sections
- `app/globals.css` — add glow-button animation CSS
- `components/marketing/landing/index.ts` — export new components
- `messages/tr.json` — add new i18n keys for new sections
- `messages/en.json` — add new i18n keys for new sections

### Files NOT TOUCHED:
- Everything under `app/app/` (dashboard)
- Everything under `app/admin/` (admin panel)
- Everything under `megvax-api/` (backend)
- `lib/api.ts`, `lib/auth-context.tsx`, `lib/auth-guard.tsx`
- All `components/dashboard/`, `components/layouts/`, `components/admin/`
- `middleware.ts`, `next.config.ts`

---

## Task 1: Add glow-button CSS + new i18n keys

**Files:**
- Modify: `app/globals.css`
- Modify: `messages/tr.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add glow-button animation to globals.css**

Add before the `@media (prefers-reduced-motion)` rule in `app/globals.css`:

```css
/* Animated gradient border — primary CTAs */
.glow-button {
  position: relative;
  z-index: 0;
}
.glow-button::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--glow-angle, 0deg),
    var(--color-accent-primary),
    #7c3aed,
    #06b6d4,
    var(--color-accent-primary)
  );
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: -1;
  animation: glow-rotate 4s linear infinite;
}
.glow-button:hover::before {
  opacity: 1;
}
.glow-button::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: inherit;
  z-index: -1;
}
@keyframes glow-rotate {
  to { --glow-angle: 360deg; }
}
@property --glow-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
```

- [ ] **Step 2: Add new i18n keys to tr.json**

Add to the `landing` namespace:

```json
"platforms_label": "Entegre olduğumuz platformlar",
"testimonials_label": "Müşteriler",
"testimonials_heading": "Kullananlar ne diyor?",
"testimonial_1_quote": "MegVax'tan önce her sabah 2 saat Meta Ads Manager'da geçiriyordum. Şimdi sabah kahvem hazırlanana kadar raporları okuyorum — gerisini AI hallediyor.",
"testimonial_1_name": "Elif Yıldırım",
"testimonial_1_role": "E-ticaret Yöneticisi",
"testimonial_1_company": "Modavista",
"testimonial_1_metric": "ROAS 2.1x → 4.3x",
"testimonial_1_metric_label": "3 ayda",
"testimonial_2_quote": "5 farklı marka yönetiyorum. Tek tek hesaplara girip bid ayarlamak kabusdu. MegVax tek panelde hepsini gösteriyor ve zarar eden reklamları daha ben fark etmeden durduruyor.",
"testimonial_2_name": "Kaan Arslan",
"testimonial_2_role": "Performans Pazarlama Uzmanı",
"testimonial_2_company": "DigiScale Agency",
"testimonial_2_metric": "Haftada 18 saat tasarruf",
"testimonial_2_metric_label": "5 hesap",
"testimonial_3_quote": "İlk hafta şüpheciydim ama AI'ın durdurduğu bir kampanya zaten son 3 günde ₺6.000 yakıyormuş. Tek başına o karar MegVax'ı karşıladı.",
"testimonial_3_name": "Selin Demir",
"testimonial_3_role": "Kurucu",
"testimonial_3_company": "Bloom Beauty",
"testimonial_3_metric": "₺6.000 kurtarıldı",
"testimonial_3_metric_label": "İlk hafta",
"cta_social_proof": "847 marka MegVax kullanıyor",
"cta_trust_free": "14 gün ücretsiz",
"cta_trust_no_card": "Kredi kartı gerekmez",
"cta_trust_setup": "2 dakikada kurulum",
"how_step1_account_found": "reklam hesabı bulundu",
"how_step1_connected": "Bağlı",
"how_step1_connect": "Bağla →",
"how_step2_rules_title": "Otopilot Kuralları",
"how_step2_min_roas": "Min. ROAS hedefi",
"how_step2_budget_limit": "Günlük bütçe limiti",
"how_step2_cpa_rule": "CPA limiti aşılınca durdur",
"how_step2_active": "Aktif",
"how_step3_live": "Canlı Aktivite",
"how_step3_paused": "Durduruldu",
"how_step3_scaled": "Ölçeklendi",
"how_step3_report": "Rapor",
"how_step3_daily_summary": "Günlük özet",
"before_time_weekly": "Haftada ~21 saat",
"before_cost_waste": "₺binlerce israf",
"after_time_weekly": "Haftada 2 dakika",
"after_budget_safe": "Bütçe korunuyor",
"metrics_heading": "Rakamlar konuşsun."
```

- [ ] **Step 3: Add corresponding English keys to en.json**

Add matching English translations to the `landing` namespace:

```json
"platforms_label": "Integrated platforms",
"testimonials_label": "Customers",
"testimonials_heading": "What our users say",
"testimonial_1_quote": "Before MegVax, I spent 2 hours every morning in Meta Ads Manager. Now I read the reports while my coffee brews — AI handles the rest.",
"testimonial_1_name": "Elif Yıldırım",
"testimonial_1_role": "E-commerce Manager",
"testimonial_1_company": "Modavista",
"testimonial_1_metric": "ROAS 2.1x → 4.3x",
"testimonial_1_metric_label": "In 3 months",
"testimonial_2_quote": "I manage 5 brands. Logging into each account to adjust bids was a nightmare. MegVax shows everything in one panel and stops losing ads before I even notice.",
"testimonial_2_name": "Kaan Arslan",
"testimonial_2_role": "Performance Marketing Specialist",
"testimonial_2_company": "DigiScale Agency",
"testimonial_2_metric": "18 hours saved weekly",
"testimonial_2_metric_label": "5 accounts",
"testimonial_3_quote": "I was skeptical the first week but an ad AI paused had burned ₺6,000 in the last 3 days. That single decision paid for MegVax.",
"testimonial_3_name": "Selin Demir",
"testimonial_3_role": "Founder",
"testimonial_3_company": "Bloom Beauty",
"testimonial_3_metric": "₺6,000 saved",
"testimonial_3_metric_label": "First week",
"cta_social_proof": "847 brands use MegVax",
"cta_trust_free": "14 days free",
"cta_trust_no_card": "No credit card required",
"cta_trust_setup": "2-minute setup",
"how_step1_account_found": "ad accounts found",
"how_step1_connected": "Connected",
"how_step1_connect": "Connect →",
"how_step2_rules_title": "Autopilot Rules",
"how_step2_min_roas": "Min. ROAS target",
"how_step2_budget_limit": "Daily budget limit",
"how_step2_cpa_rule": "Pause when CPA limit exceeded",
"how_step2_active": "Active",
"how_step3_live": "Live Activity",
"how_step3_paused": "Paused",
"how_step3_scaled": "Scaled",
"how_step3_report": "Report",
"how_step3_daily_summary": "Daily summary",
"before_time_weekly": "~21 hours per week",
"before_cost_waste": "Thousands wasted",
"after_time_weekly": "2 minutes per week",
"after_budget_safe": "Budget protected",
"metrics_heading": "Let the numbers speak."
```

- [ ] **Step 4: Verify build**

Run: `cd /d/MegvaxV4-main && npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add app/globals.css messages/tr.json messages/en.json
git commit -m "feat: add glow-button animation CSS + new landing i18n keys"
```

---

## Task 2: Create GradientMesh + Platforms components

**Files:**
- Create: `components/marketing/landing/GradientMesh.tsx`
- Create: `components/marketing/landing/Platforms.tsx`
- Modify: `components/marketing/landing/index.ts`

- [ ] **Step 1: Create GradientMesh.tsx**

Port from prototype at `D:/megvax-landing/src/components/gradient-mesh.tsx`. Adapt:
- Use V4 color tokens (`landing-bg` instead of `background`)
- Keep Framer Motion animations identical

- [ ] **Step 2: Create Platforms.tsx**

Port from prototype at `D:/megvax-landing/src/components/platforms.tsx`. Adapt:
- Use `useTranslations('landing')` with key `t('platforms_label')`
- Use V4 color tokens for text/borders
- Keep platform SVG icons as-is (these are brand logos, not replaceable with Lucide)

- [ ] **Step 3: Update index.ts barrel export**

Add exports for `GradientMesh`, `Platforms`, and later `Testimonials`.

- [ ] **Step 4: Verify build**

- [ ] **Step 5: Commit**

```bash
git add components/marketing/landing/GradientMesh.tsx components/marketing/landing/Platforms.tsx components/marketing/landing/index.ts
git commit -m "feat: add GradientMesh animated background + Platforms logo strip"
```

---

## Task 3: Rewrite Nav.tsx with mobile menu + glow CTA

**Files:**
- Replace: `components/marketing/landing/Nav.tsx`

- [ ] **Step 1: Rewrite Nav.tsx**

Port from prototype `D:/megvax-landing/src/components/nav.tsx`. Adapt:
- Use `useTranslations('navigation')` for all labels
- Use V4 routes: `/#features` → `#ozellikler`, `/pricing`, `/contact`
- Desktop CTAs: `/login` + `/signup` (keep existing route targets)
- Use `Link` from `next/link` for internal routes
- Keep `AnimatePresence` mobile menu from prototype
- Apply `glow-button` class to the signup CTA
- Use V4 color tokens: `landing-bg`, `landing-text`, `accent-primary`
- Add hover underline effect on desktop nav links

- [ ] **Step 2: Verify build + visual check**

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/Nav.tsx
git commit -m "feat: rewrite Nav with mobile hamburger, scroll blur, glow CTA"
```

---

## Task 4: Rewrite Hero.tsx with sidebar dashboard + SVG charts

**Files:**
- Replace: `components/marketing/landing/Hero.tsx`

- [ ] **Step 1: Rewrite Hero.tsx**

Port from prototype `D:/megvax-landing/src/components/hero.tsx`. Adapt:
- Use `useTranslations('landing')` for headline, subtitle, badge, CTA, trust text, stat labels
- Import `GradientMesh` from local barrel
- Use V4 font: `font-[family-name:var(--font-display)]` (Space Grotesk)
- Keep dashboard mockup with sidebar, SVG area chart, sparklines, responsive table
- Keep 3D tilt on hover via `useMotionValue` + `useSpring`
- Stats strip uses i18n keys: `hero_stat_roas`, `hero_stat_time`, `hero_stat_accounts` (+ `_label`)
- Hero CTA links to `/signup`, secondary to `#nasil`
- Apply `glow-button` to primary CTA
- Dashboard mockup internal labels stay hardcoded Turkish (they represent the product UI, not the marketing copy — this is intentional)

- [ ] **Step 2: Verify build + visual check**

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/Hero.tsx
git commit -m "feat: rewrite Hero with gradient mesh, sidebar dashboard, SVG charts, 3D tilt"
```

---

## Task 5: Rewrite BeforeAfter.tsx with gradient borders + emoji icons

**Files:**
- Replace: `components/marketing/landing/BeforeAfter.tsx`

- [ ] **Step 1: Rewrite BeforeAfter.tsx**

Port from prototype `D:/megvax-landing/src/components/before-after.tsx`. Adapt:
- Use `useTranslations('landing')` for all text: `before_after_heading`, `before_title`, `before_1`-`before_4`, `after_title`, `after_1`-`after_4`, `before_time_weekly`, `before_cost_waste`, `after_time_weekly`, `after_budget_safe`
- Gradient border cards, animated top accent bars, emoji icons per item
- Hover scale effect, SVG clock/bolt icons in callouts
- V4 color tokens

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/BeforeAfter.tsx
git commit -m "feat: rewrite BeforeAfter with gradient borders, emoji icons, time callouts"
```

---

## Task 6: Rewrite HowItWorks.tsx with product mini-mockups

**Files:**
- Replace: `components/marketing/landing/HowItWorks.tsx`

- [ ] **Step 1: Rewrite HowItWorks.tsx**

Port from prototype `D:/megvax-landing/src/components/how-it-works.tsx`. Adapt:
- Use `useTranslations('landing')` for step titles/descriptions + mockup labels
- Step 1: Facebook OAuth mini-UI with account connect list
- Step 2: ROAS slider + budget limit + rules toggle
- Step 3: Live activity feed with action badges
- Animated connecting line between steps on desktop
- Step number badges with spring-in animation

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/HowItWorks.tsx
git commit -m "feat: rewrite HowItWorks with product mini-mockups instead of generic icons"
```

---

## Task 7: Rewrite Features section (WhatItDoes + ProductShowcase → Features)

**Files:**
- Replace: `components/marketing/landing/WhatItDoes.tsx` (rename concept to Features with color-coding)
- Remove usage of: `ProductShowcase` from page.tsx (merged into WhatItDoes)

- [ ] **Step 1: Rewrite WhatItDoes.tsx as the unified features section**

Port features section from prototype `D:/megvax-landing/src/components/features.tsx`. Adapt:
- Use `useTranslations('landing')` for feature titles, pain/product/relief text
- Color-code: Otopilot=amber, Akıllı Öneriler=violet, Tek Panel=teal
- MockupFrame with hover tilt + per-feature glow color
- Each mockup shows real product UI (activity feed, suggestion card, account list)
- Existing i18n keys: `feature_autopilot_title/desc`, `feature_suggestions_title/desc`, `feature_dashboard_title/desc`

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/WhatItDoes.tsx
git commit -m "feat: rewrite features with color-coded badges, tilt mockups, product UIs"
```

---

## Task 8: Rewrite MetricsStrip with mini data visualizations

**Files:**
- Replace: `components/marketing/landing/MetricsStrip.tsx`

- [ ] **Step 1: Rewrite MetricsStrip.tsx**

Port from prototype `D:/megvax-landing/src/components/metrics.tsx`. Adapt:
- Use `useTranslations('landing')` for labels: `metrics_heading`, `metric_spend`, `metric_accounts`, `metric_roas`
- Mini bar chart for ₺2M+ (animated bars)
- Mini avatar grid for 150+ (colored dots, spring-in)
- Mini SVG trend line for 3.2x (animated draw with gradient)
- Reuse existing `Counter` component

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/MetricsStrip.tsx
git commit -m "feat: rewrite MetricsStrip with animated bar chart, avatar grid, trend line"
```

---

## Task 9: Create Testimonials component

**Files:**
- Create: `components/marketing/landing/Testimonials.tsx`

- [ ] **Step 1: Create Testimonials.tsx**

Port from prototype `D:/megvax-landing/src/components/testimonials.tsx`. Adapt:
- Use `useTranslations('landing')` for all testimonial content (keys added in Task 1)
- 3 cards with quote, metric highlight, author avatar (colored initial), name/role/company
- Hover lift + border accent transition
- Use `ScrollReveal` + `StaggerContainer` + `StaggerItem` from existing scroll-reveal

- [ ] **Step 2: Update index.ts to export Testimonials**

- [ ] **Step 3: Verify build**

- [ ] **Step 4: Commit**

```bash
git add components/marketing/landing/Testimonials.tsx components/marketing/landing/index.ts
git commit -m "feat: add Testimonials section with metric highlights and social proof"
```

---

## Task 10: Rewrite FinalCTA with dark card + gradient orbs

**Files:**
- Replace: `components/marketing/landing/FinalCTA.tsx`

- [ ] **Step 1: Rewrite FinalCTA.tsx**

Port from prototype `D:/megvax-landing/src/components/final-cta.tsx`. Adapt:
- Use `useTranslations('landing')` for heading, subtitle, button, trust badges, social proof badge
- Dark card (`landing-frame-bg`) with gradient orbs + dot grid
- Live indicator badge ("847 marka MegVax kullanıyor")
- White CTA button with arrow icon (use Lucide `ArrowRight`)
- Trust badges with Lucide icons: `Shield`, `CreditCard`, `Clock`
- CTA links to `/signup`

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/FinalCTA.tsx
git commit -m "feat: rewrite FinalCTA with dark gradient card, glow effects, trust badges"
```

---

## Task 11: Rewrite Footer with enhanced layout

**Files:**
- Replace: `components/marketing/landing/Footer.tsx`

- [ ] **Step 1: Rewrite Footer.tsx**

Keep existing i18n pattern (`useTranslations('landing')` with `footer_*` keys). Enhance:
- Proper 4-column grid: Product, Support, Legal, Contact
- Product: features link, pricing, about
- Support: help (contact), status
- Legal: privacy, terms, cookies
- Contact: email, location
- Bottom: logo, copyright, LanguageSwitcher
- Use V4 color tokens

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/Footer.tsx
git commit -m "feat: rewrite Footer with 4-column grid layout and enhanced links"
```

---

## Task 12: Update page.tsx + remove ProductShowcase + final integration

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update page.tsx**

```tsx
import { Nav } from '@/components/marketing/landing/Nav';
import { Hero } from '@/components/marketing/landing/Hero';
import { Platforms } from '@/components/marketing/landing/Platforms';
import { BeforeAfter } from '@/components/marketing/landing/BeforeAfter';
import { HowItWorks } from '@/components/marketing/landing/HowItWorks';
import { WhatItDoes } from '@/components/marketing/landing/WhatItDoes';
import { MetricsStrip } from '@/components/marketing/landing/MetricsStrip';
import { Testimonials } from '@/components/marketing/landing/Testimonials';
import { FinalCTA } from '@/components/marketing/landing/FinalCTA';
import { Footer } from '@/components/marketing/landing/Footer';

export default function Home() {
  return (
    <main className="bg-landing-bg text-landing-text min-h-screen">
      <Nav />
      <Hero />
      <Platforms />
      <BeforeAfter />
      <HowItWorks />
      <WhatItDoes />
      <MetricsStrip />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
```

Note: `ProductShowcase` removed (features merged into `WhatItDoes`). `SocialProof` replaced by `Testimonials`.

- [ ] **Step 2: Full build verification**

Run: `cd /d/MegvaxV4-main && npm run build`
Expected: Build succeeds with zero errors, all routes generate

- [ ] **Step 3: Visual verification — desktop + mobile screenshots**

Use Chrome DevTools MCP:
1. Navigate to `http://localhost:3000`
2. Resize to 1440x900, screenshot hero, scroll through all sections
3. Resize to 375x812, screenshot hero + CTA
4. Verify no overflow, no broken layouts

- [ ] **Step 4: Verify no regressions on other pages**

Navigate to: `/login`, `/signup`, `/pricing`, `/contact`, `/book`, `/terms`, `/privacy`, `/cookies`, `/about`
Each should still render correctly with their existing Nav + Footer.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: integrate all new landing sections — Platforms, Testimonials, enhanced flow"
```

---

## Task 13: Verify no app/backend breakage

**Files:** None — verification only

- [ ] **Step 1: Check that /app/* routes still build**

Run: `cd /d/MegvaxV4-main && npm run build 2>&1 | grep -E "error|Error|FAIL"`
Expected: No errors

- [ ] **Step 2: Check dashboard page exists**

Navigate to `/app/dashboard` (will redirect to login if not authenticated — that's correct behavior)

- [ ] **Step 3: Check admin page exists**

Navigate to `/admin-login` — should render login form

- [ ] **Step 4: Final commit with all integration verified**

```bash
git add -A
git commit -m "verify: all landing changes integrated, no regressions on app/admin routes"
```

---

## Execution Notes for Agents

1. **Always read the prototype file first** before writing the V4 version. The prototype lives at `D:/megvax-landing/src/components/`.
2. **Use V4 patterns**: `useTranslations()` for all user-facing text, Lucide icons where possible (except platform brand logos), V4 theme tokens from `globals.css`.
3. **Dashboard mockup internals stay hardcoded Turkish** — they represent the product UI, not marketing copy.
4. **Never import from `D:/megvax-landing/`** — port the code, don't reference the other project.
5. **Build check after every task** — `npm run build` must succeed before committing.
6. **The following files must NEVER be modified**: anything in `app/app/`, `app/admin/`, `megvax-api/`, `lib/api.ts`, `lib/auth-context.tsx`, `middleware.ts`.

# MegVax Landing Page Light Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the MegVax landing page from dark (#0A0A0F) to warm light (#FAFAF8) theme, targeting agencies, with subtle fast animations.

**Architecture:** Rewrite all 8 landing section components in-place (same file paths, same exports). Update globals.css with light theme tokens. Update i18n keys in both tr.json and en.json. Delete Results.tsx (section removed). No changes to dashboard, admin, auth, or backend.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4 (PostCSS plugin, @theme in CSS), Framer Motion 12, TypeScript, i18n via custom React Context (`useTranslations`)

**Spec:** `docs/superpowers/specs/2026-03-25-megvax-landing-light-redesign.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/globals.css` | Modify | Add landing light theme CSS custom properties |
| `components/marketing/landing/ScrollReveal.tsx` | Modify | Update easing constants |
| `messages/tr.json` | Modify | Update navigation + landing keys with new Turkish copy |
| `messages/en.json` | Modify | Update navigation + landing keys with new English copy |
| `components/marketing/landing/Nav.tsx` | Rewrite | Light theme nav with scroll blur |
| `components/marketing/landing/Hero.tsx` | Rewrite | Light hero with dark dashboard frame |
| `components/marketing/landing/SocialProof.tsx` | Rewrite | Brand strip replacing testimonials |
| `components/marketing/landing/WhatItDoes.tsx` | Rewrite | 3 text-only cards (was 6 with icons) |
| `components/marketing/landing/HowItWorks.tsx` | Rewrite | Light theme 3-step flow |
| `components/marketing/landing/MetricsStrip.tsx` | Rewrite | 3 counters on warm gray bg (was 4) |
| `components/marketing/landing/FinalCTA.tsx` | Rewrite | Light theme centered CTA |
| `components/marketing/landing/Footer.tsx` | Rewrite | Minimal flat footer (was 5-column grid) |
| `components/marketing/landing/Results.tsx` | Delete | Section removed from design |
| `components/marketing/landing/index.ts` | Modify | Remove Results export |
| `app/page.tsx` | Modify | Update bg/text, remove Results, reorder sections |

---

## Task 1: Foundation — Tokens, Easing, i18n

Update the shared foundations before touching any components.

**Files:**
- Modify: `app/globals.css:16-106` (inside `@theme` block)
- Modify: `components/marketing/landing/ScrollReveal.tsx:25,136` (easing values)
- Modify: `messages/tr.json` (navigation + landing sections)
- Modify: `messages/en.json` (navigation + landing sections)

- [ ] **Step 1: Add landing light theme tokens to globals.css**

Add these CSS custom properties inside the existing `@theme` block, after the existing color definitions. Do NOT remove existing dashboard/gray tokens — those are used by other pages.

```css
/* Landing — Light Theme */
--color-landing-bg: #FAFAF8;
--color-landing-bg-alt: #F3F2EF;
--color-landing-text: #1A1A1A;
--color-landing-text-muted: #6B7280;
--color-landing-text-faint: #71717A;
--color-landing-card-bg: #FFFFFF;
--color-landing-card-border: rgba(0,0,0,0.06);
--color-landing-card-hover-border: rgba(0,0,0,0.10);
--color-landing-cta-bg: #2563EB;
--color-landing-cta-hover: #1D4ED8;
--color-landing-nav-scroll-bg: rgba(250,250,248,0.8);
--color-landing-nav-scroll-border: rgba(0,0,0,0.05);
--color-landing-divider: rgba(0,0,0,0.06);
--color-landing-brand-muted: #D1D5DB;
--color-landing-step-bg: #EFF6FF;
--color-landing-step-text: #2563EB;
--color-landing-frame-bg: #0C0D14;
```

- [ ] **Step 2: Update ScrollReveal easing**

In `ScrollReveal.tsx`, change both easing arrays from `[0.33, 1, 0.68, 1]` to `[0.22, 1, 0.36, 1]`. There are two locations:
- ~line 25 in `ScrollReveal` component
- ~line 136 in `StaggerItem` component

- [ ] **Step 3: Update tr.json — navigation keys**

Update these existing values in the `"navigation"` section:
```json
"features": "Ürün",
"pricing": "Fiyatlar"
```
Other navigation keys (`contact`, `login`, `signup`) already have correct values.

- [ ] **Step 4: Update tr.json — landing keys**

Update these existing `"landing"` key values:
```json
"hero_badge": "AI destekli reklam yönetimi",
"hero_title": "Tüm hesaplarınızı\ntek yerden yönetin.",
"hero_subtitle": "Meta reklam hesaplarınızı bağlayın. AI optimize etsin, siz büyütün.",
"hero_cta": "Ücretsiz Dene",
"hero_cta_secondary": "Demo İzle",
"hero_trusted_by": "150+ ajans tarafından kullanılıyor",
"features_heading": "Ne Yapar?",
"feature_autopilot_title": "Otopilot",
"feature_autopilot_desc": "Düşük ROAS'lu reklamları durdurur, kazananları ölçekler.",
"feature_suggestions_title": "Akıllı Öneriler",
"feature_suggestions_desc": "AI önerileri incele, tek tıkla onayla.",
"feature_dashboard_title": "Tek Panel",
"feature_dashboard_desc": "Tüm hesaplar tek ekranda.",
"how_it_works_heading": "Nasıl Çalışır?",
"step1_title": "Bağla",
"step1_desc": "Meta hesaplarını bağla.",
"step2_title": "Ayarla",
"step2_desc": "Bütçe limitleri ve hedefleri belirle.",
"step3_title": "Otopilot",
"step3_desc": "Gerisini bize bırak.",
"metric_spend": "optimize edilen reklam bütçesi",
"metric_accounts": "yönetilen hesap",
"metric_roas": "ortalama ROAS",
"cta_heading": "Reklamlarınızı otopilote alın.",
"cta_button": "Ücretsiz Dene",
"cta_trust": "14 gün ücretsiz · Kredi kartı gerekmez"
```

- [ ] **Step 5: Update en.json — navigation keys**

Mirror the Turkish navigation changes:
```json
"features": "Product",
"pricing": "Pricing"
```

- [ ] **Step 6: Update en.json — landing keys**

Mirror Turkish changes with English translations:
```json
"hero_badge": "AI-powered ad management",
"hero_title": "Manage all your accounts\nfrom one place.",
"hero_subtitle": "Connect your Meta ad accounts. Let AI optimize, you scale.",
"hero_cta": "Start Free",
"hero_cta_secondary": "Watch Demo",
"hero_trusted_by": "Used by 150+ agencies",
"features_heading": "What It Does",
"feature_autopilot_title": "Autopilot",
"feature_autopilot_desc": "Pauses low-ROAS ads, scales winners automatically.",
"feature_suggestions_title": "Smart Suggestions",
"feature_suggestions_desc": "Review AI recommendations, approve with one click.",
"feature_dashboard_title": "One Dashboard",
"feature_dashboard_desc": "All accounts on one screen.",
"how_it_works_heading": "How It Works",
"step1_title": "Connect",
"step1_desc": "Link your Meta accounts.",
"step2_title": "Configure",
"step2_desc": "Set budget limits and goals.",
"step3_title": "Autopilot",
"step3_desc": "Leave the rest to us.",
"metric_spend": "optimized ad spend",
"metric_accounts": "accounts managed",
"metric_roas": "average ROAS",
"cta_heading": "Put your ads on autopilot.",
"cta_button": "Start Free",
"cta_trust": "14 days free · No credit card required"
```

- [ ] **Step 7: Remove dead i18n keys from both tr.json and en.json**

Remove these keys from both files:
- **`hero.*` namespace entirely** — the entire top-level `"hero": { ... }` object is legacy dead code
- All `landing.testimonial_*` keys
- All `landing.result_*` keys
- `landing.feature_scaling_*`, `landing.feature_protection_*`, `landing.feature_realtime_*`
- `landing.features_label`, `landing.features_subheading`, `landing.how_it_works_label`
- `landing.results_label`, `landing.results_heading`
- `landing.social_proof_title`, `landing.social_proof_subtitle`
- `landing.cta_subheading`
- `landing.footer_tagline`, `landing.footer_features`, `landing.footer_pricing`, `landing.footer_demo`, `landing.footer_status`
- `landing.footer_product_heading`, `landing.footer_company_heading`, `landing.footer_legal_heading`

**Do NOT remove `navigation.about`** — it is used by MarketingNav and MarketingFooter on non-landing pages.

- [ ] **Step 8: Update page.tsx background early**

Update `app/page.tsx` now to prevent broken visual state during component rewrites:
```tsx
<main className="bg-[#FAFAF8] text-[#1A1A1A] min-h-screen">
```
This ensures the warm off-white background is in place before light-themed components are committed in Tasks 2-8.

- [ ] **Step 9: Commit**

```bash
git add app/globals.css components/marketing/landing/ScrollReveal.tsx messages/tr.json messages/en.json app/page.tsx
git commit -m "feat: add light theme tokens, update easing, update i18n, switch page bg to light"
```

---

## Task 2: Nav — Light Theme

**Files:**
- Rewrite: `components/marketing/landing/Nav.tsx` (120 lines → ~100 lines)

- [ ] **Step 1: Rewrite Nav.tsx**

Full rewrite. Key specs:
- `'use client'` — needs useState for scroll and mobile menu
- `useTranslations('navigation')` — NOT 'landing'
- Logo: "MegVax" text in Space Grotesk, bold, `text-[#1A1A1A]`
- Links: `t('features')`, `t('pricing')`, `t('contact')` — Inter 14px, `text-[#6B7280]`, `hover:text-[#1A1A1A]`
- Ghost CTA: `t('login')` — text only, charcoal
- Primary CTA: `t('signup')` — `bg-[#2563EB] text-white rounded-full px-5 py-2 text-sm font-medium`
- Sticky: `fixed top-0 w-full z-50 h-16`
- Scroll state: `bg-[#FAFAF8]/80 backdrop-blur-xl border-b border-black/[0.05]` — use useState + useEffect with scroll listener (threshold ~10px)
- Mobile: hamburger button (Menu icon from lucide-react), slide-down drawer with `bg-[#FAFAF8]`, same links + CTAs stacked vertically
- No Framer Motion animation on nav itself

- [ ] **Step 2: Verify TypeScript**

```bash
cd /d/MegvaxV4-main && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/Nav.tsx
git commit -m "feat: rewrite Nav for light theme"
```

---

## Task 3: Hero — Light Theme with Dashboard Frame

**Files:**
- Rewrite: `components/marketing/landing/Hero.tsx` (297 lines → ~200 lines)

- [ ] **Step 1: Rewrite Hero.tsx**

Full rewrite. Key specs:
- `'use client'` with `import { motion } from 'framer-motion'`
- `useTranslations('landing')`
- Background: no layers — just the parent `bg-[#FAFAF8]` from page.tsx
- Section: `min-h-[100vh] flex flex-col items-center justify-center pt-16`
- Content container: `max-w-5xl mx-auto px-6 text-center`

Elements in order:
1. **Badge:** `<motion.div>` — pill with green dot + `t('hero_badge')`. Classes: `inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/[0.06] bg-white text-xs font-medium text-[#6B7280]`. Green dot: `w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse`
2. **H1:** `<motion.h1>` — `t('hero_title')`. Classes: `text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-[#1A1A1A]`, `style={{ fontFamily: 'var(--font-display)' }}`
3. **Subtext:** `<motion.p>` — `t('hero_subtitle')`. Classes: `mt-6 text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed`
4. **CTAs:** `<motion.div>` with flex. Primary: Link to `/signup`, `bg-[#2563EB] text-white px-7 py-3.5 rounded-xl font-semibold text-[15px] hover:bg-[#1D4ED8] hover:shadow-lg transition-all`. ArrowRight icon. Secondary: Link to `/book`, `text-[#1A1A1A]/60 text-[15px]`. Play icon.
5. **Trust line:** `<motion.p>` — `t('cta_trust')`. `text-[13px] text-[#71717A] mt-4`
6. **Dashboard frame:** `<motion.div>` — dark browser chrome (`bg-[#0C0D14]`) with traffic light dots and address bar. Inside: either `<Image src="/dashboard-preview.png">` (if exists) or the coded mockup from current Hero.tsx (keep the KPI cards + chart + campaign rows exactly as they are — they have dark-theme styles that work inside the dark frame). Transform: `perspective(2000px) rotateX(2deg)`. Shadow: `0 25px 80px -12px rgba(0,0,0,0.15)`. Bottom fade: gradient to `#FAFAF8`.

Easing: `const ease = [0.22, 1, 0.36, 1] as const`

Animations (all initial `opacity: 0, y: N` → animate `opacity: 1, y: 0`):
- Badge: y=16, 500ms, delay 0
- H1: y=20, 500ms, delay 0.1
- Subtext: y=20, 500ms, delay 0.2
- CTAs: y=20, 500ms, delay 0.3
- Dashboard: y=40, 700ms, delay 0.4

Mobile: CTAs flex-col on `sm:` breakpoint. Dashboard perspective removed on small screens via media query or conditional class.

Logo strip removed (moved to SocialProof section).

- [ ] **Step 2: Verify TypeScript**

```bash
cd /d/MegvaxV4-main && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/Hero.tsx
git commit -m "feat: rewrite Hero for light theme with dark dashboard frame"
```

---

## Task 4: SocialProof — Brand Strip

**Files:**
- Rewrite: `components/marketing/landing/SocialProof.tsx` (102 lines → ~50 lines)

- [ ] **Step 1: Rewrite SocialProof.tsx**

Full rewrite — replace testimonials with brand strip.
- `'use client'` with `import { motion } from 'framer-motion'`
- `useTranslations('landing')`
- Section: `py-16`
- Content container: `max-w-5xl mx-auto px-6 text-center`
- Heading: `t('hero_trusted_by')` — `text-[13px] uppercase tracking-widest text-[#9CA3AF] font-medium`
- Brands: array of strings `['TrendModa', 'GrowthLab', 'FitShop', 'Modanisa', 'Hepsiburada', 'N11']`
- Render brands joined by `·` separator, each in Space Grotesk, `text-[13px] font-semibold text-[#D1D5DB] tracking-wide`
- Layout: `flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-6`
- Animation: single `<motion.div>` wrapper, fade-in on scroll via `useInView`, `opacity 0→1, 300ms`

- [ ] **Step 2: Verify TypeScript**

```bash
cd /d/MegvaxV4-main && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/SocialProof.tsx
git commit -m "feat: rewrite SocialProof as brand strip"
```

---

## Task 5: WhatItDoes — 3 Text-Only Cards

**Files:**
- Rewrite: `components/marketing/landing/WhatItDoes.tsx` (85 lines → ~70 lines)

- [ ] **Step 1: Rewrite WhatItDoes.tsx**

Full rewrite — 3 cards, no icons.
- `'use client'`, `useTranslations('landing')`
- Import `ScrollReveal`, `StaggerContainer`, `StaggerItem` from same directory
- Section: `py-24`
- Content container: `max-w-5xl mx-auto px-6`
- Heading: `t('features_heading')` — `text-[32px] font-bold text-[#1A1A1A] text-center mb-12`, Space Grotesk via `style={{ fontFamily: 'var(--font-display)' }}`
- Cards data array:
  ```ts
  const features = [
    { title: t('feature_autopilot_title'), desc: t('feature_autopilot_desc') },
    { title: t('feature_suggestions_title'), desc: t('feature_suggestions_desc') },
    { title: t('feature_dashboard_title'), desc: t('feature_dashboard_desc') },
  ];
  ```
- Grid: `grid md:grid-cols-3 gap-4`
- Each card: `bg-white border border-black/[0.06] rounded-2xl p-8 transition-all duration-200 hover:border-black/[0.1] hover:shadow-sm`
- Card title: `text-[20px] font-semibold text-[#1A1A1A] mb-3`, Space Grotesk
- Card desc: `text-[15px] text-[#6B7280] leading-relaxed`
- Wrap heading in `<ScrollReveal>`, cards in `<StaggerContainer>` + `<StaggerItem>` with 100ms stagger

- [ ] **Step 2: Verify TypeScript**

```bash
cd /d/MegvaxV4-main && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/WhatItDoes.tsx
git commit -m "feat: rewrite WhatItDoes — 3 text-only cards, light theme"
```

---

## Task 6: HowItWorks — Light 3-Step Flow

**Files:**
- Rewrite: `components/marketing/landing/HowItWorks.tsx` (74 lines → ~80 lines)

- [ ] **Step 1: Rewrite HowItWorks.tsx**

Full rewrite for light theme.
- `'use client'`, `useTranslations('landing')`
- Import `ScrollReveal` from same directory
- Section: `py-20`
- Content container: `max-w-4xl mx-auto px-6`
- Heading: `t('how_it_works_heading')` — same style as features heading (32px, bold, centered)
- Steps data:
  ```ts
  const steps = [
    { num: '1', title: t('step1_title'), desc: t('step1_desc') },
    { num: '2', title: t('step2_title'), desc: t('step2_desc') },
    { num: '3', title: t('step3_title'), desc: t('step3_desc') },
  ];
  ```
- Desktop layout: `grid md:grid-cols-3 gap-8 mt-12 relative`
- Connector: `<div className="hidden md:block absolute top-4 left-[16.67%] right-[16.67%] h-px bg-[#E5E7EB]" />` — positioned behind step circles
- Each step (centered text):
  - Number circle: `w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] font-mono text-sm flex items-center justify-center mx-auto relative z-10`
  - Title: `mt-4 text-[18px] font-semibold text-[#1A1A1A]`, Space Grotesk
  - Desc: `mt-1 text-[14px] text-[#6B7280]`
- Mobile: connector hidden via `hidden md:block`, steps stack naturally
- Wrap in `<ScrollReveal>`

- [ ] **Step 2: Verify TypeScript**

```bash
cd /d/MegvaxV4-main && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/HowItWorks.tsx
git commit -m "feat: rewrite HowItWorks for light theme"
```

---

## Task 7: MetricsStrip — 3 Counters on Warm Gray

**Files:**
- Rewrite: `components/marketing/landing/MetricsStrip.tsx` (58 lines → ~60 lines)

- [ ] **Step 1: Rewrite MetricsStrip.tsx**

Full rewrite — 3 metrics (was 4), warm gray background.
- `'use client'`, `useTranslations('landing')`
- Import `Counter` from `./Counter`
- Import `ScrollReveal` from same directory
- Section: `py-20 bg-[#F3F2EF]`
- Content container: `max-w-4xl mx-auto px-6`
- Metrics data (values hardcoded, labels from i18n):
  ```ts
  const metrics = [
    { value: 2, suffix: 'M+', prefix: '₺', label: t('metric_spend') },
    { value: 150, suffix: '+', label: t('metric_accounts') },
    { value: 3.2, suffix: 'x', decimals: 1, label: t('metric_roas') },
  ];
  ```
- Layout: `grid md:grid-cols-3 gap-8` centered text
- Each metric:
  - Number: `<Counter value={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals} />` — wrapped in `text-[48px] font-extrabold text-[#1A1A1A]`, Space Grotesk
  - Label: `text-[14px] text-[#6B7280] mt-1`
- Desktop dividers: add `md:border-r md:border-black/[0.06]` on first two metrics, `md:last:border-r-0`
- Mobile: remove dividers naturally (border-r only on `md:`)
- Wrap in `<ScrollReveal>`

- [ ] **Step 2: Verify TypeScript**

```bash
cd /d/MegvaxV4-main && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add components/marketing/landing/MetricsStrip.tsx
git commit -m "feat: rewrite MetricsStrip — 3 counters on warm gray"
```

---

## Task 8: FinalCTA + Footer — Light Theme

**Files:**
- Rewrite: `components/marketing/landing/FinalCTA.tsx` (60 lines → ~45 lines)
- Rewrite: `components/marketing/landing/Footer.tsx` (120 lines → ~60 lines)

- [ ] **Step 1: Rewrite FinalCTA.tsx**

Full rewrite — minimal centered CTA.
- `'use client'`, `useTranslations('landing')`
- Import Link from `next/link`, ArrowRight from `lucide-react`
- Import `ScrollReveal` from same directory
- Section: `py-32`
- Content: centered, `max-w-2xl mx-auto px-6 text-center`
- Heading: `t('cta_heading')` — `text-[36px] font-bold text-[#1A1A1A]`, Space Grotesk
- CTA button: Link to `/signup`, same blue pill as hero — `mt-8 inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#2563EB] text-white text-[15px] font-semibold rounded-xl hover:bg-[#1D4ED8] hover:shadow-lg transition-all`
- Trust line: `t('cta_trust')` — `mt-4 text-[13px] text-[#71717A]`
- Wrap in `<ScrollReveal>`

- [ ] **Step 2: Rewrite Footer.tsx**

Full rewrite — minimal flat layout.
- `'use client'`, `useTranslations('landing')`
- Import `LanguageSwitcher` from `@/components/ui/LanguageSwitcher`
- Section: `py-12 border-t border-black/[0.06]`
- Content: `max-w-5xl mx-auto px-6`
- Layout: flex between — logo left, links center, copyright + language right
- Logo: "MegVax" — `text-lg font-bold text-[#1A1A1A]`, Space Grotesk
- Links: `t('footer_about')`, `t('footer_privacy')`, `t('footer_terms')`, `t('footer_contact')` — `text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors` — hrefs: `/about`, `/privacy`, `/terms`, `/contact`
- Bottom row: `t('footer_copyright')` — `text-[13px] text-[#9CA3AF]`, LanguageSwitcher on right
- No animation

- [ ] **Step 3: Verify TypeScript**

```bash
cd /d/MegvaxV4-main && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add components/marketing/landing/FinalCTA.tsx components/marketing/landing/Footer.tsx
git commit -m "feat: rewrite FinalCTA and Footer for light theme"
```

---

## Task 9: Wire Up — page.tsx, index.ts, Delete Results

**Files:**
- Modify: `app/page.tsx` (25 lines)
- Modify: `components/marketing/landing/index.ts` (11 lines)
- Delete: `components/marketing/landing/Results.tsx` (100 lines)

- [ ] **Step 1: Update page.tsx — remove Results, reorder sections**

The bg/text was already updated in Task 1. Now update imports and section order:
```tsx
import { Nav } from '@/components/marketing/landing/Nav';
import { Hero } from '@/components/marketing/landing/Hero';
import { SocialProof } from '@/components/marketing/landing/SocialProof';
import { WhatItDoes } from '@/components/marketing/landing/WhatItDoes';
import { HowItWorks } from '@/components/marketing/landing/HowItWorks';
import { MetricsStrip } from '@/components/marketing/landing/MetricsStrip';
import { FinalCTA } from '@/components/marketing/landing/FinalCTA';
import { Footer } from '@/components/marketing/landing/Footer';

export default function Home() {
  return (
    <main className="bg-[#FAFAF8] text-[#1A1A1A] min-h-screen">
      <Nav />
      <Hero />
      <SocialProof />
      <WhatItDoes />
      <HowItWorks />
      <MetricsStrip />
      <FinalCTA />
      <Footer />
    </main>
  );
}
```

Key changes: Results removed, SocialProof moved after Hero.

- [ ] **Step 2: Update index.ts**

Remove the `Results` export line. Keep all other exports.

- [ ] **Step 3: Full TypeScript check**

```bash
cd /d/MegvaxV4-main && npx tsc --noEmit --pretty
```

Expected: 0 errors. If any errors mention `Results`, grep for stale imports.

- [ ] **Step 4: Commit**

```bash
git rm components/marketing/landing/Results.tsx
git add app/page.tsx components/marketing/landing/index.ts
git commit -m "feat: wire up light landing — remove Results, reorder sections"
```

---

## Task 10: Visual Verification + Final Cleanup

**Files:** None new — verification only

- [ ] **Step 1: Start dev server**

```bash
cd /d/MegvaxV4-main && npm run dev
```

Open http://localhost:3000 and verify:
- Warm off-white background throughout
- Nav: transparent → blurred on scroll, mobile hamburger works
- Hero: badge → headline → subtext → CTAs → dashboard frame, all animated
- Social proof: muted brand names with heading
- Features: 3 white cards, hover effect works
- How it works: 3 steps with connector line on desktop
- Metrics: warm gray bg, counters animate on scroll
- Final CTA: centered, blue button
- Footer: minimal, language switcher works
- All text renders in Turkish by default

- [ ] **Step 2: Check English translation**

Switch language to EN via language switcher. Verify all sections render English text correctly.

- [ ] **Step 3: Check mobile responsiveness**

Resize browser to 375px width. Verify:
- Nav hamburger appears
- Hero CTAs stack
- Feature cards stack
- Steps stack
- Metrics stack without dividers

- [ ] **Step 4: Run lint**

```bash
cd /d/MegvaxV4-main && npm run lint
```

Fix any issues found.

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A && git commit -m "fix: address visual/lint issues from landing redesign"
```

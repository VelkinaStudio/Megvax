# MegVax Landing Page Redesign + Project Cleanup

**Date:** 2026-03-24
**Status:** Approved
**Branch:** feat/phase1-backend (continuing existing work)

---

## 1. Goals

1. **Clean the project** — remove all cruft directories, unused files, stale dependencies
2. **Redesign the landing page** — bold, confident, dark, no generic AI aesthetics
3. **Push to MegvaxV5 repo** — clean state at https://github.com/MischieS/MegvaxV5

### Design Direction: Bold & Confident

- Dark base (`#0A0A0F`), sharp Space Grotesk headings, Inter body
- Minimal animation — only entrance fades and staggered reveals via Framer Motion
- Every section earns its space. No filler, no cliche, clear and quick.
- Turkish as default language, i18n keys for all visible text

---

## 2. Project Cleanup

### Directories to Delete

| Directory | Reason |
|---|---|
| `.agents/` | Windsurf SuperDesign skill files — not used |
| `.windsurf/` | Windsurf IDE config — not used |
| `.storybook/` | Storybook config — removing Storybook |
| `stories/` | Storybook stories — removing Storybook |
| `e2e/` | Playwright e2e tests — no real test infra, placeholder files |
| `.next/` | Build cache — regenerated on build |

### Files to Delete from `public/`

All unused placeholder images:
- `audience-1.png`, `audience-2.png`, `audience-3.png`
- `benefit-1.png`, `benefit-2.png`, `benefit-3.png`
- `hero-visual.png`, `hero_chaos_before_*.png`, `hero_unified_after_*.png`
- `step-1.png`, `step-2.png`, `step-3.png`
- `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`

### Files to Delete from Root

- `HANDOFF.md` — Windsurf handoff doc, not relevant
- `playwright.config.ts` — removing e2e
- `vitest.config.ts` — no unit tests currently running
- `vitest.setup.ts` — same
- `tsconfig.tsbuildinfo` — build cache

### Dependencies to Remove

```
@storybook/* (all 8 packages)
storybook
playwright
@playwright/test
gsap
lenis
three
@types/three
```

### Dependencies to Keep

```
next, react, react-dom
framer-motion (landing animations)
tailwindcss, @tailwindcss/postcss, tailwind-merge
lucide-react (icons)
react-hook-form, @hookform/resolvers, zod
dompurify
clsx
```

---

## 3. Landing Page Components to Remove

All of these in `components/marketing/` and `components/marketing/landing/`:

**Remove entirely:**
- `DotGrid.tsx` + `DotGrid.css` — interactive dot grid background
- `GlowingOrb.tsx` — decorative orb
- `FloatingLines.tsx` + `FloatingLines.css` — animated lines
- `FloatingLinesReactBits.tsx` — alternate floating lines
- `FloatingElement.tsx` — floating decorative element
- `SmoothScroll.tsx` — Lenis smooth scroll wrapper (removing Lenis)
- `GridBackground.tsx` — grid pattern background
- `AuroraBackground.tsx` — aurora effect
- `ParallaxScroll.tsx` — parallax container (removing GSAP)
- `WarpBackground.tsx` — warp effect
- `RetroGrid.tsx` — retro grid effect
- `GlassStatCard.tsx` — glassmorphism stat card
- `InfiniteMarquee.tsx` — infinite scroll marquee
- `InteractiveFeatureTour.tsx` — interactive feature walkthrough
- `LivingTestimonial.tsx` — animated testimonial
- `MagneticButton.tsx` — magnetic hover button
- `TechCard.tsx` — tech stack card
- `TestimonialCarousel.tsx` — carousel (no real testimonials)
- `TextReveal.tsx` — text reveal animation
- `StoryHero.tsx` — story-style hero
- `BentoFeatures.tsx` — bento grid features
- `ProcessSection.tsx` — process section
- `AnimatedBarChart.tsx` — animated chart

**Keep and refactor:**
- `MarketingNav.tsx` — simplify, dark variant only
- `MarketingFooter.tsx` → rewrite as minimal footer
- `AnimatedText.tsx` → simplify to basic fade-up
- `Counter.tsx` → keep for metrics section
- `ScrollReveal.tsx` → keep for entrance animations
- `MotionGraph.tsx` → evaluate, may keep for hero visual

**Keep as-is:**
- `Navigation.tsx` — if different from MarketingNav, consolidate

---

## 4. New Landing Page Structure

### Section 1: Hero

```
┌─────────────────────────────────────────────────┐
│  [Logo]                    [Giriş Yap] [Başla]  │  ← Nav
│                                                   │
│  Reklamlarınız                                    │
│  Otopilotta.                                      │  ← H1, Space Grotesk, ~72px
│                                                   │
│  Meta reklamlarınızı yapay zeka yönetir.          │  ← Subtext, Inter, muted
│  Kaybedenleri durdurur, kazananları büyütür.      │
│                                                   │
│  [Ücretsiz Dene →]                               │  ← Primary CTA button
│                                                   │
│  ┌───────────────────────────────────────┐       │
│  │  Dashboard mockup / screenshot        │       │  ← Clipped at bottom, slight
│  │  (dark UI showing real dashboard)     │       │     perspective tilt via CSS
│  └───────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

- Background: solid `#0A0A0F`, subtle radial gradient from top-center (`#0A0A0F` → `#0F172A`)
- H1 animates in with fade-up (Framer Motion, 0.6s)
- Subtext follows 0.2s later
- CTA follows 0.2s after that
- Dashboard image fades in last, slight upward slide

### Section 2: What It Does

```
┌─────────────────────────────────────────────────┐
│               Ne Yapar?                          │  ← Section heading, centered
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ ⚡        │  │ 🎯        │  │ 📊        │      │
│  │ Otopilot │  │ Öneriler  │  │ Tek Panel │      │
│  │           │  │           │  │           │      │
│  │ Düşük     │  │ AI        │  │ Tüm       │      │
│  │ performans│  │ önerileri │  │ hesaplar  │      │
│  │ olanı     │  │ tek tıkla │  │ tek       │      │
│  │ durdurur, │  │ onayla.   │  │ ekranda.  │      │
│  │ kazananı  │  │           │  │           │      │
│  │ büyütür.  │  │           │  │           │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
```

- 3 cards, `bg-white/5` with `border border-white/10`, rounded-2xl
- Each card: Lucide icon (Zap, Target, LayoutDashboard), title (bold), 2-line description
- Cards stagger in on scroll (0.1s delay each)
- No "Learn more" links — the card IS the explanation

### Section 3: How It Works

```
┌─────────────────────────────────────────────────┐
│                                                   │
│    ① Bağla          ② Ayarla         ③ Otopilot │
│    Meta hesabını    Bütçe ve hedef   Gerisini    │
│    bağla.           belirle.         bize bırak. │
│                                                   │
│    ●────────────────●────────────────●           │
│                                                   │
└─────────────────────────────────────────────────┘
```

- Compact: ~200px height, not a full viewport
- Horizontal 3-step with connecting line
- Step numbers in accent blue circles
- Minimal text: title + one sentence each
- Light horizontal rule connector between steps

### Section 4: Metrics Strip

```
┌─────────────────────────────────────────────────┐
│                                                   │
│   ₺2M+              150+              3.2x       │
│   optimize edilen    yönetilen         ortalama   │
│   reklam bütçesi     hesap             ROAS       │
│                                                   │
└─────────────────────────────────────────────────┘
```

- Dark strip, slightly lighter than hero (`#111118`)
- 3 metrics in a row, large numbers (48px), small labels underneath
- Numbers animate up via Counter component on scroll-into-view
- If no real data available at launch: replace with "Beta'ya katıl" CTA

### Section 5: Final CTA

```
┌─────────────────────────────────────────────────┐
│                                                   │
│        Reklamlarınızı otopilote alın.            │
│                                                   │
│        [Ücretsiz Dene →]                         │
│                                                   │
│        14 gün ücretsiz · Kredi kartı gerekmez   │
│                                                   │
└─────────────────────────────────────────────────┘
```

- Centered text, bold heading
- Same CTA button style as hero
- Trust line in muted text below
- Subtle radial gradient background matching hero

### Footer

```
┌─────────────────────────────────────────────────┐
│  MegVax                                          │
│                                                   │
│  Hakkımızda · Gizlilik · Kullanım Şartları      │
│  İletişim · TR / EN                              │
│                                                   │
│  © 2026 MegVax. Tüm hakları saklıdır.           │
└─────────────────────────────────────────────────┘
```

- Minimal, single section
- Logo left or centered, links in a row, copyright below
- Same dark background, border-top in `white/10`

---

## 5. Component Architecture

### New Files

| File | Purpose |
|---|---|
| `components/marketing/landing/Hero.tsx` | Hero section with headline, subtext, CTA, dashboard mockup |
| `components/marketing/landing/WhatItDoes.tsx` | 3 feature cards |
| `components/marketing/landing/HowItWorks.tsx` | 3-step horizontal flow |
| `components/marketing/landing/MetricsStrip.tsx` | Animated metrics bar |
| `components/marketing/landing/FinalCTA.tsx` | Bottom conversion section |
| `components/marketing/landing/Footer.tsx` | Rewrite existing footer — minimal |
| `components/marketing/landing/Nav.tsx` | Consolidate from MarketingNav — dark, simple |
| `components/marketing/landing/ScrollFadeIn.tsx` | Reusable scroll-triggered fade-up wrapper |

### Shared Utilities

- `Counter.tsx` — keep existing, used in MetricsStrip
- `ScrollReveal.tsx` → rename to `ScrollFadeIn.tsx`, simplify to single fade-up variant

### Landing Page (`app/page.tsx`)

```tsx
export default function Home() {
  return (
    <main className="bg-[#0A0A0F] text-white">
      <Nav />
      <Hero />
      <WhatItDoes />
      <HowItWorks />
      <MetricsStrip />
      <FinalCTA />
      <Footer />
    </main>
  );
}
```

- No SmoothScroll wrapper (removing Lenis)
- `'use client'` only on components that need Framer Motion
- Page itself can be a server component that imports client components

---

## 6. Design Tokens

Keeping existing globals.css tokens, with these adjustments:

```css
/* Hero gradient */
--hero-bg: radial-gradient(ellipse at top center, #0F172A 0%, #0A0A0F 70%);

/* Card surfaces */
--card-bg: rgba(255, 255, 255, 0.05);
--card-border: rgba(255, 255, 255, 0.10);
--card-hover-border: rgba(255, 255, 255, 0.20);

/* CTA button */
--cta-bg: #2563EB;
--cta-hover: #1D4ED8;
--cta-text: #FFFFFF;
```

Remove all `.neo-*`, `.glass-*`, `.mesh-gradient`, `.text-glow`, `.border-glow` classes from globals.css — they belong to the old design.

---

## 7. i18n Keys

All visible text uses `useTranslations()`. New keys under `landing.*` namespace in `messages/tr.json` and `messages/en.json`:

```json
{
  "landing": {
    "nav": {
      "login": "Giriş Yap",
      "cta": "Ücretsiz Dene"
    },
    "hero": {
      "title": "Reklamlarınız\nOtopilotta.",
      "subtitle": "Meta reklamlarınızı yapay zeka yönetir. Kaybedenleri durdurur, kazananları büyütür.",
      "cta": "Ücretsiz Dene"
    },
    "features": {
      "heading": "Ne Yapar?",
      "autopilot_title": "Otopilot",
      "autopilot_desc": "Düşük performans olanı durdurur, kazananı büyütür.",
      "suggestions_title": "Akıllı Öneriler",
      "suggestions_desc": "AI önerileri tek tıkla onayla.",
      "dashboard_title": "Tek Panel",
      "dashboard_desc": "Tüm hesaplar, tek ekranda."
    },
    "steps": {
      "heading": "Nasıl Çalışır?",
      "step1_title": "Bağla",
      "step1_desc": "Meta hesabını bağla.",
      "step2_title": "Ayarla",
      "step2_desc": "Bütçe ve hedef belirle.",
      "step3_title": "Otopilot",
      "step3_desc": "Gerisini bize bırak."
    },
    "metrics": {
      "spend": "optimize edilen reklam bütçesi",
      "accounts": "yönetilen hesap",
      "roas": "ortalama ROAS"
    },
    "cta": {
      "heading": "Reklamlarınızı otopilote alın.",
      "button": "Ücretsiz Dene",
      "trust": "14 gün ücretsiz · Kredi kartı gerekmez"
    },
    "footer": {
      "about": "Hakkımızda",
      "privacy": "Gizlilik",
      "terms": "Kullanım Şartları",
      "contact": "İletişim",
      "copyright": "© 2026 MegVax. Tüm hakları saklıdır."
    }
  }
}
```

---

## 8. What Does NOT Change

- **Backend** (`megvax-api/`) — untouched
- **Dashboard** (`app/app/*`, `components/dashboard/*`, `components/layouts/*`) — untouched
- **Auth pages** (`app/login/`, `app/signup/`, etc.) — untouched
- **Lib** (`lib/*`) — untouched except removing Lenis/GSAP imports if any
- **Types** (`types/*`) — untouched
- **Admin** (`app/admin/*`) — untouched

---

## 9. Execution Order

1. Project cleanup (delete cruft dirs/files, remove deps, clean globals.css)
2. Remove old landing components
3. Build new landing components (Hero → WhatItDoes → HowItWorks → MetricsStrip → FinalCTA → Footer → Nav)
4. Update `app/page.tsx` to use new components
5. Update i18n messages
6. TypeScript check (`npx tsc --noEmit`)
7. Visual verification (`npm run dev`)
8. Complete remaining Phase 2 tasks (8-11) if time permits
9. Set up MegvaxV5 remote and push

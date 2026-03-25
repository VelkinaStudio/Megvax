# MegVax Landing Page — Light Theme Redesign

**Date:** 2026-03-25
**Status:** Approved
**Supersedes:** 2026-03-24-megvax-landing-redesign.md (dark theme)
**Branch:** TBD

---

## 1. Goals

1. **Redesign the landing page from dark to warm light theme** — off-white (`#FAFAF8`), warm, approachable
2. **Target audience: agencies** — media buying agencies managing multiple Meta ad accounts
3. **Animations: subtle and fast** — quick fade-ups, micro-interactions, nothing that makes you wait
4. **Dashboard screenshot as hero visual** — real app screenshot, dark-framed, on warm background
5. **Typography-driven design** — whitespace and type hierarchy create structure, not color blocks or decorative elements

### Design Direction: Warm Mono

Inspired by Clay + Mercury. Single warm off-white background throughout. Dark charcoal text. Blue accent only on CTAs. The dashboard screenshot in a dark frame is the only visually rich element — making it the focal point. Restraint is the premium signal.

### Reference Sites

| Site | What to steal |
|------|--------------|
| Clay | Quantified testimonials, typography craft |
| Mercury | Fintech-grade trust aesthetic, smooth entrance animations |
| Linear | 4-tier text opacity hierarchy |
| Stripe | Dashboard in dark frame on light bg |
| Attio | Confident short taglines |

---

## 2. Design Tokens

### Colors (replacing dark theme)

```
Base background:     #FAFAF8   (warm off-white)
Metrics strip bg:    #F3F2EF   (slightly warmer, only different-bg section)
Text primary:        #1A1A1A   (charcoal)
Text muted:          #6B7280   (gray-500)
Text faint:          #71717A   (zinc-500, 5.1:1 contrast on #FAFAF8 — WCAG AA)
Card bg:             #FFFFFF   (white)
Card border:         rgba(0,0,0,0.06)
Card hover border:   rgba(0,0,0,0.10)
CTA bg:              #2563EB   (blue — unchanged)
CTA hover:           #1D4ED8
CTA text:            #FFFFFF
Step circle bg:      #EFF6FF   (blue-50)
Step circle text:    #2563EB
Dashboard frame:     #0C0D14   (dark — intentional contrast)
Nav scroll bg:       rgba(250,250,248,0.8)  + backdrop-blur-xl
Nav scroll border:   rgba(0,0,0,0.05)
Divider:             rgba(0,0,0,0.06)
Logo text brands:    #D1D5DB   (very muted)
```

### Typography (unchanged)

```
Heading:   Space Grotesk  (--font-display)
Body:      Inter          (--font-body)
Mono:      JetBrains Mono (--font-mono)
```

### Animation Defaults

```
Easing:    [0.22, 1, 0.36, 1]  (custom expo out)
Duration:  400–500ms for entrances
Delay:     100ms stagger between siblings
Trigger:   Once on scroll-into-view (IntersectionObserver via Framer Motion)
Reduced motion: respect prefers-reduced-motion — instant show, no animation
```

**Note:** Update `ScrollReveal.tsx` easing from `[0.33, 1, 0.68, 1]` to `[0.22, 1, 0.36, 1]` in both `ScrollReveal` and `StaggerItem` components to match spec defaults.

---

## 3. Page Sections

### Section 1: Navigation

Sticky top bar. Transparent on load, gains blur + border on scroll.

- **Logo:** "MegVax" in Space Grotesk, bold, `#1A1A1A`
- **Links:** "Ürün", "Fiyatlar", "İletişim" — Inter, 14px, `#6B7280`, hover → `#1A1A1A`
- **Ghost CTA:** "Giriş" — text only, charcoal
- **Primary CTA:** "Başla" — solid blue pill (`#2563EB`), white text, rounded-full
- **Scroll state:** `bg-[#FAFAF8]/80 backdrop-blur-xl border-b border-black/[0.05]`
- **Height:** 64px fixed
- **Animation:** None. Instant.
- **Mobile:** Hamburger menu icon, slide-down drawer with same links + CTAs. Same warm bg.

### Section 2: Hero

Typography-driven with real dashboard screenshot as centerpiece.

- **Background:** Solid `#FAFAF8`. No gradients, no noise, no grid.
- **Badge:** Pill above headline — "AI destekli reklam yönetimi" with pulsing green dot. `border border-black/[0.06] bg-white text-xs font-medium text-[#6B7280]`, rounded-full, `px-4 py-1.5`
- **H1:** "Tüm hesaplarınızı tek yerden yönetin." — Space Grotesk, `clamp(2.5rem, 6vw, 4rem)`, `#1A1A1A`, font-extrabold, leading-[0.95], tracking-[-0.03em], centered
- **Subtext:** "Meta reklam hesaplarınızı bağlayın. AI optimize etsin, siz büyütün." — Inter, 18px, `#6B7280`, max-w-lg, centered, leading-relaxed
- **Primary CTA:** Blue pill, "Ücretsiz Dene →", `px-7 py-3.5`, rounded-xl, ArrowRight icon. Hover: `#1D4ED8` + subtle shadow
- **Secondary CTA:** Text link, "Demo İzle", charcoal, Play icon, no border
- **Trust line:** "14 gün ücretsiz · Kredi kartı gerekmez" — `#71717A`, 13px
- **Dashboard visual:** Real screenshot of MegVax dashboard inside dark browser chrome frame:
  - Frame: `#0C0D14`, rounded-2xl, traffic light dots, address bar with "app.megvax.com/dashboard"
  - Transform: `perspective(2000px) rotateX(2deg)`, origin bottom center
  - Shadow: `0 25px 80px -12px rgba(0,0,0,0.15)` (softer than dark version)
  - Bottom fade: gradient from dashboard bottom into page bg
- **Height:** ~100vh
- **Animations:**
  - Badge: `opacity 0→1, y 16→0, 500ms`
  - H1: `opacity 0→1, y 20→0, 500ms, +100ms delay`
  - Subtext: same, +200ms delay
  - CTAs: same, +300ms delay
  - Dashboard: `opacity 0→1, y 40→0, 700ms, +400ms delay`
- **Mobile:** H1 clamp handles scaling. CTAs stack vertically (`flex-col`). Dashboard frame loses perspective tilt. `max-w-2xl` for subtext on wider screens, naturally constrains on mobile.

### Section 3: Social Proof Strip

Quiet confidence line, same background as page.

- **Heading:** "150+ ajans tarafından kullanılıyor" — `#9CA3AF`, Inter, 13px, uppercase, tracking-widest, centered
- **Brands:** Text-only names in Space Grotesk, `#D1D5DB`, separated by `·` dots. (Replace with grayscale logo images later, `opacity-40 hover:opacity-70`)
- **Brands list:** TrendModa, GrowthLab, FitShop, Modanisa, Hepsiburada, N11
- **Spacing:** `py-16`
- **Height:** ~120px
- **Animation:** Fade-in on scroll, 300ms, single group

### Section 4: Features — "Ne Yapar?"

Three cards, no icons, words do the work.

- **Section heading:** "Ne Yapar?" — Space Grotesk, 32px, `#1A1A1A`, centered, font-bold
- **Cards:** `bg-white`, `border border-black/[0.06]`, rounded-2xl, `p-8`
  - No shadow at rest. Hover: `border-black/[0.1]` + `shadow-sm`
- **Card title:** Space Grotesk, 20px, `#1A1A1A`, font-semibold
- **Card descriptions:**
  - Otopilot: "Düşük ROAS'lu reklamları durdurur, kazananları ölçekler."
  - Akıllı Öneriler: "AI önerileri incele, tek tıkla onayla."
  - Tek Panel: "Tüm hesaplar tek ekranda."
- **Card desc style:** Inter, 15px, `#6B7280`, leading-relaxed
- **Grid:** 3 columns desktop (`md:grid-cols-3`), single column mobile, `gap-4`
- **Spacing:** `py-24`
- **Animations:** Heading fade-up 400ms, cards stagger 100ms delay each
- **Mobile:** Cards stack vertically, full width

### Section 5: How It Works — "Nasıl Çalışır?"

Compact horizontal 3-step flow.

- **Section heading:** "Nasıl Çalışır?" — same style as features heading
- **Step numbers:** `#2563EB` text, inside 32px circle with `bg-[#EFF6FF]`, font-mono, 14px
- **Step title:** Space Grotesk, 18px, `#1A1A1A`, semibold
- **Step descriptions:**
  - ① Bağla: "Meta hesaplarını bağla."
  - ② Ayarla: "Bütçe limitleri ve hedefleri belirle."
  - ③ Otopilot: "Gerisini bize bırak."
- **Step desc style:** Inter, 14px, `#6B7280`, one line
- **Connector:** 1px horizontal line in `#E5E7EB` connecting circles (desktop only)
- **Height:** ~250px
- **Spacing:** `py-20`
- **Animation:** Fade-up, single group, 400ms
- **Mobile:** Steps stack vertically, connector becomes vertical line on left side. Or simply stack without connector.

### Section 6: Metrics Strip

Only section with a different background color.

- **Background:** `#F3F2EF` (warm gray)
- **Metrics:**
  - ₺2M+ — "optimize edilen reklam bütçesi"
  - 150+ — "yönetilen hesap"
  - 3.2x — "ortalama ROAS"
- **Numbers:** Space Grotesk, 48px, `#1A1A1A`, font-extrabold
- **Labels:** Inter, 14px, `#6B7280`
- **Layout:** 3 columns centered, vertical dividers (`border-r border-black/[0.06]`) between metrics on desktop
- **Spacing:** `py-20`
- **Height:** ~200px
- **Counter animation:** Numbers count up from 0 via Counter component, spring physics, ~800ms, triggered on scroll
- **Mobile:** Stack to single column, remove vertical dividers. Numbers centered.

### Section 7: Final CTA

Three lines centered. Maximum whitespace.

- **Background:** `#FAFAF8`
- **Heading:** "Reklamlarınızı otopilote alın." — Space Grotesk, 36px, `#1A1A1A`, font-bold, centered
- **CTA:** Same blue pill as hero
- **Trust line:** "14 gün ücretsiz · Kredi kartı gerekmez" — `#71717A`, 13px
- **Spacing:** `py-32`
- **Animation:** Fade-up, 400ms

### Section 8: Footer

Minimal. Static.

- **Background:** `#FAFAF8`
- **Top border:** `border-t border-black/[0.06]`
- **Logo:** "MegVax" Space Grotesk, bold, `#1A1A1A`, left-aligned
- **Links:** Hakkımızda, Gizlilik, Kullanım Şartları, İletişim — Inter, 14px, `#6B7280`, hover `#1A1A1A`
- **Copyright:** "© 2026 MegVax. Tüm hakları saklıdır." — Inter, 13px, `#9CA3AF`
- **Language switcher:** "TR / EN", right-aligned, `#6B7280`
- **Spacing:** `py-12`
- **Animation:** None

---

## 4. Full Page Flow

| # | Section | Background | Approx Height |
|---|---------|-----------|---------------|
| 1 | Nav | transparent → `#FAFAF8/80` blur | fixed, 64px |
| 2 | Hero | `#FAFAF8` | ~100vh |
| 3 | Social Proof | `#FAFAF8` | ~120px |
| 4 | Features | `#FAFAF8` | ~400px |
| 5 | How It Works | `#FAFAF8` | ~250px |
| 6 | Metrics Strip | `#F3F2EF` | ~200px |
| 7 | Final CTA | `#FAFAF8` | ~300px |
| 8 | Footer | `#FAFAF8` | ~150px |

---

## 5. Component Architecture

### Files to modify (rewrite)

| File | Change |
|------|--------|
| `app/page.tsx` | Remove `Results` import, update bg to `#FAFAF8`, text to charcoal |
| `app/globals.css` | Add light landing theme tokens as CSS custom properties, keep dashboard dark tokens |
| `components/marketing/landing/Nav.tsx` | Rewrite for light theme. Keep using `useTranslations('navigation')` namespace. |
| `components/marketing/landing/Hero.tsx` | Rewrite for light theme + real screenshot |
| `components/marketing/landing/WhatItDoes.tsx` | Rewrite cards for light theme |
| `components/marketing/landing/HowItWorks.tsx` | Rewrite for light theme |
| `components/marketing/landing/MetricsStrip.tsx` | Rewrite for warm gray bg |
| `components/marketing/landing/FinalCTA.tsx` | Rewrite for light theme |
| `components/marketing/landing/Footer.tsx` | Rewrite for light theme (minimal flat layout, replaces 5-column grid) |
| `components/marketing/landing/SocialProof.tsx` | **Rewrite entirely** — replace testimonial cards with brand logo strip |
| `components/marketing/landing/ScrollReveal.tsx` | Update easing to `[0.22, 1, 0.36, 1]` |
| `components/marketing/landing/Counter.tsx` | Keep `Counter` function as-is. Note: `StatCard` export in this file has dark-theme styles — it is NOT used in the light landing page. |
| `components/marketing/landing/index.ts` | Remove `Results` export |
| `messages/tr.json` | Update `hero.*` keys with new copy, add new `landing.*` keys |
| `messages/en.json` | Mirror Turkish key changes with English translations |

### Files to delete

| File | Reason |
|------|--------|
| `components/marketing/landing/Results.tsx` | Section removed from landing page. Not in new design. |

### No changes to

- Dashboard (`app/app/*`, `components/dashboard/*`)
- Auth pages
- Admin pages
- Backend / lib / types

---

## 6. i18n Keys

**Strategy:** All landing components currently use `useTranslations('landing')`. We keep this single namespace for all landing page content. Nav uses `useTranslations('navigation')` separately. The `hero.*` namespace in `tr.json` is legacy — those keys become dead code.

**All components use `useTranslations('landing')` except Nav which uses `useTranslations('navigation')`.**

### `navigation.*` keys — update values (in both `tr.json` and `en.json`)

These keys are only used by the landing Nav and MarketingNav (verified — dashboard sidebar uses different keys).

```json
{
  "navigation": {
    "features": "Ürün",
    "pricing": "Fiyatlar",
    "contact": "İletişim",
    "login": "Giriş Yap",
    "signup": "Başla"
  }
}
```

### `landing.*` keys — update existing + add new (in both `tr.json` and `en.json`)

Keys marked ✏️ already exist and need value updates. Keys marked ➕ are new.

```json
{
  "landing": {
    "hero_badge": "AI destekli reklam yönetimi",
    "hero_title": "Tüm hesaplarınızı\ntek yerden yönetin.",
    "hero_subtitle": "Meta reklam hesaplarınızı bağlayın. AI optimize etsin, siz büyütün.",
    "hero_cta": "Ücretsiz Dene",
    "hero_cta_secondary": "Demo İzle",
    "hero_trusted_by": "150+ ajans tarafından kullanılıyor",
    "cta_trust": "14 gün ücretsiz · Kredi kartı gerekmez",

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

    "footer_about": "Hakkımızda",
    "footer_privacy": "Gizlilik",
    "footer_terms": "Kullanım Şartları",
    "footer_contact": "İletişim",
    "footer_copyright": "© 2026 MegVax. Tüm hakları saklıdır."
  }
}
```

**Note:** Metric values (`₺2M+`, `150+`, `3.2x`) are hardcoded in the component, not i18n keys — they are numbers, not translatable text.

### Dead keys to clean up

After rewrite, these existing keys become unused and should be removed:
- **`hero.*` namespace entirely** — legacy, all hero content now under `landing.*`
- `landing.testimonial_*` keys (testimonials section removed)
- `landing.result_*` keys (results section removed)
- `landing.feature_scaling_*`, `landing.feature_protection_*`, `landing.feature_realtime_*` (reduced from 6 to 3 features)
- `landing.features_label`, `landing.features_subheading`, `landing.how_it_works_label` (old section chrome)
- `landing.footer_tagline`, `landing.footer_features`, `landing.footer_pricing`, `landing.footer_demo`, `landing.footer_status`, `landing.footer_*_heading` (simplified footer)
- `navigation.about` (about link moved to footer only, nav no longer includes it)

English translations mirror the same structure in `messages/en.json`.

---

## 7. Dashboard Screenshot

The hero requires a real screenshot of the MegVax dashboard. Steps:

1. Run the app locally (`npm run dev`)
2. Navigate to the dashboard with mock data enabled
3. Take a high-quality screenshot (1440px wide, retina/2x)
4. Save as `public/dashboard-preview.png`
5. Optimize with sharp/squoosh to keep under 200KB
6. Reference in Hero component via `next/image`

If no screenshot is available at build time, fall back to the existing coded mockup inside the dark frame. The mockup's internal dark-theme styles (`bg-white/[0.03]`, etc.) work correctly because they sit inside the dark frame container — the frame provides the dark context.

---

## 8. What Does NOT Change

- Backend / API
- Dashboard UI and its dark theme
- Auth pages
- Admin panel
- Lib / hooks / types
- i18n system (just updating message keys)
- Counter component's `Counter` function (theme-agnostic; `StatCard` export is unused by landing)
- ScrollReveal (minor easing update only)

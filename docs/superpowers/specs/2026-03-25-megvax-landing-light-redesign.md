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
Text faint:          #9CA3AF   (gray-400)
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

### Section 2: Hero

Typography-driven with real dashboard screenshot as centerpiece.

- **Background:** Solid `#FAFAF8`. No gradients, no noise, no grid.
- **H1:** "Tüm hesaplarınızı tek yerden yönetin." — Space Grotesk, `clamp(2.5rem, 6vw, 4rem)`, `#1A1A1A`, font-extrabold, leading-[0.95], tracking-[-0.03em], centered
- **Subtext:** "Meta reklam hesaplarınızı bağlayın. AI optimize etsin, siz büyütün." — Inter, 18px, `#6B7280`, max-w-lg, centered, leading-relaxed
- **Primary CTA:** Blue pill, "Ücretsiz Dene →", `px-7 py-3.5`, rounded-xl, ArrowRight icon. Hover: `#1D4ED8` + subtle shadow
- **Secondary CTA:** Text link, "Demo İzle", charcoal, Play icon, no border
- **Trust line:** "14 gün ücretsiz · Kredi kartı gerekmez" — `#9CA3AF`, 13px
- **Dashboard visual:** Real screenshot of MegVax dashboard inside dark browser chrome frame:
  - Frame: `#0C0D14`, rounded-2xl, traffic light dots, address bar with "app.megvax.com/dashboard"
  - Transform: `perspective(2000px) rotateX(2deg)`, origin bottom center
  - Shadow: `0 25px 80px -12px rgba(0,0,0,0.15)` (softer than dark version)
  - Bottom fade: gradient from dashboard bottom into page bg
- **Height:** ~100vh
- **Animations:**
  - H1: `opacity 0→1, y 20→0, 500ms`
  - Subtext: same, +100ms delay
  - CTAs: same, +200ms delay
  - Dashboard: `opacity 0→1, y 40→0, 700ms, +300ms delay`

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
- **Grid:** 3 columns desktop, stack mobile, `gap-4`
- **Spacing:** `py-24`
- **Animations:** Heading fade-up 400ms, cards stagger 100ms delay each

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
- **Connector:** 1px horizontal line in `#E5E7EB` connecting circles
- **Height:** ~250px
- **Spacing:** `py-20`
- **Animation:** Fade-up, single group, 400ms

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

### Section 7: Final CTA

Three lines centered. Maximum whitespace.

- **Background:** `#FAFAF8`
- **Heading:** "Reklamlarınızı otopilote alın." — Space Grotesk, 36px, `#1A1A1A`, font-bold, centered
- **CTA:** Same blue pill as hero
- **Trust line:** "14 gün ücretsiz · Kredi kartı gerekmez" — `#9CA3AF`, 13px
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

### Files to modify

| File | Change |
|------|--------|
| `app/page.tsx` | Update section imports, remove dark bg class |
| `app/globals.css` | Add light theme tokens, keep dashboard dark tokens |
| `components/marketing/landing/Nav.tsx` | Rewrite for light theme |
| `components/marketing/landing/Hero.tsx` | Rewrite for light theme + real screenshot |
| `components/marketing/landing/WhatItDoes.tsx` | Rewrite cards for light theme |
| `components/marketing/landing/HowItWorks.tsx` | Rewrite for light theme |
| `components/marketing/landing/MetricsStrip.tsx` | Rewrite for warm gray bg |
| `components/marketing/landing/FinalCTA.tsx` | Rewrite for light theme |
| `components/marketing/landing/Footer.tsx` | Rewrite for light theme |
| `components/marketing/landing/ScrollReveal.tsx` | Keep as-is (theme-agnostic) |
| `components/marketing/landing/Counter.tsx` | Keep as-is (theme-agnostic) |

### Files to create

| File | Purpose |
|------|---------|
| `components/marketing/landing/SocialProof.tsx` | New social proof strip section |

### No changes to

- Dashboard (`app/app/*`, `components/dashboard/*`)
- Auth pages
- Admin pages
- Backend / lib / types

---

## 6. i18n Keys

New/updated keys under `landing.*` namespace:

```json
{
  "landing": {
    "nav": {
      "product": "Ürün",
      "pricing": "Fiyatlar",
      "contact": "İletişim",
      "login": "Giriş",
      "cta": "Başla"
    },
    "hero_badge": "AI destekli reklam yönetimi",
    "hero_title": "Tüm hesaplarınızı\ntek yerden yönetin.",
    "hero_subtitle": "Meta reklam hesaplarınızı bağlayın. AI optimize etsin, siz büyütün.",
    "hero_cta": "Ücretsiz Dene",
    "hero_cta_secondary": "Demo İzle",
    "hero_trusted_by": "150+ ajans tarafından kullanılıyor",
    "cta_trust": "14 gün ücretsiz · Kredi kartı gerekmez",
    "features_heading": "Ne Yapar?",
    "features_autopilot_title": "Otopilot",
    "features_autopilot_desc": "Düşük ROAS'lu reklamları durdurur, kazananları ölçekler.",
    "features_suggestions_title": "Akıllı Öneriler",
    "features_suggestions_desc": "AI önerileri incele, tek tıkla onayla.",
    "features_dashboard_title": "Tek Panel",
    "features_dashboard_desc": "Tüm hesaplar tek ekranda.",
    "steps_heading": "Nasıl Çalışır?",
    "steps_1_title": "Bağla",
    "steps_1_desc": "Meta hesaplarını bağla.",
    "steps_2_title": "Ayarla",
    "steps_2_desc": "Bütçe limitleri ve hedefleri belirle.",
    "steps_3_title": "Otopilot",
    "steps_3_desc": "Gerisini bize bırak.",
    "metrics_spend_value": "₺2M+",
    "metrics_spend_label": "optimize edilen reklam bütçesi",
    "metrics_accounts_value": "150+",
    "metrics_accounts_label": "yönetilen hesap",
    "metrics_roas_value": "3.2x",
    "metrics_roas_label": "ortalama ROAS",
    "final_cta_heading": "Reklamlarınızı otopilote alın.",
    "final_cta_button": "Ücretsiz Dene",
    "final_cta_trust": "14 gün ücretsiz · Kredi kartı gerekmez",
    "footer_about": "Hakkımızda",
    "footer_privacy": "Gizlilik",
    "footer_terms": "Kullanım Şartları",
    "footer_contact": "İletişim",
    "footer_copyright": "© 2026 MegVax. Tüm hakları saklıdır."
  }
}
```

English translations follow the same structure in `messages/en.json`.

---

## 7. Dashboard Screenshot

The hero requires a real screenshot of the MegVax dashboard. Steps:

1. Run the app locally (`npm run dev`)
2. Navigate to the dashboard with mock data enabled
3. Take a high-quality screenshot (1440px wide, retina/2x)
4. Save as `public/dashboard-preview.png`
5. Optimize with sharp/squoosh to keep under 200KB
6. Reference in Hero component via `next/image`

If no screenshot is available at build time, fall back to the existing coded mockup (adapted to sit inside the dark frame).

---

## 8. What Does NOT Change

- Backend / API
- Dashboard UI and its dark theme
- Auth pages
- Admin panel
- Lib / hooks / types
- i18n system (just updating message keys)
- ScrollReveal / Counter components (theme-agnostic)

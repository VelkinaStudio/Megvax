# SaaS Landing Page Design Brief: Specific CSS & Visual Patterns

**Date:** 2026-03-25
**Scope:** Deep research (8+ searches, 11 site fetches, 6 general searches)
**Purpose:** Actionable design specifications for a premium SaaS landing page (MegVax context)

---

## 1. Typography Scale (Exact Values)

### The Premium Scale

The best SaaS sites (Linear, Stripe, Vercel, Clerk) all use a **tight, deliberate scale** with fluid sizing. Here is the consolidated recommendation:

```css
:root {
  /* Display / Hero */
  --font-display:    clamp(48px, 5vw + 1rem, 80px);   /* Hero headline */
  --font-h1:         clamp(40px, 4vw + 1rem, 64px);    /* Section titles */
  --font-h2:         clamp(32px, 3vw + 0.5rem, 48px);  /* Sub-section titles */
  --font-h3:         clamp(24px, 2vw + 0.5rem, 32px);  /* Feature headings */
  --font-h4:         clamp(20px, 1.5vw + 0.25rem, 24px);
  --font-body-lg:    clamp(18px, 1.2vw, 22px);         /* Hero subtext, intros */
  --font-body:       clamp(16px, 1vw, 18px);            /* Primary body */
  --font-body-sm:    clamp(14px, 0.9vw, 16px);         /* Secondary body */
  --font-caption:    clamp(12px, 0.8vw, 14px);         /* Labels, fine print */

  /* Weight scale */
  --fw-regular:   400;
  --fw-medium:    500;    /* Body emphasis, nav links */
  --fw-semibold:  600;    /* Sub-headings, buttons */
  --fw-bold:      700;    /* Section titles */
  --fw-extrabold: 800;    /* Hero headline only */
}
```

### Line Height & Letter Spacing

```css
/* Headlines: tight line-height, negative letter-spacing */
.hero-headline {
  font-size: var(--font-display);
  font-weight: var(--fw-extrabold);
  line-height: 1.0;                    /* Linear uses 1.0 for display */
  letter-spacing: -0.03em;             /* Negative tracking = premium */
  text-wrap: balance;                  /* Prevents orphans */
}

.section-title {
  font-size: var(--font-h1);
  font-weight: var(--fw-bold);
  line-height: 1.1;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

/* Body: generous line-height, normal tracking */
.body-text {
  font-size: var(--font-body);
  font-weight: var(--fw-regular);
  line-height: 1.6;                    /* 1.5-1.7 range for readability */
  letter-spacing: -0.01em;             /* Subtle tightening */
}

.body-large {
  font-size: var(--font-body-lg);
  font-weight: var(--fw-regular);
  line-height: 1.5;
  letter-spacing: -0.01em;
  color: var(--text-secondary);        /* Subtext is always dimmer */
}
```

### Font Families Used by Top Sites

| Site | Primary Font | Fallbacks | Notes |
|------|-------------|-----------|-------|
| **Linear** | Inter UI | SF Pro Display, system-ui, Segoe UI | + monospace for technical elements |
| **Vercel** | Geist Sans | system-ui | Custom foundry font, geometric sans |
| **Stripe** | sohne-var | system-ui | Variable font, proprietary |
| **Clerk** | Suisse Intl | system-ui | Book/Medium/SemiBold/Bold weights |
| **Raycast** | Custom variable | system-ui | Multiple variable font files |
| **Birch (Revealbot)** | Inter + Poppins | system-ui | Inter body, Poppins headings |
| **Madgicx** | System stack | -webkit-font-smoothing: antialiased | Performance-first |
| **Triple Whale** | Manrope + Space Grotesk | Inter, Inconsolata | Geometric sans + monospace |

**Recommendation:** Use **Inter** (free, excellent) for body + UI, paired with a geometric display font like **Satoshi**, **General Sans**, or **Cabinet Grotesk** for headlines. Maximum 2 families. Load only weights 400, 500, 600, 700.

---

## 2. Spacing System (Exact Values)

### The 8px Grid

Every premium SaaS site operates on an 8px base grid. All spacing is a multiple of 8.

```css
:root {
  --space-1:   4px;     /* Micro gaps (icon-to-label) */
  --space-2:   8px;     /* Tight internal gaps */
  --space-3:   12px;    /* Small component padding */
  --space-4:   16px;    /* Default gap, card padding */
  --space-5:   20px;    /* Between related elements */
  --space-6:   24px;    /* Between components in a group */
  --space-8:   32px;    /* Between groups, card padding-lg */
  --space-10:  40px;    /* Section sub-dividers */
  --space-12:  48px;    /* Between feature blocks */
  --space-16:  64px;    /* Section padding (mobile) */
  --space-20:  80px;    /* Section padding (tablet) */
  --space-24:  96px;    /* Section padding (small desktop) */
  --space-32:  128px;   /* Section padding (desktop) */
  --space-40:  160px;   /* Hero section vertical padding */
}
```

### Section Padding Pattern (What Top Sites Actually Use)

```css
/* Hero section - most breathing room */
.hero {
  padding-top: clamp(80px, 12vh, 160px);
  padding-bottom: clamp(64px, 10vh, 128px);
}

/* Standard content sections */
.section {
  padding-top: clamp(64px, 8vh, 128px);
  padding-bottom: clamp(64px, 8vh, 128px);
}

/* Content container */
.container {
  max-width: 1200px;             /* Clerk: 80rem, Birch: 75rem */
  margin: 0 auto;
  padding-left: clamp(16px, 4vw, 32px);
  padding-right: clamp(16px, 4vw, 32px);
}

/* Narrower container for text-heavy sections */
.container-narrow {
  max-width: 768px;
  margin: 0 auto;
}
```

### Element Spacing

```css
/* Hero internal spacing */
.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;                      /* headline → subtext */
}

.hero-headline + .hero-subtext {
  margin-top: 16px;               /* Tight coupling */
}

.hero-subtext + .hero-cta-group {
  margin-top: 32px;               /* Breathing room before CTA */
}

/* Feature grid */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;                      /* Between feature cards */
}

/* Logo wall */
.logo-wall {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;                      /* Generous spacing = premium */
  padding: 48px 0;
}
```

---

## 3. Color System

### Dark Mode (The Premium Default)

The best SaaS sites (Linear, Raycast, Vercel) default to dark. Here's the pattern:

```css
:root {
  /* Backgrounds - layered depth */
  --bg-primary:     #000000;      /* Page background (pure black or near-black) */
  --bg-secondary:   #0a0a0a;      /* Raycast: #070910 */
  --bg-elevated:    #111111;      /* Cards, elevated surfaces */
  --bg-subtle:      #1a1a1a;      /* Hover states, input backgrounds */
  --bg-border:      #222222;      /* Subtle borders */

  /* Text - 4-tier hierarchy (Linear pattern) */
  --text-primary:    #fafafa;     /* Headlines, primary content */
  --text-secondary:  #a1a1a1;     /* Body text, descriptions */
  --text-tertiary:   #737373;     /* Supporting info, labels */
  --text-quaternary: #525252;     /* Disabled, decorative */

  /* Accent - pick ONE dominant + ONE complementary */
  --accent-primary:  #6366f1;     /* Indigo / violet family */
  --accent-hover:    #818cf8;     /* Lighter on hover */
  --accent-subtle:   rgba(99, 102, 241, 0.15); /* Background tint */

  /* Status colors */
  --success: #22c55e;
  --warning: #eab308;
  --error:   #ef4444;
}
```

### Competitor Color Analysis

| Site | Background | Primary Accent | Vibe |
|------|-----------|---------------|------|
| **Linear** | Near-black | Multi-color (red, green status) | Calm, professional |
| **Raycast** | #070910 | Shader gradient (#ff7a98, #b80232) | Tech-forward |
| **Stripe** | White | #635bff (purple), gradient mesh | Trustworthy |
| **Clerk** | Neutral dark | Purple system | Developer-focused |
| **Madgicx** | Dark | #515FBC, #4d65ff, #917aff (purple family) | Energetic |
| **Triple Whale** | White | #bdfd2e (lime green) | Bold, ecommerce |
| **Birch** | #161616 | #FF21A6 (pink), #FFE241 (yellow), #4450F2 (blue) | Playful |
| **Adzooma** | White | #200E4E (deep purple), #61CE70 (green) | Generic |

### Gradient Techniques

```css
/* Stripe-style mesh gradient (WebGL canvas, not CSS) */
/* CSS fallback approximation: */
.hero-gradient {
  background: radial-gradient(
    ellipse 80% 50% at 50% -20%,
    rgba(99, 102, 241, 0.3) 0%,
    transparent 70%
  );
}

/* Glow behind hero headline */
.hero-glow {
  background: radial-gradient(
    600px circle at 50% 40%,
    rgba(99, 102, 241, 0.15) 0%,
    transparent 70%
  );
}

/* Card border glow (Madgicx pattern) */
.card-glow {
  position: relative;
  border-radius: 16px;
  background: var(--bg-elevated);
}
.card-glow::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: conic-gradient(
    from 0deg,
    #6366f1, #8b5cf6, #a855f7, #6366f1
  );
  z-index: -1;
  animation: spin 3s linear infinite;
}

/* Section divider gradient */
.section-fade {
  background: linear-gradient(
    to bottom,
    var(--bg-primary) 0%,
    var(--bg-secondary) 100%
  );
  height: 120px;
}
```

---

## 4. CTA Button Design (Exact CSS)

### Primary Button

```css
.btn-primary {
  /* Dimensions */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;                      /* 44px minimum for accessibility */
  padding: 0 24px;                   /* Generous horizontal padding */
  min-width: 160px;

  /* Typography */
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.01em;

  /* Colors */
  background: #ffffff;               /* White on dark bg = max contrast */
  color: #000000;
  border: none;
  border-radius: 10px;               /* Modern: 8-12px, not pill-shaped */

  /* Depth */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;

  /* Interaction */
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #e5e5e5;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transform: translateY(-1px);       /* Subtle lift */
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
```

### Secondary Button

```css
.btn-secondary {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
  font-weight: 500;

  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--bg-border);
  border-radius: 10px;

  transition: all 0.2s ease;
}

.btn-secondary:hover {
  color: var(--text-primary);
  border-color: var(--text-tertiary);
  background: var(--bg-subtle);
}
```

### Glowing CTA (Madgicx-inspired)

```css
.btn-glow {
  position: relative;
  height: 52px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background: var(--accent-primary);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}

.btn-glow:hover {
  box-shadow:
    0 0 20px rgba(99, 102, 241, 0.4),
    0 0 40px rgba(99, 102, 241, 0.2);
}

/* Animated border version */
.btn-glow-border {
  position: relative;
  z-index: 1;
}
.btn-glow-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  background: conic-gradient(
    from var(--angle, 0deg),
    var(--accent-primary),
    #a855f7,
    #ec4899,
    var(--accent-primary)
  );
  z-index: -1;
  animation: rotate-border 3s linear infinite;
}
@keyframes rotate-border {
  to { --angle: 360deg; }
}
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
```

---

## 5. Visual Elements & Background Effects

### Hero Background Patterns

```css
/* Dot grid pattern (Linear-inspired) */
.dot-grid {
  background-image: radial-gradient(
    circle at 1px 1px,
    var(--text-quaternary) 1px,
    transparent 0
  );
  background-size: 32px 32px;
  opacity: 0.3;
}

/* Noise texture overlay */
.noise-overlay {
  position: fixed;
  inset: 0;
  background: url('/noise.svg');
  opacity: 0.03;
  pointer-events: none;
  z-index: 9999;
}

/* Gradient orb (behind hero) */
.gradient-orb {
  position: absolute;
  width: 800px;
  height: 800px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.25) 0%,
    rgba(139, 92, 246, 0.1) 40%,
    transparent 70%
  );
  filter: blur(80px);
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}
```

### Frosted Glass / Glassmorphism

```css
/* Navigation bar (Vercel, Triple Whale) */
.navbar-glass {
  position: fixed;
  top: 0;
  width: 100%;
  height: 64px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 100;
}

/* Glass card */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
}
```

### Stripe Gradient Animation (WebGL approach)

```css
/* Container for WebGL canvas */
#gradient-canvas {
  width: 100%;
  height: 100%;
  --gradient-color-1: #6ec3f4;
  --gradient-color-2: #3a3aff;
  --gradient-color-3: #ff61ab;
  --gradient-color-4: #E63946;
}

/* Text over gradient with blend mode */
.hero-text-blended {
  mix-blend-mode: color-burn;
  color: #3a3a3a;
}
.hero-text-overlay {
  opacity: 0.2;
  color: #3a3a3a;
}
```

---

## 6. Scroll Animations & Micro-Interactions

### Fade-In-Up (Universal pattern, every top site uses this)

```css
/* Pure CSS version */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered children */
.reveal-stagger > *:nth-child(1) { transition-delay: 0ms; }
.reveal-stagger > *:nth-child(2) { transition-delay: 100ms; }
.reveal-stagger > *:nth-child(3) { transition-delay: 200ms; }
.reveal-stagger > *:nth-child(4) { transition-delay: 300ms; }
```

### Framer Motion (React/Next.js)

```tsx
// Fade-in-up on scroll (the gold standard for React SaaS)
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const staggerContainer = {
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};

// Usage
<motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
>
  <motion.h2 variants={fadeInUp}>Section Title</motion.h2>
  <motion.p variants={fadeInUp}>Description text</motion.p>
  <motion.div variants={fadeInUp}>
    <Button>Get Started</Button>
  </motion.div>
</motion.div>
```

### Hover Micro-Interactions

```css
/* Card hover lift (universal premium pattern) */
.feature-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid var(--bg-border);
  border-radius: 16px;
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Link hover underline animation */
.animated-link {
  position: relative;
  text-decoration: none;
}
.animated-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1.5px;
  background: var(--accent-primary);
  transition: width 0.3s ease;
}
.animated-link:hover::after {
  width: 100%;
}

/* Button arrow slide */
.btn-with-arrow .arrow {
  transition: transform 0.2s ease;
}
.btn-with-arrow:hover .arrow {
  transform: translateX(4px);
}
```

---

## 7. Social Proof Patterns

### Logo Wall (below hero)

```css
.trust-bar {
  padding: 48px 0;
  border-top: 1px solid var(--bg-border);
  border-bottom: 1px solid var(--bg-border);
}

.trust-bar__label {
  font-size: var(--font-caption);
  font-weight: var(--fw-medium);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  margin-bottom: 32px;
}

.trust-bar__logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}

.trust-bar__logos img {
  height: 24px;                    /* Uniform height, not width */
  opacity: 0.5;                    /* Dimmed = non-competing */
  filter: grayscale(100%);         /* Grayscale = non-competing */
  transition: opacity 0.2s ease;
}

.trust-bar__logos img:hover {
  opacity: 0.8;
}
```

### Scrolling Marquee (Triple Whale, modern approach)

```css
.marquee {
  overflow: hidden;
  white-space: nowrap;
}
.marquee__inner {
  display: flex;
  gap: 48px;
  animation: marquee-scroll 30s linear infinite;
}
@keyframes marquee-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

### Testimonial Cards

```css
.testimonial-card {
  background: var(--bg-elevated);
  border: 1px solid var(--bg-border);
  border-radius: 16px;
  padding: 32px;
}

.testimonial-card__quote {
  font-size: var(--font-body-lg);
  font-weight: var(--fw-regular);
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.testimonial-card__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.testimonial-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.testimonial-card__name {
  font-size: var(--font-body-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.testimonial-card__role {
  font-size: var(--font-caption);
  color: var(--text-tertiary);
}
```

### Metrics Bar

```css
.metrics-bar {
  display: flex;
  justify-content: center;
  gap: 64px;
  padding: 64px 0;
}

.metric {
  text-align: center;
}

.metric__number {
  font-size: var(--font-h1);
  font-weight: var(--fw-extrabold);
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--accent-primary), #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric__label {
  font-size: var(--font-body-sm);
  color: var(--text-tertiary);
  margin-top: 8px;
}
```

---

## 8. Section Transitions

### How Top Sites Flow Between Sections

**Linear:** Sections share the same dark background. Transition is purely through spacing (128px padding) and subtle opacity changes. No dividers.

**Stripe:** Background color shifts (white to dark, dark to white) with generous padding. Occasionally uses wave SVG dividers.

**Vercel:** Dark throughout. Sections separated by 1px border lines (`rgba(255,255,255,0.05)`) or gradient fades.

**Clerk:** Uses radial gradient masks that fade content toward edges, creating a natural vignette between sections.

```css
/* Gradient separator (premium) */
.section-separator {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--bg-border) 20%,
    var(--bg-border) 80%,
    transparent 100%
  );
  max-width: 1200px;
  margin: 0 auto;
}

/* Background shift transition */
.section--dark {
  background: #000;
}
.section--elevated {
  background: #0a0a0a;
}
/* The shift itself provides visual separation */

/* Fade mask (Clerk pattern) */
.section-with-mask {
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
}
```

---

## 9. Navigation Bar

```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;

  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  z-index: 100;
  transition: background 0.3s ease;
}

/* Scrolled state (add via JS on scroll > 20px) */
.nav--scrolled {
  background: rgba(0, 0, 0, 0.85);
}

.nav__logo {
  height: 24px;
}

.nav__links {
  display: flex;
  gap: 32px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.nav__links a:hover {
  color: var(--text-primary);
}

.nav__cta {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  background: #ffffff;
  color: #000000;
  border-radius: 8px;
  border: none;
}
```

---

## 10. What Separates Premium from Generic

### Scoring Matrix (from analyzing all 11 sites)

| Signal | Generic (Adzooma) | Premium (Linear/Stripe) |
|--------|-------------------|------------------------|
| **Hero font size** | 32-40px | 56-80px |
| **Letter-spacing** | 0 (default) | -0.02em to -0.04em (negative) |
| **Line-height on headlines** | 1.3-1.5 | 1.0-1.1 |
| **Section padding** | 40-60px | 96-160px |
| **Logo opacity** | 100% (full color) | 40-60% + grayscale |
| **CTA count per viewport** | 3-7 (scattered) | 1-2 (focused) |
| **Color palette** | 5+ colors, no system | 2-3 colors, strict system |
| **Font families loaded** | 1 (system or single Google font) | 1-2 (curated, variable) |
| **Background** | Flat white | Layered (gradients, noise, blur) |
| **Card borders** | 1px solid gray | 1px rgba + hover glow |
| **Transitions** | None or 0.3s ease | 0.2s ease with transforms |
| **Text hierarchy tiers** | 2 (heading + body) | 4 (primary, secondary, tertiary, quaternary) |
| **Body text color** | Pure black (#000) | Soft (#a1a1a1 on dark, #525252 on light) |
| **Whitespace** | Tight, content-packed | 60%+ of page is empty space |

### The 7 Non-Negotiable Premium Signals

1. **Negative letter-spacing on headlines** (-0.02em to -0.04em). Every premium site does this. Generic sites use default tracking.

2. **4-tier text color hierarchy.** Not bold vs. normal. Instead: primary (#fafafa), secondary (#a1a1a1), tertiary (#737373), quaternary (#525252). This is how Linear makes dense data feel calm.

3. **Section padding >= 96px on desktop.** Adzooma uses 40-60px. Linear/Stripe use 120-160px. The whitespace IS the design.

4. **Grayscale, low-opacity logo walls.** Full-color logos scream desperation. Dimmed grayscale logos (opacity: 0.4-0.5, filter: grayscale(100%)) say "these brands trust us, but we don't need to shout."

5. **One accent color, used surgically.** Not splashed everywhere. Used only for: primary CTA, active states, one gradient glow. Everything else is neutral.

6. **Layered backgrounds** -- not flat. A gradient orb behind the hero, a dot-grid pattern at 3% opacity, a noise texture at 2% -- these layers create depth that flat white/black cannot.

7. **Deliberate motion, not decoration.** Fade-in-up on scroll (24px translateY, 0.6s duration, staggered 100ms). Card hover lift (4px translateY). Button arrow slide (4px translateX). All purposeful, all subtle, all consistent.

---

## 11. Responsive Breakpoints

The consolidated breakpoint system from top sites:

```css
/* Mobile first */
/* sm */  @media (min-width: 640px)  { }
/* md */  @media (min-width: 768px)  { }
/* lg */  @media (min-width: 1024px) { }
/* xl */  @media (min-width: 1280px) { }
/* 2xl */ @media (min-width: 1536px) { }

/* Common patterns */
/* - Hero headline: 48px (mobile) → 64px (md) → 80px (xl) */
/* - Section padding: 64px (mobile) → 96px (md) → 128px (xl) */
/* - Feature grid: 1 col (mobile) → 2 col (md) → 3 col (lg) */
/* - Container max-width: 100% → 1200px (xl) */
/* - Nav: hamburger (mobile) → full links (lg) */
```

---

## 12. Implementation Priority for MegVax

If applying these patterns to MegVax's landing page, execute in this order:

1. **Typography overhaul** -- Install Inter + display font, apply the full scale with negative letter-spacing and 4-tier text color system
2. **Spacing expansion** -- Double all section padding. Add 128px vertical padding on desktop sections. This single change has the biggest visual impact.
3. **Dark mode as default** -- #000 background, layered with gradient orb + subtle dot grid
4. **Hero redesign** -- 72-80px headline, tight line-height (1.0), centered, with a single metric ("$X in managed ad spend") and one primary CTA
5. **CTA refinement** -- One style, 48px height, 10px border-radius, white-on-dark, subtle shadow + hover lift
6. **Social proof** -- Grayscale logo bar below hero, metrics bar (3 numbers), 3 testimonial cards with real photos
7. **Scroll animations** -- Framer Motion fade-in-up on every section, staggered children, `viewport={{ once: true }}`
8. **Glass nav** -- Fixed, 64px, backdrop-blur, border-bottom rgba

---

## Sources

### General Research
- [Best Landing Page Designs 2026](https://www.thethunderclap.com/blog/best-landing-page-designs)
- [SaaS Landing Page Trends 2026](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples)
- [Emerging Web Design Trends for SaaS 2026](https://enviznlabs.com/blogs/7-emerging-web-design-trends-for-saas-in-2026-ai-layouts-glow-effects-and-beyond)
- [Web Design Spacing Best Practices](https://www.conceptfusion.co.uk/post/web-design-spacing-and-sizing-best-practices)
- [Font Size Guidelines for Responsive Websites](https://www.learnui.design/blog/mobile-desktop-website-font-size-guidelines.html)
- [4-Point Spacing System](https://uxplanet.org/principles-of-spacing-in-ui-design-a-beginners-guide-to-the-4-point-spacing-system-6e88233b527a)
- [Whitespace Boosts Conversions](https://unbounce.com/landing-page-design/white-space/)

### Site Analyses
- [Linear.app](https://linear.app) -- fetched and analyzed
- [Stripe.com](https://stripe.com) -- fetched and analyzed
- [Vercel.com](https://vercel.com) -- fetched and analyzed
- [Clerk.com](https://clerk.com) -- fetched and analyzed
- [Raycast.com](https://raycast.com) -- fetched and analyzed
- [Madgicx.com](https://madgicx.com) -- fetched and analyzed
- [Birch (formerly Revealbot)](https://bir.ch) -- fetched and analyzed
- [Adzooma.com](https://adzooma.com) -- fetched and analyzed
- [Triple Whale](https://www.triplewhale.com) -- fetched and analyzed
- [Supermetrics.com](https://supermetrics.com) -- fetched and analyzed

### Technical References
- [Stripe Gradient Effect CSS](https://kevinhufnagl.com/how-to-stripe-website-gradient-effect/)
- [CSS Glowing Effects 2026](https://www.testmuai.com/blog/glowing-effects-in-css/)
- [CTA Design Best Practices](https://magicui.design/blog/cta-design)
- [Linear Design Trend Analysis](https://blog.logrocket.com/ux-design/linear-design/)
- [Linear Brand Guidelines](https://linear.app/brand)
- [Fluid Typography with clamp()](https://css-tricks.com/linearly-scale-font-size-with-css-clamp-based-on-the-viewport/)
- [Social Proof Examples](https://socialproofexamples.com/)
- [Framer Motion Scroll Animations](https://motion.dev/docs/react-scroll-animations)

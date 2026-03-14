# Font Pairings Reference

## MEGVAX Active Fonts

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Headings | Space Grotesk | 600-700 | Page titles, card headers |
| Body | Inter | 400-500 | Paragraphs, descriptions |
| Code/Data | JetBrains Mono | 400 | IDs, metrics, code blocks |

## Recommended SaaS Pairings

### Modern Geometric
- **Heading**: Space Grotesk / Plus Jakarta Sans / Outfit
- **Body**: Inter / DM Sans / Nunito Sans
- **Feel**: Clean, tech-forward, trustworthy

### Editorial Premium
- **Heading**: Playfair Display / Fraunces / Lora
- **Body**: Source Sans 3 / Libre Franklin
- **Feel**: Sophisticated, content-rich

### Brutalist/Bold
- **Heading**: Archivo Black / Bebas Neue / Anton
- **Body**: Space Grotesk / Work Sans
- **Feel**: Impactful, attention-grabbing (marketing pages)

### Humanist Warm
- **Heading**: Poppins / Quicksand / Comfortaa
- **Body**: Nunito / Open Sans
- **Feel**: Friendly, approachable

## Typography Scale (Dashboard)

```
text-xs:   12px / 16px — Labels, timestamps, badges
text-sm:   14px / 20px — Secondary text, descriptions
text-base: 16px / 24px — Body text, form inputs
text-lg:   18px / 28px — Section headers
text-xl:   20px / 28px — Card titles
text-2xl:  24px / 32px — Page titles
text-3xl:  30px / 36px — Hero metrics (KPI values)
```

## Font Loading (Next.js)

Fonts are loaded via `next/font/google` in `app/layout.tsx`. Never use `@import` in CSS — it blocks rendering.

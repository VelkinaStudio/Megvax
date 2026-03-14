# Design Styles Reference

## Styles Applicable to MEGVAX

### 1. Clean Minimal (Dashboard — Active)
- Flat cards, no shadows, subtle borders
- Generous whitespace, clear hierarchy
- Blue-600 primary, gray-50 background
- Best for: Data-heavy interfaces, professional SaaS

### 2. Dark Premium (Marketing — Planned)
- Dark backgrounds (gray-900+), gradient accents
- Glass morphism cards, blur effects
- Animated reveals on scroll
- Best for: Landing pages, product showcases

### 3. Brutalist Bold
- High contrast, thick borders, raw typography
- Archivo Black / Bebas Neue headings
- Vivid yellow or red accents on black
- Best for: Attention-grabbing hero sections

### 4. Editorial Magazine
- Asymmetric layouts, large typography
- Image-text overlap, pull quotes
- Serif headings, generous line height
- Best for: About pages, storytelling sections

### 5. Glassmorphism
- Frosted glass cards: `backdrop-blur-xl bg-white/10`
- Subtle borders: `border border-white/20`
- Gradient backgrounds behind glass
- Best for: Pricing cards, feature highlights

### 6. Neomorphism (Soft UI)
- Soft shadows: `shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]`
- Same-color bg and elements, depth via shadows
- Best for: Toggle switches, sliders, subtle controls

## Anti-Patterns to Avoid

- **Purple gradient on white** — Overused AI aesthetic
- **Inter + gray everything** — Generic, forgettable
- **Too many gradients** — Pick one gradient direction per section
- **Inconsistent radius** — Stick to one border-radius scale
- **Shadow soup** — Either flat (dashboard) or intentional depth (marketing), never random

---
name: ui-ux-pro-max
description: Comprehensive design guide for web and mobile applications. Contains 67 styles, 96 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 13 technology stacks. Searchable database with priority-based recommendations. Use when making design decisions, choosing colors, fonts, layouts, or improving UX.
---

# UI/UX Pro Max

A comprehensive design reference system. For detailed data, see the reference files below.

## Quick Decision Guide

### Need a color palette?
→ See [references/color-palettes.md](references/color-palettes.md)

### Need font pairings?
→ See [references/font-pairings.md](references/font-pairings.md)

### Need UX guidelines?
→ See [references/ux-guidelines.md](references/ux-guidelines.md)

### Need chart/data viz guidance?
→ See [references/chart-types.md](references/chart-types.md)

### Need design style inspiration?
→ See [references/design-styles.md](references/design-styles.md)

## MEGVAX-Specific Defaults

For the MEGVAX dashboard, these are the established choices:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Style | Clean Minimal | Professional SaaS dashboard |
| Primary Color | Blue-600 (#2563EB) | Trust, reliability, Meta brand alignment |
| Body Font | Inter | Excellent readability at small sizes |
| Heading Font | Space Grotesk | Modern, geometric, distinctive |
| Code Font | JetBrains Mono | Monospace for IDs and metrics |
| Chart Library | Recharts (planned) | React-native, composable |
| Icons | Lucide React | Consistent, tree-shakeable |

For the MEGVAX marketing pages:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Style | Dark Premium | Impressive, high-end feel |
| Background | Gray-900+ | Dark mode, gradient accents |
| Accents | Blue/Purple/Cyan gradients | Eye-catching, modern |
| Motion | Framer Motion + GSAP | Scroll animations, micro-interactions |
| Layout | Asymmetric, overlapping | Editorial, memorable |

## Core UX Principles for SaaS Dashboards

1. **Information hierarchy** — Most important metrics first, progressive disclosure for details
2. **Consistent patterns** — Same action = same UI pattern everywhere
3. **Feedback loops** — Every action gets immediate visual feedback (toast, optimistic update)
4. **Undo over confirm** — Prefer undo-able actions over confirmation dialogs (except destructive)
5. **Empty states guide** — Empty states should educate and provide next action
6. **Loading is content** — Skeletons match the shape of real content
7. **Error recovery** — Errors suggest what to do next, never dead-ends

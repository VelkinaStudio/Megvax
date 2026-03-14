# UX Guidelines Reference

## Dashboard UX (Priority 1)

### Data Display
1. **KPI cards** — Max 4-6 per row, show trend arrow + percentage change
2. **Tables** — Sortable columns, sticky headers, row hover highlight
3. **Charts** — Tooltip on hover, responsive, meaningful axis labels
4. **Numbers** — Format with locale: `₺45,230` not `45230`, `%3.17` not `0.0317`

### Navigation
5. **Sidebar** — Active state clearly highlighted, collapsible on mobile
6. **Breadcrumbs** — Not needed for flat dashboard (sidebar handles hierarchy)
7. **Deep links** — Support URL params for entity focus (`?focusLevel=adset&focusId=as_1`)

### Forms & Inputs
8. **Inline validation** — Show errors as user types, not on submit
9. **Auto-save** — For settings, save on change with debounce
10. **Select defaults** — Always pre-select the most common option
11. **Search** — Debounce 300ms, show "no results" state

### Feedback
12. **Toast notifications** — Success (green), Error (red), Info (blue), Warning (amber)
13. **Optimistic updates** — Update UI immediately, revert on API failure
14. **Undo pattern** — Toast with undo button (6s timeout) for reversible actions
15. **Loading** — Skeleton matching content shape, never spinners for page loads

### Modals & Dialogs
16. **Confirm destructive** — Always confirm delete/pause/stop with `ConfirmModal`
17. **Modal size** — `sm` for confirms, `md` for forms, `lg` for complex settings
18. **Close on backdrop** — Always allow closing by clicking outside
19. **Reset on open** — Modal state resets every time it opens (useEffect on isOpen)

### Empty States
20. **Educate** — Explain what will appear here
21. **Guide** — Provide a CTA to the next action
22. **Icon** — Use a relevant Lucide icon, muted color

## Marketing UX (Priority 3)

### Hero Section
23. **Above the fold** — Value prop + CTA visible without scrolling
24. **Single CTA** — One primary action, one secondary max
25. **Social proof** — Stats or logos near the CTA

### Scroll Experience
26. **Progressive reveal** — Content appears as user scrolls (Framer Motion)
27. **Sticky nav** — Marketing nav sticks on scroll with blur backdrop
28. **Section rhythm** — Alternate content density: dense → spacious → dense

### Conversion
29. **Pricing clarity** — Show price, period, and what's included at a glance
30. **Trust signals** — Security badges, testimonials, "no credit card required"

## Mobile Responsiveness

31. **Sidebar** — Collapses to hamburger menu below `md` breakpoint
32. **Tables** — Horizontal scroll or card view on mobile
33. **Touch targets** — Minimum 44x44px for all interactive elements
34. **Stack layout** — Grid columns collapse to single column on mobile

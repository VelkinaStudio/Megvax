---
name: component-patterns
description: UI component standards for MEGVAX. Use when creating new components, modifying existing UI primitives, or ensuring design consistency. Covers the design system, component API patterns, and accessibility requirements.
---

# Component Patterns

## Design System — Dashboard

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `blue-600` (#2563EB) | Buttons, active states, links |
| Primary hover | `blue-700` | Button hover |
| Background | `gray-50`, `white` | Page bg, card bg |
| Text primary | `gray-900` | Headings, body |
| Text secondary | `gray-600` | Descriptions |
| Text muted | `gray-500` | Labels, timestamps |
| Success | `green-600` | Active badges, positive metrics |
| Warning | `amber-600` | Waiting states |
| Danger | `red-600` | Errors, destructive actions |
| Border | `gray-200` | Card borders, dividers |
| Radius | `rounded-lg` (8px) | Cards, modals |
| Radius small | `rounded-md` (6px) | Buttons, badges |

## CSS Utility Classes

- `minimal-card` — Flat card with border, no shadow (dashboard)
- `minimal-button` — Flat button with subtle hover
- `neo-card` — Marketing: glass effect, gradient borders
- `neo-button` — Marketing: bold, dark bg

## Component API Pattern

```tsx
interface ButtonProps {
  variant: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}
```

## Available UI Primitives (`components/ui/`)

| Component | File | Usage |
|-----------|------|-------|
| `Button` | Button.tsx | All clickable actions |
| `Card` | Card.tsx | Content containers |
| `Modal` | Modal.tsx | Dialogs, forms |
| `ConfirmModal` | ConfirmModal.tsx | Destructive action confirmation |
| `Switch` | Switch.tsx | Toggle (passes `boolean` to onChange) |
| `Select` | Select.tsx | Dropdowns |
| `Badge` | Badge.tsx | Status indicators |
| `StatusBadge` | StatusBadge.tsx | Entity status (active/paused) |
| `Skeleton` | Skeleton.tsx | Loading placeholders |
| `Sparkline` | Sparkline.tsx | Mini charts |
| `Toast` | Toast.tsx | Notifications via `useToast()` |
| `Tooltip` | Tooltip.tsx | Hover info |
| `TreeTable` | TreeTable.tsx | Hierarchical data (campaigns) |
| `SlideOver` | SplitPane.tsx | Side panel details |

## Dashboard Shared Components (`components/dashboard/`)

| Component | Usage |
|-----------|-------|
| `PageHeader` | Page title + description + action buttons |
| `EmptyStateCard` | No-data state with icon + CTA |
| `PlatformContext` | Meta/Google platform switcher |
| `useDashboardQuery` | URL param management (account, range) |

## Accessibility Requirements

- All interactive elements: `aria-label` or visible label
- Focus states: `focus:ring-2 focus:ring-blue-500/20`
- Color contrast: WCAG AA minimum
- Keyboard navigation: all actions reachable via Tab + Enter
- Destructive actions: always require `ConfirmModal`

## Switch Component Gotcha

The `Switch` component's `onChange` passes a **boolean**, not an event:

```tsx
// ✅ Correct
<Switch checked={value} onChange={(checked) => setValue(checked)} />

// ❌ Wrong — will cause TypeScript error
<Switch checked={value} onChange={(e) => setValue(e.target.checked)} />
```

## Creating New Components

1. Place in `components/ui/` for primitives, `components/dashboard/` for dashboard-specific
2. Export from `components/ui/index.ts` barrel file
3. Use TypeScript strict — no `any` without justification
4. Support `className` prop for composition
5. Use `forwardRef` for form elements

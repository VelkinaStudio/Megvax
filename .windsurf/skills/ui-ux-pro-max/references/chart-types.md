# Chart Types Reference

## Recommended for Ad Dashboard

| Chart | Use Case | Library |
|-------|----------|---------|
| **Line** | Time series: spend, ROAS, CTR over time | Recharts / Sparkline |
| **Bar** | Comparisons: campaign spend, conversions | Recharts |
| **Sparkline** | Inline mini-trends in table cells/KPI cards | `components/ui/Sparkline.tsx` |
| **Donut** | Budget allocation, audience breakdown | Recharts |
| **Stacked Bar** | Breakdown by dimension (age, gender, device) | Recharts |
| **Heatmap** | Day/hour performance patterns | Custom CSS grid |

## Chart Design Rules

1. **Max 5 data series** per chart — more becomes unreadable
2. **Color sequence**: blue-600 → green-500 → amber-500 → red-500 → purple-500
3. **Always show tooltip** on hover with formatted values
4. **Y-axis** — Start at 0 for bar charts, auto-scale for line charts
5. **Responsive** — Charts must resize with container
6. **Empty state** — Show placeholder with "No data for this period"
7. **Currency format** — Use `₺` prefix, thousands separator: `₺45,230`
8. **Percentage format** — Use `%` prefix: `%3.17`

## Sparkline Component

Already built at `components/ui/Sparkline.tsx`. Usage:

```tsx
<Sparkline data={[50, 60, 45, 80, 70]} color="blue" height={32} />
```

Supports: `blue`, `green`, `red`, `amber` color variants.

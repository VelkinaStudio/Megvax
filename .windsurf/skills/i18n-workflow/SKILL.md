---
name: i18n-workflow
description: Handle internationalization for MEGVAX. Use when adding text to components, creating new pages, or fixing translation issues. Covers the useTranslations hook, message file structure, and bilingual (EN/TR) requirements.
---

# i18n Workflow

## Golden Rule

**NEVER hardcode text in components.** All user-facing strings must go through `useTranslations()`.

## Usage

```tsx
import { useTranslations } from '@/lib/i18n';

function MyComponent() {
  const t = useTranslations('my_namespace');
  const tc = useTranslations('common');
  return <h1>{t('title')}</h1>;
}
```

## File Locations

- `messages/en.json` — English translations
- `messages/tr.json` — Turkish translations
- `lib/i18n.tsx` — Provider, hooks, locale detection

## Adding New Keys

**Always add to BOTH files simultaneously.** Structure:

```json
{
  "namespace": {
    "key": "Value",
    "nested_key": "Nested value"
  }
}
```

## Namespace Convention

| Namespace | Usage |
|-----------|-------|
| `navigation` | Sidebar, header nav items + `_desc` keys |
| `common` | Shared: `save`, `cancel`, `undo`, `all`, `selected`, `level_campaign`, `level_adset`, `level_ad` |
| `dashboard` | Dashboard overview page |
| `campaigns` | Campaigns page |
| `optimizations` | Optimizations page |
| `insights` | Insights/analytics page |
| `accounts` | Connected accounts page |
| `finance` | Finance/billing page |
| `support` | Support tickets page |
| `settings` | Settings page |
| `empty_states` | Empty state messages across pages |
| `hero`, `features`, `pricing` | Marketing pages |

## Common Patterns

### Multiple namespaces in one component
```tsx
const t = useTranslations('optimizations');
const tc = useTranslations('common');
// t('title') → optimizations-specific
// tc('save') → shared across app
```

### Interpolation (not yet supported — use template literals)
```tsx
<p>{`${count} ${t('active_rules')}`}</p>
```

## Checklist Before Committing

- [ ] Key exists in `messages/en.json`
- [ ] Key exists in `messages/tr.json`
- [ ] No hardcoded Turkish or English text in `.tsx` files
- [ ] Navigation `_desc` keys added for any new sidebar items

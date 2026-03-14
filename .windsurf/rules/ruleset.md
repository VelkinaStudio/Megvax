---
trigger: always_on
---

# MEGVAX — Quick Reference

All rules are in `megvax-project.md`. This file is a cheat sheet.

## Priorities
1. User Dashboard (`/app/*`) — perfect, production-ready
2. Admin Dashboard (`/admin/*`) — functional, secondary
3. Marketing pages — last, Dribbble-tier when ready

## Colors
- **Dashboard:** blue-600 primary, blue-700 hover, gray-50 bg
- **Marketing:** dark bg (gray-900), gradient accents (blue/purple/cyan allowed)

## i18n — Always
- `useTranslations()` from `@/lib/i18n`
- Both `messages/en.json` + `messages/tr.json`

## Key Paths
- Layout: `components/layouts/` (Sidebar, AppShell, Header)
- UI primitives: `components/ui/`
- Dashboard pages: `app/app/*/page.tsx`
- Mock data: `components/dashboard/mockData.ts` + `lib/data/`

## Skills (invoke via `skill` tool)
- `dashboard-development` — page structure, data fetching, state patterns
- `i18n-workflow` — translations, namespace conventions
- `component-patterns` — UI primitives, design tokens, accessibility
- `ui-ux-pro-max` — colors, fonts, UX guidelines, chart types (has reference files)

## Session Discipline
- Track tasks in `TASKS.md` → delete when done
- Never create session summary or progress MD files
- Test from browser, fix bugs proactively

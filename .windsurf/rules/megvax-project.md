---
trigger: always_on
---

# MEGVAX — Workspace Rules

## What Is This Project
MEGVAX is a **Meta Ads management SaaS** — a production business application for agencies, freelancers, and SMBs to manage Meta ad campaigns with AI-powered optimizations and automations.

**Stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript 5
**Animation:** Framer Motion + GSAP | **Icons:** Lucide React | **Testing:** Playwright + Vitest

## Project Priorities (in order)
1. **User Dashboard** (`/app/*`) — Must be perfect. Easy to use, covers all use-cases, production-ready with mock data
2. **Admin Dashboard** (`/admin/*`) — Secondary. Read-only finance/user visibility for product owners
3. **Marketing/Landing** (`/`, `/about`, `/pricing`, `/book`) — Last priority. Will be polished when product is ready. Target: Dribbble-tier, visually stunning, fast

## Current Phase
Frontend-complete with mock data → preparing for backend handoff to associate developer.
Backend dev will handle: real API integration, auth, Stripe, Meta API connections.

---

## Architecture

```
app/
├── (landing)/          # Marketing pages (lowest priority)
├── admin/              # Admin panel (secondary)
├── app/                # USER DASHBOARD (primary focus)
│   ├── dashboard/      # Overview with KPIs
│   ├── campaigns/      # Campaign/AdSet/Ad management (TreeTable)
│   ├── optimizations/  # AI optimization strategies + execution history
│   ├── insights/       # Analytics
│   ├── accounts/       # Connected Meta accounts
│   ├── finance/        # Billing + ad spend
│   ├── settings/       # User preferences
│   └── support/        # Support tickets
components/
├── ui/                 # Reusable primitives (Button, Card, Modal, etc.)
├── dashboard/          # Dashboard-specific components
├── marketing/          # Marketing page components
├── layouts/            # AppShell, Sidebar, Header — MAIN LAYOUT FILES
└── admin/              # Admin components
lib/
├── hooks/              # Custom React hooks
├── i18n.tsx            # Translation system (useTranslations hook)
├── security.ts         # Input sanitization, XSS prevention
├── validation.ts       # Zod schemas
├── format.ts           # Currency, date, percentage formatters
└── data/               # Mock data for development
messages/
├── en.json             # English translations
└── tr.json             # Turkish translations
```

---

## Design System

### Dashboard (Primary Focus)
- **Style:** Clean, minimal, professional — optimized for usability not aesthetics
- **Colors:** Blue primary (`#2563EB` / blue-600), hover: blue-700
- **Cards:** `minimal-card` class — flat, border-2, no shadow
- **Buttons:** `minimal-button` class — flat, subtle hover
- **Radius:** Sharp (0-4px)
- **Background:** Light (`gray-50`, `white`)

### Marketing/Landing (Future Polish)
- **Style:** Dark, premium, animated — Dribbble-tier visual impact
- **Colors:** Dark backgrounds (`gray-900`), gradient accents (blue/purple/cyan)
- **Cards:** Glass effects, gradient borders
- **Motion:** Framer Motion + GSAP for scroll animations
- **Goal:** Impress visitors, explain the product, convert to signup

### Shared Tokens (globals.css)
- `--color-brand-black: #0A0A0F` | `--color-brand-white: #FAFBFC`
- `--color-accent-primary: #2563EB` (dashboard primary)
- `--color-accent-success: #16A34A` | `--color-accent-warning: #D97706` | `--color-accent-danger: #DC2626`
- Font: Space Grotesk (headings), Inter (body), JetBrains Mono (code)

---

## Mandatory Rules

### i18n
- **NEVER hardcode Turkish or English text** in components
- Use `useTranslations()` from `@/lib/i18n`
- Add keys to BOTH `messages/en.json` AND `messages/tr.json`

### Code Quality
- TypeScript strict — no `any` without justification
- WCAG AA accessibility on all interactive elements
- Reuse `@/components/ui/` before creating new components
- Handle loading, error, and empty states for every data-dependent view
- Destructive actions require confirmation dialog

### Before Editing
1. Read existing code first
2. Verify which file is actually used (e.g., `layouts/Sidebar.tsx` not `dashboard/Sidebar.tsx`)
3. Check i18n keys exist in both language files
4. Test changes work — use browser preview when possible

---

## Skills (`.windsurf/skills/`)

Specialized knowledge modules — invoke via the `skill` tool when working on specific areas:

| Skill | When to Use |
|-------|-------------|
| `dashboard-development` | Creating/modifying dashboard pages, adding features |
| `i18n-workflow` | Adding text, translations, fixing i18n issues |
| `component-patterns` | Creating UI components, design system questions |
| `ui-ux-pro-max` | Design decisions, colors, fonts, UX improvements (has reference files) |

---

## AI Session Management

### Task Tracking
- When starting multi-step work, create `TASKS.md` in project root
- Update it as you complete steps
- **Delete `TASKS.md` when all tasks are done** — do not leave stale tracking files
- Never create session summary MD files — they clutter the project

### What NOT to Create
- No session logs, progress trackers, or summary MD files
- No duplicate documentation — if info exists in HANDOFF.md, don't repeat it
- No placeholder/TODO implementations — finish what you start

### AI Responsibilities
- Deliver production-quality visuals and UX
- Architect business workflows and identify missing features
- Test from browser (use browser_preview tool)
- Fix issues proactively — if you see a bug while working, fix it
- Take initiative on improvements — don't wait to be asked for obvious fixes

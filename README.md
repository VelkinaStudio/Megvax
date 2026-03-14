# MEGVAX

**Meta Ads management SaaS** — manage campaigns, optimize with AI, automate workflows.

Built for agencies, freelancers, and SMBs.

## Stack

Next.js 16 · React 19 · Tailwind CSS 4 · TypeScript 5 · Framer Motion · GSAP · Playwright · Vitest

## Quick Start

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run storybook` | Component docs (port 6006) |

## Pages (41 total)

| Area | Routes | Description |
|------|--------|-------------|
| **Dashboard** | `/app/dashboard`, `campaigns`, `optimizations`, `all-ads`, `insights`, `accounts`, `finance`, `support`, `settings`, `smart-suggestions`, `ai-creative` | Full user dashboard with mock data |
| **Admin** | `/admin/overview`, `users`, `analytics`, `subscriptions`, `invoices`, `messages`, `settings`, `audit` | Admin panel (requires admin login) |
| **Marketing** | `/`, `/about`, `/pricing`, `/book`, `/contact` | Landing, pricing, booking, contact |
| **Legal** | `/privacy`, `/terms`, `/cookies` | Full bilingual legal content |
| **Utility** | `/status` | System status page |
| **Auth** | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`, `/admin-login` | Authentication flows |
| **SEO** | `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` | Auto-generated SEO files |

## Structure

```
app/
├── app/              # User dashboard (primary)
├── admin/            # Admin panel (secondary)
├── (landing)/        # Marketing pages
├── [legal pages]     # Privacy, terms, cookies
└── [auth pages]      # Login, signup, forgot-password, etc.

components/
├── ui/               # Reusable primitives
├── dashboard/        # Dashboard-specific
├── marketing/        # Marketing pages
├── layouts/          # AppShell, Sidebar, Header
└── admin/            # Admin components

lib/                  # Hooks, i18n, validation, security, formatters
messages/             # i18n (en.json, tr.json)
e2e/                  # Playwright E2E tests (11 spec files)
```

## Docs

| File | Purpose |
|------|---------|
| `HANDOFF.md` | Backend developer handoff |
| `docs/API_CONTRACT.md` | Full API endpoint specification |
| `.env.example` | All environment variables documented |

## Environment

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true            # Mock mode (current)
NEXT_PUBLIC_API_URL=http://localhost:4000  # Backend URL
NEXT_PUBLIC_BASE_URL=https://megvax.com   # SEO base URL
```

# MEGVAX — Backend Handoff

> **Date:** February 6, 2026
> **Status:** Frontend complete with mock data — ready for backend integration
> **Frontend:** Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript 5

---

## What You're Getting

A fully built frontend for a **Meta Ads management SaaS** with:
- **User Dashboard** (`/app/*`) — Campaign/AdSet/Ad management, AI optimizations, automations, analytics
- **Admin Panel** (`/admin/*`) — Read-only Stripe-based finance visibility
- **Marketing Pages** (`/`, `/about`, `/pricing`, `/book`, `/contact`) — Landing, pricing, booking, contact
- **Legal Pages** (`/privacy`, `/terms`, `/cookies`) — Full bilingual legal content
- **Utility Pages** (`/status`) — System status page
- **Auth Pages** — Login, signup, forgot-password, reset-password, verify-email
- **SEO Infrastructure** — `robots.ts`, `sitemap.ts`, `manifest.ts`, OG meta tags

Everything runs on mock data. Your job: replace mock data with real API calls.

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npm run test:e2e   # Playwright E2E tests
```

**Environment:**
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true          # Current mode
NEXT_PUBLIC_API_URL=http://localhost:4000  # Your backend URL
```

---

## What Backend Needs to Implement

Full API contract is in `docs/API_CONTRACT.md`. Summary:

| Area | Endpoints | Priority |
|------|-----------|----------|
| **Auth** | Login, register, password reset, email verify | P0 |
| **Meta Accounts** | Connect, list, sync | P0 |
| **Campaigns/AdSets/Ads** | CRUD, status toggle, duplicate, bulk | P0 |
| **Overview KPIs** | Metrics, suggestions | P1 |
| **Optimizations** | Strategy list, toggle, settings | P1 |
| **Automations** | Rule CRUD, preview, execute, history | P1 |
| **Insights** | Single + aggregate analytics, breakdowns | P1 |
| **Finance** | Stripe billing, invoices, ad spend | P2 |
| **Admin** | Stripe overview, users, subscriptions | P2 |

### Mock Data Locations (replace these)
- `components/dashboard/mockData.ts` — Campaigns, AdSets, Ads, KPIs
- `lib/data/` — Additional mock data

### Recommended Data Fetching
```tsx
// Add SWR or React Query — frontend is ready for async patterns
const { data, isLoading, error } = useSWR('/api/campaigns', fetcher);
```

---

## Known Issues — Fixed (Feb 6, 2026)

The following were fixed in this session:
- ✅ `Sparkline.tsx` — `Math.random()` replaced with `useId()`
- ✅ `Tooltip.tsx` — `any` type cast replaced with `Record<string, unknown>`
- ✅ `useMediaQuery.ts` — SSR-safe state initializer, proper effect deps
- ✅ `i18n.tsx` — Locale initialized from localStorage in state initializer (no more hydration flash)
- ✅ `i18n.tsx` — `any` type cast replaced with proper `Messages` type
- ✅ `Select.tsx` — Unused `ReactNode` import removed
- ✅ `middleware.ts` — Reads locale from cookie instead of hardcoded `'tr'`
- ✅ `layout.tsx` — English metadata, Inter font for body (was duplicate Space Grotesk)
- ✅ `globals.css` — Removed 4 render-blocking Google Font `@import` statements
- ✅ `settings/page.tsx` — Fixed 6 Switch `onChange` type errors (was using `e.target.checked` on boolean)
- ✅ `automations/page.tsx` — Created missing page (was 404)
- ✅ Sidebar — Added automations navigation link
- ✅ i18n — Added missing `_desc` keys for all navigation items (both EN + TR)

### Remaining ESLint
Run `npm run lint` for current list. Most remaining issues are Storybook import paths and minor warnings.

---

## Security Requirements (Backend Side)

Frontend has client-side sanitization (`lib/security.ts`). Backend must add:
- Server-side validation (mirror Zod schemas in `lib/validation/`)
- CSRF token verification on state-changing endpoints
- Rate limiting on API endpoints
- File malware scanning for uploads
- Security headers: CSP, HSTS, X-Frame-Options

---

## Architecture Notes

- **i18n:** Client-side with `useTranslations()` hook. TR + EN. Should move to cookie-based SSR detection.
- **Layout:** `components/layouts/` has the main AppShell, Sidebar, Header — these are the active layout files.
- **Design:** Dashboard uses `minimal-*` classes (flat, professional). Marketing uses dark premium styles with animations.
- **Auth:** No real auth yet — all pages are accessible. Add cookie/session-based auth with route protection.

---

*This is the only handoff document. See `docs/API_CONTRACT.md` for detailed endpoint specs.*

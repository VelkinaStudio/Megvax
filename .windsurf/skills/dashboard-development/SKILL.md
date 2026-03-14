---
name: dashboard-development
description: Build and maintain MEGVAX user dashboard pages. Use when creating new dashboard pages, adding features to existing pages, or fixing dashboard bugs. Covers page structure, data fetching, state management, and UX patterns specific to the /app/* routes.
---

# Dashboard Development

## Page Structure Pattern

Every dashboard page follows this structure:

```tsx
'use client';

import { useTranslations } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Button, Card, Skeleton } from '@/components/ui';
import { EmptyStateCard, PageHeader } from '@/components/dashboard';
import { useDashboardQuery } from '@/components/dashboard/useDashboardQuery';

export default function MyPage() {
  const t = useTranslations('my_page');
  const tc = useTranslations('common');
  const toast = useToast();
  const { account, range, from, to, withQuery } = useDashboardQuery();
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_API_URL;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pattern: mock first, real API when available
  useEffect(() => {
    if (useMockData) {
      setData(mockData);
      setIsLoading(false);
      return;
    }
    // Real API fetch here
  }, [useMockData, account, range, from, to]);

  return (
    <div className="space-y-8">
      <PageHeader title={t('title')} description={t('description')} actions={...} />
      {isLoading ? <LoadingSkeleton /> : <Content />}
    </div>
  );
}
```

## Required for Every Page

1. **i18n** — All text via `useTranslations()`, keys in both `messages/en.json` and `messages/tr.json`
2. **Loading state** — Skeleton UI while data loads
3. **Error state** — Informational card when API fails, fallback to mock data
4. **Empty state** — `EmptyStateCard` when no data exists
5. **Mock data** — Page must work with `NEXT_PUBLIC_USE_MOCK_DATA=true`

## State Management

- **Local state** for page-specific data (`useState`)
- **`useDashboardQuery()`** for account/range filters from URL params
- **Optimistic updates** with undo via toast actions
- **`useToast()`** for all user feedback

## Optimistic Update Pattern

```tsx
const handleToggle = (id: string, newState: boolean) => {
  const prev = items;
  setItems(current => current.map(i => i.id === id ? { ...i, status: newState } : i));
  toast.success(t('updated'), {
    duration: 6000,
    action: { label: tc('undo'), onClick: () => setItems(prev) },
  });
};
```

## Navigation Between Pages

Use `withQuery()` to preserve account/range when linking between dashboard pages:

```tsx
const link = withQuery('/app/campaigns');
// Produces: /app/campaigns?account=act_123&range=7d
```

## Key Files

- **Pages**: `app/app/*/page.tsx`
- **Mock data**: `components/dashboard/mockData.ts`
- **Shared components**: `components/dashboard/` (PageHeader, EmptyStateCard, etc.)
- **UI primitives**: `components/ui/` (Button, Card, Modal, etc.)
- **Types**: `types/dashboard.ts`
- **Layout**: `components/layouts/Sidebar.tsx` (navigation items)

## Adding a New Page Checklist

1. Create `app/app/[name]/page.tsx` with the pattern above
2. Create `app/app/[name]/loading.tsx` with skeleton
3. Add navigation item to `components/layouts/Sidebar.tsx`
4. Add i18n keys to both `messages/en.json` and `messages/tr.json`
5. Add types to `types/dashboard.ts` if needed
6. Add mock data to `components/dashboard/mockData.ts`

# MegVax Frontend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing Next.js 16 frontend to the real NestJS backend API — replace all mock data, implement real auth, connect dashboard/campaigns/insights/accounts/settings pages.

**Architecture:** The frontend at `D:/MegvaxV4-main/` uses Next.js 16 App Router with `'use client'` pages. The backend runs at `http://localhost:4000` (NestJS on `megvax-api/`). Pages already have a `useMockData` fallback pattern — we'll build a proper auth context + API hooks layer, then update each page to use real endpoints. Refresh tokens are httpOnly cookies (handled by backend), access tokens stored in memory (React state).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, existing `lib/api.ts` fetch wrapper

**Spec:** `D:/MegvaxV4-main/docs/superpowers/specs/2026-03-23-megvax-platform-design.md`

**Backend API base:** `http://localhost:4000` — endpoints: `/auth/*`, `/workspaces/*`, `/meta/*`, `/campaigns`, `/adsets`, `/ads`, `/insights/*`, `/notifications/*`, `/health`

---

## File Structure

```
D:/MegvaxV4-main/
├── lib/
│   ├── api.ts                          # Modify: add token injection, refresh logic
│   ├── auth-context.tsx                # Create: AuthProvider, useAuth hook
│   ├── auth-guard.tsx                  # Create: route protection component
│   └── hooks/
│       ├── use-api.ts                  # Create: generic useApi data-fetching hook
│       └── use-notifications.ts        # Create: SSE notification hook
├── types/
│   └── dashboard.ts                    # Modify: align types with backend response shapes
├── app/
│   ├── layout.tsx                      # Modify: wrap with AuthProvider
│   ├── login/page.tsx                  # Modify: real API login
│   ├── signup/page.tsx                 # Modify: real API register
│   ├── forgot-password/page.tsx        # Modify: real API forgot-password
│   ├── reset-password/page.tsx         # Modify: real API reset-password
│   ├── verify-email/page.tsx           # Modify: real API verify-email
│   └── app/
│       ├── layout.tsx                  # Modify: wrap with AuthGuard
│       ├── dashboard/page.tsx          # Modify: real API calls
│       ├── campaigns/page.tsx          # Modify: real API calls
│       ├── accounts/page.tsx           # Modify: real API + Meta OAuth
│       ├── insights/page.tsx           # Modify: real API calls
│       └── settings/page.tsx           # Modify: real API profile/password
```

---

## Task 1: Upgrade API Client + Auth Context

**Files:**
- Modify: `lib/api.ts`
- Create: `lib/auth-context.tsx`
- Create: `lib/auth-guard.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/app/layout.tsx`

- [ ] **Step 1: Upgrade `lib/api.ts` with token management and refresh logic**

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
  skipAuth?: boolean;
}

// In-memory token storage (not localStorage — avoids XSS risk)
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token, skipAuth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const authToken = token || accessToken;
  if (authToken && !skipAuth) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // send httpOnly refresh_token cookie
  });

  // Handle 401 — try refresh
  if (res.status === 401 && !skipAuth && !path.includes('/auth/refresh')) {
    const refreshed = await tryRefreshOnce();
    if (refreshed) {
      // Retry original request with new token
      return api<T>(path, { ...options, token: accessToken! });
    }
    // Refresh failed — clear auth
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'));
    }
    throw new ApiError(401, 'UNAUTHORIZED', 'Session expired');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { code: 'ERROR', message: 'Request failed' } }));
    throw new ApiError(res.status, error.error?.code || 'ERROR', error.error?.message || `HTTP ${res.status}`);
  }

  // Handle 204 No Content
  if (res.status === 204) return {} as T;

  return res.json();
}

// Mutex: prevent concurrent refresh token rotations (backend deletes old token on use)
let refreshPromise: Promise<boolean> | null = null;

function tryRefreshOnce(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Create `lib/auth-context.tsx`**

```tsx
// lib/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, setAccessToken, getAccessToken, ApiError } from './api';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
  locale: string;
  emailVerified: boolean;
  isAdmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const user = await api<User>('/auth/me');
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  // On mount, try to restore session via refresh token cookie
  useEffect(() => {
    const tryRestore = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/refresh`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          setState({ user: data.user, isLoading: false, isAuthenticated: true });
        } else {
          setState(s => ({ ...s, isLoading: false }));
        }
      } catch {
        setState(s => ({ ...s, isLoading: false }));
      }
    };
    tryRestore();
  }, []);

  // Listen for forced logout (from 401 in api.ts)
  useEffect(() => {
    const handler = () => {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    });
    setAccessToken(data.accessToken);
    setState({ user: data.user, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const data = await api<{ accessToken: string; user: User }>('/auth/register', {
      method: 'POST',
      body: { email, password, fullName },
      skipAuth: true,
    });
    setAccessToken(data.accessToken);
    setState({ user: data.user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Logout should always succeed client-side
    }
    setAccessToken(null);
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 3: Create `lib/auth-guard.tsx`**

```tsx
// lib/auth-guard.tsx
'use client';

import { useAuth } from './auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
```

- [ ] **Step 4: Wrap root layout with AuthProvider**

Modify `app/layout.tsx` — add `<AuthProvider>` inside the existing provider tree. Read the file first to find the exact location.

The AuthProvider should wrap everything inside the `<body>` tag but outside any other providers that don't depend on auth.

```tsx
import { AuthProvider } from '@/lib/auth-context';

// In the return, wrap children:
<AuthProvider>
  {/* existing providers and children */}
</AuthProvider>
```

- [ ] **Step 5: Wrap `/app/` layout with AuthGuard**

Modify `app/app/layout.tsx`:

```tsx
import { AuthGuard } from '@/lib/auth-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
        <DashboardShell>{children}</DashboardShell>
      </Suspense>
    </AuthGuard>
  );
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd /d/MegvaxV4-main && npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
cd /d/MegvaxV4-main
git add lib/api.ts lib/auth-context.tsx lib/auth-guard.tsx app/layout.tsx app/app/layout.tsx
git commit -m "feat: add auth context, token refresh, route protection"
```

---

## Task 2: Wire Auth Pages (Login, Signup, Forgot/Reset Password, Verify Email)

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `app/signup/page.tsx`
- Modify: `app/forgot-password/page.tsx`
- Modify: `app/reset-password/page.tsx`
- Modify: `app/verify-email/page.tsx`

- [ ] **Step 1: Wire login page to real API**

In `app/login/page.tsx`, replace the `handleSubmit` function:

```tsx
// Add at top:
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

// Inside the component, add:
const { login, isAuthenticated } = useAuth();

// Replace handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    await login(formData.email, formData.password);
    toast.success(tc('success') + '!');
    router.push('/app/dashboard');
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else {
      toast.error(t('invalid_credentials'));
    }
  } finally {
    setIsLoading(false);
  }
};
```

Remove the mock credential check (`if (formData.email === 'demo@megvax.com'...`).
Remove the `handleGoogleLogin` mock (keep the button but show a "coming soon" toast).
Remove the `// Simulate API call` setTimeout.

Also add a redirect effect if already authenticated:
```tsx
useEffect(() => {
  if (isAuthenticated) router.replace('/app/dashboard');
}, [isAuthenticated, router]);
```

- [ ] **Step 2: Wire signup page to real API**

In `app/signup/page.tsx`, replace `handleSubmit`:

```tsx
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

const { register, isAuthenticated } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.terms) {
    toast.error(t('accept_terms'));
    return;
  }
  setIsLoading(true);

  try {
    await register(formData.email, formData.password, formData.name);
    toast.success(t('signup_success'));
    router.push('/app/dashboard');
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else {
      toast.error(t('signup_error') || 'Registration failed');
    }
  } finally {
    setIsLoading(false);
  }
};
```

Remove the mock `setTimeout`. Add isAuthenticated redirect.

- [ ] **Step 3: Wire forgot-password page**

In `app/forgot-password/page.tsx`, replace `handleSubmit`:

```tsx
import { api, ApiError } from '@/lib/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    await api('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      skipAuth: true,
    });
    toast.success(t('reset_link_sent'));
    setIsSubmitted(true);
  } catch (error) {
    // Backend always returns success to prevent email enumeration,
    // so any error here is a network issue
    toast.error(t('network_error') || 'Something went wrong');
  } finally {
    setIsLoading(false);
  }
};
```

- [ ] **Step 4: Wire reset-password page**

In `app/reset-password/page.tsx`, replace the submit handler:

```tsx
import { api, ApiError } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const token = searchParams.get('token');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!token) {
    toast.error('Invalid reset link');
    return;
  }
  setIsLoading(true);

  try {
    await api('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword: password },
      skipAuth: true,
    });
    toast.success(t('password_reset_success'));
    router.push('/login');
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else {
      toast.error('Failed to reset password');
    }
  } finally {
    setIsLoading(false);
  }
};
```

- [ ] **Step 5: Wire verify-email page**

In `app/verify-email/page.tsx`, call the API on mount:

```tsx
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const token = searchParams.get('token');

useEffect(() => {
  if (!token) return;
  const verify = async () => {
    try {
      await api('/auth/verify-email', {
        method: 'POST',
        body: { token },
        skipAuth: true,
      });
      setIsVerified(true);
    } catch {
      setError('Invalid or expired verification link');
    }
  };
  verify();
}, [token]);
```

- [ ] **Step 6: Commit**

```bash
cd /d/MegvaxV4-main
git add app/login/page.tsx app/signup/page.tsx app/forgot-password/page.tsx app/reset-password/page.tsx app/verify-email/page.tsx
git commit -m "feat: wire auth pages to real API — login, signup, password reset, email verification"
```

---

## Task 3: Wire Dashboard Page to Real API

**Files:**
- Modify: `app/app/dashboard/page.tsx`

- [ ] **Step 1: Replace inline fetch calls with `api()` + auth token**

The dashboard page at `app/app/dashboard/page.tsx` currently has 3 `useEffect` blocks that do raw `fetch()` calls to `/api/overview`, `/api/overview/suggestions`, and `/api/meta/campaigns`.

Replace all three to use the `api()` function from `lib/api.ts` and point to the correct backend endpoints:

```tsx
import { api } from '@/lib/api';

// Replace fetchOverview:
useEffect(() => {
  const fetchOverview = async () => {
    setIsMetricsLoading(true);
    setMetricsError(null);

    if (useMockData) {
      setMetrics(mockKpiMetrics);
      setIsMetricsLoading(false);
      return;
    }

    try {
      const data = await api<{ data: any }>(`/insights/account-summary?accountId=${encodeURIComponent(account)}${
        from && to ? `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` : ''
      }`);

      // Transform backend aggregate into KPI format
      // Note: Prisma Decimal types serialize as strings in JSON — must coerce with Number()
      const agg = data.data;
      const spend = Number(agg._sum?.spend || 0);
      const roas = Number(agg._avg?.roas || 0);
      const conversions = Number(agg._sum?.conversions || 0);
      const ctr = Number(agg._avg?.ctr || 0);
      const kpis: KpiMetric[] = [
        { id: 'spend', label: 'Toplam Harcama', value: `₺${spend.toLocaleString('tr-TR')}`, trend: '', status: 'neutral', description: 'Toplam reklam harcaması' },
        { id: 'roas', label: 'ROAS', value: `${roas.toFixed(2)}x`, trend: '', status: roas >= 2 ? 'up' : 'down', description: 'Reklam getiri oranı' },
        { id: 'conversions', label: 'Dönüşüm', value: String(conversions), trend: '', status: 'neutral', description: 'Toplam dönüşüm' },
        { id: 'ctr', label: 'CTR', value: `${ctr.toFixed(2)}%`, trend: '', status: 'neutral', description: 'Tıklanma oranı' },
      ];
      setMetrics(kpis);
    } catch (error) {
      console.error('Failed to fetch metrics', error);
      setMetrics(mockKpiMetrics);
      setMetricsError(tc('live_data_unavailable'));
    } finally {
      setIsMetricsLoading(false);
    }
  };

  fetchOverview();
}, [useMockData, account, range, from, to]);

// Replace fetchTopCampaigns:
useEffect(() => {
  const fetchTopCampaigns = async () => {
    setIsTopCampaignsLoading(true);
    setTopCampaignsError(null);

    if (useMockData) {
      setTopCampaigns(mockMetaCampaigns.slice(0, 5));
      setIsTopCampaignsLoading(false);
      return;
    }

    try {
      const data = await api<{ data: any[] }>(`/campaigns?accountId=${encodeURIComponent(account)}&limit=5`);
      // Note: c.dailyBudget is the campaign budget (Prisma Decimal → string in JSON),
      // not actual spend. Actual spend comes from insights (Phase 2 autopilot dashboard).
      // For now, show budget as the displayed value with "Bütçe" label.
      const mapped: Campaign[] = (data.data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        status: c.status?.toLowerCase() || 'paused',
        spend: `₺${Number(c.dailyBudget || 0).toLocaleString('tr-TR')}`,
        roas: '—',
        conversions: 0,
      }));
      setTopCampaigns(mapped);
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
      setTopCampaigns(mockMetaCampaigns.slice(0, 5));
      setTopCampaignsError(tc('live_data_unavailable'));
    } finally {
      setIsTopCampaignsLoading(false);
    }
  };

  fetchTopCampaigns();
}, [useMockData, account, range, from, to]);
```

For suggestions, keep mock data for now — the autopilot/suggestions engine is Phase 2.

- [ ] **Step 2: Commit**

```bash
cd /d/MegvaxV4-main
git add app/app/dashboard/page.tsx
git commit -m "feat: wire dashboard to real insights + campaigns API endpoints"
```

---

## Task 4: Wire Accounts Page + Meta OAuth Flow

**Files:**
- Modify: `app/app/accounts/page.tsx`
- Modify: `components/dashboard/accounts/ConnectAccountModal.tsx`

- [ ] **Step 1: Wire accounts page to real API**

In `app/app/accounts/page.tsx`, replace the mock data fetch with real API.

**Important:** The accounts page displays **ad accounts** (the `AdAccount` entity), NOT Meta connections. `GET /meta/connections` returns OAuth connections (per Meta user), while `GET /meta/ad-accounts` returns available ad accounts from Meta API. For the accounts page, we need to show already-connected ad accounts from our database. Use the campaigns controller's underlying Prisma query via a new approach: fetch connections with their ad accounts included.

```tsx
import { api } from '@/lib/api';

// Replace fetchAccounts:
useEffect(() => {
  const fetchAccounts = async () => {
    setIsAccountsLoading(true);
    setAccountsError(null);

    if (useMockData) {
      setAccounts(demoAccounts);
      setIsAccountsLoading(false);
      return;
    }

    try {
      // Fetch connections (each has _count.adAccounts) + fetch ad-accounts list
      // GET /meta/connections returns OAuth connections
      // GET /meta/ad-accounts returns available Meta ad accounts (with alreadyConnected flag)
      const adAccounts = await api<any[]>('/meta/ad-accounts');

      // Filter to only show already-connected accounts
      const connected = (adAccounts || []).filter((a: any) => a.alreadyConnected);
      const mapped: MetaAccount[] = connected.map((a: any) => ({
        id: a.metaAccountId,
        name: a.name || `act_${a.metaAccountId}`,
        accountId: `act_${a.metaAccountId}`,
        status: 'connected',
        lastSync: '—', // Sync status not available from this endpoint
        currency: a.currency,
        timezone: a.timezone,
      }));
      setAccounts(mapped);
    } catch (error) {
      console.error('Failed to fetch accounts', error);
      setAccounts(demoAccounts);
      setAccountsError('Hesaplar yüklenemedi');
    } finally {
      setIsAccountsLoading(false);
    }
  };

  fetchAccounts();
}, [useMockData]);
```

- [ ] **Step 2: Wire ConnectAccountModal to trigger Meta OAuth**

Read and modify `components/dashboard/accounts/ConnectAccountModal.tsx`:

When the user clicks "Connect Meta Account", call the backend to get the OAuth URL and redirect.

**Note:** `GET /meta/auth-url` requires `ADMIN` role. Non-admin users will receive 403. Handle this with an explicit error message.

```tsx
import { api, ApiError } from '@/lib/api';

const handleConnectMeta = async () => {
  setIsLoading(true);
  try {
    const data = await api<{ url: string }>('/meta/auth-url');
    window.location.href = data.url; // Redirect to Facebook OAuth
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      toast.error('Yalnızca yöneticiler Meta hesabı bağlayabilir');
    } else {
      toast.error('Meta bağlantısı başlatılamadı');
    }
  } finally {
    setIsLoading(false);
  }
};
```

- [ ] **Step 3: Commit**

```bash
cd /d/MegvaxV4-main
git add app/app/accounts/page.tsx components/dashboard/accounts/ConnectAccountModal.tsx
git commit -m "feat: wire accounts page to real API, add Meta OAuth redirect flow"
```

---

## Task 5: Wire Campaigns Page to Real API

**Files:**
- Modify: `app/app/campaigns/page.tsx`

- [ ] **Step 1: Replace mock campaigns with real API data**

The campaigns page has inline mock data (`const mockCampaigns: CampaignNode[] = [...]`). Replace with API-fetched data:

```tsx
import { api } from '@/lib/api';

// Add state:
const [isLoading, setIsLoading] = useState(true);
const [campaigns, setCampaigns] = useState<CampaignNode[]>([]);

// Add useEffect to fetch tree data:
useEffect(() => {
  const fetchTree = async () => {
    setIsLoading(true);
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_API_URL;

    if (useMockData) {
      setCampaigns(mockCampaigns);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch campaigns for active account (respect account selector if present)
      // The accountId should come from useDashboardQuery() or a similar account selector hook
      const accountParam = accountId ? `&accountId=${encodeURIComponent(accountId)}` : '';
      const data = await api<{ data: any[]; cursor: string | null; hasMore: boolean }>(`/campaigns?limit=100${accountParam}`);
      const mapped: CampaignNode[] = (data.data || []).map((c: any) => ({
        id: c.id,
        type: 'campaign' as const,
        name: c.name,
        status: c.status?.toLowerCase() || 'paused',
        spend: c.dailyBudget ? `₺${Number(c.dailyBudget).toLocaleString('tr-TR')}` : '₺0',
        roas: '—',
        conversions: 0,
        children: [], // AdSets loaded on expand
      }));
      setCampaigns(mapped);
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
      setCampaigns(mockCampaigns);
    } finally {
      setIsLoading(false);
    }
  };

  fetchTree();
}, []);
```

Replace references to the hardcoded `mockCampaigns` constant with the `campaigns` state variable throughout the component.

- [ ] **Step 2: Commit**

```bash
cd /d/MegvaxV4-main
git add app/app/campaigns/page.tsx
git commit -m "feat: wire campaigns page to real API with fallback to mock data"
```

---

## Task 6: Wire Insights Page to Real API

**Files:**
- Modify: `app/app/insights/page.tsx`

- [ ] **Step 1: Replace mock insights with real API**

Read the current insights page. Replace its data fetching to use the real `/insights` endpoint:

```tsx
import { api } from '@/lib/api';

// In the data-fetching effect, replace the mock path:
try {
  const data = await api<{ data: any[] }>(`/insights?accountId=${encodeURIComponent(accountId)}${
    entityType ? `&entityType=${entityType}` : ''
  }${entityId ? `&entityId=${entityId}` : ''}${
    from ? `&from=${from}` : ''
  }${to ? `&to=${to}` : ''}`);

  // Transform InsightSnapshot[] into the format the component expects
  // ...
} catch (error) {
  // fallback to mock
}
```

The exact transformation depends on the component's expected data shape (`InsightsSingleResponse`). Read the mock data in `components/dashboard/insights/mock.ts` to understand the shape and map from `InsightSnapshot[]`.

- [ ] **Step 2: Commit**

```bash
cd /d/MegvaxV4-main
git add app/app/insights/page.tsx
git commit -m "feat: wire insights page to real API with mock fallback"
```

---

## Task 7: Wire Settings Page (Profile + Password)

**Files:**
- Modify: `app/app/settings/page.tsx`

- [ ] **Step 1: Load profile from API and wire save actions**

```tsx
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const { user, refreshUser } = useAuth();

// Initialize profile from auth user:
useEffect(() => {
  if (user) {
    setProfile(prev => ({
      ...prev,
      fullName: user.fullName || prev.fullName,
      email: user.email || prev.email,
    }));
  }
}, [user]);

// Wire save profile:
// Also sync the i18n locale with the backend-persisted locale
const handleSaveProfile = async () => {
  setIsSaving(true);
  try {
    await api('/auth/me', {
      method: 'PATCH',
      body: { fullName: profile.fullName, locale },
    });
    await refreshUser();
    // Sync i18n context with saved locale (if useSetLocale is available)
    if (typeof setLocale === 'function') setLocale(locale);
    toast.success(ts('profile_saved') || 'Profile saved');
  } catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'Failed to save');
  } finally {
    setIsSaving(false);
  }
};

// Wire change password:
const handleChangePassword = async () => {
  if (passwords.new !== passwords.confirm) {
    toast.error(ts('passwords_no_match') || 'Passwords do not match');
    return;
  }
  setIsSaving(true);
  try {
    await api('/auth/change-password', {
      method: 'POST',
      body: { currentPassword: passwords.current, newPassword: passwords.new },
    });
    toast.success(ts('password_changed') || 'Password changed');
    setPasswords({ current: '', new: '', confirm: '' });
  } catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'Failed to change password');
  } finally {
    setIsSaving(false);
  }
};
```

- [ ] **Step 2: Commit**

```bash
cd /d/MegvaxV4-main
git add app/app/settings/page.tsx
git commit -m "feat: wire settings page to real API — profile update + password change"
```

---

## Task 8: Add SSE Notifications Hook + Wire Header Bell

**Files:**
- Create: `lib/hooks/use-notifications.ts`
- Modify: `components/layouts/Header.tsx` (or `components/dashboard/TopBar.tsx`)

- [ ] **Step 1: Create SSE notification hook**

```typescript
// lib/hooks/use-notifications.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, getAccessToken } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: any;
  readAt: string | null;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch existing notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api<{ data: Notification[]; hasMore: boolean }>('/notifications?limit=20');
      setNotifications(data.data || []);
      setUnreadCount((data.data || []).filter((n) => !n.readAt).length);
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, []);

  // Track current token to reconnect SSE when it changes
  const [sseToken, setSseToken] = useState<string | null>(getAccessToken());

  // Listen for token changes (after refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getAccessToken();
      if (current !== sseToken) setSseToken(current);
    }, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, [sseToken]);

  // Connect to SSE stream — reconnects when sseToken changes
  useEffect(() => {
    if (!sseToken) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const es = new EventSource(`${baseUrl}/notifications/stream?token=${encodeURIComponent(sseToken)}`);
    eventSourceRef.current = es;

    es.addEventListener('notification', (event) => {
      const notification = JSON.parse(event.data) as Notification;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    es.onerror = () => {
      // Browser EventSource auto-reconnects, but with the same (possibly expired) token.
      // The sseToken polling above will detect a new token and recreate this effect.
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [sseToken]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api('/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {}
  }, []);

  return { notifications, unreadCount, markRead, markAllRead, refetch: fetchNotifications };
}
```

- [ ] **Step 2: Wire notification bell in header/topbar**

Read the Header or TopBar component. Add a notification bell icon with `unreadCount` badge. Import and use `useNotifications`:

```tsx
import { useNotifications } from '@/lib/hooks/use-notifications';

const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

// In the header JSX, add notification bell:
<button className="relative p-2">
  <Bell className="w-5 h-5 text-gray-600" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</button>
```

- [ ] **Step 3: Commit**

```bash
cd /d/MegvaxV4-main
git add lib/hooks/use-notifications.ts components/layouts/Header.tsx
git commit -m "feat: add real-time SSE notifications with bell indicator in header"
```

---

## Task 9: Wire Sidebar Logout + Workspace Name

**Files:**
- Modify: `components/layouts/Sidebar.tsx`

- [ ] **Step 1: Wire logout and display workspace info**

Read the sidebar component. Replace the mock logout with real auth.

**Important:** The existing `handleLogout` clears `localStorage.removeItem('auth_token')` and `sessionStorage.clear()`. Remove these lines — the new auth stores tokens in memory (React state), not localStorage. Leaving dead localStorage code would confuse future developers.

```tsx
import { useAuth } from '@/lib/auth-context';

const { user, logout } = useAuth();

// Replace the logout click handler (remove old localStorage/sessionStorage cleanup):
const handleLogout = async () => {
  await logout();
  router.push('/login');
};

// Replace static "Demo User" with user.fullName:
<span className="text-sm font-medium text-gray-900">{user?.fullName || 'User'}</span>
<span className="text-xs text-gray-500">{user?.email || ''}</span>
```

- [ ] **Step 2: Commit**

```bash
cd /d/MegvaxV4-main
git add components/layouts/Sidebar.tsx
git commit -m "feat: wire sidebar logout + display real user info from auth context"
```

---

## Task 10: Final Verification + Cleanup

**Files:**
- Verify: All modified files compile

- [ ] **Step 1: TypeScript check**

```bash
cd /d/MegvaxV4-main && npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 2: Remove stale mock-only patterns**

Search for remaining `// Simulate API call` and `setTimeout(resolve, ...)` patterns in auth pages. Remove them if they were replaced with real API calls.

- [ ] **Step 3: Audit remaining mock-only pages**

The following pages are NOT wired in this plan (they need Phase 2 backend endpoints). Verify they still work safely with mock data and don't attempt real API calls:

- `app/app/optimizations/page.tsx` — has `useMockData` toggle and raw fetches. Ensure it defaults to mock when `NEXT_PUBLIC_API_URL` is set.
- `app/app/smart-suggestions/page.tsx` — uses `setTimeout` simulated calls. OK as-is.
- `app/app/all-ads/page.tsx` — uses inline mock data directly. OK as-is.
- `app/app/support/page.tsx` — uses `setTimeout` simulated calls. OK as-is.

If `optimizations/page.tsx` would attempt raw `fetch()` to nonexistent `/api/...` endpoints when `useMockData` is false, add the same `useMockData` fallback pattern used elsewhere.

- [ ] **Step 4: Verify mock fallback still works**

Ensure `NEXT_PUBLIC_USE_MOCK_DATA=true` still makes dashboard/campaigns/accounts pages work with mock data (for development without backend).

- [ ] **Step 5: Commit**

```bash
cd /d/MegvaxV4-main
git diff --name-only  # Review changed files first
git add -u  # Stage only modified tracked files (not untracked)
git commit -m "chore: cleanup mock remnants, fix type errors from frontend integration"
```

---

## Summary

| Task | What It Delivers |
|------|-----------------|
| 1 | Auth context, token refresh, route protection |
| 2 | Real login, signup, password reset, email verification |
| 3 | Dashboard wired to insights + campaigns endpoints |
| 4 | Accounts page + Meta OAuth redirect flow |
| 5 | Campaigns page fetching real data |
| 6 | Insights page fetching real data |
| 7 | Settings page with real profile/password endpoints |
| 8 | SSE notifications with bell indicator |
| 9 | Sidebar logout + real user info |
| 10 | Final verification + cleanup |

**Total files modified/created:** ~15 files
**Pages affected:** Login, signup, forgot/reset password, verify email, dashboard, campaigns, accounts, insights, settings
**Not covered (Phase 2):** Smart suggestions engine, automations, optimizations, admin panel, finance/billing — these need their own backend endpoints first.

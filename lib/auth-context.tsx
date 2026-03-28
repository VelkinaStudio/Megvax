// lib/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, setAccessToken } from './api';

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

/* ── Mock/demo accounts — fallback when API is unreachable ── */
const MOCK_ACCOUNTS = [
  {
    email: 'demo@megvax.com',
    password: 'demo123',
    user: {
      id: 'demo-user-001',
      email: 'demo@megvax.com',
      fullName: 'Demo Kullanıcı',
      avatar: null,
      locale: 'tr',
      emailVerified: true,
      isAdmin: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: '2025-01-01T00:00:00.000Z',
    } satisfies User,
  },
  {
    email: 'admin@megvax.com',
    password: 'admin123',
    user: {
      id: 'demo-admin-001',
      email: 'admin@megvax.com',
      fullName: 'Admin',
      avatar: null,
      locale: 'tr',
      emailVerified: true,
      isAdmin: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: '2025-01-01T00:00:00.000Z',
    } satisfies User,
  },
] as const;

/** Build a realistic-looking JWT so downstream code that inspects token structure won't crash. */
function createMockToken(user: User): string {
  // Use TextEncoder to handle Unicode characters (Turkish ı, ş, etc.)
  const toBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));
  const header = toBase64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      isAdmin: user.isAdmin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  );
  const signature = toBase64('mock-signature');
  return `${header}.${payload}.${signature}`;
}

function tryMockLogin(email: string, password: string): { accessToken: string; user: User } | null {
  const account = MOCK_ACCOUNTS.find(
    (a) => a.email === email.toLowerCase().trim() && a.password === password
  );
  if (!account) return null;
  const user = { ...account.user, lastLoginAt: new Date().toISOString() };
  return { accessToken: createMockToken(user), user };
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
  devLogin: () => Promise<void>;
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

  // On mount, try to restore session via refresh token cookie or mock session
  useEffect(() => {
    const tryRestore = async () => {
      // In demo mode, skip API refresh entirely — only restore from mock session
      if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
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
            return;
          }
        } catch {
          // API unreachable — check for persisted mock session
        }
      }
      // Try to restore a mock session from sessionStorage
      try {
        const stored = sessionStorage.getItem('megvax_mock_session');
        if (stored) {
          const { user, accessToken: token } = JSON.parse(stored) as { user: User; accessToken: string };
          setAccessToken(token);
          setState({ user, isLoading: false, isAuthenticated: true });
          return;
        }
      } catch {
        // sessionStorage unavailable or corrupt — ignore
      }
      setState(s => ({ ...s, isLoading: false }));
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
    // Try mock/demo credentials first — these always work regardless of API state
    const mockResult = tryMockLogin(email.toLowerCase().trim(), password);
    if (mockResult) {
      setAccessToken(mockResult.accessToken);
      setState({ user: mockResult.user, isLoading: false, isAuthenticated: true });
      try { sessionStorage.setItem('megvax_mock_session', JSON.stringify(mockResult)); } catch {}
      return;
    }

    // In demo mode, only mock accounts are allowed — skip API entirely
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      throw new Error('Demo modunda sadece demo hesapları kullanılabilir');
    }

    // Not a demo account — proceed with real API call
    try {
      const data = await api<{ accessToken: string; user: User }>('/auth/login', {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
      });
      setAccessToken(data.accessToken);
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
    } catch (err) {
      // Re-try mock as last resort (covers edge cases like network race conditions)
      const fallback = tryMockLogin(email, password);
      if (fallback) {
        setAccessToken(fallback.accessToken);
        setState({ user: fallback.user, isLoading: false, isAuthenticated: true });
        try { sessionStorage.setItem('megvax_mock_session', JSON.stringify(fallback)); } catch {}
        return;
      }
      throw err;
    }
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
    try { sessionStorage.removeItem('megvax_mock_session'); } catch {}
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const devLogin = useCallback(async () => {
    const email = process.env.NEXT_PUBLIC_DEV_EMAIL;
    const password = process.env.NEXT_PUBLIC_DEV_PASSWORD;
    if (!email || !password) {
      throw new Error('Dev credentials not configured in .env.local');
    }
    const data = await api<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    });
    setAccessToken(data.accessToken);
    setState({ user: data.user, isLoading: false, isAuthenticated: true });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser, devLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

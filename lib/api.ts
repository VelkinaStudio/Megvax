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

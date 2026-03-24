// lib/mock-api.ts
// Intercepts API calls when NEXT_PUBLIC_DEMO_MODE=true — zero network requests

import {
  DEMO_USER,
  DEMO_ACCOUNTS,
  mockKpiMetrics,
  mockSuggestions,
  mockMetaCampaigns,
  mockMetaAdSets,
  mockMetaAds,
  mockAutomationRules,
  mockOptimizationStrategies,
  mockNotifications,
} from './demo-data';

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

export async function mockApiHandler<T>(path: string, method: string = 'GET', body?: any): Promise<T> {
  // Simulate network delay for realism
  await new Promise((r) => setTimeout(r, 300));

  // ── Auth endpoints ──────────────────────────────────────────────
  if (path === '/auth/login') {
    return { accessToken: 'demo-token', user: DEMO_USER } as T;
  }
  if (path === '/auth/register') {
    return { accessToken: 'demo-token', user: DEMO_USER } as T;
  }
  if (path === '/auth/me') {
    return DEMO_USER as T;
  }
  if (path === '/auth/refresh') {
    return { accessToken: 'demo-token', user: DEMO_USER } as T;
  }
  if (path === '/auth/logout') {
    return { success: true } as T;
  }

  // ── Accounts ────────────────────────────────────────────────────
  if (path.startsWith('/accounts')) {
    return DEMO_ACCOUNTS as T;
  }

  // ── Campaigns / Ad Sets / Ads ───────────────────────────────────
  if (path.match(/^\/campaigns\/[^/]+\/adsets\/[^/]+\/ads/)) {
    return mockMetaAds as T;
  }
  if (path.match(/^\/campaigns\/[^/]+\/adsets/)) {
    return mockMetaAdSets as T;
  }
  if (path.startsWith('/campaigns')) {
    return mockMetaCampaigns as T;
  }

  // ── Ad Sets (standalone) ────────────────────────────────────────
  if (path.startsWith('/adsets')) {
    return mockMetaAdSets as T;
  }

  // ── Ads (standalone) ────────────────────────────────────────────
  if (path.startsWith('/ads')) {
    return mockMetaAds as T;
  }

  // ── Suggestions ─────────────────────────────────────────────────
  if (path.startsWith('/suggestions')) {
    return mockSuggestions as T;
  }

  // ── Automation rules ────────────────────────────────────────────
  if (path.startsWith('/automation') || path.startsWith('/rules')) {
    return mockAutomationRules as T;
  }

  // ── Optimization strategies ─────────────────────────────────────
  if (path.startsWith('/optimization') || path.startsWith('/strategies')) {
    return mockOptimizationStrategies as T;
  }

  // ── Insights / analytics ────────────────────────────────────────
  if (path.startsWith('/insights') || path.startsWith('/analytics')) {
    return { metrics: mockKpiMetrics, period: '7d' } as T;
  }

  // ── User / profile ─────────────────────────────────────────────
  if (path.startsWith('/user') || path.startsWith('/profile')) {
    return DEMO_USER as T;
  }

  // ── Settings ────────────────────────────────────────────────────
  if (path.startsWith('/settings')) {
    return {} as T;
  }

  // ── Notifications ───────────────────────────────────────────────
  if (path === '/notifications/read-all' && method === 'POST') {
    return { success: true } as T;
  }
  if (path.match(/^\/notifications\/[^/]+\/read/) && method === 'PATCH') {
    return { success: true } as T;
  }
  if (path.startsWith('/notifications')) {
    return { data: mockNotifications, hasMore: false } as T;
  }

  // ── Default fallback (write operations return success) ──────────
  if (method !== 'GET') {
    return { success: true } as T;
  }

  return {} as T;
}

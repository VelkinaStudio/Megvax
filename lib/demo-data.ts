// lib/demo-data.ts
// Centralized demo mode data — re-exports existing mock data + adds demo user/account objects

export {
  mockKpiMetrics,
  mockSuggestions,
  mockMetaCampaigns,
  mockMetaAdSets,
  mockMetaAds,
  mockAutomationRules,
  mockOptimizationStrategies,
} from '@/components/dashboard/mockData';

export const DEMO_USER = {
  id: 'demo-user-1',
  email: 'demo@megvax.io',
  fullName: 'Demo Kullanici',
  avatar: null,
  locale: 'tr',
  emailVerified: true,
  isAdmin: false,
  lastLoginAt: new Date().toISOString(),
  createdAt: '2026-01-01T00:00:00Z',
};

export const DEMO_ADMIN = {
  id: 'admin-user-1',
  email: 'admin@megvax.io',
  fullName: 'Admin Kullanici',
  avatar: null,
  locale: 'tr',
  emailVerified: true,
  isAdmin: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: '2026-01-01T00:00:00Z',
};

export const DEMO_ACCOUNTS = [
  {
    id: 'acc-1',
    metaAccountId: 'act_123456789',
    name: 'MegVax Demo Hesabi',
    currency: 'TRY',
    timezone: 'Europe/Istanbul',
    status: 'ACTIVE',
    lastSyncAt: new Date().toISOString(),
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'acc-2',
    metaAccountId: 'act_987654321',
    name: 'E-Ticaret Reklam Hesabi',
    currency: 'TRY',
    timezone: 'Europe/Istanbul',
    status: 'ACTIVE',
    lastSyncAt: new Date().toISOString(),
    createdAt: '2026-02-01T00:00:00Z',
  },
];

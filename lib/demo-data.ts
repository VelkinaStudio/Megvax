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

// ── Mock Notifications ──────────────────────────────────────────────
// Timestamps are computed relative to "now" so they always look fresh
function minutesAgo(m: number) {
  return new Date(Date.now() - m * 60_000).toISOString();
}

export const mockNotifications = [
  {
    id: 'notif-1',
    type: 'AUTOPILOT_ACTION',
    title: 'Otomatik optimizasyon: Düşük performanslı kampanya duraklatıldı',
    body: 'Kampanya "Kış Sezonu" son 3 günde hedef ROAS altında kaldığı için otomatik olarak duraklatıldı.',
    data: null,
    readAt: null,
    createdAt: minutesAgo(5),
  },
  {
    id: 'notif-2',
    type: 'SUGGESTION',
    title: 'Yeni öneri: ROAS artışı için bütçe yeniden dağıtımı',
    body: 'En iyi performans gösteren 2 reklam setine bütçe aktararak tahmini %18 ROAS artışı sağlayabilirsiniz.',
    data: null,
    readAt: null,
    createdAt: minutesAgo(60),
  },
  {
    id: 'notif-3',
    type: 'META_CONNECTION',
    title: 'Meta hesap senkronizasyonu tamamlandı',
    body: '2 reklam hesabı ve 14 kampanya başarıyla senkronize edildi.',
    data: null,
    readAt: null,
    createdAt: minutesAgo(120),
  },
  {
    id: 'notif-4',
    type: 'SYSTEM',
    title: 'Haftalık performans raporu hazır',
    body: 'Son 7 günün detaylı kampanya performans raporu incelenmeye hazır.',
    data: null,
    readAt: minutesAgo(30), // already read
    createdAt: minutesAgo(1440),
  },
  {
    id: 'notif-5',
    type: 'BILLING',
    title: 'Bütçe uyarısı: Günlük harcama limitine yaklaşıldı',
    body: 'Günlük bütçenizin %85\'ini kullandınız. Kalan: ₺1.200',
    data: null,
    readAt: null,
    createdAt: minutesAgo(1500),
  },
  {
    id: 'notif-6',
    type: 'AUTOPILOT_ACTION',
    title: 'Kampanya "Yaz İndirimi" hedeflerini aştı',
    body: 'Hedef CPA: ₺45 — Gerçekleşen CPA: ₺32. Tebrikler!',
    data: null,
    readAt: minutesAgo(2000), // already read
    createdAt: minutesAgo(2880),
  },
];

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

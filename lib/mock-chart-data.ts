// lib/mock-chart-data.ts
// Generates 30 days of realistic daily ad metrics for dashboard charts.
// Patterns: weekday/weekend variation, gradual upward trend, organic noise.

export interface DailyMetric {
  date: string;       // YYYY-MM-DD
  dateLabel: string;  // "15 Mar" style for axis labels
  spend: number;
  roas: number;
  conversions: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
}

export interface CampaignMetric {
  name: string;
  spend: number;
  roas: number;
  conversions: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function formatDateLabel(d: Date): string {
  const months = [
    'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
    'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function generateDailyMetrics(days = 30, seed = 42): DailyMetric[] {
  const rand = seededRandom(seed);
  const now = new Date();
  const result: DailyMetric[] = [];

  // Base values for a mid-size Turkish e-commerce ad account
  const baseSpend = 420;       // ~₺420/day average
  const baseRoas = 2.4;
  const baseConversions = 14;
  const baseImpressions = 18000;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);

    const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Gradual upward trend over the month (improving account)
    const trendFactor = 1 + ((days - 1 - i) / days) * 0.15;

    // Weekend dip: spend drops 20-30%, conversions drop more
    const weekendSpendMult = isWeekend ? 0.72 + rand() * 0.08 : 1.0;
    const weekendConvMult = isWeekend ? 0.65 + rand() * 0.1 : 1.0;

    // Daily noise: ±15%
    const noise = () => 0.85 + rand() * 0.30;

    const spend = Math.round(baseSpend * trendFactor * weekendSpendMult * noise());
    const impressions = Math.round(baseImpressions * trendFactor * weekendSpendMult * noise());
    const ctr = Number((1.0 + rand() * 1.8 + (isWeekend ? -0.15 : 0.1)).toFixed(2));
    const clicks = Math.round(impressions * (ctr / 100));
    const cpc = clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0;
    const conversions = Math.max(1, Math.round(baseConversions * trendFactor * weekendConvMult * noise()));
    const revenue = spend * (baseRoas * trendFactor * noise() * (isWeekend ? 0.9 : 1.0));
    const roas = Number((revenue / Math.max(spend, 1)).toFixed(2));

    result.push({
      date: formatISO(d),
      dateLabel: formatDateLabel(d),
      spend,
      roas,
      conversions,
      impressions,
      clicks,
      ctr,
      cpc,
    });
  }

  return result;
}

export function generateCampaignComparison(seed = 99): CampaignMetric[] {
  const rand = seededRandom(seed);

  const campaigns: CampaignMetric[] = [
    {
      name: 'Retargeting - Sales',
      spend: Math.round(8200 + rand() * 4000),
      roas: Number((2.8 + rand() * 1.5).toFixed(2)),
      conversions: Math.round(28 + rand() * 20),
    },
    {
      name: 'Prospecting - Lead',
      spend: Math.round(5500 + rand() * 3000),
      roas: Number((1.6 + rand() * 1.0).toFixed(2)),
      conversions: Math.round(12 + rand() * 15),
    },
    {
      name: 'Catalog - Conversion',
      spend: Math.round(3000 + rand() * 2000),
      roas: Number((2.0 + rand() * 1.2).toFixed(2)),
      conversions: Math.round(8 + rand() * 10),
    },
    {
      name: 'Brand Awareness',
      spend: Math.round(2000 + rand() * 1500),
      roas: Number((0.8 + rand() * 0.8).toFixed(2)),
      conversions: Math.round(3 + rand() * 5),
    },
    {
      name: 'Video - Engagement',
      spend: Math.round(1500 + rand() * 1200),
      roas: Number((1.2 + rand() * 1.0).toFixed(2)),
      conversions: Math.round(5 + rand() * 8),
    },
  ];

  // Sort by spend descending
  return campaigns.sort((a, b) => b.spend - a.spend);
}

// Pre-generated data singletons for consistent rendering
let _dailyCache: DailyMetric[] | null = null;
let _campaignCache: CampaignMetric[] | null = null;

export function getMockDailyMetrics(): DailyMetric[] {
  if (!_dailyCache) _dailyCache = generateDailyMetrics(30, 42);
  return _dailyCache;
}

export function getMockCampaignComparison(): CampaignMetric[] {
  if (!_campaignCache) _campaignCache = generateCampaignComparison(99);
  return _campaignCache;
}

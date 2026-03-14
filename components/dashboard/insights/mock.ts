import type {
  InsightsBreakdownKey,
  InsightsBreakdownRow,
  InsightsLevel,
  InsightsSingleResponse,
  InsightsSummary,
  InsightsTimeseriesPoint,
} from '@/types/dashboard';

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function numFromSeed(seed: number, min: number, max: number) {
  const t = (seed % 1000) / 1000;
  return min + (max - min) * t;
}

function formatDateISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function makeSummary(seedKey: string): InsightsSummary {
  const h = hashString(seedKey);
  const spend = Math.round(numFromSeed(h, 300, 25000));
  const roas = Number(numFromSeed(h + 11, 0.7, 8.5).toFixed(2));
  const conversions = Math.round(numFromSeed(h + 17, 0, 180));
  const ctr = Number(numFromSeed(h + 29, 0.3, 3.5).toFixed(2));
  const cpc = Number(numFromSeed(h + 31, 0.8, 18).toFixed(2));
  const cpm = Number(numFromSeed(h + 37, 15, 240).toFixed(2));
  const impressions = Math.round(numFromSeed(h + 41, 2500, 450000));
  const reach = Math.round(impressions * numFromSeed(h + 43, 0.25, 0.85));
  const frequency = Number(clamp(impressions / Math.max(1, reach), 1, 6).toFixed(2));

  return {
    spend,
    roas,
    conversions,
    ctr,
    cpc,
    cpm,
    impressions,
    reach,
    frequency,
  };
}

function makeTimeseries(seedKey: string, days = 7): InsightsTimeseriesPoint[] {
  const base = hashString(`ts:${seedKey}`);
  const now = new Date();
  const points: InsightsTimeseriesPoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);

    const spend = Math.round(numFromSeed(base + i * 13, 40, 4200));
    const roas = Number(numFromSeed(base + i * 17, 0.4, 9.2).toFixed(2));
    const conversions = Math.round(numFromSeed(base + i * 19, 0, 40));
    const ctr = Number(numFromSeed(base + i * 23, 0.2, 4.1).toFixed(2));

    points.push({
      date: formatDateISO(d),
      spend,
      roas,
      conversions,
      ctr,
    });
  }

  return points;
}

function makeBreakdownRows(seedKey: string, key: InsightsBreakdownKey): InsightsBreakdownRow[] {
  const base = hashString(`bd:${seedKey}:${key}`);

  const labelsByKey: Record<InsightsBreakdownKey, { key: string; label: string }[]> = {
    placement: [
      { key: 'feed', label: 'Feed' },
      { key: 'stories', label: 'Stories' },
      { key: 'reels', label: 'Reels' },
      { key: 'marketplace', label: 'Marketplace' },
    ],
    age: [
      { key: '18-24', label: '18–24' },
      { key: '25-34', label: '25–34' },
      { key: '35-44', label: '35–44' },
      { key: '45+', label: '45+' },
    ],
    gender: [
      { key: 'female', label: 'Female' },
      { key: 'male', label: 'Male' },
      { key: 'unknown', label: 'Unknown' },
    ],
    device: [
      { key: 'ios', label: 'iOS' },
      { key: 'android', label: 'Android' },
      { key: 'desktop', label: 'Desktop' },
    ],
  };

  return labelsByKey[key].map((item, idx) => {
    const spend = Math.round(numFromSeed(base + idx * 7, 10, 5200));
    const roas = Number(numFromSeed(base + idx * 11, 0.4, 9.4).toFixed(2));
    const conversions = Math.round(numFromSeed(base + idx * 13, 0, 55));
    const ctr = Number(numFromSeed(base + idx * 17, 0.2, 4.3).toFixed(2));

    return {
      key: item.key,
      label: item.label,
      spend,
      roas,
      conversions,
      ctr,
    };
  });
}

export function createMockInsightsSingle(level: InsightsLevel, entityId: string): InsightsSingleResponse {
  const seedKey = `${level}:${entityId}`;
  return {
    level,
    entityId,
    summary: makeSummary(seedKey),
    timeseries: makeTimeseries(seedKey, 7),
    breakdowns: {
      placement: makeBreakdownRows(seedKey, 'placement'),
      age: makeBreakdownRows(seedKey, 'age'),
      gender: makeBreakdownRows(seedKey, 'gender'),
      device: makeBreakdownRows(seedKey, 'device'),
    },
  };
}

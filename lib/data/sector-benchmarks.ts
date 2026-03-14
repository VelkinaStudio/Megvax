export type SectorType = 
  | 'ecommerce' 
  | 'saas' 
  | 'services' 
  | 'education' 
  | 'finance' 
  | 'health' 
  | 'real_estate'
  | 'travel'
  | 'food';

export type SectorBenchmark = {
  sector: SectorType;
  label: string;
  labelTr: string;
  metrics: {
    ctr: number;
    cpc: number;
    cpm: number;
    roas: number;
    conversionRate: number;
  };
};

export const SECTOR_BENCHMARKS: SectorBenchmark[] = [
  {
    sector: 'ecommerce',
    label: 'E-commerce',
    labelTr: 'E-Ticaret',
    metrics: {
      ctr: 1.2,
      cpc: 4.5,
      cpm: 38,
      roas: 2.8,
      conversionRate: 2.5,
    },
  },
  {
    sector: 'saas',
    label: 'SaaS / Technology',
    labelTr: 'SaaS / Teknoloji',
    metrics: {
      ctr: 0.9,
      cpc: 8.2,
      cpm: 52,
      roas: 3.2,
      conversionRate: 1.8,
    },
  },
  {
    sector: 'services',
    label: 'Professional Services',
    labelTr: 'Profesyonel Hizmetler',
    metrics: {
      ctr: 1.0,
      cpc: 6.5,
      cpm: 45,
      roas: 2.5,
      conversionRate: 2.0,
    },
  },
  {
    sector: 'education',
    label: 'Education',
    labelTr: 'Eğitim',
    metrics: {
      ctr: 1.4,
      cpc: 3.8,
      cpm: 32,
      roas: 2.2,
      conversionRate: 3.0,
    },
  },
  {
    sector: 'finance',
    label: 'Finance & Insurance',
    labelTr: 'Finans & Sigorta',
    metrics: {
      ctr: 0.8,
      cpc: 12.5,
      cpm: 65,
      roas: 3.5,
      conversionRate: 1.5,
    },
  },
  {
    sector: 'health',
    label: 'Health & Wellness',
    labelTr: 'Sağlık & Wellness',
    metrics: {
      ctr: 1.1,
      cpc: 5.2,
      cpm: 42,
      roas: 2.4,
      conversionRate: 2.2,
    },
  },
  {
    sector: 'real_estate',
    label: 'Real Estate',
    labelTr: 'Gayrimenkul',
    metrics: {
      ctr: 0.7,
      cpc: 9.8,
      cpm: 58,
      roas: 2.0,
      conversionRate: 1.2,
    },
  },
  {
    sector: 'travel',
    label: 'Travel & Tourism',
    labelTr: 'Seyahat & Turizm',
    metrics: {
      ctr: 1.3,
      cpc: 4.2,
      cpm: 35,
      roas: 2.6,
      conversionRate: 2.8,
    },
  },
  {
    sector: 'food',
    label: 'Food & Restaurant',
    labelTr: 'Yiyecek & Restoran',
    metrics: {
      ctr: 1.5,
      cpc: 3.5,
      cpm: 28,
      roas: 3.0,
      conversionRate: 3.2,
    },
  },
];

export function getSectorBenchmark(sector: SectorType): SectorBenchmark | undefined {
  return SECTOR_BENCHMARKS.find((s) => s.sector === sector);
}

export function compareToBenchmark(
  userMetrics: { ctr?: number; cpc?: number; cpm?: number; roas?: number; conversionRate?: number },
  sector: SectorType
): {
  ctr: { value: number; benchmark: number; diff: number; status: 'above' | 'below' | 'average' };
  cpc: { value: number; benchmark: number; diff: number; status: 'above' | 'below' | 'average' };
  cpm: { value: number; benchmark: number; diff: number; status: 'above' | 'below' | 'average' };
  roas: { value: number; benchmark: number; diff: number; status: 'above' | 'below' | 'average' };
  conversionRate: { value: number; benchmark: number; diff: number; status: 'above' | 'below' | 'average' };
} | null {
  const benchmark = getSectorBenchmark(sector);
  if (!benchmark) return null;

  const getStatus = (value: number, benchmarkValue: number, higherIsBetter: boolean): 'above' | 'below' | 'average' => {
    const diff = ((value - benchmarkValue) / benchmarkValue) * 100;
    if (Math.abs(diff) <= 10) return 'average';
    if (higherIsBetter) {
      return diff > 0 ? 'above' : 'below';
    } else {
      return diff < 0 ? 'above' : 'below';
    }
  };

  const ctrValue = userMetrics.ctr ?? 0;
  const cpcValue = userMetrics.cpc ?? 0;
  const cpmValue = userMetrics.cpm ?? 0;
  const roasValue = userMetrics.roas ?? 0;
  const convValue = userMetrics.conversionRate ?? 0;

  return {
    ctr: {
      value: ctrValue,
      benchmark: benchmark.metrics.ctr,
      diff: ((ctrValue - benchmark.metrics.ctr) / benchmark.metrics.ctr) * 100,
      status: getStatus(ctrValue, benchmark.metrics.ctr, true),
    },
    cpc: {
      value: cpcValue,
      benchmark: benchmark.metrics.cpc,
      diff: ((cpcValue - benchmark.metrics.cpc) / benchmark.metrics.cpc) * 100,
      status: getStatus(cpcValue, benchmark.metrics.cpc, false),
    },
    cpm: {
      value: cpmValue,
      benchmark: benchmark.metrics.cpm,
      diff: ((cpmValue - benchmark.metrics.cpm) / benchmark.metrics.cpm) * 100,
      status: getStatus(cpmValue, benchmark.metrics.cpm, false),
    },
    roas: {
      value: roasValue,
      benchmark: benchmark.metrics.roas,
      diff: ((roasValue - benchmark.metrics.roas) / benchmark.metrics.roas) * 100,
      status: getStatus(roasValue, benchmark.metrics.roas, true),
    },
    conversionRate: {
      value: convValue,
      benchmark: benchmark.metrics.conversionRate,
      diff: ((convValue - benchmark.metrics.conversionRate) / benchmark.metrics.conversionRate) * 100,
      status: getStatus(convValue, benchmark.metrics.conversionRate, true),
    },
  };
}

export const MOCK_USER_METRICS = {
  ctr: 1.4,
  cpc: 5.2,
  cpm: 42,
  roas: 3.1,
  conversionRate: 2.8,
};

'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, Info } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import {
  SECTOR_BENCHMARKS,
  compareToBenchmark,
  MOCK_USER_METRICS,
  type SectorType,
} from '@/lib/data/sector-benchmarks';

interface SectorComparisonProps {
  userMetrics?: {
    ctr?: number;
    cpc?: number;
    cpm?: number;
    roas?: number;
    conversionRate?: number;
  };
}

const METRIC_CONFIG = {
  ctr: { label: 'CTR', unit: '%', format: (v: number) => `${v.toFixed(2)}%`, higherBetter: true },
  cpc: { label: 'CPC', unit: '₺', format: (v: number) => `₺${v.toFixed(2)}`, higherBetter: false },
  cpm: { label: 'CPM', unit: '₺', format: (v: number) => `₺${v.toFixed(0)}`, higherBetter: false },
  roas: { label: 'ROAS', unit: 'x', format: (v: number) => `${v.toFixed(2)}x`, higherBetter: true },
  conversionRate: { label: 'Conversion', unit: '%', format: (v: number) => `${v.toFixed(2)}%`, higherBetter: true },
};

export function SectorComparison({ userMetrics = MOCK_USER_METRICS }: SectorComparisonProps) {
  const [selectedSector, setSelectedSector] = useState<SectorType>('ecommerce');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const comparison = compareToBenchmark(userMetrics, selectedSector);
  const selectedSectorData = SECTOR_BENCHMARKS.find((s) => s.sector === selectedSector);

  if (!comparison || !selectedSectorData) return null;

  const getStatusIcon = (status: 'above' | 'below' | 'average', higherBetter: boolean) => {
    if (status === 'average') return <Minus className="w-4 h-4 text-gray-400" />;
    const isGood = (status === 'above' && higherBetter) || (status === 'below' && !higherBetter);
    if (isGood) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (status: 'above' | 'below' | 'average', higherBetter: boolean) => {
    if (status === 'average') return 'text-gray-600';
    const isGood = (status === 'above' && higherBetter) || (status === 'below' && !higherBetter);
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const _getStatusBadge = (status: 'above' | 'below' | 'average', higherBetter: boolean) => {
    if (status === 'average') return <Badge variant="neutral">Average</Badge>;
    const isGood = (status === 'above' && higherBetter) || (status === 'below' && !higherBetter);
    return isGood ? <Badge variant="success">Above Average</Badge> : <Badge variant="warning">Below Average</Badge>;
  };

  const metrics = ['ctr', 'cpc', 'cpm', 'roas', 'conversionRate'] as const;
  
  const goodCount = metrics.filter((m) => {
    const c = comparison[m];
    const config = METRIC_CONFIG[m];
    return (c.status === 'above' && config.higherBetter) || (c.status === 'below' && !config.higherBetter);
  }).length;

  return (
    <Card padding="lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sector Comparison</h3>
          <p className="text-sm text-gray-500 mt-1">
            Compare your performance with the sector average
          </p>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {selectedSectorData.labelTr}
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1">
              {SECTOR_BENCHMARKS.map((sector) => (
                <button
                  key={sector.sector}
                  onClick={() => {
                    setSelectedSector(sector.sector);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                    selectedSector === sector.sector ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {sector.labelTr}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700 font-medium">Genel Performans</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{goodCount}/5 metrikte iyi</p>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            goodCount >= 4 ? 'bg-green-100' : goodCount >= 2 ? 'bg-amber-100' : 'bg-red-100'
          }`}>
            <span className={`text-2xl font-bold ${
              goodCount >= 4 ? 'text-green-700' : goodCount >= 2 ? 'text-amber-700' : 'text-red-700'
            }`}>
              {goodCount >= 4 ? 'A' : goodCount >= 2 ? 'B' : 'C'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((metricKey) => {
          const config = METRIC_CONFIG[metricKey];
          const data = comparison[metricKey];
          
          return (
            <div key={metricKey} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                {getStatusIcon(data.status, config.higherBetter)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{config.label}</p>
                  <p className="text-xs text-gray-500">
                    Sector: {config.format(data.benchmark)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-lg font-semibold ${getStatusColor(data.status, config.higherBetter)}`}>
                  {config.format(data.value)}
                </p>
                <p className={`text-xs ${data.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.diff >= 0 ? '+' : ''}{data.diff.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600">
            Sector averages are based on performance data from Meta advertisers in the {selectedSectorData.labelTr} sector. 
            Data is for reference only and may vary based on market conditions.
          </p>
        </div>
      </div>
    </Card>
  );
}

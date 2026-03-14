'use client';

import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui';
import { PageHeader } from '@/components/dashboard';
import { useTranslations } from '@/lib/i18n';

const platformStats = [
  { name: 'Meta Ads', users: 892, spend: '₺98.5K', growth: '+15%' },
  { name: 'Google Ads', users: 234, spend: '₺45.2K', growth: '+8%' },
];

export default function AdminAnalyticsPage() {
  const t = useTranslations('admin');

  const dayKeys = ['analytics_day_mon', 'analytics_day_tue', 'analytics_day_wed', 'analytics_day_thu', 'analytics_day_fri', 'analytics_day_sat', 'analytics_day_sun'] as const;
  const dailyStats = [
    { dayKey: dayKeys[0], users: 120, campaigns: 45 },
    { dayKey: dayKeys[1], users: 132, campaigns: 52 },
    { dayKey: dayKeys[2], users: 145, campaigns: 48 },
    { dayKey: dayKeys[3], users: 138, campaigns: 55 },
    { dayKey: dayKeys[4], users: 156, campaigns: 62 },
    { dayKey: dayKeys[5], users: 89, campaigns: 38 },
    { dayKey: dayKeys[6], users: 95, campaigns: 42 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={t('analytics_desc')}
      />

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platformStats.map((platform) => (
          <Card key={platform.name} padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{platform.name}</h3>
              <span className="text-sm text-green-600 font-medium">{platform.growth}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('analytics_users')}</p>
                <p className="text-2xl font-bold text-gray-900">{platform.users}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('analytics_spend')}</p>
                <p className="text-2xl font-bold text-gray-900">{platform.spend}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Weekly Activity */}
      <Card padding="lg">
        <h3 className="font-semibold text-gray-900 mb-6">{t('analytics_weekly')}</h3>
        <div className="space-y-4">
          {dailyStats.map((stat) => (
            <div key={stat.dayKey} className="flex items-center gap-4">
              <span className="w-12 text-sm font-medium text-gray-600">{t(stat.dayKey)}</span>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(stat.users / 160) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{stat.users}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(stat.campaigns / 70) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{stat.campaigns}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('analytics_avg_roas')}</p>
            <p className="text-lg font-bold text-gray-900">4.2x</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('analytics_avg_spend')}</p>
            <p className="text-lg font-bold text-gray-900">₺12.5K</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('analytics_new_signups')}</p>
            <p className="text-lg font-bold text-gray-900">+156</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

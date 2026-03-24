'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  CreditCard,
  Receipt,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
} from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

interface KpiCardProps {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
}

function KpiCard({ label, value, change, changeLabel, icon: Icon }: KpiCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bento-card group">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-gray-900 mt-3 tracking-tighter">{value}</p>
          <div className="flex items-center gap-2 mt-4 bg-gray-50/50 w-fit px-3 py-1.5 rounded-full border border-gray-100">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{changeLabel}</span>
          </div>
        </div>
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/20">
          <Icon className="w-7 h-7 blue-600 group-hover:text-white transition-colors" />
        </div>
      </div>
      {/* Decorative gradient */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </div>
  );
}

export default function AdminOverviewPage() {
  const t = useTranslations('admin');
  const [dateRange, setDateRange] = useState('30');

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-4 border border-blue-100">
            <BarChart3 className="w-3 h-3" />
            {t('system_report')}
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{t('overview')}</h1>
          <p className="text-gray-500 font-medium mt-1">{t('overview_subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-6 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          >
            <option value="7">{t('last_7_days')}</option>
            <option value="30">{t('last_30_days')}</option>
            <option value="90">{t('last_90_days')}</option>
            <option value="365">{t('last_1_year')}</option>
          </select>
          <button className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/10 active:scale-95">
            <Download className="w-4 h-4" />
            {t('download_report')}
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          label={t('mrr')}
          value="—"
          change={0}
          changeLabel={t('vs_last_month')}
          icon={BarChart3}
        />
        <KpiCard
          label={t('active_subscriptions')}
          value="0"
          change={0}
          changeLabel={t('vs_last_month')}
          icon={CreditCard}
        />
        <KpiCard
          label={t('total_users_label')}
          value="0"
          change={0}
          changeLabel={t('vs_last_month')}
          icon={Users}
        />
        <KpiCard
          label={t('revenue_this_month')}
          value="—"
          change={0}
          changeLabel={t('vs_last_month')}
          icon={Receipt}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart Placeholder */}
        <div className="bento-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">{t('revenue_trend')}</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <Calendar className="w-3 h-3" />
              {t('last_6_months')}
            </div>
          </div>
          <div className="h-72 bg-gray-50/50 rounded-3xl border border-gray-100 border-dashed flex items-center justify-center relative overflow-hidden group">
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 mx-auto border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-8 h-8 text-blue-200" />
              </div>
              <p className="text-sm font-bold text-gray-900">{t('chart_loading')}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium tracking-tight">{t('awaiting_stripe')}</p>
            </div>
            {/* Animated grid line mocks */}
            <div className="absolute inset-0 opacity-30 select-none pointer-events-none">
              <div className="w-full h-full grid grid-cols-8 gap-4 p-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="flex flex-col justify-end h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.random() * 100}%` }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                      className="w-full bg-blue-100 rounded-t-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Growth Placeholder */}
        <div className="bento-card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">{t('user_growth')}</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <Calendar className="w-3 h-3" />
              {t('last_6_months')}
            </div>
          </div>
          <div className="h-72 bg-gray-50/50 rounded-3xl border border-gray-100 border-dashed flex items-center justify-center group overflow-hidden relative">
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 mx-auto border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-8 h-8 text-blue-200" />
              </div>
              <p className="text-sm font-bold text-gray-900">{t('chart_loading')}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium tracking-tight">{t('awaiting_analytics')}</p>
            </div>
            {/* Decorative orbit */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-blue-100 rounded-full animate-ping opacity-20" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bento-card !p-0">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{t('recent_activity')}</h3>
        </div>
        <div className="p-8">
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Users className="w-6 h-6 text-gray-400 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t('new_user_signup')}</p>
                    <p className="text-xs font-medium text-gray-400 mt-0.5 tracking-tight">ahmet@example.com • Firma Inc.</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{i * 5} {t('min_ago')}</span>
                  <div className="w-1 height-1 bg-gray-100 rounded-full mt-2" />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100">
            {t('view_all_activity')}
          </button>
        </div>
      </div>
    </div>
  );
}

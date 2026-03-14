'use client';

import { motion } from 'framer-motion';
import { Brain, Layers, Target, Zap, BarChart3, Shield, TrendingUp, type LucideIcon } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const gradients = [
  'from-blue-500/10 to-cyan-500/10',
  'from-purple-500/10 to-blue-500/10',
  'from-cyan-500/10 to-emerald-500/10',
  'from-amber-500/10 to-orange-500/10',
  'from-blue-500/10 to-indigo-500/10',
  'from-emerald-500/10 to-cyan-500/10',
];

const iconGradients = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-blue-500',
  'from-cyan-500 to-emerald-500',
  'from-amber-500 to-orange-500',
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-cyan-500',
];

function FeatureCard({ icon: Icon, title, description, index }: { icon: LucideIcon; title: string; description: string; index: number }) {
  const isLarge = index < 2;

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br ${gradients[index]} backdrop-blur-sm hover:border-gray-300/80 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 ${
        isLarge ? 'p-8 md:col-span-1 lg:col-span-1' : 'p-7'
      }`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -6 }}
    >
      {/* Decorative gradient orb */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${iconGradients[index]} rounded-full opacity-[0.07] blur-2xl group-hover:opacity-[0.15] transition-opacity duration-500`} />

      <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${iconGradients[index]} flex items-center justify-center mb-5 shadow-lg shadow-gray-900/5`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className={`font-bold text-gray-900 mb-2.5 tracking-tight ${isLarge ? 'text-lg' : 'text-base'}`}>{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* Artistic multi-line area chart with gradient fills */
function PerformanceChart() {
  const t = useTranslations('features');
  const data1 = [20, 35, 28, 45, 38, 55, 48, 68, 58, 75, 65, 88];
  const data2 = [15, 22, 35, 30, 42, 38, 52, 45, 60, 55, 70, 72];
  const w = 700, h = 240, px = 0, py = 20;
  const chartW = w - px * 2, chartH = h - py * 2;

  function buildPath(data: number[]) {
    const max = 100;
    const points = data.map((v, i) => ({
      x: px + (i / (data.length - 1)) * chartW,
      y: py + chartH - (v / max) * chartH,
    }));
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 3;
      const cp2x = points[i].x + (2 * (points[i + 1].x - points[i].x)) / 3;
      path += ` C ${cp1x} ${points[i].y}, ${cp2x} ${points[i + 1].y}, ${points[i + 1].x} ${points[i + 1].y}`;
    }
    const areaPath = path + ` L ${points[points.length - 1].x} ${py + chartH} L ${points[0].x} ${py + chartH} Z`;
    return { path, areaPath, lastPoint: points[points.length - 1] };
  }

  const line1 = buildPath(data1);
  const line2 = buildPath(data2);

  return (
    <motion.div
      className="relative rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm p-6 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* Decorative mesh */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/[0.04] to-transparent rounded-full blur-3xl" />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <span className="text-base font-bold text-gray-900">{t('bento_weekly')}</span>
          <span className="ml-2 text-xs text-gray-400 font-medium">ROAS</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          +23.5%
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto relative z-10" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chartGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chartGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Subtle grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <line key={i} x1={0} y1={py + chartH * pct} x2={chartW} y2={py + chartH * pct} stroke="#f1f5f9" strokeWidth="1" />
        ))}

        {/* Secondary line */}
        <motion.path d={line2.areaPath} fill="url(#chartGrad2)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} viewport={{ once: true }} />
        <motion.path d={line2.path} fill="none" stroke="url(#lineGrad2)" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }} viewport={{ once: true }} />

        {/* Primary line */}
        <motion.path d={line1.areaPath} fill="url(#chartGrad1)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }} viewport={{ once: true }} />
        <motion.path d={line1.path} fill="none" stroke="url(#lineGrad1)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut' }} viewport={{ once: true }} />

        {/* Glow dot */}
        <motion.circle cx={line1.lastPoint.x} cy={line1.lastPoint.y} r="6" fill="#3b82f6" initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4, duration: 0.4 }} viewport={{ once: true }} />
        <motion.circle cx={line1.lastPoint.x} cy={line1.lastPoint.y} r="12" fill="#3b82f6" opacity={0.2} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 0.2, scale: 1 }} transition={{ delay: 1.4, duration: 0.4 }} viewport={{ once: true }} />
      </svg>
    </motion.div>
  );
}

export function FeaturesSection() {
  const t = useTranslations('features');

  const features = [
    { icon: Brain, title: t('f1_title'), description: t('f1_desc') },
    { icon: Layers, title: t('f2_title'), description: t('f2_desc') },
    { icon: Target, title: t('f3_title'), description: t('f3_desc') },
    { icon: Zap, title: t('f4_title'), description: t('f4_desc') },
    { icon: BarChart3, title: t('f5_title'), description: t('f5_desc') },
    { icon: Shield, title: t('f6_title'), description: t('f6_desc') },
  ];

  return (
    <section id="features" className="relative py-24 md:py-32 bg-[#f8f9fb] overflow-hidden">

      <div className="container mx-auto px-6">
        {/* Header — Bolder */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block text-[13px] font-bold text-blue-600 uppercase tracking-[0.15em] mb-5"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            {t('badge')}
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight leading-[1.1]">
            {t('title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
              {t('title_highlight')}
            </span>
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">{t('subtitle')}</p>
        </motion.div>

        {/* Feature Grid — Bento style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-20">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>

        {/* Dashboard Preview — Artistic Stats + Chart */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Stats row — Glass style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: t('bento_campaigns'), value: '127', sub: t('bento_campaigns_change'), color: 'text-emerald-600', accent: 'from-emerald-500 to-cyan-500' },
              { label: t('bento_spend'), value: '$84K', sub: t('bento_spend_period'), color: 'text-gray-400', accent: 'from-blue-500 to-indigo-500' },
              { label: t('bento_conversion'), value: '4.8%', sub: '↑ 0.8%', color: 'text-emerald-600', accent: 'from-purple-500 to-blue-500' },
              { label: t('bento_cpa'), value: '$12.40', sub: '↓ 15%', color: 'text-emerald-600', accent: 'from-cyan-500 to-emerald-500' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="group relative p-5 rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm overflow-hidden hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-300"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-2 font-medium">{stat.label}</div>
                <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{stat.value}</div>
                <div className={`text-xs font-semibold mt-1 ${stat.color}`}>{stat.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Performance Chart */}
          <PerformanceChart />
        </motion.div>
      </div>
    </section>
  );
}

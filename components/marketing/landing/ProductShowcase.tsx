'use client';

import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import { ScrollReveal } from './ScrollReveal';
import { BarChart3, Sparkles, GitBranch, TrendingUp } from 'lucide-react';

// ─── CSS keyframes ──────────────────────────────────────────────────────────
const cssAnimations = `
@keyframes showcase-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
`;

// ─── Shared constants ───────────────────────────────────────────────────────
const EXPO_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const BLUE = '#3B82F6';
const GREEN = '#10B981';
const AMBER = '#F59E0B';

const CARD_BG = 'rgba(255,255,255,0.05)';
const CARD_BORDER = 'rgba(255,255,255,0.07)';

// ─── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
  { id: 'insights', label: 'Derinlemesine Analiz', icon: BarChart3 },
  { id: 'creative', label: 'AI Kreatif', icon: Sparkles },
  { id: 'tree', label: 'Kampanya Ağacı', icon: GitBranch },
  { id: 'benchmark', label: 'Sektör Kıyaslama', icon: TrendingUp },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ─── 1. Deep Insights Tab ───────────────────────────────────────────────────
function DeepInsightsContent() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const levels = [
    { label: 'Hesap', active: false },
    { label: 'Kampanya', active: true },
    { label: 'Reklam Seti', active: false },
    { label: 'Reklam', active: false },
  ];

  const breakdowns = [
    { label: 'Yaş', widths: [45, 30, 25] },
    { label: 'Cinsiyet', widths: [55, 45] },
    { label: 'Cihaz', widths: [60, 25, 15] },
    { label: 'Yerleşim', widths: [40, 35, 25] },
  ];

  // Spend trend path
  const spendPath = 'M 0 40 C 15 35, 25 38, 40 30 C 55 22, 70 28, 85 18 C 95 12, 110 15, 130 8';
  // ROAS trend path
  const roasPath = 'M 0 38 C 20 42, 30 30, 50 25 C 65 20, 80 22, 95 12 C 105 8, 120 10, 130 5';

  return (
    <div ref={ref} className="p-5 md:p-6 space-y-4">
      {/* Level switcher */}
      <motion.div
        className="flex items-center gap-1.5"
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.5, ease: EXPO_OUT }}
      >
        {levels.map((level, i) => (
          <div
            key={level.label}
            className="px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors"
            style={{
              backgroundColor: level.active ? BLUE : CARD_BG,
              color: level.active ? '#fff' : 'rgba(255,255,255,0.45)',
              border: level.active ? 'none' : `1px solid ${CARD_BORDER}`,
            }}
          >
            {level.label}
          </div>
        ))}
      </motion.div>

      {/* Sparkline charts */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EXPO_OUT }}
      >
        {/* Spend Trend */}
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <div className="text-[10px] text-white/35 mb-2">Harcama Trendi</div>
          <svg viewBox="0 0 130 48" className="w-full h-10" fill="none">
            <motion.path
              d={spendPath}
              stroke={BLUE}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: EXPO_OUT }}
            />
            {/* Glow under the line */}
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity="0.15" />
                <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d={`${spendPath} L 130 48 L 0 48 Z`}
              fill="url(#spendGrad)"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            />
          </svg>
        </div>

        {/* ROAS Trend */}
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <div className="text-[10px] text-white/35 mb-2">ROAS Trendi</div>
          <svg viewBox="0 0 130 48" className="w-full h-10" fill="none">
            <motion.path
              d={roasPath}
              stroke={GREEN}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.2, delay: 0.45, ease: EXPO_OUT }}
            />
            <defs>
              <linearGradient id="roasGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity="0.15" />
                <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d={`${roasPath} L 130 48 L 0 48 Z`}
              fill="url(#roasGrad)"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.95 }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Breakdown pills with bar segments */}
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.5, delay: 0.35, ease: EXPO_OUT }}
      >
        {breakdowns.map((bd, i) => (
          <motion.div
            key={bd.label}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            initial={{ opacity: 0, x: -8 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.08, ease: EXPO_OUT }}
          >
            <span className="text-[10px] text-white/40 whitespace-nowrap">{bd.label}</span>
            <div className="flex gap-[2px] h-[6px]">
              {bd.widths.map((w, j) => (
                <motion.div
                  key={j}
                  className="rounded-[2px]"
                  style={{
                    width: w * 0.6,
                    height: '100%',
                    backgroundColor: j === 0 ? BLUE : j === 1 ? `${BLUE}80` : `${BLUE}40`,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.08 + j * 0.05, ease: EXPO_OUT }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── 2. AI Creative Tab ─────────────────────────────────────────────────────
function AICreativeContent() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isInView) {
      setShowPreview(false);
      return;
    }
    const timer = setTimeout(() => setShowPreview(true), 1400);
    return () => clearTimeout(timer);
  }, [isInView]);

  const styles = [
    { label: 'Minimal', active: false },
    { label: 'Canlı', active: true },
    { label: 'Profesyonel', active: false },
  ];

  return (
    <div ref={ref} className="p-5 md:p-6 space-y-4">
      {/* Prompt input */}
      <motion.div
        className="rounded-lg p-3"
        style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.5, ease: EXPO_OUT }}
      >
        <div className="text-[10px] text-white/25 mb-2">Prompt</div>
        <div className="text-[12px] text-white/20 leading-relaxed">
          Ürün açıklaması girin...
        </div>
      </motion.div>

      {/* Style pills */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.5, delay: 0.12, ease: EXPO_OUT }}
      >
        {styles.map((style) => (
          <div
            key={style.label}
            className="px-3 py-1.5 rounded-md text-[11px] font-medium"
            style={{
              backgroundColor: style.active ? BLUE : CARD_BG,
              color: style.active ? '#fff' : 'rgba(255,255,255,0.4)',
              border: style.active ? 'none' : `1px solid ${CARD_BORDER}`,
            }}
          >
            {style.label}
          </div>
        ))}
      </motion.div>

      {/* Generate button with shimmer */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.5, delay: 0.24, ease: EXPO_OUT }}
      >
        <div
          className="relative overflow-hidden rounded-lg px-4 py-2.5 text-center text-[12px] font-semibold text-white cursor-default"
          style={{ backgroundColor: BLUE }}
        >
          <span className="relative z-10">Oluştur</span>
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
              animation: 'showcase-shimmer 2.5s infinite',
            }}
          />
        </div>
      </motion.div>

      {/* Generated preview card */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.6, ease: EXPO_OUT }}
          >
            {/* Creative preview rectangle */}
            <div
              className="h-24 relative"
              style={{
                background: `linear-gradient(135deg, ${BLUE}30, #8B5CF630, ${AMBER}20)`,
              }}
            >
              {/* Placeholder image content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-1.5 text-center">
                  <div className="w-20 h-2 rounded-full bg-white/20 mx-auto" />
                  <div className="w-14 h-1.5 rounded-full bg-white/12 mx-auto" />
                  <div className="w-16 h-1.5 rounded-full bg-white/10 mx-auto" />
                </div>
              </div>
              {/* AI Generated badge */}
              <motion.div
                className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-medium"
                style={{
                  backgroundColor: 'rgba(139,92,246,0.25)',
                  color: '#C4B5FD',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: EXPO_OUT }}
              >
                AI Generated
              </motion.div>
            </div>
            <div className="p-3 space-y-1.5">
              <div className="w-24 h-2 rounded-full bg-white/15" />
              <div className="w-16 h-1.5 rounded-full bg-white/8" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 3. Campaign Tree Tab ───────────────────────────────────────────────────
function CampaignTreeContent() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const treeData = {
    campaign: { name: 'Yaz Kampanyası', status: 'Aktif' },
    adSets: [
      {
        name: 'Geniş Kitle',
        ads: ['Görsel Reklam A', 'Video Reklam B'],
      },
      {
        name: 'Retargeting',
        ads: [],
      },
    ],
  };

  return (
    <div ref={ref} className="p-5 md:p-6 space-y-0">
      {/* Campaign row */}
      <motion.div
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
        style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        initial={{ opacity: 0, x: -12 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
        transition={{ duration: 0.5, ease: EXPO_OUT }}
      >
        <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: BLUE }} />
        </div>
        <span className="text-[12px] font-medium text-white/70 flex-1">
          {treeData.campaign.name}
        </span>
        <span
          className="px-2 py-0.5 rounded text-[9px] font-medium"
          style={{ backgroundColor: `${GREEN}20`, color: GREEN }}
        >
          {treeData.campaign.status}
        </span>
      </motion.div>

      {/* Ad Sets */}
      {treeData.adSets.map((adSet, si) => (
        <div key={adSet.name}>
          {/* Tree connector line */}
          <motion.div
            className="ml-6 flex items-stretch"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.25 + si * 0.2, ease: EXPO_OUT }}
          >
            <div className="w-[1px] bg-white/10 min-h-[12px]" />
          </motion.div>

          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.5, delay: 0.3 + si * 0.2, ease: EXPO_OUT }}
          >
            {/* Horizontal connector */}
            <div className="ml-6 w-4 h-[1px] bg-white/10" />
            <div
              className="flex-1 flex items-center gap-2.5 rounded-lg px-3 py-2"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <div className="w-4 h-4 rounded bg-white/8 flex items-center justify-center">
                <div className="w-2 h-2 rounded-sm bg-white/20" />
              </div>
              <span className="text-[11px] font-medium text-white/55 flex-1">
                {adSet.name}
              </span>
              <input
                type="checkbox"
                readOnly
                checked={si === 0}
                className="w-3 h-3 rounded accent-blue-500 pointer-events-none"
              />
            </div>
          </motion.div>

          {/* Ads under first ad set */}
          {adSet.ads.map((ad, ai) => (
            <div key={ad}>
              <motion.div
                className="ml-6 flex items-stretch"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.55 + ai * 0.12, ease: EXPO_OUT }}
              >
                <div className="w-[1px] bg-white/10 min-h-[10px] ml-4" />
              </motion.div>

              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                transition={{ duration: 0.45, delay: 0.6 + ai * 0.12, ease: EXPO_OUT }}
              >
                <div className="ml-10 w-4 h-[1px] bg-white/8" />
                <div
                  className="flex-1 flex items-center gap-2 rounded-md px-2.5 py-1.5"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.05)` }}
                >
                  <div className="w-3 h-3 rounded bg-white/6" />
                  <span className="text-[10px] text-white/40 flex-1">{ad}</span>
                  <input
                    type="checkbox"
                    readOnly
                    checked={ai === 1}
                    className="w-3 h-3 rounded accent-blue-500 pointer-events-none"
                  />
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      ))}

      {/* Bulk action bar */}
      <motion.div
        className="mt-3 flex items-center justify-between rounded-lg px-3 py-2"
        style={{
          backgroundColor: `${BLUE}10`,
          border: `1px solid ${BLUE}20`,
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.5, delay: 0.85, ease: EXPO_OUT }}
      >
        <span className="text-[10px] text-white/40">
          2 öğe seçili
        </span>
        <span className="text-[10px] text-white/30 mx-2">|</span>
        <span className="text-[10px] font-medium" style={{ color: BLUE }}>
          Toplu İşlem
        </span>
        <div className="flex-1" />
        <div
          className="px-2.5 py-1 rounded text-[10px] font-medium cursor-default"
          style={{ backgroundColor: `${AMBER}20`, color: AMBER }}
        >
          Duraklat
        </div>
      </motion.div>
    </div>
  );
}

// ─── 4. Sector Benchmarking Tab ─────────────────────────────────────────────
function BenchmarkContent() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const metrics = [
    { label: 'ROAS', yours: 3.4, sector: 2.1, yourLabel: '3.4x', sectorLabel: '2.1x', yoursPercent: 85, sectorPercent: 52 },
    { label: 'CPA', yours: 38, sector: 52, yourLabel: '₺38', sectorLabel: '₺52', yoursPercent: 46, sectorPercent: 63, inverted: true },
    { label: 'CTR', yours: 2.8, sector: 1.9, yourLabel: '%2.8', sectorLabel: '%1.9', yoursPercent: 78, sectorPercent: 53 },
  ];

  return (
    <div ref={ref} className="p-5 md:p-6 space-y-4">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: i * 0.15, ease: EXPO_OUT }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-white/60">{metric.label}</span>
          </div>

          {/* Your bar */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-white/35 w-16 text-right shrink-0">Sizinki</span>
            <div className="flex-1 h-[14px] rounded-[3px] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <motion.div
                className="h-full rounded-[3px] flex items-center justify-end pr-2"
                style={{ backgroundColor: BLUE }}
                initial={{ width: '0%' }}
                animate={isInView ? { width: `${metric.yoursPercent}%` } : { width: '0%' }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: EXPO_OUT }}
              >
                <span className="text-[9px] font-semibold text-white/90">{metric.yourLabel}</span>
              </motion.div>
            </div>
          </div>

          {/* Sector bar */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-white/25 w-16 text-right shrink-0">Sektör Ort.</span>
            <div className="flex-1 h-[14px] rounded-[3px] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <motion.div
                className="h-full rounded-[3px] flex items-center justify-end pr-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                initial={{ width: '0%' }}
                animate={isInView ? { width: `${metric.sectorPercent}%` } : { width: '0%' }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.15, ease: EXPO_OUT }}
              >
                <span className="text-[9px] font-medium text-white/40">{metric.sectorLabel}</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Above sector badge */}
      <motion.div
        className="flex items-center justify-center gap-1.5 pt-1"
        initial={{ opacity: 0, y: 6 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 0.5, delay: 0.7, ease: EXPO_OUT }}
      >
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: `${GREEN}12`, border: `1px solid ${GREEN}20` }}
        >
          {/* Up arrow */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2L10 7H2L6 2Z" fill={GREEN} />
          </svg>
          <span className="text-[11px] font-medium" style={{ color: GREEN }}>
            Sektörün %62 üstündesiniz
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Tab content map ────────────────────────────────────────────────────────
const TAB_CONTENT: Record<TabId, React.FC> = {
  insights: DeepInsightsContent,
  creative: AICreativeContent,
  tree: CampaignTreeContent,
  benchmark: BenchmarkContent,
};

// ─── Main Component ─────────────────────────────────────────────────────────
export function ProductShowcase() {
  const t = useTranslations('landing');
  const [activeTab, setActiveTab] = useState<TabId>('insights');
  const ActiveContent = TAB_CONTENT[activeTab];

  return (
    <section className="py-24">
      <style dangerouslySetInnerHTML={{ __html: cssAnimations }} />
      <div className="max-w-5xl mx-auto px-6">
        {/* Section heading */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2
              className="text-[32px] font-bold text-[#1A1A1A] mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('showcase_heading')}
            </h2>
            <p className="text-[15px] text-[#6B7280]">
              {t('showcase_subtitle')}
            </p>
          </div>
        </ScrollReveal>

        {/* Tab bar */}
        <ScrollReveal delay={0.1}>
          <div className="flex justify-center mb-6">
            <div
              className="inline-flex items-center gap-1 p-1 rounded-xl overflow-x-auto max-w-full"
              style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: isActive ? '#fff' : 'transparent',
                      color: isActive ? '#1A1A1A' : '#6B7280',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      border: isActive ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
                    }}
                  >
                    <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Dark illustration frame */}
        <ScrollReveal delay={0.2}>
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              backgroundColor: '#0C0D14',
              minHeight: 320,
              boxShadow: '0 25px 80px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: EXPO_OUT }}
              >
                <ActiveContent />
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>

    </section>
  );
}

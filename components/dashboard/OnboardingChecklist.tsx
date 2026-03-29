'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, LayoutGrid, Settings2, BarChart3, Check, X } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { api } from '@/lib/api';

const STORAGE_KEY = 'megvax-onboarding-dismissed';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Link2;
  href: string;
  status: 'done' | 'current' | 'upcoming';
}

function buildSteps(hasConnection: boolean, hasAdAccount: boolean): OnboardingStep[] {
  // Step 1: done if user has at least one Meta connection
  const connectDone = hasConnection;
  // Step 2: done if user has at least one ad account selected
  const selectDone = hasAdAccount;
  // Step 3: current if previous steps done
  const strategyStatus = selectDone ? 'current' : 'upcoming';
  // Step 4: upcoming until strategy is set
  const reportStatus = 'upcoming';

  return [
    {
      id: 'connect',
      title: 'Hesap Bağla',
      description: 'Meta Business hesabınızı bağlayın',
      icon: Link2,
      href: '/app/accounts',
      status: connectDone ? 'done' : 'current',
    },
    {
      id: 'select',
      title: 'Reklam Hesabı Seç',
      description: 'Yönetmek istediğiniz hesapları seçin',
      icon: LayoutGrid,
      href: '/app/accounts',
      status: selectDone ? 'done' : connectDone ? 'current' : 'upcoming',
    },
    {
      id: 'strategy',
      title: 'Strateji Belirle',
      description: 'Optimizasyon tercihlerinizi yapılandırın',
      icon: Settings2,
      href: '/app/optimizations',
      status: strategyStatus as 'done' | 'current' | 'upcoming',
    },
    {
      id: 'report',
      title: 'İlk Raporu Gör',
      description: 'Dashboard verilerinizi inceleyin',
      icon: BarChart3,
      href: '/app/dashboard',
      status: reportStatus,
    },
  ];
}

export function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const [steps, setSteps] = useState<OnboardingStep[]>(() => buildSteps(false, false));

  // Check actual onboarding state from API
  useEffect(() => {
    if (dismissed) return;

    Promise.all([
      api<any[]>('/meta/connections').catch(() => []),
      api<any[]>('/meta/ad-accounts').catch(() => []),
    ]).then(([connections, adAccounts]) => {
      const hasConnection = Array.isArray(connections) && connections.length > 0;
      const hasAdAccount = Array.isArray(adAccounts) && adAccounts.length > 0;
      setSteps(buildSteps(hasConnection, hasAdAccount));
    });
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const completedCount = steps.filter((s) => s.status === 'done').length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card padding="none" className="relative overflow-hidden border-accent-primary/20">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
              <motion.div
                className="h-full bg-accent-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Kurulum Adımları
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {completedCount}/{steps.length} tamamlandı
                </span>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Kurulum adımlarını kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps */}
            <div className="px-6 pb-6 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {steps.map((step, index) => (
                  <StepItem key={step.id} step={step} index={index} />
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StepItem({ step, index }: { step: OnboardingStep; index: number }) {
  const Icon = step.icon;
  const isDone = step.status === 'done';
  const isCurrent = step.status === 'current';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.08 }}
    >
      <Link href={step.href} className="block group">
        <div
          className={`
            relative rounded-lg p-4 transition-all duration-200
            ${isDone
              ? 'bg-accent-primary/5 border border-accent-primary/15'
              : isCurrent
                ? 'bg-accent-primary/8 border-2 border-accent-primary/30 shadow-sm'
                : 'bg-gray-50 border border-gray-200'
            }
            ${isCurrent ? 'group-hover:shadow-md group-hover:border-accent-primary/50' : 'group-hover:bg-gray-100'}
          `}
        >
          {/* Step number + icon */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
                transition-all duration-200
                ${isDone
                  ? 'bg-accent-primary text-white'
                  : isCurrent
                    ? 'bg-accent-primary/15 text-accent-primary ring-2 ring-accent-primary/20'
                    : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {isDone ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <Icon
              className={`w-4 h-4 ${
                isDone
                  ? 'text-accent-primary'
                  : isCurrent
                    ? 'text-accent-primary'
                    : 'text-gray-400'
              }`}
            />
          </div>

          {/* Title + description */}
          <h4
            className={`text-sm font-semibold mb-0.5 ${
              isDone
                ? 'text-accent-primary'
                : isCurrent
                  ? 'text-gray-900'
                  : 'text-gray-500'
            }`}
          >
            {step.title}
          </h4>
          <p
            className={`text-xs leading-relaxed ${
              isDone ? 'text-accent-primary/60' : isCurrent ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            {step.description}
          </p>

          {/* Current step indicator */}
          {isCurrent && (
            <motion.div
              className="absolute -top-px -left-px -right-px h-0.5 bg-accent-primary rounded-t-lg"
              layoutId="currentStep"
            />
          )}
        </div>
      </Link>
    </motion.div>
  );
}

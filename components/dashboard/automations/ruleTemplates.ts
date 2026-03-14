import type { AutomationRule } from '@/types/dashboard';

export type AutomationRuleSource = 'template' | 'custom';

export interface AutomationRuleTemplate {
  id: string;
  title: string;
  description: string;
  defaultFrequency: string;
  condition: string;
  action: string;
  iconCategory: AutomationRule['iconCategory'];
}

export const automationRuleTemplates: AutomationRuleTemplate[] = [
  {
    id: 'tpl_roas_pause_ads',
    title: 'Pause ads if ROAS is low',
    description: 'Detects ads where ROAS dropped below a threshold in the last 3 days and suggests pausing them.',
    defaultFrequency: 'Daily',
    condition: 'ROAS < 1.2 (last 3 days)',
    action: 'Pause ads',
    iconCategory: 'alert',
  },
  {
    id: 'tpl_ctr_pause_ads',
    title: 'Pause ads if CTR is low',
    description: 'Suggests pausing ads with persistently low CTR (early signal of creative fatigue).',
    defaultFrequency: 'Daily',
    condition: 'CTR < 1.0% (last 3 days)',
    action: 'Pause ads',
    iconCategory: 'pause',
  },
  {
    id: 'tpl_spend_cap_pause_adset',
    title: 'Pause ad set if spend cap exceeded',
    description: 'Suggests pausing the ad set if daily spend reaches a certain limit.',
    defaultFrequency: 'Real-time',
    condition: 'Spend > ₺2,000 (today)',
    action: 'Pause ad set',
    iconCategory: 'budget',
  },
];

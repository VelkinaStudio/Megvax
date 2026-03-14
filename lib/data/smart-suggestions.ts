import {
  TrendingDown,
  Wallet,
  Eye,
  TrendingUp,
  Sparkles,
  Scale,
  Activity,
  Target,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

export type SmartSuggestionActionType = 
  | 'PAUSE_ADSET' 
  | 'PAUSE_AD' 
  | 'INCREASE_BUDGET' 
  | 'DECREASE_BUDGET' 
  | 'NOTIFICATION';

export type SmartSuggestionAction = {
  id: string;
  metaObjectId: string;
  metaObjectName: string;
  campaignId?: string;
  campaignName?: string;
  adsetId?: string;
  adsetName?: string;
  level: 'campaign' | 'adset' | 'ad';
  type: SmartSuggestionActionType;
  fromValue?: number;
  toValue?: number;
  reason: string;
  ruleKey: string;
  metricsSnapshot: {
    spend?: number;
    ctr?: number;
    cpc?: number;
    cpm?: number;
    frequency?: number;
    roas?: number;
    impressions?: number;
    score?: number;
  };
};

export type SmartSuggestionRule = {
  key: string;
  title: string;
  shortDescription: string;
  whatIs: string;
  whatDoes: string;
  algorithm: {
    title: string;
    steps: { label: string; description: string; color: string }[];
    example?: string;
  };
  icon: LucideIcon;
  category: 'performance' | 'budget' | 'creative' | 'health';
};

export const SMART_SUGGESTION_RULES: SmartSuggestionRule[] = [
  {
    key: 'low_ctr_creatives',
    title: 'Pause Low CTR Ads',
    shortDescription: 'Detects ads with low CTR and suggests pausing them.',
    whatIs: 'This suggestion detects ads that have been running for a long time but fail to reach the expected click-through rate. Ads that receive high impressions but low engagement may be using your budget inefficiently.',
    whatDoes: 'Automatically pauses ads that meet the defined criteria. This way, your budget is redirected to better-performing ads and your overall ROAS increases.',
    algorithm: {
      title: 'Algorithm',
      steps: [
        {
          label: 'Reliability Threshold',
          description: 'The ad must have at least 5,000 impressions to be statistically significant.',
          color: 'blue',
        },
        {
          label: 'Performance Limit',
          description: 'If CTR (Click-Through Rate) is below 1% despite these impressions, the rule is triggered.',
          color: 'red',
        },
      ],
      example: '"This ad was shown to 15,000 people but only 0.4% clicked — it\'s wasting budget." The rule works with this logic and suggests pausing.',
    },
    icon: TrendingDown,
    category: 'performance',
  },
  {
    key: 'high_cpc_adsets',
    title: 'High CPC / CPM Optimization',
    shortDescription: 'Detects ad sets with high click costs and suggests budget reduction.',
    whatIs: 'This suggestion finds ad sets with cost-per-click (CPC) above the target threshold. High cost usually indicates targeting issues or low-quality creatives.',
    whatDoes: 'Reduces the budget of high-CPC ad sets by 20% to minimize loss risk. If ROAS is low, these sets can be paused entirely.',
    algorithm: {
      title: 'Algorithm',
      steps: [
        {
          label: 'Median CPC Calculation',
          description: 'The CPC average of all active ad sets is calculated.',
          color: 'blue',
        },
        {
          label: 'Threshold Check',
          description: 'If CPC is more than 1.5x the median and ROAS < 1.2, the rule is triggered.',
          color: 'orange',
        },
        {
          label: 'Budget Reduction',
          description: 'Daily budget is reduced by 20%.',
          color: 'red',
        },
      ],
      example: '"This ad set\'s click cost (15.50 TL) is more than 1.5x the average (8.20 TL)."',
    },
    icon: Wallet,
    category: 'budget',
  },
  {
    key: 'creative_fatigue',
    title: 'Creative Fatigue (Frequency > 4)',
    shortDescription: 'Detects ads shown too many times to the same people.',
    whatIs: 'Ad fatigue occurs when the same ad is shown too many times to the same audience. When frequency exceeds 4, users start ignoring the ad and CTR drops.',
    whatDoes: 'Detects high-frequency ads and suggests pausing them. This prevents audience fatigue and preserves ad performance.',
    algorithm: {
      title: 'Algorithm',
      steps: [
        {
          label: 'Frequency Tracking',
          description: 'The average impression frequency of each ad is monitored.',
          color: 'blue',
        },
        {
          label: 'Fatigue Threshold',
          description: 'When frequency exceeds 4, ad fatigue risk begins.',
          color: 'orange',
        },
        {
          label: 'Pause Suggestion',
          description: 'Pausing or creative refresh is suggested for high-frequency ads.',
          color: 'red',
        },
      ],
      example: '"Frequency reached 4.5. Audience fatigue detected, click-through rate declining."',
    },
    icon: Eye,
    category: 'creative',
  },
  {
    key: 'scale_winners',
    title: 'Scale Winners',
    shortDescription: 'Safely increases the budget of high-ROAS ad sets.',
    whatIs: 'This suggestion detects "winning" ad sets with high ROAS (Return on Ad Spend). These sets generate more revenue for every TL spent.',
    whatDoes: 'Increases the daily budget of winning sets by 20%. This is the safest increase rate that won\'t disrupt Meta\'s learning phase.',
    algorithm: {
      title: 'Algorithm',
      steps: [
        {
          label: 'Profitability Criteria',
          description: 'Ad sets with ROAS above 2.0 are marked as "Winners".',
          color: 'green',
        },
        {
          label: 'Safe Scaling',
          description: 'Daily budget is increased by 20% (Meta\'s recommended safe limit).',
          color: 'blue',
        },
        {
          label: 'Learning Protection',
          description: 'Sets in the learning phase are not touched.',
          color: 'purple',
        },
      ],
      example: '"ROAS (4.2) meets the target. Budget can be safely increased from ₺1,000 to ₺1,200."',
    },
    icon: TrendingUp,
    category: 'budget',
  },
  {
    key: 'ai_creative_score',
    title: 'AI Creative Analysis',
    shortDescription: 'Analyzes visuals with AI and detects low-scoring creatives.',
    whatIs: 'This suggestion analyzes your ad visuals with AI and gives a score from 0-100. The score is calculated based on visual quality, text ratio, color contrast, and attention-grabbing factors.',
    whatDoes: 'Suggests refreshing or pausing creatives scoring below 60. Low-scoring visuals typically cause low CTR and high CPC.',
    algorithm: {
      title: 'Algorithm',
      steps: [
        {
          label: 'Visual Analysis',
          description: 'Visuals are scanned by AI: text ratio, brightness, composition are evaluated.',
          color: 'purple',
        },
        {
          label: 'Performance Correlation',
          description: 'Visual score is correlated with CTR and CPC data.',
          color: 'blue',
        },
        {
          label: 'Threshold Check',
          description: 'If score is below 60/100, a suggestion is generated.',
          color: 'orange',
        },
      ],
      example: '"AI Creative Score 45/100. Visual is too dark and text ratio is high."',
    },
    icon: Sparkles,
    category: 'creative',
  },
  {
    key: 'ai_budget_reallocation',
    title: 'AI Budget Reallocation',
    shortDescription: 'Takes budget from low-performing campaigns and transfers to high-performers.',
    whatIs: 'This suggestion analyzes your campaigns by performance and optimizes budget allocation. Budget is taken from "Losers" and transferred to "Winners".',
    whatDoes: 'Reduces budget by 20% for campaigns with ROAS < 1.0, increases by 20% for those with ROAS > 2.5. Total budget stays the same while efficiency increases.',
    algorithm: {
      title: 'Algorithm',
      steps: [
        {
          label: 'Loser Detection',
          description: 'Campaigns with ROAS < 1.0 are marked as "Losers".',
          color: 'red',
        },
        {
          label: 'Winner Detection',
          description: 'Campaigns with ROAS > 2.5 are marked as "Winners".',
          color: 'green',
        },
        {
          label: 'Budget Transfer',
          description: 'Losers get 20% reduction, winners get 20% increase.',
          color: 'blue',
        },
      ],
      example: '"Winter Collection campaign is losing money with ROAS 0.85. Budget reduced from ₺500 to ₺400 and transferred to Summer Sale campaign."',
    },
    icon: Scale,
    category: 'budget',
  },
  {
    key: 'account_health_checkup',
    title: 'Account Health Score',
    shortDescription: 'Analyzes your account 360° and detects critical issues.',
    whatIs: 'This suggestion evaluates the overall health of your ad account. Factors like rejected ads, sets stuck in learning phase, and pixel issues are analyzed.',
    whatDoes: 'Provides critical fix suggestions when health score drops below 70/100. Issues are listed by priority.',
    algorithm: {
      title: 'Algorithm',
      steps: [
        {
          label: 'Policy Check',
          description: 'Rejected ads are detected (-15 points/ad).',
          color: 'red',
        },
        {
          label: 'Learning Status',
          description: 'Sets stuck in learning phase are detected (-10 points/set).',
          color: 'orange',
        },
        {
          label: 'Conversion Signal',
          description: 'Pixel and conversion data is checked (-30 points if no signal).',
          color: 'purple',
        },
        {
          label: 'Frequency Analysis',
          description: 'Account-wide ad fatigue is checked (-20 points).',
          color: 'blue',
        },
      ],
      example: '"Account Health Score 65/100. 2 ads rejected and pixel data flow is irregular."',
    },
    icon: Activity,
    category: 'health',
  },
  {
    key: 'strategy_mode',
    title: 'Strategy Mode Optimization',
    shortDescription: 'Automatically adjusts all campaign budgets based on your selected mode.',
    whatIs: 'This suggestion lets you choose from three strategy modes: Conservative (risk minimize), Balanced (sustainable growth), Aggressive (fast scaling).',
    whatDoes: 'Automatically optimizes budgets and bids for all campaigns and ad sets based on the selected strategy.',
    algorithm: {
      title: 'Strategy Modes',
      steps: [
        {
          label: '🛡️ Conservative Mode',
          description: 'Cuts budget by 20% if ROAS below 1.5. Small increase only for ROAS > 3.0 sets.',
          color: 'blue',
        },
        {
          label: '⚖️ Balanced Mode',
          description: 'Scales 10% for ROAS above 2.0. Reduces 10% for low performance.',
          color: 'green',
        },
        {
          label: '🚀 Aggressive Mode',
          description: 'Scales 25% for ROAS above 1.2. Can go up to 40% for high performers.',
          color: 'orange',
        },
      ],
      example: '"Aggressive Mode active: Bids increased by 15% for sets with high click potential."',
    },
    icon: Target,
    category: 'budget',
  },
  {
    key: 'ai_creative_rotation',
    title: 'AI Creative Rotation',
    shortDescription: 'Automatically replaces declining visuals with new ones.',
    whatIs: 'This suggestion detects creatives whose performance is starting to decline to prevent ad blindness. It suggests automatic rotation when frequency rises and CTR drops.',
    whatDoes: 'Pauses fatigued creatives and enables testing of new variations. This ensures fresh content continuously reaches the target audience.',
    algorithm: {
      title: 'Algorithm',
      steps: [
        {
          label: 'Fatigue Detection',
          description: 'Frequency > 3.5 and CTR decline trend is detected.',
          color: 'orange',
        },
        {
          label: 'Performance Comparison',
          description: 'Last 7 days performance is compared with the previous period.',
          color: 'blue',
        },
        {
          label: 'Rotation Suggestion',
          description: 'Rotation or pausing is suggested for low-performing creatives.',
          color: 'green',
        },
      ],
      example: '"Ad fatigue started (Frequency > 3.5). Replacing with new variation."',
    },
    icon: RefreshCw,
    category: 'creative',
  },
];

export function generateMockActions(ruleKey: string): SmartSuggestionAction[] {
  const timestamp = Date.now();

  switch (ruleKey) {
    case 'low_ctr_creatives':
      return [
        {
          id: `mock_${timestamp}_1`,
          metaObjectId: 'ad_123',
          metaObjectName: 'Summer Collection - Video 1',
          campaignId: 'camp_1',
          campaignName: 'Summer Sale 2025',
          adsetId: 'adset_1',
          adsetName: 'Women Clothing - Broad Target',
          level: 'ad',
          type: 'PAUSE_AD',
          reason: 'Impressions (12,500) are high but CTR (0.45%) is below 1%.',
          ruleKey,
          metricsSnapshot: { spend: 450, ctr: 0.45, impressions: 12500 },
        },
        {
          id: `mock_${timestamp}_2`,
          metaObjectId: 'ad_124',
          metaObjectName: 'Red Dress Visual',
          campaignId: 'camp_1',
          campaignName: 'Summer Sale 2025',
          adsetId: 'adset_1',
          adsetName: 'Women Clothing - Broad Target',
          level: 'ad',
          type: 'PAUSE_AD',
          reason: 'Impressions (8,200) but CTR (0.62%) is below 1%.',
          ruleKey,
          metricsSnapshot: { spend: 280, ctr: 0.62, impressions: 8200 },
        },
      ];

    case 'high_cpc_adsets':
      return [
        {
          id: `mock_${timestamp}_3`,
          metaObjectId: 'adset_2',
          metaObjectName: 'Cart Abandoners (30 Days)',
          campaignId: 'camp_2',
          campaignName: 'Retargeting - Dynamic',
          level: 'adset',
          type: 'DECREASE_BUDGET',
          fromValue: 500,
          toValue: 400,
          reason: 'CPC (15.50 TL) is more than 1.5x the average (8.20 TL)',
          ruleKey,
          metricsSnapshot: { spend: 1200, cpc: 15.5, cpm: 45.0 },
        },
      ];

    case 'scale_winners':
      return [
        {
          id: `mock_${timestamp}_4`,
          metaObjectId: 'adset_3',
          metaObjectName: 'Women Clothing - Retargeting',
          campaignId: 'camp_3',
          campaignName: 'Summer Collection Launch',
          level: 'adset',
          type: 'INCREASE_BUDGET',
          fromValue: 1000,
          toValue: 1200,
          reason: 'ROAS (4.2) meets the target. Budget can be increased by 20%.',
          ruleKey,
          metricsSnapshot: { spend: 3500, roas: 4.2, ctr: 2.1 },
        },
        {
          id: `mock_${timestamp}_5`,
          metaObjectId: 'adset_3b',
          metaObjectName: 'Men Clothing - Interests',
          campaignId: 'camp_3',
          campaignName: 'Summer Collection Launch',
          level: 'adset',
          type: 'INCREASE_BUDGET',
          fromValue: 800,
          toValue: 960,
          reason: 'ROAS (3.5) meets the target. Budget can be increased by 20%.',
          ruleKey,
          metricsSnapshot: { spend: 2800, roas: 3.5, ctr: 1.9 },
        },
      ];

    case 'creative_fatigue':
      return [
        {
          id: `mock_${timestamp}_6`,
          metaObjectId: 'ad_201',
          metaObjectName: 'Summer Dress Campaign - Visual 1',
          campaignId: 'camp_summer_sale',
          campaignName: 'Summer Dresses',
          adsetId: 'adset_summer_1',
          adsetName: 'Women (25-45)',
          level: 'ad',
          type: 'PAUSE_AD',
          reason: 'Frequency reached 4.5. Audience fatigue detected.',
          ruleKey,
          metricsSnapshot: { spend: 600, frequency: 4.5, ctr: 1.1, impressions: 25000 },
        },
      ];

    case 'ai_creative_score':
      return [
        {
          id: `mock_${timestamp}_7`,
          metaObjectId: 'ad_125',
          metaObjectName: 'Static Visual - Blue',
          campaignId: 'camp_4',
          campaignName: 'Brand Awareness',
          adsetId: 'adset_4',
          adsetName: 'General Interests',
          level: 'ad',
          type: 'PAUSE_AD',
          reason: 'AI Creative Score 45/100. Visual is too dark and text ratio is high.',
          ruleKey,
          metricsSnapshot: { spend: 150, ctr: 0.3, impressions: 4000, score: 45 },
        },
      ];

    case 'ai_budget_reallocation':
      return [
        {
          id: `mock_${timestamp}_8`,
          metaObjectId: 'camp_loser_1',
          metaObjectName: 'Winter Collection - Broad Targeting',
          level: 'campaign',
          type: 'DECREASE_BUDGET',
          reason: 'ROAS < 1.0 (0.85). Budget is being spent inefficiently.',
          ruleKey,
          fromValue: 500,
          toValue: 400,
          metricsSnapshot: { spend: 1200, roas: 0.85, cpc: 12.5 },
        },
        {
          id: `mock_${timestamp}_9`,
          metaObjectId: 'camp_winner_1',
          metaObjectName: 'Summer Sale - Retargeting',
          level: 'campaign',
          type: 'INCREASE_BUDGET',
          reason: 'ROAS > 2.5 (3.40). High-performing campaign.',
          ruleKey,
          fromValue: 600,
          toValue: 720,
          metricsSnapshot: { spend: 2500, roas: 3.4, cpc: 3.2 },
        },
      ];

    case 'account_health_checkup':
      return [
        {
          id: `mock_${timestamp}_10`,
          metaObjectId: 'act_account',
          metaObjectName: 'Account Overall',
          level: 'adset',
          type: 'NOTIFICATION',
          reason: 'Account Health Score: 65/100.\n\nFindings:\n⚠️ 2 ads rejected (-30 Points)\n🎓 1 ad set stuck in learning phase (-10 Points)',
          ruleKey,
          metricsSnapshot: { spend: 15000, roas: 2.1, frequency: 3.5, score: 65 },
        },
      ];

    default:
      return [];
  }
}

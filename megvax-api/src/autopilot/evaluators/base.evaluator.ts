export interface EvaluatorAction {
  ruleType: string;
  entityType: 'CAMPAIGN' | 'ADSET' | 'AD';
  entityId: string;
  description: string;
  reason: Record<string, any>;
  changes: Record<string, any>;
  confidenceScore: number;
}

export interface EvaluatorContext {
  adAccountId: string;
  config: {
    pauseThresholds: { cpa_max: number; roas_min: number; frequency_max: number };
    scaleThresholds: { roas_min: number; conversions_min: number };
    budgetChangeMaxPercent: number;
    minSpendBeforeAction: number;
  };
  insights: Array<{
    entityType: string;
    entityId: string;
    date: Date;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpa: number;
    roas: number;
    frequency: number;
    revenue: number;
  }>;
  entities: {
    campaigns: Array<{ id: string; name: string; status: string; dailyBudget: number | null }>;
    adSets: Array<{ id: string; name: string; status: string; dailyBudget: number | null; campaignId: string }>;
    ads: Array<{ id: string; name: string; status: string; adSetId: string }>;
  };
}

export abstract class BaseEvaluator {
  abstract evaluate(ctx: EvaluatorContext): EvaluatorAction[];
}

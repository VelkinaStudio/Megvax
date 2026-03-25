export type MetricStatus = 'up' | 'down' | 'neutral';

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  trend: string; // e.g. "+12%"
  status: MetricStatus;
  description: string;
}

export type SuggestionActionType = 
  | 'pause' 
  | 'resume' 
  | 'increase_budget' 
  | 'decrease_budget' 
  | 'adjust_bid' 
  | 'review';

export interface SuggestionAction {
  type: SuggestionActionType;
  label: string; // Human readable: "Durdur", "Bütçeyi %20 artır"
  details: string; // Specific: "Günlük bütçe ₺250'den ₺300'e çıkarılacak"
  currentValue?: string;
  newValue?: string;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string; // Technical but simple
  impactLevel: 'High' | 'Medium' | 'Low';
  impactMetric: string; // e.g. "+45% Dönüşüm"
  action?: SuggestionAction;
  target?: {
    level: 'campaign' | 'adset' | 'ad';
    id: string;
    name: string;
  };
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'archived';
  spend: string;
  roas: string;
  conversions: number;
}

export interface OptimizationStrategy {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'waiting' | 'paused'; // 'Aktif', 'Başlamak İçin Bekleniyor', 'Pasif'
  iconCategory: 'performance' | 'budget' | 'creative' | 'health';
  lastCheck?: string;
}

export type OptimizationTargetLevel = 'campaign' | 'adset' | 'ad';

export type OptimizationTargetMode = 'all' | 'selected';

export interface OptimizationStrategySettings {
  targetLevel: OptimizationTargetLevel;
  targetMode: OptimizationTargetMode;
  targetIds: string[];
}

export interface AutomationRule {
  id: string;
  title: string;
  condition: string;
  action: string;
  frequency: string; // e.g. "Gerçek zamanlı", "Her gece 00:00"
  executionCount: number;
  status: 'active' | 'paused' | 'scheduled';
  iconCategory: 'alert' | 'budget' | 'pause' | 'bid';
  source?: 'template' | 'custom';
  templateId?: string;
}

export type AutomationTargetLevel = 'campaign' | 'adset' | 'ad';

export type AutomationTargetMode = 'all' | 'selected';

export interface AutomationRuleSettings {
  targetLevel: AutomationTargetLevel;
  targetMode: AutomationTargetMode;
  targetIds: string[];
}

export interface MetaAccount {
  id: string;
  name: string;
  accountId: string;
  status: 'connected' | 'error' | 'expired';
  lastSync: string;
  currency?: string;
  timezone?: string;
}

export interface AdSet {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'archived';
  campaignId: string;
  campaignName?: string;
  bidStrategy: 'lowest_cost' | 'bid_cap' | 'cost_cap';
  dailyBudget: string;
  spend: string;
  roas: string;
  conversions: number;
}

export interface Ad {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'archived';
  adSetId: string;
  adSetName?: string;
  previewUrl: string; // For now just a placeholder string or image URL
  ctr: string;
  spend: string;
  roas: string;
  conversions: number;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  action: string;
  entityName: string;
  details: string;
  type: 'success' | 'warning' | 'info';
}

export type InsightsLevel = 'account' | 'campaign' | 'adset' | 'ad';

export type InsightsBreakdownKey = 'placement' | 'age' | 'gender' | 'device';

export interface InsightsSummary {
  spend: number;
  roas: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  impressions?: number;
  reach?: number;
  frequency?: number;
}

export interface InsightsTimeseriesPoint {
  date: string;
  spend: number;
  roas: number;
  conversions: number;
  ctr: number;
}

export interface InsightsBreakdownRow {
  key: string;
  label: string;
  spend: number;
  roas: number;
  conversions: number;
  ctr: number;
}

export interface InsightsSingleResponse {
  level: InsightsLevel;
  entityId: string;
  summary: InsightsSummary;
  timeseries: InsightsTimeseriesPoint[];
  breakdowns: Record<InsightsBreakdownKey, InsightsBreakdownRow[]>;
}

export interface DailyMetric {
  date: string;       // YYYY-MM-DD
  dateLabel: string;  // "15 Mar" style for axis labels
  spend: number;
  roas: number;
  conversions: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
}

export interface CampaignMetric {
  name: string;
  spend: number;
  roas: number;
  conversions: number;
}

export interface PlanLimits {
  maxAdAccounts: number;
  maxTeamMembers: number;
  autopilot: 'none' | 'basic' | 'full' | 'full+custom';
  capi: boolean;
  apiAccess: boolean;
  apiRateLimit: number;
  maxScheduledReports: number;
  maxWebhooks: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  STARTER: {
    maxAdAccounts: 2,
    maxTeamMembers: 2,
    autopilot: 'basic',
    capi: false,
    apiAccess: false,
    apiRateLimit: 0,
    maxScheduledReports: 0,
    maxWebhooks: 0,
  },
  PRO: {
    maxAdAccounts: 10,
    maxTeamMembers: 10,
    autopilot: 'full',
    capi: true,
    apiAccess: true,
    apiRateLimit: 300,
    maxScheduledReports: 5,
    maxWebhooks: 5,
  },
  AGENCY: {
    maxAdAccounts: -1,
    maxTeamMembers: -1,
    autopilot: 'full+custom',
    capi: true,
    apiAccess: true,
    apiRateLimit: 1000,
    maxScheduledReports: -1,
    maxWebhooks: -1,
  },
};

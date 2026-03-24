import { SetMetadata } from '@nestjs/common';

export const PLANS_KEY = 'requiredPlans';
export const RequirePlan = (...plans: string[]) => SetMetadata(PLANS_KEY, plans);

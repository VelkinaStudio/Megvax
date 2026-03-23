import { BaseEvaluator, EvaluatorAction, EvaluatorContext } from './base.evaluator';

export class ScaleWinnerEvaluator extends BaseEvaluator {
  evaluate(ctx: EvaluatorContext): EvaluatorAction[] {
    const { config, insights, entities } = ctx;
    const { roas_min, conversions_min } = config.scaleThresholds;
    const { budgetChangeMaxPercent, minSpendBeforeAction } = config;
    const actions: EvaluatorAction[] = [];

    const grouped = new Map<string, typeof insights>();
    for (const i of insights) {
      const key = `${i.entityType}:${i.entityId}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(i);
    }

    for (const [key, rows] of grouped) {
      if (rows.length < 3) continue;

      const [entityType, entityId] = key.split(':');

      // Only campaigns and adsets have budgets
      if (entityType === 'AD') continue;

      const entityTypeMapped = entityType as 'CAMPAIGN' | 'ADSET';
      const entity =
        entityType === 'CAMPAIGN'
          ? entities.campaigns.find(c => c.id === entityId)
          : entities.adSets.find(a => a.id === entityId);

      if (!entity || entity.status !== 'ACTIVE' || !entity.dailyBudget) continue;

      const totalSpend = rows.reduce((s, r) => s + r.spend, 0);
      if (totalSpend < minSpendBeforeAction) continue;

      const avgRoas = rows.reduce((s, r) => s + r.roas, 0) / rows.length;
      const totalConversions = rows.reduce((s, r) => s + r.conversions, 0);

      if (avgRoas < roas_min || totalConversions < conversions_min) continue;

      // Confidence: more data and higher ROAS relative to threshold = higher confidence
      const dataFactor = Math.min(rows.length / 7, 1);
      const roasFactor = Math.min((avgRoas - roas_min) / roas_min, 1);
      const confidence = Math.min(0.90, 0.55 + dataFactor * 0.25 + roasFactor * 0.10);

      const newBudget = Math.round(entity.dailyBudget * (1 + budgetChangeMaxPercent / 100) * 100) / 100;

      actions.push({
        ruleType: 'SCALE_WINNER',
        entityType: entityTypeMapped,
        entityId,
        description: `Scale ${entityTypeMapped.toLowerCase()} "${entity.name}" — avg ROAS ${avgRoas.toFixed(2)} exceeds target ${roas_min}`,
        reason: { avgRoas, roas_min, totalConversions, conversions_min, daysAnalyzed: rows.length },
        changes: {
          field: 'daily_budget',
          from: String(entity.dailyBudget),
          to: String(newBudget),
          increasePercent: budgetChangeMaxPercent,
        },
        confidenceScore: Math.round(confidence * 100) / 100,
      });
    }

    return actions;
  }
}

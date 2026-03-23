import { BaseEvaluator, EvaluatorAction, EvaluatorContext } from './base.evaluator';

export class PauseUnderperformerEvaluator extends BaseEvaluator {
  evaluate(ctx: EvaluatorContext): EvaluatorAction[] {
    const { config, insights, entities } = ctx;
    const { cpa_max } = config.pauseThresholds;
    const { minSpendBeforeAction } = config;
    const actions: EvaluatorAction[] = [];

    // Group insights by entityType + entityId
    const grouped = new Map<string, typeof insights>();
    for (const i of insights) {
      const key = `${i.entityType}:${i.entityId}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(i);
    }

    const activeEntityIds = new Set([
      ...entities.campaigns.map(c => c.id),
      ...entities.adSets.map(a => a.id),
      ...entities.ads.map(a => a.id),
    ]);

    for (const [key, rows] of grouped) {
      if (rows.length < 3) continue;

      const [entityType, entityId] = key.split(':');
      if (!activeEntityIds.has(entityId)) continue;

      const totalSpend = rows.reduce((s, r) => s + r.spend, 0);
      if (totalSpend < minSpendBeforeAction) continue;

      const avgCpa = rows.reduce((s, r) => s + r.cpa, 0) / rows.length;
      if (avgCpa <= cpa_max) continue;

      // Consistency: how many days exceeded threshold
      const badDays = rows.filter(r => r.cpa > cpa_max).length;
      const consistency = badDays / rows.length;
      const confidence = Math.min(0.95, 0.5 + consistency * 0.3 + Math.min(rows.length / 10, 0.15));

      const entityTypeMapped = entityType as 'CAMPAIGN' | 'ADSET' | 'AD';
      const entityName = this.getEntityName(entityId, entityTypeMapped, entities);

      actions.push({
        ruleType: 'PAUSE_UNDERPERFORMER',
        entityType: entityTypeMapped,
        entityId,
        description: `Pause ${entityTypeMapped.toLowerCase()} "${entityName}" — avg CPA ${avgCpa.toFixed(2)} exceeds max ${cpa_max}`,
        reason: { avgCpa, cpa_max, totalSpend, daysAnalyzed: rows.length, badDays },
        changes: { field: 'status', from: 'ACTIVE', to: 'PAUSED' },
        confidenceScore: Math.round(confidence * 100) / 100,
      });
    }

    return actions;
  }

  private getEntityName(
    entityId: string,
    entityType: 'CAMPAIGN' | 'ADSET' | 'AD',
    entities: EvaluatorContext['entities'],
  ): string {
    if (entityType === 'CAMPAIGN') return entities.campaigns.find(c => c.id === entityId)?.name ?? entityId;
    if (entityType === 'ADSET') return entities.adSets.find(a => a.id === entityId)?.name ?? entityId;
    return entities.ads.find(a => a.id === entityId)?.name ?? entityId;
  }
}

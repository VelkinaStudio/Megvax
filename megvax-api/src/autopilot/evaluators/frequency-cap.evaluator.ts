import { BaseEvaluator, EvaluatorAction, EvaluatorContext } from './base.evaluator';

export class FrequencyCapEvaluator extends BaseEvaluator {
  evaluate(ctx: EvaluatorContext): EvaluatorAction[] {
    const { config, insights, entities } = ctx;
    const { frequency_max } = config.pauseThresholds;
    const actions: EvaluatorAction[] = [];

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

      const avgFrequency = rows.reduce((s, r) => s + r.frequency, 0) / rows.length;
      if (avgFrequency <= frequency_max) continue;

      // Frequency cap is objective — confidence is high, proportional to how far over the cap
      const overageRatio = (avgFrequency - frequency_max) / frequency_max;
      const confidence = Math.min(0.97, 0.75 + Math.min(overageRatio * 0.15, 0.22));

      const entityTypeMapped = entityType as 'CAMPAIGN' | 'ADSET' | 'AD';
      const entityName = this.getEntityName(entityId, entityTypeMapped, entities);

      actions.push({
        ruleType: 'FREQUENCY_CAP_EXCEEDED',
        entityType: entityTypeMapped,
        entityId,
        description: `Pause ${entityTypeMapped.toLowerCase()} "${entityName}" — avg frequency ${avgFrequency.toFixed(2)} exceeds cap ${frequency_max}`,
        reason: { avgFrequency, frequency_max, daysAnalyzed: rows.length, overageRatio },
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

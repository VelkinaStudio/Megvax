import { BaseEvaluator, EvaluatorAction, EvaluatorContext } from './base.evaluator';

interface HourlyBreakdown {
  hour: number;
  conversions: number;
  spend: number;
  roas: number;
}

export class ScheduleOptimizeEvaluator extends BaseEvaluator {
  evaluate(ctx: EvaluatorContext): EvaluatorAction[] {
    const { insights, entities } = ctx;
    const actions: EvaluatorAction[] = [];

    // Only act on adsets (scheduling is typically set at adset level)
    for (const adSet of entities.adSets) {
      const rows = insights.filter(i => i.entityType === 'ADSET' && i.entityId === adSet.id);
      if (rows.length < 3) continue;

      // Look for hourly breakdown data in the insight rows
      const hourlyData: HourlyBreakdown[] = [];
      for (const row of rows) {
        const breakdowns = (row as any).breakdowns as any;
        if (!breakdowns?.hourly_stats_aggregated_by_advertiser_time_zone) continue;

        for (const hourRow of breakdowns.hourly_stats_aggregated_by_advertiser_time_zone) {
          const hour = parseInt(hourRow.hourly_stats_aggregated_by_advertiser_time_zone, 10);
          if (isNaN(hour)) continue;

          const existing = hourlyData.find(h => h.hour === hour);
          const spend = Number(hourRow.spend || 0);
          const conversions = Number(hourRow.actions?.find((a: any) => a.action_type === 'offsite_conversion')?.value || 0);
          const roas = spend > 0 ? (Number(hourRow.purchase_roas?.[0]?.value || 0)) : 0;

          if (existing) {
            existing.spend += spend;
            existing.conversions += conversions;
            existing.roas = (existing.roas + roas) / 2;
          } else {
            hourlyData.push({ hour, conversions, spend, roas });
          }
        }
      }

      if (hourlyData.length < 8) continue; // not enough hourly data

      // Find best and worst performing hours
      const sorted = [...hourlyData].sort((a, b) => b.roas - a.roas);
      const topHours = sorted.slice(0, Math.ceil(sorted.length * 0.4)).map(h => h.hour);
      const worstHours = sorted.slice(-Math.ceil(sorted.length * 0.3)).map(h => h.hour);

      const avgTopRoas = sorted.slice(0, topHours.length).reduce((s, h) => s + h.roas, 0) / topHours.length;
      const avgWorstRoas = sorted.slice(-worstHours.length).reduce((s, h) => s + h.roas, 0) / worstHours.length;

      if (avgTopRoas <= avgWorstRoas * 1.5) continue; // not enough differentiation

      // Lower confidence — this is speculative optimization
      const confidence = Math.min(0.65, 0.40 + Math.min(hourlyData.length / 24, 0.25));

      actions.push({
        ruleType: 'SCHEDULE_OPTIMIZE',
        entityType: 'ADSET',
        entityId: adSet.id,
        description: `Optimize ad schedule for adset "${adSet.name}" — top hours show ${avgTopRoas.toFixed(2)}x ROAS vs ${avgWorstRoas.toFixed(2)}x in low hours`,
        reason: { topHours, worstHours, avgTopRoas, avgWorstRoas, hoursAnalyzed: hourlyData.length },
        changes: {
          field: 'ad_schedule',
          recommendedActiveHours: topHours.sort((a, b) => a - b),
          recommendedPauseHours: worstHours.sort((a, b) => a - b),
        },
        confidenceScore: Math.round(confidence * 100) / 100,
      });
    }

    return actions;
  }
}

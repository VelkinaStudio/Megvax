import { BaseEvaluator, EvaluatorAction, EvaluatorContext } from './base.evaluator';

interface CampaignSummary {
  id: string;
  name: string;
  dailyBudget: number;
  avgRoas: number;
  totalSpend: number;
  daysWithData: number;
}

export class ReallocateBudgetEvaluator extends BaseEvaluator {
  evaluate(ctx: EvaluatorContext): EvaluatorAction[] {
    const { config, insights, entities } = ctx;
    const { minSpendBeforeAction } = config;
    const actions: EvaluatorAction[] = [];

    // Build per-campaign summaries
    const summaries: CampaignSummary[] = [];

    for (const campaign of entities.campaigns) {
      if (!campaign.dailyBudget) continue;

      const rows = insights.filter(i => i.entityType === 'CAMPAIGN' && i.entityId === campaign.id);
      if (rows.length < 3) continue;

      const totalSpend = rows.reduce((s, r) => s + r.spend, 0);
      if (totalSpend < minSpendBeforeAction) continue;

      const avgRoas = rows.reduce((s, r) => s + r.roas, 0) / rows.length;
      summaries.push({ id: campaign.id, name: campaign.name, dailyBudget: campaign.dailyBudget, avgRoas, totalSpend, daysWithData: rows.length });
    }

    if (summaries.length < 2) return actions;

    // Sort by ROAS — pair best vs worst
    summaries.sort((a, b) => b.avgRoas - a.avgRoas);

    const winners = summaries.slice(0, Math.ceil(summaries.length / 2));
    const losers = summaries.slice(Math.ceil(summaries.length / 2));

    for (const loser of losers) {
      for (const winner of winners) {
        if (winner.avgRoas <= loser.avgRoas) continue;
        if (loser.dailyBudget <= 0) continue;

        // Move up to budgetChangeMaxPercent of loser budget to winner (zero-sum)
        const transferAmount = Math.round(loser.dailyBudget * (config.budgetChangeMaxPercent / 100) * 100) / 100;
        if (transferAmount < 1) continue;

        const confidence = Math.min(0.80, 0.45 + Math.min((winner.avgRoas - loser.avgRoas) / winner.avgRoas, 0.35));

        actions.push({
          ruleType: 'REALLOCATE_BUDGET',
          entityType: 'CAMPAIGN',
          entityId: loser.id,
          description: `Reallocate $${transferAmount} from "${loser.name}" (ROAS ${loser.avgRoas.toFixed(2)}) to "${winner.name}" (ROAS ${winner.avgRoas.toFixed(2)})`,
          reason: {
            fromCampaignId: loser.id,
            fromCampaignRoas: loser.avgRoas,
            toCampaignId: winner.id,
            toCampaignRoas: winner.avgRoas,
            transferAmount,
          },
          changes: {
            field: 'daily_budget',
            from: String(loser.dailyBudget),
            to: String(Math.round((loser.dailyBudget - transferAmount) * 100) / 100),
            transferTo: winner.id,
            transferAmount,
            newWinnerBudget: Math.round((winner.dailyBudget + transferAmount) * 100) / 100,
          },
          confidenceScore: Math.round(confidence * 100) / 100,
        });

        break; // one pairing per loser
      }
    }

    return actions;
  }
}

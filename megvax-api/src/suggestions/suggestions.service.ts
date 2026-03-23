import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { SuggestionQueryDto } from './dto/suggestion-query.dto';

@Injectable()
export class SuggestionsService {
  constructor(
    private prisma: PrismaService,
    private campaignsService: CampaignsService,
  ) {}

  async getSuggestions(workspaceId: string, query: SuggestionQueryDto) {
    await this.verifyAccountAccess(workspaceId, query.accountId);
    const limit = query.limit || 25;
    const where: any = { adAccountId: query.accountId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    const items = await this.prisma.suggestion.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    return { data, cursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async applySuggestion(workspaceId: string, suggestionId: string) {
    const suggestion = await this.prisma.suggestion.findUniqueOrThrow({
      where: { id: suggestionId },
      include: { adAccount: true },
    });
    if (suggestion.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (suggestion.status !== 'PENDING') throw new Error('Suggestion is not pending');

    const action = suggestion.action as Record<string, any>;

    // Execute the action based on type
    if (action.type === 'patch_campaign') {
      await this.campaignsService.updateCampaign(workspaceId, suggestion.entityId, action.params);
    } else if (action.type === 'pause_campaign') {
      await this.campaignsService.pauseCampaign(workspaceId, suggestion.entityId);
    }
    // 'review' type requires no automated action

    return this.prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status: 'APPLIED', appliedAt: new Date() },
    });
  }

  async dismissSuggestion(workspaceId: string, suggestionId: string, reason?: string) {
    const suggestion = await this.prisma.suggestion.findUniqueOrThrow({
      where: { id: suggestionId },
      include: { adAccount: true },
    });
    if (suggestion.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (suggestion.status !== 'PENDING') throw new Error('Suggestion is not pending');

    return this.prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status: 'DISMISSED', dismissedAt: new Date(), dismissReason: reason || null },
    });
  }

  async generateSuggestions(adAccountId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch 7-day campaign-level insights
    const insights = await this.prisma.insightSnapshot.findMany({
      where: {
        adAccountId,
        entityType: 'CAMPAIGN',
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'desc' },
    });

    if (!insights.length) return { created: 0 };

    // Aggregate by campaign
    const campaignMap = new Map<string, { spend: number; revenue: number; conversions: number; impressions: number; clicks: number; frequency: number; days: number }>();

    for (const row of insights) {
      const existing = campaignMap.get(row.entityId) || {
        spend: 0, revenue: 0, conversions: 0, impressions: 0, clicks: 0, frequency: 0, days: 0,
      };
      existing.spend += Number(row.spend);
      existing.revenue += Number(row.revenue);
      existing.conversions += row.conversions;
      existing.impressions += row.impressions;
      existing.clicks += row.clicks;
      existing.frequency = Math.max(existing.frequency, Number(row.frequency));
      existing.days += 1;
      campaignMap.set(row.entityId, existing);
    }

    const suggestions: Array<{
      adAccountId: string;
      entityType: 'CAMPAIGN';
      entityId: string;
      type: 'BUDGET' | 'HEALTH';
      title: string;
      description: string;
      impact: Record<string, any>;
      action: Record<string, any>;
    }> = [];

    for (const [campaignId, stats] of campaignMap) {
      const roas = stats.spend > 0 ? stats.revenue / stats.spend : 0;
      const cpa = stats.conversions > 0 ? stats.spend / stats.conversions : Infinity;
      const ctr = stats.impressions > 0 ? stats.clicks / stats.impressions : 0;

      // BUDGET suggestion: high ROAS campaigns deserve more budget
      if (roas >= 2.0 && stats.conversions >= 5) {
        suggestions.push({
          adAccountId,
          entityType: 'CAMPAIGN',
          entityId: campaignId,
          type: 'BUDGET',
          title: 'Scale high-performing campaign',
          description: `Campaign has ${roas.toFixed(1)}x ROAS over 7 days with ${stats.conversions} conversions. Consider increasing daily budget by 20%.`,
          impact: { metric: 'roas', estimatedChange: '+20% spend', confidence: 0.7 },
          action: { type: 'review', params: {} },
        });
      }

      // BUDGET suggestion: low ROAS campaigns wasting spend
      if (roas < 0.5 && stats.spend > 50) {
        suggestions.push({
          adAccountId,
          entityType: 'CAMPAIGN',
          entityId: campaignId,
          type: 'BUDGET',
          title: 'Reduce budget on underperforming campaign',
          description: `Campaign has only ${roas.toFixed(2)}x ROAS with $${stats.spend.toFixed(0)} spent over 7 days. Consider reducing budget or pausing.`,
          impact: { metric: 'roas', estimatedChange: '-50% waste', confidence: 0.8 },
          action: { type: 'pause_campaign', params: {} },
        });
      }

      // HEALTH suggestion: high frequency
      if (stats.frequency > 4) {
        suggestions.push({
          adAccountId,
          entityType: 'CAMPAIGN',
          entityId: campaignId,
          type: 'HEALTH',
          title: 'High ad frequency detected',
          description: `Frequency reached ${stats.frequency.toFixed(1)}. Audience fatigue may be setting in — creative refresh or audience expansion recommended.`,
          impact: { metric: 'frequency', estimatedChange: 'reduce fatigue', confidence: 0.6 },
          action: { type: 'review', params: {} },
        });
      }

      // HEALTH suggestion: very low CTR
      if (ctr < 0.005 && stats.impressions > 1000) {
        suggestions.push({
          adAccountId,
          entityType: 'CAMPAIGN',
          entityId: campaignId,
          type: 'HEALTH',
          title: 'Low click-through rate',
          description: `CTR is ${(ctr * 100).toFixed(2)}% across ${stats.impressions.toLocaleString()} impressions. Creative or targeting may need adjustment.`,
          impact: { metric: 'ctr', estimatedChange: 'improve engagement', confidence: 0.65 },
          action: { type: 'review', params: {} },
        });
      }
    }

    if (!suggestions.length) return { created: 0 };

    // Deduplicate: skip suggestions that already exist as PENDING for the same entity+type
    const existingPending = await this.prisma.suggestion.findMany({
      where: {
        adAccountId,
        status: 'PENDING',
        entityId: { in: suggestions.map((s) => s.entityId) },
        type: { in: suggestions.map((s) => s.type) },
      },
      select: { entityId: true, type: true },
    });

    const existingKeys = new Set(existingPending.map((e) => `${e.entityId}:${e.type}`));
    const newSuggestions = suggestions.filter((s) => !existingKeys.has(`${s.entityId}:${s.type}`));

    if (!newSuggestions.length) return { created: 0 };

    const result = await this.prisma.suggestion.createMany({ data: newSuggestions });
    return { created: result.count };
  }

  private async verifyAccountAccess(workspaceId: string, accountId: string) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');
  }
}

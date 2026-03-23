import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { PauseUnderperformerEvaluator } from './evaluators/pause-underperformer.evaluator';
import { ScaleWinnerEvaluator } from './evaluators/scale-winner.evaluator';
import { ReallocateBudgetEvaluator } from './evaluators/reallocate-budget.evaluator';
import { FrequencyCapEvaluator } from './evaluators/frequency-cap.evaluator';
import { ScheduleOptimizeEvaluator } from './evaluators/schedule-optimize.evaluator';
import { BaseEvaluator, EvaluatorContext, EvaluatorAction } from './evaluators/base.evaluator';

@Processor('autopilot', { concurrency: 5 })
export class AutopilotProcessor extends WorkerHost {
  private readonly logger = new Logger(AutopilotProcessor.name);
  private readonly evaluators: BaseEvaluator[];

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private notificationsService: NotificationsService,
    private campaignsService: CampaignsService,
  ) {
    super();
    this.evaluators = [
      new PauseUnderperformerEvaluator(),
      new ScaleWinnerEvaluator(),
      new ReallocateBudgetEvaluator(),
      new FrequencyCapEvaluator(),
      new ScheduleOptimizeEvaluator(),
    ];
  }

  async process(job: Job<{ adAccountId: string; workspaceId: string }>) {
    const { adAccountId, workspaceId } = job.data;
    const lockKey = `autopilot:lock:${adAccountId}`;

    // Acquire distributed lock (TTL 10min)
    const locked = await this.redis.acquireLock(lockKey, 600);
    if (!locked) {
      this.logger.warn(`Lock held for account ${adAccountId}, re-queuing`);
      throw new Error('LOCK_HELD'); // BullMQ will retry
    }

    try {
      // 1. Check autopilotEnabled flag
      const account = await this.prisma.adAccount.findUnique({ where: { id: adAccountId } });
      if (!account?.autopilotEnabled) {
        this.logger.log(`Autopilot disabled for account ${adAccountId}, skipping`);
        return;
      }

      // 2. Load config
      const config = await this.prisma.autopilotConfig.findUnique({ where: { adAccountId } });
      if (!config) {
        this.logger.log(`No autopilot config for account ${adAccountId}, skipping`);
        return;
      }

      // 3. Load recent insights (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const insights = await this.prisma.insightSnapshot.findMany({
        where: { adAccountId, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'desc' },
      });

      // 4. Load active entities
      const [campaigns, adSets, ads] = await Promise.all([
        this.prisma.campaign.findMany({
          where: { adAccountId, status: 'ACTIVE', deletedAt: null },
          select: { id: true, name: true, status: true, dailyBudget: true },
        }),
        this.prisma.adSet.findMany({
          where: { adAccountId, status: 'ACTIVE', deletedAt: null },
          select: { id: true, name: true, status: true, dailyBudget: true, campaignId: true },
        }),
        this.prisma.ad.findMany({
          where: { adAccountId, status: 'ACTIVE', deletedAt: null },
          select: { id: true, name: true, status: true, adSetId: true },
        }),
      ]);

      // 5. Build evaluator context — Decimal fields must be coerced to Number
      const ctx: EvaluatorContext = {
        adAccountId,
        config: {
          pauseThresholds: config.pauseThresholds as any,
          scaleThresholds: config.scaleThresholds as any,
          budgetChangeMaxPercent: config.budgetChangeMaxPercent,
          minSpendBeforeAction: Number(config.minSpendBeforeAction),
        },
        insights: insights.map(i => ({
          entityType: i.entityType,
          entityId: i.entityId,
          date: i.date,
          spend: Number(i.spend),
          impressions: i.impressions,
          clicks: i.clicks,
          conversions: i.conversions,
          ctr: Number(i.ctr),
          cpa: Number(i.cpa),
          roas: Number(i.roas),
          frequency: Number(i.frequency),
          revenue: Number(i.revenue),
        })),
        entities: {
          campaigns: campaigns.map(c => ({ ...c, dailyBudget: c.dailyBudget ? Number(c.dailyBudget) : null })),
          adSets: adSets.map(a => ({ ...a, dailyBudget: a.dailyBudget ? Number(a.dailyBudget) : null })),
          ads: ads.map(a => ({ ...a, adSetId: a.adSetId })),
        },
      };

      // 6. Run all evaluators
      const allActions: EvaluatorAction[] = [];
      for (const evaluator of this.evaluators) {
        try {
          const actions = evaluator.evaluate(ctx);
          allActions.push(...actions);
        } catch (err) {
          this.logger.error(`Evaluator ${evaluator.constructor.name} failed: ${err}`);
        }
      }

      // 7. Process actions by tier
      const actionTiers = config.actionTiers as Record<string, string>;
      for (const action of allActions) {
        const tier = actionTiers[action.ruleType] || 'SUGGEST_WAIT';

        const dbAction = await this.prisma.autopilotAction.create({
          data: {
            adAccountId,
            ruleType: action.ruleType as any,
            entityType: action.entityType as any,
            entityId: action.entityId,
            tier: tier as any,
            description: action.description,
            reason: action.reason,
            changes: action.changes,
            confidenceScore: action.confidenceScore,
            status: tier === 'AUTO' ? 'EXECUTED' : tier === 'SUGGEST_ACT' ? 'SCHEDULED' : 'PENDING',
            scheduledFor: tier === 'SUGGEST_ACT'
              ? new Date(Date.now() + config.suggestActDelayMinutes * 60 * 1000)
              : undefined,
            executedAt: tier === 'AUTO' ? new Date() : undefined,
          },
        });

        // For AUTO tier, execute immediately via CampaignsService
        if (tier === 'AUTO') {
          try {
            await this.executeAction(action, adAccountId, workspaceId);
          } catch (err) {
            await this.prisma.autopilotAction.update({
              where: { id: dbAction.id },
              data: { status: 'FAILED', errorMessage: String(err) },
            });
            this.logger.error(`AUTO action failed: ${err}`);
          }
        }

        // Create notification for SUGGEST_ACT and SUGGEST_WAIT
        if (tier !== 'AUTO') {
          const members = await this.prisma.workspaceMember.findMany({
            where: { workspace: { adAccounts: { some: { id: adAccountId } } }, role: { in: ['OWNER', 'ADMIN'] } },
            select: { userId: true },
          });
          for (const member of members) {
            await this.notificationsService.create(member.userId, workspaceId, {
              type: 'AUTOPILOT_ACTION',
              title: tier === 'SUGGEST_ACT' ? 'Otopilot eylemi planlandı' : 'Otopilot önerisi bekliyor',
              body: action.description,
              data: { actionId: dbAction.id, tier, entityId: action.entityId },
            });
          }
        }
      }

      this.logger.log(`Autopilot processed ${allActions.length} actions for account ${adAccountId}`);
    } finally {
      await this.redis.releaseLock(lockKey);
    }
  }

  // Execute an autopilot action by calling the appropriate CampaignsService method
  private async executeAction(action: EvaluatorAction, adAccountId: string, workspaceId: string) {
    const changes = action.changes as { field: string; from: string; to: string };
    if (changes.field === 'status' && changes.to === 'PAUSED') {
      if (action.entityType === 'CAMPAIGN') await this.campaignsService.pauseCampaign(workspaceId, action.entityId);
      else if (action.entityType === 'ADSET') await this.campaignsService.pauseAdSet(workspaceId, action.entityId);
      else if (action.entityType === 'AD') await this.campaignsService.pauseAd(workspaceId, action.entityId);
    } else if (changes.field === 'status' && changes.to === 'ACTIVE') {
      if (action.entityType === 'CAMPAIGN') await this.campaignsService.resumeCampaign(workspaceId, action.entityId);
      else if (action.entityType === 'ADSET') await this.campaignsService.resumeAdSet(workspaceId, action.entityId);
      else if (action.entityType === 'AD') await this.campaignsService.resumeAd(workspaceId, action.entityId);
    } else if (changes.field === 'daily_budget') {
      if (action.entityType === 'CAMPAIGN') await this.campaignsService.updateCampaign(workspaceId, action.entityId, { dailyBudget: Number(changes.to) });
      else if (action.entityType === 'ADSET') await this.campaignsService.updateAdSet(workspaceId, action.entityId, { dailyBudget: Number(changes.to) });
    }
  }
}

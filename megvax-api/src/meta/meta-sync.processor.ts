import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetaApiClient } from './meta-api.client';
import { EncryptionService } from './encryption.service';
import { RedisService } from '../redis/redis.service';

interface SyncJobData {
  adAccountId: string;
  workspaceId: string;
}

@Processor('meta-sync', {
  concurrency: 10,
  limiter: { max: 20, duration: 60000 },
})
export class MetaSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(MetaSyncProcessor.name);

  constructor(
    private prisma: PrismaService,
    private metaApi: MetaApiClient,
    private encryption: EncryptionService,
    private redis: RedisService,
  ) {
    super();
  }

  async process(job: Job<SyncJobData>): Promise<any> {
    const { adAccountId } = job.data;
    const lockKey = `meta-sync:lock:${adAccountId}`;

    const locked = await this.redis.acquireLock(lockKey, 900);
    if (!locked) {
      this.logger.warn(`Skipping sync for ${adAccountId} — lock held`);
      return { skipped: true };
    }

    try {
      const account = await this.prisma.adAccount.findUniqueOrThrow({
        where: { id: adAccountId },
        include: { metaConnection: true },
      });

      const accessToken = this.encryption.decrypt(account.metaConnection.accessToken);
      const metaAccountId = account.metaAccountId;

      await job.updateProgress(10);

      // 1. Sync campaigns
      const campaigns = await this.metaApi.getCampaigns(metaAccountId, accessToken);
      for (const c of campaigns) {
        await this.prisma.campaign.upsert({
          where: {
            adAccountId_metaCampaignId: { adAccountId, metaCampaignId: c.id },
          },
          update: {
            name: c.name,
            status: this.mapStatus(c.status),
            objective: c.objective,
            buyingType: c.buying_type,
            dailyBudget: c.daily_budget ? Number(c.daily_budget) / 100 : null,
            lifetimeBudget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : null,
            bidStrategy: c.bid_strategy,
            metaRaw: c,
            lastSyncAt: new Date(),
          },
          create: {
            adAccountId,
            metaCampaignId: c.id,
            name: c.name,
            status: this.mapStatus(c.status),
            objective: c.objective,
            buyingType: c.buying_type,
            dailyBudget: c.daily_budget ? Number(c.daily_budget) / 100 : null,
            lifetimeBudget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : null,
            bidStrategy: c.bid_strategy,
            metaRaw: c,
            lastSyncAt: new Date(),
          },
        });
      }
      await job.updateProgress(40);

      // 2. Sync ad sets
      const adSets = await this.metaApi.getAdSets(metaAccountId, accessToken);
      for (const adSetData of adSets) {
        const campaign = await this.prisma.campaign.findFirst({
          where: { adAccountId, metaCampaignId: adSetData.campaign_id },
        });
        if (!campaign) continue;

        await this.upsertAdSet(adAccountId, campaign.id, adSetData);
      }
      await job.updateProgress(60);

      // 3. Sync ads
      const ads = await this.metaApi.getAds(metaAccountId, accessToken);
      for (const ad of ads) {
        const adSet = await this.prisma.adSet.findFirst({
          where: { adAccountId, metaAdSetId: ad.adset_id },
        });
        if (!adSet) continue;

        await this.upsertAd(adAccountId, adSet.id, ad);
      }
      await job.updateProgress(80);

      // 4. Sync insights (last 3 days)
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const dateFrom = threeDaysAgo.toISOString().split('T')[0];
      const dateTo = today.toISOString().split('T')[0];

      for (const level of ['campaign', 'adset', 'ad'] as const) {
        const insights = await this.metaApi.getInsights(metaAccountId, accessToken, dateFrom, dateTo, level);
        for (const row of insights) {
          await this.upsertInsight(adAccountId, row, level);
        }
      }

      // 5. Update lastSyncAt
      await this.prisma.adAccount.update({
        where: { id: adAccountId },
        data: { lastSyncAt: new Date(), lastSyncError: null },
      });

      await job.updateProgress(100);
      this.logger.log(`Sync complete for account ${metaAccountId}: ${campaigns.length} campaigns, ${adSets.length} adsets, ${ads.length} ads`);

      return { campaigns: campaigns.length, adSets: adSets.length, ads: ads.length };
    } catch (error) {
      this.logger.error(`Sync failed for ${adAccountId}: ${(error as Error).message}`);
      await this.prisma.adAccount.update({
        where: { id: adAccountId },
        data: { lastSyncError: (error as Error).message },
      });
      throw error;
    } finally {
      await this.redis.releaseLock(lockKey);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Meta sync job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`);
  }

  private mapStatus(metaStatus: string): 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' {
    const map: Record<string, 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED'> = {
      ACTIVE: 'ACTIVE',
      PAUSED: 'PAUSED',
      DELETED: 'DELETED',
      ARCHIVED: 'ARCHIVED',
    };
    return map[metaStatus] || 'PAUSED';
  }

  private async upsertAdSet(adAccountId: string, campaignId: string, adSetData: any) {
    const existing = await this.prisma.adSet.findFirst({
      where: { adAccountId, metaAdSetId: adSetData.id },
    });

    const data = {
      name: adSetData.name,
      status: this.mapStatus(adSetData.status),
      targeting: adSetData.targeting,
      dailyBudget: adSetData.daily_budget ? Number(adSetData.daily_budget) / 100 : null,
      lifetimeBudget: adSetData.lifetime_budget ? Number(adSetData.lifetime_budget) / 100 : null,
      bidAmount: adSetData.bid_amount ? Number(adSetData.bid_amount) / 100 : null,
      optimizationGoal: adSetData.optimization_goal,
      billingEvent: adSetData.billing_event,
      metaRaw: adSetData,
      lastSyncAt: new Date(),
    };

    if (existing) {
      if (existing.syncStatus === 'SYNCED') {
        await this.prisma.adSet.update({ where: { id: existing.id }, data });
      }
    } else {
      await this.prisma.adSet.create({
        data: { ...data, adAccountId, campaignId, metaAdSetId: adSetData.id },
      });
    }
  }

  private async upsertAd(adAccountId: string, adSetId: string, ad: any) {
    const existing = await this.prisma.ad.findFirst({
      where: { adAccountId, metaAdId: ad.id },
    });

    const data = {
      name: ad.name,
      status: this.mapStatus(ad.status),
      creativeSpec: ad.creative,
      previewUrl: ad.preview_shareable_link,
      metaRaw: ad,
      lastSyncAt: new Date(),
    };

    if (existing) {
      if (existing.syncStatus === 'SYNCED') {
        await this.prisma.ad.update({ where: { id: existing.id }, data });
      }
    } else {
      await this.prisma.ad.create({
        data: { ...data, adAccountId, adSetId, metaAdId: ad.id },
      });
    }
  }

  private async upsertInsight(adAccountId: string, row: any, level: string) {
    const entityTypeMap: Record<string, string> = {
      campaign: 'CAMPAIGN',
      adset: 'ADSET',
      ad: 'AD',
    };
    const entityIdFieldMap: Record<string, string> = {
      campaign: 'campaign_id',
      adset: 'adset_id',
      ad: 'ad_id',
    };

    const metaEntityId = row[entityIdFieldMap[level]];
    if (!metaEntityId) return;

    let entityId: string | null = null;
    if (level === 'campaign') {
      const entity = await this.prisma.campaign.findFirst({ where: { metaCampaignId: metaEntityId } });
      entityId = entity?.id ?? null;
    } else if (level === 'adset') {
      const entity = await this.prisma.adSet.findFirst({ where: { metaAdSetId: metaEntityId } });
      entityId = entity?.id ?? null;
    } else {
      const entity = await this.prisma.ad.findFirst({ where: { metaAdId: metaEntityId } });
      entityId = entity?.id ?? null;
    }
    if (!entityId) return;

    const date = new Date(row.date_start);
    const conversions = row.actions?.find((a: any) => a.action_type === 'offsite_conversion')?.value || 0;
    const revenue = row.actions?.find((a: any) => a.action_type === 'purchase')?.value || 0;

    await this.prisma.insightSnapshot.upsert({
      where: {
        adAccountId_entityType_entityId_date: {
          adAccountId,
          entityType: entityTypeMap[level] as any,
          entityId,
          date,
        },
      },
      update: {
        spend: Number(row.spend || 0),
        impressions: Number(row.impressions || 0),
        reach: Number(row.reach || 0),
        clicks: Number(row.clicks || 0),
        conversions: Number(conversions),
        revenue: Number(revenue),
        ctr: Number(row.ctr || 0),
        cpm: Number(row.cpm || 0),
        cpc: Number(row.cpc || 0),
        frequency: Number(row.frequency || 0),
      },
      create: {
        adAccountId,
        entityType: entityTypeMap[level] as any,
        entityId,
        date,
        spend: Number(row.spend || 0),
        impressions: Number(row.impressions || 0),
        reach: Number(row.reach || 0),
        clicks: Number(row.clicks || 0),
        conversions: Number(conversions),
        revenue: Number(revenue),
        ctr: Number(row.ctr || 0),
        cpm: Number(row.cpm || 0),
        cpc: Number(row.cpc || 0),
        frequency: Number(row.frequency || 0),
      },
    });
  }
}

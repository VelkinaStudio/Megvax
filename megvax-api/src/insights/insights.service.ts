import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { InsightsQueryDto, TopPerformersDto, AccountSummaryDto } from './dto/insights-query.dto';

@Injectable()
export class InsightsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getInsights(workspaceId: string, query: InsightsQueryDto) {
    const where: any = {
      adAccount: { workspaceId },
    };
    if (query.accountId) where.adAccountId = query.accountId;
    if (query.entityType) where.entityType = query.entityType;
    if (query.entityId) where.entityId = query.entityId;
    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    const snapshots = await this.prisma.insightSnapshot.findMany({
      where,
      orderBy: { date: 'asc' },
      take: 1000,
    });

    return { data: snapshots };
  }

  async getTopPerformers(workspaceId: string, query: TopPerformersDto) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: query.accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const metric = query.metric ?? 'roas';
    const limit = query.limit ?? 10;

    const snapshots = await this.prisma.insightSnapshot.groupBy({
      by: ['entityId', 'entityType'],
      where: {
        adAccountId: query.accountId,
        entityType: 'CAMPAIGN',
        date: { gte: thirtyDaysAgo },
      },
      _sum: {
        spend: true,
        impressions: true,
        clicks: true,
        conversions: true,
        revenue: true,
      },
      _avg: {
        roas: true,
        ctr: true,
      },
      orderBy: metric === 'roas' || metric === 'ctr'
        ? { _avg: { [metric]: 'desc' } }
        : { _sum: { [metric]: 'desc' } },
      take: limit,
    });

    return { data: snapshots };
  }

  async getAccountSummary(workspaceId: string, query: AccountSummaryDto) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: query.accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');

    const cacheKey = `insights:summary:${query.accountId}:${query.from}:${query.to}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as unknown;

    const where: any = {
      adAccountId: query.accountId,
      entityType: 'CAMPAIGN',
    };
    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    const agg = await this.prisma.insightSnapshot.aggregate({
      where,
      _sum: {
        spend: true,
        impressions: true,
        reach: true,
        clicks: true,
        conversions: true,
        revenue: true,
      },
      _avg: {
        ctr: true,
        cpm: true,
        cpc: true,
        cpa: true,
        roas: true,
        frequency: true,
      },
    });

    const result = { data: agg };
    await this.redis.set(cacheKey, JSON.stringify(result), 900);
    return result;
  }

  async compareEntities(workspaceId: string, ids: string[], from?: string, to?: string) {
    const where: any = {
      adAccount: { workspaceId },
      entityId: { in: ids },
    };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const snapshots = await this.prisma.insightSnapshot.groupBy({
      by: ['entityId'],
      where,
      _sum: { spend: true, impressions: true, clicks: true, conversions: true, revenue: true },
      _avg: { ctr: true, cpm: true, cpc: true, cpa: true, roas: true, frequency: true },
    });

    return { data: snapshots };
  }
}

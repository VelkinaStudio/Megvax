import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

// ── Mocks ──────────────────────────────────────────────
const prisma: Record<string, any> = {
  adAccount: {
    findFirst: jest.fn(),
  },
  insightSnapshot: {
    findMany: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn(),
  },
};

const redis: Record<string, any> = {
  get: jest.fn(),
  set: jest.fn(),
};

const mockAccount = { id: 'acc-1', workspaceId: 'ws-1' };

const mockSnapshot = (overrides: Record<string, any> = {}) => ({
  id: 'snap-1',
  adAccountId: 'acc-1',
  entityType: 'CAMPAIGN',
  entityId: 'camp-1',
  date: new Date('2026-03-01'),
  spend: 100,
  impressions: 5000,
  clicks: 250,
  conversions: 10,
  revenue: 500,
  roas: 5.0,
  ctr: 5.0,
  cpm: 20.0,
  cpc: 0.4,
  cpa: 10.0,
  reach: 4000,
  frequency: 1.25,
  ...overrides,
});

describe('InsightsService', () => {
  let service: InsightsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Default: account exists
    prisma.adAccount.findFirst.mockResolvedValue(mockAccount);
    redis.get.mockResolvedValue(null);
    redis.set.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
  });

  // ── getInsights ─────────────────────────────────────
  describe('getInsights', () => {
    it('should return raw snapshots', async () => {
      const snapshots = [mockSnapshot(), mockSnapshot({ id: 'snap-2' })];
      prisma.insightSnapshot.findMany.mockResolvedValue(snapshots);

      const result = await service.getInsights('ws-1', { accountId: 'acc-1' } as any);

      expect(result.data).toEqual(snapshots);
      expect(prisma.insightSnapshot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adAccount: { workspaceId: 'ws-1' },
            adAccountId: 'acc-1',
          }),
          orderBy: { date: 'asc' },
          take: 1000,
        }),
      );
    });

    it('should apply entityType filter', async () => {
      prisma.insightSnapshot.findMany.mockResolvedValue([]);

      await service.getInsights('ws-1', {
        entityType: 'ADSET',
      } as any);

      expect(prisma.insightSnapshot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ entityType: 'ADSET' }),
        }),
      );
    });

    it('should apply entityId filter', async () => {
      prisma.insightSnapshot.findMany.mockResolvedValue([]);

      await service.getInsights('ws-1', {
        entityId: 'camp-1',
      } as any);

      expect(prisma.insightSnapshot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ entityId: 'camp-1' }),
        }),
      );
    });

    it('should apply date range filters', async () => {
      prisma.insightSnapshot.findMany.mockResolvedValue([]);

      await service.getInsights('ws-1', {
        from: '2026-01-01',
        to: '2026-01-31',
      } as any);

      expect(prisma.insightSnapshot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: new Date('2026-01-01'),
              lte: new Date('2026-01-31'),
            },
          }),
        }),
      );
    });

    it('should scope to workspace', async () => {
      prisma.insightSnapshot.findMany.mockResolvedValue([]);

      await service.getInsights('ws-1', {} as any);

      expect(prisma.insightSnapshot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adAccount: { workspaceId: 'ws-1' },
          }),
        }),
      );
    });
  });

  // ── getTopPerformers ────────────────────────────────
  describe('getTopPerformers', () => {
    const groupByResult = [
      {
        entityId: 'camp-1',
        entityType: 'CAMPAIGN',
        _sum: { spend: 1000, impressions: 50000, clicks: 2500, conversions: 100, revenue: 5000 },
        _avg: { roas: 5.0, ctr: 5.0 },
      },
    ];

    it('should return grouped snapshots by default metric (roas)', async () => {
      prisma.insightSnapshot.groupBy.mockResolvedValue(groupByResult);

      const result = await service.getTopPerformers('ws-1', {
        accountId: 'acc-1',
      } as any);

      expect(result.data).toEqual(groupByResult);
      expect(prisma.insightSnapshot.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['entityId', 'entityType'],
          orderBy: { _avg: { roas: 'desc' } },
          take: 10,
        }),
      );
    });

    it('should use _avg ordering for roas metric', async () => {
      prisma.insightSnapshot.groupBy.mockResolvedValue(groupByResult);

      await service.getTopPerformers('ws-1', {
        accountId: 'acc-1',
        metric: 'roas',
      } as any);

      expect(prisma.insightSnapshot.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { _avg: { roas: 'desc' } },
        }),
      );
    });

    it('should use _avg ordering for ctr metric', async () => {
      prisma.insightSnapshot.groupBy.mockResolvedValue(groupByResult);

      await service.getTopPerformers('ws-1', {
        accountId: 'acc-1',
        metric: 'ctr',
      } as any);

      expect(prisma.insightSnapshot.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { _avg: { ctr: 'desc' } },
        }),
      );
    });

    it('should use _sum ordering for spend metric', async () => {
      prisma.insightSnapshot.groupBy.mockResolvedValue(groupByResult);

      await service.getTopPerformers('ws-1', {
        accountId: 'acc-1',
        metric: 'spend',
      } as any);

      expect(prisma.insightSnapshot.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { _sum: { spend: 'desc' } },
        }),
      );
    });

    it('should respect custom limit', async () => {
      prisma.insightSnapshot.groupBy.mockResolvedValue([]);

      await service.getTopPerformers('ws-1', {
        accountId: 'acc-1',
        limit: 5,
      } as any);

      expect(prisma.insightSnapshot.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });

    it('should throw NotFoundException when account not found', async () => {
      prisma.adAccount.findFirst.mockResolvedValue(null);

      await expect(
        service.getTopPerformers('ws-1', { accountId: 'acc-missing' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── getAccountSummary ───────────────────────────────
  describe('getAccountSummary', () => {
    const aggregateResult = {
      _sum: {
        spend: 5000,
        impressions: 200000,
        reach: 150000,
        clicks: 10000,
        conversions: 500,
        revenue: 25000,
      },
      _avg: {
        ctr: 5.0,
        cpm: 25.0,
        cpc: 0.5,
        cpa: 10.0,
        roas: 5.0,
        frequency: 1.33,
      },
    };

    it('should return aggregated metrics', async () => {
      prisma.insightSnapshot.aggregate.mockResolvedValue(aggregateResult);

      const result = await service.getAccountSummary('ws-1', {
        accountId: 'acc-1',
        from: '2026-01-01',
        to: '2026-01-31',
      } as any);

      expect(result).toEqual({ data: aggregateResult });
      expect(prisma.insightSnapshot.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adAccountId: 'acc-1',
            entityType: 'CAMPAIGN',
            date: {
              gte: new Date('2026-01-01'),
              lte: new Date('2026-01-31'),
            },
          }),
        }),
      );
    });

    it('should return cached result when available', async () => {
      const cached = { data: aggregateResult };
      redis.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.getAccountSummary('ws-1', {
        accountId: 'acc-1',
        from: '2026-01-01',
        to: '2026-01-31',
      } as any);

      expect(result).toEqual(cached);
      expect(prisma.insightSnapshot.aggregate).not.toHaveBeenCalled();
    });

    it('should cache the result with 900s TTL', async () => {
      prisma.insightSnapshot.aggregate.mockResolvedValue(aggregateResult);

      await service.getAccountSummary('ws-1', {
        accountId: 'acc-1',
        from: '2026-01-01',
        to: '2026-01-31',
      } as any);

      expect(redis.set).toHaveBeenCalledWith(
        'insights:summary:acc-1:2026-01-01:2026-01-31',
        JSON.stringify({ data: aggregateResult }),
        900,
      );
    });

    it('should build correct cache key from query params', async () => {
      prisma.insightSnapshot.aggregate.mockResolvedValue(aggregateResult);

      await service.getAccountSummary('ws-1', {
        accountId: 'acc-1',
        from: '2026-03-01',
        to: '2026-03-31',
      } as any);

      expect(redis.get).toHaveBeenCalledWith('insights:summary:acc-1:2026-03-01:2026-03-31');
    });

    it('should throw NotFoundException when account not found', async () => {
      prisma.adAccount.findFirst.mockResolvedValue(null);

      await expect(
        service.getAccountSummary('ws-1', { accountId: 'acc-missing' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should skip date filter when from/to are not provided', async () => {
      prisma.insightSnapshot.aggregate.mockResolvedValue(aggregateResult);

      await service.getAccountSummary('ws-1', {
        accountId: 'acc-1',
      } as any);

      expect(prisma.insightSnapshot.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            adAccountId: 'acc-1',
            entityType: 'CAMPAIGN',
          },
        }),
      );
    });
  });

  // ── compareEntities ─────────────────────────────────
  describe('compareEntities', () => {
    const compareResult = [
      {
        entityId: 'camp-1',
        _sum: { spend: 1000, impressions: 50000, clicks: 2500, conversions: 100, revenue: 5000 },
        _avg: { ctr: 5.0, cpm: 20.0, cpc: 0.4, cpa: 10.0, roas: 5.0, frequency: 1.25 },
      },
      {
        entityId: 'camp-2',
        _sum: { spend: 800, impressions: 40000, clicks: 2000, conversions: 80, revenue: 4000 },
        _avg: { ctr: 5.0, cpm: 20.0, cpc: 0.4, cpa: 10.0, roas: 5.0, frequency: 1.2 },
      },
    ];

    it('should return side-by-side comparison for given entity ids', async () => {
      prisma.insightSnapshot.groupBy.mockResolvedValue(compareResult);

      const result = await service.compareEntities('ws-1', ['camp-1', 'camp-2']);

      expect(result.data).toEqual(compareResult);
      expect(prisma.insightSnapshot.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['entityId'],
          where: expect.objectContaining({
            adAccount: { workspaceId: 'ws-1' },
            entityId: { in: ['camp-1', 'camp-2'] },
          }),
        }),
      );
    });

    it('should apply date range filters when provided', async () => {
      prisma.insightSnapshot.groupBy.mockResolvedValue(compareResult);

      await service.compareEntities('ws-1', ['camp-1', 'camp-2'], '2026-01-01', '2026-01-31');

      expect(prisma.insightSnapshot.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: new Date('2026-01-01'),
              lte: new Date('2026-01-31'),
            },
          }),
        }),
      );
    });

    it('should not include date filter when dates are not provided', async () => {
      prisma.insightSnapshot.groupBy.mockResolvedValue([]);

      await service.compareEntities('ws-1', ['camp-1']);

      expect(prisma.insightSnapshot.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            adAccount: { workspaceId: 'ws-1' },
            entityId: { in: ['camp-1'] },
          },
        }),
      );
    });
  });
});

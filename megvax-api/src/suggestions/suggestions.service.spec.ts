import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignsService } from '../campaigns/campaigns.service';

const prisma: Record<string, any> = {
  suggestion: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
  },
  adAccount: { findFirst: jest.fn() },
  insightSnapshot: { findMany: jest.fn(), groupBy: jest.fn() },
  $transaction: jest.fn((fn: (tx: any) => any) => fn(prisma)),
};

const campaignsService = {
  updateCampaign: jest.fn(),
  pauseCampaign: jest.fn(),
};

describe('SuggestionsService', () => {
  let service: SuggestionsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuggestionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CampaignsService, useValue: campaignsService },
      ],
    }).compile();

    service = module.get<SuggestionsService>(SuggestionsService);
  });

  // ---------------------------------------------------------------------------
  // getSuggestions
  // ---------------------------------------------------------------------------
  describe('getSuggestions', () => {
    const workspaceId = 'ws-1';
    const accountId = 'acc-1';

    beforeEach(() => {
      prisma.adAccount.findFirst.mockResolvedValue({ id: accountId, workspaceId });
    });

    it('returns paginated suggestions with hasMore=false when fewer than limit', async () => {
      const items = [
        { id: 's1', createdAt: new Date() },
        { id: 's2', createdAt: new Date() },
      ];
      prisma.suggestion.findMany.mockResolvedValue(items);

      const result = await service.getSuggestions(workspaceId, { accountId, limit: 10 });

      expect(result).toEqual({ data: items, cursor: null, hasMore: false });
      expect(prisma.suggestion.findMany).toHaveBeenCalledWith({
        where: { adAccountId: accountId },
        take: 11,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('returns hasMore=true and cursor when more results exist', async () => {
      const items = Array.from({ length: 4 }, (_, i) => ({
        id: `s${i}`,
        createdAt: new Date(),
      }));
      prisma.suggestion.findMany.mockResolvedValue(items);

      const result = await service.getSuggestions(workspaceId, { accountId, limit: 3 });

      expect(result.hasMore).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.cursor).toBe('s2');
    });

    it('defaults limit to 25 when not provided', async () => {
      prisma.suggestion.findMany.mockResolvedValue([]);

      await service.getSuggestions(workspaceId, { accountId });

      expect(prisma.suggestion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 26 }),
      );
    });

    it('passes cursor as skip+cursor when provided', async () => {
      prisma.suggestion.findMany.mockResolvedValue([]);

      await service.getSuggestions(workspaceId, { accountId, cursor: 'cur-1', limit: 5 });

      expect(prisma.suggestion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: 'cur-1' },
          take: 6,
        }),
      );
    });

    it('filters by status when provided', async () => {
      prisma.suggestion.findMany.mockResolvedValue([]);

      await service.getSuggestions(workspaceId, { accountId, status: 'PENDING' });

      expect(prisma.suggestion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { adAccountId: accountId, status: 'PENDING' },
        }),
      );
    });

    it('filters by type when provided', async () => {
      prisma.suggestion.findMany.mockResolvedValue([]);

      await service.getSuggestions(workspaceId, { accountId, type: 'BUDGET' });

      expect(prisma.suggestion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { adAccountId: accountId, type: 'BUDGET' },
        }),
      );
    });

    it('filters by both status and type when provided', async () => {
      prisma.suggestion.findMany.mockResolvedValue([]);

      await service.getSuggestions(workspaceId, {
        accountId,
        status: 'APPLIED',
        type: 'HEALTH',
      });

      expect(prisma.suggestion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { adAccountId: accountId, status: 'APPLIED', type: 'HEALTH' },
        }),
      );
    });

    it('throws NotFoundException when ad account does not belong to workspace', async () => {
      prisma.adAccount.findFirst.mockResolvedValue(null);

      await expect(
        service.getSuggestions(workspaceId, { accountId: 'bad-acc' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // applySuggestion
  // ---------------------------------------------------------------------------
  describe('applySuggestion', () => {
    const workspaceId = 'ws-1';
    const suggestionId = 'sug-1';

    it('marks the suggestion as APPLIED with appliedAt timestamp', async () => {
      const suggestion = {
        id: suggestionId,
        status: 'PENDING',
        entityId: 'camp-1',
        action: { type: 'review', params: {} },
        adAccount: { workspaceId },
      };
      prisma.suggestion.findUniqueOrThrow.mockResolvedValue(suggestion);
      const updated = { ...suggestion, status: 'APPLIED', appliedAt: new Date() };
      prisma.suggestion.update.mockResolvedValue(updated);

      const result = await service.applySuggestion(workspaceId, suggestionId);

      expect(prisma.suggestion.update).toHaveBeenCalledWith({
        where: { id: suggestionId },
        data: { status: 'APPLIED', appliedAt: expect.any(Date) },
      });
      expect(result).toEqual(updated);
    });

    it('calls campaignsService.updateCampaign for patch_campaign action', async () => {
      const params = { dailyBudget: 100 };
      const suggestion = {
        id: suggestionId,
        status: 'PENDING',
        entityId: 'camp-1',
        action: { type: 'patch_campaign', params },
        adAccount: { workspaceId },
      };
      prisma.suggestion.findUniqueOrThrow.mockResolvedValue(suggestion);
      prisma.suggestion.update.mockResolvedValue({ ...suggestion, status: 'APPLIED' });

      await service.applySuggestion(workspaceId, suggestionId);

      expect(campaignsService.updateCampaign).toHaveBeenCalledWith(
        workspaceId,
        'camp-1',
        params,
      );
    });

    it('calls campaignsService.pauseCampaign for pause_campaign action', async () => {
      const suggestion = {
        id: suggestionId,
        status: 'PENDING',
        entityId: 'camp-2',
        action: { type: 'pause_campaign', params: {} },
        adAccount: { workspaceId },
      };
      prisma.suggestion.findUniqueOrThrow.mockResolvedValue(suggestion);
      prisma.suggestion.update.mockResolvedValue({ ...suggestion, status: 'APPLIED' });

      await service.applySuggestion(workspaceId, suggestionId);

      expect(campaignsService.pauseCampaign).toHaveBeenCalledWith(workspaceId, 'camp-2');
    });

    it('does not call any campaign action for review type', async () => {
      const suggestion = {
        id: suggestionId,
        status: 'PENDING',
        entityId: 'camp-3',
        action: { type: 'review', params: {} },
        adAccount: { workspaceId },
      };
      prisma.suggestion.findUniqueOrThrow.mockResolvedValue(suggestion);
      prisma.suggestion.update.mockResolvedValue({ ...suggestion, status: 'APPLIED' });

      await service.applySuggestion(workspaceId, suggestionId);

      expect(campaignsService.updateCampaign).not.toHaveBeenCalled();
      expect(campaignsService.pauseCampaign).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when suggestion belongs to a different workspace', async () => {
      const suggestion = {
        id: suggestionId,
        status: 'PENDING',
        entityId: 'camp-1',
        action: { type: 'review', params: {} },
        adAccount: { workspaceId: 'other-ws' },
      };
      prisma.suggestion.findUniqueOrThrow.mockResolvedValue(suggestion);

      await expect(
        service.applySuggestion(workspaceId, suggestionId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when suggestion is not PENDING', async () => {
      const suggestion = {
        id: suggestionId,
        status: 'APPLIED',
        entityId: 'camp-1',
        action: { type: 'review', params: {} },
        adAccount: { workspaceId },
      };
      prisma.suggestion.findUniqueOrThrow.mockResolvedValue(suggestion);

      await expect(
        service.applySuggestion(workspaceId, suggestionId),
      ).rejects.toThrow('Suggestion is not pending');
    });

    it('throws when suggestion is not found (findUniqueOrThrow)', async () => {
      prisma.suggestion.findUniqueOrThrow.mockRejectedValue(new NotFoundException());

      await expect(
        service.applySuggestion(workspaceId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // dismissSuggestion
  // ---------------------------------------------------------------------------
  describe('dismissSuggestion', () => {
    const workspaceId = 'ws-1';
    const suggestionId = 'sug-2';

    it('marks the suggestion as DISMISSED with reason and timestamp', async () => {
      const suggestion = {
        id: suggestionId,
        status: 'PENDING',
        adAccount: { workspaceId },
      };
      prisma.suggestion.findUniqueOrThrow.mockResolvedValue(suggestion);
      const updated = { ...suggestion, status: 'DISMISSED', dismissReason: 'not relevant' };
      prisma.suggestion.update.mockResolvedValue(updated);

      const result = await service.dismissSuggestion(workspaceId, suggestionId, 'not relevant');

      expect(prisma.suggestion.update).toHaveBeenCalledWith({
        where: { id: suggestionId },
        data: {
          status: 'DISMISSED',
          dismissedAt: expect.any(Date),
          dismissReason: 'not relevant',
        },
      });
      expect(result).toEqual(updated);
    });

    it('sets dismissReason to null when no reason provided', async () => {
      const suggestion = {
        id: suggestionId,
        status: 'PENDING',
        adAccount: { workspaceId },
      };
      prisma.suggestion.findUniqueOrThrow.mockResolvedValue(suggestion);
      prisma.suggestion.update.mockResolvedValue({ ...suggestion, status: 'DISMISSED' });

      await service.dismissSuggestion(workspaceId, suggestionId);

      expect(prisma.suggestion.update).toHaveBeenCalledWith({
        where: { id: suggestionId },
        data: {
          status: 'DISMISSED',
          dismissedAt: expect.any(Date),
          dismissReason: null,
        },
      });
    });

    it('throws NotFoundException when suggestion belongs to a different workspace', async () => {
      const suggestion = {
        id: suggestionId,
        status: 'PENDING',
        adAccount: { workspaceId: 'other-ws' },
      };
      prisma.suggestion.findUniqueOrThrow.mockResolvedValue(suggestion);

      await expect(
        service.dismissSuggestion(workspaceId, suggestionId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when suggestion is not PENDING', async () => {
      const suggestion = {
        id: suggestionId,
        status: 'DISMISSED',
        adAccount: { workspaceId },
      };
      prisma.suggestion.findUniqueOrThrow.mockResolvedValue(suggestion);

      await expect(
        service.dismissSuggestion(workspaceId, suggestionId),
      ).rejects.toThrow('Suggestion is not pending');
    });
  });

  // ---------------------------------------------------------------------------
  // generateSuggestions
  // ---------------------------------------------------------------------------
  describe('generateSuggestions', () => {
    const adAccountId = 'acc-1';

    it('returns { created: 0 } when there are no insights', async () => {
      prisma.insightSnapshot.findMany.mockResolvedValue([]);

      const result = await service.generateSuggestions(adAccountId);

      expect(result).toEqual({ created: 0 });
      expect(prisma.suggestion.createMany).not.toHaveBeenCalled();
    });

    it('generates BUDGET suggestion from high ROAS data', async () => {
      // roas >= 2.0 and conversions >= 5
      const insights = [
        {
          entityId: 'camp-high-roas',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(),
          spend: 100,
          revenue: 300,     // roas = 3.0
          conversions: 10,
          impressions: 5000,
          clicks: 200,       // ctr = 0.04 (above 0.005 threshold)
          frequency: 2,
        },
      ];
      prisma.insightSnapshot.findMany.mockResolvedValue(insights);
      prisma.suggestion.findMany.mockResolvedValue([]); // no existing pending
      prisma.suggestion.createMany.mockResolvedValue({ count: 1 });

      const result = await service.generateSuggestions(adAccountId);

      expect(result).toEqual({ created: 1 });
      expect(prisma.suggestion.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            adAccountId,
            entityId: 'camp-high-roas',
            type: 'BUDGET',
            title: 'Scale high-performing campaign',
          }),
        ]),
      });
    });

    it('generates BUDGET suggestion for low ROAS campaigns wasting spend', async () => {
      // roas < 0.5 and spend > 50
      const insights = [
        {
          entityId: 'camp-low-roas',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(),
          spend: 200,
          revenue: 50,      // roas = 0.25
          conversions: 1,
          impressions: 5000,
          clicks: 200,       // ctr = 0.04
          frequency: 1,
        },
      ];
      prisma.insightSnapshot.findMany.mockResolvedValue(insights);
      prisma.suggestion.findMany.mockResolvedValue([]);
      prisma.suggestion.createMany.mockResolvedValue({ count: 1 });

      const result = await service.generateSuggestions(adAccountId);

      expect(result).toEqual({ created: 1 });
      expect(prisma.suggestion.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            entityId: 'camp-low-roas',
            type: 'BUDGET',
            title: 'Reduce budget on underperforming campaign',
            action: { type: 'pause_campaign', params: {} },
          }),
        ]),
      });
    });

    it('generates HEALTH suggestion from low CTR data', async () => {
      // ctr < 0.005 and impressions > 1000
      const insights = [
        {
          entityId: 'camp-low-ctr',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(),
          spend: 10,
          revenue: 50,       // roas = 5.0 but conversions too low
          conversions: 2,    // < 5, so no BUDGET suggestion from high ROAS
          impressions: 10000,
          clicks: 3,          // ctr = 0.0003
          frequency: 1,
        },
      ];
      prisma.insightSnapshot.findMany.mockResolvedValue(insights);
      prisma.suggestion.findMany.mockResolvedValue([]);
      prisma.suggestion.createMany.mockResolvedValue({ count: 1 });

      const result = await service.generateSuggestions(adAccountId);

      expect(result).toEqual({ created: 1 });
      expect(prisma.suggestion.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            entityId: 'camp-low-ctr',
            type: 'HEALTH',
            title: 'Low click-through rate',
          }),
        ]),
      });
    });

    it('generates HEALTH suggestion from high frequency data', async () => {
      // frequency > 4
      const insights = [
        {
          entityId: 'camp-high-freq',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(),
          spend: 10,
          revenue: 10,
          conversions: 0,
          impressions: 500,
          clicks: 50,          // ctr = 0.1
          frequency: 5.5,
        },
      ];
      prisma.insightSnapshot.findMany.mockResolvedValue(insights);
      prisma.suggestion.findMany.mockResolvedValue([]);
      prisma.suggestion.createMany.mockResolvedValue({ count: 1 });

      const result = await service.generateSuggestions(adAccountId);

      expect(result).toEqual({ created: 1 });
      expect(prisma.suggestion.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            entityId: 'camp-high-freq',
            type: 'HEALTH',
            title: 'High ad frequency detected',
          }),
        ]),
      });
    });

    it('generates multiple suggestions for a campaign that triggers several rules', async () => {
      // High ROAS + high frequency => BUDGET + HEALTH
      const insights = [
        {
          entityId: 'camp-multi',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(),
          spend: 100,
          revenue: 400,      // roas = 4.0
          conversions: 20,
          impressions: 5000,
          clicks: 200,        // ctr = 0.04
          frequency: 6,
        },
      ];
      prisma.insightSnapshot.findMany.mockResolvedValue(insights);
      prisma.suggestion.findMany.mockResolvedValue([]);
      prisma.suggestion.createMany.mockResolvedValue({ count: 2 });

      const result = await service.generateSuggestions(adAccountId);

      expect(result).toEqual({ created: 2 });

      const createManyArg = prisma.suggestion.createMany.mock.calls[0][0];
      const types = createManyArg.data.map((s: any) => s.type);
      expect(types).toContain('BUDGET');
      expect(types).toContain('HEALTH');
    });

    it('skips duplicate pending suggestions for the same entity+type', async () => {
      const insights = [
        {
          entityId: 'camp-dup',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(),
          spend: 100,
          revenue: 300,     // roas = 3.0
          conversions: 10,
          impressions: 5000,
          clicks: 200,
          frequency: 2,
        },
      ];
      prisma.insightSnapshot.findMany.mockResolvedValue(insights);
      // Already a PENDING BUDGET suggestion for this campaign
      prisma.suggestion.findMany.mockResolvedValue([
        { entityId: 'camp-dup', type: 'BUDGET' },
      ]);

      const result = await service.generateSuggestions(adAccountId);

      expect(result).toEqual({ created: 0 });
      expect(prisma.suggestion.createMany).not.toHaveBeenCalled();
    });

    it('creates only non-duplicate suggestions when some already exist', async () => {
      // Campaign triggers both BUDGET (high roas) and HEALTH (high frequency)
      // but a BUDGET pending suggestion already exists
      const insights = [
        {
          entityId: 'camp-partial',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(),
          spend: 100,
          revenue: 400,     // roas = 4.0
          conversions: 15,
          impressions: 5000,
          clicks: 200,
          frequency: 5,
        },
      ];
      prisma.insightSnapshot.findMany.mockResolvedValue(insights);
      prisma.suggestion.findMany.mockResolvedValue([
        { entityId: 'camp-partial', type: 'BUDGET' },
      ]);
      prisma.suggestion.createMany.mockResolvedValue({ count: 1 });

      const result = await service.generateSuggestions(adAccountId);

      expect(result).toEqual({ created: 1 });
      const createManyArg = prisma.suggestion.createMany.mock.calls[0][0];
      expect(createManyArg.data).toHaveLength(1);
      expect(createManyArg.data[0].type).toBe('HEALTH');
    });

    it('aggregates multiple insight rows for the same campaign', async () => {
      const insights = [
        {
          entityId: 'camp-agg',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(),
          spend: 60,
          revenue: 180,
          conversions: 3,
          impressions: 3000,
          clicks: 100,
          frequency: 2,
        },
        {
          entityId: 'camp-agg',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(Date.now() - 86400000),
          spend: 60,
          revenue: 180,
          conversions: 4,
          impressions: 3000,
          clicks: 100,
          frequency: 3,
        },
      ];
      // Aggregated: spend=120, revenue=360, roas=3.0, conversions=7 (>=5)
      // => BUDGET suggestion expected
      prisma.insightSnapshot.findMany.mockResolvedValue(insights);
      prisma.suggestion.findMany.mockResolvedValue([]);
      prisma.suggestion.createMany.mockResolvedValue({ count: 1 });

      const result = await service.generateSuggestions(adAccountId);

      expect(result).toEqual({ created: 1 });
      expect(prisma.suggestion.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            entityId: 'camp-agg',
            type: 'BUDGET',
            title: 'Scale high-performing campaign',
          }),
        ]),
      });
    });

    it('returns { created: 0 } when insights exist but no rules trigger', async () => {
      // Mediocre performance: roas between 0.5 and 2.0, decent ctr, low frequency
      const insights = [
        {
          entityId: 'camp-mediocre',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(),
          spend: 100,
          revenue: 100,     // roas = 1.0
          conversions: 5,
          impressions: 5000,
          clicks: 200,       // ctr = 0.04
          frequency: 2,
        },
      ];
      prisma.insightSnapshot.findMany.mockResolvedValue(insights);

      const result = await service.generateSuggestions(adAccountId);

      expect(result).toEqual({ created: 0 });
      expect(prisma.suggestion.createMany).not.toHaveBeenCalled();
    });

    it('queries insights from the last 7 days', async () => {
      prisma.insightSnapshot.findMany.mockResolvedValue([]);

      await service.generateSuggestions(adAccountId);

      const callArgs = prisma.insightSnapshot.findMany.mock.calls[0][0];
      expect(callArgs.where).toMatchObject({
        adAccountId,
        entityType: 'CAMPAIGN',
        date: { gte: expect.any(Date) },
      });

      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const gteDate = callArgs.where.date.gte as Date;
      const diff = Date.now() - gteDate.getTime();
      // Should be approximately 7 days (allow a small tolerance for test execution time)
      expect(diff).toBeGreaterThanOrEqual(sevenDaysMs - 1000);
      expect(diff).toBeLessThanOrEqual(sevenDaysMs + 5000);
    });

    it('uses max frequency across rows rather than summing', async () => {
      // Two rows for same campaign: frequency 3 and 5 => max=5 (> 4 threshold)
      const insights = [
        {
          entityId: 'camp-freq',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(),
          spend: 10,
          revenue: 10,
          conversions: 0,
          impressions: 200,
          clicks: 50,
          frequency: 3,
        },
        {
          entityId: 'camp-freq',
          entityType: 'CAMPAIGN',
          adAccountId,
          date: new Date(Date.now() - 86400000),
          spend: 10,
          revenue: 10,
          conversions: 0,
          impressions: 200,
          clicks: 50,
          frequency: 5,
        },
      ];
      prisma.insightSnapshot.findMany.mockResolvedValue(insights);
      prisma.suggestion.findMany.mockResolvedValue([]);
      prisma.suggestion.createMany.mockResolvedValue({ count: 1 });

      const result = await service.generateSuggestions(adAccountId);

      expect(result).toEqual({ created: 1 });
      expect(prisma.suggestion.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            entityId: 'camp-freq',
            type: 'HEALTH',
            title: 'High ad frequency detected',
          }),
        ]),
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { PrismaService } from '../prisma/prisma.service';
import { MetaApiClient } from '../meta/meta-api.client';
import { EncryptionService } from '../meta/encryption.service';

// ── Fixtures ──────────────────────────────────────────────

const WS_ID = 'ws-1';
const ACCOUNT_ID = 'acc-1';
const META_ACCOUNT_ID = 'act_123';
const META_CAMPAIGN_ID = 'meta-camp-1';
const META_ADSET_ID = 'meta-adset-1';
const META_AD_ID = 'meta-ad-1';
const DECRYPTED_TOKEN = 'decrypted-access-token';

const mockAdAccount = {
  id: ACCOUNT_ID,
  workspaceId: WS_ID,
  metaAccountId: META_ACCOUNT_ID,
  name: 'Test Account',
  currency: 'USD',
  metaConnection: { accessToken: 'encrypted-token' },
};

const mockCampaign = {
  id: 'camp-1',
  adAccountId: ACCOUNT_ID,
  metaCampaignId: META_CAMPAIGN_ID,
  name: 'Test Campaign',
  objective: 'OUTCOME_TRAFFIC',
  buyingType: 'AUCTION',
  budgetType: 'DAILY',
  dailyBudget: 50,
  lifetimeBudget: null,
  bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
  specialAdCategories: [],
  status: 'PAUSED',
  syncStatus: 'SYNCED',
  startTime: null,
  endTime: null,
  updatedAt: new Date(),
  adAccount: { workspaceId: WS_ID, name: 'Test Account', currency: 'USD' },
};

const mockAdSet = {
  id: 'adset-1',
  adAccountId: ACCOUNT_ID,
  campaignId: 'camp-1',
  metaAdSetId: META_ADSET_ID,
  name: 'Test AdSet',
  targeting: { geo_locations: { countries: ['US'] } },
  placements: { facebook: ['feed'] },
  dailyBudget: 25,
  lifetimeBudget: null,
  bidAmount: null,
  optimizationGoal: 'LINK_CLICKS',
  billingEvent: 'IMPRESSIONS',
  status: 'PAUSED',
  syncStatus: 'SYNCED',
  updatedAt: new Date(),
  adAccount: { workspaceId: WS_ID },
  campaign: { id: 'camp-1', name: 'Test Campaign', metaCampaignId: META_CAMPAIGN_ID },
};

const mockAd = {
  id: 'ad-1',
  adAccountId: ACCOUNT_ID,
  adSetId: 'adset-1',
  metaAdId: META_AD_ID,
  name: 'Test Ad',
  creativeSpec: { creative_id: 'cr-1' },
  status: 'PAUSED',
  syncStatus: 'SYNCED',
  updatedAt: new Date(),
  adAccount: { workspaceId: WS_ID },
  adSet: { id: 'adset-1', name: 'Test AdSet', metaAdSetId: META_ADSET_ID },
};

// ── Mocks ─────────────────────────────────────────────────
// Use Record<string, any> for prisma to avoid circular type issues
const prisma: Record<string, any> = {
  campaign: {
    findMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  adSet: {
    findMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  ad: {
    findMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  adAccount: {
    findFirst: jest.fn(),
    findFirstOrThrow: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
  auditLog: {
    create: jest.fn().mockResolvedValue({}),
  },
};

const metaApi: Record<string, any> = {
  createCampaign: jest.fn(),
  updateCampaign: jest.fn(),
  createAdSet: jest.fn(),
  updateAdSet: jest.fn(),
  createAd: jest.fn(),
  updateAd: jest.fn(),
  deleteEntity: jest.fn(),
};

const encryption: Record<string, any> = {
  decrypt: jest.fn().mockReturnValue(DECRYPTED_TOKEN),
};

// Mock fs.readFileSync in case EncryptionService or other deps load key files
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn().mockReturnValue('mock-key-data'),
}));

describe('CampaignsService', () => {
  let service: CampaignsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Default: getAccessToken helper succeeds
    prisma.adAccount.findUniqueOrThrow.mockResolvedValue(mockAdAccount);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MetaApiClient, useValue: metaApi },
        { provide: EncryptionService, useValue: encryption },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
  });

  // ─── getCampaigns ──────────────────────────────────────────────────────────

  describe('getCampaigns', () => {
    it('should return a paginated list of campaigns', async () => {
      const items = [
        { ...mockCampaign, id: 'c1' },
        { ...mockCampaign, id: 'c2' },
      ];
      prisma.campaign.findMany.mockResolvedValue(items);

      const result = await service.getCampaigns(WS_ID, { limit: 25 });

      expect(prisma.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adAccount: { workspaceId: WS_ID },
            deletedAt: null,
          }),
          take: 26, // limit + 1 to detect hasMore
          orderBy: { updatedAt: 'desc' },
        }),
      );
      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(result.cursor).toBe('c2');
    });

    it('should set hasMore=true when more items exist beyond the limit', async () => {
      const items = [
        { ...mockCampaign, id: 'c1' },
        { ...mockCampaign, id: 'c2' },
        { ...mockCampaign, id: 'c3' }, // extra item
      ];
      prisma.campaign.findMany.mockResolvedValue(items);

      const result = await service.getCampaigns(WS_ID, { limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.cursor).toBe('c2');
    });

    it('should handle empty results', async () => {
      prisma.campaign.findMany.mockResolvedValue([]);

      const result = await service.getCampaigns(WS_ID, {});

      expect(result.data).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.cursor).toBeNull();
    });

    it('should apply cursor-based pagination', async () => {
      prisma.campaign.findMany.mockResolvedValue([{ ...mockCampaign, id: 'c3' }]);

      await service.getCampaigns(WS_ID, { cursor: 'c2', limit: 25 });

      expect(prisma.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: 'c2' },
        }),
      );
    });

    it('should filter by accountId, status, and search', async () => {
      prisma.campaign.findMany.mockResolvedValue([]);

      await service.getCampaigns(WS_ID, {
        accountId: ACCOUNT_ID,
        status: 'ACTIVE',
        search: 'test',
      });

      expect(prisma.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adAccountId: ACCOUNT_ID,
            status: 'ACTIVE',
            name: { contains: 'test', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should use custom sort field', async () => {
      prisma.campaign.findMany.mockResolvedValue([]);

      await service.getCampaigns(WS_ID, { sort: 'name' });

      expect(prisma.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'desc' },
        }),
      );
    });
  });

  // ─── getCampaignById ───────────────────────────────────────────────────────

  describe('getCampaignById', () => {
    it('should return a campaign with adSets included', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue(mockCampaign);

      const result = await service.getCampaignById(WS_ID, 'camp-1');

      expect(prisma.campaign.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'camp-1' },
        include: expect.objectContaining({
          adAccount: expect.any(Object),
          adSets: expect.any(Object),
        }),
      });
      expect(result).toEqual(mockCampaign);
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        adAccount: { workspaceId: 'other-ws', name: 'Other', currency: 'USD' },
      });

      await expect(service.getCampaignById(WS_ID, 'camp-1')).rejects.toThrow(NotFoundException);
    });

    it('should propagate Prisma not-found error', async () => {
      prisma.campaign.findUniqueOrThrow.mockRejectedValue(new Error('Record not found'));

      await expect(service.getCampaignById(WS_ID, 'nonexistent')).rejects.toThrow();
    });
  });

  // ─── createCampaign ────────────────────────────────────────────────────────

  describe('createCampaign', () => {
    const dto = {
      accountId: ACCOUNT_ID,
      name: 'New Campaign',
      objective: 'OUTCOME_TRAFFIC',
      dailyBudget: 50,
      bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      specialAdCategories: [] as string[],
    };

    it('should create a campaign via Meta API and persist locally', async () => {
      prisma.adAccount.findFirstOrThrow.mockResolvedValue(mockAdAccount);
      metaApi.createCampaign.mockResolvedValue({ id: META_CAMPAIGN_ID });
      const createdCampaign = { ...mockCampaign, id: 'camp-new' };
      prisma.campaign.create.mockResolvedValue(createdCampaign);

      const result = await service.createCampaign(WS_ID, dto);

      expect(prisma.adAccount.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: ACCOUNT_ID, workspaceId: WS_ID },
      });
      expect(metaApi.createCampaign).toHaveBeenCalledWith(
        META_ACCOUNT_ID,
        DECRYPTED_TOKEN,
        expect.objectContaining({
          name: 'New Campaign',
          objective: 'OUTCOME_TRAFFIC',
          status: 'PAUSED',
          daily_budget: 5000, // 50 * 100
          special_ad_categories: [],
        }),
      );
      expect(prisma.campaign.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adAccountId: ACCOUNT_ID,
          metaCampaignId: META_CAMPAIGN_ID,
          name: 'New Campaign',
          status: 'PAUSED',
          syncStatus: 'SYNCED',
        }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result).toEqual(createdCampaign);
    });

    it('should validate workspace access (throw if account not found)', async () => {
      prisma.adAccount.findFirstOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.createCampaign(WS_ID, dto)).rejects.toThrow();
    });

    it('should handle lifetime budget instead of daily budget', async () => {
      prisma.adAccount.findFirstOrThrow.mockResolvedValue(mockAdAccount);
      metaApi.createCampaign.mockResolvedValue({ id: META_CAMPAIGN_ID });
      prisma.campaign.create.mockResolvedValue(mockCampaign);

      const lifetimeDto = {
        accountId: ACCOUNT_ID,
        name: 'Lifetime Campaign',
        objective: 'OUTCOME_TRAFFIC',
        lifetimeBudget: 1000,
      };

      await service.createCampaign(WS_ID, lifetimeDto);

      expect(metaApi.createCampaign).toHaveBeenCalledWith(
        META_ACCOUNT_ID,
        DECRYPTED_TOKEN,
        expect.objectContaining({
          lifetime_budget: 100000, // 1000 * 100
        }),
      );
      expect(prisma.campaign.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          budgetType: 'LIFETIME',
          lifetimeBudget: 1000,
        }),
      });
    });
  });

  // ─── updateCampaign ────────────────────────────────────────────────────────

  describe('updateCampaign', () => {
    const dto = { name: 'Updated Name', dailyBudget: 75 };

    it('should update campaign on Meta and locally', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        adAccount: { ...mockAdAccount, workspaceId: WS_ID },
      });
      metaApi.updateCampaign.mockResolvedValue({ success: true });
      const updated = { ...mockCampaign, name: 'Updated Name' };
      prisma.campaign.update.mockResolvedValue(updated);

      const result = await service.updateCampaign(WS_ID, 'camp-1', dto);

      expect(metaApi.updateCampaign).toHaveBeenCalledWith(
        META_CAMPAIGN_ID,
        DECRYPTED_TOKEN,
        expect.objectContaining({
          name: 'Updated Name',
          daily_budget: 7500,
        }),
      );
      expect(prisma.campaign.update).toHaveBeenCalledWith({
        where: { id: 'camp-1' },
        data: expect.objectContaining({
          localVersion: { increment: 1 },
          syncStatus: 'SYNCED',
        }),
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        adAccount: { ...mockAdAccount, workspaceId: 'other-ws' },
      });

      await expect(service.updateCampaign(WS_ID, 'camp-1', dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if campaign not synced to Meta', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        metaCampaignId: null,
        adAccount: { ...mockAdAccount, workspaceId: WS_ID },
      });

      await expect(service.updateCampaign(WS_ID, 'camp-1', dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── pauseCampaign / resumeCampaign ────────────────────────────────────────

  describe('pauseCampaign', () => {
    it('should pause the campaign via Meta API and update locally', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        adAccount: mockAdAccount,
      });
      metaApi.updateCampaign.mockResolvedValue({ success: true });
      const paused = { ...mockCampaign, status: 'PAUSED' };
      prisma.campaign.update.mockResolvedValue(paused);

      const result = await service.pauseCampaign(WS_ID, 'camp-1');

      expect(metaApi.updateCampaign).toHaveBeenCalledWith(
        META_CAMPAIGN_ID,
        DECRYPTED_TOKEN,
        { status: 'PAUSED' },
      );
      expect(prisma.campaign.update).toHaveBeenCalledWith({
        where: { id: 'camp-1' },
        data: { status: 'PAUSED', localVersion: { increment: 1 }, syncStatus: 'SYNCED' },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result).toEqual(paused);
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        adAccount: { ...mockAdAccount, workspaceId: 'other-ws' },
      });

      await expect(service.pauseCampaign(WS_ID, 'camp-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('resumeCampaign', () => {
    it('should resume the campaign via Meta API and update locally', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        adAccount: mockAdAccount,
      });
      metaApi.updateCampaign.mockResolvedValue({ success: true });
      const active = { ...mockCampaign, status: 'ACTIVE' };
      prisma.campaign.update.mockResolvedValue(active);

      const result = await service.resumeCampaign(WS_ID, 'camp-1');

      expect(metaApi.updateCampaign).toHaveBeenCalledWith(
        META_CAMPAIGN_ID,
        DECRYPTED_TOKEN,
        { status: 'ACTIVE' },
      );
      expect(result.status).toBe('ACTIVE');
    });
  });

  // ─── duplicateCampaign ─────────────────────────────────────────────────────

  describe('duplicateCampaign', () => {
    it('should duplicate a campaign with "(Copy)" suffix', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        adAccount: mockAdAccount,
      });
      metaApi.createCampaign.mockResolvedValue({ id: 'meta-camp-copy' });
      const copy = { ...mockCampaign, id: 'camp-copy', name: 'Test Campaign (Copy)', metaCampaignId: 'meta-camp-copy' };
      prisma.campaign.create.mockResolvedValue(copy);

      const result = await service.duplicateCampaign(WS_ID, 'camp-1');

      expect(metaApi.createCampaign).toHaveBeenCalledWith(
        META_ACCOUNT_ID,
        DECRYPTED_TOKEN,
        expect.objectContaining({
          name: 'Test Campaign (Copy)',
          status: 'PAUSED',
        }),
      );
      expect(prisma.campaign.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Campaign (Copy)',
          metaCampaignId: 'meta-camp-copy',
          status: 'PAUSED',
          syncStatus: 'SYNCED',
        }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'DUPLICATE',
            changes: { sourceId: 'camp-1' },
          }),
        }),
      );
      expect(result).toEqual(copy);
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        adAccount: { ...mockAdAccount, workspaceId: 'other-ws' },
      });

      await expect(service.duplicateCampaign(WS_ID, 'camp-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── deleteCampaign ────────────────────────────────────────────────────────

  describe('deleteCampaign', () => {
    it('should soft-delete the campaign and call Meta deleteEntity', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        adAccount: mockAdAccount,
      });
      metaApi.deleteEntity.mockResolvedValue({ success: true });
      const deleted = { ...mockCampaign, status: 'DELETED', deletedAt: new Date() };
      prisma.campaign.update.mockResolvedValue(deleted);

      const result = await service.deleteCampaign(WS_ID, 'camp-1');

      expect(metaApi.deleteEntity).toHaveBeenCalledWith(META_CAMPAIGN_ID, DECRYPTED_TOKEN);
      expect(prisma.campaign.update).toHaveBeenCalledWith({
        where: { id: 'camp-1' },
        data: { status: 'DELETED', deletedAt: expect.any(Date) },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.status).toBe('DELETED');
    });

    it('should skip Meta API call if campaign has no metaCampaignId', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        metaCampaignId: null,
        adAccount: mockAdAccount,
      });
      prisma.campaign.update.mockResolvedValue({ ...mockCampaign, status: 'DELETED' });

      await service.deleteCampaign(WS_ID, 'camp-1');

      expect(metaApi.deleteEntity).not.toHaveBeenCalled();
      expect(prisma.campaign.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        adAccount: { ...mockAdAccount, workspaceId: 'other-ws' },
      });

      await expect(service.deleteCampaign(WS_ID, 'camp-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getAdSets ─────────────────────────────────────────────────────────────

  describe('getAdSets', () => {
    it('should return a paginated list of ad sets', async () => {
      const items = [
        { ...mockAdSet, id: 'as1' },
        { ...mockAdSet, id: 'as2' },
      ];
      prisma.adSet.findMany.mockResolvedValue(items);

      const result = await service.getAdSets(WS_ID, { limit: 25 });

      expect(prisma.adSet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adAccount: { workspaceId: WS_ID },
            deletedAt: null,
          }),
          take: 26,
          orderBy: { updatedAt: 'desc' },
        }),
      );
      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it('should handle empty results', async () => {
      prisma.adSet.findMany.mockResolvedValue([]);

      const result = await service.getAdSets(WS_ID, {});

      expect(result.data).toHaveLength(0);
      expect(result.cursor).toBeNull();
      expect(result.hasMore).toBe(false);
    });

    it('should filter by campaignId, status, and search', async () => {
      prisma.adSet.findMany.mockResolvedValue([]);

      await service.getAdSets(WS_ID, {
        campaignId: 'camp-1',
        status: 'ACTIVE',
        search: 'test',
      });

      expect(prisma.adSet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            campaignId: 'camp-1',
            status: 'ACTIVE',
            name: { contains: 'test', mode: 'insensitive' },
          }),
        }),
      );
    });
  });

  // ─── getAdSetById ──────────────────────────────────────────────────────────

  describe('getAdSetById', () => {
    it('should return an ad set with ads included', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue(mockAdSet);

      const result = await service.getAdSetById(WS_ID, 'adset-1');

      expect(prisma.adSet.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'adset-1' },
        include: expect.objectContaining({
          adAccount: expect.any(Object),
          ads: expect.any(Object),
          campaign: expect.any(Object),
        }),
      });
      expect(result).toEqual(mockAdSet);
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        adAccount: { workspaceId: 'other-ws' },
      });

      await expect(service.getAdSetById(WS_ID, 'adset-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── createAdSet ───────────────────────────────────────────────────────────

  describe('createAdSet', () => {
    const dto = {
      accountId: ACCOUNT_ID,
      campaignId: 'camp-1',
      name: 'New AdSet',
      targeting: { geo_locations: { countries: ['US'] } },
      placements: { facebook: ['feed'] },
      dailyBudget: 25,
      optimizationGoal: 'LINK_CLICKS',
      billingEvent: 'IMPRESSIONS',
    };

    it('should create an ad set via Meta API and persist locally', async () => {
      prisma.adAccount.findFirstOrThrow.mockResolvedValue(mockAdAccount);
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        metaCampaignId: META_CAMPAIGN_ID,
      });
      metaApi.createAdSet.mockResolvedValue({ id: META_ADSET_ID });
      const created = { ...mockAdSet, id: 'adset-new' };
      prisma.adSet.create.mockResolvedValue(created);

      const result = await service.createAdSet(WS_ID, dto);

      expect(metaApi.createAdSet).toHaveBeenCalledWith(
        META_ACCOUNT_ID,
        DECRYPTED_TOKEN,
        expect.objectContaining({
          name: 'New AdSet',
          campaign_id: META_CAMPAIGN_ID,
          status: 'PAUSED',
          daily_budget: 2500,
        }),
      );
      expect(prisma.adSet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adAccountId: ACCOUNT_ID,
          campaignId: 'camp-1',
          metaAdSetId: META_ADSET_ID,
          name: 'New AdSet',
          status: 'PAUSED',
          syncStatus: 'SYNCED',
        }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('should throw BadRequestException if campaign not synced to Meta', async () => {
      prisma.adAccount.findFirstOrThrow.mockResolvedValue(mockAdAccount);
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        metaCampaignId: null,
      });

      await expect(service.createAdSet(WS_ID, dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── updateAdSet ───────────────────────────────────────────────────────────

  describe('updateAdSet', () => {
    const dto = { name: 'Updated AdSet', dailyBudget: 30 };

    it('should update ad set on Meta and locally', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        adAccount: mockAdAccount,
      });
      metaApi.updateAdSet.mockResolvedValue({ success: true });
      const updated = { ...mockAdSet, name: 'Updated AdSet' };
      prisma.adSet.update.mockResolvedValue(updated);

      const result = await service.updateAdSet(WS_ID, 'adset-1', dto);

      expect(metaApi.updateAdSet).toHaveBeenCalledWith(
        META_ADSET_ID,
        DECRYPTED_TOKEN,
        expect.objectContaining({
          name: 'Updated AdSet',
          daily_budget: 3000,
        }),
      );
      expect(prisma.adSet.update).toHaveBeenCalledWith({
        where: { id: 'adset-1' },
        data: expect.objectContaining({
          localVersion: { increment: 1 },
          syncStatus: 'SYNCED',
        }),
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        adAccount: { ...mockAdAccount, workspaceId: 'other-ws' },
      });

      await expect(service.updateAdSet(WS_ID, 'adset-1', dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if ad set not synced to Meta', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        metaAdSetId: null,
        adAccount: mockAdAccount,
      });

      await expect(service.updateAdSet(WS_ID, 'adset-1', dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── pauseAdSet / resumeAdSet ──────────────────────────────────────────────

  describe('pauseAdSet', () => {
    it('should pause the ad set via Meta API and update locally', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        adAccount: mockAdAccount,
      });
      metaApi.updateAdSet.mockResolvedValue({ success: true });
      const paused = { ...mockAdSet, status: 'PAUSED' };
      prisma.adSet.update.mockResolvedValue(paused);

      const result = await service.pauseAdSet(WS_ID, 'adset-1');

      expect(metaApi.updateAdSet).toHaveBeenCalledWith(
        META_ADSET_ID,
        DECRYPTED_TOKEN,
        { status: 'PAUSED' },
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result).toEqual(paused);
    });
  });

  describe('resumeAdSet', () => {
    it('should resume the ad set via Meta API and update locally', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        adAccount: mockAdAccount,
      });
      metaApi.updateAdSet.mockResolvedValue({ success: true });
      const active = { ...mockAdSet, status: 'ACTIVE' };
      prisma.adSet.update.mockResolvedValue(active);

      const result = await service.resumeAdSet(WS_ID, 'adset-1');

      expect(metaApi.updateAdSet).toHaveBeenCalledWith(
        META_ADSET_ID,
        DECRYPTED_TOKEN,
        { status: 'ACTIVE' },
      );
      expect(result.status).toBe('ACTIVE');
    });
  });

  // ─── getAds ────────────────────────────────────────────────────────────────

  describe('getAds', () => {
    it('should return a paginated list of ads', async () => {
      const items = [
        { ...mockAd, id: 'ad1' },
        { ...mockAd, id: 'ad2' },
      ];
      prisma.ad.findMany.mockResolvedValue(items);

      const result = await service.getAds(WS_ID, { limit: 25 });

      expect(prisma.ad.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adAccount: { workspaceId: WS_ID },
            deletedAt: null,
          }),
          take: 26,
          orderBy: { updatedAt: 'desc' },
        }),
      );
      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it('should handle empty results', async () => {
      prisma.ad.findMany.mockResolvedValue([]);

      const result = await service.getAds(WS_ID, {});

      expect(result.data).toHaveLength(0);
      expect(result.cursor).toBeNull();
      expect(result.hasMore).toBe(false);
    });

    it('should filter by adsetId, status, and search', async () => {
      prisma.ad.findMany.mockResolvedValue([]);

      await service.getAds(WS_ID, {
        adsetId: 'adset-1',
        status: 'ACTIVE',
        search: 'promo',
      });

      expect(prisma.ad.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adSetId: 'adset-1',
            status: 'ACTIVE',
            name: { contains: 'promo', mode: 'insensitive' },
          }),
        }),
      );
    });
  });

  // ─── getAdById ─────────────────────────────────────────────────────────────

  describe('getAdById', () => {
    it('should return an ad with adSet included', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue(mockAd);

      const result = await service.getAdById(WS_ID, 'ad-1');

      expect(prisma.ad.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'ad-1' },
        include: expect.objectContaining({
          adAccount: expect.any(Object),
          adSet: expect.any(Object),
        }),
      });
      expect(result).toEqual(mockAd);
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        adAccount: { workspaceId: 'other-ws' },
      });

      await expect(service.getAdById(WS_ID, 'ad-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── createAd ──────────────────────────────────────────────────────────────

  describe('createAd', () => {
    const dto = {
      accountId: ACCOUNT_ID,
      adsetId: 'adset-1',
      name: 'New Ad',
      creativeSpec: { creative_id: 'cr-1' },
    };

    it('should create an ad via Meta API and persist locally', async () => {
      prisma.adAccount.findFirstOrThrow.mockResolvedValue(mockAdAccount);
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        metaAdSetId: META_ADSET_ID,
      });
      metaApi.createAd.mockResolvedValue({ id: META_AD_ID });
      const created = { ...mockAd, id: 'ad-new' };
      prisma.ad.create.mockResolvedValue(created);

      const result = await service.createAd(WS_ID, dto);

      expect(metaApi.createAd).toHaveBeenCalledWith(
        META_ACCOUNT_ID,
        DECRYPTED_TOKEN,
        expect.objectContaining({
          name: 'New Ad',
          adset_id: META_ADSET_ID,
          status: 'PAUSED',
          creative: { creative_id: 'cr-1' },
        }),
      );
      expect(prisma.ad.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adAccountId: ACCOUNT_ID,
          adSetId: 'adset-1',
          metaAdId: META_AD_ID,
          name: 'New Ad',
          status: 'PAUSED',
          syncStatus: 'SYNCED',
        }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('should throw BadRequestException if ad set not synced to Meta', async () => {
      prisma.adAccount.findFirstOrThrow.mockResolvedValue(mockAdAccount);
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        metaAdSetId: null,
      });

      await expect(service.createAd(WS_ID, dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── updateAd ──────────────────────────────────────────────────────────────

  describe('updateAd', () => {
    const dto = { name: 'Updated Ad', creativeSpec: { creative_id: 'cr-2' } };

    it('should update ad on Meta and locally', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        adAccount: mockAdAccount,
      });
      metaApi.updateAd.mockResolvedValue({ success: true });
      const updated = { ...mockAd, name: 'Updated Ad' };
      prisma.ad.update.mockResolvedValue(updated);

      const result = await service.updateAd(WS_ID, 'ad-1', dto);

      expect(metaApi.updateAd).toHaveBeenCalledWith(
        META_AD_ID,
        DECRYPTED_TOKEN,
        expect.objectContaining({
          name: 'Updated Ad',
          creative: { creative_id: 'cr-2' },
        }),
      );
      expect(prisma.ad.update).toHaveBeenCalledWith({
        where: { id: 'ad-1' },
        data: expect.objectContaining({
          localVersion: { increment: 1 },
          syncStatus: 'SYNCED',
        }),
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        adAccount: { ...mockAdAccount, workspaceId: 'other-ws' },
      });

      await expect(service.updateAd(WS_ID, 'ad-1', dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if ad not synced to Meta', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        metaAdId: null,
        adAccount: mockAdAccount,
      });

      await expect(service.updateAd(WS_ID, 'ad-1', dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── pauseAd / resumeAd ───────────────────────────────────────────────────

  describe('pauseAd', () => {
    it('should pause the ad via Meta API and update locally', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        adAccount: mockAdAccount,
      });
      metaApi.updateAd.mockResolvedValue({ success: true });
      const paused = { ...mockAd, status: 'PAUSED' };
      prisma.ad.update.mockResolvedValue(paused);

      const result = await service.pauseAd(WS_ID, 'ad-1');

      expect(metaApi.updateAd).toHaveBeenCalledWith(
        META_AD_ID,
        DECRYPTED_TOKEN,
        { status: 'PAUSED' },
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result).toEqual(paused);
    });
  });

  describe('resumeAd', () => {
    it('should resume the ad via Meta API and update locally', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        adAccount: mockAdAccount,
      });
      metaApi.updateAd.mockResolvedValue({ success: true });
      const active = { ...mockAd, status: 'ACTIVE' };
      prisma.ad.update.mockResolvedValue(active);

      const result = await service.resumeAd(WS_ID, 'ad-1');

      expect(metaApi.updateAd).toHaveBeenCalledWith(
        META_AD_ID,
        DECRYPTED_TOKEN,
        { status: 'ACTIVE' },
      );
      expect(result.status).toBe('ACTIVE');
    });
  });

  // ─── getTree ───────────────────────────────────────────────────────────────

  describe('getTree', () => {
    it('should return campaign tree with ad sets and ads', async () => {
      prisma.adAccount.findFirst.mockResolvedValue(mockAdAccount);
      const tree = [
        {
          ...mockCampaign,
          adSets: [
            {
              ...mockAdSet,
              ads: [mockAd],
            },
          ],
        },
      ];
      prisma.campaign.findMany.mockResolvedValue(tree);

      const result = await service.getTree(WS_ID, ACCOUNT_ID);

      expect(prisma.adAccount.findFirst).toHaveBeenCalledWith({
        where: { id: ACCOUNT_ID, workspaceId: WS_ID },
      });
      expect(prisma.campaign.findMany).toHaveBeenCalledWith({
        where: { adAccountId: ACCOUNT_ID, deletedAt: null },
        take: 100,
        orderBy: { updatedAt: 'desc' },
        include: {
          adSets: {
            where: { deletedAt: null },
            include: {
              ads: { where: { deletedAt: null } },
            },
          },
        },
      });
      expect(result).toEqual(tree);
      expect(result[0].adSets[0].ads).toHaveLength(1);
    });

    it('should throw NotFoundException if ad account not found', async () => {
      prisma.adAccount.findFirst.mockResolvedValue(null);

      await expect(service.getTree(WS_ID, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException with descriptive message', async () => {
      prisma.adAccount.findFirst.mockResolvedValue(null);

      await expect(service.getTree(WS_ID, 'bad-id')).rejects.toThrow('Ad account not found');
    });
  });

  // ─── duplicateAdSet ────────────────────────────────────────────────────────

  describe('duplicateAdSet', () => {
    it('should duplicate an ad set with "(Copy)" suffix', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        adAccount: mockAdAccount,
        campaign: { ...mockCampaign, metaCampaignId: META_CAMPAIGN_ID },
      });
      metaApi.createAdSet.mockResolvedValue({ id: 'meta-adset-copy' });
      const copy = { ...mockAdSet, id: 'adset-copy', name: 'Test AdSet (Copy)' };
      prisma.adSet.create.mockResolvedValue(copy);

      const result = await service.duplicateAdSet(WS_ID, 'adset-1');

      expect(metaApi.createAdSet).toHaveBeenCalledWith(
        META_ACCOUNT_ID,
        DECRYPTED_TOKEN,
        expect.objectContaining({
          name: 'Test AdSet (Copy)',
          campaign_id: META_CAMPAIGN_ID,
          status: 'PAUSED',
        }),
      );
      expect(prisma.adSet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test AdSet (Copy)',
          metaAdSetId: 'meta-adset-copy',
          status: 'PAUSED',
        }),
      });
      expect(result).toEqual(copy);
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        adAccount: { ...mockAdAccount, workspaceId: 'other-ws' },
        campaign: mockCampaign,
      });

      await expect(service.duplicateAdSet(WS_ID, 'adset-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if campaign not synced to Meta', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        adAccount: mockAdAccount,
        campaign: { ...mockCampaign, metaCampaignId: null },
      });

      await expect(service.duplicateAdSet(WS_ID, 'adset-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ─── deleteAdSet ───────────────────────────────────────────────────────────

  describe('deleteAdSet', () => {
    it('should soft-delete the ad set and call Meta deleteEntity', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        adAccount: mockAdAccount,
      });
      metaApi.deleteEntity.mockResolvedValue({ success: true });
      const deleted = { ...mockAdSet, status: 'DELETED', deletedAt: new Date() };
      prisma.adSet.update.mockResolvedValue(deleted);

      const result = await service.deleteAdSet(WS_ID, 'adset-1');

      expect(metaApi.deleteEntity).toHaveBeenCalledWith(META_ADSET_ID, DECRYPTED_TOKEN);
      expect(prisma.adSet.update).toHaveBeenCalledWith({
        where: { id: 'adset-1' },
        data: { status: 'DELETED', deletedAt: expect.any(Date) },
      });
      expect(result.status).toBe('DELETED');
    });

    it('should skip Meta API call if ad set has no metaAdSetId', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        metaAdSetId: null,
        adAccount: mockAdAccount,
      });
      prisma.adSet.update.mockResolvedValue({ ...mockAdSet, status: 'DELETED' });

      await service.deleteAdSet(WS_ID, 'adset-1');

      expect(metaApi.deleteEntity).not.toHaveBeenCalled();
    });
  });

  // ─── duplicateAd ───────────────────────────────────────────────────────────

  describe('duplicateAd', () => {
    it('should duplicate an ad with "(Copy)" suffix', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        adAccount: mockAdAccount,
        adSet: { ...mockAdSet, metaAdSetId: META_ADSET_ID },
      });
      metaApi.createAd.mockResolvedValue({ id: 'meta-ad-copy' });
      const copy = { ...mockAd, id: 'ad-copy', name: 'Test Ad (Copy)' };
      prisma.ad.create.mockResolvedValue(copy);

      const result = await service.duplicateAd(WS_ID, 'ad-1');

      expect(metaApi.createAd).toHaveBeenCalledWith(
        META_ACCOUNT_ID,
        DECRYPTED_TOKEN,
        expect.objectContaining({
          name: 'Test Ad (Copy)',
          adset_id: META_ADSET_ID,
          status: 'PAUSED',
          creative: { creative_id: 'cr-1' },
        }),
      );
      expect(prisma.ad.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Ad (Copy)',
          metaAdId: 'meta-ad-copy',
          status: 'PAUSED',
        }),
      });
      expect(result).toEqual(copy);
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        adAccount: { ...mockAdAccount, workspaceId: 'other-ws' },
        adSet: mockAdSet,
      });

      await expect(service.duplicateAd(WS_ID, 'ad-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if ad set not synced to Meta', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        adAccount: mockAdAccount,
        adSet: { ...mockAdSet, metaAdSetId: null },
      });

      await expect(service.duplicateAd(WS_ID, 'ad-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ─── deleteAd ──────────────────────────────────────────────────────────────

  describe('deleteAd', () => {
    it('should soft-delete the ad and call Meta deleteEntity', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        adAccount: mockAdAccount,
      });
      metaApi.deleteEntity.mockResolvedValue({ success: true });
      const deleted = { ...mockAd, status: 'DELETED', deletedAt: new Date() };
      prisma.ad.update.mockResolvedValue(deleted);

      const result = await service.deleteAd(WS_ID, 'ad-1');

      expect(metaApi.deleteEntity).toHaveBeenCalledWith(META_AD_ID, DECRYPTED_TOKEN);
      expect(prisma.ad.update).toHaveBeenCalledWith({
        where: { id: 'ad-1' },
        data: { status: 'DELETED', deletedAt: expect.any(Date) },
      });
      expect(result.status).toBe('DELETED');
    });

    it('should skip Meta API call if ad has no metaAdId', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        metaAdId: null,
        adAccount: mockAdAccount,
      });
      prisma.ad.update.mockResolvedValue({ ...mockAd, status: 'DELETED' });

      await service.deleteAd(WS_ID, 'ad-1');

      expect(metaApi.deleteEntity).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if workspace does not match', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        adAccount: { ...mockAdAccount, workspaceId: 'other-ws' },
      });

      await expect(service.deleteAd(WS_ID, 'ad-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── updateEntityStatus (via pause/resume, entity without metaId) ─────────

  describe('updateEntityStatus edge cases', () => {
    it('should skip Meta API call when entity has no meta ID (campaign)', async () => {
      prisma.campaign.findUniqueOrThrow.mockResolvedValue({
        ...mockCampaign,
        metaCampaignId: null,
        adAccount: mockAdAccount,
      });
      prisma.campaign.update.mockResolvedValue({ ...mockCampaign, status: 'PAUSED' });

      await service.pauseCampaign(WS_ID, 'camp-1');

      expect(metaApi.updateCampaign).not.toHaveBeenCalled();
      expect(prisma.campaign.update).toHaveBeenCalled();
    });

    it('should skip Meta API call when entity has no meta ID (ad set)', async () => {
      prisma.adSet.findUniqueOrThrow.mockResolvedValue({
        ...mockAdSet,
        metaAdSetId: null,
        adAccount: mockAdAccount,
      });
      prisma.adSet.update.mockResolvedValue({ ...mockAdSet, status: 'ACTIVE' });

      await service.resumeAdSet(WS_ID, 'adset-1');

      expect(metaApi.updateAdSet).not.toHaveBeenCalled();
      expect(prisma.adSet.update).toHaveBeenCalled();
    });

    it('should skip Meta API call when entity has no meta ID (ad)', async () => {
      prisma.ad.findUniqueOrThrow.mockResolvedValue({
        ...mockAd,
        metaAdId: null,
        adAccount: mockAdAccount,
      });
      prisma.ad.update.mockResolvedValue({ ...mockAd, status: 'PAUSED' });

      await service.pauseAd(WS_ID, 'ad-1');

      expect(metaApi.updateAd).not.toHaveBeenCalled();
      expect(prisma.ad.update).toHaveBeenCalled();
    });
  });
});

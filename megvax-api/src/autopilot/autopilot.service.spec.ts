import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AutopilotService } from './autopilot.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Mocks ──────────────────────────────────────────────
const prisma: Record<string, any> = {
  adAccount: {
    findFirst: jest.fn(),
  },
  autopilotConfig: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
  autopilotAction: {
    findMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

const mockAccount = { id: 'acc-1', workspaceId: 'ws-1' };

const mockConfig = {
  id: 'cfg-1',
  adAccountId: 'acc-1',
  actionTiers: {
    PAUSE_UNDERPERFORMER: 'SUGGEST_ACT',
    SCALE_WINNER: 'SUGGEST_WAIT',
    REALLOCATE_BUDGET: 'SUGGEST_WAIT',
    FREQUENCY_CAP: 'AUTO',
    SCHEDULE_OPTIMIZE: 'SUGGEST_ACT',
  },
  pauseThresholds: { cpa_max: 100, roas_min: 0.5, frequency_max: 5 },
  scaleThresholds: { roas_min: 2.0, conversions_min: 10 },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAction = (overrides: Record<string, any> = {}) => ({
  id: 'act-1',
  adAccountId: 'acc-1',
  status: 'PENDING',
  type: 'PAUSE_UNDERPERFORMER',
  createdAt: new Date(),
  adAccount: mockAccount,
  ...overrides,
});

describe('AutopilotService', () => {
  let service: AutopilotService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Default: account exists
    prisma.adAccount.findFirst.mockResolvedValue(mockAccount);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutopilotService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AutopilotService>(AutopilotService);
  });

  // ── getConfig ───────────────────────────────────────
  describe('getConfig', () => {
    it('should return existing config when one exists', async () => {
      prisma.autopilotConfig.findUnique.mockResolvedValue(mockConfig);

      const result = await service.getConfig('ws-1', 'acc-1');

      expect(result).toEqual(mockConfig);
      expect(prisma.autopilotConfig.findUnique).toHaveBeenCalledWith({
        where: { adAccountId: 'acc-1' },
      });
      expect(prisma.autopilotConfig.create).not.toHaveBeenCalled();
    });

    it('should create default config when none exists', async () => {
      prisma.autopilotConfig.findUnique.mockResolvedValue(null);
      prisma.autopilotConfig.create.mockResolvedValue(mockConfig);

      const result = await service.getConfig('ws-1', 'acc-1');

      expect(prisma.autopilotConfig.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adAccountId: 'acc-1',
          actionTiers: expect.objectContaining({
            PAUSE_UNDERPERFORMER: 'SUGGEST_ACT',
            FREQUENCY_CAP: 'AUTO',
          }),
          pauseThresholds: expect.objectContaining({ cpa_max: 100 }),
          scaleThresholds: expect.objectContaining({ roas_min: 2.0 }),
        }),
      });
      expect(result).toEqual(mockConfig);
    });

    it('should throw NotFoundException when account does not belong to workspace', async () => {
      prisma.adAccount.findFirst.mockResolvedValue(null);

      await expect(service.getConfig('ws-1', 'acc-missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateConfig ────────────────────────────────────
  describe('updateConfig', () => {
    it('should upsert config with the provided dto', async () => {
      const dto = {
        actionTiers: { PAUSE_UNDERPERFORMER: 'AUTO' },
        pauseThresholds: { cpa_max: 50 },
        scaleThresholds: { roas_min: 3.0 },
      };
      prisma.autopilotConfig.upsert.mockResolvedValue({ ...mockConfig, ...dto });

      const result = await service.updateConfig('ws-1', 'acc-1', dto as any);

      expect(prisma.autopilotConfig.upsert).toHaveBeenCalledWith({
        where: { adAccountId: 'acc-1' },
        update: dto,
        create: expect.objectContaining({
          adAccountId: 'acc-1',
          actionTiers: dto.actionTiers,
          pauseThresholds: dto.pauseThresholds,
          scaleThresholds: dto.scaleThresholds,
        }),
      });
      expect(result.actionTiers).toEqual(dto.actionTiers);
    });

    it('should default to empty objects when dto fields are absent', async () => {
      const dto = {};
      prisma.autopilotConfig.upsert.mockResolvedValue(mockConfig);

      await service.updateConfig('ws-1', 'acc-1', dto as any);

      expect(prisma.autopilotConfig.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            actionTiers: {},
            pauseThresholds: {},
            scaleThresholds: {},
          }),
        }),
      );
    });
  });

  // ── getActions ──────────────────────────────────────
  describe('getActions', () => {
    it('should return paginated actions', async () => {
      const actions = Array.from({ length: 3 }, (_, i) =>
        mockAction({ id: `act-${i}` }),
      );
      prisma.autopilotAction.findMany.mockResolvedValue(actions);

      const result = await service.getActions('ws-1', {
        accountId: 'acc-1',
        limit: 25,
      } as any);

      expect(result.data).toHaveLength(3);
      expect(result.hasMore).toBe(false);
      expect(result.cursor).toBeNull();
    });

    it('should set hasMore and cursor when more items exist', async () => {
      // Return limit + 1 items to signal there are more
      const actions = Array.from({ length: 26 }, (_, i) =>
        mockAction({ id: `act-${i}` }),
      );
      prisma.autopilotAction.findMany.mockResolvedValue(actions);

      const result = await service.getActions('ws-1', {
        accountId: 'acc-1',
        limit: 25,
      } as any);

      expect(result.data).toHaveLength(25);
      expect(result.hasMore).toBe(true);
      expect(result.cursor).toBe('act-24');
    });

    it('should apply status filter', async () => {
      prisma.autopilotAction.findMany.mockResolvedValue([]);

      await service.getActions('ws-1', {
        accountId: 'acc-1',
        status: 'PENDING',
      } as any);

      expect(prisma.autopilotAction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });

    it('should apply date filters', async () => {
      prisma.autopilotAction.findMany.mockResolvedValue([]);

      await service.getActions('ws-1', {
        accountId: 'acc-1',
        from: '2026-01-01',
        to: '2026-01-31',
      } as any);

      expect(prisma.autopilotAction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date('2026-01-01'),
              lte: new Date('2026-01-31'),
            },
          }),
        }),
      );
    });

    it('should use cursor-based pagination when cursor is provided', async () => {
      prisma.autopilotAction.findMany.mockResolvedValue([]);

      await service.getActions('ws-1', {
        accountId: 'acc-1',
        cursor: 'act-50',
      } as any);

      expect(prisma.autopilotAction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: 'act-50' },
        }),
      );
    });
  });

  // ── approveAction ───────────────────────────────────
  describe('approveAction', () => {
    it('should move PENDING action to SCHEDULED', async () => {
      prisma.autopilotAction.findUniqueOrThrow.mockResolvedValue(mockAction());
      prisma.autopilotAction.update.mockResolvedValue(
        mockAction({ status: 'SCHEDULED', scheduledFor: new Date() }),
      );

      const result = await service.approveAction('ws-1', 'act-1');

      expect(prisma.autopilotAction.update).toHaveBeenCalledWith({
        where: { id: 'act-1' },
        data: { status: 'SCHEDULED', scheduledFor: expect.any(Date) },
      });
      expect(result.status).toBe('SCHEDULED');
    });

    it('should throw NotFoundException when action workspace does not match', async () => {
      prisma.autopilotAction.findUniqueOrThrow.mockResolvedValue(
        mockAction({ adAccount: { workspaceId: 'ws-other' } }),
      );

      await expect(service.approveAction('ws-1', 'act-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw when action is not PENDING', async () => {
      prisma.autopilotAction.findUniqueOrThrow.mockResolvedValue(
        mockAction({ status: 'EXECUTED' }),
      );

      await expect(service.approveAction('ws-1', 'act-1')).rejects.toThrow('Action is not pending');
    });
  });

  // ── cancelAction ────────────────────────────────────
  describe('cancelAction', () => {
    it('should cancel a PENDING action', async () => {
      prisma.autopilotAction.findUniqueOrThrow.mockResolvedValue(mockAction({ status: 'PENDING' }));
      prisma.autopilotAction.update.mockResolvedValue(
        mockAction({ status: 'CANCELLED', cancelledAt: new Date(), cancelledById: 'user-1' }),
      );

      const result = await service.cancelAction('ws-1', 'act-1', 'user-1');

      expect(prisma.autopilotAction.update).toHaveBeenCalledWith({
        where: { id: 'act-1' },
        data: {
          status: 'CANCELLED',
          cancelledAt: expect.any(Date),
          cancelledById: 'user-1',
        },
      });
      expect(result.status).toBe('CANCELLED');
    });

    it('should cancel a SCHEDULED action', async () => {
      prisma.autopilotAction.findUniqueOrThrow.mockResolvedValue(
        mockAction({ status: 'SCHEDULED' }),
      );
      prisma.autopilotAction.update.mockResolvedValue(mockAction({ status: 'CANCELLED' }));

      const result = await service.cancelAction('ws-1', 'act-1', 'user-1');

      expect(result.status).toBe('CANCELLED');
    });

    it('should throw when action is already EXECUTED', async () => {
      prisma.autopilotAction.findUniqueOrThrow.mockResolvedValue(
        mockAction({ status: 'EXECUTED' }),
      );

      await expect(service.cancelAction('ws-1', 'act-1', 'user-1')).rejects.toThrow(
        'Action cannot be cancelled',
      );
    });

    it('should throw NotFoundException when action workspace does not match', async () => {
      prisma.autopilotAction.findUniqueOrThrow.mockResolvedValue(
        mockAction({ adAccount: { workspaceId: 'ws-other' } }),
      );

      await expect(service.cancelAction('ws-1', 'act-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── getStats ────────────────────────────────────────
  describe('getStats', () => {
    it('should return correct counts by status', async () => {
      prisma.autopilotAction.count
        .mockResolvedValueOnce(50)   // total
        .mockResolvedValueOnce(30)   // executed
        .mockResolvedValueOnce(10)   // cancelled
        .mockResolvedValueOnce(10);  // pending

      const result = await service.getStats('ws-1', 'acc-1');

      expect(result).toEqual({ total: 50, executed: 30, cancelled: 10, pending: 10 });
      expect(prisma.autopilotAction.count).toHaveBeenCalledTimes(4);
    });

    it('should apply date filters when provided', async () => {
      prisma.autopilotAction.count.mockResolvedValue(0);

      await service.getStats('ws-1', 'acc-1', '2026-01-01', '2026-01-31');

      // The first call (total) should include date filters
      expect(prisma.autopilotAction.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adAccountId: 'acc-1',
            createdAt: {
              gte: new Date('2026-01-01'),
              lte: new Date('2026-01-31'),
            },
          }),
        }),
      );
    });

    it('should throw NotFoundException when account does not belong to workspace', async () => {
      prisma.adAccount.findFirst.mockResolvedValue(null);

      await expect(service.getStats('ws-1', 'acc-missing')).rejects.toThrow(NotFoundException);
    });
  });
});

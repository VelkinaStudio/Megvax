import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ActionQueryDto } from './dto/action-query.dto';

@Injectable()
export class AutopilotService {
  constructor(private prisma: PrismaService) {}

  async getConfig(workspaceId: string, accountId: string) {
    await this.verifyAccountAccess(workspaceId, accountId);
    let config = await this.prisma.autopilotConfig.findUnique({
      where: { adAccountId: accountId },
    });
    if (!config) {
      // Create default config
      config = await this.prisma.autopilotConfig.create({
        data: {
          adAccountId: accountId,
          actionTiers: {
            PAUSE_UNDERPERFORMER: 'SUGGEST_ACT',
            SCALE_WINNER: 'SUGGEST_WAIT',
            REALLOCATE_BUDGET: 'SUGGEST_WAIT',
            FREQUENCY_CAP: 'AUTO',
            SCHEDULE_OPTIMIZE: 'SUGGEST_ACT',
          },
          pauseThresholds: { cpa_max: 100, roas_min: 0.5, frequency_max: 5 },
          scaleThresholds: { roas_min: 2.0, conversions_min: 10 },
        },
      });
    }
    return config;
  }

  async updateConfig(workspaceId: string, accountId: string, dto: UpdateConfigDto) {
    await this.verifyAccountAccess(workspaceId, accountId);
    return this.prisma.autopilotConfig.upsert({
      where: { adAccountId: accountId },
      update: dto,
      create: {
        adAccountId: accountId,
        actionTiers: dto.actionTiers || {},
        pauseThresholds: dto.pauseThresholds || {},
        scaleThresholds: dto.scaleThresholds || {},
        ...dto,
      },
    });
  }

  async getActions(workspaceId: string, query: ActionQueryDto) {
    await this.verifyAccountAccess(workspaceId, query.accountId);
    const limit = query.limit || 25;
    const where: any = { adAccountId: query.accountId };
    if (query.status) where.status = query.status;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const items = await this.prisma.autopilotAction.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    return { data, cursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async approveAction(workspaceId: string, actionId: string) {
    const action = await this.prisma.autopilotAction.findUniqueOrThrow({
      where: { id: actionId },
      include: { adAccount: true },
    });
    if (action.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (action.status !== 'PENDING') throw new Error('Action is not pending');

    // Mark as SCHEDULED for immediate execution
    return this.prisma.autopilotAction.update({
      where: { id: actionId },
      data: { status: 'SCHEDULED', scheduledFor: new Date() },
    });
  }

  async cancelAction(workspaceId: string, actionId: string, userId: string) {
    const action = await this.prisma.autopilotAction.findUniqueOrThrow({
      where: { id: actionId },
      include: { adAccount: true },
    });
    if (action.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (!['PENDING', 'SCHEDULED'].includes(action.status)) throw new Error('Action cannot be cancelled');

    return this.prisma.autopilotAction.update({
      where: { id: actionId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelledById: userId },
    });
  }

  async getStats(workspaceId: string, accountId: string, from?: string, to?: string) {
    await this.verifyAccountAccess(workspaceId, accountId);
    const where: any = { adAccountId: accountId };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [total, executed, cancelled, pending] = await Promise.all([
      this.prisma.autopilotAction.count({ where }),
      this.prisma.autopilotAction.count({ where: { ...where, status: 'EXECUTED' } }),
      this.prisma.autopilotAction.count({ where: { ...where, status: 'CANCELLED' } }),
      this.prisma.autopilotAction.count({ where: { ...where, status: 'PENDING' } }),
    ]);

    return { total, executed, cancelled, pending };
  }

  private async verifyAccountAccess(workspaceId: string, accountId: string) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');
  }
}

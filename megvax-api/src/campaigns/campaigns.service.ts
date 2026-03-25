import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetaApiClient } from '../meta/meta-api.client';
import { EncryptionService } from '../meta/encryption.service';
import { CampaignQueryDto, AdSetQueryDto, AdQueryDto } from './dto/campaign-query.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CreateAdSetDto } from './dto/create-adset.dto';
import { UpdateAdSetDto } from './dto/update-adset.dto';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private metaApi: MetaApiClient,
    private encryption: EncryptionService,
  ) {}

  // ─── Read Methods ──────────────────────────────────────────────────────────

  async getCampaigns(workspaceId: string, query: CampaignQueryDto): Promise<PaginatedResponse<any>> {
    const limit = query.limit || 25;
    const where: any = {
      adAccount: { workspaceId },
      deletedAt: null,
    };
    if (query.accountId) where.adAccountId = query.accountId;
    if (query.status) where.status = query.status;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const items = await this.prisma.campaign.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: { [query.sort || 'updatedAt']: 'desc' },
      include: {
        _count: { select: { adSets: true } },
        adAccount: { select: { name: true, currency: true } },
      },
    });

    const hasMore = items.length > limit;
    const data = items.slice(0, limit);

    return {
      data,
      cursor: data.length > 0 ? data[data.length - 1].id : null,
      hasMore,
    };
  }

  async getCampaignById(workspaceId: string, id: string) {
    const campaign = await this.prisma.campaign.findUniqueOrThrow({
      where: { id },
      include: {
        adAccount: { select: { workspaceId: true, name: true, currency: true } },
        adSets: { where: { deletedAt: null }, include: { _count: { select: { ads: true } } } },
      },
    });
    if (campaign.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    return campaign;
  }

  async getTree(workspaceId: string, accountId: string) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');

    return this.prisma.campaign.findMany({
      where: { adAccountId: accountId, deletedAt: null },
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
  }

  async getAdSets(workspaceId: string, query: AdSetQueryDto): Promise<PaginatedResponse<any>> {
    const limit = query.limit || 25;
    const where: any = {
      adAccount: { workspaceId },
      deletedAt: null,
    };
    if (query.campaignId) where.campaignId = query.campaignId;
    if (query.status) where.status = query.status;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const items = await this.prisma.adSet.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { ads: true } } },
    });

    const hasMore = items.length > limit;
    const data = items.slice(0, limit);
    return { data, cursor: data.length > 0 ? data[data.length - 1].id : null, hasMore };
  }

  async getAdSetById(workspaceId: string, id: string) {
    const adSet = await this.prisma.adSet.findUniqueOrThrow({
      where: { id },
      include: {
        adAccount: { select: { workspaceId: true } },
        ads: { where: { deletedAt: null } },
        campaign: { select: { name: true, id: true } },
      },
    });
    if (adSet.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    return adSet;
  }

  async getAds(workspaceId: string, query: AdQueryDto): Promise<PaginatedResponse<any>> {
    const limit = query.limit || 25;
    const where: any = {
      adAccount: { workspaceId },
      deletedAt: null,
    };
    if (query.adsetId) where.adSetId = query.adsetId;
    if (query.status) where.status = query.status;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const items = await this.prisma.ad.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: { updatedAt: 'desc' },
    });

    const hasMore = items.length > limit;
    const data = items.slice(0, limit);
    return { data, cursor: data.length > 0 ? data[data.length - 1].id : null, hasMore };
  }

  async getAdById(workspaceId: string, id: string) {
    const ad = await this.prisma.ad.findUniqueOrThrow({
      where: { id },
      include: {
        adAccount: { select: { workspaceId: true } },
        adSet: { select: { name: true, id: true } },
      },
    });
    if (ad.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    return ad;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async getAccessToken(adAccountId: string): Promise<{ token: string; metaAccountId: string }> {
    const account = await this.prisma.adAccount.findUniqueOrThrow({
      where: { id: adAccountId },
      include: { metaConnection: true },
    });
    return {
      token: this.encryption.decrypt(account.metaConnection.accessToken),
      metaAccountId: account.metaAccountId,
    };
  }

  private async logAudit(
    workspaceId: string,
    userId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    changes: any,
    source: string = 'USER',
  ) {
    await this.prisma.auditLog.create({
      data: { workspaceId, userId, action, entityType, entityId, changes, source: source as any },
    });
  }

  private async updateEntityStatus(
    workspaceId: string,
    entityType: 'campaign' | 'adset' | 'ad',
    entityId: string,
    newStatus: 'ACTIVE' | 'PAUSED',
  ) {
    const model =
      entityType === 'campaign'
        ? this.prisma.campaign
        : entityType === 'adset'
          ? this.prisma.adSet
          : this.prisma.ad;

    const entity = await (model as any).findUniqueOrThrow({
      where: { id: entityId },
      include: { adAccount: true },
    });
    if (entity.adAccount.workspaceId !== workspaceId) throw new NotFoundException();

    const metaId = entity.metaCampaignId || entity.metaAdSetId || entity.metaAdId;
    if (metaId) {
      const { token } = await this.getAccessToken(entity.adAccountId);
      const updateFn =
        entityType === 'campaign'
          ? this.metaApi.updateCampaign
          : entityType === 'adset'
            ? this.metaApi.updateAdSet
            : this.metaApi.updateAd;
      await updateFn.call(this.metaApi, metaId, token, { status: newStatus });
    }

    return (model as any).update({
      where: { id: entityId },
      data: { status: newStatus, localVersion: { increment: 1 }, syncStatus: 'SYNCED' },
    });
  }

  // ─── Campaign Write Methods ────────────────────────────────────────────────

  async createCampaign(workspaceId: string, dto: CreateCampaignDto) {
    const account = await this.prisma.adAccount.findFirstOrThrow({
      where: { id: dto.accountId, workspaceId },
    });
    const { token, metaAccountId } = await this.getAccessToken(account.id);

    const metaResult = await this.metaApi.createCampaign(metaAccountId, token, {
      name: dto.name,
      objective: dto.objective,
      status: 'PAUSED',
      daily_budget: dto.dailyBudget ? Math.round(dto.dailyBudget * 100) : undefined,
      lifetime_budget: dto.lifetimeBudget ? Math.round(dto.lifetimeBudget * 100) : undefined,
      bid_strategy: dto.bidStrategy,
      special_ad_categories: dto.specialAdCategories || [],
    });

    const campaign = await this.prisma.campaign.create({
      data: {
        adAccountId: account.id,
        metaCampaignId: metaResult.id,
        name: dto.name,
        objective: dto.objective,
        buyingType: dto.buyingType,
        budgetType: dto.dailyBudget ? 'DAILY' : dto.lifetimeBudget ? 'LIFETIME' : undefined,
        dailyBudget: dto.dailyBudget,
        lifetimeBudget: dto.lifetimeBudget,
        bidStrategy: dto.bidStrategy,
        specialAdCategories: dto.specialAdCategories || [],
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        status: 'PAUSED',
        syncStatus: 'SYNCED',
      },
    });

    await this.logAudit(workspaceId, null, 'CREATE', 'campaign', campaign.id, { name: dto.name, objective: dto.objective });
    return campaign;
  }

  async updateCampaign(workspaceId: string, campaignId: string, dto: UpdateCampaignDto) {
    const campaign = await this.prisma.campaign.findUniqueOrThrow({
      where: { id: campaignId },
      include: { adAccount: true },
    });
    if (campaign.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (!campaign.metaCampaignId) throw new BadRequestException('Campaign not synced to Meta');

    const { token } = await this.getAccessToken(campaign.adAccountId);
    const metaParams: Record<string, any> = {};
    if (dto.name) metaParams.name = dto.name;
    if (dto.dailyBudget !== undefined) metaParams.daily_budget = Math.round(dto.dailyBudget * 100);
    if (dto.lifetimeBudget !== undefined) metaParams.lifetime_budget = Math.round(dto.lifetimeBudget * 100);
    if (dto.bidStrategy) metaParams.bid_strategy = dto.bidStrategy;

    await this.metaApi.updateCampaign(campaign.metaCampaignId, token, metaParams);

    const updated = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...dto,
        dailyBudget: dto.dailyBudget,
        lifetimeBudget: dto.lifetimeBudget,
        localVersion: { increment: 1 },
        syncStatus: 'SYNCED',
      },
    });

    await this.logAudit(workspaceId, null, 'UPDATE', 'campaign', campaignId, dto);
    return updated;
  }

  async pauseCampaign(workspaceId: string, campaignId: string) {
    const result = await this.updateEntityStatus(workspaceId, 'campaign', campaignId, 'PAUSED');
    await this.logAudit(workspaceId, null, 'PAUSE', 'campaign', campaignId, { status: 'PAUSED' });
    return result;
  }

  async resumeCampaign(workspaceId: string, campaignId: string) {
    const result = await this.updateEntityStatus(workspaceId, 'campaign', campaignId, 'ACTIVE');
    await this.logAudit(workspaceId, null, 'RESUME', 'campaign', campaignId, { status: 'ACTIVE' });
    return result;
  }

  async duplicateCampaign(workspaceId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findUniqueOrThrow({
      where: { id: campaignId },
      include: { adAccount: true },
    });
    if (campaign.adAccount.workspaceId !== workspaceId) throw new NotFoundException();

    const { token, metaAccountId } = await this.getAccessToken(campaign.adAccountId);
    const metaResult = await this.metaApi.createCampaign(metaAccountId, token, {
      name: `${campaign.name} (Copy)`,
      objective: campaign.objective || 'OUTCOME_TRAFFIC',
      status: 'PAUSED',
      daily_budget: campaign.dailyBudget ? Math.round(Number(campaign.dailyBudget) * 100) : undefined,
    });

    const copy = await this.prisma.campaign.create({
      data: {
        adAccountId: campaign.adAccountId,
        metaCampaignId: metaResult.id,
        name: `${campaign.name} (Copy)`,
        objective: campaign.objective,
        buyingType: campaign.buyingType,
        budgetType: campaign.budgetType,
        dailyBudget: campaign.dailyBudget,
        lifetimeBudget: campaign.lifetimeBudget,
        bidStrategy: campaign.bidStrategy,
        specialAdCategories: campaign.specialAdCategories,
        status: 'PAUSED',
        syncStatus: 'SYNCED',
      },
    });

    await this.logAudit(workspaceId, null, 'DUPLICATE', 'campaign', copy.id, { sourceId: campaignId });
    return copy;
  }

  async deleteCampaign(workspaceId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findUniqueOrThrow({
      where: { id: campaignId },
      include: { adAccount: true },
    });
    if (campaign.adAccount.workspaceId !== workspaceId) throw new NotFoundException();

    if (campaign.metaCampaignId) {
      const { token } = await this.getAccessToken(campaign.adAccountId);
      await this.metaApi.deleteEntity(campaign.metaCampaignId, token);
    }

    const deleted = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'DELETED', deletedAt: new Date() },
    });

    await this.logAudit(workspaceId, null, 'DELETE', 'campaign', campaignId, { status: 'DELETED' });
    return deleted;
  }

  // ─── AdSet Write Methods ───────────────────────────────────────────────────

  async createAdSet(workspaceId: string, dto: CreateAdSetDto) {
    const account = await this.prisma.adAccount.findFirstOrThrow({
      where: { id: dto.accountId, workspaceId },
    });

    const campaign = await this.prisma.campaign.findUniqueOrThrow({
      where: { id: dto.campaignId },
    });
    if (!campaign.metaCampaignId) throw new BadRequestException('Campaign not synced to Meta');

    const { token, metaAccountId } = await this.getAccessToken(account.id);

    const metaResult = await this.metaApi.createAdSet(metaAccountId, token, {
      name: dto.name,
      campaign_id: campaign.metaCampaignId,
      status: 'PAUSED',
      targeting: dto.targeting,
      daily_budget: dto.dailyBudget ? Math.round(dto.dailyBudget * 100) : undefined,
      lifetime_budget: dto.lifetimeBudget ? Math.round(dto.lifetimeBudget * 100) : undefined,
      bid_amount: dto.bidAmount ? Math.round(dto.bidAmount * 100) : undefined,
      optimization_goal: dto.optimizationGoal,
      billing_event: dto.billingEvent,
      start_time: dto.startTime,
      end_time: dto.endTime,
    });

    const adSet = await this.prisma.adSet.create({
      data: {
        adAccountId: account.id,
        campaignId: dto.campaignId,
        metaAdSetId: metaResult.id,
        name: dto.name,
        targeting: dto.targeting as any,
        placements: dto.placements as any,
        dailyBudget: dto.dailyBudget,
        lifetimeBudget: dto.lifetimeBudget,
        bidAmount: dto.bidAmount,
        optimizationGoal: dto.optimizationGoal,
        billingEvent: dto.billingEvent,
        scheduledStart: dto.startTime ? new Date(dto.startTime) : undefined,
        scheduledEnd: dto.endTime ? new Date(dto.endTime) : undefined,
        status: 'PAUSED',
        syncStatus: 'SYNCED',
      },
    });

    await this.logAudit(workspaceId, null, 'CREATE', 'adset', adSet.id, { name: dto.name, campaignId: dto.campaignId });
    return adSet;
  }

  async updateAdSet(workspaceId: string, adSetId: string, dto: UpdateAdSetDto) {
    const adSet = await this.prisma.adSet.findUniqueOrThrow({
      where: { id: adSetId },
      include: { adAccount: true },
    });
    if (adSet.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (!adSet.metaAdSetId) throw new BadRequestException('AdSet not synced to Meta');

    const { token } = await this.getAccessToken(adSet.adAccountId);
    const metaParams: Record<string, any> = {};
    if (dto.name) metaParams.name = dto.name;
    if (dto.targeting) metaParams.targeting = dto.targeting;
    if (dto.dailyBudget !== undefined) metaParams.daily_budget = Math.round(dto.dailyBudget * 100);
    if (dto.lifetimeBudget !== undefined) metaParams.lifetime_budget = Math.round(dto.lifetimeBudget * 100);
    if (dto.bidAmount !== undefined) metaParams.bid_amount = Math.round(dto.bidAmount * 100);
    if (dto.optimizationGoal) metaParams.optimization_goal = dto.optimizationGoal;
    if (dto.billingEvent) metaParams.billing_event = dto.billingEvent;

    await this.metaApi.updateAdSet(adSet.metaAdSetId, token, metaParams);

    const updated = await this.prisma.adSet.update({
      where: { id: adSetId },
      data: {
        ...dto,
        localVersion: { increment: 1 },
        syncStatus: 'SYNCED',
      },
    });

    await this.logAudit(workspaceId, null, 'UPDATE', 'adset', adSetId, dto);
    return updated;
  }

  async pauseAdSet(workspaceId: string, adSetId: string) {
    const result = await this.updateEntityStatus(workspaceId, 'adset', adSetId, 'PAUSED');
    await this.logAudit(workspaceId, null, 'PAUSE', 'adset', adSetId, { status: 'PAUSED' });
    return result;
  }

  async resumeAdSet(workspaceId: string, adSetId: string) {
    const result = await this.updateEntityStatus(workspaceId, 'adset', adSetId, 'ACTIVE');
    await this.logAudit(workspaceId, null, 'RESUME', 'adset', adSetId, { status: 'ACTIVE' });
    return result;
  }

  async duplicateAdSet(workspaceId: string, adSetId: string) {
    const adSet = await this.prisma.adSet.findUniqueOrThrow({
      where: { id: adSetId },
      include: { adAccount: true, campaign: true },
    });
    if (adSet.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (!adSet.campaign.metaCampaignId) throw new BadRequestException('Campaign not synced to Meta');

    const { token, metaAccountId } = await this.getAccessToken(adSet.adAccountId);
    const metaResult = await this.metaApi.createAdSet(metaAccountId, token, {
      name: `${adSet.name} (Copy)`,
      campaign_id: adSet.campaign.metaCampaignId,
      status: 'PAUSED',
      targeting: adSet.targeting as any,
      daily_budget: adSet.dailyBudget ? Math.round(Number(adSet.dailyBudget) * 100) : undefined,
    });

    const copy = await this.prisma.adSet.create({
      data: {
        adAccountId: adSet.adAccountId,
        campaignId: adSet.campaignId,
        metaAdSetId: metaResult.id,
        name: `${adSet.name} (Copy)`,
        targeting: adSet.targeting as any,
        placements: adSet.placements as any,
        dailyBudget: adSet.dailyBudget,
        lifetimeBudget: adSet.lifetimeBudget,
        bidAmount: adSet.bidAmount,
        optimizationGoal: adSet.optimizationGoal,
        billingEvent: adSet.billingEvent,
        status: 'PAUSED',
        syncStatus: 'SYNCED',
      },
    });

    await this.logAudit(workspaceId, null, 'DUPLICATE', 'adset', copy.id, { sourceId: adSetId });
    return copy;
  }

  async deleteAdSet(workspaceId: string, adSetId: string) {
    const adSet = await this.prisma.adSet.findUniqueOrThrow({
      where: { id: adSetId },
      include: { adAccount: true },
    });
    if (adSet.adAccount.workspaceId !== workspaceId) throw new NotFoundException();

    if (adSet.metaAdSetId) {
      const { token } = await this.getAccessToken(adSet.adAccountId);
      await this.metaApi.deleteEntity(adSet.metaAdSetId, token);
    }

    const deleted = await this.prisma.adSet.update({
      where: { id: adSetId },
      data: { status: 'DELETED', deletedAt: new Date() },
    });

    await this.logAudit(workspaceId, null, 'DELETE', 'adset', adSetId, { status: 'DELETED' });
    return deleted;
  }

  // ─── Ad Write Methods ──────────────────────────────────────────────────────

  async createAd(workspaceId: string, dto: CreateAdDto) {
    const account = await this.prisma.adAccount.findFirstOrThrow({
      where: { id: dto.accountId, workspaceId },
    });

    const adSet = await this.prisma.adSet.findUniqueOrThrow({
      where: { id: dto.adsetId },
    });
    if (!adSet.metaAdSetId) throw new BadRequestException('AdSet not synced to Meta');

    const { token, metaAccountId } = await this.getAccessToken(account.id);

    const metaResult = await this.metaApi.createAd(metaAccountId, token, {
      name: dto.name,
      adset_id: adSet.metaAdSetId,
      status: 'PAUSED',
      creative: dto.creativeSpec,
    });

    const ad = await this.prisma.ad.create({
      data: {
        adAccountId: account.id,
        adSetId: dto.adsetId,
        metaAdId: metaResult.id,
        name: dto.name,
        creativeSpec: dto.creativeSpec as any,
        status: 'PAUSED',
        syncStatus: 'SYNCED',
      },
    });

    await this.logAudit(workspaceId, null, 'CREATE', 'ad', ad.id, { name: dto.name, adsetId: dto.adsetId });
    return ad;
  }

  async updateAd(workspaceId: string, adId: string, dto: UpdateAdDto) {
    const ad = await this.prisma.ad.findUniqueOrThrow({
      where: { id: adId },
      include: { adAccount: true },
    });
    if (ad.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (!ad.metaAdId) throw new BadRequestException('Ad not synced to Meta');

    const { token } = await this.getAccessToken(ad.adAccountId);
    const metaParams: Record<string, any> = {};
    if (dto.name) metaParams.name = dto.name;
    if (dto.creativeSpec) metaParams.creative = dto.creativeSpec;

    await this.metaApi.updateAd(ad.metaAdId, token, metaParams);

    const updated = await this.prisma.ad.update({
      where: { id: adId },
      data: {
        ...dto,
        localVersion: { increment: 1 },
        syncStatus: 'SYNCED',
      },
    });

    await this.logAudit(workspaceId, null, 'UPDATE', 'ad', adId, dto);
    return updated;
  }

  async pauseAd(workspaceId: string, adId: string) {
    const result = await this.updateEntityStatus(workspaceId, 'ad', adId, 'PAUSED');
    await this.logAudit(workspaceId, null, 'PAUSE', 'ad', adId, { status: 'PAUSED' });
    return result;
  }

  async resumeAd(workspaceId: string, adId: string) {
    const result = await this.updateEntityStatus(workspaceId, 'ad', adId, 'ACTIVE');
    await this.logAudit(workspaceId, null, 'RESUME', 'ad', adId, { status: 'ACTIVE' });
    return result;
  }

  async duplicateAd(workspaceId: string, adId: string) {
    const ad = await this.prisma.ad.findUniqueOrThrow({
      where: { id: adId },
      include: { adAccount: true, adSet: true },
    });
    if (ad.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (!ad.adSet.metaAdSetId) throw new BadRequestException('AdSet not synced to Meta');

    const { token, metaAccountId } = await this.getAccessToken(ad.adAccountId);
    const metaResult = await this.metaApi.createAd(metaAccountId, token, {
      name: `${ad.name} (Copy)`,
      adset_id: ad.adSet.metaAdSetId,
      status: 'PAUSED',
      creative: ad.creativeSpec as any,
    });

    const copy = await this.prisma.ad.create({
      data: {
        adAccountId: ad.adAccountId,
        adSetId: ad.adSetId,
        metaAdId: metaResult.id,
        name: `${ad.name} (Copy)`,
        creativeSpec: ad.creativeSpec as any,
        status: 'PAUSED',
        syncStatus: 'SYNCED',
      },
    });

    await this.logAudit(workspaceId, null, 'DUPLICATE', 'ad', copy.id, { sourceId: adId });
    return copy;
  }

  async deleteAd(workspaceId: string, adId: string) {
    const ad = await this.prisma.ad.findUniqueOrThrow({
      where: { id: adId },
      include: { adAccount: true },
    });
    if (ad.adAccount.workspaceId !== workspaceId) throw new NotFoundException();

    if (ad.metaAdId) {
      const { token } = await this.getAccessToken(ad.adAccountId);
      await this.metaApi.deleteEntity(ad.metaAdId, token);
    }

    const deleted = await this.prisma.ad.update({
      where: { id: adId },
      data: { status: 'DELETED', deletedAt: new Date() },
    });

    await this.logAudit(workspaceId, null, 'DELETE', 'ad', adId, { status: 'DELETED' });
    return deleted;
  }
}

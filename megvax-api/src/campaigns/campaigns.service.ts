import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignQueryDto, AdSetQueryDto, AdQueryDto } from './dto/campaign-query.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

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
}

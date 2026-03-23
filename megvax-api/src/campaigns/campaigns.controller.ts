import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CampaignQueryDto, AdSetQueryDto, AdQueryDto, TreeQueryDto } from './dto/campaign-query.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CreateAdSetDto } from './dto/create-adset.dto';
import { UpdateAdSetDto } from './dto/update-adset.dto';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';

@Auth()
@Controller()
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  // ─── Campaign Read Endpoints ───────────────────────────────────────────────

  @Get('campaigns')
  getCampaigns(@CurrentUser('workspaceId') wsId: string, @Query() query: CampaignQueryDto) {
    return this.campaignsService.getCampaigns(wsId, query);
  }

  @Get('campaigns/tree')
  getTree(@CurrentUser('workspaceId') wsId: string, @Query() query: TreeQueryDto) {
    return this.campaignsService.getTree(wsId, query.accountId);
  }

  @Get('campaigns/:id')
  getCampaign(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.getCampaignById(wsId, id);
  }

  // ─── Campaign Write Endpoints ──────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('campaigns')
  createCampaign(@CurrentUser('workspaceId') wsId: string, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(wsId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('campaigns/:id')
  updateCampaign(
    @CurrentUser('workspaceId') wsId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.updateCampaign(wsId, id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('campaigns/:id/pause')
  pauseCampaign(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.pauseCampaign(wsId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('campaigns/:id/resume')
  resumeCampaign(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.resumeCampaign(wsId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('campaigns/:id/duplicate')
  duplicateCampaign(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.duplicateCampaign(wsId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('campaigns/:id')
  deleteCampaign(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.deleteCampaign(wsId, id);
  }

  // ─── AdSet Read Endpoints ──────────────────────────────────────────────────

  @Get('adsets')
  getAdSets(@CurrentUser('workspaceId') wsId: string, @Query() query: AdSetQueryDto) {
    return this.campaignsService.getAdSets(wsId, query);
  }

  @Get('adsets/:id')
  getAdSet(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.getAdSetById(wsId, id);
  }

  // ─── AdSet Write Endpoints ─────────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('adsets')
  createAdSet(@CurrentUser('workspaceId') wsId: string, @Body() dto: CreateAdSetDto) {
    return this.campaignsService.createAdSet(wsId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('adsets/:id')
  updateAdSet(
    @CurrentUser('workspaceId') wsId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAdSetDto,
  ) {
    return this.campaignsService.updateAdSet(wsId, id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('adsets/:id/pause')
  pauseAdSet(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.pauseAdSet(wsId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('adsets/:id/resume')
  resumeAdSet(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.resumeAdSet(wsId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('adsets/:id/duplicate')
  duplicateAdSet(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.duplicateAdSet(wsId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('adsets/:id')
  deleteAdSet(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.deleteAdSet(wsId, id);
  }

  // ─── Ad Read Endpoints ─────────────────────────────────────────────────────

  @Get('ads')
  getAds(@CurrentUser('workspaceId') wsId: string, @Query() query: AdQueryDto) {
    return this.campaignsService.getAds(wsId, query);
  }

  @Get('ads/:id')
  getAd(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.getAdById(wsId, id);
  }

  // ─── Ad Write Endpoints ────────────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('ads')
  createAd(@CurrentUser('workspaceId') wsId: string, @Body() dto: CreateAdDto) {
    return this.campaignsService.createAd(wsId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('ads/:id')
  updateAd(
    @CurrentUser('workspaceId') wsId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAdDto,
  ) {
    return this.campaignsService.updateAd(wsId, id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('ads/:id/pause')
  pauseAd(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.pauseAd(wsId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('ads/:id/resume')
  resumeAd(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.resumeAd(wsId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('ads/:id/duplicate')
  duplicateAd(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.duplicateAd(wsId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('ads/:id')
  deleteAd(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.deleteAd(wsId, id);
  }
}

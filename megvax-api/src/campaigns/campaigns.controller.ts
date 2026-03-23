import { Controller, Get, Param, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CampaignQueryDto, AdSetQueryDto, AdQueryDto, TreeQueryDto } from './dto/campaign-query.dto';

@Auth()
@Controller()
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

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

  @Get('adsets')
  getAdSets(@CurrentUser('workspaceId') wsId: string, @Query() query: AdSetQueryDto) {
    return this.campaignsService.getAdSets(wsId, query);
  }

  @Get('adsets/:id')
  getAdSet(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.getAdSetById(wsId, id);
  }

  @Get('ads')
  getAds(@CurrentUser('workspaceId') wsId: string, @Query() query: AdQueryDto) {
    return this.campaignsService.getAds(wsId, query);
  }

  @Get('ads/:id')
  getAd(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.getAdById(wsId, id);
  }
}

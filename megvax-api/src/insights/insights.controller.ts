import { Controller, Get, Query } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InsightsQueryDto, TopPerformersDto, CompareDto, AccountSummaryDto } from './dto/insights-query.dto';

@Auth()
@Controller('insights')
export class InsightsController {
  constructor(private insightsService: InsightsService) {}

  @Get()
  getInsights(@CurrentUser('workspaceId') wsId: string, @Query() query: InsightsQueryDto) {
    return this.insightsService.getInsights(wsId, query);
  }

  @Get('top-performers')
  getTopPerformers(@CurrentUser('workspaceId') wsId: string, @Query() query: TopPerformersDto) {
    return this.insightsService.getTopPerformers(wsId, query);
  }

  @Get('compare')
  compare(@CurrentUser('workspaceId') wsId: string, @Query() query: CompareDto) {
    return this.insightsService.compareEntities(wsId, query.ids, query.from, query.to);
  }

  @Get('account-summary')
  getAccountSummary(@CurrentUser('workspaceId') wsId: string, @Query() query: AccountSummaryDto) {
    return this.insightsService.getAccountSummary(wsId, query);
  }
}

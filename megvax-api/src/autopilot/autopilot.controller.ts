import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AutopilotService } from './autopilot.service';
import { AutopilotRulesService } from './autopilot-rules.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ActionQueryDto } from './dto/action-query.dto';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Auth()
@Controller('autopilot')
export class AutopilotController {
  constructor(
    private autopilotService: AutopilotService,
    private rulesService: AutopilotRulesService,
  ) {}

  // ─── Config ─────────────────────────────────────────────────────────────────

  @Get('config/:accountId')
  getConfig(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('accountId') accountId: string,
  ) {
    return this.autopilotService.getConfig(workspaceId, accountId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('config/:accountId')
  updateConfig(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('accountId') accountId: string,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.autopilotService.updateConfig(workspaceId, accountId, dto);
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────

  @Get('actions')
  getActions(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query() query: ActionQueryDto,
  ) {
    return this.autopilotService.getActions(workspaceId, query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('actions/:id/approve')
  approveAction(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.autopilotService.approveAction(workspaceId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('actions/:id/cancel')
  cancelAction(
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.autopilotService.cancelAction(workspaceId, id, userId);
  }

  // ─── Stats ───────────────────────────────────────────────────────────────────

  @Get('stats')
  getStats(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('accountId') accountId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.autopilotService.getStats(workspaceId, accountId, from, to);
  }

  // ─── Rules ───────────────────────────────────────────────────────────────────

  @Get('rules')
  listRules(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('accountId') accountId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.rulesService.listRules(workspaceId, accountId, cursor, limit);
  }

  @Get('rules/:id')
  getRule(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.rulesService.getRule(workspaceId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('rules')
  createRule(
    @CurrentUser('workspaceId') workspaceId: string,
    @Body() dto: CreateRuleDto,
  ) {
    return this.rulesService.createRule(workspaceId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('rules/:id')
  updateRule(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRuleDto,
  ) {
    return this.rulesService.updateRule(workspaceId, id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('rules/:id')
  deleteRule(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.rulesService.deleteRule(workspaceId, id);
  }

  @Post('rules/:id/test')
  testRule(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.rulesService.testRule(workspaceId, id);
  }
}

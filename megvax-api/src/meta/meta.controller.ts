import { Controller, Get, Post, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';
import { MetaService } from './meta.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Auth()
@Controller('meta')
export class MetaController {
  constructor(private metaService: MetaService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('auth-url')
  getAuthUrl(@CurrentUser('workspaceId') workspaceId: string) {
    return this.metaService.getAuthUrl(workspaceId);
  }

  @Post('callback')
  handleCallback(@Query('code') code: string, @Query('state') state: string) {
    return this.metaService.handleCallback(code, state);
  }

  @Get('connections')
  getConnections(@CurrentUser('workspaceId') workspaceId: string) {
    return this.metaService.getConnections(workspaceId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('connections/:id')
  deleteConnection(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') connectionId: string,
  ) {
    return this.metaService.deleteConnection(workspaceId, connectionId);
  }

  @Get('ad-accounts')
  getAdAccounts(@CurrentUser('workspaceId') workspaceId: string) {
    return this.metaService.getAvailableAdAccounts(workspaceId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('ad-accounts/:metaAccountId/connect')
  connectAdAccount(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('metaAccountId') metaAccountId: string,
  ) {
    return this.metaService.connectAdAccount(workspaceId, metaAccountId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('ad-accounts/:id/disconnect')
  disconnectAdAccount(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') accountId: string,
  ) {
    return this.metaService.disconnectAdAccount(workspaceId, accountId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('ad-accounts/:id/sync')
  async triggerSync(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') accountId: string,
  ) {
    return this.metaService.triggerSync(workspaceId, accountId);
  }
}

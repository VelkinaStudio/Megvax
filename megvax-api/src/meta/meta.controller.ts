import { Controller, Get, Post, Delete, Query, Param, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { MetaService } from './meta.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('meta')
export class MetaController {
  constructor(
    private metaService: MetaService,
    private config: ConfigService,
  ) {}

  @Auth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('auth-url')
  getAuthUrl(@CurrentUser('workspaceId') workspaceId: string) {
    return this.metaService.getAuthUrl(workspaceId);
  }

  // No @Auth() — this is an OAuth redirect from Facebook (no JWT)
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      await this.metaService.handleCallback(code, state);
      const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/app/accounts?meta_connected=true`);
    } catch (error: any) {
      const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/app/accounts?meta_error=${encodeURIComponent(error.message || 'Connection failed')}`);
    }
  }

  @Auth()
  @Get('connections')
  getConnections(@CurrentUser('workspaceId') workspaceId: string) {
    return this.metaService.getConnections(workspaceId);
  }

  @Auth()
  @Get('ad-accounts')
  getAdAccounts(@CurrentUser('workspaceId') workspaceId: string) {
    return this.metaService.getAvailableAdAccounts(workspaceId);
  }

  @Auth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('connections/:id')
  deleteConnection(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') connectionId: string,
  ) {
    return this.metaService.deleteConnection(workspaceId, connectionId);
  }

  @Auth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('ad-accounts/:metaAccountId/connect')
  connectAdAccount(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('metaAccountId') metaAccountId: string,
  ) {
    return this.metaService.connectAdAccount(workspaceId, metaAccountId);
  }

  @Auth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('ad-accounts/:id/disconnect')
  disconnectAdAccount(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') accountId: string,
  ) {
    return this.metaService.disconnectAdAccount(workspaceId, accountId);
  }

  @Auth()
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

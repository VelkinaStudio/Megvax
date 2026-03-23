import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { Auth } from '../common/decorators/auth.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Auth()
@Controller('workspaces')
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @Get('current')
  getCurrent(@CurrentUser('workspaceId') workspaceId: string) {
    return this.workspaceService.getCurrent(workspaceId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('current')
  update(
    @CurrentUser('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(workspaceId, dto);
  }

  @Get('current/members')
  getMembers(@CurrentUser('workspaceId') workspaceId: string) {
    return this.workspaceService.getMembers(workspaceId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('current/invitations')
  invite(
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspaceService.inviteMember(workspaceId, userId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('current/members/:id')
  removeMember(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') memberId: string,
  ) {
    return this.workspaceService.removeMember(workspaceId, memberId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('current/members/:id')
  updateMember(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.workspaceService.updateMemberRole(workspaceId, memberId, dto.role);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('current/api-keys')
  createApiKey(
    @CurrentUser('workspaceId') workspaceId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.workspaceService.createApiKey(workspaceId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('current/api-keys')
  listApiKeys(@CurrentUser('workspaceId') workspaceId: string) {
    return this.workspaceService.listApiKeys(workspaceId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('current/api-keys/:id')
  deleteApiKey(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') keyId: string,
  ) {
    return this.workspaceService.deleteApiKey(workspaceId, keyId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('current/api-keys/:id')
  updateApiKey(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') keyId: string,
    @Body() dto: Partial<CreateApiKeyDto>,
  ) {
    return this.workspaceService.updateApiKey(workspaceId, keyId, dto);
  }
}

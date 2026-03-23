import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SuggestionQueryDto } from './dto/suggestion-query.dto';

@Auth()
@Controller('suggestions')
export class SuggestionsController {
  constructor(private suggestionsService: SuggestionsService) {}

  @Get()
  getSuggestions(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query() query: SuggestionQueryDto,
  ) {
    return this.suggestionsService.getSuggestions(workspaceId, query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post(':id/apply')
  applySuggestion(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.suggestionsService.applySuggestion(workspaceId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post(':id/dismiss')
  dismissSuggestion(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.suggestionsService.dismissSuggestion(workspaceId, id, reason);
  }
}

import { Module, forwardRef } from '@nestjs/common';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => CampaignsModule),
  ],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
  exports: [SuggestionsService],
})
export class SuggestionsModule {}

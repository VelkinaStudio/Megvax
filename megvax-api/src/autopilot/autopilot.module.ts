import { Module, forwardRef } from '@nestjs/common';
import { AutopilotController } from './autopilot.controller';
import { AutopilotService } from './autopilot.service';
import { AutopilotRulesService } from './autopilot-rules.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    NotificationsModule,
    forwardRef(() => CampaignsModule), // forwardRef to avoid circular dependency
  ],
  controllers: [AutopilotController],
  providers: [AutopilotService, AutopilotRulesService],
  exports: [AutopilotService, AutopilotRulesService],
})
export class AutopilotModule {}

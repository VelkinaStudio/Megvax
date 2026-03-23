import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AutopilotController } from './autopilot.controller';
import { AutopilotService } from './autopilot.service';
import { AutopilotRulesService } from './autopilot-rules.service';
import { AutopilotProcessor } from './autopilot.processor';
import { AutopilotSchedulerProcessor } from './autopilot-scheduler.processor';
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
    BullModule.registerQueue({ name: 'autopilot' }),
    BullModule.registerQueue({ name: 'autopilot-scheduler' }),
  ],
  controllers: [AutopilotController],
  providers: [AutopilotService, AutopilotRulesService, AutopilotProcessor, AutopilotSchedulerProcessor],
  exports: [AutopilotService, AutopilotRulesService],
})
export class AutopilotModule implements OnModuleInit {
  constructor(
    @InjectQueue('autopilot-scheduler') private schedulerQueue: Queue,
  ) {}

  async onModuleInit() {
    // Schedule repeatable job every 5 minutes to execute due SUGGEST_ACT actions
    await this.schedulerQueue.add(
      'run-scheduled-actions',
      {},
      {
        repeat: { every: 5 * 60 * 1000 },
        jobId: 'autopilot-scheduler-repeat',
      },
    );
  }
}

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignsService } from '../campaigns/campaigns.service';

@Processor('autopilot-scheduler')
export class AutopilotSchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger(AutopilotSchedulerProcessor.name);

  constructor(
    private prisma: PrismaService,
    private campaignsService: CampaignsService,
  ) {
    super();
  }

  async process(job: Job) {
    const dueActions = await this.prisma.autopilotAction.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: { lte: new Date() },
      },
      include: { adAccount: true },
    });

    for (const action of dueActions) {
      try {
        const changes = action.changes as any;
        const workspaceId = action.adAccount.workspaceId;
        if (changes.field === 'status' && changes.to === 'PAUSED') {
          if (action.entityType === 'CAMPAIGN') await this.campaignsService.pauseCampaign(workspaceId, action.entityId);
          else if (action.entityType === 'ADSET') await this.campaignsService.pauseAdSet(workspaceId, action.entityId);
          else if (action.entityType === 'AD') await this.campaignsService.pauseAd(workspaceId, action.entityId);
        } else if (changes.field === 'daily_budget') {
          if (action.entityType === 'CAMPAIGN') await this.campaignsService.updateCampaign(workspaceId, action.entityId, { dailyBudget: Number(changes.to) });
        }

        await this.prisma.autopilotAction.update({
          where: { id: action.id },
          data: { status: 'EXECUTED', executedAt: new Date() },
        });
        this.logger.log(`Executed scheduled action ${action.id}: ${action.description}`);
      } catch (err) {
        await this.prisma.autopilotAction.update({
          where: { id: action.id },
          data: { status: 'FAILED', errorMessage: String(err) },
        });
        this.logger.error(`Failed to execute action ${action.id}: ${err}`);
      }
    }
  }
}

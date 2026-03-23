import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Injectable()
export class AutopilotRulesService {
  constructor(private prisma: PrismaService) {}

  async listRules(workspaceId: string, accountId: string, cursor?: string, limit = 25) {
    const items = await this.prisma.automationRule.findMany({
      where: { workspaceId, adAccountId: accountId },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
    });
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    return { data, cursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async getRule(workspaceId: string, ruleId: string) {
    const rule = await this.prisma.automationRule.findUniqueOrThrow({ where: { id: ruleId } });
    if (rule.workspaceId !== workspaceId) throw new NotFoundException();
    return rule;
  }

  async createRule(workspaceId: string, dto: CreateRuleDto) {
    await this.verifyAccountAccess(workspaceId, dto.accountId);
    return this.prisma.automationRule.create({
      data: {
        workspaceId,
        adAccountId: dto.accountId,
        name: dto.name,
        trigger: dto.trigger,
        action: dto.action,
        tier: dto.tier as any,
        cooldownMinutes: dto.cooldownMinutes || 60,
        enabled: dto.enabled !== false,
      },
    });
  }

  async updateRule(workspaceId: string, ruleId: string, dto: UpdateRuleDto) {
    const rule = await this.prisma.automationRule.findUniqueOrThrow({ where: { id: ruleId } });
    if (rule.workspaceId !== workspaceId) throw new NotFoundException();
    return this.prisma.automationRule.update({
      where: { id: ruleId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.trigger && { trigger: dto.trigger }),
        ...(dto.action && { action: dto.action }),
        ...(dto.tier && { tier: dto.tier as any }),
        ...(dto.cooldownMinutes !== undefined && { cooldownMinutes: dto.cooldownMinutes }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
      },
    });
  }

  async deleteRule(workspaceId: string, ruleId: string) {
    const rule = await this.prisma.automationRule.findUniqueOrThrow({ where: { id: ruleId } });
    if (rule.workspaceId !== workspaceId) throw new NotFoundException();
    await this.prisma.automationRule.delete({ where: { id: ruleId } });
    return { message: 'Rule deleted' };
  }

  async testRule(workspaceId: string, ruleId: string) {
    const rule = await this.prisma.automationRule.findUniqueOrThrow({ where: { id: ruleId } });
    if (rule.workspaceId !== workspaceId) throw new NotFoundException();

    // Dry run: evaluate the rule against last 7 days of data without executing
    const trigger = rule.trigger as any;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const insights = await this.prisma.insightSnapshot.findMany({
      where: {
        adAccountId: rule.adAccountId,
        date: { gte: sevenDaysAgo },
        ...(trigger.entityScope ? { entityType: trigger.entityScope } : {}),
      },
      orderBy: { date: 'desc' },
    });

    // Group by entity and check if trigger condition would fire
    const entityMap = new Map<string, any[]>();
    for (const snap of insights) {
      const key = snap.entityId;
      if (!entityMap.has(key)) entityMap.set(key, []);
      entityMap.get(key)!.push(snap);
    }

    const hypotheticalActions: any[] = [];
    for (const [entityId, snaps] of entityMap) {
      const avg = snaps.reduce((sum, s) => sum + Number((s as any)[trigger.metric] || 0), 0) / snaps.length;
      const wouldFire = trigger.operator === '>' ? avg > trigger.threshold
        : trigger.operator === '<' ? avg < trigger.threshold
        : trigger.operator === '>=' ? avg >= trigger.threshold
        : trigger.operator === '<=' ? avg <= trigger.threshold
        : false;

      if (wouldFire) {
        hypotheticalActions.push({
          entityId,
          entityType: snaps[0].entityType,
          metricValue: avg,
          threshold: trigger.threshold,
          wouldExecute: rule.action,
        });
      }
    }

    return { ruleId, hypotheticalActions, evaluatedEntities: entityMap.size };
  }

  private async verifyAccountAccess(workspaceId: string, accountId: string) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');
  }
}

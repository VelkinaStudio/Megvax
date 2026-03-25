import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PLANS_KEY } from '../decorators/plan.decorator';

const PLAN_HIERARCHY: Record<string, number> = {
  STARTER: 0,
  PRO: 1,
  AGENCY: 2,
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlans = this.reflector.getAllAndOverride<string[]>(PLANS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No plan requirement on this route
    if (!requiredPlans || requiredPlans.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const workspaceId = request.user?.workspaceId;
    if (!workspaceId) throw new ForbiddenException('No workspace');

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { plan: true },
    });
    if (!workspace) throw new ForbiddenException('Workspace not found');

    const currentLevel = PLAN_HIERARCHY[workspace.plan] ?? 0;
    const requiredLevel = Math.min(...requiredPlans.map((p) => PLAN_HIERARCHY[p] ?? 0));

    if (currentLevel < requiredLevel) {
      throw new ForbiddenException(`This feature requires ${requiredPlans.join(' or ')} plan`);
    }

    return true;
  }
}

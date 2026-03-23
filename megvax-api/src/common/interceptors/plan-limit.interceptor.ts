import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PLAN_LIMIT_KEY } from '../decorators/plan-limit.decorator';
import { PLAN_LIMITS } from '../config/plan-limits.config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class PlanLimitInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const feature = this.reflector.get<string>(
      PLAN_LIMIT_KEY,
      context.getHandler(),
    );

    if (!feature) return next.handle();

    const request = context.switchToHttp().getRequest();
    const { workspaceId } = request.user;

    const cacheKey = `plan:${workspaceId}`;
    let plan = await this.redis.get(cacheKey);

    if (!plan) {
      const workspace = await this.prisma.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
        select: { plan: true },
      });
      plan = workspace.plan;
      await this.redis.set(cacheKey, plan, 300);
    }

    const limits = PLAN_LIMITS[plan];
    if (!limits) {
      throw new ForbiddenException('Unknown plan');
    }

    if (feature in limits) {
      const value = limits[feature as keyof typeof limits];
      if (value === -1) return next.handle();
      if (value === false) {
        throw new ForbiddenException({
          code: 'PLAN_LIMIT_EXCEEDED',
          message: `Feature "${feature}" is not available on the ${plan} plan`,
          upgradeUrl: '/billing/checkout',
        });
      }
    }

    return next.handle();
  }
}

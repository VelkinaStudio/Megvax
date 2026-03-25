import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlanGuard } from './plan.guard';
import { PrismaService } from '../../prisma/prisma.service';

function createMockContext(workspaceId?: string): ExecutionContext {
  const request = { user: workspaceId ? { workspaceId } : {} };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('PlanGuard', () => {
  let guard: PlanGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let prisma: { workspace: { findUnique: jest.Mock } };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    prisma = { workspace: { findUnique: jest.fn() } };
    guard = new PlanGuard(
      reflector as unknown as Reflector,
      prisma as unknown as PrismaService,
    );
  });

  it('should allow when no plan is required', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(await guard.canActivate(createMockContext('ws-1'))).toBe(true);
  });

  it('should allow AGENCY plan for any requirement', async () => {
    reflector.getAllAndOverride.mockReturnValue(['PRO']);
    prisma.workspace.findUnique.mockResolvedValue({ plan: 'AGENCY' });

    expect(await guard.canActivate(createMockContext('ws-1'))).toBe(true);
  });

  it('should allow exact plan match', async () => {
    reflector.getAllAndOverride.mockReturnValue(['PRO']);
    prisma.workspace.findUnique.mockResolvedValue({ plan: 'PRO' });

    expect(await guard.canActivate(createMockContext('ws-1'))).toBe(true);
  });

  it('should deny STARTER when PRO is required', async () => {
    reflector.getAllAndOverride.mockReturnValue(['PRO']);
    prisma.workspace.findUnique.mockResolvedValue({ plan: 'STARTER' });

    await expect(guard.canActivate(createMockContext('ws-1'))).rejects.toThrow(ForbiddenException);
  });

  it('should throw when workspace is not found', async () => {
    reflector.getAllAndOverride.mockReturnValue(['PRO']);
    prisma.workspace.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(createMockContext('ws-1'))).rejects.toThrow(ForbiddenException);
  });

  it('should throw when no workspaceId on user', async () => {
    reflector.getAllAndOverride.mockReturnValue(['PRO']);

    await expect(guard.canActivate(createMockContext())).rejects.toThrow(ForbiddenException);
  });
});

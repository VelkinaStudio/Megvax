import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function createMockContext(role?: string): ExecutionContext {
  const request = { user: role ? { role } : {} };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('should allow when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(createMockContext('VIEWER'))).toBe(true);
  });

  it('should allow OWNER for any role requirement', () => {
    reflector.getAllAndOverride.mockReturnValue(['MEMBER']);
    expect(guard.canActivate(createMockContext('OWNER'))).toBe(true);
  });

  it('should allow exact role match', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(guard.canActivate(createMockContext('ADMIN'))).toBe(true);
  });

  it('should deny VIEWER when MEMBER is required', () => {
    reflector.getAllAndOverride.mockReturnValue(['MEMBER']);
    expect(() => guard.canActivate(createMockContext('VIEWER'))).toThrow(ForbiddenException);
  });

  it('should deny MEMBER when ADMIN is required', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(createMockContext('MEMBER'))).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user has no role', () => {
    reflector.getAllAndOverride.mockReturnValue(['MEMBER']);
    const ctx = createMockContext(); // no role
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should use lowest required role from array', () => {
    // Requiring ['MEMBER', 'ADMIN'] means minimum is MEMBER
    reflector.getAllAndOverride.mockReturnValue(['MEMBER', 'ADMIN']);
    expect(guard.canActivate(createMockContext('MEMBER'))).toBe(true);
  });
});

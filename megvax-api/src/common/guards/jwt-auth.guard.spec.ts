import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue('mock-public-key'),
}));

function createMockContext(overrides: { authorization?: string; cookies?: Record<string, string> } = {}): ExecutionContext {
  const request = {
    headers: { authorization: overrides.authorization },
    cookies: overrides.cookies ?? {},
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: { verifyAsync: jest.Mock };

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
      getOrThrow: jest.fn().mockReturnValue('/fake/public.pem'),
    };
    guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  it('should allow request with valid Bearer token', async () => {
    const payload = { sub: 'user-1', workspaceId: 'ws-1', role: 'OWNER' };
    jwtService.verifyAsync.mockResolvedValue(payload);

    const ctx = createMockContext({ authorization: 'Bearer valid-token' });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', expect.objectContaining({ algorithms: ['RS256'] }));
    // Check that user was set on request
    const req = ctx.switchToHttp().getRequest();
    expect(req.user).toEqual(payload);
  });

  it('should allow request with valid access_token cookie', async () => {
    const payload = { sub: 'user-1', workspaceId: 'ws-1', role: 'OWNER' };
    jwtService.verifyAsync.mockResolvedValue(payload);

    const ctx = createMockContext({ cookies: { access_token: 'cookie-token' } });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('cookie-token', expect.any(Object));
  });

  it('should throw UnauthorizedException when no token is provided', async () => {
    const ctx = createMockContext();

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException on invalid token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    const ctx = createMockContext({ authorization: 'Bearer expired-token' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should prefer Bearer token over cookie', async () => {
    const payload = { sub: 'user-1', workspaceId: 'ws-1', role: 'OWNER' };
    jwtService.verifyAsync.mockResolvedValue(payload);

    const ctx = createMockContext({
      authorization: 'Bearer bearer-token',
      cookies: { access_token: 'cookie-token' },
    });
    await guard.canActivate(ctx);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('bearer-token', expect.any(Object));
  });
});

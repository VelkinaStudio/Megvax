import { ForbiddenException } from '@nestjs/common';
import { CsrfMiddleware } from './csrf.middleware';
import * as crypto from 'crypto';

// ── Helpers ────────────────────────────────────────────
function createMockReq(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    method: 'GET',
    path: '/',
    cookies: {},
    headers: {},
    ...overrides,
  };
}

function createMockRes(): Record<string, any> {
  return {
    cookie: jest.fn(),
  };
}

describe('CsrfMiddleware', () => {
  let middleware: CsrfMiddleware;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new CsrfMiddleware();
    next = jest.fn();
  });

  // ── Safe methods (GET/HEAD/OPTIONS) ─────────────────
  describe('safe methods', () => {
    it.each(['GET', 'HEAD', 'OPTIONS'])('should allow %s requests without token', (method) => {
      const req = createMockReq({ method });
      const res = createMockRes();

      middleware.use(req as any, res as any, next);

      expect(next).toHaveBeenCalled();
    });

    it('should set csrf cookie if none exists on GET', () => {
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();

      middleware.use(req as any, res as any, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'csrf_token',
        expect.any(String),
        expect.objectContaining({
          httpOnly: false,
          sameSite: 'strict',
          path: '/',
        }),
      );
    });

    it('should not overwrite existing csrf cookie', () => {
      const req = createMockReq({
        method: 'GET',
        cookies: { csrf_token: 'existing-token' },
      });
      const res = createMockRes();

      middleware.use(req as any, res as any, next);

      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  // ── POST without CSRF token ─────────────────────────
  describe('POST without csrf token', () => {
    it('should block POST without x-requested-with header', () => {
      const req = createMockReq({ method: 'POST' });
      const res = createMockRes();

      expect(() => middleware.use(req as any, res as any, next)).toThrow(ForbiddenException);
      expect(() => middleware.use(req as any, res as any, next)).toThrow(
        'Missing X-Requested-With header',
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should block POST with x-requested-with but without csrf tokens', () => {
      const req = createMockReq({
        method: 'POST',
        path: '/campaigns',
        headers: { 'x-requested-with': 'XMLHttpRequest' },
      });
      const res = createMockRes();

      expect(() => middleware.use(req as any, res as any, next)).toThrow(ForbiddenException);
      expect(() => middleware.use(req as any, res as any, next)).toThrow('CSRF token mismatch');
    });
  });

  // ── POST with matching tokens ───────────────────────
  describe('POST with matching csrf cookie + header', () => {
    it('should allow POST when cookie and header tokens match', () => {
      const token = crypto.randomBytes(32).toString('hex');
      const req = createMockReq({
        method: 'POST',
        path: '/campaigns',
        cookies: { csrf_token: token },
        headers: {
          'x-requested-with': 'XMLHttpRequest',
          'x-csrf-token': token,
        },
      });
      const res = createMockRes();

      middleware.use(req as any, res as any, next);

      expect(next).toHaveBeenCalled();
    });
  });

  // ── POST with mismatched tokens ─────────────────────
  describe('POST when cookie and header do not match', () => {
    it('should block POST when tokens differ', () => {
      const cookieToken = crypto.randomBytes(32).toString('hex');
      const headerToken = crypto.randomBytes(32).toString('hex');
      const req = createMockReq({
        method: 'POST',
        path: '/campaigns',
        cookies: { csrf_token: cookieToken },
        headers: {
          'x-requested-with': 'XMLHttpRequest',
          'x-csrf-token': headerToken,
        },
      });
      const res = createMockRes();

      expect(() => middleware.use(req as any, res as any, next)).toThrow(ForbiddenException);
      expect(() => middleware.use(req as any, res as any, next)).toThrow('CSRF token mismatch');
    });

    it('should block POST when header token has different length', () => {
      const cookieToken = crypto.randomBytes(32).toString('hex');
      const req = createMockReq({
        method: 'POST',
        path: '/campaigns',
        cookies: { csrf_token: cookieToken },
        headers: {
          'x-requested-with': 'XMLHttpRequest',
          'x-csrf-token': 'short-token',
        },
      });
      const res = createMockRes();

      expect(() => middleware.use(req as any, res as any, next)).toThrow(ForbiddenException);
    });
  });

  // ── Exempt auth endpoints ───────────────────────────
  describe('exempt endpoints', () => {
    it.each(['/auth/login', '/auth/register', '/auth/refresh'])(
      'should exempt %s from CSRF validation',
      (path) => {
        const req = createMockReq({
          method: 'POST',
          path,
          headers: { 'x-requested-with': 'XMLHttpRequest' },
        });
        const res = createMockRes();

        middleware.use(req as any, res as any, next);

        expect(next).toHaveBeenCalled();
      },
    );

    it('should NOT exempt /auth/logout', () => {
      const req = createMockReq({
        method: 'POST',
        path: '/auth/logout',
        headers: { 'x-requested-with': 'XMLHttpRequest' },
      });
      const res = createMockRes();

      expect(() => middleware.use(req as any, res as any, next)).toThrow(ForbiddenException);
    });
  });

  // ── X-Requested-With on mutations ───────────────────
  describe('x-requested-with header on mutations', () => {
    it.each(['POST', 'PATCH', 'PUT', 'DELETE'])(
      'should require x-requested-with on %s requests',
      (method) => {
        const token = crypto.randomBytes(32).toString('hex');
        const req = createMockReq({
          method,
          path: '/campaigns',
          cookies: { csrf_token: token },
          headers: {
            'x-csrf-token': token,
            // deliberately missing x-requested-with
          },
        });
        const res = createMockRes();

        expect(() => middleware.use(req as any, res as any, next)).toThrow(ForbiddenException);
        expect(() => middleware.use(req as any, res as any, next)).toThrow(
          'Missing X-Requested-With header',
        );
      },
    );

    it.each(['POST', 'PATCH', 'PUT', 'DELETE'])(
      'should allow %s with valid x-requested-with and matching tokens',
      (method) => {
        const token = crypto.randomBytes(32).toString('hex');
        const req = createMockReq({
          method,
          path: '/campaigns',
          cookies: { csrf_token: token },
          headers: {
            'x-requested-with': 'XMLHttpRequest',
            'x-csrf-token': token,
          },
        });
        const res = createMockRes();

        middleware.use(req as any, res as any, next);

        expect(next).toHaveBeenCalled();
      },
    );
  });
});

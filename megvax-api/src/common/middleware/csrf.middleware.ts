import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

const MUTATING_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];
const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

// Endpoints that don't need CSRF validation (they issue the initial token)
const CSRF_EXEMPT = ['/auth/login', '/auth/register', '/auth/refresh'];

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!MUTATING_METHODS.includes(req.method)) return next();

    // X-Requested-With is a custom header — browsers enforce SOP on it.
    // This is a sufficient CSRF defense for cross-origin APIs behind CORS.
    if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
      throw new ForbiddenException('Missing X-Requested-With header');
    }

    // Exempt auth endpoints that issue tokens
    if (CSRF_EXEMPT.some((p) => req.path === p)) {
      return next();
    }

    // Same-origin deployments: double-submit cookie validation
    // Cross-origin (Railway): cookie won't be present, skip double-submit
    // The X-Requested-With check above + CORS origin lock is the defense
    const cookieToken = req.cookies?.[CSRF_COOKIE];
    if (cookieToken) {
      const headerToken = req.headers[CSRF_HEADER];
      if (
        !headerToken ||
        typeof headerToken !== 'string' ||
        cookieToken.length !== headerToken.length ||
        !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
      ) {
        throw new ForbiddenException('CSRF token mismatch');
      }
    }

    // Set CSRF cookie for same-origin clients
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
    }

    next();
  }
}

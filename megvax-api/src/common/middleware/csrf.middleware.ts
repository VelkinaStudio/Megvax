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
    // Ensure CSRF cookie exists on every response
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false, // JS must read it to send in header
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
    }

    if (MUTATING_METHODS.includes(req.method)) {
      // Must have X-Requested-With (SOP check)
      if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
        throw new ForbiddenException('Missing X-Requested-With header');
      }

      // Exempt auth endpoints that issue tokens
      if (CSRF_EXEMPT.some((p) => req.path.startsWith(p))) {
        return next();
      }

      // Double-submit: header token must match cookie token
      const cookieToken = req.cookies?.[CSRF_COOKIE];
      const headerToken = req.headers[CSRF_HEADER];
      if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        throw new ForbiddenException('CSRF token mismatch');
      }
    }

    next();
  }
}

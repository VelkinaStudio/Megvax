import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const MUTATING_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (MUTATING_METHODS.includes(req.method)) {
      const header = req.headers['x-requested-with'];
      if (!header || header !== 'XMLHttpRequest') {
        throw new ForbiddenException('Missing X-Requested-With header');
      }
    }
    next();
  }
}

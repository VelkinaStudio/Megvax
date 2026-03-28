import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { readFileSync, existsSync } from 'fs';
import { JwtPayload } from '../types/request.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private publicKey: string;

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    // Prefer base64-encoded key from env (production/Railway)
    const base64 = this.config.get<string>('JWT_PUBLIC_KEY');
    if (base64) {
      this.publicKey = Buffer.from(base64, 'base64').toString('utf8');
    } else {
      const keyPath = this.config.getOrThrow<string>('JWT_PUBLIC_KEY_PATH');
      if (!existsSync(keyPath)) {
        throw new Error('JWT public key not found: set JWT_PUBLIC_KEY (base64) or JWT_PUBLIC_KEY_PATH (file path)');
      }
      this.publicKey = readFileSync(keyPath, 'utf8');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        publicKey: this.publicKey,
        algorithms: ['RS256'],
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) return token;
    return request.cookies?.access_token;
  }
}

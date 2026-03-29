import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../common/types/request.types';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private privateKey: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {
    this.privateKey = this.loadKey('JWT_PRIVATE_KEY', 'JWT_PRIVATE_KEY_PATH');
  }

  private loadKey(envVar: string, pathVar: string): string {
    // Prefer base64-encoded key from env (production/Railway)
    const base64 = this.config.get<string>(envVar);
    if (base64) return Buffer.from(base64, 'base64').toString('utf8');

    // Fallback to file path (local dev)
    const keyPath = this.config.get<string>(pathVar);
    if (keyPath && existsSync(keyPath)) return readFileSync(keyPath, 'utf8');

    throw new Error(`JWT key not found: set ${envVar} (base64) or ${pathVar} (file path)`);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const slug = dto.fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + crypto.randomBytes(3).toString('hex');

    const user = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          fullName: dto.fullName,
          emailVerifyToken: hashToken(emailVerifyToken),
        },
      });

      const workspace = await tx.workspace.create({
        data: { name: `${dto.fullName}'s Workspace`, slug },
      });

      await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'OWNER',
        },
      });

      return { ...user, workspaceId: workspace.id };
    });

    await this.emailService.sendVerificationEmail(user.email, emailVerifyToken);

    return this.generateTokens(user.id, user.workspaceId, 'OWNER');
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        workspaceMembers: {
          include: { workspace: true },
          take: 1,
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!user || !user.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const membership = user.workspaceMembers[0];
    if (!membership) throw new UnauthorizedException('No workspace found');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user.id, membership.workspaceId, membership.role);
  }

  async refreshToken(tokenHash: string) {
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      include: {
        user: {
          include: {
            workspaceMembers: { take: 1, orderBy: { joinedAt: 'asc' } },
          },
        },
      },
    });

    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    // Rotate: delete old, issue new
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    const membership = stored.user.workspaceMembers[0];
    if (!membership) throw new UnauthorizedException('No workspace found');

    return this.generateTokens(stored.userId, membership.workspaceId, membership.role);
  }

  async logout(tokenHash: string) {
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerifyToken: hashToken(token) },
    });
    if (!user) throw new BadRequestException('Invalid verification token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null },
    });

    return { message: 'Email verified' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If the email exists, a reset link has been sent' };

    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashToken(token),
        passwordResetExpiresAt: new Date(Date.now() + 3600000), // 1hr
      },
    });

    await this.emailService.sendPasswordResetEmail(email, token);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashToken(token),
        passwordResetExpiresAt: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    // Revoke all refresh tokens on password change
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    return { message: 'Password reset successful' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!user.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens — forces re-login on all devices
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { message: 'Password changed' };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        locale: true,
        emailVerified: true,
        isAdmin: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, data: { fullName?: string; avatar?: string; locale?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        locale: true,
        emailVerified: true,
      },
    });
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { tokenHash: hashToken(token), acceptedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!invitation) throw new BadRequestException('Invalid or expired invitation');

    await this.prisma.$transaction(async (tx) => {
      await tx.workspaceMember.create({
        data: {
          userId,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        },
      });
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });
    });

    return { message: 'Invitation accepted' };
  }

  // ── OAuth helpers ──────────────────────────────────────

  /**
   * Find-or-create a user from an OAuth provider profile.
   * If the user exists (by provider ID or email), link and return tokens.
   * If not, create user + workspace and return tokens.
   */
  async oauthLogin(provider: 'google' | 'facebook', profile: { id: string; email: string; name: string; avatar?: string }) {
    const providerField = provider === 'google' ? 'googleId' : 'facebookId';

    // 1. Try to find by provider ID
    let user = await this.prisma.user.findUnique({
      where: { [providerField]: profile.id } as any,
      include: { workspaceMembers: { take: 1, orderBy: { joinedAt: 'asc' as const } } },
    });

    // 2. Try to find by email (link existing account)
    if (!user) {
      const existing = await this.prisma.user.findUnique({
        where: { email: profile.email.toLowerCase() },
        include: { workspaceMembers: { take: 1, orderBy: { joinedAt: 'asc' as const } } },
      });
      if (existing) {
        user = await this.prisma.user.update({
          where: { id: existing.id },
          data: {
            [providerField]: profile.id,
            emailVerified: true,
            avatar: existing.avatar || profile.avatar || null,
          },
          include: { workspaceMembers: { take: 1, orderBy: { joinedAt: 'asc' as const } } },
        });
      }
    }

    // 3. Create new user + workspace
    if (!user) {
      const slug = profile.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + crypto.randomBytes(3).toString('hex');

      user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: profile.email.toLowerCase(),
            fullName: profile.name,
            avatar: profile.avatar || null,
            emailVerified: true,
            [providerField]: profile.id,
          },
        });

        const workspace = await tx.workspace.create({
          data: { name: `${profile.name}'s Workspace`, slug },
        });

        await tx.workspaceMember.create({
          data: { userId: newUser.id, workspaceId: workspace.id, role: 'OWNER' },
        });

        return { ...newUser, workspaceMembers: [{ workspaceId: workspace.id, role: 'OWNER' }] };
      }) as any;
    }

    const membership = user!.workspaceMembers[0];
    if (!membership) throw new UnauthorizedException('No workspace found');

    await this.prisma.user.update({
      where: { id: user!.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user!.id, membership.workspaceId, membership.role);
  }

  // ── OAuth code exchange ──────────────────────────────

  /**
   * Create a short-lived authorization code that the frontend exchanges for tokens.
   * This avoids putting JWTs in redirect URLs (which leak via logs/history/referer).
   */
  async createOAuthCode(result: { accessToken: string; refreshToken: string; user: any }): Promise<string> {
    const code = crypto.randomBytes(32).toString('hex');
    const codeHash = hashToken(code);

    await this.prisma.oAuthCode.create({
      data: {
        codeHash,
        userId: result.user.id,
        expiresAt: new Date(Date.now() + 60_000), // 1 minute
      },
    });

    return code;
  }

  /**
   * Exchange a one-time code for access + refresh tokens.
   */
  async exchangeOAuthCode(code: string) {
    const codeHash = hashToken(code);
    const stored = await this.prisma.oAuthCode.findUnique({
      where: { codeHash },
      include: {
        user: {
          include: {
            workspaceMembers: { take: 1, orderBy: { joinedAt: 'asc' } },
          },
        },
      },
    });

    if (!stored || stored.expiresAt < new Date()) {
      // Clean up expired code if found
      if (stored) await this.prisma.oAuthCode.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Invalid or expired authorization code');
    }

    // Delete the code — one-time use
    await this.prisma.oAuthCode.delete({ where: { id: stored.id } });

    const membership = stored.user.workspaceMembers[0];
    if (!membership) throw new UnauthorizedException('No workspace found');

    return this.generateTokens(stored.userId, membership.workspaceId, membership.role);
  }

  // ── Token helpers ─────────────────────────────────────

  private async generateTokens(userId: string, workspaceId: string, role: string) {
    const payload: JwtPayload = { sub: userId, workspaceId, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      privateKey: this.privateKey,
      algorithm: 'RS256',
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
    });

    const refreshTokenRaw = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenRaw)
      .digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      user: await this.getProfile(userId),
    };
  }
}

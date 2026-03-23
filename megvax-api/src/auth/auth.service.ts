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
import { readFileSync } from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../common/types/request.types';

@Injectable()
export class AuthService {
  private privateKey: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {
    this.privateKey = readFileSync(
      this.config.getOrThrow('JWT_PRIVATE_KEY_PATH'),
      'utf8',
    );
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
          emailVerifyToken,
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

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
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
      where: { emailVerifyToken: token },
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
        passwordResetToken: token,
        passwordResetExpiresAt: new Date(Date.now() + 3600000), // 1hr
      },
    });

    await this.emailService.sendPasswordResetEmail(email, token);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
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

    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

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
      where: { token, acceptedAt: null, expiresAt: { gt: new Date() } },
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

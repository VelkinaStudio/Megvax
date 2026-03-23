import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async getCurrent(workspaceId: string) {
    return this.prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      include: {
        _count: { select: { members: true, adAccounts: true } },
      },
    });
  }

  async update(workspaceId: string, data: { name?: string; settings?: Record<string, any> }) {
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data,
    });
  }

  async getMembers(workspaceId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, avatar: true, lastLoginAt: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async inviteMember(workspaceId: string, inviterId: string, dto: InviteMemberDto) {
    const existing = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email: dto.email.toLowerCase() } },
    });
    if (existing) throw new BadRequestException('User is already a member');

    const token = crypto.randomBytes(32).toString('hex');
    const invitation = await this.prisma.invitation.create({
      data: {
        workspaceId,
        email: dto.email.toLowerCase(),
        role: dto.role,
        token,
        invitedById: inviterId,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    const workspace = await this.prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
    });
    const inviter = await this.prisma.user.findUniqueOrThrow({
      where: { id: inviterId },
    });

    await this.emailService.sendInvitationEmail(
      dto.email,
      token,
      workspace.name,
      inviter.fullName,
    );

    return invitation;
  }

  async removeMember(workspaceId: string, memberId: string) {
    const member = await this.prisma.workspaceMember.findUniqueOrThrow({
      where: { id: memberId },
    });
    if (member.workspaceId !== workspaceId) throw new NotFoundException();
    if (member.role === 'OWNER') throw new ForbiddenException('Cannot remove workspace owner');

    await this.prisma.workspaceMember.delete({ where: { id: memberId } });
    return { message: 'Member removed' };
  }

  async updateMemberRole(workspaceId: string, memberId: string, role: string) {
    const member = await this.prisma.workspaceMember.findUniqueOrThrow({
      where: { id: memberId },
    });
    if (member.workspaceId !== workspaceId) throw new NotFoundException();
    if (member.role === 'OWNER') throw new ForbiddenException('Cannot change owner role');
    if (role === 'OWNER') throw new ForbiddenException('Cannot promote to owner');

    return this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: role as any },
    });
  }

  async createApiKey(workspaceId: string, dto: CreateApiKeyDto) {
    const rawKey = `mvx_live_${crypto.randomBytes(32).toString('hex')}`;
    const prefix = rawKey.substring(0, 16);
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    await this.prisma.apiKey.create({
      data: {
        workspaceId,
        name: dto.name,
        prefix,
        hashedKey,
        scopes: dto.scopes,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    return { key: rawKey, prefix, name: dto.name, scopes: dto.scopes };
  }

  async listApiKeys(workspaceId: string) {
    return this.prisma.apiKey.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        prefix: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteApiKey(workspaceId: string, keyId: string) {
    const key = await this.prisma.apiKey.findUniqueOrThrow({ where: { id: keyId } });
    if (key.workspaceId !== workspaceId) throw new NotFoundException();
    await this.prisma.apiKey.delete({ where: { id: keyId } });
    return { message: 'API key revoked' };
  }

  async updateApiKey(workspaceId: string, keyId: string, data: { name?: string; scopes?: string[] }) {
    const key = await this.prisma.apiKey.findUniqueOrThrow({ where: { id: keyId } });
    if (key.workspaceId !== workspaceId) throw new NotFoundException();
    return this.prisma.apiKey.update({ where: { id: keyId }, data });
  }
}

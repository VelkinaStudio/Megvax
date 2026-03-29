import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { WorkspaceService } from './workspace.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

// ── Fixtures ──────────────────────────────────────────
const WS_ID = 'ws-1';
const OTHER_WS_ID = 'ws-other';
const USER_ID = 'user-1';
const MEMBER_ID = 'member-1';
const OWNER_MEMBER_ID = 'member-owner';
const KEY_ID = 'key-1';

const mockWorkspace = {
  id: WS_ID,
  name: 'Acme Corp',
  slug: 'acme-corp',
  settings: {},
  _count: { members: 3, adAccounts: 2 },
};

const mockMember = {
  id: MEMBER_ID,
  workspaceId: WS_ID,
  userId: 'user-2',
  role: 'MEMBER',
  joinedAt: new Date(),
  user: {
    id: 'user-2',
    email: 'member@example.com',
    fullName: 'Regular Member',
    avatar: null,
    lastLoginAt: null,
  },
};

const mockOwnerMember = {
  id: OWNER_MEMBER_ID,
  workspaceId: WS_ID,
  userId: USER_ID,
  role: 'OWNER',
  joinedAt: new Date(),
};

const mockApiKey = {
  id: KEY_ID,
  workspaceId: WS_ID,
  name: 'Production Key',
  prefix: 'mvx_live_abcdef',
  hashedKey: 'hashed',
  scopes: ['campaigns:read', 'campaigns:write'],
  lastUsedAt: null,
  expiresAt: null,
  createdAt: new Date(),
};

const mockInviter = {
  id: USER_ID,
  fullName: 'Alice Admin',
};

// ── Mocks ─────────────────────────────────────────────
const prisma: Record<string, any> = {
  workspace: {
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
  },
  workspaceMember: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUniqueOrThrow: jest.fn(),
  },
  invitation: {
    create: jest.fn(),
  },
  apiKey: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((fn: (tx: any) => any) => fn(prisma)),
};

const emailService = {
  sendInvitationEmail: jest.fn().mockResolvedValue(undefined),
};

// ── Test Suite ────────────────────────────────────────
describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });

  // ── getCurrent ────────────────────────────────────
  describe('getCurrent', () => {
    it('should return workspace with member and adAccount counts', async () => {
      prisma.workspace.findUniqueOrThrow.mockResolvedValue(mockWorkspace);

      const result = await service.getCurrent(WS_ID);

      expect(prisma.workspace.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: WS_ID },
        include: {
          _count: { select: { members: true, adAccounts: true } },
        },
      });
      expect(result).toEqual(mockWorkspace);
      expect(result._count.members).toBe(3);
      expect(result._count.adAccounts).toBe(2);
    });

    it('should propagate error when workspace is not found', async () => {
      prisma.workspace.findUniqueOrThrow.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.getCurrent('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ────────────────────────────────────────
  describe('update', () => {
    it('should update workspace name', async () => {
      const updated = { ...mockWorkspace, name: 'New Name' };
      prisma.workspace.update.mockResolvedValue(updated);

      const result = await service.update(WS_ID, { name: 'New Name' });

      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: WS_ID },
        data: { name: 'New Name' },
      });
      expect(result.name).toBe('New Name');
    });

    it('should update workspace settings', async () => {
      const settings = { timezone: 'UTC', currency: 'USD' };
      const updated = { ...mockWorkspace, settings };
      prisma.workspace.update.mockResolvedValue(updated);

      const result = await service.update(WS_ID, { settings });

      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: WS_ID },
        data: { settings },
      });
      expect(result.settings).toEqual(settings);
    });

    it('should update both name and settings at once', async () => {
      const data = { name: 'Updated', settings: { locale: 'en' } };
      const updated = { ...mockWorkspace, ...data };
      prisma.workspace.update.mockResolvedValue(updated);

      const result = await service.update(WS_ID, data);

      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: WS_ID },
        data,
      });
      expect(result.name).toBe('Updated');
      expect(result.settings).toEqual({ locale: 'en' });
    });
  });

  // ── getMembers ────────────────────────────────────
  describe('getMembers', () => {
    it('should return members with user details ordered by joinedAt', async () => {
      const members = [mockOwnerMember, mockMember];
      prisma.workspaceMember.findMany.mockResolvedValue(members);

      const result = await service.getMembers(WS_ID);

      expect(prisma.workspaceMember.findMany).toHaveBeenCalledWith({
        where: { workspaceId: WS_ID },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatar: true,
              lastLoginAt: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no members exist', async () => {
      prisma.workspaceMember.findMany.mockResolvedValue([]);

      const result = await service.getMembers(WS_ID);

      expect(result).toEqual([]);
    });
  });

  // ── inviteMember ──────────────────────────────────
  describe('inviteMember', () => {
    const dto = { email: 'newuser@example.com', role: 'MEMBER' as const };

    it('should create invitation with hashed token, look up workspace/inviter, and send email', async () => {
      prisma.workspaceMember.findFirst.mockResolvedValue(null);
      const invitation = {
        id: 'inv-1',
        workspaceId: WS_ID,
        email: dto.email,
        role: dto.role,
        tokenHash: expect.any(String),
      };
      prisma.invitation.create.mockResolvedValue(invitation);
      prisma.workspace.findUniqueOrThrow.mockResolvedValue(mockWorkspace);
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockInviter);

      const result = await service.inviteMember(WS_ID, USER_ID, dto);

      // Check invitation was created with hashed token
      expect(prisma.invitation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workspaceId: WS_ID,
          email: dto.email.toLowerCase(),
          role: dto.role,
          invitedById: USER_ID,
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      });

      // Check raw token was sent via email (not the hash)
      expect(emailService.sendInvitationEmail).toHaveBeenCalledWith(
        dto.email,
        expect.any(String),
        mockWorkspace.name,
        mockInviter.fullName,
      );

      expect(result).toEqual(invitation);
    });

    it('should lowercase the email before checking and creating', async () => {
      const uppercaseDto = { email: 'USER@EXAMPLE.COM', role: 'ADMIN' as const };
      prisma.workspaceMember.findFirst.mockResolvedValue(null);
      prisma.invitation.create.mockResolvedValue({ id: 'inv-2' });
      prisma.workspace.findUniqueOrThrow.mockResolvedValue(mockWorkspace);
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockInviter);

      await service.inviteMember(WS_ID, USER_ID, uppercaseDto);

      expect(prisma.workspaceMember.findFirst).toHaveBeenCalledWith({
        where: { workspaceId: WS_ID, user: { email: 'user@example.com' } },
      });
      expect(prisma.invitation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'user@example.com' }),
      });
    });

    it('should throw BadRequestException if user is already a member', async () => {
      prisma.workspaceMember.findFirst.mockResolvedValue(mockMember);

      await expect(
        service.inviteMember(WS_ID, USER_ID, dto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.inviteMember(WS_ID, USER_ID, dto),
      ).rejects.toThrow('User is already a member');

      expect(prisma.invitation.create).not.toHaveBeenCalled();
      expect(emailService.sendInvitationEmail).not.toHaveBeenCalled();
    });

    it('should set expiration to 7 days from now', async () => {
      prisma.workspaceMember.findFirst.mockResolvedValue(null);
      prisma.invitation.create.mockResolvedValue({ id: 'inv-3' });
      prisma.workspace.findUniqueOrThrow.mockResolvedValue(mockWorkspace);
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockInviter);

      const before = Date.now();
      await service.inviteMember(WS_ID, USER_ID, dto);
      const after = Date.now();

      const createCall = prisma.invitation.create.mock.calls[0][0];
      const expiresAt = createCall.data.expiresAt.getTime();
      const sevenDays = 7 * 24 * 3600 * 1000;

      expect(expiresAt).toBeGreaterThanOrEqual(before + sevenDays);
      expect(expiresAt).toBeLessThanOrEqual(after + sevenDays);
    });
  });

  // ── removeMember ──────────────────────────────────
  describe('removeMember', () => {
    it('should delete the member and return confirmation', async () => {
      prisma.workspaceMember.findUniqueOrThrow.mockResolvedValue(mockMember);
      prisma.workspaceMember.delete.mockResolvedValue(mockMember);

      const result = await service.removeMember(WS_ID, MEMBER_ID);

      expect(prisma.workspaceMember.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: MEMBER_ID },
      });
      expect(prisma.workspaceMember.delete).toHaveBeenCalledWith({
        where: { id: MEMBER_ID },
      });
      expect(result).toEqual({ message: 'Member removed' });
    });

    it('should throw ForbiddenException when trying to remove owner', async () => {
      prisma.workspaceMember.findUniqueOrThrow.mockResolvedValue(mockOwnerMember);

      await expect(
        service.removeMember(WS_ID, OWNER_MEMBER_ID),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.removeMember(WS_ID, OWNER_MEMBER_ID),
      ).rejects.toThrow('Cannot remove workspace owner');

      expect(prisma.workspaceMember.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when member belongs to a different workspace', async () => {
      prisma.workspaceMember.findUniqueOrThrow.mockResolvedValue({
        ...mockMember,
        workspaceId: OTHER_WS_ID,
      });

      await expect(
        service.removeMember(WS_ID, MEMBER_ID),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.workspaceMember.delete).not.toHaveBeenCalled();
    });
  });

  // ── updateMemberRole ──────────────────────────────
  describe('updateMemberRole', () => {
    it('should update the role and return updated member', async () => {
      prisma.workspaceMember.findUniqueOrThrow.mockResolvedValue(mockMember);
      const updated = { ...mockMember, role: 'ADMIN' };
      prisma.workspaceMember.update.mockResolvedValue(updated);

      const result = await service.updateMemberRole(WS_ID, MEMBER_ID, 'ADMIN');

      expect(prisma.workspaceMember.update).toHaveBeenCalledWith({
        where: { id: MEMBER_ID },
        data: { role: 'ADMIN' },
      });
      expect(result.role).toBe('ADMIN');
    });

    it('should throw ForbiddenException when changing the owner role', async () => {
      prisma.workspaceMember.findUniqueOrThrow.mockResolvedValue(mockOwnerMember);

      await expect(
        service.updateMemberRole(WS_ID, OWNER_MEMBER_ID, 'ADMIN'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateMemberRole(WS_ID, OWNER_MEMBER_ID, 'ADMIN'),
      ).rejects.toThrow('Cannot change owner role');

      expect(prisma.workspaceMember.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when promoting to OWNER', async () => {
      prisma.workspaceMember.findUniqueOrThrow.mockResolvedValue(mockMember);

      await expect(
        service.updateMemberRole(WS_ID, MEMBER_ID, 'OWNER'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateMemberRole(WS_ID, MEMBER_ID, 'OWNER'),
      ).rejects.toThrow('Cannot promote to owner');

      expect(prisma.workspaceMember.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when member belongs to a different workspace', async () => {
      prisma.workspaceMember.findUniqueOrThrow.mockResolvedValue({
        ...mockMember,
        workspaceId: OTHER_WS_ID,
      });

      await expect(
        service.updateMemberRole(WS_ID, MEMBER_ID, 'ADMIN'),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.workspaceMember.update).not.toHaveBeenCalled();
    });
  });

  // ── createApiKey ──────────────────────────────────
  describe('createApiKey', () => {
    const dto = {
      name: 'Production Key',
      scopes: ['campaigns:read', 'campaigns:write'],
    };

    it('should generate a raw key, store the hash, and return the raw key', async () => {
      prisma.apiKey.create.mockResolvedValue({ id: 'key-new' });

      const result = await service.createApiKey(WS_ID, dto);

      // Raw key starts with prefix
      expect(result.key).toMatch(/^mvx_live_[a-f0-9]{64}$/);
      expect(result.prefix).toBe(result.key.substring(0, 16));
      expect(result.name).toBe(dto.name);
      expect(result.scopes).toEqual(dto.scopes);

      // Verify the stored hash matches the raw key
      const createCall = prisma.apiKey.create.mock.calls[0][0];
      const expectedHash = crypto
        .createHash('sha256')
        .update(result.key)
        .digest('hex');
      expect(createCall.data.hashedKey).toBe(expectedHash);
      expect(createCall.data.workspaceId).toBe(WS_ID);
      expect(createCall.data.name).toBe(dto.name);
      expect(createCall.data.prefix).toBe(result.prefix);
      expect(createCall.data.scopes).toEqual(dto.scopes);
    });

    it('should store null expiresAt when not provided', async () => {
      prisma.apiKey.create.mockResolvedValue({ id: 'key-new' });

      await service.createApiKey(WS_ID, dto);

      const createCall = prisma.apiKey.create.mock.calls[0][0];
      expect(createCall.data.expiresAt).toBeNull();
    });

    it('should store expiresAt as Date when provided', async () => {
      prisma.apiKey.create.mockResolvedValue({ id: 'key-new' });
      const expiresAt = '2027-01-01T00:00:00.000Z';

      await service.createApiKey(WS_ID, { ...dto, expiresAt });

      const createCall = prisma.apiKey.create.mock.calls[0][0];
      expect(createCall.data.expiresAt).toEqual(new Date(expiresAt));
    });
  });

  // ── listApiKeys ───────────────────────────────────
  describe('listApiKeys', () => {
    it('should return keys with selected fields (no hashedKey) ordered by createdAt desc', async () => {
      const keys = [
        {
          id: KEY_ID,
          name: 'Production Key',
          prefix: 'mvx_live_abcdef',
          scopes: ['campaigns:read'],
          lastUsedAt: null,
          expiresAt: null,
          createdAt: new Date(),
        },
      ];
      prisma.apiKey.findMany.mockResolvedValue(keys);

      const result = await service.listApiKeys(WS_ID);

      expect(prisma.apiKey.findMany).toHaveBeenCalledWith({
        where: { workspaceId: WS_ID },
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
      expect(result).toEqual(keys);
      // hashedKey must NOT be in the select
      const selectArg = prisma.apiKey.findMany.mock.calls[0][0].select;
      expect(selectArg).not.toHaveProperty('hashedKey');
    });

    it('should return empty array when no keys exist', async () => {
      prisma.apiKey.findMany.mockResolvedValue([]);

      const result = await service.listApiKeys(WS_ID);

      expect(result).toEqual([]);
    });
  });

  // ── deleteApiKey ──────────────────────────────────
  describe('deleteApiKey', () => {
    it('should delete the key and return confirmation', async () => {
      prisma.apiKey.findUniqueOrThrow.mockResolvedValue(mockApiKey);
      prisma.apiKey.delete.mockResolvedValue(mockApiKey);

      const result = await service.deleteApiKey(WS_ID, KEY_ID);

      expect(prisma.apiKey.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: KEY_ID },
      });
      expect(prisma.apiKey.delete).toHaveBeenCalledWith({
        where: { id: KEY_ID },
      });
      expect(result).toEqual({ message: 'API key revoked' });
    });

    it('should throw NotFoundException when key belongs to a different workspace', async () => {
      prisma.apiKey.findUniqueOrThrow.mockResolvedValue({
        ...mockApiKey,
        workspaceId: OTHER_WS_ID,
      });

      await expect(
        service.deleteApiKey(WS_ID, KEY_ID),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.apiKey.delete).not.toHaveBeenCalled();
    });
  });

  // ── updateApiKey ──────────────────────────────────
  describe('updateApiKey', () => {
    it('should update the key name', async () => {
      prisma.apiKey.findUniqueOrThrow.mockResolvedValue(mockApiKey);
      const updated = { ...mockApiKey, name: 'Staging Key' };
      prisma.apiKey.update.mockResolvedValue(updated);

      const result = await service.updateApiKey(WS_ID, KEY_ID, {
        name: 'Staging Key',
      });

      expect(prisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: KEY_ID },
        data: { name: 'Staging Key' },
      });
      expect(result.name).toBe('Staging Key');
    });

    it('should update the key scopes', async () => {
      prisma.apiKey.findUniqueOrThrow.mockResolvedValue(mockApiKey);
      const newScopes = ['campaigns:read'];
      const updated = { ...mockApiKey, scopes: newScopes };
      prisma.apiKey.update.mockResolvedValue(updated);

      const result = await service.updateApiKey(WS_ID, KEY_ID, {
        scopes: newScopes,
      });

      expect(prisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: KEY_ID },
        data: { scopes: newScopes },
      });
      expect(result.scopes).toEqual(newScopes);
    });

    it('should update both name and scopes at once', async () => {
      prisma.apiKey.findUniqueOrThrow.mockResolvedValue(mockApiKey);
      const data = { name: 'New Name', scopes: ['analytics:read'] };
      const updated = { ...mockApiKey, ...data };
      prisma.apiKey.update.mockResolvedValue(updated);

      const result = await service.updateApiKey(WS_ID, KEY_ID, data);

      expect(prisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: KEY_ID },
        data,
      });
      expect(result.name).toBe('New Name');
      expect(result.scopes).toEqual(['analytics:read']);
    });

    it('should throw NotFoundException when key belongs to a different workspace', async () => {
      prisma.apiKey.findUniqueOrThrow.mockResolvedValue({
        ...mockApiKey,
        workspaceId: OTHER_WS_ID,
      });

      await expect(
        service.updateApiKey(WS_ID, KEY_ID, { name: 'Nope' }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.apiKey.update).not.toHaveBeenCalled();
    });
  });
});

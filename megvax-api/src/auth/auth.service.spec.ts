import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

// ── Helpers ────────────────────────────────────────────
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: '', // set in beforeEach
  fullName: 'Test User',
  avatar: null,
  locale: 'en',
  emailVerified: false,
  emailVerifyToken: null,
  isAdmin: false,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  passwordResetToken: null,
  passwordResetExpiresAt: null,
};

const mockWorkspace = { id: 'ws-1', name: "Test User's Workspace", slug: 'test-user-abc123' };
const mockMembership = { workspaceId: 'ws-1', role: 'OWNER', workspace: mockWorkspace };

// ── Mocks ──────────────────────────────────────────────
const prisma: Record<string, any> = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  workspace: { create: jest.fn() },
  workspaceMember: { create: jest.fn() },
  refreshToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  invitation: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((fn: (tx: any) => any) => fn(prisma)),
};

const jwtService = { signAsync: jest.fn().mockResolvedValue('mock-access-token') };
const configService = {
  getOrThrow: jest.fn((key: string) => {
    if (key === 'JWT_PRIVATE_KEY_PATH') return `${__dirname}/../../keys/private.pem`;
    return key;
  }),
  get: jest.fn((_key: string, fallback: string) => fallback),
};
const emailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};

// Mock fs.readFileSync to avoid needing real key files
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn().mockReturnValue('mock-private-key'),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockUser.passwordHash = await bcrypt.hash('Password123', 4); // low rounds for speed

    // Default mock for getProfile calls inside generateTokens
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: mockUser.id,
      email: mockUser.email,
      fullName: mockUser.fullName,
      avatar: null,
      locale: 'en',
      emailVerified: false,
      isAdmin: false,
      lastLoginAt: null,
      createdAt: mockUser.createdAt,
    });
    prisma.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── Register ───────────────────────────────────────
  describe('register', () => {
    const dto = { email: 'new@example.com', password: 'Password123', fullName: 'New User' };

    it('should create user, workspace, and membership then return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ ...mockUser, id: 'user-new' });
      prisma.workspace.create.mockResolvedValue(mockWorkspace);
      prisma.workspaceMember.create.mockResolvedValue({});

      const result = await service.register(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.workspace.create).toHaveBeenCalled();
      expect(prisma.workspaceMember.create).toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should lowercase the email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.workspace.create.mockResolvedValue(mockWorkspace);
      prisma.workspaceMember.create.mockResolvedValue({});

      await service.register({ ...dto, email: 'NEW@EXAMPLE.COM' });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
    });
  });

  // ── Login ──────────────────────────────────────────
  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'Password123' };

    it('should return tokens on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        workspaceMembers: [mockMembership],
      });
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.login(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { lastLoginAt: expect.any(Date) } }),
      );
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        workspaceMembers: [mockMembership],
      });

      await expect(service.login({ ...dto, password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException on unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if user has no workspace', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        workspaceMembers: [],
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── Refresh Token ──────────────────────────────────
  describe('refreshToken', () => {
    it('should rotate token and return new tokens', async () => {
      const storedToken = {
        id: 'rt-1',
        tokenHash: 'hash',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 86400000),
        user: { ...mockUser, workspaceMembers: [mockMembership] },
      };
      prisma.refreshToken.findFirst.mockResolvedValue(storedToken);
      prisma.refreshToken.delete.mockResolvedValue({});

      const result = await service.refreshToken('hash');

      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'rt-1' } });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw on invalid or expired token', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue(null);

      await expect(service.refreshToken('bad-hash')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── Logout ─────────────────────────────────────────
  describe('logout', () => {
    it('should delete all tokens with the given hash', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout('token-hash');

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { tokenHash: 'token-hash' },
      });
    });
  });

  // ── Verify Email ───────────────────────────────────
  describe('verifyEmail', () => {
    it('should mark email as verified', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, emailVerified: true });

      const result = await service.verifyEmail('raw-token');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { emailVerifyToken: hashToken('raw-token') },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { emailVerified: true, emailVerifyToken: null },
      });
      expect(result).toEqual({ message: 'Email verified' });
    });

    it('should throw on invalid token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail('bad-token')).rejects.toThrow(BadRequestException);
    });
  });

  // ── Forgot Password ───────────────────────────────
  describe('forgotPassword', () => {
    it('should send reset email if user exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.forgotPassword('test@example.com');

      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(result.message).toContain('If the email exists');
    });

    it('should return same message if user does not exist (prevents enumeration)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nobody@example.com');

      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result.message).toContain('If the email exists');
    });
  });

  // ── Reset Password ─────────────────────────────────
  describe('resetPassword', () => {
    it('should update password and revoke all refresh tokens', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.resetPassword('valid-token', 'NewPassword123');

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordResetToken: null,
            passwordResetExpiresAt: null,
          }),
        }),
      );
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
      expect(result).toEqual({ message: 'Password reset successful' });
    });

    it('should throw on invalid or expired token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword('bad-token', 'NewPassword123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── Change Password ────────────────────────────────
  describe('changePassword', () => {
    it('should update password when current password is correct', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.changePassword(mockUser.id, 'Password123', 'NewPassword123');

      expect(prisma.user.update).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Password changed' });
    });

    it('should throw when current password is wrong', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);

      await expect(
        service.changePassword(mockUser.id, 'WrongPassword', 'NewPassword123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── Get Profile ────────────────────────────────────
  describe('getProfile', () => {
    it('should return user profile fields', async () => {
      const profile = {
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        avatar: null,
        locale: 'en',
        emailVerified: false,
        isAdmin: false,
        lastLoginAt: null,
        createdAt: mockUser.createdAt,
      };
      prisma.user.findUniqueOrThrow.mockResolvedValue(profile);

      const result = await service.getProfile(mockUser.id);

      expect(result).toEqual(profile);
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockUser.id } }),
      );
    });
  });

  // ── Update Profile ─────────────────────────────────
  describe('updateProfile', () => {
    it('should update and return selected profile fields', async () => {
      const updated = { ...mockUser, fullName: 'Updated Name' };
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.updateProfile(mockUser.id, { fullName: 'Updated Name' });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: { fullName: 'Updated Name' },
        }),
      );
      expect(result.fullName).toBe('Updated Name');
    });
  });

  // ── Accept Invitation ──────────────────────────────
  describe('acceptInvitation', () => {
    it('should create membership and mark invitation accepted', async () => {
      const invitation = {
        id: 'inv-1',
        token: 'inv-token',
        workspaceId: 'ws-2',
        role: 'MEMBER',
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
      };
      prisma.invitation.findFirst.mockResolvedValue(invitation);
      prisma.workspaceMember.create.mockResolvedValue({});
      prisma.invitation.update.mockResolvedValue({});

      const result = await service.acceptInvitation('inv-token', mockUser.id);

      expect(prisma.workspaceMember.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          workspaceId: 'ws-2',
          role: 'MEMBER',
        },
      });
      expect(result).toEqual({ message: 'Invitation accepted' });
    });

    it('should throw on invalid or expired invitation', async () => {
      prisma.invitation.findFirst.mockResolvedValue(null);

      await expect(service.acceptInvitation('bad-token', mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

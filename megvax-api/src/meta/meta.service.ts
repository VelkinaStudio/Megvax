import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MetaApiClient } from './meta-api.client';
import { EncryptionService } from './encryption.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MetaService {
  private redirectUri: string;

  constructor(
    private prisma: PrismaService,
    private metaApi: MetaApiClient,
    private encryption: EncryptionService,
    private config: ConfigService,
  ) {
    this.redirectUri = this.config.getOrThrow('META_REDIRECT_URI');
  }

  getAuthUrl(workspaceId: string) {
    const payload = JSON.stringify({ workspaceId, ts: Date.now() });
    const hmac = crypto.createHmac('sha256', this.config.getOrThrow('ENCRYPTION_KEY'))
      .update(payload).digest('hex');
    const state = Buffer.from(`${payload}.${hmac}`).toString('base64url');
    return { url: this.metaApi.getOAuthUrl(this.redirectUri, state) };
  }

  async handleCallback(code: string, state: string) {
    const decoded = Buffer.from(state, 'base64url').toString();
    const lastDot = decoded.lastIndexOf('.');
    const payload = decoded.substring(0, lastDot);
    const signature = decoded.substring(lastDot + 1);

    const expected = crypto.createHmac('sha256', this.config.getOrThrow('ENCRYPTION_KEY'))
      .update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      throw new BadRequestException('Invalid OAuth state');
    }

    const { workspaceId, ts } = JSON.parse(payload);
    if (Date.now() - ts > 600000) {
      throw new BadRequestException('OAuth state expired');
    }

    const { accessToken, expiresIn } = await this.metaApi.exchangeCodeForToken(code, this.redirectUri);
    const metaUser = await this.metaApi.getMe(accessToken);

    const encryptedToken = this.encryption.encrypt(accessToken);

    const connection = await this.prisma.metaConnection.upsert({
      where: {
        workspaceId_metaUserId: { workspaceId, metaUserId: metaUser.id },
      },
      update: {
        accessToken: encryptedToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        status: 'ACTIVE',
      },
      create: {
        workspaceId,
        metaUserId: metaUser.id,
        accessToken: encryptedToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });

    return { connectionId: connection.id, metaUserId: metaUser.id };
  }

  async getConnections(workspaceId: string) {
    return this.prisma.metaConnection.findMany({
      where: { workspaceId },
      select: {
        id: true,
        metaUserId: true,
        status: true,
        connectedAt: true,
        tokenExpiresAt: true,
        _count: { select: { adAccounts: true } },
      },
    });
  }

  async deleteConnection(workspaceId: string, connectionId: string) {
    const conn = await this.prisma.metaConnection.findUniqueOrThrow({
      where: { id: connectionId },
    });
    if (conn.workspaceId !== workspaceId) throw new NotFoundException();
    await this.prisma.metaConnection.delete({ where: { id: connectionId } });
    return { message: 'Connection removed' };
  }

  async getAvailableAdAccounts(workspaceId: string) {
    const connections = await this.prisma.metaConnection.findMany({
      where: { workspaceId, status: 'ACTIVE' },
    });

    const accounts: any[] = [];
    for (const conn of connections) {
      const token = this.encryption.decrypt(conn.accessToken);
      const metaAccounts = await this.metaApi.getAdAccounts(token);
      for (const ma of metaAccounts) {
        accounts.push({
          metaAccountId: ma.id.replace('act_', ''),
          name: ma.name,
          currency: ma.currency,
          timezone: ma.timezone_name,
          connectionId: conn.id,
          alreadyConnected: await this.prisma.adAccount.count({
            where: { workspaceId, metaAccountId: ma.id.replace('act_', '') },
          }) > 0,
        });
      }
    }

    return accounts;
  }

  async connectAdAccount(workspaceId: string, metaAccountId: string) {
    const connections = await this.prisma.metaConnection.findMany({
      where: { workspaceId, status: 'ACTIVE' },
    });

    for (const conn of connections) {
      const token = this.encryption.decrypt(conn.accessToken);
      const accounts = await this.metaApi.getAdAccounts(token);
      const match = accounts.find((a: any) => a.id.replace('act_', '') === metaAccountId);
      if (match) {
        return this.prisma.adAccount.create({
          data: {
            metaConnectionId: conn.id,
            workspaceId,
            metaAccountId,
            name: match.name,
            currency: match.currency || 'TRY',
            timezone: match.timezone_name || 'Europe/Istanbul',
          },
        });
      }
    }

    throw new BadRequestException('Ad account not found in any active connection');
  }

  async disconnectAdAccount(workspaceId: string, accountId: string) {
    const account = await this.prisma.adAccount.findUniqueOrThrow({ where: { id: accountId } });
    if (account.workspaceId !== workspaceId) throw new NotFoundException();
    await this.prisma.adAccount.delete({ where: { id: accountId } });
    return { message: 'Ad account disconnected' };
  }
}

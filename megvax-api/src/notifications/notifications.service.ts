import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PaginatedResponse, PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getNotifications(userId: string, unreadOnly: boolean, pagination: PaginationDto): Promise<PaginatedResponse<any>> {
    const limit = pagination.limit || 25;
    const where: any = { userId };
    if (unreadOnly) where.readAt = null;

    const items = await this.prisma.notification.findMany({
      where,
      take: limit + 1,
      ...(pagination.cursor ? { skip: 1, cursor: { id: pagination.cursor } } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = items.length > limit;
    const data = items.slice(0, limit);
    return { data, cursor: data.length > 0 ? data[data.length - 1].id : null, hasMore };
  }

  async markRead(userId: string, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
    return { message: 'Marked as read' };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { message: 'All marked as read' };
  }

  async create(userId: string, workspaceId: string, data: {
    type: any;
    title: string;
    body?: string;
    data?: any;
  }) {
    const notification = await this.prisma.notification.create({
      data: { userId, workspaceId, ...data },
    });

    // Publish to Redis for SSE
    await this.redis.client.publish(
      `notifications:${userId}`,
      JSON.stringify(notification),
    );

    return notification;
  }
}

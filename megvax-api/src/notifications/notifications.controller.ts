import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Sse,
  MessageEvent,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import Redis from 'ioredis';
import { NotificationsService } from './notifications.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('notifications')
export class NotificationsController {
  private publicKey: string;

  constructor(
    private notificationsService: NotificationsService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.publicKey = readFileSync(
      this.config.getOrThrow('JWT_PUBLIC_KEY_PATH'),
      'utf8',
    );
  }

  @Auth()
  @Get()
  getNotifications(
    @CurrentUser('sub') userId: string,
    @Query('unreadOnly') unreadOnly: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.notificationsService.getNotifications(userId, unreadOnly === 'true', pagination);
  }

  @Auth()
  @Patch(':id/read')
  markRead(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.notificationsService.markRead(userId, id);
  }

  @Auth()
  @Post('read-all')
  markAllRead(@CurrentUser('sub') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @Sse('stream')
  async stream(@Query('token') token: string, @Req() req: any): Promise<Observable<MessageEvent>> {
    if (!token) throw new UnauthorizedException('Token required');

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        publicKey: this.publicKey,
        algorithms: ['RS256'],
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = payload.sub;
    const subject = new Subject<MessageEvent>();

    const subscriber = new Redis(this.config.getOrThrow('REDIS_URL'));
    await subscriber.subscribe(`notifications:${userId}`);

    subscriber.on('message', (_channel: string, message: string) => {
      subject.next({ data: message, type: 'notification' } as MessageEvent);
    });

    const heartbeat = setInterval(() => {
      subject.next({ data: '{}', type: 'ping' } as MessageEvent);
    }, 30000);

    const cleanup = () => {
      clearInterval(heartbeat);
      subscriber.unsubscribe();
      subscriber.quit();
      subject.complete();
    };

    req.on('close', cleanup);

    return subject.asObservable();
  }
}

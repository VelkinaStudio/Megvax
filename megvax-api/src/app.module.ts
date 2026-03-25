import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { MetaModule } from './meta/meta.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { InsightsModule } from './insights/insights.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AutopilotModule } from './autopilot/autopilot.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow('REDIS_URL');
        const useTls = url.startsWith('rediss://');
        return {
          connection: {
            url,
            maxRetriesPerRequest: null,
            ...(useTls ? { tls: {} } : {}),
          },
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    RedisModule,
    HealthModule,
    EmailModule,
    AuthModule,
    WorkspaceModule,
    MetaModule,
    CampaignsModule,
    InsightsModule,
    NotificationsModule,
    AutopilotModule,
    SuggestionsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}

# MegVax Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the NestJS backend with auth, workspace management, Meta OAuth + sync, and read-only campaign/insights endpoints — then wire the existing Next.js 16 frontend to the real API.

**Architecture:** Separate NestJS 11 API (`megvax-api/`) alongside the existing Next.js frontend (`D:/MegvaxV4-main/`). Prisma ORM with Neon PostgreSQL. BullMQ workers on Upstash Redis for Meta sync. RS256 JWT auth with httpOnly refresh token cookies.

**Tech Stack:** NestJS 11, Prisma ORM, PostgreSQL (Neon), Redis (Upstash), BullMQ, @nestjs/jwt (RS256), @nestjs/bullmq, bcrypt, class-validator, class-transformer, Resend SDK

**Spec:** `D:/MegvaxV4-main/docs/superpowers/specs/2026-03-23-megvax-platform-design.md`

---

## File Structure

```
D:/MegvaxV4-main/megvax-api/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── .env.example
├── .gitignore
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── keys/                          # RS256 key pair (gitignored)
│   ├── private.pem
│   └── public.pem
├── src/
│   ├── main.ts                    # Bootstrap, CORS, validation pipe, cookie parser
│   ├── app.module.ts              # Root module, imports all feature modules
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── plan.guard.ts
│   │   ├── decorators/
│   │   │   ├── auth.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── plan-limit.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── interceptors/
│   │   │   └── plan-limit.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── dto/
│   │   │   └── pagination.dto.ts
│   │   ├── config/
│   │   │   └── plan-limits.config.ts
│   │   └── types/
│   │       └── request.types.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── redis/
│   │   ├── redis.module.ts
│   │   └── redis.service.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh.dto.ts
│   │   │   ├── verify-email.dto.ts
│   │   │   ├── forgot-password.dto.ts
│   │   │   ├── reset-password.dto.ts
│   │   │   ├── change-password.dto.ts
│   │   │   ├── update-profile.dto.ts
│   │   │   └── accept-invitation.dto.ts
│   │   └── auth.controller.spec.ts
│   ├── workspace/
│   │   ├── workspace.module.ts
│   │   ├── workspace.controller.ts
│   │   ├── workspace.service.ts
│   │   ├── dto/
│   │   │   ├── update-workspace.dto.ts
│   │   │   ├── invite-member.dto.ts
│   │   │   ├── update-member.dto.ts
│   │   │   └── create-api-key.dto.ts
│   │   └── workspace.controller.spec.ts
│   ├── meta/
│   │   ├── meta.module.ts
│   │   ├── meta.controller.ts
│   │   ├── meta.service.ts
│   │   ├── meta-sync.processor.ts
│   │   ├── meta-api.client.ts
│   │   ├── encryption.service.ts
│   │   ├── dto/
│   │   │   └── connect-account.dto.ts
│   │   └── meta.controller.spec.ts
│   ├── campaigns/
│   │   ├── campaigns.module.ts
│   │   ├── campaigns.controller.ts
│   │   ├── campaigns.service.ts
│   │   ├── dto/
│   │   │   └── campaign-query.dto.ts
│   │   └── campaigns.controller.spec.ts
│   ├── insights/
│   │   ├── insights.module.ts
│   │   ├── insights.controller.ts
│   │   ├── insights.service.ts
│   │   ├── dto/
│   │   │   └── insights-query.dto.ts
│   │   └── insights.controller.spec.ts
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   └── notifications.gateway.ts  # SSE endpoint
│   ├── health/
│   │   ├── health.module.ts
│   │   └── health.controller.ts
│   └── email/
│       ├── email.module.ts
│       └── email.service.ts
└── test/
    ├── jest-e2e.json
    └── app.e2e-spec.ts
```

---

## Task 1: Scaffold NestJS Project + Prisma + Redis

**Files:**
- Create: `megvax-api/package.json`
- Create: `megvax-api/tsconfig.json`
- Create: `megvax-api/tsconfig.build.json`
- Create: `megvax-api/nest-cli.json`
- Create: `megvax-api/.env.example`
- Create: `megvax-api/.gitignore`
- Create: `megvax-api/src/main.ts`
- Create: `megvax-api/src/app.module.ts`
- Create: `megvax-api/src/prisma/prisma.module.ts`
- Create: `megvax-api/src/prisma/prisma.service.ts`
- Create: `megvax-api/src/redis/redis.module.ts`
- Create: `megvax-api/src/redis/redis.service.ts`

- [ ] **Step 1: Create the NestJS project directory and package.json**

```bash
cd /d/MegvaxV4-main
mkdir -p megvax-api/src
```

```json
// megvax-api/package.json
{
  "name": "megvax-api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@nestjs/common": "^11.1.0",
    "@nestjs/core": "^11.1.0",
    "@nestjs/platform-express": "^11.1.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/bullmq": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/throttler": "^6.0.0",
    "@prisma/client": "^6.0.0",
    "bcrypt": "^6.0.0",
    "bullmq": "^5.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "cookie-parser": "^1.4.0",
    "ioredis": "^5.0.0",
    "resend": "^4.0.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/testing": "^11.1.0",
    "@types/bcrypt": "^5.0.0",
    "@types/cookie-parser": "^1.4.0",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.0.0",
    "@types/node": "^22.0.0",
    "jest": "^29.0.0",
    "prisma": "^6.0.0",
    "ts-jest": "^29.0.0",
    "ts-node": "^10.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create tsconfig files**

```json
// megvax-api/tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

```json
// megvax-api/tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts"]
}
```

```json
// megvax-api/nest-cli.json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 3: Create .env.example and .gitignore**

```bash
# megvax-api/.env.example
DATABASE_URL=postgresql://user:password@host:5432/megvax
REDIS_URL=rediss://default:password@host:6379

JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

ENCRYPTION_KEY=your-32-byte-hex-key-here

META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=http://localhost:4000/meta/callback

RESEND_API_KEY=re_your_api_key
FROM_EMAIL=noreply@megvax.com

ADMIN_EMAIL=admin@megvax.com
FRONTEND_URL=http://localhost:3000

PORT=4000
NODE_ENV=development
```

```gitignore
# megvax-api/.gitignore
node_modules/
dist/
.env
keys/
*.pem
```

- [ ] **Step 4: Create PrismaModule and PrismaService**

```typescript
// megvax-api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// megvax-api/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 5: Create RedisModule and RedisService**

```typescript
// megvax-api/src/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public readonly client: Redis;

  constructor(private config: ConfigService) {
    this.client = new Redis(this.config.getOrThrow('REDIS_URL'), {
      maxRetriesPerRequest: null, // required by BullMQ
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.client.set(key, '1', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.client.del(key);
  }
}
```

```typescript
// megvax-api/src/redis/redis.module.ts
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
```

- [ ] **Step 6: Create main.ts bootstrap**

```typescript
// megvax-api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`MegVax API running on port ${port}`);
}
bootstrap();
```

- [ ] **Step 7: Create AppModule (minimal — modules added in later tasks)**

```typescript
// megvax-api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    HealthModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 8: Create HealthModule**

```typescript
// megvax-api/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  async check() {
    const checks: Record<string, string> = {};

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }

    try {
      await this.redis.client.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
    }

    const healthy = Object.values(checks).every((v) => v === 'ok');
    return { status: healthy ? 'ok' : 'degraded', checks };
  }
}
```

```typescript
// megvax-api/src/health/health.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

- [ ] **Step 9: Install dependencies and verify project compiles**

```bash
cd /d/MegvaxV4-main/megvax-api
npm install
```

Run: `npx tsc --noEmit`
Expected: No errors (Prisma client not yet generated, so comment out imports temporarily or generate first)

- [ ] **Step 10: Generate RS256 key pair**

```bash
cd /d/MegvaxV4-main/megvax-api
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

- [ ] **Step 11: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/
git commit -m "feat: scaffold NestJS project with Prisma, Redis, health endpoint"
```

---

## Task 2: Prisma Schema — Auth, Workspace, Meta, Campaigns, Insights

**Files:**
- Create: `megvax-api/prisma/schema.prisma`
- Create: `megvax-api/prisma/seed.ts`

**Reference:** Spec sections "Database Schema" (lines 59–455)

- [ ] **Step 1: Write the Prisma schema**

```prisma
// megvax-api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Auth & Workspace ──────────────────────────────────

model User {
  id                    String    @id @default(uuid()) @db.Uuid
  email                 String    @unique
  passwordHash          String
  fullName              String
  avatar                String?
  locale                String    @default("tr") // tr | en
  emailVerified         Boolean   @default(false)
  emailVerifyToken      String?
  passwordResetToken    String?
  passwordResetExpiresAt DateTime?
  isAdmin               Boolean   @default(false)
  lastLoginAt           DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  workspaceMembers WorkspaceMember[]
  refreshTokens    RefreshToken[]
  invitationsSent  Invitation[]      @relation("InvitedBy")
  auditLogs        AuditLog[]
  notifications    Notification[]

  @@index([email])
}

model Workspace {
  id               String   @id @default(uuid()) @db.Uuid
  name             String
  slug             String   @unique
  plan             Plan     @default(STARTER)
  stripeCustomerId String?
  settings         Json?    // timezone, currency, defaultNotificationPrefs
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  members        WorkspaceMember[]
  invitations    Invitation[]
  apiKeys        ApiKey[]
  metaConnections MetaConnection[]
  adAccounts     AdAccount[]
  auditLogs      AuditLog[]
  notifications  Notification[]

  @@index([slug])
}

enum Plan {
  STARTER
  PRO
  AGENCY
}

model WorkspaceMember {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid
  workspaceId String   @db.Uuid
  role        Role     @default(MEMBER)
  joinedAt    DateTime @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
}

enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Invitation {
  id          String    @id @default(uuid()) @db.Uuid
  workspaceId String    @db.Uuid
  email       String
  role        Role      @default(MEMBER)
  token       String    @unique
  invitedById String    @db.Uuid
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime  @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  invitedBy User      @relation("InvitedBy", fields: [invitedById], references: [id])

  @@index([token])
}

model RefreshToken {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @db.Uuid
  tokenHash  String
  deviceInfo String?
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([tokenHash])
}

model ApiKey {
  id          String    @id @default(uuid()) @db.Uuid
  workspaceId String    @db.Uuid
  name        String
  prefix      String    // first 8 chars of the key for display
  hashedKey   String    // SHA-256 hash
  scopes      String[]  // ['campaigns:read', 'campaigns:write', ...]
  rateLimit   Int?
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([hashedKey])
}

// ─── Meta Integration ──────────────────────────────────

model MetaConnection {
  id            String           @id @default(uuid()) @db.Uuid
  workspaceId   String           @db.Uuid
  metaUserId    String
  accessToken   String           // AES-256-GCM encrypted
  tokenExpiresAt DateTime?
  status        ConnectionStatus @default(ACTIVE)
  connectedAt   DateTime         @default(now())

  workspace  Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  adAccounts AdAccount[]

  @@unique([workspaceId, metaUserId])
}

enum ConnectionStatus {
  ACTIVE
  EXPIRED
  REVOKED
}

model AdAccount {
  id                  String     @id @default(uuid()) @db.Uuid
  metaConnectionId    String     @db.Uuid
  workspaceId         String     @db.Uuid
  metaAccountId       String
  name                String
  currency            String     @default("TRY")
  timezone            String     @default("Europe/Istanbul")
  status              AccountStatus @default(ACTIVE)
  autopilotEnabled    Boolean    @default(false)
  autopilotAggression Aggression @default(BALANCED)
  lastSyncAt          DateTime?
  lastSyncError       String?
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  metaConnection MetaConnection   @relation(fields: [metaConnectionId], references: [id], onDelete: Cascade)
  workspace      Workspace        @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  campaigns      Campaign[]
  adSets         AdSet[]
  ads            Ad[]
  insightSnapshots InsightSnapshot[]

  @@unique([workspaceId, metaAccountId])
  @@index([metaAccountId])
}

enum AccountStatus {
  ACTIVE
  DISABLED
  CLOSED
}

enum Aggression {
  CONSERVATIVE
  BALANCED
  AGGRESSIVE
}

// ─── Campaigns ─────────────────────────────────────────

model Campaign {
  id                String         @id @default(uuid()) @db.Uuid
  adAccountId       String         @db.Uuid
  metaCampaignId    String?
  name              String
  status            EntityStatus   @default(ACTIVE)
  objective         String?
  buyingType        String?
  budgetType        BudgetType?
  dailyBudget       Decimal?       @db.Decimal(12, 4)
  lifetimeBudget    Decimal?       @db.Decimal(12, 4)
  bidStrategy       String?
  specialAdCategories String[]
  startTime         DateTime?
  endTime           DateTime?
  metaRaw           Json?
  localVersion      Int            @default(0)
  syncStatus        SyncStatus     @default(SYNCED)
  deletedAt         DateTime?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  lastSyncAt        DateTime?

  adAccount AdAccount @relation(fields: [adAccountId], references: [id], onDelete: Cascade)
  adSets    AdSet[]

  @@unique([adAccountId, metaCampaignId])
  @@index([adAccountId, status])
}

enum EntityStatus {
  ACTIVE
  PAUSED
  DELETED
  ARCHIVED
}

enum BudgetType {
  DAILY
  LIFETIME
}

enum SyncStatus {
  SYNCED
  LOCAL_PENDING
  CONFLICT
}

model AdSet {
  id               String       @id @default(uuid()) @db.Uuid
  campaignId       String       @db.Uuid
  adAccountId      String       @db.Uuid
  metaAdSetId      String?
  name             String
  status           EntityStatus @default(ACTIVE)
  targeting        Json?
  placements       Json?
  bidAmount        Decimal?     @db.Decimal(12, 4)
  dailyBudget      Decimal?     @db.Decimal(12, 4)
  lifetimeBudget   Decimal?     @db.Decimal(12, 4)
  scheduledStart   DateTime?
  scheduledEnd     DateTime?
  optimizationGoal String?
  billingEvent     String?
  metaRaw          Json?
  localVersion     Int          @default(0)
  syncStatus       SyncStatus   @default(SYNCED)
  deletedAt        DateTime?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  lastSyncAt       DateTime?

  campaign  Campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  adAccount AdAccount @relation(fields: [adAccountId], references: [id], onDelete: Cascade)
  ads       Ad[]

  @@unique([adAccountId, metaAdSetId])
  @@index([campaignId, status])
}

model Ad {
  id             String       @id @default(uuid()) @db.Uuid
  adSetId        String       @db.Uuid
  adAccountId    String       @db.Uuid
  metaAdId       String?
  name           String
  status         EntityStatus @default(ACTIVE)
  creativeSpec   Json?
  previewUrl     String?
  thumbnailUrl   String?
  metaRaw        Json?
  localVersion   Int          @default(0)
  syncStatus     SyncStatus   @default(SYNCED)
  deletedAt      DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  lastSyncAt     DateTime?

  adSet     AdSet     @relation(fields: [adSetId], references: [id], onDelete: Cascade)
  adAccount AdAccount @relation(fields: [adAccountId], references: [id], onDelete: Cascade)

  @@unique([adAccountId, metaAdId])
  @@index([adSetId, status])
}

// ─── Insights ──────────────────────────────────────────

model InsightSnapshot {
  id          BigInt     @id @default(autoincrement())
  adAccountId String     @db.Uuid
  entityType  EntityType
  entityId    String     @db.Uuid // no FK — analytics table
  date        DateTime   @db.Date
  spend       Decimal    @default(0) @db.Decimal(12, 4)
  impressions Int        @default(0)
  reach       Int        @default(0)
  clicks      Int        @default(0)
  conversions Int        @default(0)
  revenue     Decimal    @default(0) @db.Decimal(12, 4)
  ctr         Decimal    @default(0) @db.Decimal(8, 6)
  cpm         Decimal    @default(0) @db.Decimal(12, 4)
  cpc         Decimal    @default(0) @db.Decimal(12, 4)
  cpa         Decimal    @default(0) @db.Decimal(12, 4)
  roas        Decimal    @default(0) @db.Decimal(8, 4)
  frequency   Decimal    @default(0) @db.Decimal(8, 4)
  breakdowns  Json?
  createdAt   DateTime   @default(now())

  adAccount AdAccount @relation(fields: [adAccountId], references: [id], onDelete: Cascade)

  @@unique([adAccountId, entityType, entityId, date])
  @@index([adAccountId, entityType, date])
  @@index([entityId, date])
}

enum EntityType {
  ACCOUNT
  CAMPAIGN
  ADSET
  AD
}

// ─── Audit & Notifications ─────────────────────────────

model AuditLog {
  id          String      @id @default(uuid()) @db.Uuid
  workspaceId String      @db.Uuid
  userId      String?     @db.Uuid
  action      String
  source      AuditSource @default(USER)
  entityType  String?
  entityId    String?
  changes     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime    @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([workspaceId, createdAt])
  @@index([entityType, entityId])
}

enum AuditSource {
  USER
  META_SYNC
  AUTOPILOT
  SYSTEM
  ADMIN_IMPERSONATE
}

model Notification {
  id          String           @id @default(uuid()) @db.Uuid
  userId      String           @db.Uuid
  workspaceId String           @db.Uuid
  type        NotificationType
  title       String
  body        String?
  data        Json?
  readAt      DateTime?
  createdAt   DateTime         @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([userId, readAt, createdAt])
}

enum NotificationType {
  AUTOPILOT_ACTION
  SUGGESTION
  TEAM_INVITE
  BILLING
  SYSTEM
  META_CONNECTION
}
```

- [ ] **Step 2: Write the seed file**

```typescript
// megvax-api/prisma/seed.ts
import { PrismaClient, Plan, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@megvax.com';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash('admin123456', 12),
      fullName: 'MegVax Admin',
      isAdmin: true,
      emailVerified: true,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'megvax-demo' },
    update: {},
    create: {
      name: 'MegVax Demo',
      slug: 'megvax-demo',
      plan: Plan.AGENCY,
      settings: { timezone: 'Europe/Istanbul', currency: 'TRY' },
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId: admin.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      workspaceId: workspace.id,
      role: Role.OWNER,
    },
  });

  console.log('Seed complete: admin user + demo workspace created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 3: Generate Prisma client and run initial migration**

```bash
cd /d/MegvaxV4-main/megvax-api
npx prisma generate
npx prisma migrate dev --name init
```

Expected: Migration created, client generated, tables created in database.

- [ ] **Step 4: Run seed**

```bash
cd /d/MegvaxV4-main/megvax-api
npx ts-node prisma/seed.ts
```

Expected: "Seed complete: admin user + demo workspace created"

- [ ] **Step 5: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/prisma/
git commit -m "feat: add Prisma schema with auth, workspace, meta, campaigns, insights tables"
```

---

## Task 3: Common Guards, Decorators, and Error Handling

**Files:**
- Create: `megvax-api/src/common/guards/jwt-auth.guard.ts`
- Create: `megvax-api/src/common/guards/roles.guard.ts`
- Create: `megvax-api/src/common/guards/plan.guard.ts`
- Create: `megvax-api/src/common/decorators/auth.decorator.ts`
- Create: `megvax-api/src/common/decorators/roles.decorator.ts`
- Create: `megvax-api/src/common/decorators/plan-limit.decorator.ts`
- Create: `megvax-api/src/common/decorators/current-user.decorator.ts`
- Create: `megvax-api/src/common/interceptors/plan-limit.interceptor.ts`
- Create: `megvax-api/src/common/filters/http-exception.filter.ts`
- Create: `megvax-api/src/common/middleware/csrf.middleware.ts`
- Create: `megvax-api/src/common/dto/pagination.dto.ts`
- Create: `megvax-api/src/common/config/plan-limits.config.ts`
- Create: `megvax-api/src/common/types/request.types.ts`

- [ ] **Step 1: Create request types**

```typescript
// megvax-api/src/common/types/request.types.ts
import { Request } from 'express';

export interface JwtPayload {
  sub: string;        // userId
  workspaceId: string;
  role: string;
  impersonatedBy?: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
```

- [ ] **Step 2: Create decorators**

```typescript
// megvax-api/src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types/request.types';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtPayload = request.user;
    return data ? user?.[data] : user;
  },
);
```

```typescript
// megvax-api/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// megvax-api/src/common/decorators/plan-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PLAN_LIMIT_KEY = 'planLimit';
export const PlanLimit = (feature: string) => SetMetadata(PLAN_LIMIT_KEY, feature);
```

```typescript
// megvax-api/src/common/decorators/auth.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}
```

- [ ] **Step 3: Create JwtAuthGuard**

```typescript
// megvax-api/src/common/guards/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { JwtPayload } from '../types/request.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private publicKey: string;

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.publicKey = readFileSync(
      this.config.getOrThrow('JWT_PUBLIC_KEY_PATH'),
      'utf8',
    );
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
    // Check Authorization header first
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) return token;

    // Check cookie as fallback
    return request.cookies?.access_token;
  }
}
```

- [ ] **Step 4: Create RolesGuard**

```typescript
// megvax-api/src/common/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_HIERARCHY: Record<string, number> = {
  VIEWER: 0,
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) throw new ForbiddenException('No role assigned');

    const userLevel = ROLE_HIERARCHY[user.role] ?? -1;
    const requiredLevel = Math.min(
      ...requiredRoles.map((r) => ROLE_HIERARCHY[r] ?? Infinity),
    );

    if (userLevel < requiredLevel) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
```

- [ ] **Step 5: Create PlanLimitInterceptor and PlanGuard**

```typescript
// megvax-api/src/common/config/plan-limits.config.ts
export interface PlanLimits {
  maxAdAccounts: number;
  maxTeamMembers: number;
  autopilot: 'none' | 'basic' | 'full' | 'full+custom';
  capi: boolean;
  apiAccess: boolean;
  apiRateLimit: number;
  maxScheduledReports: number;
  maxWebhooks: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  STARTER: {
    maxAdAccounts: 2,
    maxTeamMembers: 2,
    autopilot: 'basic',
    capi: false,
    apiAccess: false,
    apiRateLimit: 0,
    maxScheduledReports: 0,
    maxWebhooks: 0,
  },
  PRO: {
    maxAdAccounts: 10,
    maxTeamMembers: 10,
    autopilot: 'full',
    capi: true,
    apiAccess: true,
    apiRateLimit: 300,
    maxScheduledReports: 5,
    maxWebhooks: 5,
  },
  AGENCY: {
    maxAdAccounts: -1, // -1 = unlimited
    maxTeamMembers: -1,
    autopilot: 'full+custom',
    capi: true,
    apiAccess: true,
    apiRateLimit: 1000,
    maxScheduledReports: -1,
    maxWebhooks: -1,
  },
};
```

```typescript
// megvax-api/src/common/interceptors/plan-limit.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PLAN_LIMIT_KEY } from '../decorators/plan-limit.decorator';
import { PLAN_LIMITS } from '../config/plan-limits.config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class PlanLimitInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const feature = this.reflector.get<string>(
      PLAN_LIMIT_KEY,
      context.getHandler(),
    );

    if (!feature) return next.handle();

    const request = context.switchToHttp().getRequest();
    const { workspaceId } = request.user;

    // Get workspace plan (cached 5min)
    const cacheKey = `plan:${workspaceId}`;
    let plan = await this.redis.get(cacheKey);

    if (!plan) {
      const workspace = await this.prisma.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
        select: { plan: true },
      });
      plan = workspace.plan;
      await this.redis.set(cacheKey, plan, 300);
    }

    const limits = PLAN_LIMITS[plan];
    if (!limits) {
      throw new ForbiddenException('Unknown plan');
    }

    // Check features: false = blocked, -1 = unlimited, number = limited
    if (feature in limits) {
      const value = limits[feature as keyof typeof limits];
      if (value === -1) return next.handle(); // unlimited
      if (value === false) {
        throw new ForbiddenException({
          code: 'PLAN_LIMIT_EXCEEDED',
          message: `Feature "${feature}" is not available on the ${plan} plan`,
          upgradeUrl: '/billing/checkout',
        });
      }
    }

    return next.handle();
  }
}
```

```typescript
// megvax-api/src/common/guards/plan.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PlanLimitInterceptor } from '../interceptors/plan-limit.interceptor';

// Re-export PlanLimitInterceptor as a guard for simpler usage
// The actual logic is in the interceptor; this guard is a thin wrapper
@Injectable()
export class PlanGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // PlanLimit is enforced via interceptor, not guard
    // This guard exists for documentation/decorator consistency
    return true;
  }
}
```

- [ ] **Step 6: Create HttpExceptionFilter**

```typescript
// megvax-api/src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, any>;
        message = obj.message || exception.message;
        code = obj.code || obj.error || 'ERROR';
      } else {
        message = String(res);
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      error: {
        code,
        message: Array.isArray(message) ? message[0] : message,
      },
    });
  }
}
```

- [ ] **Step 7: Create CSRF middleware**

```typescript
// megvax-api/src/common/middleware/csrf.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const MUTATING_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (MUTATING_METHODS.includes(req.method)) {
      const header = req.headers['x-requested-with'];
      if (!header || header !== 'XMLHttpRequest') {
        throw new ForbiddenException('Missing X-Requested-With header');
      }
    }
    next();
  }
}
```

Note: Register this middleware in AppModule by implementing `NestModule.configure()`:
```typescript
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}
```

- [ ] **Step 8: Create pagination DTO**

```typescript
// megvax-api/src/common/dto/pagination.dto.ts
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;
}

export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
}
```

- [ ] **Step 9: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/common/
git commit -m "feat: add guards, decorators, interceptors, CSRF middleware, filters, pagination DTO"
```

---

## Task 4: Email Service (Resend)

**Files:**
- Create: `megvax-api/src/email/email.module.ts`
- Create: `megvax-api/src/email/email.service.ts`

- [ ] **Step 1: Create EmailService**

```typescript
// megvax-api/src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private from: string;
  private frontendUrl: string;

  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.getOrThrow('RESEND_API_KEY'));
    this.from = this.config.get('FROM_EMAIL', 'noreply@megvax.com');
    this.frontendUrl = this.config.getOrThrow('FRONTEND_URL');
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${this.frontendUrl}/verify-email?token=${token}`;
    await this.send(email, 'E-postanızı doğrulayın — MegVax', `
      <h2>MegVax'a hoş geldiniz!</h2>
      <p>E-postanızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">E-postamı Doğrula</a>
      <p>Bu bağlantı 24 saat geçerlidir.</p>
    `);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `${this.frontendUrl}/reset-password?token=${token}`;
    await this.send(email, 'Şifre sıfırlama — MegVax', `
      <h2>Şifre Sıfırlama</h2>
      <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">Şifremi Sıfırla</a>
      <p>Bu bağlantı 1 saat geçerlidir. Siz talep etmediyseniz bu e-postayı görmezden gelin.</p>
    `);
  }

  async sendInvitationEmail(email: string, token: string, workspaceName: string, inviterName: string) {
    const url = `${this.frontendUrl}/signup?invitation=${token}`;
    await this.send(email, `${workspaceName} ekibine davet — MegVax`, `
      <h2>Ekip Daveti</h2>
      <p><strong>${inviterName}</strong> sizi <strong>${workspaceName}</strong> çalışma alanına davet etti.</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">Daveti Kabul Et</a>
      <p>Bu bağlantı 7 gün geçerlidir.</p>
    `);
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error}`);
      // Don't throw — email failure shouldn't break auth flow
    }
  }
}
```

```typescript
// megvax-api/src/email/email.module.ts
import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
```

- [ ] **Step 2: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/email/
git commit -m "feat: add email service with Resend for verification, reset, invitations"
```

---

## Task 5: Auth Module — Register, Login, JWT, Refresh Tokens

**Files:**
- Create: `megvax-api/src/auth/auth.module.ts`
- Create: `megvax-api/src/auth/auth.controller.ts`
- Create: `megvax-api/src/auth/auth.service.ts`
- Create: `megvax-api/src/auth/dto/register.dto.ts`
- Create: `megvax-api/src/auth/dto/login.dto.ts`
- Create: `megvax-api/src/auth/dto/verify-email.dto.ts`
- Create: `megvax-api/src/auth/dto/forgot-password.dto.ts`
- Create: `megvax-api/src/auth/dto/reset-password.dto.ts`
- Create: `megvax-api/src/auth/dto/change-password.dto.ts`
- Create: `megvax-api/src/auth/dto/update-profile.dto.ts`
- Create: `megvax-api/src/auth/dto/accept-invitation.dto.ts`

**Spec reference:** Auth Module section (lines 460–484)

- [ ] **Step 1: Create DTOs**

```typescript
// megvax-api/src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;
}
```

```typescript
// megvax-api/src/auth/dto/login.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

```typescript
// megvax-api/src/auth/dto/verify-email.dto.ts
import { IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  token: string;
}
```

```typescript
// megvax-api/src/auth/dto/forgot-password.dto.ts
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
```

```typescript
// megvax-api/src/auth/dto/reset-password.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
```

```typescript
// megvax-api/src/auth/dto/change-password.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
```

```typescript
// megvax-api/src/auth/dto/update-profile.dto.ts
import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsIn(['tr', 'en'])
  locale?: string;
}
```

```typescript
// megvax-api/src/auth/dto/accept-invitation.dto.ts
import { IsString } from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  token: string;
}
```

- [ ] **Step 2: Create AuthService**

```typescript
// megvax-api/src/auth/auth.service.ts
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
```

- [ ] **Step 3: Create AuthController**

```typescript
// megvax-api/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { Throttle } from '@nestjs/throttler';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload, AuthenticatedRequest } from '../common/types/request.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (!token) {
      return res.status(401).json({ error: { code: 'NO_TOKEN', message: 'No refresh token' } });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await this.authService.refreshToken(tokenHash);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await this.authService.logout(tokenHash);
    }
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }

  @Post('verify-email')
  @HttpCode(200)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Auth()
  @Get('me')
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Auth()
  @Patch('me')
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  @Auth()
  @Post('change-password')
  @HttpCode(200)
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
  }

  @Auth()
  @Post('accept-invitation')
  @HttpCode(200)
  async acceptInvitation(
    @CurrentUser('sub') userId: string,
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.authService.acceptInvitation(dto.token, userId);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 3600 * 1000, // 7 days
      path: '/auth', // covers /auth/refresh and /auth/logout
    });
  }
}
```

- [ ] **Step 4: Create AuthModule**

```typescript
// megvax-api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({}), // Keys provided per-call in AuthService
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

- [ ] **Step 5: Register AuthModule in AppModule**

Add `AuthModule` to imports in `megvax-api/src/app.module.ts`:

```typescript
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    EmailModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Test auth endpoints manually**

```bash
cd /d/MegvaxV4-main/megvax-api
npm run dev
```

Test with curl:
```bash
# Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test12345","fullName":"Test User"}'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test12345"}'

# Get profile (use accessToken from login response)
curl http://localhost:4000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

Expected: 201 with accessToken on register, 200 with accessToken on login, 200 with user profile on GET /me.

- [ ] **Step 7: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/auth/ megvax-api/src/app.module.ts
git commit -m "feat: add auth module with register, login, JWT RS256, refresh tokens, email verification"
```

---

## Task 6: Workspace Module

**Files:**
- Create: `megvax-api/src/workspace/workspace.module.ts`
- Create: `megvax-api/src/workspace/workspace.controller.ts`
- Create: `megvax-api/src/workspace/workspace.service.ts`
- Create: `megvax-api/src/workspace/dto/update-workspace.dto.ts`
- Create: `megvax-api/src/workspace/dto/invite-member.dto.ts`
- Create: `megvax-api/src/workspace/dto/update-member.dto.ts`
- Create: `megvax-api/src/workspace/dto/create-api-key.dto.ts`

**Spec reference:** Workspace Module section (lines 483–500)

- [ ] **Step 1: Create DTOs**

```typescript
// megvax-api/src/workspace/dto/update-workspace.dto.ts
import { IsOptional, IsString, IsObject, MaxLength } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
```

```typescript
// megvax-api/src/workspace/dto/invite-member.dto.ts
import { IsEmail, IsIn } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsIn(['ADMIN', 'MEMBER', 'VIEWER'])
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}
```

```typescript
// megvax-api/src/workspace/dto/update-member.dto.ts
import { IsIn } from 'class-validator';

export class UpdateMemberDto {
  @IsIn(['ADMIN', 'MEMBER', 'VIEWER'])
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}
```

```typescript
// megvax-api/src/workspace/dto/create-api-key.dto.ts
import { IsString, IsArray, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsArray()
  @IsString({ each: true })
  scopes: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
```

- [ ] **Step 2: Create WorkspaceService**

```typescript
// megvax-api/src/workspace/workspace.service.ts
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
    // Check if already a member
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
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000), // 7 days
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

  // ── API Keys ─────────────────────────────────────────

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

    // Return plaintext key ONCE
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
```

- [ ] **Step 3: Create WorkspaceController**

```typescript
// megvax-api/src/workspace/workspace.controller.ts
import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { Auth } from '../common/decorators/auth.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Auth()
@Controller('workspaces')
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @Get('current')
  getCurrent(@CurrentUser('workspaceId') workspaceId: string) {
    return this.workspaceService.getCurrent(workspaceId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('current')
  update(
    @CurrentUser('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(workspaceId, dto);
  }

  @Get('current/members')
  getMembers(@CurrentUser('workspaceId') workspaceId: string) {
    return this.workspaceService.getMembers(workspaceId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('current/invitations')
  invite(
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspaceService.inviteMember(workspaceId, userId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('current/members/:id')
  removeMember(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') memberId: string,
  ) {
    return this.workspaceService.removeMember(workspaceId, memberId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('current/members/:id')
  updateMember(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.workspaceService.updateMemberRole(workspaceId, memberId, dto.role);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('current/api-keys')
  createApiKey(
    @CurrentUser('workspaceId') workspaceId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.workspaceService.createApiKey(workspaceId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('current/api-keys')
  listApiKeys(@CurrentUser('workspaceId') workspaceId: string) {
    return this.workspaceService.listApiKeys(workspaceId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('current/api-keys/:id')
  deleteApiKey(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') keyId: string,
  ) {
    return this.workspaceService.deleteApiKey(workspaceId, keyId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('current/api-keys/:id')
  updateApiKey(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') keyId: string,
    @Body() dto: Partial<CreateApiKeyDto>,
  ) {
    return this.workspaceService.updateApiKey(workspaceId, keyId, dto);
  }
}
```

- [ ] **Step 4: Create WorkspaceModule and register in AppModule**

```typescript
// megvax-api/src/workspace/workspace.module.ts
import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

@Module({
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
```

Add `WorkspaceModule` to AppModule imports.

- [ ] **Step 5: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/workspace/ megvax-api/src/app.module.ts
git commit -m "feat: add workspace module with members, invitations, API key management"
```

---

## Task 7: Meta Connection Module + Encryption Service

**Files:**
- Create: `megvax-api/src/meta/meta.module.ts`
- Create: `megvax-api/src/meta/meta.controller.ts`
- Create: `megvax-api/src/meta/meta.service.ts`
- Create: `megvax-api/src/meta/meta-api.client.ts`
- Create: `megvax-api/src/meta/encryption.service.ts`
- Create: `megvax-api/src/meta/dto/connect-account.dto.ts`

**Spec reference:** Meta Connection Module (lines 493–536)

- [ ] **Step 1: Create EncryptionService (AES-256-GCM)**

```typescript
// megvax-api/src/meta/encryption.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(private config: ConfigService) {
    const hex = this.config.getOrThrow<string>('ENCRYPTION_KEY');
    this.key = Buffer.from(hex, 'hex');
    if (this.key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
    }
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // Format: base64(iv:tag:ciphertext)
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  decrypt(encoded: string): string {
    const buf = Buffer.from(encoded, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(ciphertext) + decipher.final('utf8');
  }
}
```

- [ ] **Step 2: Create MetaApiClient (wrapper for Meta Marketing API)**

```typescript
// megvax-api/src/meta/meta-api.client.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const META_API_BASE = 'https://graph.facebook.com/v25.0';

@Injectable()
export class MetaApiClient {
  private readonly logger = new Logger(MetaApiClient.name);
  private appId: string;
  private appSecret: string;

  constructor(private config: ConfigService) {
    this.appId = this.config.getOrThrow('META_APP_ID');
    this.appSecret = this.config.getOrThrow('META_APP_SECRET');
  }

  getOAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      scope: 'ads_management,ads_read,business_management',
      response_type: 'code',
      state,
    });
    return `https://www.facebook.com/v25.0/dialog/oauth?${params}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<{ accessToken: string; expiresIn: number }> {
    const params = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: redirectUri,
      code,
    });

    const res = await fetch(`${META_API_BASE}/oauth/access_token?${params}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Meta OAuth error: ${JSON.stringify(err)}`);
    }
    const data = await res.json();
    return { accessToken: data.access_token, expiresIn: data.expires_in };
  }

  async getMe(accessToken: string): Promise<{ id: string; name: string }> {
    const res = await fetch(`${META_API_BASE}/me?access_token=${accessToken}`);
    if (!res.ok) throw new Error('Failed to get Meta user info');
    return res.json();
  }

  async getAdAccounts(accessToken: string): Promise<any[]> {
    const res = await fetch(
      `${META_API_BASE}/me/adaccounts?fields=id,name,currency,timezone_name,account_status&access_token=${accessToken}`,
    );
    if (!res.ok) throw new Error('Failed to fetch ad accounts');
    const data = await res.json();
    return data.data || [];
  }

  async getCampaigns(accountId: string, accessToken: string): Promise<any[]> {
    const fields = 'id,name,status,objective,buying_type,daily_budget,lifetime_budget,bid_strategy,special_ad_categories,start_time,stop_time,updated_time';
    const res = await fetch(
      `${META_API_BASE}/act_${accountId}/campaigns?fields=${fields}&limit=500&access_token=${accessToken}`,
    );
    if (!res.ok) throw new Error(`Failed to fetch campaigns for account ${accountId}`);
    const data = await res.json();
    return data.data || [];
  }

  async getAdSets(accountId: string, accessToken: string): Promise<any[]> {
    const fields = 'id,name,status,campaign_id,targeting,daily_budget,lifetime_budget,bid_amount,optimization_goal,billing_event,start_time,end_time,updated_time';
    const res = await fetch(
      `${META_API_BASE}/act_${accountId}/adsets?fields=${fields}&limit=500&access_token=${accessToken}`,
    );
    if (!res.ok) throw new Error(`Failed to fetch adsets for account ${accountId}`);
    const data = await res.json();
    return data.data || [];
  }

  async getAds(accountId: string, accessToken: string): Promise<any[]> {
    const fields = 'id,name,status,adset_id,creative,preview_shareable_link,updated_time';
    const res = await fetch(
      `${META_API_BASE}/act_${accountId}/ads?fields=${fields}&limit=500&access_token=${accessToken}`,
    );
    if (!res.ok) throw new Error(`Failed to fetch ads for account ${accountId}`);
    const data = await res.json();
    return data.data || [];
  }

  async getInsights(accountId: string, accessToken: string, dateFrom: string, dateTo: string, level: string = 'campaign'): Promise<any[]> {
    const fields = 'campaign_id,adset_id,ad_id,spend,impressions,reach,clicks,conversions,actions,cost_per_action_type,ctr,cpm,cpc,frequency';
    const res = await fetch(
      `${META_API_BASE}/act_${accountId}/insights?fields=${fields}&level=${level}&time_range={"since":"${dateFrom}","until":"${dateTo}"}&time_increment=1&limit=500&access_token=${accessToken}`,
    );
    if (!res.ok) throw new Error(`Failed to fetch insights for account ${accountId}`);
    const data = await res.json();
    return data.data || [];
  }
}
```

- [ ] **Step 3: Create MetaService**

```typescript
// megvax-api/src/meta/meta.service.ts
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
    // Sign state with HMAC to prevent forgery
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

    // Verify HMAC signature
    const expected = crypto.createHmac('sha256', this.config.getOrThrow('ENCRYPTION_KEY'))
      .update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      throw new BadRequestException('Invalid OAuth state');
    }

    const { workspaceId, ts } = JSON.parse(payload);
    // Reject states older than 10 minutes
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
    // Find which connection owns this account
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
```

- [ ] **Step 4: Create MetaController**

```typescript
// megvax-api/src/meta/meta.controller.ts
import { Controller, Get, Post, Delete, Query, Param, Body } from '@nestjs/common';
import { MetaService } from './meta.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';

@Auth()
@Controller('meta')
export class MetaController {
  constructor(private metaService: MetaService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('auth-url')
  getAuthUrl(@CurrentUser('workspaceId') workspaceId: string) {
    return this.metaService.getAuthUrl(workspaceId);
  }

  @Post('callback')
  handleCallback(@Query('code') code: string, @Query('state') state: string) {
    return this.metaService.handleCallback(code, state);
  }

  @Get('connections')
  getConnections(@CurrentUser('workspaceId') workspaceId: string) {
    return this.metaService.getConnections(workspaceId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('connections/:id')
  deleteConnection(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') connectionId: string,
  ) {
    return this.metaService.deleteConnection(workspaceId, connectionId);
  }

  @Get('ad-accounts')
  getAdAccounts(@CurrentUser('workspaceId') workspaceId: string) {
    return this.metaService.getAvailableAdAccounts(workspaceId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('ad-accounts/:metaAccountId/connect')
  connectAdAccount(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('metaAccountId') metaAccountId: string,
  ) {
    return this.metaService.connectAdAccount(workspaceId, metaAccountId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('ad-accounts/:id/disconnect')
  disconnectAdAccount(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') accountId: string,
  ) {
    return this.metaService.disconnectAdAccount(workspaceId, accountId);
  }
}
```

- [ ] **Step 5: Create MetaModule and register in AppModule**

```typescript
// megvax-api/src/meta/meta.module.ts
import { Module } from '@nestjs/common';
import { MetaController } from './meta.controller';
import { MetaService } from './meta.service';
import { MetaApiClient } from './meta-api.client';
import { EncryptionService } from './encryption.service';

@Module({
  controllers: [MetaController],
  providers: [MetaService, MetaApiClient, EncryptionService],
  exports: [MetaService, MetaApiClient, EncryptionService],
})
export class MetaModule {}
```

Add `MetaModule` to AppModule imports.

- [ ] **Step 6: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/meta/ megvax-api/src/app.module.ts
git commit -m "feat: add Meta connection module with OAuth, AES-256-GCM encryption, ad account management"
```

---

## Task 8: Meta Sync Worker (BullMQ)

**Files:**
- Create: `megvax-api/src/meta/meta-sync.processor.ts`
- Modify: `megvax-api/src/meta/meta.module.ts` — register BullMQ queue
- Modify: `megvax-api/src/app.module.ts` — add BullModule.forRoot

**Spec reference:** Meta-sync worker section (lines 508–536)

- [ ] **Step 1: Add BullModule.forRoot to AppModule**

```typescript
// In megvax-api/src/app.module.ts, add:
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      name: 'auth',
      ttl: 900000, // 15 minutes
      limit: 5,
    }, {
      name: 'default',
      ttl: 60000, // 1 minute
      limit: 100,
    }]),
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.getOrThrow('REDIS_URL'),
          maxRetriesPerRequest: null,
          tls: {}, // Required for Upstash rediss:// URLs
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    RedisModule,
    EmailModule,
    AuthModule,
    WorkspaceModule,
    MetaModule,
    HealthModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 2: Register meta-sync queue in MetaModule**

```typescript
// Update megvax-api/src/meta/meta.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MetaController } from './meta.controller';
import { MetaService } from './meta.service';
import { MetaApiClient } from './meta-api.client';
import { EncryptionService } from './encryption.service';
import { MetaSyncProcessor } from './meta-sync.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'meta-sync' }),
  ],
  controllers: [MetaController],
  providers: [MetaService, MetaApiClient, EncryptionService, MetaSyncProcessor],
  exports: [MetaService, MetaApiClient, EncryptionService],
})
export class MetaModule {}
```

- [ ] **Step 3: Create MetaSyncProcessor**

```typescript
// megvax-api/src/meta/meta-sync.processor.ts
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetaApiClient } from './meta-api.client';
import { EncryptionService } from './encryption.service';
import { RedisService } from '../redis/redis.service';

interface SyncJobData {
  adAccountId: string;
  workspaceId: string;
}

@Processor('meta-sync', {
  concurrency: 10,
  limiter: { max: 20, duration: 60000 },
})
export class MetaSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(MetaSyncProcessor.name);

  constructor(
    private prisma: PrismaService,
    private metaApi: MetaApiClient,
    private encryption: EncryptionService,
    private redis: RedisService,
  ) {
    super();
  }

  async process(job: Job<SyncJobData>): Promise<any> {
    const { adAccountId } = job.data;
    const lockKey = `meta-sync:lock:${adAccountId}`;

    // Acquire lock
    const locked = await this.redis.acquireLock(lockKey, 900); // 15min TTL
    if (!locked) {
      this.logger.warn(`Skipping sync for ${adAccountId} — lock held`);
      return { skipped: true };
    }

    try {
      const account = await this.prisma.adAccount.findUniqueOrThrow({
        where: { id: adAccountId },
        include: { metaConnection: true },
      });

      const accessToken = this.encryption.decrypt(account.metaConnection.accessToken);
      const metaAccountId = account.metaAccountId;

      await job.updateProgress(10);

      // 1. Sync campaigns
      const campaigns = await this.metaApi.getCampaigns(metaAccountId, accessToken);
      for (const c of campaigns) {
        await this.prisma.campaign.upsert({
          where: {
            adAccountId_metaCampaignId: { adAccountId, metaCampaignId: c.id },
          },
          update: {
            name: c.name,
            status: this.mapStatus(c.status),
            objective: c.objective,
            buyingType: c.buying_type,
            dailyBudget: c.daily_budget ? Number(c.daily_budget) / 100 : null,
            lifetimeBudget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : null,
            bidStrategy: c.bid_strategy,
            metaRaw: c,
            lastSyncAt: new Date(),
          },
          create: {
            adAccountId,
            metaCampaignId: c.id,
            name: c.name,
            status: this.mapStatus(c.status),
            objective: c.objective,
            buyingType: c.buying_type,
            dailyBudget: c.daily_budget ? Number(c.daily_budget) / 100 : null,
            lifetimeBudget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : null,
            bidStrategy: c.bid_strategy,
            metaRaw: c,
            lastSyncAt: new Date(),
          },
        });
      }
      await job.updateProgress(40);

      // 2. Sync ad sets
      const adSets = await this.metaApi.getAdSets(metaAccountId, accessToken);
      for (const adSetData of adSets) {
        const campaign = await this.prisma.campaign.findFirst({
          where: { adAccountId, metaCampaignId: adSetData.campaign_id },
        });
        if (!campaign) continue;

        await this.upsertAdSet(adAccountId, campaign.id, adSetData);
      }
      await job.updateProgress(60);

      // 3. Sync ads
      const ads = await this.metaApi.getAds(metaAccountId, accessToken);
      for (const ad of ads) {
        const adSet = await this.prisma.adSet.findFirst({
          where: { adAccountId, metaAdSetId: ad.adset_id },
        });
        if (!adSet) continue;

        await this.upsertAd(adAccountId, adSet.id, ad);
      }
      await job.updateProgress(80);

      // 4. Sync insights (last 3 days)
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const dateFrom = threeDaysAgo.toISOString().split('T')[0];
      const dateTo = today.toISOString().split('T')[0];

      for (const level of ['campaign', 'adset', 'ad'] as const) {
        const insights = await this.metaApi.getInsights(metaAccountId, accessToken, dateFrom, dateTo, level);
        for (const row of insights) {
          await this.upsertInsight(adAccountId, row, level);
        }
      }

      // 5. Update lastSyncAt
      await this.prisma.adAccount.update({
        where: { id: adAccountId },
        data: { lastSyncAt: new Date(), lastSyncError: null },
      });

      await job.updateProgress(100);
      this.logger.log(`Sync complete for account ${metaAccountId}: ${campaigns.length} campaigns, ${adSets.length} adsets, ${ads.length} ads`);

      return { campaigns: campaigns.length, adSets: adSets.length, ads: ads.length };
    } catch (error) {
      this.logger.error(`Sync failed for ${adAccountId}: ${error.message}`);
      await this.prisma.adAccount.update({
        where: { id: adAccountId },
        data: { lastSyncError: error.message },
      });
      throw error;
    } finally {
      await this.redis.releaseLock(lockKey);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Meta sync job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`);
  }

  private mapStatus(metaStatus: string): 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' {
    const map: Record<string, any> = {
      ACTIVE: 'ACTIVE',
      PAUSED: 'PAUSED',
      DELETED: 'DELETED',
      ARCHIVED: 'ARCHIVED',
    };
    return map[metaStatus] || 'PAUSED';
  }

  private async upsertAdSet(adAccountId: string, campaignId: string, adSetData: any) {
    const existing = await this.prisma.adSet.findFirst({
      where: { adAccountId, metaAdSetId: adSetData.id },
    });

    const data = {
      name: adSetData.name,
      status: this.mapStatus(adSetData.status),
      targeting: adSetData.targeting,
      dailyBudget: adSetData.daily_budget ? Number(adSetData.daily_budget) / 100 : null,
      lifetimeBudget: adSetData.lifetime_budget ? Number(adSetData.lifetime_budget) / 100 : null,
      bidAmount: adSetData.bid_amount ? Number(adSetData.bid_amount) / 100 : null,
      optimizationGoal: adSetData.optimization_goal,
      billingEvent: adSetData.billing_event,
      metaRaw: adSetData,
      lastSyncAt: new Date(),
    };

    if (existing) {
      if (existing.syncStatus === 'SYNCED') {
        await this.prisma.adSet.update({ where: { id: existing.id }, data });
      }
    } else {
      await this.prisma.adSet.create({
        data: { ...data, adAccountId, campaignId, metaAdSetId: adSetData.id },
      });
    }
  }

  private async upsertAd(adAccountId: string, adSetId: string, ad: any) {
    const existing = await this.prisma.ad.findFirst({
      where: { adAccountId, metaAdId: ad.id },
    });

    const data = {
      name: ad.name,
      status: this.mapStatus(ad.status),
      creativeSpec: ad.creative,
      previewUrl: ad.preview_shareable_link,
      metaRaw: ad,
      lastSyncAt: new Date(),
    };

    if (existing) {
      if (existing.syncStatus === 'SYNCED') {
        await this.prisma.ad.update({ where: { id: existing.id }, data });
      }
    } else {
      await this.prisma.ad.create({
        data: { ...data, adAccountId, adSetId, metaAdId: ad.id },
      });
    }
  }

  private async upsertInsight(adAccountId: string, row: any, level: string) {
    const entityTypeMap: Record<string, string> = {
      campaign: 'CAMPAIGN',
      adset: 'ADSET',
      ad: 'AD',
    };
    const entityIdFieldMap: Record<string, string> = {
      campaign: 'campaign_id',
      adset: 'adset_id',
      ad: 'ad_id',
    };

    const metaEntityId = row[entityIdFieldMap[level]];
    if (!metaEntityId) return;

    // Look up local entity
    let entityId: string | null = null;
    if (level === 'campaign') {
      const entity = await this.prisma.campaign.findFirst({ where: { metaCampaignId: metaEntityId } });
      entityId = entity?.id ?? null;
    } else if (level === 'adset') {
      const entity = await this.prisma.adSet.findFirst({ where: { metaAdSetId: metaEntityId } });
      entityId = entity?.id ?? null;
    } else {
      const entity = await this.prisma.ad.findFirst({ where: { metaAdId: metaEntityId } });
      entityId = entity?.id ?? null;
    }
    if (!entityId) return;

    const date = new Date(row.date_start);
    const conversions = row.actions?.find((a: any) => a.action_type === 'offsite_conversion')?.value || 0;
    const revenue = row.actions?.find((a: any) => a.action_type === 'purchase')?.value || 0;

    await this.prisma.insightSnapshot.upsert({
      where: {
        adAccountId_entityType_entityId_date: {
          adAccountId,
          entityType: entityTypeMap[level] as any,
          entityId,
          date,
        },
      },
      update: {
        spend: Number(row.spend || 0),
        impressions: Number(row.impressions || 0),
        reach: Number(row.reach || 0),
        clicks: Number(row.clicks || 0),
        conversions: Number(conversions),
        revenue: Number(revenue),
        ctr: Number(row.ctr || 0),
        cpm: Number(row.cpm || 0),
        cpc: Number(row.cpc || 0),
        frequency: Number(row.frequency || 0),
      },
      create: {
        adAccountId,
        entityType: entityTypeMap[level] as any,
        entityId,
        date,
        spend: Number(row.spend || 0),
        impressions: Number(row.impressions || 0),
        reach: Number(row.reach || 0),
        clicks: Number(row.clicks || 0),
        conversions: Number(conversions),
        revenue: Number(revenue),
        ctr: Number(row.ctr || 0),
        cpm: Number(row.cpm || 0),
        cpc: Number(row.cpc || 0),
        frequency: Number(row.frequency || 0),
      },
    });
  }
}
```

- [ ] **Step 4: Add a sync trigger endpoint to MetaController**

Add to `meta.controller.ts`:
```typescript
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Post('ad-accounts/:id/sync')
async triggerSync(
  @CurrentUser('workspaceId') workspaceId: string,
  @Param('id') accountId: string,
) {
  return this.metaService.triggerSync(workspaceId, accountId);
}
```

Add to `meta.service.ts`:
```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

// In constructor:
@InjectQueue('meta-sync') private syncQueue: Queue,

async triggerSync(workspaceId: string, accountId: string) {
  const account = await this.prisma.adAccount.findUniqueOrThrow({ where: { id: accountId } });
  if (account.workspaceId !== workspaceId) throw new NotFoundException();

  await this.syncQueue.add('sync', { adAccountId: accountId, workspaceId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 },
  });

  return { message: 'Sync job queued' };
}
```

- [ ] **Step 5: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/meta/ megvax-api/src/app.module.ts
git commit -m "feat: add Meta sync worker with BullMQ — campaigns, adsets, ads, insights"
```

---

## Task 9: Campaigns Module (Read-Only)

**Files:**
- Create: `megvax-api/src/campaigns/campaigns.module.ts`
- Create: `megvax-api/src/campaigns/campaigns.controller.ts`
- Create: `megvax-api/src/campaigns/campaigns.service.ts`
- Create: `megvax-api/src/campaigns/dto/campaign-query.dto.ts`

- [ ] **Step 1: Create campaign query DTO**

```typescript
// megvax-api/src/campaigns/dto/campaign-query.dto.ts
import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CampaignQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['name', 'spend', 'status', 'createdAt', 'updatedAt'])
  sort?: string;
}

export class AdSetQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class AdQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  adsetId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class TreeQueryDto {
  @IsString()
  accountId: string;
}
```

- [ ] **Step 2: Create CampaignsService**

```typescript
// megvax-api/src/campaigns/campaigns.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignQueryDto, AdSetQueryDto, AdQueryDto } from './dto/campaign-query.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async getCampaigns(workspaceId: string, query: CampaignQueryDto): Promise<PaginatedResponse<any>> {
    const limit = query.limit || 25;
    const where: any = {
      adAccount: { workspaceId },
      deletedAt: null,
    };
    if (query.accountId) where.adAccountId = query.accountId;
    if (query.status) where.status = query.status;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const items = await this.prisma.campaign.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: { [query.sort || 'updatedAt']: 'desc' },
      include: {
        _count: { select: { adSets: true } },
        adAccount: { select: { name: true, currency: true } },
      },
    });

    const hasMore = items.length > limit;
    const data = items.slice(0, limit);

    return {
      data,
      cursor: data.length > 0 ? data[data.length - 1].id : null,
      hasMore,
    };
  }

  async getCampaignById(workspaceId: string, id: string) {
    const campaign = await this.prisma.campaign.findUniqueOrThrow({
      where: { id },
      include: {
        adAccount: { select: { workspaceId: true, name: true, currency: true } },
        adSets: { where: { deletedAt: null }, include: { _count: { select: { ads: true } } } },
      },
    });
    if (campaign.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    return campaign;
  }

  async getTree(workspaceId: string, accountId: string) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');

    return this.prisma.campaign.findMany({
      where: { adAccountId: accountId, deletedAt: null },
      take: 100,
      orderBy: { updatedAt: 'desc' },
      include: {
        adSets: {
          where: { deletedAt: null },
          include: {
            ads: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  async getAdSets(workspaceId: string, query: AdSetQueryDto): Promise<PaginatedResponse<any>> {
    const limit = query.limit || 25;
    const where: any = {
      adAccount: { workspaceId },
      deletedAt: null,
    };
    if (query.campaignId) where.campaignId = query.campaignId;
    if (query.status) where.status = query.status;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const items = await this.prisma.adSet.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { ads: true } } },
    });

    const hasMore = items.length > limit;
    const data = items.slice(0, limit);
    return { data, cursor: data.length > 0 ? data[data.length - 1].id : null, hasMore };
  }

  async getAdSetById(workspaceId: string, id: string) {
    const adSet = await this.prisma.adSet.findUniqueOrThrow({
      where: { id },
      include: {
        adAccount: { select: { workspaceId: true } },
        ads: { where: { deletedAt: null } },
        campaign: { select: { name: true, id: true } },
      },
    });
    if (adSet.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    return adSet;
  }

  async getAds(workspaceId: string, query: AdQueryDto): Promise<PaginatedResponse<any>> {
    const limit = query.limit || 25;
    const where: any = {
      adAccount: { workspaceId },
      deletedAt: null,
    };
    if (query.adsetId) where.adSetId = query.adsetId;
    if (query.status) where.status = query.status;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const items = await this.prisma.ad.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: { updatedAt: 'desc' },
    });

    const hasMore = items.length > limit;
    const data = items.slice(0, limit);
    return { data, cursor: data.length > 0 ? data[data.length - 1].id : null, hasMore };
  }

  async getAdById(workspaceId: string, id: string) {
    const ad = await this.prisma.ad.findUniqueOrThrow({
      where: { id },
      include: {
        adAccount: { select: { workspaceId: true } },
        adSet: { select: { name: true, id: true } },
      },
    });
    if (ad.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    return ad;
  }
}
```

- [ ] **Step 3: Create CampaignsController**

```typescript
// megvax-api/src/campaigns/campaigns.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CampaignQueryDto, AdSetQueryDto, AdQueryDto, TreeQueryDto } from './dto/campaign-query.dto';

@Auth()
@Controller()
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Get('campaigns')
  getCampaigns(@CurrentUser('workspaceId') wsId: string, @Query() query: CampaignQueryDto) {
    return this.campaignsService.getCampaigns(wsId, query);
  }

  @Get('campaigns/tree')
  getTree(@CurrentUser('workspaceId') wsId: string, @Query() query: TreeQueryDto) {
    return this.campaignsService.getTree(wsId, query.accountId);
  }

  @Get('campaigns/:id')
  getCampaign(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.getCampaignById(wsId, id);
  }

  @Get('adsets')
  getAdSets(@CurrentUser('workspaceId') wsId: string, @Query() query: AdSetQueryDto) {
    return this.campaignsService.getAdSets(wsId, query);
  }

  @Get('adsets/:id')
  getAdSet(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.getAdSetById(wsId, id);
  }

  @Get('ads')
  getAds(@CurrentUser('workspaceId') wsId: string, @Query() query: AdQueryDto) {
    return this.campaignsService.getAds(wsId, query);
  }

  @Get('ads/:id')
  getAd(@CurrentUser('workspaceId') wsId: string, @Param('id') id: string) {
    return this.campaignsService.getAdById(wsId, id);
  }
}
```

- [ ] **Step 4: Create CampaignsModule and register in AppModule**

```typescript
// megvax-api/src/campaigns/campaigns.module.ts
import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
```

- [ ] **Step 5: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/campaigns/ megvax-api/src/app.module.ts
git commit -m "feat: add campaigns module with read-only endpoints for campaigns, adsets, ads, tree view"
```

---

## Task 10: Insights Module

**Files:**
- Create: `megvax-api/src/insights/insights.module.ts`
- Create: `megvax-api/src/insights/insights.controller.ts`
- Create: `megvax-api/src/insights/insights.service.ts`
- Create: `megvax-api/src/insights/dto/insights-query.dto.ts`

- [ ] **Step 1: Create DTO**

```typescript
// megvax-api/src/insights/dto/insights-query.dto.ts
import { IsOptional, IsString, IsIn, IsDateString, IsInt, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class InsightsQueryDto {
  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsIn(['ACCOUNT', 'CAMPAIGN', 'ADSET', 'AD'])
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  granularity?: string = 'day';
}

export class TopPerformersDto {
  @IsString()
  accountId: string;

  @IsOptional()
  @IsIn(['spend', 'impressions', 'clicks', 'conversions', 'roas', 'ctr'])
  metric?: string = 'roas';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class CompareDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class AccountSummaryDto {
  @IsString()
  accountId: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
```

- [ ] **Step 2: Create InsightsService**

```typescript
// megvax-api/src/insights/insights.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { InsightsQueryDto, TopPerformersDto, AccountSummaryDto } from './dto/insights-query.dto';

@Injectable()
export class InsightsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getInsights(workspaceId: string, query: InsightsQueryDto) {
    const where: any = {
      adAccount: { workspaceId },
    };
    if (query.accountId) where.adAccountId = query.accountId;
    if (query.entityType) where.entityType = query.entityType;
    if (query.entityId) where.entityId = query.entityId;
    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    const snapshots = await this.prisma.insightSnapshot.findMany({
      where,
      orderBy: { date: 'asc' },
      take: 1000,
    });

    return { data: snapshots };
  }

  async getTopPerformers(workspaceId: string, query: TopPerformersDto) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: query.accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate by entityId, ordered by metric
    const snapshots = await this.prisma.insightSnapshot.groupBy({
      by: ['entityId', 'entityType'],
      where: {
        adAccountId: query.accountId,
        entityType: 'CAMPAIGN',
        date: { gte: thirtyDaysAgo },
      },
      _sum: {
        spend: true,
        impressions: true,
        clicks: true,
        conversions: true,
        revenue: true,
      },
      _avg: {
        roas: true,
        ctr: true,
      },
      orderBy: query.metric === 'roas' || query.metric === 'ctr'
        ? { _avg: { [query.metric!]: 'desc' } }
        : { _sum: { [query.metric!]: 'desc' } },
      take: query.limit,
    });

    return { data: snapshots };
  }

  async getAccountSummary(workspaceId: string, query: AccountSummaryDto) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: query.accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');

    const cacheKey = `insights:summary:${query.accountId}:${query.from}:${query.to}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Aggregate from CAMPAIGN-level snapshots (sync worker creates at campaign/adset/ad level, not account)
    const where: any = {
      adAccountId: query.accountId,
      entityType: 'CAMPAIGN',
    };
    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    const agg = await this.prisma.insightSnapshot.aggregate({
      where,
      _sum: {
        spend: true,
        impressions: true,
        reach: true,
        clicks: true,
        conversions: true,
        revenue: true,
      },
      _avg: {
        ctr: true,
        cpm: true,
        cpc: true,
        cpa: true,
        roas: true,
        frequency: true,
      },
    });

    const result = { data: agg };
    await this.redis.set(cacheKey, JSON.stringify(result), 900); // 15min TTL
    return result;
  }

  async compareEntities(workspaceId: string, ids: string[], from?: string, to?: string) {
    const where: any = {
      adAccount: { workspaceId },
      entityId: { in: ids },
    };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const snapshots = await this.prisma.insightSnapshot.groupBy({
      by: ['entityId'],
      where,
      _sum: { spend: true, impressions: true, clicks: true, conversions: true, revenue: true },
      _avg: { ctr: true, cpm: true, cpc: true, cpa: true, roas: true, frequency: true },
    });

    return { data: snapshots };
  }
}
```

- [ ] **Step 3: Create InsightsController**

```typescript
// megvax-api/src/insights/insights.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InsightsQueryDto, TopPerformersDto, CompareDto, AccountSummaryDto } from './dto/insights-query.dto';

@Auth()
@Controller('insights')
export class InsightsController {
  constructor(private insightsService: InsightsService) {}

  @Get()
  getInsights(@CurrentUser('workspaceId') wsId: string, @Query() query: InsightsQueryDto) {
    return this.insightsService.getInsights(wsId, query);
  }

  @Get('top-performers')
  getTopPerformers(@CurrentUser('workspaceId') wsId: string, @Query() query: TopPerformersDto) {
    return this.insightsService.getTopPerformers(wsId, query);
  }

  @Get('compare')
  compare(@CurrentUser('workspaceId') wsId: string, @Query() query: CompareDto) {
    return this.insightsService.compareEntities(wsId, query.ids, query.from, query.to);
  }

  @Get('account-summary')
  getAccountSummary(@CurrentUser('workspaceId') wsId: string, @Query() query: AccountSummaryDto) {
    return this.insightsService.getAccountSummary(wsId, query);
  }
}
```

- [ ] **Step 4: Create InsightsModule and register in AppModule**

```typescript
// megvax-api/src/insights/insights.module.ts
import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';

@Module({
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
```

- [ ] **Step 5: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/insights/ megvax-api/src/app.module.ts
git commit -m "feat: add insights module with time-series queries, top performers, account summary"
```

---

## Task 11: Notifications Module with SSE

**Files:**
- Create: `megvax-api/src/notifications/notifications.module.ts`
- Create: `megvax-api/src/notifications/notifications.controller.ts`
- Create: `megvax-api/src/notifications/notifications.service.ts`

- [ ] **Step 1: Create NotificationsService**

```typescript
// megvax-api/src/notifications/notifications.service.ts
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
```

- [ ] **Step 2: Create NotificationsController with SSE**

```typescript
// megvax-api/src/notifications/notifications.controller.ts
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
    // Auth via query param (EventSource doesn't support headers)
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

    // Subscribe to Redis pub/sub for this user
    const subscriber = new Redis(this.config.getOrThrow('REDIS_URL'));
    await subscriber.subscribe(`notifications:${userId}`);

    subscriber.on('message', (_channel: string, message: string) => {
      subject.next({ data: message, type: 'notification' } as MessageEvent);
    });

    // Heartbeat every 30s
    const heartbeat = setInterval(() => {
      subject.next({ data: '{}', type: 'ping' } as MessageEvent);
    }, 30000);

    // Cleanup on client disconnect
    const cleanup = () => {
      clearInterval(heartbeat);
      subscriber.unsubscribe();
      subscriber.quit();
      subject.complete();
    };

    // Listen for HTTP connection close (client navigates away / closes tab)
    req.on('close', cleanup);

    return subject.asObservable();
  }
}
```

- [ ] **Step 3: Create NotificationsModule and register**

```typescript
// megvax-api/src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

Add to AppModule imports.

- [ ] **Step 4: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/notifications/ megvax-api/src/app.module.ts
git commit -m "feat: add notifications module with SSE streaming via Redis pub/sub"
```

---

## Task 12: Final AppModule Assembly + Smoke Test

**Files:**
- Modify: `megvax-api/src/app.module.ts` — ensure all modules registered
- Modify: `megvax-api/src/main.ts` — add global exception filter

- [ ] **Step 1: Final AppModule**

```typescript
// megvax-api/src/app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { MetaModule } from './meta/meta.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { InsightsModule } from './insights/insights.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'auth', ttl: 900000, limit: 5 },
      { name: 'default', ttl: 60000, limit: 100 },
    ]),
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.getOrThrow('REDIS_URL'),
          maxRetriesPerRequest: null,
          tls: {}, // Required for Upstash rediss:// URLs
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    RedisModule,
    EmailModule,
    AuthModule,
    WorkspaceModule,
    MetaModule,
    CampaignsModule,
    InsightsModule,
    NotificationsModule,
    HealthModule,
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
```

- [ ] **Step 2: Add global exception filter to main.ts**

Add to `megvax-api/src/main.ts` after `app.useGlobalPipes(...)`:

```typescript
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

app.useGlobalFilters(new AllExceptionsFilter());
```

- [ ] **Step 3: Run the full app and verify health endpoint**

```bash
cd /d/MegvaxV4-main/megvax-api
npm run dev
```

```bash
curl http://localhost:4000/health
```

Expected: `{"status":"ok","checks":{"database":"ok","redis":"ok"}}`

- [ ] **Step 4: Full smoke test — register, login, get profile**

```bash
# Register
curl -s -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"smoke12345","fullName":"Smoke Test"}' | jq .

# Login
curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"smoke12345"}' | jq .

# Use accessToken from above:
# Get workspace
curl -s http://localhost:4000/workspaces/current \
  -H "Authorization: Bearer <token>" | jq .

# Get campaigns (empty, no Meta connected yet)
curl -s http://localhost:4000/campaigns \
  -H "Authorization: Bearer <token>" | jq .
```

- [ ] **Step 5: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/
git commit -m "feat: complete Phase 1 backend — auth, workspace, meta, campaigns, insights, notifications"
```

---

## Task 13: Wire Frontend to Real API

**Files:**
- Modify: `D:/MegvaxV4-main/lib/api.ts` (create)
- Modify: `D:/MegvaxV4-main/.env.local`
- Modify: key pages to use real API instead of mock data

**This task is a separate planning cycle** — the frontend integration involves modifying 15+ files in the existing Next.js app. It should be planned and executed as its own sub-plan after the backend is running and verified.

- [ ] **Step 1: Create API client utility**

```typescript
// D:/MegvaxV4-main/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // send cookies for refresh token
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(error.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}
```

- [ ] **Step 2: Create .env.local**

```bash
# D:/MegvaxV4-main/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_USE_MOCK_DATA=false
```

- [ ] **Step 3: Commit**

```bash
cd /d/MegvaxV4-main
git add lib/api.ts .env.local
git commit -m "feat: add API client utility, configure frontend to connect to backend"
```

> **Note:** Full frontend integration (replacing mock data layer across all pages) requires its own detailed plan — Task 13 only sets up the foundation. The mock→real data migration for each page should be its own sprint.

---

## Summary

| Task | Module | What It Delivers |
|------|--------|-----------------|
| 1 | Scaffold | NestJS project, Prisma, Redis, health endpoint |
| 2 | Schema | All Phase 1 database tables with seed data |
| 3 | Common | Guards, decorators, interceptors, error handling |
| 4 | Email | Resend integration for auth emails |
| 5 | Auth | Register, login, JWT RS256, refresh tokens, password reset |
| 6 | Workspace | Members, invitations, API keys |
| 7 | Meta | OAuth, AES-256-GCM encryption, ad account management |
| 8 | Sync | BullMQ worker for campaign/insight sync from Meta |
| 9 | Campaigns | Read-only endpoints for campaigns, adsets, ads, tree view |
| 10 | Insights | Time-series queries, top performers, account summary |
| 11 | Notifications | In-app notifications with SSE streaming |
| 12 | Assembly | Final wiring, smoke test |
| 13 | Frontend | API client setup (full integration deferred) |

**Total estimated endpoints:** 40+ REST endpoints across 8 modules
**Database tables:** 15 tables with full relations
**Background workers:** 1 BullMQ queue (meta-sync)

# MegVax Phase 2: Write Operations + Autopilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add campaign write operations (create, update, pause, resume, duplicate via Meta API), build the Autopilot engine (5 evaluators, 3 action tiers, scheduling), create Suggestions module, and wire the frontend pages.

**Architecture:** Extends the Phase 1 NestJS backend at `megvax-api/`. Campaign writes push to Meta API first, then persist locally. Autopilot runs as a BullMQ worker every 30min per account, evaluates 5 rule types, creates actions with tier-based execution. Suggestions are generated post-sync.

**Tech Stack:** NestJS 11, Prisma, BullMQ, Redis (Upstash), Meta Marketing API v25.0

**Spec:** `D:/MegvaxV4-main/docs/superpowers/specs/2026-03-23-megvax-platform-design.md` (sections 4, 6, 8)

**Phase 1 branch:** `feat/phase1-backend` — all Phase 1 + frontend integration commits are on this branch

---

## File Structure

```
D:/MegvaxV4-main/megvax-api/
├── prisma/
│   └── schema.prisma                                # Modify: add 4 new models
├── src/
│   ├── meta/
│   │   └── meta-api.client.ts                       # Modify: add write methods (createCampaign, updateCampaign, etc.)
│   ├── campaigns/
│   │   ├── campaigns.service.ts                     # Modify: add write methods
│   │   ├── campaigns.controller.ts                  # Modify: add POST/PATCH/DELETE endpoints
│   │   └── dto/
│   │       ├── create-campaign.dto.ts               # Create
│   │       ├── update-campaign.dto.ts               # Create
│   │       ├── create-adset.dto.ts                  # Create
│   │       ├── update-adset.dto.ts                  # Create
│   │       ├── create-ad.dto.ts                     # Create
│   │       └── update-ad.dto.ts                     # Create
│   ├── autopilot/
│   │   ├── autopilot.module.ts                      # Create
│   │   ├── autopilot.controller.ts                  # Create: config, actions, rules endpoints
│   │   ├── autopilot.service.ts                     # Create: config CRUD, action management
│   │   ├── autopilot-rules.service.ts               # Create: custom rules CRUD
│   │   ├── autopilot.processor.ts                   # Create: BullMQ worker — evaluators + action execution
│   │   ├── autopilot-scheduler.processor.ts         # Create: cron to execute SCHEDULED actions
│   │   ├── evaluators/
│   │   │   ├── base.evaluator.ts                    # Create: abstract evaluator interface
│   │   │   ├── pause-underperformer.evaluator.ts    # Create
│   │   │   ├── scale-winner.evaluator.ts            # Create
│   │   │   ├── reallocate-budget.evaluator.ts       # Create
│   │   │   ├── frequency-cap.evaluator.ts           # Create
│   │   │   └── schedule-optimize.evaluator.ts       # Create
│   │   └── dto/
│   │       ├── update-config.dto.ts                 # Create
│   │       ├── action-query.dto.ts                  # Create
│   │       ├── create-rule.dto.ts                   # Create
│   │       └── update-rule.dto.ts                   # Create
│   ├── suggestions/
│   │   ├── suggestions.module.ts                    # Create
│   │   ├── suggestions.controller.ts                # Create
│   │   ├── suggestions.service.ts                   # Create: generation logic + apply/dismiss
│   │   └── dto/
│   │       └── suggestion-query.dto.ts              # Create
│   └── app.module.ts                                # Modify: register new modules
```

---

## Task 1: Add Prisma Models (AutopilotConfig, AutopilotAction, AutomationRule, Suggestion)

**Files:**
- Modify: `megvax-api/prisma/schema.prisma`

- [ ] **Step 1: Add the 4 new models and enums to the Prisma schema**

Add after the `Notification` model (before the closing of the file):

```prisma
// ─── Autopilot ────────────────────────────────────────

model AutopilotConfig {
  id                     String     @id @default(uuid()) @db.Uuid
  adAccountId            String     @unique @db.Uuid
  actionTiers            Json       // { PAUSE_UNDERPERFORMER: 'AUTO', SCALE_WINNER: 'SUGGEST_ACT', ... }
  suggestActDelayMinutes Int        @default(60)
  budgetChangeMaxPercent Int        @default(30)
  minSpendBeforeAction   Decimal    @default(10) @db.Decimal(12, 4)
  pauseThresholds        Json       // { cpa_max: 100, roas_min: 0.5, frequency_max: 5 }
  scaleThresholds        Json       // { roas_min: 2.0, conversions_min: 10 }
  updatedAt              DateTime   @updatedAt

  adAccount AdAccount @relation(fields: [adAccountId], references: [id], onDelete: Cascade)
}

enum ActionTier {
  AUTO
  SUGGEST_ACT
  SUGGEST_WAIT
}

enum RuleType {
  PAUSE_UNDERPERFORMER
  SCALE_WINNER
  REALLOCATE_BUDGET
  FREQUENCY_CAP
  SCHEDULE_OPTIMIZE
  CUSTOM_RULE
}

enum ActionStatus {
  PENDING
  SCHEDULED
  EXECUTED
  CANCELLED
  FAILED
}

model AutopilotAction {
  id              String       @id @default(uuid()) @db.Uuid
  adAccountId     String       @db.Uuid
  ruleType        RuleType
  entityType      EntityType
  entityId        String       @db.Uuid
  tier            ActionTier
  description     String
  reason          Json         // { metric: 'cpa', value: 85, threshold: 50, window: '7d' }
  changes         Json         // { field: 'status', from: 'ACTIVE', to: 'PAUSED' }
  confidenceScore Decimal      @db.Decimal(4, 3) // 0.000 - 1.000
  status          ActionStatus @default(PENDING)
  scheduledFor    DateTime?
  executedAt      DateTime?
  cancelledAt     DateTime?
  cancelledById   String?      @db.Uuid
  errorMessage    String?
  createdAt       DateTime     @default(now())

  adAccount   AdAccount @relation(fields: [adAccountId], references: [id], onDelete: Cascade)
  cancelledBy User?     @relation(fields: [cancelledById], references: [id], onDelete: SetNull)

  @@index([adAccountId, status, createdAt])
  @@index([status, scheduledFor])
}

model AutomationRule {
  id              String     @id @default(uuid()) @db.Uuid
  workspaceId     String     @db.Uuid
  adAccountId     String     @db.Uuid
  name            String
  enabled         Boolean    @default(true)
  trigger         Json       // { metric, operator, threshold, window, entityScope }
  action          Json       // { type, params }
  tier            ActionTier @default(SUGGEST_WAIT)
  cooldownMinutes Int        @default(60)
  lastFiredAt     DateTime?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  adAccount AdAccount @relation(fields: [adAccountId], references: [id], onDelete: Cascade)

  @@index([adAccountId, enabled])
}

// ─── Suggestions ──────────────────────────────────────

enum SuggestionType {
  BUDGET
  AUDIENCE
  CREATIVE
  BID
  HEALTH
  SCALING
}

enum SuggestionStatus {
  PENDING
  APPLIED
  DISMISSED
}

model Suggestion {
  id             String           @id @default(uuid()) @db.Uuid
  adAccountId    String           @db.Uuid
  entityType     EntityType
  entityId       String           @db.Uuid
  type           SuggestionType
  title          String
  description    String
  impact         Json             // { metric: 'roas', estimatedChange: '+15%', confidence: 0.7 }
  action         Json             // { type: 'patch_campaign', params: { dailyBudget: 500 } }
  status         SuggestionStatus @default(PENDING)
  appliedAt      DateTime?
  dismissedAt    DateTime?
  dismissReason  String?
  createdAt      DateTime         @default(now())

  adAccount AdAccount @relation(fields: [adAccountId], references: [id], onDelete: Cascade)

  @@index([adAccountId, status, createdAt])
}
```

- [ ] **Step 2: Add relations to existing models**

In the `AdAccount` model, add:
```prisma
  autopilotConfig  AutopilotConfig?
  autopilotActions AutopilotAction[]
  automationRules  AutomationRule[]
  suggestions      Suggestion[]
```

In the `User` model, add:
```prisma
  cancelledActions AutopilotAction[]
```

In the `Workspace` model, add:
```prisma
  automationRules AutomationRule[]
```

- [ ] **Step 3: Generate Prisma client and push schema to database**

```bash
cd /d/MegvaxV4-main/megvax-api && npx prisma generate && npx prisma db push
```

Note: `prisma db push` creates the new tables without a migration file (suitable for development). For production, use `prisma migrate dev --name add-autopilot-suggestions` instead.

- [ ] **Step 4: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/prisma/schema.prisma
git commit -m "feat: add Prisma models for AutopilotConfig, AutopilotAction, AutomationRule, Suggestion"
```

---

## Task 2: Add Meta API Write Methods

**Files:**
- Modify: `megvax-api/src/meta/meta-api.client.ts`

- [ ] **Step 1: Add campaign/adset/ad write methods to MetaApiClient**

```typescript
// Add these methods to the MetaApiClient class:

// Helper: Meta API uses form-encoded POST for write operations
private async metaPost(url: string, accessToken: string, params: Record<string, any>): Promise<any> {
  const body = new URLSearchParams();
  body.set('access_token', accessToken);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      body.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Meta API error: ${JSON.stringify(err.error || err)}`);
  }
  return res.json();
}

async createCampaign(accountId: string, accessToken: string, params: {
  name: string;
  objective: string;
  status?: string;
  special_ad_categories?: string[];
  daily_budget?: number;
  lifetime_budget?: number;
  bid_strategy?: string;
}): Promise<{ id: string }> {
  return this.metaPost(`${META_API_BASE}/act_${accountId}/campaigns`, accessToken, params);
}

async updateCampaign(campaignId: string, accessToken: string, params: Record<string, any>): Promise<{ success: boolean }> {
  return this.metaPost(`${META_API_BASE}/${campaignId}`, accessToken, params);
}

async createAdSet(accountId: string, accessToken: string, params: {
  name: string;
  campaign_id: string;
  status?: string;
  targeting?: any;
  daily_budget?: number;
  lifetime_budget?: number;
  bid_amount?: number;
  optimization_goal?: string;
  billing_event?: string;
  start_time?: string;
  end_time?: string;
}): Promise<{ id: string }> {
  return this.metaPost(`${META_API_BASE}/act_${accountId}/adsets`, accessToken, params);
}

async updateAdSet(adsetId: string, accessToken: string, params: Record<string, any>): Promise<{ success: boolean }> {
  return this.metaPost(`${META_API_BASE}/${adsetId}`, accessToken, params);
}

async createAd(accountId: string, accessToken: string, params: {
  name: string;
  adset_id: string;
  status?: string;
  creative?: any;
}): Promise<{ id: string }> {
  return this.metaPost(`${META_API_BASE}/act_${accountId}/ads`, accessToken, params);
}

async updateAd(adId: string, accessToken: string, params: Record<string, any>): Promise<{ success: boolean }> {
  return this.metaPost(`${META_API_BASE}/${adId}`, accessToken, params);
}

async deleteEntity(entityId: string, accessToken: string): Promise<{ success: boolean }> {
  return this.metaPost(`${META_API_BASE}/${entityId}`, accessToken, { status: 'DELETED' });
}
```

- [ ] **Step 2: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/meta/meta-api.client.ts
git commit -m "feat: add Meta API write methods — create/update/delete campaigns, adsets, ads"
```

---

## Task 3: Campaign Write Operations (DTOs + Service + Controller)

**Files:**
- Create: `megvax-api/src/campaigns/dto/create-campaign.dto.ts`
- Create: `megvax-api/src/campaigns/dto/update-campaign.dto.ts`
- Create: `megvax-api/src/campaigns/dto/create-adset.dto.ts`
- Create: `megvax-api/src/campaigns/dto/update-adset.dto.ts`
- Create: `megvax-api/src/campaigns/dto/create-ad.dto.ts`
- Create: `megvax-api/src/campaigns/dto/update-ad.dto.ts`
- Modify: `megvax-api/src/campaigns/campaigns.service.ts`
- Modify: `megvax-api/src/campaigns/campaigns.controller.ts`
- Modify: `megvax-api/src/campaigns/campaigns.module.ts`

- [ ] **Step 1: Create DTOs**

`create-campaign.dto.ts`:
```typescript
import { IsString, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  accountId: string;

  @IsString()
  name: string;

  @IsString()
  objective: string;

  @IsOptional() @IsString()
  buyingType?: string;

  @IsOptional() @IsString()
  budgetType?: string;

  @IsOptional() @IsNumber()
  dailyBudget?: number;

  @IsOptional() @IsNumber()
  lifetimeBudget?: number;

  @IsOptional() @IsString()
  bidStrategy?: string;

  @IsOptional() @IsArray()
  specialAdCategories?: string[];

  @IsOptional() @IsString()
  startTime?: string;

  @IsOptional() @IsString()
  endTime?: string;
}
```

`update-campaign.dto.ts`:
```typescript
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class UpdateCampaignDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsNumber()
  dailyBudget?: number;

  @IsOptional() @IsNumber()
  lifetimeBudget?: number;

  @IsOptional() @IsString()
  bidStrategy?: string;

  @IsOptional() @IsString()
  startTime?: string;

  @IsOptional() @IsString()
  endTime?: string;
}
```

`create-adset.dto.ts`:
```typescript
import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateAdSetDto {
  @IsString()
  accountId: string;

  @IsString()
  campaignId: string;

  @IsString()
  name: string;

  @IsOptional() @IsObject()
  targeting?: any;

  @IsOptional() @IsObject()
  placements?: any;

  @IsOptional() @IsNumber()
  dailyBudget?: number;

  @IsOptional() @IsNumber()
  lifetimeBudget?: number;

  @IsOptional() @IsNumber()
  bidAmount?: number;

  @IsOptional() @IsString()
  optimizationGoal?: string;

  @IsOptional() @IsString()
  billingEvent?: string;

  @IsOptional() @IsString()
  startTime?: string;

  @IsOptional() @IsString()
  endTime?: string;
}
```

`update-adset.dto.ts`:
```typescript
import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class UpdateAdSetDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsObject()
  targeting?: any;

  @IsOptional() @IsNumber()
  dailyBudget?: number;

  @IsOptional() @IsNumber()
  lifetimeBudget?: number;

  @IsOptional() @IsNumber()
  bidAmount?: number;

  @IsOptional() @IsString()
  optimizationGoal?: string;

  @IsOptional() @IsString()
  billingEvent?: string;
}
```

`create-ad.dto.ts`:
```typescript
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateAdDto {
  @IsString()
  accountId: string;

  @IsString()
  adsetId: string;

  @IsString()
  name: string;

  @IsOptional() @IsObject()
  creativeSpec?: any;
}
```

`update-ad.dto.ts`:
```typescript
import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateAdDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsObject()
  creativeSpec?: any;
}
```

- [ ] **Step 2: Add write methods to CampaignsService**

Add these methods to `campaigns.service.ts`. The service needs to inject `MetaApiClient` and `EncryptionService` to push changes to Meta.

```typescript
// Inject in constructor:
constructor(
  private prisma: PrismaService,
  private metaApi: MetaApiClient,
  private encryption: EncryptionService,
) {}

// Helper to get decrypted access token for an ad account
private async getAccessToken(adAccountId: string): Promise<{ token: string; metaAccountId: string }> {
  const account = await this.prisma.adAccount.findUniqueOrThrow({
    where: { id: adAccountId },
    include: { metaConnection: true },
  });
  return {
    token: this.encryption.decrypt(account.metaConnection.accessToken),
    metaAccountId: account.metaAccountId,
  };
}

// Campaign write operations
async createCampaign(workspaceId: string, dto: CreateCampaignDto) {
  const account = await this.prisma.adAccount.findFirstOrThrow({
    where: { id: dto.accountId, workspaceId },
  });
  const { token, metaAccountId } = await this.getAccessToken(account.id);

  // Push to Meta first
  const metaResult = await this.metaApi.createCampaign(metaAccountId, token, {
    name: dto.name,
    objective: dto.objective,
    status: 'PAUSED', // Always create paused for safety
    daily_budget: dto.dailyBudget ? Math.round(dto.dailyBudget * 100) : undefined, // Meta uses cents
    lifetime_budget: dto.lifetimeBudget ? Math.round(dto.lifetimeBudget * 100) : undefined,
    bid_strategy: dto.bidStrategy,
    special_ad_categories: dto.specialAdCategories || [],
  });

  // Persist locally
  return this.prisma.campaign.create({
    data: {
      adAccountId: account.id,
      metaCampaignId: metaResult.id,
      name: dto.name,
      objective: dto.objective,
      buyingType: dto.buyingType,
      budgetType: dto.dailyBudget ? 'DAILY' : dto.lifetimeBudget ? 'LIFETIME' : undefined,
      dailyBudget: dto.dailyBudget,
      lifetimeBudget: dto.lifetimeBudget,
      bidStrategy: dto.bidStrategy,
      specialAdCategories: dto.specialAdCategories || [],
      startTime: dto.startTime ? new Date(dto.startTime) : undefined,
      endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      status: 'PAUSED',
      syncStatus: 'SYNCED',
    },
  });
}

async updateCampaign(workspaceId: string, campaignId: string, dto: UpdateCampaignDto) {
  const campaign = await this.prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { adAccount: true },
  });
  if (campaign.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
  if (!campaign.metaCampaignId) throw new BadRequestException('Campaign not synced to Meta');

  const { token } = await this.getAccessToken(campaign.adAccountId);
  const metaParams: Record<string, any> = {};
  if (dto.name) metaParams.name = dto.name;
  if (dto.dailyBudget !== undefined) metaParams.daily_budget = Math.round(dto.dailyBudget * 100);
  if (dto.lifetimeBudget !== undefined) metaParams.lifetime_budget = Math.round(dto.lifetimeBudget * 100);
  if (dto.bidStrategy) metaParams.bid_strategy = dto.bidStrategy;

  await this.metaApi.updateCampaign(campaign.metaCampaignId, token, metaParams);

  return this.prisma.campaign.update({
    where: { id: campaignId },
    data: {
      ...dto,
      dailyBudget: dto.dailyBudget,
      lifetimeBudget: dto.lifetimeBudget,
      localVersion: { increment: 1 },
      syncStatus: 'SYNCED',
    },
  });
}

async pauseCampaign(workspaceId: string, campaignId: string) {
  return this.updateEntityStatus(workspaceId, 'campaign', campaignId, 'PAUSED');
}

async resumeCampaign(workspaceId: string, campaignId: string) {
  return this.updateEntityStatus(workspaceId, 'campaign', campaignId, 'ACTIVE');
}

async duplicateCampaign(workspaceId: string, campaignId: string) {
  const campaign = await this.prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { adAccount: true },
  });
  if (campaign.adAccount.workspaceId !== workspaceId) throw new NotFoundException();

  const { token, metaAccountId } = await this.getAccessToken(campaign.adAccountId);
  const metaResult = await this.metaApi.createCampaign(metaAccountId, token, {
    name: `${campaign.name} (Copy)`,
    objective: campaign.objective || 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    daily_budget: campaign.dailyBudget ? Math.round(Number(campaign.dailyBudget) * 100) : undefined,
  });

  return this.prisma.campaign.create({
    data: {
      adAccountId: campaign.adAccountId,
      metaCampaignId: metaResult.id,
      name: `${campaign.name} (Copy)`,
      objective: campaign.objective,
      buyingType: campaign.buyingType,
      budgetType: campaign.budgetType,
      dailyBudget: campaign.dailyBudget,
      lifetimeBudget: campaign.lifetimeBudget,
      bidStrategy: campaign.bidStrategy,
      specialAdCategories: campaign.specialAdCategories,
      status: 'PAUSED',
      syncStatus: 'SYNCED',
    },
  });
}

async deleteCampaign(workspaceId: string, campaignId: string) {
  const campaign = await this.prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { adAccount: true },
  });
  if (campaign.adAccount.workspaceId !== workspaceId) throw new NotFoundException();

  if (campaign.metaCampaignId) {
    const { token } = await this.getAccessToken(campaign.adAccountId);
    await this.metaApi.deleteEntity(campaign.metaCampaignId, token);
  }

  return this.prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'DELETED', deletedAt: new Date() },
  });
}

// Generic status update helper (used by pause/resume for campaigns, adsets, ads)
private async updateEntityStatus(
  workspaceId: string,
  entityType: 'campaign' | 'adset' | 'ad',
  entityId: string,
  newStatus: 'ACTIVE' | 'PAUSED',
) {
  const model = entityType === 'campaign' ? this.prisma.campaign
    : entityType === 'adset' ? this.prisma.adSet
    : this.prisma.ad;

  const entity = await (model as any).findUniqueOrThrow({
    where: { id: entityId },
    include: { adAccount: true },
  });
  if (entity.adAccount.workspaceId !== workspaceId) throw new NotFoundException();

  const metaId = entity.metaCampaignId || entity.metaAdSetId || entity.metaAdId;
  if (metaId) {
    const { token } = await this.getAccessToken(entity.adAccountId);
    const updateFn = entityType === 'campaign' ? this.metaApi.updateCampaign
      : entityType === 'adset' ? this.metaApi.updateAdSet
      : this.metaApi.updateAd;
    await updateFn.call(this.metaApi, metaId, token, { status: newStatus });
  }

  return (model as any).update({
    where: { id: entityId },
    data: { status: newStatus, localVersion: { increment: 1 }, syncStatus: 'SYNCED' },
  });
}

// Similar write methods for AdSets and Ads — follow the same pattern:
// createAdSet, updateAdSet, pauseAdSet, resumeAdSet, duplicateAdSet, deleteAdSet
// createAd, updateAd, pauseAd, resumeAd, duplicateAd, deleteAd
```

The subagent should implement ALL write methods for adsets and ads following the same pattern as campaigns.

**Important: AuditLog entries.** Every write operation (create, update, pause, resume, duplicate, delete) must create an `AuditLog` entry with `source: 'USER'` (or `'AUTOPILOT'` when called from the autopilot processor). Add a helper method:

```typescript
private async logAudit(workspaceId: string, userId: string | null, action: string, entityType: string, entityId: string, changes: any, source: string = 'USER') {
  await this.prisma.auditLog.create({
    data: { workspaceId, userId, action, entityType, entityId, changes, source: source as any },
  });
}
```

Call `this.logAudit(...)` at the end of each write method.

- [ ] **Step 3: Add write endpoints to CampaignsController**

```typescript
// Add to existing controller:
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Post()
createCampaign(@CurrentUser('workspaceId') workspaceId: string, @Body() dto: CreateCampaignDto) {
  return this.campaignsService.createCampaign(workspaceId, dto);
}

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Patch(':id')
updateCampaign(@CurrentUser('workspaceId') workspaceId: string, @Param('id') id: string, @Body() dto: UpdateCampaignDto) {
  return this.campaignsService.updateCampaign(workspaceId, id, dto);
}

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Post(':id/pause')
pauseCampaign(@CurrentUser('workspaceId') workspaceId: string, @Param('id') id: string) {
  return this.campaignsService.pauseCampaign(workspaceId, id);
}

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Post(':id/resume')
resumeCampaign(@CurrentUser('workspaceId') workspaceId: string, @Param('id') id: string) {
  return this.campaignsService.resumeCampaign(workspaceId, id);
}

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Post(':id/duplicate')
duplicateCampaign(@CurrentUser('workspaceId') workspaceId: string, @Param('id') id: string) {
  return this.campaignsService.duplicateCampaign(workspaceId, id);
}

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Delete(':id')
deleteCampaign(@CurrentUser('workspaceId') workspaceId: string, @Param('id') id: string) {
  return this.campaignsService.deleteCampaign(workspaceId, id);
}

// Same pattern for /adsets/* and /ads/* endpoints
```

Add similar endpoints under `/adsets` and `/ads` prefixes. The controller needs separate route groups — either use sub-controllers or route prefixes.

- [ ] **Step 4: Update CampaignsModule to import MetaModule**

The campaigns module needs `MetaApiClient` and `EncryptionService`. Update `megvax-api/src/campaigns/campaigns.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MetaModule } from '../meta/meta.module';

@Module({
  imports: [PrismaModule, MetaModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
```

Also add the missing imports to `campaigns.controller.ts`: `Post, Patch, Delete, Body, UseGuards` from `@nestjs/common`.

- [ ] **Step 5: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/campaigns/ megvax-api/src/meta/
git commit -m "feat: add campaign/adset/ad write operations — create, update, pause, resume, duplicate, delete"
```

---

## Task 4: Autopilot Module — Config + Actions CRUD

**Files:**
- Create: `megvax-api/src/autopilot/autopilot.module.ts`
- Create: `megvax-api/src/autopilot/autopilot.service.ts`
- Create: `megvax-api/src/autopilot/autopilot.controller.ts`
- Create: `megvax-api/src/autopilot/dto/update-config.dto.ts`
- Create: `megvax-api/src/autopilot/dto/action-query.dto.ts`

- [ ] **Step 1: Create DTOs**

`update-config.dto.ts`:
```typescript
import { IsOptional, IsObject, IsInt, IsNumber, Min, Max } from 'class-validator';

export class UpdateConfigDto {
  @IsOptional() @IsObject()
  actionTiers?: Record<string, string>; // { PAUSE_UNDERPERFORMER: 'AUTO', ... }

  @IsOptional() @IsInt() @Min(5) @Max(1440)
  suggestActDelayMinutes?: number;

  @IsOptional() @IsInt() @Min(5) @Max(100)
  budgetChangeMaxPercent?: number;

  @IsOptional() @IsNumber()
  minSpendBeforeAction?: number;

  @IsOptional() @IsObject()
  pauseThresholds?: { cpa_max?: number; roas_min?: number; frequency_max?: number };

  @IsOptional() @IsObject()
  scaleThresholds?: { roas_min?: number; conversions_min?: number };
}
```

`action-query.dto.ts`:
```typescript
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class ActionQueryDto {
  @IsString()
  accountId: string;

  @IsOptional() @IsString()
  status?: string; // PENDING | SCHEDULED | EXECUTED | CANCELLED | FAILED

  @IsOptional() @IsString()
  from?: string;

  @IsOptional() @IsString()
  to?: string;

  @IsOptional() @IsString()
  cursor?: string;

  @IsOptional()
  limit?: number;
}
```

- [ ] **Step 2: Create AutopilotService**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ActionQueryDto } from './dto/action-query.dto';

@Injectable()
export class AutopilotService {
  constructor(private prisma: PrismaService) {}

  async getConfig(workspaceId: string, accountId: string) {
    await this.verifyAccountAccess(workspaceId, accountId);
    let config = await this.prisma.autopilotConfig.findUnique({
      where: { adAccountId: accountId },
    });
    if (!config) {
      // Create default config
      config = await this.prisma.autopilotConfig.create({
        data: {
          adAccountId: accountId,
          actionTiers: {
            PAUSE_UNDERPERFORMER: 'SUGGEST_ACT',
            SCALE_WINNER: 'SUGGEST_WAIT',
            REALLOCATE_BUDGET: 'SUGGEST_WAIT',
            FREQUENCY_CAP: 'AUTO',
            SCHEDULE_OPTIMIZE: 'SUGGEST_ACT',
          },
          pauseThresholds: { cpa_max: 100, roas_min: 0.5, frequency_max: 5 },
          scaleThresholds: { roas_min: 2.0, conversions_min: 10 },
        },
      });
    }
    return config;
  }

  async updateConfig(workspaceId: string, accountId: string, dto: UpdateConfigDto) {
    await this.verifyAccountAccess(workspaceId, accountId);
    return this.prisma.autopilotConfig.upsert({
      where: { adAccountId: accountId },
      update: dto,
      create: {
        adAccountId: accountId,
        actionTiers: dto.actionTiers || {},
        pauseThresholds: dto.pauseThresholds || {},
        scaleThresholds: dto.scaleThresholds || {},
        ...dto,
      },
    });
  }

  async getActions(workspaceId: string, query: ActionQueryDto) {
    await this.verifyAccountAccess(workspaceId, query.accountId);
    const limit = query.limit || 25;
    const where: any = { adAccountId: query.accountId };
    if (query.status) where.status = query.status;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const items = await this.prisma.autopilotAction.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    return { data, cursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async approveAction(workspaceId: string, actionId: string) {
    const action = await this.prisma.autopilotAction.findUniqueOrThrow({
      where: { id: actionId },
      include: { adAccount: true },
    });
    if (action.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (action.status !== 'PENDING') throw new Error('Action is not pending');

    // Mark as SCHEDULED for immediate execution
    return this.prisma.autopilotAction.update({
      where: { id: actionId },
      data: { status: 'SCHEDULED', scheduledFor: new Date() },
    });
  }

  async cancelAction(workspaceId: string, actionId: string, userId: string) {
    const action = await this.prisma.autopilotAction.findUniqueOrThrow({
      where: { id: actionId },
      include: { adAccount: true },
    });
    if (action.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (!['PENDING', 'SCHEDULED'].includes(action.status)) throw new Error('Action cannot be cancelled');

    return this.prisma.autopilotAction.update({
      where: { id: actionId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelledById: userId },
    });
  }

  async getStats(workspaceId: string, accountId: string, from?: string, to?: string) {
    await this.verifyAccountAccess(workspaceId, accountId);
    const where: any = { adAccountId: accountId };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [total, executed, cancelled, pending] = await Promise.all([
      this.prisma.autopilotAction.count({ where }),
      this.prisma.autopilotAction.count({ where: { ...where, status: 'EXECUTED' } }),
      this.prisma.autopilotAction.count({ where: { ...where, status: 'CANCELLED' } }),
      this.prisma.autopilotAction.count({ where: { ...where, status: 'PENDING' } }),
    ]);

    return { total, executed, cancelled, pending };
  }

  private async verifyAccountAccess(workspaceId: string, accountId: string) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');
  }
}
```

- [ ] **Step 3: Create AutopilotController**

```typescript
import { Controller, Get, Patch, Post, Param, Query, Body } from '@nestjs/common';
import { AutopilotService } from './autopilot.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ActionQueryDto } from './dto/action-query.dto';

@Auth()
@Controller('autopilot')
export class AutopilotController {
  constructor(private autopilotService: AutopilotService) {}

  @Get('config/:accountId')
  getConfig(@CurrentUser('workspaceId') workspaceId: string, @Param('accountId') accountId: string) {
    return this.autopilotService.getConfig(workspaceId, accountId);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('config/:accountId')
  updateConfig(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('accountId') accountId: string,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.autopilotService.updateConfig(workspaceId, accountId, dto);
  }

  @Get('actions')
  getActions(@CurrentUser('workspaceId') workspaceId: string, @Query() query: ActionQueryDto) {
    return this.autopilotService.getActions(workspaceId, query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('actions/:id/approve')
  approveAction(@CurrentUser('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.autopilotService.approveAction(workspaceId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('actions/:id/cancel')
  cancelAction(
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.autopilotService.cancelAction(workspaceId, id, userId);
  }

  @Get('stats')
  getStats(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('accountId') accountId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.autopilotService.getStats(workspaceId, accountId, from, to);
  }
}
```

- [ ] **Step 4: Create AutopilotModule**

```typescript
import { Module, forwardRef } from '@nestjs/common';
import { AutopilotController } from './autopilot.controller';
import { AutopilotService } from './autopilot.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    NotificationsModule,
    forwardRef(() => CampaignsModule), // forwardRef to avoid circular dependency
  ],
  controllers: [AutopilotController],
  providers: [AutopilotService],
  exports: [AutopilotService],
})
export class AutopilotModule {}
```

- [ ] **Step 5: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/autopilot/
git commit -m "feat: add autopilot module — config CRUD, action management, stats endpoint"
```

---

## Task 5: Autopilot Custom Rules CRUD

**Files:**
- Create: `megvax-api/src/autopilot/autopilot-rules.service.ts`
- Create: `megvax-api/src/autopilot/dto/create-rule.dto.ts`
- Create: `megvax-api/src/autopilot/dto/update-rule.dto.ts`
- Modify: `megvax-api/src/autopilot/autopilot.controller.ts`
- Modify: `megvax-api/src/autopilot/autopilot.module.ts`

- [ ] **Step 1: Create DTOs**

`create-rule.dto.ts`:
```typescript
import { IsString, IsObject, IsEnum, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  accountId: string;

  @IsString()
  name: string;

  @IsObject()
  trigger: { metric: string; operator: string; threshold: number; window: string; entityScope?: string };

  @IsObject()
  action: { type: string; params: Record<string, any> };

  @IsString()
  tier: string; // AUTO | SUGGEST_ACT | SUGGEST_WAIT

  @IsOptional() @IsInt() @Min(5)
  cooldownMinutes?: number;

  @IsOptional() @IsBoolean()
  enabled?: boolean;
}
```

`update-rule.dto.ts`:
```typescript
import { IsString, IsObject, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateRuleDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsObject()
  trigger?: any;

  @IsOptional() @IsObject()
  action?: any;

  @IsOptional() @IsString()
  tier?: string;

  @IsOptional() @IsInt() @Min(5)
  cooldownMinutes?: number;

  @IsOptional() @IsBoolean()
  enabled?: boolean;
}
```

- [ ] **Step 2: Create AutopilotRulesService**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Injectable()
export class AutopilotRulesService {
  constructor(private prisma: PrismaService) {}

  async listRules(workspaceId: string, accountId: string, cursor?: string, limit = 25) {
    const items = await this.prisma.automationRule.findMany({
      where: { workspaceId, adAccountId: accountId },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
    });
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    return { data, cursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async getRule(workspaceId: string, ruleId: string) {
    const rule = await this.prisma.automationRule.findUniqueOrThrow({ where: { id: ruleId } });
    if (rule.workspaceId !== workspaceId) throw new NotFoundException();
    return rule;
  }

  async createRule(workspaceId: string, dto: CreateRuleDto) {
    await this.verifyAccountAccess(workspaceId, dto.accountId);
    return this.prisma.automationRule.create({
      data: {
        workspaceId,
        adAccountId: dto.accountId,
        name: dto.name,
        trigger: dto.trigger,
        action: dto.action,
        tier: dto.tier as any,
        cooldownMinutes: dto.cooldownMinutes || 60,
        enabled: dto.enabled !== false,
      },
    });
  }

  async updateRule(workspaceId: string, ruleId: string, dto: UpdateRuleDto) {
    const rule = await this.prisma.automationRule.findUniqueOrThrow({ where: { id: ruleId } });
    if (rule.workspaceId !== workspaceId) throw new NotFoundException();
    return this.prisma.automationRule.update({
      where: { id: ruleId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.trigger && { trigger: dto.trigger }),
        ...(dto.action && { action: dto.action }),
        ...(dto.tier && { tier: dto.tier as any }),
        ...(dto.cooldownMinutes !== undefined && { cooldownMinutes: dto.cooldownMinutes }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
      },
    });
  }

  async deleteRule(workspaceId: string, ruleId: string) {
    const rule = await this.prisma.automationRule.findUniqueOrThrow({ where: { id: ruleId } });
    if (rule.workspaceId !== workspaceId) throw new NotFoundException();
    await this.prisma.automationRule.delete({ where: { id: ruleId } });
    return { message: 'Rule deleted' };
  }

  async testRule(workspaceId: string, ruleId: string) {
    const rule = await this.prisma.automationRule.findUniqueOrThrow({ where: { id: ruleId } });
    if (rule.workspaceId !== workspaceId) throw new NotFoundException();

    // Dry run: evaluate the rule against last 7 days of data without executing
    const trigger = rule.trigger as any;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const insights = await this.prisma.insightSnapshot.findMany({
      where: {
        adAccountId: rule.adAccountId,
        date: { gte: sevenDaysAgo },
        ...(trigger.entityScope ? { entityType: trigger.entityScope } : {}),
      },
      orderBy: { date: 'desc' },
    });

    // Group by entity and check if trigger condition would fire
    const entityMap = new Map<string, any[]>();
    for (const snap of insights) {
      const key = snap.entityId;
      if (!entityMap.has(key)) entityMap.set(key, []);
      entityMap.get(key)!.push(snap);
    }

    const hypotheticalActions: any[] = [];
    for (const [entityId, snaps] of entityMap) {
      const avg = snaps.reduce((sum, s) => sum + Number((s as any)[trigger.metric] || 0), 0) / snaps.length;
      const wouldFire = trigger.operator === '>' ? avg > trigger.threshold
        : trigger.operator === '<' ? avg < trigger.threshold
        : trigger.operator === '>=' ? avg >= trigger.threshold
        : trigger.operator === '<=' ? avg <= trigger.threshold
        : false;

      if (wouldFire) {
        hypotheticalActions.push({
          entityId,
          entityType: snaps[0].entityType,
          metricValue: avg,
          threshold: trigger.threshold,
          wouldExecute: rule.action,
        });
      }
    }

    return { ruleId, hypotheticalActions, evaluatedEntities: entityMap.size };
  }

  private async verifyAccountAccess(workspaceId: string, accountId: string) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');
  }
}
```

- [ ] **Step 3: Add rule endpoints to AutopilotController**

```typescript
// Add to existing AutopilotController:
@Get('rules')
listRules(
  @CurrentUser('workspaceId') workspaceId: string,
  @Query('accountId') accountId: string,
  @Query('cursor') cursor?: string,
  @Query('limit') limit?: number,
) {
  return this.rulesService.listRules(workspaceId, accountId, cursor, limit);
}

@Get('rules/:id')
getRule(@CurrentUser('workspaceId') workspaceId: string, @Param('id') id: string) {
  return this.rulesService.getRule(workspaceId, id);
}

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Post('rules')
createRule(@CurrentUser('workspaceId') workspaceId: string, @Body() dto: CreateRuleDto) {
  return this.rulesService.createRule(workspaceId, dto);
}

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Patch('rules/:id')
updateRule(
  @CurrentUser('workspaceId') workspaceId: string,
  @Param('id') id: string,
  @Body() dto: UpdateRuleDto,
) {
  return this.rulesService.updateRule(workspaceId, id, dto);
}

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Delete('rules/:id')
deleteRule(@CurrentUser('workspaceId') workspaceId: string, @Param('id') id: string) {
  return this.rulesService.deleteRule(workspaceId, id);
}

@Post('rules/:id/test')
testRule(@CurrentUser('workspaceId') workspaceId: string, @Param('id') id: string) {
  return this.rulesService.testRule(workspaceId, id);
}
```

- [ ] **Step 4: Update module**

Add `AutopilotRulesService` to providers and inject in controller.

- [ ] **Step 5: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/autopilot/
git commit -m "feat: add custom automation rules — CRUD, dry-run test, trigger evaluation"
```

---

## Task 6: Autopilot Evaluators

**Files:**
- Create: `megvax-api/src/autopilot/evaluators/base.evaluator.ts`
- Create: `megvax-api/src/autopilot/evaluators/pause-underperformer.evaluator.ts`
- Create: `megvax-api/src/autopilot/evaluators/scale-winner.evaluator.ts`
- Create: `megvax-api/src/autopilot/evaluators/reallocate-budget.evaluator.ts`
- Create: `megvax-api/src/autopilot/evaluators/frequency-cap.evaluator.ts`
- Create: `megvax-api/src/autopilot/evaluators/schedule-optimize.evaluator.ts`

- [ ] **Step 1: Create base evaluator interface**

```typescript
// megvax-api/src/autopilot/evaluators/base.evaluator.ts

export interface EvaluatorAction {
  ruleType: string;
  entityType: 'CAMPAIGN' | 'ADSET' | 'AD';
  entityId: string;
  description: string;
  reason: Record<string, any>;
  changes: Record<string, any>;
  confidenceScore: number;
}

export interface EvaluatorContext {
  adAccountId: string;
  config: {
    pauseThresholds: { cpa_max: number; roas_min: number; frequency_max: number };
    scaleThresholds: { roas_min: number; conversions_min: number };
    budgetChangeMaxPercent: number;
    minSpendBeforeAction: number;
  };
  insights: Array<{
    entityType: string;
    entityId: string;
    date: Date;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpa: number;
    roas: number;
    frequency: number;
    revenue: number;
  }>;
  entities: {
    campaigns: Array<{ id: string; name: string; status: string; dailyBudget: number | null }>;
    adSets: Array<{ id: string; name: string; status: string; dailyBudget: number | null; campaignId: string }>;
    ads: Array<{ id: string; name: string; status: string; adSetId: string }>;
  };
}

export abstract class BaseEvaluator {
  abstract evaluate(ctx: EvaluatorContext): EvaluatorAction[];
}
```

- [ ] **Step 2: Implement 5 evaluators**

Each evaluator implements `evaluate(ctx)` and returns an array of `EvaluatorAction`.

**PauseUnderperformerEvaluator:** For each active campaign/adset/ad with 3+ days of data where CPA > threshold, create a pause action. Confidence based on data window and consistency of underperformance.

**ScaleWinnerEvaluator:** For entities with ROAS > threshold AND conversions > minimum, suggest increasing dailyBudget by aggression%. Confidence based on statistical significance.

**ReallocateBudgetEvaluator:** Identify pairs of campaigns where one has high ROAS and another has low ROAS. Suggest moving budget from low to high (zero-sum). Only fires if both have enough data.

**FrequencyCapEvaluator:** For entities where average frequency > threshold over 3+ days, create a pause action. High confidence since frequency cap is objective.

**ScheduleOptimizeEvaluator:** Analyze hourly breakdown data (if available in breakdowns JSON) to find optimal hours. Suggest adjusting ad scheduling. Lower confidence since this is more speculative.

Each evaluator should be 50-80 lines max. Focus on the core logic — grouping insights by entity, computing averages, comparing to thresholds, and producing actions.

- [ ] **Step 3: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/autopilot/evaluators/
git commit -m "feat: add 5 autopilot evaluators — pause, scale, reallocate, frequency cap, schedule"
```

---

## Task 7: Autopilot Worker (BullMQ Processor)

**Files:**
- Create: `megvax-api/src/autopilot/autopilot.processor.ts`
- Create: `megvax-api/src/autopilot/autopilot-scheduler.processor.ts`
- Modify: `megvax-api/src/autopilot/autopilot.module.ts`
- Modify: `megvax-api/src/app.module.ts`

- [ ] **Step 1: Create AutopilotProcessor (BullMQ worker)**

```typescript
// megvax-api/src/autopilot/autopilot.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { PauseUnderperformerEvaluator } from './evaluators/pause-underperformer.evaluator';
import { ScaleWinnerEvaluator } from './evaluators/scale-winner.evaluator';
import { ReallocateBudgetEvaluator } from './evaluators/reallocate-budget.evaluator';
import { FrequencyCapEvaluator } from './evaluators/frequency-cap.evaluator';
import { ScheduleOptimizeEvaluator } from './evaluators/schedule-optimize.evaluator';
import { BaseEvaluator, EvaluatorContext, EvaluatorAction } from './evaluators/base.evaluator';

@Processor('autopilot', { concurrency: 5 })
export class AutopilotProcessor extends WorkerHost {
  private readonly logger = new Logger(AutopilotProcessor.name);
  private readonly evaluators: BaseEvaluator[];

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private notificationsService: NotificationsService,
    private campaignsService: CampaignsService,
  ) {
    super();
    this.evaluators = [
      new PauseUnderperformerEvaluator(),
      new ScaleWinnerEvaluator(),
      new ReallocateBudgetEvaluator(),
      new FrequencyCapEvaluator(),
      new ScheduleOptimizeEvaluator(),
    ];
  }

  async process(job: Job<{ adAccountId: string; workspaceId: string }>) {
    const { adAccountId, workspaceId } = job.data;
    const lockKey = `autopilot:lock:${adAccountId}`;

    // Acquire distributed lock (TTL 10min)
    const locked = await this.redis.acquireLock(lockKey, 600);
    if (!locked) {
      this.logger.warn(`Lock held for account ${adAccountId}, re-queuing`);
      throw new Error('LOCK_HELD'); // BullMQ will retry
    }

    try {
      // 1. Check autopilotEnabled flag on the account
      const account = await this.prisma.adAccount.findUnique({ where: { id: adAccountId } });
      if (!account?.autopilotEnabled) {
        this.logger.log(`Autopilot disabled for account ${adAccountId}, skipping`);
        return;
      }

      // 2. Load config
      const config = await this.prisma.autopilotConfig.findUnique({
        where: { adAccountId },
      });
      if (!config) {
        this.logger.log(`No autopilot config for account ${adAccountId}, skipping`);
        return;
      }

      // 2. Load recent insights (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const insights = await this.prisma.insightSnapshot.findMany({
        where: { adAccountId, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'desc' },
      });

      // 3. Load active entities
      const [campaigns, adSets, ads] = await Promise.all([
        this.prisma.campaign.findMany({
          where: { adAccountId, status: 'ACTIVE', deletedAt: null },
          select: { id: true, name: true, status: true, dailyBudget: true },
        }),
        this.prisma.adSet.findMany({
          where: { adAccountId, status: 'ACTIVE', deletedAt: null },
          select: { id: true, name: true, status: true, dailyBudget: true, campaignId: true },
        }),
        this.prisma.ad.findMany({
          where: { adAccountId, status: 'ACTIVE', deletedAt: null },
          select: { id: true, name: true, status: true, adSetId: true },
        }),
      ]);

      // 4. Build evaluator context
      const ctx: EvaluatorContext = {
        adAccountId,
        config: {
          pauseThresholds: config.pauseThresholds as any,
          scaleThresholds: config.scaleThresholds as any,
          budgetChangeMaxPercent: config.budgetChangeMaxPercent,
          minSpendBeforeAction: Number(config.minSpendBeforeAction),
        },
        insights: insights.map(i => ({
          entityType: i.entityType,
          entityId: i.entityId,
          date: i.date,
          spend: Number(i.spend),
          impressions: i.impressions,
          clicks: i.clicks,
          conversions: i.conversions,
          ctr: Number(i.ctr),
          cpa: Number(i.cpa),
          roas: Number(i.roas),
          frequency: Number(i.frequency),
          revenue: Number(i.revenue),
        })),
        entities: {
          campaigns: campaigns.map(c => ({ ...c, dailyBudget: c.dailyBudget ? Number(c.dailyBudget) : null })),
          adSets: adSets.map(a => ({ ...a, dailyBudget: a.dailyBudget ? Number(a.dailyBudget) : null })),
          ads: ads.map(a => ({ ...a, adSetId: a.adSetId })),
        },
      };

      // 5. Run all evaluators
      const allActions: EvaluatorAction[] = [];
      for (const evaluator of this.evaluators) {
        try {
          const actions = evaluator.evaluate(ctx);
          allActions.push(...actions);
        } catch (err) {
          this.logger.error(`Evaluator ${evaluator.constructor.name} failed: ${err}`);
        }
      }

      // 6. Process actions by tier
      const actionTiers = config.actionTiers as Record<string, string>;
      for (const action of allActions) {
        const tier = actionTiers[action.ruleType] || 'SUGGEST_WAIT';

        const dbAction = await this.prisma.autopilotAction.create({
          data: {
            adAccountId,
            ruleType: action.ruleType as any,
            entityType: action.entityType as any,
            entityId: action.entityId,
            tier: tier as any,
            description: action.description,
            reason: action.reason,
            changes: action.changes,
            confidenceScore: action.confidenceScore,
            status: tier === 'AUTO' ? 'EXECUTED' : tier === 'SUGGEST_ACT' ? 'SCHEDULED' : 'PENDING',
            scheduledFor: tier === 'SUGGEST_ACT'
              ? new Date(Date.now() + config.suggestActDelayMinutes * 60 * 1000)
              : undefined,
            executedAt: tier === 'AUTO' ? new Date() : undefined,
          },
        });

        // For AUTO tier, execute the action immediately via CampaignsService
        if (tier === 'AUTO') {
          try {
            await this.executeAction(action, adAccountId, workspaceId);
          } catch (err) {
            await this.prisma.autopilotAction.update({
              where: { id: dbAction.id },
              data: { status: 'FAILED', errorMessage: String(err) },
            });
            this.logger.error(`AUTO action failed: ${err}`);
          }
        }

        // Create notification for SUGGEST_ACT and SUGGEST_WAIT
        if (tier !== 'AUTO') {
          // Find workspace admins to notify
          const members = await this.prisma.workspaceMember.findMany({
            where: { workspace: { adAccounts: { some: { id: adAccountId } } }, role: { in: ['OWNER', 'ADMIN'] } },
            select: { userId: true },
          });
          for (const member of members) {
            // NotificationsService.create(userId, workspaceId, { type, title, body?, data? })
            await this.notificationsService.create(member.userId, workspaceId, {
              type: 'AUTOPILOT_ACTION',
              title: tier === 'SUGGEST_ACT' ? 'Otopilot eylemi planlandı' : 'Otopilot önerisi bekliyor',
              body: action.description,
              data: { actionId: dbAction.id, tier, entityId: action.entityId },
            });
          }
        }
      }

      this.logger.log(`Autopilot processed ${allActions.length} actions for account ${adAccountId}`);
    } finally {
      await this.redis.releaseLock(lockKey);
    }
  }

  // Execute an autopilot action by calling the appropriate CampaignsService method
  private async executeAction(action: EvaluatorAction, adAccountId: string, workspaceId: string) {
    const changes = action.changes as { field: string; from: string; to: string };
    if (changes.field === 'status' && changes.to === 'PAUSED') {
      if (action.entityType === 'CAMPAIGN') await this.campaignsService.pauseCampaign(workspaceId, action.entityId);
      else if (action.entityType === 'ADSET') await this.campaignsService.pauseAdSet(workspaceId, action.entityId);
      else if (action.entityType === 'AD') await this.campaignsService.pauseAd(workspaceId, action.entityId);
    } else if (changes.field === 'status' && changes.to === 'ACTIVE') {
      if (action.entityType === 'CAMPAIGN') await this.campaignsService.resumeCampaign(workspaceId, action.entityId);
      else if (action.entityType === 'ADSET') await this.campaignsService.resumeAdSet(workspaceId, action.entityId);
      else if (action.entityType === 'AD') await this.campaignsService.resumeAd(workspaceId, action.entityId);
    } else if (changes.field === 'daily_budget') {
      if (action.entityType === 'CAMPAIGN') await this.campaignsService.updateCampaign(workspaceId, action.entityId, { dailyBudget: Number(changes.to) });
      else if (action.entityType === 'ADSET') await this.campaignsService.updateAdSet(workspaceId, action.entityId, { dailyBudget: Number(changes.to) });
    }
  }
}
```

- [ ] **Step 2: Create AutopilotSchedulerProcessor (cron for SCHEDULED actions)**

```typescript
// megvax-api/src/autopilot/autopilot-scheduler.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignsService } from '../campaigns/campaigns.service';

@Processor('autopilot-scheduler')
export class AutopilotSchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger(AutopilotSchedulerProcessor.name);

  constructor(
    private prisma: PrismaService,
    private campaignsService: CampaignsService,
  ) {
    super();
  }

  async process(job: Job) {
    // Find SCHEDULED actions past their scheduledFor
    const dueActions = await this.prisma.autopilotAction.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: { lte: new Date() },
      },
      include: { adAccount: true },
    });

    for (const action of dueActions) {
      try {
        // Execute via CampaignsService based on the action's changes
        const changes = action.changes as any;
        const workspaceId = action.adAccount.workspaceId;
        if (changes.field === 'status' && changes.to === 'PAUSED') {
          if (action.entityType === 'CAMPAIGN') await this.campaignsService.pauseCampaign(workspaceId, action.entityId);
          else if (action.entityType === 'ADSET') await this.campaignsService.pauseAdSet(workspaceId, action.entityId);
          else if (action.entityType === 'AD') await this.campaignsService.pauseAd(workspaceId, action.entityId);
        } else if (changes.field === 'daily_budget') {
          if (action.entityType === 'CAMPAIGN') await this.campaignsService.updateCampaign(workspaceId, action.entityId, { dailyBudget: Number(changes.to) });
        }

        await this.prisma.autopilotAction.update({
          where: { id: action.id },
          data: { status: 'EXECUTED', executedAt: new Date() },
        });
        this.logger.log(`Executed scheduled action ${action.id}: ${action.description}`);
      } catch (err) {
        await this.prisma.autopilotAction.update({
          where: { id: action.id },
          data: { status: 'FAILED', errorMessage: String(err) },
        });
        this.logger.error(`Failed to execute action ${action.id}: ${err}`);
      }
    }
  }
}
```

- [ ] **Step 3: Register autopilot queues in module and app.module**

Update `autopilot.module.ts` to register BullMQ queues and add a startup service to schedule repeatable jobs:

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    NotificationsModule,
    forwardRef(() => CampaignsModule),
    BullModule.registerQueue({ name: 'autopilot' }),
    BullModule.registerQueue({ name: 'autopilot-scheduler' }),
  ],
  controllers: [AutopilotController],
  providers: [AutopilotService, AutopilotRulesService, AutopilotProcessor, AutopilotSchedulerProcessor],
  exports: [AutopilotService],
})
export class AutopilotModule implements OnModuleInit {
  constructor(
    @InjectQueue('autopilot-scheduler') private schedulerQueue: Queue,
  ) {}

  async onModuleInit() {
    // Run scheduler every 5 minutes to check for due SCHEDULED actions
    await this.schedulerQueue.add('check-scheduled', {}, {
      repeat: { every: 5 * 60 * 1000 }, // every 5 minutes
    });
  }
}
```

The autopilot evaluation jobs for each account are queued by the meta-sync processor after a successful sync (add to the existing `meta-sync.processor.ts` after sync completes).

Add `AutopilotModule` to `app.module.ts` imports.

- [ ] **Step 4: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/autopilot/ megvax-api/src/app.module.ts
git commit -m "feat: add autopilot BullMQ worker — evaluator pipeline, scheduler, distributed locking"
```

---

## Task 8: Suggestions Module

**Files:**
- Create: `megvax-api/src/suggestions/suggestions.module.ts`
- Create: `megvax-api/src/suggestions/suggestions.service.ts`
- Create: `megvax-api/src/suggestions/suggestions.controller.ts`
- Create: `megvax-api/src/suggestions/dto/suggestion-query.dto.ts`
- Modify: `megvax-api/src/app.module.ts`

- [ ] **Step 1: Create DTO**

`suggestion-query.dto.ts`:
```typescript
import { IsString, IsOptional } from 'class-validator';

export class SuggestionQueryDto {
  @IsString()
  accountId: string;

  @IsOptional() @IsString()
  status?: string; // PENDING | APPLIED | DISMISSED

  @IsOptional() @IsString()
  type?: string; // BUDGET | AUDIENCE | CREATIVE | BID | HEALTH | SCALING

  @IsOptional() @IsString()
  cursor?: string;

  @IsOptional()
  limit?: number;
}
```

- [ ] **Step 2: Create SuggestionsService**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { SuggestionQueryDto } from './dto/suggestion-query.dto';

@Injectable()
export class SuggestionsService {
  constructor(
    private prisma: PrismaService,
    private campaignsService: CampaignsService,
  ) {}

  async getSuggestions(workspaceId: string, query: SuggestionQueryDto) {
    await this.verifyAccountAccess(workspaceId, query.accountId);
    const limit = query.limit || 25;
    const where: any = { adAccountId: query.accountId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    const items = await this.prisma.suggestion.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    return { data, cursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async applySuggestion(workspaceId: string, suggestionId: string) {
    const suggestion = await this.prisma.suggestion.findUniqueOrThrow({
      where: { id: suggestionId },
      include: { adAccount: true },
    });
    if (suggestion.adAccount.workspaceId !== workspaceId) throw new NotFoundException();
    if (suggestion.status !== 'PENDING') throw new Error('Suggestion already processed');

    // Execute the suggestion action via CampaignsService
    const action = suggestion.action as { type: string; params: Record<string, any> };
    if (action.type === 'patch_campaign') {
      await this.campaignsService.updateCampaign(workspaceId, suggestion.entityId, action.params);
    } else if (action.type === 'pause_campaign') {
      await this.campaignsService.pauseCampaign(workspaceId, suggestion.entityId);
    }
    // 'review' type suggestions don't execute — just mark as applied

    return this.prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status: 'APPLIED', appliedAt: new Date() },
    });
  }

  async dismissSuggestion(workspaceId: string, suggestionId: string, reason?: string) {
    const suggestion = await this.prisma.suggestion.findUniqueOrThrow({
      where: { id: suggestionId },
      include: { adAccount: true },
    });
    if (suggestion.adAccount.workspaceId !== workspaceId) throw new NotFoundException();

    return this.prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status: 'DISMISSED', dismissedAt: new Date(), dismissReason: reason },
    });
  }

  // Called after each insight sync to generate new suggestions
  async generateSuggestions(adAccountId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch recent insights grouped by entity
    const insights = await this.prisma.insightSnapshot.findMany({
      where: { adAccountId, date: { gte: sevenDaysAgo } },
      orderBy: { date: 'desc' },
    });

    const campaigns = await this.prisma.campaign.findMany({
      where: { adAccountId, status: 'ACTIVE', deletedAt: null },
    });

    const suggestions: any[] = [];

    // Budget suggestions: high ROAS + low budget campaigns
    for (const campaign of campaigns) {
      const campaignInsights = insights.filter(i => i.entityId === campaign.id && i.entityType === 'CAMPAIGN');
      if (campaignInsights.length < 3) continue;

      const avgRoas = campaignInsights.reduce((sum, i) => sum + Number(i.roas), 0) / campaignInsights.length;
      const totalSpend = campaignInsights.reduce((sum, i) => sum + Number(i.spend), 0);
      const budget = Number(campaign.dailyBudget || 0);

      if (avgRoas > 2.0 && budget > 0 && budget < 500) {
        suggestions.push({
          adAccountId,
          entityType: 'CAMPAIGN',
          entityId: campaign.id,
          type: 'BUDGET',
          title: `${campaign.name} bütçesini artırın`,
          description: `Bu kampanya ${avgRoas.toFixed(1)}x ROAS ile iyi performans gösteriyor. Bütçeyi artırmak dönüşümlerinizi artırabilir.`,
          impact: { metric: 'conversions', estimatedChange: '+20%', confidence: Math.min(avgRoas / 5, 0.9) },
          action: { type: 'patch_campaign', params: { dailyBudget: Math.round(budget * 1.3) } },
        });
      }

      // Health suggestion: spending but no conversions
      if (totalSpend > 50 && campaignInsights.every(i => i.conversions === 0)) {
        suggestions.push({
          adAccountId,
          entityType: 'CAMPAIGN',
          entityId: campaign.id,
          type: 'HEALTH',
          title: `${campaign.name} dönüşüm almıyor`,
          description: `Son 7 günde ₺${totalSpend.toFixed(0)} harcandı ama dönüşüm yok. Hedefleme veya kreatifi gözden geçirin.`,
          impact: { metric: 'cpa', estimatedChange: 'reduce waste', confidence: 0.85 },
          action: { type: 'review', params: {} },
        });
      }
    }

    // Deduplicate: don't create if same type+entity already PENDING
    for (const s of suggestions) {
      const existing = await this.prisma.suggestion.findFirst({
        where: {
          adAccountId: s.adAccountId,
          entityId: s.entityId,
          type: s.type,
          status: 'PENDING',
        },
      });
      if (!existing) {
        await this.prisma.suggestion.create({ data: s });
      }
    }
  }

  private async verifyAccountAccess(workspaceId: string, accountId: string) {
    const account = await this.prisma.adAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) throw new NotFoundException('Ad account not found');
  }
}
```

- [ ] **Step 3: Create SuggestionsController**

```typescript
import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { SuggestionQueryDto } from './dto/suggestion-query.dto';

@Auth()
@Controller('suggestions')
export class SuggestionsController {
  constructor(private suggestionsService: SuggestionsService) {}

  @Get()
  getSuggestions(@CurrentUser('workspaceId') workspaceId: string, @Query() query: SuggestionQueryDto) {
    return this.suggestionsService.getSuggestions(workspaceId, query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post(':id/apply')
  applySuggestion(@CurrentUser('workspaceId') workspaceId: string, @Param('id') id: string) {
    return this.suggestionsService.applySuggestion(workspaceId, id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post(':id/dismiss')
  dismissSuggestion(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.suggestionsService.dismissSuggestion(workspaceId, id, reason);
  }
}
```

- [ ] **Step 4: Create SuggestionsModule, register in app.module.ts**

- [ ] **Step 5: Commit**

```bash
cd /d/MegvaxV4-main
git add megvax-api/src/suggestions/ megvax-api/src/app.module.ts
git commit -m "feat: add suggestions module — CRUD, generation engine, apply/dismiss flow"
```

---

## Task 9: Wire Frontend — Optimizations Page to Real Suggestions API

**Files:**
- Modify: `app/app/optimizations/page.tsx`

- [ ] **Step 1: Read the optimizations page and wire to real API**

Replace the mock data fetches with real API calls:

```tsx
import { api } from '@/lib/api';

// Replace the suggestions fetch:
// GET /suggestions?accountId=...&status=PENDING
// GET /autopilot/config/:accountId
// GET /autopilot/actions?accountId=...&limit=10
// GET /autopilot/stats?accountId=...

// Wire the apply/dismiss buttons:
// POST /suggestions/:id/apply
// POST /suggestions/:id/dismiss
```

Keep mock fallback for development without backend.

- [ ] **Step 2: Commit**

```bash
cd /d/MegvaxV4-main
git add app/app/optimizations/page.tsx
git commit -m "feat: wire optimizations page to real suggestions + autopilot API"
```

---

## Task 10: Wire Frontend — Campaign Write Actions (Pause/Resume/Edit)

**Files:**
- Modify: `app/app/campaigns/page.tsx`
- Modify: relevant campaign action components

- [ ] **Step 1: Add write action handlers to campaigns page**

Wire the campaign tree's action buttons (pause, resume, edit budget) to the real API:

```tsx
const handlePauseCampaign = async (id: string) => {
  try {
    await api(`/campaigns/${id}/pause`, { method: 'POST' });
    toast.success('Kampanya duraklatıldı');
    // Refresh campaign list
    fetchTree();
  } catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'İşlem başarısız');
  }
};

const handleResumeCampaign = async (id: string) => {
  try {
    await api(`/campaigns/${id}/resume`, { method: 'POST' });
    toast.success('Kampanya devam ettirildi');
    fetchTree();
  } catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'İşlem başarısız');
  }
};
```

- [ ] **Step 2: Commit**

```bash
cd /d/MegvaxV4-main
git add app/app/campaigns/page.tsx
git commit -m "feat: wire campaign pause/resume/edit actions to real API"
```

---

## Task 11: Prisma Generate + TypeScript Verification

**Files:**
- Verify all files compile

- [ ] **Step 1: Generate Prisma client**

```bash
cd /d/MegvaxV4-main/megvax-api && npx prisma generate
```

- [ ] **Step 2: TypeScript check (backend)**

```bash
cd /d/MegvaxV4-main/megvax-api && npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 3: TypeScript check (frontend)**

```bash
cd /d/MegvaxV4-main && npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 4: Commit fixes**

```bash
cd /d/MegvaxV4-main
git add -u
git commit -m "chore: fix type errors from Phase 2 integration"
```

---

## Summary

| Task | What It Delivers |
|------|-----------------|
| 1 | 4 new Prisma models (AutopilotConfig, AutopilotAction, AutomationRule, Suggestion) |
| 2 | Meta API write methods (create/update/delete campaigns, adsets, ads) |
| 3 | Campaign/AdSet/Ad write endpoints (POST, PATCH, DELETE, pause, resume, duplicate) |
| 4 | Autopilot module — config CRUD, actions list, approve/cancel, stats |
| 5 | Custom automation rules — CRUD + dry-run test |
| 6 | 5 autopilot evaluators (pause, scale, reallocate, frequency, schedule) |
| 7 | Autopilot BullMQ worker + scheduler for SCHEDULED actions |
| 8 | Suggestions module — generation engine, apply/dismiss |
| 9 | Frontend: optimizations page wired to real suggestions API |
| 10 | Frontend: campaign write actions (pause/resume) |
| 11 | Final verification + type checking |

**Total new files:** ~25 TypeScript files
**New Prisma models:** 4
**New API endpoints:** ~30
**New BullMQ queues:** 2 (autopilot, autopilot-scheduler)

**Deferred to Phase 3:**
- Email notification delivery (Resend integration for autopilot action emails, digest mode)
- Plan-based feature gating for autopilot (Starter=pause only, Pro=full, Agency=custom rules)
- Autopilot queue scheduling (repeatable BullMQ jobs every 30min — needs cron setup in a startup service)

# MegVax Platform Design Spec

## Overview

MegVax is an autonomous Meta Ads management platform targeting Turkish agencies and business owners. It actively manages ad accounts — pausing underperformers, scaling winners, reallocating budgets — and notifies users of actions taken. It exposes a public API for developer integrations.

A second product, FeedCraft (product catalog creative automation), integrates with MegVax as an add-on module sharing workspace auth and Meta connections. FeedCraft gets its own spec cycle after MegVax is functional.

**Target users:** Turkish digital marketing agencies, e-commerce business owners, freelance ad managers.

**Competitors:** iyzads.com, wask.co, madgicx.com. Differentiators: Turkish-native, autopilot-first (not dashboard-first), CAPI integration, public API.

---

## Architecture

### Deployable Units

| Unit | Tech | Host | Purpose |
|------|------|------|---------|
| megvax-web | Next.js 16, React 19, Tailwind CSS 4, Framer Motion | Vercel | Dashboard, admin panel, marketing site, API docs |
| megvax-api | NestJS 11, TypeScript, Prisma ORM | Railway | REST API, auth, Meta integration, autopilot engine |
| megvax-worker | Same NestJS codebase, worker entrypoint | Railway (separate service) | BullMQ queues: meta-sync, autopilot, capi-forward, reports, notifications |

### External Services

| Service | Purpose | Tier |
|---------|---------|------|
| Neon PostgreSQL | Primary database, branch per environment | Pro |
| Upstash Redis | BullMQ queues, cache (Meta API responses 15min TTL), rate limit counters | Pro |
| Meta Marketing API v25.0 | Campaign CRUD, insights, Conversions API | Production app |
| Stripe | Subscriptions, invoices, payment methods | Standard |
| Resend | Transactional email (auth flows, autopilot alerts, digests) | Pro |
| Sentry | Error monitoring, performance tracing | Team |

### Data Flow

```
Meta Graph API ──(pull every 15min)──> megvax-worker (meta-sync queue)
    │                                        │
    │                                        ▼
    │                                  Neon PostgreSQL
    │                                        │
    │                                        ▼
    │                              megvax-worker (autopilot queue)
    │                                        │
    │                              ┌─────────┴─────────┐
    │                              │                    │
    │                        Auto-execute          Notify user
    │                              │                    │
    ◄──(write back to Meta)────────┘                    ▼
                                                 In-app + email
```

Dashboard reads from PostgreSQL (cached local copies), never directly from Meta API. This ensures fast load times and protects against Meta rate limits.

---

## Database Schema

### Auth & Workspace

**User**
- id (uuid, PK)
- email (unique, indexed)
- passwordHash (bcrypt, 12 rounds)
- fullName
- avatar
- locale (tr | en, default: tr)
- emailVerified (boolean, default: false)
- emailVerifyToken
- passwordResetToken, passwordResetExpiresAt
- isAdmin (boolean, default: false — platform-level admin, distinct from workspace OWNER. First admin seeded via ADMIN_EMAIL env var on startup)
- lastLoginAt
- createdAt, updatedAt

**Workspace**
- id (uuid, PK)
- name
- slug (unique, indexed)
- plan (STARTER | PRO | AGENCY)
- stripeCustomerId
- settings (JSONB: timezone, currency, defaultNotificationPrefs)
- createdAt, updatedAt

**WorkspaceMember**
- id (uuid, PK)
- userId (FK → User)
- workspaceId (FK → Workspace)
- role (OWNER | ADMIN | MEMBER | VIEWER)
- joinedAt
- UNIQUE(userId, workspaceId)

**Invitation**
- id (uuid, PK)
- workspaceId (FK → Workspace)
- email
- role
- token (unique, indexed)
- invitedById (FK → User)
- expiresAt
- acceptedAt (nullable)
- createdAt

**RefreshToken**
- id (uuid, PK)
- userId (FK → User)
- tokenHash (indexed)
- deviceInfo
- expiresAt
- createdAt

**ApiKey**
- id (uuid, PK)
- workspaceId (FK → Workspace)
- name
- prefix (e.g., mvx_live_abc — for display, not lookup)
- hashedKey (SHA-256 hash, indexed — deterministic for lookup. NOT bcrypt which is non-deterministic. Incoming key is SHA-256 hashed for DB query.)
- scopes (text[]: campaigns:read, campaigns:write, insights:read, autopilot:read, autopilot:write, webhooks:manage)
- rateLimit (int, requests per minute)
- lastUsedAt
- expiresAt (nullable — optional expiry)
- createdAt

### Meta Integration

**MetaConnection**
- id (uuid, PK)
- workspaceId (FK → Workspace)
- metaUserId
- accessToken (text — AES-256-GCM encrypted)
- tokenExpiresAt
- status (ACTIVE | EXPIRED | REVOKED)
- connectedAt
- UNIQUE(workspaceId, metaUserId)

**AdAccount**
- id (uuid, PK)
- metaConnectionId (FK → MetaConnection)
- workspaceId (FK → Workspace, denormalized for query perf)
- metaAccountId (indexed)
- name
- currency
- timezone
- status (ACTIVE | DISABLED | CLOSED)
- autopilotEnabled (boolean, default: false)
- autopilotAggression (CONSERVATIVE | BALANCED | AGGRESSIVE)
- lastSyncAt
- lastSyncError
- createdAt, updatedAt
- UNIQUE(workspaceId, metaAccountId)

**Campaign**
- id (uuid, PK)
- adAccountId (FK → AdAccount)
- metaCampaignId (indexed)
- name
- status (ACTIVE | PAUSED | DELETED | ARCHIVED)
- objective
- buyingType
- budgetType (DAILY | LIFETIME)
- dailyBudget (decimal)
- lifetimeBudget (decimal)
- bidStrategy
- specialAdCategories (text[])
- startTime, endTime
- metaRaw (JSONB — full Meta API response for fields we don't model explicitly)
- localVersion (int, default: 0 — incremented on local writes, used for sync conflict resolution)
- syncStatus (SYNCED | LOCAL_PENDING | CONFLICT)
- deletedAt (soft delete)
- createdAt, updatedAt, lastSyncAt

**AdSet**
- id (uuid, PK)
- campaignId (FK → Campaign)
- adAccountId (FK → AdAccount, denormalized)
- metaAdSetId (indexed)
- name
- status (ACTIVE | PAUSED | DELETED | ARCHIVED)
- targeting (JSONB: age, gender, interests, locations, custom audiences)
- placements (JSONB)
- bidAmount (decimal, nullable)
- dailyBudget, lifetimeBudget
- scheduledStart, scheduledEnd
- optimizationGoal
- billingEvent
- metaRaw (JSONB)
- localVersion (int, default: 0)
- syncStatus (SYNCED | LOCAL_PENDING | CONFLICT)
- deletedAt
- createdAt, updatedAt, lastSyncAt

**Ad**
- id (uuid, PK)
- adSetId (FK → AdSet)
- adAccountId (FK → AdAccount, denormalized)
- metaAdId (indexed)
- name
- status (ACTIVE | PAUSED | DELETED | ARCHIVED)
- creativeSpec (JSONB: body, title, callToAction, imageUrl, videoUrl, type)
- previewUrl
- thumbnailUrl
- metaRaw (JSONB)
- localVersion (int, default: 0)
- syncStatus (SYNCED | LOCAL_PENDING | CONFLICT)
- deletedAt
- createdAt, updatedAt, lastSyncAt

### Insights

**InsightSnapshot**
- id (bigint, PK — high-volume table)
- adAccountId (FK → AdAccount)
- entityType (ACCOUNT | CAMPAIGN | ADSET | AD)
- entityId (uuid — references campaign/adset/ad)
- date (date, indexed)
- spend (decimal)
- impressions (int)
- reach (int)
- clicks (int)
- conversions (int)
- revenue (decimal)
- ctr (decimal, computed)
- cpm (decimal, computed)
- cpc (decimal, computed)
- cpa (decimal, computed)
- roas (decimal, computed)
- frequency (decimal)
- breakdowns (JSONB: { age: [...], gender: [...], placement: [...], device: [...] })
- createdAt
- UNIQUE(adAccountId, entityType, entityId, date) — prevents duplicate rows on re-sync
- INDEX(adAccountId, entityType, date)
- INDEX(entityId, date)
- Note: entityId is a polymorphic reference — points to AdAccount.id when entityType=ACCOUNT, Campaign.id when CAMPAIGN, etc. No FK constraint (analytics table).
- **Partitioning:** Range-partition by month on `date` column. Retention policy: daily granularity for 90 days, aggregate to weekly for 1 year, monthly for 2 years. Use pg_cron for automated rollup jobs.

### Autopilot

**AutopilotConfig**
- id (uuid, PK)
- adAccountId (FK → AdAccount, unique)
- actionTiers (JSONB: maps action types to AUTO | SUGGEST_ACT | SUGGEST_WAIT)
- suggestActDelayMinutes (int, default: 60)
- budgetChangeMaxPercent (int, default: 30 — max single budget change)
- minSpendBeforeAction (decimal — don't act on campaigns with < X spend)
- pauseThresholds (JSONB: { cpa_max: X, roas_min: Y, frequency_max: Z })
- scaleThresholds (JSONB: { roas_min: X, conversions_min: Y })
- updatedAt

**AutopilotAction**
- id (uuid, PK)
- adAccountId (FK → AdAccount)
- ruleType (PAUSE_UNDERPERFORMER | SCALE_WINNER | REALLOCATE_BUDGET | FREQUENCY_CAP | SCHEDULE_OPTIMIZE | CUSTOM_RULE)
- entityType (CAMPAIGN | ADSET | AD)
- entityId (uuid)
- tier (AUTO | SUGGEST_ACT | SUGGEST_WAIT)
- description (text — human-readable: "Paused ad 'Summer Sale v3' — CPA ₺85 exceeds threshold ₺50")
- reason (JSONB: { metric: 'cpa', value: 85, threshold: 50, window: '7d' })
- changes (JSONB: { field: 'status', from: 'ACTIVE', to: 'PAUSED' })
- confidenceScore (decimal 0-1)
- status (PENDING | SCHEDULED | EXECUTED | CANCELLED | FAILED)
- scheduledFor (timestamp — for SUGGEST_ACT, execute after delay)
- executedAt
- cancelledAt
- cancelledById (FK → User, nullable)
- errorMessage
- createdAt

**AutomationRule** (user-defined custom rules)
- id (uuid, PK)
- workspaceId (FK → Workspace)
- adAccountId (FK → AdAccount)
- name
- enabled (boolean)
- trigger (JSONB: { metric, operator, threshold, window, entityScope })
- action (JSONB: { type, params })
- tier (AUTO | SUGGEST_ACT | SUGGEST_WAIT)
- cooldownMinutes (int)
- lastFiredAt
- createdAt, updatedAt

### CAPI

**CAPIPixel**
- id (uuid, PK)
- adAccountId (FK → AdAccount)
- pixelId (indexed)
- accessToken (encrypted — this is a **pixel-specific system user token** scoped to the Conversions API, distinct from MetaConnection.accessToken which is the user's Marketing API OAuth token. Both are AES-256-GCM encrypted at rest. The pixel token is generated in Meta Events Manager and grants only server event publishing permission for this specific pixel.)
- domain
- status (ACTIVE | INACTIVE)
- createdAt

**CAPIEvent**
- id (uuid, PK)
- pixelId (FK → CAPIPixel)
- eventName (PURCHASE | LEAD | ADD_TO_CART | INITIATE_CHECKOUT | COMPLETE_REGISTRATION | VIEW_CONTENT | SEARCH | CUSTOM)
- eventTime (timestamp)
- userData (JSONB — hashed PII: em, ph, fn, ln, ct, st, zp, country, fbp, fbc)
- customData (JSONB — value, currency, content_ids, content_type, etc.)
- sourceUrl
- actionSource (WEBSITE | APP | PHONE_CALL | CHAT | EMAIL | IN_STORE | OTHER)
- sentAt (timestamp, nullable)
- metaEventId (text, nullable — Meta's response ID)
- status (QUEUED | SENT | FAILED)
- errorMessage
- createdAt
- INDEX(pixelId, status)
- INDEX(pixelId, eventTime)

### Billing

**Subscription**
- id (uuid, PK)
- workspaceId (FK → Workspace, unique)
- stripeSubscriptionId
- stripePriceId
- status (ACTIVE | PAST_DUE | CANCELLED | TRIALING)
- currentPeriodStart, currentPeriodEnd
- cancelAtPeriodEnd (boolean)
- trialEnd (timestamp, nullable)
- createdAt, updatedAt

**Invoice**
- id (uuid, PK)
- workspaceId (FK → Workspace)
- stripeInvoiceId
- amountDue (int — cents)
- currency
- status (DRAFT | OPEN | PAID | VOID | UNCOLLECTIBLE)
- pdfUrl
- createdAt

**UsageRecord**
- id (uuid, PK)
- workspaceId (FK → Workspace)
- metric (API_CALLS | META_SYNCS | AUTOMATIONS_FIRED | CONNECTED_ACCOUNTS)
- count (int)
- periodStart (date)
- periodEnd (date)
- INDEX(workspaceId, metric, periodStart)

### Suggestions

**Suggestion**
- id (uuid, PK)
- adAccountId (FK → AdAccount)
- entityType (ACCOUNT | CAMPAIGN | ADSET | AD)
- entityId (uuid)
- type (BUDGET | AUDIENCE | CREATIVE | BID | HEALTH | SCALING)
- title
- description
- impact (JSONB: { metric: 'roas', estimatedChange: '+15%', confidence: 0.7 })
- action (JSONB: { type: 'patch_campaign', params: { dailyBudget: 500 } })
- status (PENDING | APPLIED | DISMISSED)
- appliedAt
- dismissedAt
- dismissReason
- createdAt

### Notifications & Audit

**Notification**
- id (uuid, PK)
- userId (FK → User)
- workspaceId (FK → Workspace)
- type (AUTOPILOT_ACTION | SUGGESTION | TEAM_INVITE | BILLING | SYSTEM | META_CONNECTION)
- title
- body
- data (JSONB — links, entity references)
- readAt (nullable)
- createdAt
- INDEX(userId, readAt, createdAt)

**NotificationPreference**
- id (uuid, PK)
- userId (FK → User)
- workspaceId (FK → Workspace)
- channel (IN_APP | EMAIL)
- type (same enum as Notification.type)
- enabled (boolean)
- digestFrequency (INSTANT | DAILY | WEEKLY — email only)
- UNIQUE(userId, workspaceId, channel, type)

**AuditLog**
- id (uuid, PK)
- workspaceId (FK → Workspace)
- userId (FK → User, nullable — system actions have no user)
- action (text: campaign.pause, adset.budget_change, autopilot.execute, member.invite, etc.)
- source (USER | META_SYNC | AUTOPILOT | SYSTEM)
- entityType
- entityId
- changes (JSONB: { field: { from, to } })
- ipAddress
- userAgent
- createdAt
- INDEX(workspaceId, createdAt)
- INDEX(entityType, entityId)

### Webhooks (outbound)

**Webhook**
- id (uuid, PK)
- workspaceId (FK → Workspace)
- url (text)
- secret (text — AES-256-GCM encrypted, used for HMAC-SHA256 signing outbound payloads)
- events (text[]: autopilot.action.executed, autopilot.action.pending, campaign.status_changed, adset.status_changed, ad.status_changed, insights.daily_ready, account.health_changed)
- enabled (boolean, default: true)
- failCount (int, default: 0 — auto-disabled after 10 consecutive failures)
- disabledAt (timestamp, nullable)
- createdAt, updatedAt
- UNIQUE(workspaceId, url)

**WebhookDelivery**
- id (uuid, PK)
- webhookId (FK → Webhook)
- event (text)
- payload (JSONB)
- responseStatus (int, nullable)
- responseBody (text, nullable — first 1KB)
- attemptCount (int)
- success (boolean)
- nextRetryAt (timestamp, nullable — exponential backoff: 1min, 5min, 30min)
- createdAt
- INDEX(webhookId, createdAt)

### Reports

**Report**
- id (uuid, PK)
- workspaceId (FK → Workspace)
- adAccountId (FK → AdAccount)
- name
- type (ON_DEMAND | SCHEDULED)
- config (JSONB: { metrics[], breakdowns[], dateRange, filters })
- schedule (JSONB: { cron, nextRunAt } — nullable, for SCHEDULED only)
- format (CSV | PDF)
- lastGeneratedAt
- lastFileUrl (text — presigned URL or S3 path)
- createdAt, updatedAt

### Support

**SupportTicket**
- id (uuid, PK)
- workspaceId (FK → Workspace)
- userId (FK → User)
- subject
- description (text)
- category (BUG | FEATURE_REQUEST | BILLING | META_CONNECTION | OTHER)
- priority (LOW | MEDIUM | HIGH | CRITICAL)
- status (OPEN | IN_PROGRESS | RESOLVED | CLOSED)
- resolvedAt
- createdAt, updatedAt
- INDEX(workspaceId, status)

---

## API Modules (NestJS)

### 1. Auth Module

**Endpoints:**
- POST /auth/register — email, password, fullName → creates User + Workspace (owner)
- POST /auth/login — email, password → accessToken (15min) + refreshToken (httpOnly cookie, 7d, SameSite=Strict)
- POST /auth/refresh — rotate refresh token, issue new access token
- POST /auth/logout — revoke refresh token
- POST /auth/verify-email — token → set emailVerified=true
- POST /auth/forgot-password — email → send reset link via Resend
- POST /auth/reset-password — token + newPassword
- GET /auth/me — current user profile
- PATCH /auth/me — update fullName, avatar, locale
- POST /auth/change-password — currentPassword + newPassword (distinct from forgot-password)
- POST /auth/accept-invitation — token → create WorkspaceMember, mark invitation as accepted

**Implementation:**
- Passwords: bcrypt (12 rounds)
- Access tokens: RS256-signed JWT, payload: { sub: userId, workspaceId, role }
- Refresh tokens: crypto.randomBytes(64), stored as SHA-256 hash in DB
- Rate limiting: 5 attempts / 15min per IP on login/register
- CSRF protection: refresh token cookie uses SameSite=Strict + all mutating API endpoints require X-Requested-With header (double-submit pattern)
- Guards: JwtAuthGuard (dashboard), ApiKeyGuard (public API), RolesGuard (RBAC), PlanGuard (feature gates per workspace plan)
- **PlanLimitInterceptor:** A NestJS interceptor applied via `@PlanLimit('feature')` decorator. Before the handler executes, it loads the workspace's current plan from the request context, checks the feature against a plan-limits config map (e.g., `{ STARTER: { maxAdAccounts: 2, autopilot: 'basic', capi: false, apiAccess: false }, PRO: { maxAdAccounts: 10, autopilot: 'full', capi: true, apiAccess: true, apiRateLimit: 300 }, AGENCY: { maxAdAccounts: Infinity, autopilot: 'full+custom', capi: true, apiAccess: true, apiRateLimit: 1000 } }`). If the feature is not included in the plan or a numeric limit is exceeded, it throws `403 { error: { code: 'PLAN_LIMIT_EXCEEDED', message: '...', upgradeUrl: '/billing/checkout' } }`. Usage counts (ad accounts, team members) are cached in Redis with 5min TTL to avoid DB hits on every request.

### 2. Workspace Module

**Endpoints:**
- GET /workspaces/current — current workspace details
- PATCH /workspaces/current — update name, settings
- GET /workspaces/current/members — list members
- POST /workspaces/current/invitations — invite by email + role
- DELETE /workspaces/current/members/:id — remove member
- PATCH /workspaces/current/members/:id — change role
- POST /workspaces/current/api-keys — create API key (returns plaintext `mvx_live_...` ONCE; stores SHA-256 hash in ApiKey table). Body: { name, scopes: ['campaigns:read', 'campaigns:write', ...], expiresAt? }
- GET /workspaces/current/api-keys — list keys (returns name, prefix, scopes, createdAt, lastUsedAt — never the full key)
- DELETE /workspaces/current/api-keys/:id — revoke key (hard delete the hash row)
- PATCH /workspaces/current/api-keys/:id — update name or scopes (key value unchanged)

### 3. Meta Connection Module

**Endpoints:**
- GET /meta/auth-url — generate OAuth redirect URL
- POST /meta/callback — exchange code for token, store encrypted
- GET /meta/connections — list connections for workspace
- DELETE /meta/connections/:id — revoke and remove
- GET /meta/ad-accounts — list available ad accounts from Meta
- POST /meta/ad-accounts/:metaAccountId/connect — add to workspace
- DELETE /meta/ad-accounts/:id/disconnect — remove from workspace

**Background:**
- Cron: check token expiry daily, refresh tokens expiring in <7 days
- Cron: connection health check — attempt a simple API call, update status

**Worker (meta-sync queue, every 15min per account):**

**Concurrency & safety:**
- Max concurrency: 10 jobs in parallel (higher than autopilot — sync is I/O-bound, not compute-heavy)
- Job locking: Redis lock `meta-sync:lock:{accountId}` (TTL 15min). If lock held, skip this cycle (next cycle will pick it up)
- Stagger: accounts distributed using `delay: hash(accountId) % (15 * 60 * 1000)` to spread Meta API calls
- Dead letter queue: jobs failing 3 times → `meta-sync:dead`. Alert via notification to workspace admins.
- Retry: 3 attempts with exponential backoff (30s, 2min, 10min)

**Sync steps:**
1. Pull campaigns, ad sets, ads for the account from Meta Marketing API (batch requests where possible)
2. Pull daily insight snapshots for the last 3 days (to catch delayed attribution)
3. Compare each entity's Meta state with local DB:
   - If entity does not exist locally → create it
   - If Meta has newer data AND syncStatus=SYNCED → overwrite local
   - If syncStatus=LOCAL_PENDING → keep local, flag as CONFLICT if Meta also changed
4. Upsert InsightSnapshot rows
5. Update AdAccount.lastSyncAt
6. On completion: dispatch suggestion generation job to the same queue (chained job)

**Error handling:**
- If Meta API returns rate limit (HTTP 429): respect `retry-after` header, re-queue with that delay
- If Meta API returns error for specific entity: log error, continue syncing remaining entities (partial sync)
- If Meta API is completely down (5xx): retry per strategy above, then DLQ
- Partial sync: if campaigns sync but insights fail, commit campaigns and re-queue insights-only job

### 4. Campaigns Module

**Endpoints:**
- GET /campaigns?accountId=&status=&search=&sort=&cursor=&limit=
- GET /campaigns/:id
- POST /campaigns — create locally + push to Meta
- PATCH /campaigns/:id — update locally + push to Meta
- POST /campaigns/:id/pause
- POST /campaigns/:id/resume
- POST /campaigns/:id/duplicate
- DELETE /campaigns/:id — soft delete + archive on Meta

- GET /campaigns/tree?accountId=X — returns full campaign → adset → ad hierarchy in a single response. Response shape: `{ data: Campaign & { adsets: (AdSet & { ads: Ad[] })[] }[] }`. Uses a single query with Prisma `include` to avoid N+1. Limited to 100 campaigns per call; paginate with cursor if more.

**Ad Set Endpoints:**
- GET /adsets?campaignId=&status=&search=&sort=&cursor=&limit=
- GET /adsets/:id
- POST /adsets — create locally + push to Meta (requires campaignId in body)
- PATCH /adsets/:id — update locally + push to Meta
- POST /adsets/:id/pause
- POST /adsets/:id/resume
- POST /adsets/:id/duplicate
- DELETE /adsets/:id — soft delete + archive on Meta

**Ad Endpoints:**
- GET /ads?adsetId=&status=&search=&sort=&cursor=&limit=
- GET /ads/:id
- POST /ads — create locally + push to Meta (requires adsetId in body, creative payload)
- PATCH /ads/:id — update locally + push to Meta
- POST /ads/:id/pause
- POST /ads/:id/resume
- POST /ads/:id/duplicate
- DELETE /ads/:id — soft delete + archive on Meta

**Sync conflict resolution:**
- Local writes set a `localVersion` counter
- Sync job pulls from Meta, compares `lastSyncAt` with `updatedAt`
- If Meta has newer data AND no local pending changes → overwrite local
- If local has pending changes → keep local, flag for review
- AuditLog records all changes with source (USER | META_SYNC | AUTOPILOT)

### 5. Insights Module

**Endpoints:**
- GET /insights?accountId=&entityType=&entityId=&from=&to=&granularity=(day|week|month)
- GET /insights/top-performers?accountId=&metric=&limit=
- GET /insights/compare?ids[]=&from=&to=
- GET /insights/account-summary?accountId=&from=&to=
- GET /insights/export?format=(csv|pdf)&...

**Caching:** Account-level daily aggregates cached in Redis (15min TTL). Invalidated on new sync.

### 6. Autopilot Module

**Endpoints:**
- GET /autopilot/config/:accountId — current settings
- PATCH /autopilot/config/:accountId — update aggression, tiers, thresholds
- GET /autopilot/actions?accountId=&status=&from=&to=&cursor=&limit=
- POST /autopilot/actions/:id/approve — execute a PENDING action
- POST /autopilot/actions/:id/cancel — cancel a PENDING/SCHEDULED action
- GET /autopilot/stats?accountId=&from=&to= — actions taken, money saved, performance impact
- GET /autopilot/rules?accountId=&cursor=&limit= — list custom automation rules
- POST /autopilot/rules — create custom rule (body: name, trigger, action, tier, cooldownMinutes, isEnabled)
- GET /autopilot/rules/:id — get rule detail
- PATCH /autopilot/rules/:id — update rule configuration
- DELETE /autopilot/rules/:id — delete rule
- POST /autopilot/rules/:id/test — dry-run rule against last 7 days of data, return hypothetical actions without executing

**Worker (autopilot queue, every 30min per account):**

**Concurrency & safety:**
- Max concurrency: 5 jobs processed in parallel across all worker instances (BullMQ `concurrency` option)
- Job locking: each job acquires a Redis lock `autopilot:lock:{accountId}` (TTL 10min) before processing. If lock is held, the job is re-queued with 2min delay. This prevents duplicate evaluations for the same account.
- Stagger: accounts are distributed across the 30min window using `delay: hash(accountId) % (30 * 60 * 1000)` to avoid thundering herd on Meta API. No two accounts for the same workspace start within the same 30-second window.
- Dead letter queue: jobs failing 3 times move to `autopilot:dead` queue. Admin dashboard surfaces DLQ depth.

**Processing steps:**
1. Load account's AutopilotConfig + recent InsightSnapshots
2. Run evaluators:
   - **PauseUnderperformer:** CPA > threshold for 3+ days → pause
   - **ScaleWinner:** ROAS > threshold AND conversions > min → increase budget by aggression%
   - **ReallocateBudget:** Shift budget from low-ROAS to high-ROAS campaigns (zero-sum)
   - **FrequencyCap:** Frequency > threshold → pause to avoid ad fatigue
   - **ScheduleOptimize:** Analyze hourly conversion data → adjust ad scheduling
3. For each action: calculate confidence score, determine tier from config
4. AUTO tier → execute immediately via Campaigns module, log AutopilotAction
5. SUGGEST_ACT tier → create AutopilotAction with scheduledFor = now + delay, create Notification
6. SUGGEST_WAIT tier → create AutopilotAction with PENDING status, create Notification
7. Separate cron checks SCHEDULED actions past their scheduledFor → execute if not cancelled

### 7. CAPI Module

**Endpoints:**
- GET /capi/pixels?accountId= — list pixels
- POST /capi/pixels — register pixel
- PATCH /capi/pixels/:id — update domain, status, or rotate access token
- DELETE /capi/pixels/:id
- POST /capi/events — receive server events (batch: up to 1000)
- GET /capi/health?pixelId= — match rate, event counts, error rate

**Worker (capi-forward queue, real-time):**
- Batch events (up to 1000 per Meta API call)
- Deduplicate with browser pixel events (event_id matching)
- Retry failed sends (3 attempts, exponential backoff)
- Track match quality score

### 8. Suggestions Module

**Endpoints:**
- GET /suggestions?accountId=&status=&type=
- POST /suggestions/:id/apply — execute the suggested action
- POST /suggestions/:id/dismiss — dismiss with optional reason

**Generation (runs after each insight sync):**
- Budget suggestions: campaigns with high ROAS but low budget
- Audience suggestions: adsets with narrow reach but good conversion
- Creative suggestions: ads with high frequency + declining CTR
- Health suggestions: overspending, no conversions, broken tracking

### 9. Notifications Module

**Endpoints:**
- GET /notifications?unreadOnly=&cursor=&limit=
- PATCH /notifications/:id/read
- POST /notifications/read-all
- GET /notifications/preferences
- PATCH /notifications/preferences
- GET /notifications/stream — SSE (Server-Sent Events) endpoint for real-time notification delivery. Authenticated via JWT (passed as `?token=` query param since EventSource doesn't support Authorization headers). Connection stays open; server pushes `event: notification\ndata: {JSON}\n\n` for each new notification. Heartbeat `event: ping\ndata: {}\n\n` every 30s to keep the connection alive. Client should implement auto-reconnect with `Last-Event-ID` header for missed events. Server uses Redis Pub/Sub channel `notifications:{userId}` — when a notification is created anywhere (worker, API), it publishes to this channel; the SSE handler subscribes and forwards to the client. Max 1 SSE connection per user (new connection closes previous).

**Delivery:**
- In-app: stored in DB, pushed to client via SSE stream (with polling fallback for environments where SSE is blocked)
- Email: queued via notifications BullMQ queue, sent via Resend
- Digest mode: batch autopilot actions into daily/weekly email summary

### 10. Billing Module

**Endpoints:**
- GET /billing/subscription — current plan
- POST /billing/checkout — create Stripe checkout session
- POST /billing/portal — create Stripe billing portal session
- GET /billing/invoices?cursor=&limit=
- GET /billing/usage — current period usage

**Stripe webhooks:** checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted

**Plans:**

| Feature | Starter (₺999/mo) | Pro (₺2,499/mo) | Agency (₺5,999/mo) |
|---------|-------------------|-----------------|-------------------|
| Ad accounts | 2 | 10 | Unlimited |
| Autopilot | Basic (pause only) | Full | Full + custom rules |
| API access | No | 300 req/min | 1000 req/min |
| Team members | 2 | 10 | Unlimited |
| CAPI | No | Yes | Yes |
| Reports | Basic | Advanced + PDF | White-label |
| Support | Email | Priority | Dedicated |

### 11. Admin Module

**Endpoints (AdminGuard — separate admin role):**
- GET /admin/stats — MRR, ARR, churn, active users, active workspaces
- GET /admin/users?search=&cursor=&limit=
- GET /admin/users/:id — full user detail + workspaces
- POST /admin/users/:id/suspend
- POST /admin/users/:id/impersonate — returns a short-lived access token (1 hour max, non-renewable) to act as that user. The JWT payload includes `impersonatedBy: adminUserId` to distinguish impersonated sessions in audit logs. Impersonated sessions are blocked from: DELETE operations, password/email changes, billing mutations, API key creation/deletion, and workspace deletion. Every action during impersonation is logged to AuditLog with source=ADMIN_IMPERSONATE. Impersonation sessions appear in the admin dashboard with start time and actions taken.
- GET /admin/workspaces?search=&plan=
- GET /admin/subscriptions?plan=&status=&cursor=&limit= — list all subscriptions with MRR contribution
- GET /admin/invoices?status=&from=&to=&cursor=&limit= — list all Stripe invoices across workspaces
- GET /admin/audit?userId=&workspaceId=&action=&source=&from=&to=&cursor=&limit= — query audit logs with filters
- GET /admin/settings — platform-level settings (maintenance mode, feature flags, default plan limits)
- PATCH /admin/settings — update platform settings
- GET /admin/system-health — queue depths, sync lag, Meta API error rate, DB connection count, DLQ sizes, migration status

### 12. Public API Module

**Route prefix:** /api/v1/

All endpoints mirror internal capabilities, authenticated via ApiKeyGuard.

**Endpoints:**
- GET /api/v1/ad-accounts
- GET /api/v1/ad-accounts/:id
- GET /api/v1/ad-accounts/:id/health
- GET /api/v1/campaigns?accountId=&status=&cursor=&limit=
- GET /api/v1/campaigns/:id
- POST /api/v1/campaigns
- PATCH /api/v1/campaigns/:id
- POST /api/v1/campaigns/:id/pause
- POST /api/v1/campaigns/:id/resume
- GET /api/v1/adsets?campaignId=&cursor=&limit=
- PATCH /api/v1/adsets/:id
- GET /api/v1/ads?adsetId=&cursor=&limit=
- PATCH /api/v1/ads/:id
- GET /api/v1/insights?entityType=&entityId=&from=&to=&breakdowns=
- GET /api/v1/autopilot/actions?accountId=&status=
- POST /api/v1/autopilot/actions/:id/approve
- POST /api/v1/autopilot/actions/:id/cancel
- PATCH /api/v1/autopilot/settings/:accountId
- POST /api/v1/webhooks — register webhook URL + events
- GET /api/v1/webhooks
- DELETE /api/v1/webhooks/:id

**Rate limits:** Per API key, configurable per plan. Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset.

**Error format:**
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Retry after 45 seconds.",
    "retryAfter": 45
  }
}
```

**Pagination:** Cursor-based. Response includes `{ data: [...], cursor: "abc123", hasMore: true }`.

**Idempotency:** POST/PATCH accept `Idempotency-Key` header. Duplicate requests within 24h return cached response.

### 13. Webhooks Module (inbound)

**Meta webhooks:**
- Ad account changes (status, spend alerts)
- Leads from Lead Ads
- Signature verification: X-Hub-Signature-256

**Stripe webhooks:**
- Signature verification: stripe.webhooks.constructEvent
- Handled events: checkout.session.completed, invoice.*, customer.subscription.*

### 14. Reports Module

**Endpoints:**
- POST /reports — create report config (body: name, type: PERFORMANCE | SPEND | COMPARISON | CUSTOM, accountIds[], dateRange, schedule?: { cron, format: PDF | CSV | XLSX }, config: JSONB)
- GET /reports?accountId=&type=&cursor=&limit= — list saved reports
- GET /reports/:id — get report detail (config + generation history)
- PATCH /reports/:id — update config or schedule
- DELETE /reports/:id — delete report and associated generated files
- POST /reports/:id/generate — trigger on-demand generation (queues job, returns 202 with jobId)
- GET /reports/:id/status — check generation status (QUEUED | PROCESSING | READY | FAILED)
- GET /reports/:id/download — download generated file (returns signed URL, valid 1hr)

**Worker (reports queue):**
- Max concurrency: 3 (report generation is CPU/memory-intensive — PDF rendering, large queries)
- Retry: 2 attempts with exponential backoff (1min, 5min)
- DLQ: `reports:dead` — admin dashboard surfaces failures
- Generation steps: run aggregation queries → build data tables → render to format (PDF via Puppeteer, CSV/XLSX via streaming writer) → upload to object storage (S3-compatible) → update Report row with downloadUrl + generatedAt
- Scheduled reports: BullMQ repeatable jobs created from Report.schedule.cron. On workspace plan downgrade, scheduled reports exceeding new plan limits are paused (not deleted).

### 15. Support Module

**Endpoints:**
- POST /support/tickets — create ticket (body: subject, description, category: BILLING | TECHNICAL | META_CONNECTION | AUTOPILOT | OTHER, priority: LOW | MEDIUM | HIGH)
- GET /support/tickets?status=&cursor=&limit= — list user's tickets in current workspace
- GET /support/tickets/:id — get ticket detail with messages
- POST /support/tickets/:id/messages — add message to ticket (body: content, attachments?: string[])
- PATCH /support/tickets/:id/close — close ticket with optional resolution note

**Admin endpoints:**
- GET /admin/support/tickets?status=&priority=&assignedTo=&cursor=&limit= — all tickets across workspaces
- PATCH /admin/support/tickets/:id — update status (OPEN | IN_PROGRESS | WAITING | RESOLVED | CLOSED), assignedTo, priority
- POST /admin/support/tickets/:id/messages — admin reply (visible to user)
- POST /admin/support/tickets/:id/internal-notes — internal note (not visible to user)

### 16. Compliance Module (KVKK)

**Endpoints:**
- POST /me/export-data — request full data export. Queues async job that collects all user data (profile, workspace memberships, campaigns, actions, audit logs) into a downloadable archive. Returns 202 with jobId. User is emailed when export is ready. Export link valid for 48hrs.
- POST /me/delete-account — request account deletion. Initiates 30-day grace period. During grace: account is suspended (cannot login, API keys revoked, autopilot paused). After grace: all PII is permanently deleted, anonymized records retained for aggregate analytics. Workspace ownership must be transferred first (400 error if user is sole OWNER of any workspace).
- GET /me/consent — current consent grants (marketing emails, analytics tracking, Meta data processing)
- PATCH /me/consent — update consent preferences. Changes logged to AuditLog.

**Data model addition:**
- Consent fields on User table: `consentMarketing (boolean, default: false)`, `consentAnalytics (boolean, default: true)`, `consentMetaProcessing (boolean, default: true — required for service)`, `consentUpdatedAt (timestamp)`
- `DataExportRequest` table: id, userId, status (QUEUED | PROCESSING | READY | EXPIRED), downloadUrl, expiresAt, createdAt
- `AccountDeletionRequest` table: id, userId, reason (text, nullable), scheduledDeletionAt (createdAt + 30d), status (PENDING | CANCELLED | COMPLETED), createdAt

### 17. Workspace & Account Deletion

**Workspace deletion flow:**
1. Only OWNER can delete workspace. Requires confirmation (re-enter password).
2. Pre-checks: no active Stripe subscription (must cancel first → 400), no pending autopilot actions.
3. Soft-delete: workspace marked as DELETED, all API keys revoked, all Meta connections disconnected, autopilot stopped.
4. 14-day grace period: workspace can be restored via POST /workspaces/restore (OWNER only).
5. After grace: hard-delete all workspace data (campaigns, insights, rules, reports, audit logs). Meta data remains on Meta's side.

**Endpoints:**
- POST /workspaces/current/delete — initiate deletion (body: password confirmation)
- POST /workspaces/current/restore — cancel deletion during grace period
- POST /workspaces/current/transfer-ownership — transfer OWNER role to another ADMIN (body: newOwnerId). Required before account deletion if user owns multiple workspaces.

---

### Role-Permission Matrix

| Endpoint Group | VIEWER | MEMBER | ADMIN | OWNER |
|---------------|--------|--------|-------|-------|
| View campaigns, insights, reports | ✅ | ✅ | ✅ | ✅ |
| Create/edit campaigns, ad sets, ads | ❌ | ✅ | ✅ | ✅ |
| Approve/cancel autopilot actions | ❌ | ✅ | ✅ | ✅ |
| Configure autopilot settings & rules | ❌ | ❌ | ✅ | ✅ |
| Manage Meta connections | ❌ | ❌ | ✅ | ✅ |
| Create/manage CAPI pixels | ❌ | ❌ | ✅ | ✅ |
| Invite/remove members | ❌ | ❌ | ✅ | ✅ |
| Change member roles | ❌ | ❌ | ✅ (cannot promote to OWNER) | ✅ |
| Manage API keys | ❌ | ❌ | ✅ | ✅ |
| Billing & subscription | ❌ | ❌ | ❌ | ✅ |
| Workspace settings | ❌ | ❌ | ✅ (name, preferences) | ✅ (all) |
| Delete workspace | ❌ | ❌ | ❌ | ✅ |
| Transfer ownership | ❌ | ❌ | ❌ | ✅ |
| Create support tickets | ✅ | ✅ | ✅ | ✅ |
| Create/schedule reports | ❌ | ✅ | ✅ | ✅ |

**Plan-gated features (via @PlanLimit decorator):**

| Feature | Starter | Pro | Agency |
|---------|---------|-----|--------|
| Ad accounts | 2 | 10 | Unlimited |
| Team members | 2 | 10 | Unlimited |
| Autopilot | Pause only | Full suite | Full + custom rules |
| CAPI pixels | ❌ | ✅ | ✅ |
| Public API access | ❌ | ✅ (300/min) | ✅ (1000/min) |
| Scheduled reports | ❌ | 5 | Unlimited |
| Report formats | CSV only | CSV + PDF | CSV + PDF + XLSX (white-label) |
| Webhooks | ❌ | 5 | Unlimited |
| Priority support | ❌ | ✅ | ✅ (dedicated) |

### Worker Summary (all BullMQ queues)

| Queue | Interval | Concurrency | Retry | DLQ | Purpose |
|-------|----------|-------------|-------|-----|---------|
| meta-sync | 15min/account | 10 | 3x (30s, 2m, 10m) | meta-sync:dead | Pull campaigns + insights from Meta |
| autopilot | 30min/account | 5 | 3x (1m, 5m, 30m) | autopilot:dead | Evaluate & execute autopilot rules |
| capi-forward | Real-time | 10 | 3x exponential | capi-forward:dead | Batch forward CAPI events to Meta |
| reports | On-demand + cron | 3 | 2x (1m, 5m) | reports:dead | Generate PDF/CSV/XLSX reports |
| notifications | Real-time | 5 | 3x (30s, 1m, 5m) | notifications:dead | Send email notifications via Resend |
| webhook-delivery | On-demand | 5 | 3x (1m, 5m, 30m) | webhook-delivery:dead | Deliver outbound webhooks to subscriber URLs |

### Pagination & Defaults

All cursor-paginated endpoints use these defaults unless specified otherwise:
- Default `limit`: 25
- Maximum `limit`: 100
- Omitted `limit` → defaults to 25
- `limit` exceeding 100 → clamped to 100 (no error)
- Response shape: `{ data: T[], cursor: string | null, hasMore: boolean }`

---

## Frontend Rebuild

### Mental Model

The dashboard is an **activity feed from your autonomous ad manager**, not a chart gallery. The primary question it answers: "What did MegVax do for me today, and is anything waiting for my approval?"

### Page Structure

```
/                           Landing page (marketing)
/pricing                    Pricing with plan comparison
/about, /contact, /book     Marketing pages
/login, /signup             Auth flows
/forgot-password, /reset-password, /verify-email

/app/onboarding             First-time wizard (required)
  Step 1: Create workspace (name, industry)
  Step 2: Connect Meta account (OAuth)
  Step 3: Select ad accounts
  Step 4: Choose autopilot level (conservative/balanced/aggressive)
  Step 5: Done — redirect to command center

/app/dashboard              Command Center (primary view)
  - Account health bar
  - Autopilot activity feed
  - Pending approvals sidebar
  - Key metrics sparklines

/app/campaigns              Campaign tree view (campaign → adset → ad)
/app/campaigns/:id          Campaign detail + adsets + ads
/app/campaigns/create       Campaign creation wizard

/app/autopilot              Autopilot settings + action history
/app/autopilot/rules        Custom automation rules

/app/insights               Analytics with breakdowns, date ranges, comparisons
/app/insights/reports       Scheduled + on-demand reports

/app/capi                   CAPI pixel management + health dashboard

/app/suggestions            AI suggestions feed

/app/activity               Full activity log (autopilot + manual + team)

/app/accounts               Connected Meta ad accounts

/app/workspace/members      Team management
/app/workspace/billing      Subscription, invoices, payment
/app/workspace/api-keys     Public API key management
/app/workspace/settings     Workspace preferences

/app/settings               User profile, password, notification preferences
/app/support                Support ticket form

/app/notifications          Full notification history

/admin/overview             Platform metrics (MRR, users, churn)
/admin/users                User management
/admin/workspaces           Workspace management
/admin/subscriptions        Subscription management
/admin/invoices             Invoice management
/admin/system-health        Queue depths, sync lag, error rates
/admin/audit                Global audit log
/admin/settings             System settings
```

### UX Principles (Fool-Proof)

**Every action has feedback:**
- Button click → disabled + spinner → success toast (with undo where applicable) OR error toast with retry
- No silent failures. If an API call fails, the user sees a clear error with what went wrong.
- Optimistic updates with rollback: UI updates instantly, reverts if API fails.

**Destructive actions require confirmation:**
- Delete: modal with entity name + impact summary
- Budget changes >20%: modal showing current vs new with estimated impact
- Turning off autopilot: modal explaining what will stop

**Empty states:**
- Every list/table has an empty state with illustration + explanation + CTA
- "No campaigns found" → "Connect your Meta account to sync campaigns" [Connect Account]
- "No autopilot actions yet" → "Enable autopilot to start optimizing automatically" [Enable]

**Loading states:**
- Content-shaped skeleton placeholders (not spinners) for all data-dependent sections
- Staggered skeleton animation (shimmer left to right)
- Skeleton matches the exact layout of loaded content

**Error handling:**
- Error boundaries per section — if insights panel fails, campaigns panel still works
- Error card with: what failed, retry button, "Contact support" link
- Global error banner for API unreachable / auth expired
- Form errors: inline under each field, scroll to first error, shake animation on submit

**Responsive:**
- Mobile: sidebar collapses to bottom nav (5 key routes)
- Tablet: sidebar collapses to icons-only, expands on hover
- Desktop: full sidebar

### Interaction & Animation Layer

**Page transitions:**
- Route change: content area fade out (100ms) → fade in (200ms) with subtle Y translate
- Framer Motion `AnimatePresence` + `motion.div` with `layout` prop

**List animations:**
- New items: slide in from top with stagger (50ms between items)
- Removed items: fade out + collapse height
- Reorder: layout animation (smooth position swap)

**Metric animations:**
- Numbers: count up/down animation (500ms ease-out) when value changes
- Trend arrows: rotate + color transition
- Sparklines: draw animation on first render (SVG path dashoffset)

**Status changes:**
- Color transitions: 300ms ease (green ↔ yellow ↔ red)
- Pulse animation on status dot when transitioning
- Campaign row highlight flash when autopilot acts on it

**Micro-interactions:**
- Button press: subtle scale down (0.98) + release
- Switch toggle: spring animation with bounce
- Checkbox: checkmark draws in (SVG stroke animation)
- Toast: slide in from top-right, auto-dismiss with progress bar, pause on hover
- Hover states: all interactive elements have visible hover feedback (background color shift)

**Command palette (Cmd/Ctrl+K):**
- Full-screen overlay with search
- Search: campaigns by name, pages, actions ("pause", "create campaign")
- Recent items + keyboard navigation
- Framer Motion: scale from 0.95 + fade in

**Notification center:**
- Bell icon with unread count badge (animate badge count change)
- Dropdown: grouped by time, each item has icon + text + timestamp + action
- Mark all read
- Slide-in animation from right

### i18n

- Turkish is the default language
- All currency: ₺ symbol, Turkish number format (1.234,56 not 1,234.56)
- All dates: Turkish locale (23 Mart 2026 Pazartesi)
- Namespace-based translation files (auth.json, dashboard.json, campaigns.json, etc.)
- next-intl for server + client components

---

## Public API Design

**Base:** https://api.megvax.com/v1/

**Auth:** `Authorization: Bearer mvx_live_...`

**Conventions:**
- Cursor-based pagination: `?cursor=abc&limit=25` → `{ data, cursor, hasMore }`
- Consistent error format: `{ error: { code, message, retryAfter? } }`
- Rate limit headers on every response
- Idempotency-Key header on POST/PATCH
- ISO 8601 dates everywhere
- Monetary values: **Database** stores `DECIMAL(12,4)` in major units (e.g., `149.9900` TRY). **Internal API** (dashboard) returns major units as decimal strings (e.g., `"149.99"`). **Public API** (`/api/v1/`) returns minor units as integers (e.g., `14999` kuruş for TRY, `14999` cents for USD) to avoid floating-point ambiguity — consistent with Stripe convention. The `currency` field always accompanies monetary values. Conversion happens in the PublicApiSerializer layer.

**Webhook events (outbound):**
- autopilot.action.executed
- autopilot.action.pending
- campaign.status_changed
- adset.status_changed
- ad.status_changed
- insights.daily_ready
- account.health_changed

**Webhook delivery:**
- HMAC-SHA256 signature in `X-MegVax-Signature` header
- 3 retry attempts (exponential backoff: 1min, 5min, 30min)
- Webhook logs visible in dashboard

**Documentation:**
- Auto-generated OpenAPI 3.1 spec from NestJS Swagger decorators
- Hosted at megvax.com/docs/api (static site from spec)

---

## Security

**Encryption:**
- Meta access tokens: AES-256-GCM, key from ENCRYPTION_KEY env var
- API keys: stored as SHA-256 hash (deterministic, enables O(1) lookup by hash; plaintext shown once at creation, never stored)
- Passwords: bcrypt (12 rounds)

**Authentication:**
- Access tokens: RS256-signed JWT, 15min expiry
- Refresh tokens: 7 day expiry, rotated on use, stored hashed
- API keys: Bearer token, scoped per workspace

**Authorization:**
- Workspace-scoped: every query includes workspaceId
- Role-based: OWNER > ADMIN > MEMBER > VIEWER
- API key scopes: granular per resource (campaigns:read, campaigns:write, etc.)

**Input validation:**
- class-validator + class-transformer on every DTO
- Prisma parameterized queries (no raw SQL)
- DOMPurify on any user-provided HTML/rich text

**Rate limiting:**
- Auth endpoints: 5/15min per IP (express-rate-limit)
- Dashboard API: 100/min per user
- Public API: per plan per API key — PRO: 300/min, AGENCY: 1000/min (Starter has no Public API access; Starter dashboard API uses the 100/min user limit above)

**Headers (Vercel + NestJS):**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Content-Security-Policy: appropriate policy

**Compliance (KVKK — Turkish GDPR):**
- Data export: POST /me/export-data (see Compliance Module, section 16)
- Account deletion: POST /me/delete-account with 30-day grace period (see Compliance Module, section 16)
- Consent tracking: GET/PATCH /me/consent with AuditLog trail
- Audit log on every write operation (source: USER | META_SYNC | AUTOPILOT | SYSTEM | ADMIN_IMPERSONATE)
- 90-day retention on audit logs, configurable per workspace

---

## FeedCraft Integration (Future)

FeedCraft is a separate product sharing MegVax's workspace and auth infrastructure.

**Shared resources:**
- Same User and Workspace tables
- Same MetaConnection (FeedCraft uses Catalog API, MegVax uses Marketing API)
- Same Subscription (FeedCraft as add-on tier or bundled)
- Same auth tokens (JWT works across both)

**Separate resources:**
- FeedCraft tables prefixed `fc_` in same database
- Separate NestJS service on Railway
- Separate frontend route group or app

**Integration points:**
- FeedCraft generated creatives → available in MegVax ad creative library
- MegVax campaign insights → inform FeedCraft which product creatives perform best
- Unified notification system

FeedCraft will receive its own full spec after MegVax is functional.

---

## Infrastructure

**CI/CD (GitHub Actions):**
```
Push to main →
  ├── Frontend: lint → test → build → Vercel deploy
  └── Backend: lint → test → prisma migrate deploy → build → Railway deploy
  │                              │
  │                    Runs `npx prisma migrate deploy` against
  │                    production Neon DB (uses DATABASE_URL secret).
  │                    Runs BEFORE the new code deploys so the DB
  │                    schema is ready when the new API starts.
  │                    If migration fails → pipeline stops, no deploy.

Push to PR branch →
  ├── Frontend: Vercel preview URL
  └── Backend: lint → test → prisma migrate deploy (Neon branch DB) → Railway preview
  │                              │
  │                    PR pipelines use Neon branch databases (created
  │                    via `neonctl branches create --name pr-{number}`).
  │                    Branch DB is deleted when PR is closed/merged.
```

**Migration safety rules:**
- All migrations are forward-only (`prisma migrate deploy`, never `prisma migrate dev` in CI)
- Destructive migrations (drop column/table) require a two-phase deploy: first deploy code that stops reading the column, then deploy the migration that drops it
- Migration status is visible in the admin dashboard via GET /admin/system-health

**Environment Variables (Backend):**
```
DATABASE_URL=postgresql://...@....neon.tech/megvax
REDIS_URL=rediss://...@....upstash.io:6379
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...
ENCRYPTION_KEY=... (32-byte hex)
META_APP_ID=...
META_APP_SECRET=...
META_REDIRECT_URI=https://api.megvax.com/meta/callback
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
SENTRY_DSN=https://...@sentry.io/...
ADMIN_EMAIL=admin@megvax.com
NODE_ENV=production
PORT=4000
```

**Monitoring:**
- Sentry: error tracking + performance for both frontend and backend
- Railway metrics: CPU, memory, request count
- Custom health endpoint: /health (DB connection, Redis connection, Meta API reachability)
- Upstash Redis dashboard: queue depths, processing rates

---

## Implementation Phases

### Phase 1: Foundation (Backend + Auth + Meta Read)
- NestJS project scaffold with module structure
- Prisma schema + Neon database
- Auth module (register, login, JWT, refresh tokens)
- Workspace module (CRUD, members, invitations)
- Meta OAuth + connection management
- Meta sync worker (pull campaigns, adsets, ads, insights)
- Campaigns/AdSets/Ads read endpoints
- Insights endpoints with date range queries
- Frontend: connect to real API, onboarding wizard, command center

### Phase 2: Write Operations + Autopilot
- Campaign/AdSet/Ad create, update, pause, resume, duplicate
- Autopilot module (config, evaluators, action execution)
- AutopilotAction feed in dashboard
- Notification system (in-app + email)
- Suggestions module
- Frontend: autopilot settings, action feed, notifications, approval flow

### Phase 3: CAPI + Billing + Polish
- CAPI pixel management + event forwarding
- Stripe billing integration (checkout, portal, webhooks)
- Admin panel wired to real data
- Report generation (PDF/CSV)
- Frontend: CAPI dashboard, billing pages, admin panel, command palette

### Phase 4: Public API + Production
- Public API module with API key auth
- Rate limiting per plan
- OpenAPI docs generation
- Outbound webhook system
- KVKK compliance endpoints
- Performance optimization (query optimization, caching)
- Security audit
- Production deployment + monitoring

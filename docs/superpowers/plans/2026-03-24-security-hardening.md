# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical security vulnerabilities — CSRF, token hashing, input validation, dev credential removal, and sanitization.

**Architecture:** Six independent fixes applied to backend (NestJS) and frontend (Next.js). Each task is self-contained and can be committed independently. No schema migrations needed — token hashing uses existing fields with hashed values instead of plaintext.

**Tech Stack:** NestJS, Prisma, crypto (Node.js), class-validator, DOMPurify, Next.js

---

### Task 1: Upgrade CSRF to Double-Submit Cookie Pattern

The current CSRF middleware only checks for `X-Requested-With: XMLHttpRequest` header which provides no real protection. Replace with a proper double-submit cookie pattern.

**Files:**
- Modify: `megvax-api/src/common/middleware/csrf.middleware.ts`
- Modify: `megvax-api/src/auth/auth.controller.ts` (set CSRF cookie on login/refresh)
- Modify: `lib/api.ts` (send CSRF token from cookie in header)

- [ ] **Step 1: Rewrite CSRF middleware with double-submit cookie**

```typescript
// megvax-api/src/common/middleware/csrf.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

const MUTATING_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];
const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

// Endpoints that don't need CSRF (they issue the token)
const CSRF_EXEMPT = ['/auth/login', '/auth/register', '/auth/refresh'];

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Ensure CSRF cookie exists on every response
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false, // JS must read it
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
    }

    if (MUTATING_METHODS.includes(req.method)) {
      // Must have X-Requested-With (SOP check)
      if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
        throw new ForbiddenException('Missing X-Requested-With header');
      }

      // Exempt auth endpoints that issue tokens
      if (CSRF_EXEMPT.some((p) => req.path.startsWith(p))) {
        return next();
      }

      // Double-submit: header token must match cookie token
      const cookieToken = req.cookies?.[CSRF_COOKIE];
      const headerToken = req.headers[CSRF_HEADER];
      if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        throw new ForbiddenException('CSRF token mismatch');
      }
    }

    next();
  }
}
```

- [ ] **Step 2: Update frontend api.ts to send CSRF token**

In `lib/api.ts`, read the `csrf_token` cookie and include it as `X-CSRF-Token` header on mutating requests:

```typescript
// Add this helper function before the api() function
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// Inside the api() function, after building headers object:
// Add CSRF token for mutating requests
if (method !== 'GET') {
  const csrfToken = getCookie('csrf_token');
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
}
```

- [ ] **Step 3: Test manually**

1. Open browser devtools > Application > Cookies
2. Login — verify `csrf_token` cookie appears
3. Click around dashboard — verify API calls include `X-CSRF-Token` header
4. Verify GET requests work without the header
5. Verify POST requests fail without the header (test with curl)

Run: `curl -s -X POST http://localhost:4000/campaigns -H "Content-Type: application/json" -H "X-Requested-With: XMLHttpRequest" -H "Authorization: Bearer <token>" -d '{}' | python3 -m json.tool`
Expected: `403 CSRF token mismatch`

- [ ] **Step 4: Commit**

```bash
git add megvax-api/src/common/middleware/csrf.middleware.ts lib/api.ts
git commit -m "security: upgrade CSRF to double-submit cookie pattern"
```

---

### Task 2: Hash Password Reset and Email Verification Tokens

Currently `emailVerifyToken` and `passwordResetToken` are stored as plaintext hex in the database. If the DB is compromised, attackers can verify any email or reset any password. Store SHA-256 hashes instead.

**Files:**
- Modify: `megvax-api/src/auth/auth.service.ts`

- [ ] **Step 1: Add hash helper**

At the top of `auth.service.ts`, add a helper (near the existing crypto import):

```typescript
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
```

- [ ] **Step 2: Hash on write — register (emailVerifyToken)**

In `register()` method (~line 42), change:
```typescript
// Before:
emailVerifyToken,
// After:
emailVerifyToken: hashToken(emailVerifyToken),
```

The raw `emailVerifyToken` is still sent via email (line 74). Only the hash is stored.

- [ ] **Step 3: Hash on write — forgotPassword (passwordResetToken)**

In `forgotPassword()` method (~line 155), change:
```typescript
// Before:
passwordResetToken: token,
// After:
passwordResetToken: hashToken(token),
```

The raw `token` is still sent via email. Only the hash is stored.

- [ ] **Step 4: Hash on read — verifyEmail**

In `verifyEmail()` method (~line 134), change:
```typescript
// Before:
where: { emailVerifyToken: token },
// After:
where: { emailVerifyToken: hashToken(token) },
```

- [ ] **Step 5: Hash on read — resetPassword**

In `resetPassword()` method, change the query to hash the incoming token before lookup:
```typescript
// Before:
where: { passwordResetToken: token, ... },
// After:
where: { passwordResetToken: hashToken(token), ... },
```

- [ ] **Step 6: Test the auth flow**

Run: `curl -s -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -H "X-Requested-With: XMLHttpRequest" -d '{"email":"test@test.com","password":"testtest123","fullName":"Test User"}'`
Expected: 201 with accessToken

Check DB: `psql postgresql://megvax:megvax@localhost:5432/megvax -c "SELECT email, length(\"emailVerifyToken\") FROM \"User\" WHERE email='test@test.com'"`
Expected: emailVerifyToken should be 64 chars (SHA-256 hex)

- [ ] **Step 7: Commit**

```bash
git add megvax-api/src/auth/auth.service.ts
git commit -m "security: hash email verification and password reset tokens"
```

---

### Task 3: Remove Hardcoded Dev Credentials from Frontend

The `devLogin` function contains hardcoded admin email/password. Replace with environment variable approach.

**Files:**
- Modify: `lib/auth-context.tsx`
- Modify: `.env.local`

- [ ] **Step 1: Move credentials to env vars**

Add to `.env.local`:
```
NEXT_PUBLIC_DEV_EMAIL=admin@megvax.com
NEXT_PUBLIC_DEV_PASSWORD=admin123456
```

- [ ] **Step 2: Update devLogin to use env vars**

In `lib/auth-context.tsx`, replace the `devLogin` function:

```typescript
const devLogin = useCallback(async () => {
  const email = process.env.NEXT_PUBLIC_DEV_EMAIL;
  const password = process.env.NEXT_PUBLIC_DEV_PASSWORD;
  if (!email || !password) {
    throw new Error('Dev credentials not configured in .env.local');
  }
  const data = await api<{ accessToken: string; user: User }>('/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });
  setAccessToken(data.accessToken);
  setState({ user: data.user, isLoading: false, isAuthenticated: true });
}, []);
```

- [ ] **Step 3: Verify dev login still works**

1. Refresh http://localhost:3000/login
2. Click [DEV] Skip to Dashboard
3. Should login successfully

- [ ] **Step 4: Commit**

```bash
git add lib/auth-context.tsx .env.local
git commit -m "security: move dev credentials to env vars"
```

---

### Task 4: Validate DTO Objects (targeting, placements, creativeSpec, settings)

Currently `targeting`, `placements`, `creativeSpec`, and workspace `settings` accept arbitrary objects. Add validation to restrict the shape.

**Files:**
- Modify: `megvax-api/src/campaigns/dto/create-adset.dto.ts`
- Modify: `megvax-api/src/campaigns/dto/create-ad.dto.ts`
- Modify: `megvax-api/src/workspace/dto/update-workspace.dto.ts`

- [ ] **Step 1: Add targeting validation DTO**

Create `megvax-api/src/campaigns/dto/targeting.dto.ts`:

```typescript
import { IsOptional, IsNumber, IsArray, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class TargetingDto {
  @IsOptional() @IsNumber() @Min(13) @Max(65)
  age_min?: number;

  @IsOptional() @IsNumber() @Min(13) @Max(65)
  age_max?: number;

  @IsOptional() @IsArray()
  genders?: number[];

  @IsOptional() @IsObject()
  geo_locations?: Record<string, string[]>;

  @IsOptional() @IsArray()
  interests?: { id: string; name: string }[];

  @IsOptional() @IsArray()
  excluded_interests?: { id: string; name: string }[];

  @IsOptional() @IsArray()
  custom_audiences?: { id: string; name: string }[];
}
```

- [ ] **Step 2: Update create-adset.dto.ts**

```typescript
import { IsString, IsOptional, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TargetingDto } from './targeting.dto';

export class CreateAdSetDto {
  @IsString()
  accountId: string;

  @IsString()
  campaignId: string;

  @IsString()
  name: string;

  @IsOptional() @ValidateNested() @Type(() => TargetingDto)
  targeting?: TargetingDto;

  @IsOptional() @IsObject()
  placements?: { publisher_platforms?: string[]; facebook_positions?: string[]; instagram_positions?: string[] };

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

- [ ] **Step 3: Update create-ad.dto.ts**

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
  creativeSpec?: { creative_id?: string; object_story_spec?: Record<string, unknown> };
}
```

- [ ] **Step 4: Update workspace settings DTO**

```typescript
import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator';

class WorkspaceSettingsDto {
  @IsOptional() @IsString()
  timezone?: string;

  @IsOptional() @IsString() @IsIn(['TRY', 'USD', 'EUR', 'GBP'])
  currency?: string;
}

export class UpdateWorkspaceDto {
  @IsOptional() @IsString() @MaxLength(100)
  name?: string;

  @IsOptional()
  settings?: WorkspaceSettingsDto;
}
```

- [ ] **Step 5: Test validation rejects invalid input**

Run: `curl -s -X POST http://localhost:4000/adsets -H "Content-Type: application/json" -H "X-Requested-With: XMLHttpRequest" -H "Authorization: Bearer <token>" -d '{"accountId":"x","campaignId":"y","name":"z","targeting":{"age_min":-5}}' | python3 -m json.tool`
Expected: 400 Bad Request with validation error about age_min

- [ ] **Step 6: Commit**

```bash
git add megvax-api/src/campaigns/dto/ megvax-api/src/workspace/dto/
git commit -m "security: validate targeting, placements, creativeSpec, and settings DTOs"
```

---

### Task 5: Wire Sanitization Functions Into Frontend Rendering

`lib/security.ts` has DOMPurify integration but nothing uses it. Apply `sanitizeInput()` to user-generated content before rendering.

**Files:**
- Modify: `components/dashboard/CampaignTable.tsx` (campaign names)
- Modify: `components/dashboard/KpiCard.tsx` (metric labels)
- Modify: `components/layouts/Header.tsx` (account names)
- Modify: `lib/api.ts` (sanitize all API response strings)

- [ ] **Step 1: Add response sanitization interceptor in api.ts**

The safest approach: sanitize all string values in API responses at the gateway level. Add after `return res.json()` in `lib/api.ts`:

```typescript
// Add import at top:
import { sanitizeInput } from './security';

// Add this helper:
function sanitizeStrings<T>(obj: T): T {
  if (typeof obj === 'string') return sanitizeInput(obj) as T;
  if (Array.isArray(obj)) return obj.map(sanitizeStrings) as T;
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = sanitizeStrings(v);
    }
    return result as T;
  }
  return obj;
}

// In the api() function, replace `return res.json()` with:
const data = await res.json();
return sanitizeStrings(data);
```

- [ ] **Step 2: Test sanitization works**

1. Manually insert a campaign with XSS payload in the DB:
   `psql postgresql://megvax:megvax@localhost:5432/megvax -c "UPDATE \"Campaign\" SET name='<script>alert(1)</script>Test' WHERE id=(SELECT id FROM \"Campaign\" LIMIT 1)"`
2. Open the dashboard — campaign name should show as "Test" (script tag stripped)

- [ ] **Step 3: Remove dead CSRF functions from lib/security.ts**

Remove `generateCsrfToken()`, `storeCsrfToken()`, `getCsrfToken()` since CSRF is now handled by the backend cookie. Keep sanitization functions.

- [ ] **Step 4: Commit**

```bash
git add lib/api.ts lib/security.ts
git commit -m "security: sanitize all API response strings, remove dead CSRF client code"
```

---

### Task 6: Implement Plan Guard

The `PlanGuard` always returns `true`, meaning plan limits (STARTER/PRO/AGENCY) are never enforced.

**Files:**
- Modify: `megvax-api/src/common/guards/plan.guard.ts`
- Modify: `megvax-api/src/common/decorators/plan.decorator.ts` (create)

- [ ] **Step 1: Create plan decorator**

Create `megvax-api/src/common/decorators/plan.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

export const PLANS_KEY = 'requiredPlans';
export const RequirePlan = (...plans: string[]) => SetMetadata(PLANS_KEY, plans);
```

- [ ] **Step 2: Implement the plan guard**

```typescript
// megvax-api/src/common/guards/plan.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PLANS_KEY } from '../decorators/plan.decorator';

const PLAN_HIERARCHY: Record<string, number> = {
  STARTER: 0,
  PRO: 1,
  AGENCY: 2,
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlans = this.reflector.getAllAndOverride<string[]>(PLANS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No plan requirement on this route
    if (!requiredPlans || requiredPlans.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const workspaceId = request.user?.workspaceId;
    if (!workspaceId) throw new ForbiddenException('No workspace');

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { plan: true },
    });
    if (!workspace) throw new ForbiddenException('Workspace not found');

    const currentLevel = PLAN_HIERARCHY[workspace.plan] ?? 0;
    const requiredLevel = Math.min(...requiredPlans.map((p) => PLAN_HIERARCHY[p] ?? 0));

    if (currentLevel < requiredLevel) {
      throw new ForbiddenException(`This feature requires ${requiredPlans.join(' or ')} plan`);
    }

    return true;
  }
}
```

- [ ] **Step 3: Test the guard**

No controller annotations needed yet — the guard now works when `@RequirePlan('PRO')` is applied. Verify it doesn't break existing routes (returns true when no decorator is present).

Run: `curl -s http://localhost:4000/health`
Expected: `{"status":"ok",...}` (no regression)

- [ ] **Step 4: Commit**

```bash
git add megvax-api/src/common/guards/plan.guard.ts megvax-api/src/common/decorators/plan.decorator.ts
git commit -m "security: implement plan guard with tier hierarchy"
```

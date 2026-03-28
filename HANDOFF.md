# Handoff — MegVax Platform

## Last Session
- **Date:** 2026-03-29
- **Who:** Nalba
- **Summary:** Railway deployment prep — Dockerfile, railway.toml, JWT env var support.

## What's Done
- **JWT key loading fixed** — AuthService + JwtAuthGuard now support base64-encoded keys via `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` env vars. File path fallback (`JWT_PRIVATE_KEY_PATH`) still works for local dev.
- **Dockerfile created** (`megvax-api/Dockerfile`) — multi-stage Node 24 build, Prisma generate, `db push` on start.
- **railway.toml** — API service (Dockerfile) + frontend (Nixpacks/Next.js).
- **.env.example** updated with Railway instructions for both services.

## Git State
- **Branch:** `main`
- **All previous work merged** — landing, admin, auth, Phase 1+2 backend
- **Uncommitted:** Railway deployment files (Dockerfile, railway.toml, JWT fix, .env.example updates)

## Railway Deployment — Step by Step

### 1. Create Railway Project
```bash
cd /d/MegvaxV4-main
railway init         # creates project, follow prompts
```

### 2. Add Database & Redis
In Railway dashboard (or CLI):
- **Add PostgreSQL** → auto-provisions `DATABASE_URL`
- **Add Redis** → auto-provisions `REDIS_URL`

### 3. Create Two Services

**Service 1: megvax-api (Backend)**
- Source: GitHub repo `VelkinaStudio/Megvax`
- Root directory: `megvax-api`
- Railway detects the Dockerfile automatically

**Service 2: megvax-web (Frontend)**
- Source: same GitHub repo
- Root directory: `/` (repo root)
- Railway uses Nixpacks (auto-detects Next.js)

### 4. Generate JWT Keys (base64 for Railway)
```bash
# In git bash:
cat /d/MegvaxV4-main/megvax-api/keys/private.pem | base64 -w0
cat /d/MegvaxV4-main/megvax-api/keys/public.pem | base64 -w0
```
Set these as `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` in the megvax-api service variables.

### 5. Generate Encryption Key
```bash
openssl rand -hex 32
```
Set as `ENCRYPTION_KEY` in megvax-api.

### 6. Set Environment Variables

**megvax-api service:**
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway reference) |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` (Railway reference) |
| `JWT_PRIVATE_KEY` | base64 of private.pem (from step 4) |
| `JWT_PUBLIC_KEY` | base64 of public.pem (from step 4) |
| `JWT_ACCESS_EXPIRY` | `15m` |
| `JWT_REFRESH_EXPIRY` | `7d` |
| `ENCRYPTION_KEY` | from step 5 |
| `META_APP_ID` | (after Meta dev app setup) |
| `META_APP_SECRET` | (after Meta dev app setup) |
| `META_REDIRECT_URI` | `https://<api-domain>/meta/callback` |
| `RESEND_API_KEY` | (after Resend signup) |
| `FROM_EMAIL` | `noreply@megvax.com` |
| `ADMIN_EMAIL` | `admin@megvax.com` |
| `FRONTEND_URL` | `https://<frontend-domain>` |
| `PORT` | `4000` |
| `NODE_ENV` | `production` |

**megvax-web service:**
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://<api-domain>` |
| `NEXT_PUBLIC_DEMO_MODE` | `false` (once API is live) |
| `NEXT_PUBLIC_BASE_URL` | `https://<frontend-domain>` |

### 7. Deploy
Railway auto-deploys on push to `main`. Or manually:
```bash
railway up
```

### 8. Seed Database
After first deploy, run in Railway shell:
```bash
npx prisma db push --skip-generate
npx ts-node prisma/seed.ts
```

## What's NOT Done Yet
- **Meta Developer App** — Nalba needs to create at developers.facebook.com
- **Resend account** — Nalba needs to sign up + verify domain
- **Custom domain** — configure in Railway after deploy works
- **CSRF config** — may need adjustment for cross-origin API calls (frontend ≠ API domain)
- **Phase 3** — CAPI, Billing, Polish
- **Phase 4** — Public API, Production hardening

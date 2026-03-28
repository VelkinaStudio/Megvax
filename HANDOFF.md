# Handoff — MegVax Platform

## Last Session
- **Date:** 2026-03-29
- **Who:** Nalba
- **Summary:** Railway deployment complete — both services live, DB + Redis connected.

## What's Live
- **API:** https://megvax-api-production.up.railway.app (`/health` returns OK)
- **Web:** https://megvax-web-production.up.railway.app (Next.js 16.2.1)
- **Postgres:** Railway Docker, volume-backed, schema pushed
- **Redis:** Railway Docker, connected

## What Nalba Needs to Do

### 1. Seed the Database
Run in Railway dashboard → megvax-api → Shell:
```bash
npx ts-node prisma/seed.ts
```
This creates: admin@megvax.com / admin123456 + megvax-demo workspace

### 2. Create Meta Developer App
1. Go to developers.facebook.com
2. Create app → Business type → Marketing API
3. Get App ID + App Secret
4. Set OAuth redirect URI: `https://megvax-api-production.up.railway.app/meta/callback`
5. Update Railway env vars on megvax-api:
   - `META_APP_ID` = your app ID
   - `META_APP_SECRET` = your app secret
   - `META_REDIRECT_URI` = `https://megvax-api-production.up.railway.app/meta/callback`

### 3. Create Resend Account
1. Sign up at resend.com
2. Verify sending domain (megvax.com or noreply domain)
3. Get API key
4. Update `RESEND_API_KEY` on megvax-api in Railway

### 4. Connect Railway GitHub App (optional, for auto-deploy)
1. Railway dashboard → Project Settings → Connect GitHub
2. Authorize VelkinaStudio org
3. Then pushes to `main` auto-deploy both services

Without this, deploy manually:
```bash
cd /d/MegvaxV4-main
railway service megvax-web && railway up   # frontend
railway service megvax-api && railway up   # backend
```

## Git State
- **Branch:** `main` (5 commits ahead of previous session)
- **Key commits:**
  - `af8ac4a` fix: sync package-lock.json with eslint-config-next upgrade
  - `1347b0c` fix: Node engine >=20.9.0 + Prisma debian-openssl-3.0.x
  - `2de32de` fix: simplify railway.toml
  - `0f2f204` fix: NotificationsController JWT + Next.js 16.2.1
  - `4280269` feat: Railway deployment — Dockerfile, JWT env vars, CSRF fix

## Architecture Changes Made
- JWT keys load from base64 env vars (production) or file paths (local dev)
- CSRF middleware: cross-origin safe via X-Requested-With + CORS
- Refresh cookie: sameSite=none in production for cross-domain auth
- Prisma: binaryTargets includes debian-openssl-3.0.x for Railway
- Next.js: 16.0.7 → 16.2.1 (security fix required by Railway)

## What's NOT Done Yet
- **Database seed** — tables exist but empty, need to run seed
- **Meta Developer App** — META_APP_ID/SECRET are "placeholder"
- **Resend account** — RESEND_API_KEY is "placeholder"
- **Custom domain** — using .up.railway.app URLs for now
- **Phase 3** — CAPI, Billing, Polish
- **Phase 4** — Public API, Production hardening

// prisma/seed-meta.ts
// Pulls real campaign data from Meta Ads API into the local database.
// Usage: npx ts-node prisma/seed-meta.ts

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const META_API = 'https://graph.facebook.com/v25.0';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

// Max number of accounts to sync (picks the first N active ones)
const MAX_ACCOUNTS = parseInt(process.env.META_SYNC_MAX_ACCOUNTS || '5', 10);

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

async function metaGet(path: string): Promise<any> {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${META_API}${path}${sep}access_token=${ACCESS_TOKEN}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Meta API ${path}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

async function metaGetAll(path: string): Promise<any[]> {
  let all: any[] = [];
  let url = `${META_API}${path}${path.includes('?') ? '&' : '?'}limit=500&access_token=${ACCESS_TOKEN}`;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) break;
    const data = await res.json();
    all = all.concat(data.data || []);
    url = data.paging?.next || '';
  }
  return all;
}

async function main() {
  if (!ACCESS_TOKEN) {
    console.error('Set META_ACCESS_TOKEN env var');
    process.exit(1);
  }

  // Get admin user + workspace
  const admin = await prisma.user.findFirst({ where: { isAdmin: true } });
  if (!admin) { console.error('Run db:seed first'); process.exit(1); }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: admin.id },
    include: { workspace: true },
  });
  if (!membership) { console.error('No workspace found'); process.exit(1); }
  const workspaceId = membership.workspaceId;

  // Get Meta user info
  const me = await metaGet('/me');
  console.log(`Meta user: ${me.name} (${me.id})`);

  // Create/update MetaConnection with encrypted token
  const connection = await prisma.metaConnection.upsert({
    where: { workspaceId_metaUserId: { workspaceId, metaUserId: me.id } },
    update: { accessToken: encrypt(ACCESS_TOKEN), status: 'ACTIVE', tokenExpiresAt: new Date(Date.now() + 3600_000) },
    create: { workspaceId, metaUserId: me.id, accessToken: encrypt(ACCESS_TOKEN), tokenExpiresAt: new Date(Date.now() + 3600_000) },
  });
  console.log(`Connection: ${connection.id}`);

  // Auto-discover active ad accounts
  const allAccounts = await metaGetAll('/me/adaccounts?fields=id,name,currency,timezone_name,account_status');
  const activeAccounts = allAccounts
    .filter((a: any) => a.account_status === 1)
    .slice(0, MAX_ACCOUNTS);
  console.log(`Found ${allAccounts.length} ad accounts, syncing ${activeAccounts.length} active ones`);

  for (const acct of activeAccounts) {
    const metaAccountId = acct.id.replace('act_', '');
    console.log(`\n--- Syncing act_${metaAccountId} (${acct.name}) ---`);

    // Create/update AdAccount
    const adAccount = await prisma.adAccount.upsert({
      where: { workspaceId_metaAccountId: { workspaceId, metaAccountId } },
      update: { name: acct.name, lastSyncAt: new Date() },
      create: {
        metaConnectionId: connection.id,
        workspaceId,
        metaAccountId,
        name: acct.name,
        currency: acct.currency || 'TRY',
        timezone: acct.timezone_name || 'Europe/Istanbul',
      },
    });
    console.log(`  Account: ${acct.name}`);

    // Fetch campaigns
    const campaigns = await metaGetAll(
      `/act_${metaAccountId}/campaigns?fields=id,name,status,objective,buying_type,daily_budget,lifetime_budget,bid_strategy,special_ad_categories,start_time,stop_time`
    );
    console.log(`  Campaigns: ${campaigns.length}`);

    const campaignIdMap: Record<string, string> = {};
    for (const c of campaigns) {
      const campaign = await prisma.campaign.upsert({
        where: {
          id: (await prisma.campaign.findFirst({
            where: { adAccountId: adAccount.id, metaCampaignId: c.id },
          }))?.id || '00000000-0000-0000-0000-000000000000',
        },
        update: {
          name: c.name,
          status: c.status === 'ACTIVE' ? 'ACTIVE' : c.status === 'PAUSED' ? 'PAUSED' : 'ARCHIVED',
          objective: c.objective,
          buyingType: c.buying_type,
          dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
          lifetimeBudget: c.lifetime_budget ? parseFloat(c.lifetime_budget) / 100 : null,
          bidStrategy: c.bid_strategy,
          startTime: c.start_time ? new Date(c.start_time) : null,
          endTime: c.stop_time ? new Date(c.stop_time) : null,
          metaRaw: c,
          syncStatus: 'SYNCED',
          lastSyncAt: new Date(),
        },
        create: {
          adAccountId: adAccount.id,
          metaCampaignId: c.id,
          name: c.name,
          status: c.status === 'ACTIVE' ? 'ACTIVE' : c.status === 'PAUSED' ? 'PAUSED' : 'ARCHIVED',
          objective: c.objective,
          buyingType: c.buying_type,
          dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
          lifetimeBudget: c.lifetime_budget ? parseFloat(c.lifetime_budget) / 100 : null,
          bidStrategy: c.bid_strategy,
          specialAdCategories: c.special_ad_categories || [],
          startTime: c.start_time ? new Date(c.start_time) : null,
          endTime: c.stop_time ? new Date(c.stop_time) : null,
          metaRaw: c,
          syncStatus: 'SYNCED',
          lastSyncAt: new Date(),
        },
      });
      campaignIdMap[c.id] = campaign.id;
    }

    // Fetch ad sets
    const adSets = await metaGetAll(
      `/act_${metaAccountId}/adsets?fields=id,name,status,campaign_id,targeting,daily_budget,lifetime_budget,bid_amount,optimization_goal,billing_event,start_time,end_time`
    );
    console.log(`  Ad Sets: ${adSets.length}`);

    const adSetIdMap: Record<string, string> = {};
    for (const a of adSets) {
      const campaignId = campaignIdMap[a.campaign_id];
      if (!campaignId) continue; // skip orphans

      const adSet = await prisma.adSet.upsert({
        where: {
          id: (await prisma.adSet.findFirst({
            where: { adAccountId: adAccount.id, metaAdSetId: a.id },
          }))?.id || '00000000-0000-0000-0000-000000000000',
        },
        update: {
          name: a.name,
          status: a.status === 'ACTIVE' ? 'ACTIVE' : a.status === 'PAUSED' ? 'PAUSED' : 'ARCHIVED',
          targeting: a.targeting || null,
          dailyBudget: a.daily_budget ? parseFloat(a.daily_budget) / 100 : null,
          lifetimeBudget: a.lifetime_budget ? parseFloat(a.lifetime_budget) / 100 : null,
          bidAmount: a.bid_amount ? parseFloat(a.bid_amount) / 100 : null,
          optimizationGoal: a.optimization_goal,
          billingEvent: a.billing_event,
          scheduledStart: a.start_time ? new Date(a.start_time) : null,
          scheduledEnd: a.end_time ? new Date(a.end_time) : null,
          metaRaw: a,
          syncStatus: 'SYNCED',
        },
        create: {
          campaignId,
          adAccountId: adAccount.id,
          metaAdSetId: a.id,
          name: a.name,
          status: a.status === 'ACTIVE' ? 'ACTIVE' : a.status === 'PAUSED' ? 'PAUSED' : 'ARCHIVED',
          targeting: a.targeting || null,
          dailyBudget: a.daily_budget ? parseFloat(a.daily_budget) / 100 : null,
          lifetimeBudget: a.lifetime_budget ? parseFloat(a.lifetime_budget) / 100 : null,
          bidAmount: a.bid_amount ? parseFloat(a.bid_amount) / 100 : null,
          optimizationGoal: a.optimization_goal,
          billingEvent: a.billing_event,
          scheduledStart: a.start_time ? new Date(a.start_time) : null,
          scheduledEnd: a.end_time ? new Date(a.end_time) : null,
          metaRaw: a,
          syncStatus: 'SYNCED',
        },
      });
      adSetIdMap[a.id] = adSet.id;
    }

    // Fetch ads
    const ads = await metaGetAll(
      `/act_${metaAccountId}/ads?fields=id,name,status,adset_id,creative,preview_shareable_link`
    );
    console.log(`  Ads: ${ads.length}`);

    for (const ad of ads) {
      const adSetId = adSetIdMap[ad.adset_id];
      if (!adSetId) continue;

      await prisma.ad.upsert({
        where: {
          id: (await prisma.ad.findFirst({
            where: { adAccountId: adAccount.id, metaAdId: ad.id },
          }))?.id || '00000000-0000-0000-0000-000000000000',
        },
        update: {
          name: ad.name,
          status: ad.status === 'ACTIVE' ? 'ACTIVE' : ad.status === 'PAUSED' ? 'PAUSED' : 'ARCHIVED',
          creativeSpec: ad.creative || null,
          previewUrl: ad.preview_shareable_link || null,
          metaRaw: ad,
          syncStatus: 'SYNCED',
        },
        create: {
          adSetId,
          adAccountId: adAccount.id,
          metaAdId: ad.id,
          name: ad.name,
          status: ad.status === 'ACTIVE' ? 'ACTIVE' : ad.status === 'PAUSED' ? 'PAUSED' : 'ARCHIVED',
          creativeSpec: ad.creative || null,
          previewUrl: ad.preview_shareable_link || null,
          metaRaw: ad,
          syncStatus: 'SYNCED',
        },
      });
    }

    // Fetch insights (last 30 days, campaign level)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400_000);
    const dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
    const dateTo = today.toISOString().split('T')[0];

    try {
      const insights = await metaGetAll(
        `/act_${metaAccountId}/insights?fields=campaign_id,spend,impressions,reach,clicks,ctr,cpm,cpc,frequency&level=campaign&time_range={"since":"${dateFrom}","until":"${dateTo}"}&time_increment=1`
      );
      console.log(`  Insights: ${insights.length} daily records`);

      for (const row of insights) {
        const campaignDbId = campaignIdMap[row.campaign_id];
        if (!campaignDbId) continue;

        const date = new Date(row.date_start);
        await prisma.insightSnapshot.upsert({
          where: {
            adAccountId_entityType_entityId_date: {
              adAccountId: adAccount.id,
              entityType: 'CAMPAIGN',
              entityId: campaignDbId,
              date,
            },
          },
          update: {
            spend: parseFloat(row.spend || '0'),
            impressions: parseInt(row.impressions || '0'),
            reach: parseInt(row.reach || '0'),
            clicks: parseInt(row.clicks || '0'),
            ctr: parseFloat(row.ctr || '0'),
            cpm: parseFloat(row.cpm || '0'),
            cpc: parseFloat(row.cpc || '0'),
            frequency: parseFloat(row.frequency || '0'),
          },
          create: {
            adAccountId: adAccount.id,
            entityType: 'CAMPAIGN',
            entityId: campaignDbId,
            date,
            spend: parseFloat(row.spend || '0'),
            impressions: parseInt(row.impressions || '0'),
            reach: parseInt(row.reach || '0'),
            clicks: parseInt(row.clicks || '0'),
            ctr: parseFloat(row.ctr || '0'),
            cpm: parseFloat(row.cpm || '0'),
            cpc: parseFloat(row.cpc || '0'),
            frequency: parseFloat(row.frequency || '0'),
          },
        });
      }
    } catch (e: any) {
      console.log(`  Insights error (may need ads_read permission): ${e.message}`);
    }

    // Update sync timestamp
    await prisma.adAccount.update({
      where: { id: adAccount.id },
      data: { lastSyncAt: new Date() },
    });
  }

  // Summary
  const counts = {
    accounts: await prisma.adAccount.count(),
    campaigns: await prisma.campaign.count(),
    adSets: await prisma.adSet.count(),
    ads: await prisma.ad.count(),
    insights: await prisma.insightSnapshot.count(),
  };
  console.log(`\n✓ Sync complete!`);
  console.log(`  ${counts.accounts} ad accounts`);
  console.log(`  ${counts.campaigns} campaigns`);
  console.log(`  ${counts.adSets} ad sets`);
  console.log(`  ${counts.ads} ads`);
  console.log(`  ${counts.insights} insight snapshots`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

// prisma/seed-local.ts
// Seeds realistic ad data directly into the DB — no Meta API needed.
// Usage: npx ts-node prisma/seed-local.ts

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function randInt(min: number, max: number) { return Math.floor(rand(min, max)); }
function pick<T>(arr: T[]): T { return arr[randInt(0, arr.length)]; }

const CAMPAIGN_NAMES = [
  'Yaz Indirimi 2026', 'Kis Sezonu Kampanyasi', 'Marka Bilinirlik',
  'Retargeting - Site Ziyaretcileri', 'Lookalike - En Iyi Musteriler',
  'Yeni Urun Lansmanı', 'Black Friday', 'Bahar Festivali',
  'Sadakat Programi', 'App Install Kampanyasi', 'Video Goruntulenme',
  'Lead Generation - B2B', 'E-Ticaret Satis', 'Hikaye Reklamlari',
  'Dinamik Urun Reklamlari', 'Engagement Kampanyasi',
];

const ADSET_PREFIXES = ['TR 25-45 Kadin', 'TR 18-35 Erkek', 'Istanbul Broad', 'Ankara-Izmir', 'Mobil Kullanicilar', 'Desktop Premium', 'Retarget 7 Gun', 'Retarget 30 Gun', 'Lookalike 1%', 'Lookalike 3%', 'Interest - Moda', 'Interest - Teknoloji'];
const AD_NAMES = ['Gorsel A - Urun', 'Gorsel B - Lifestyle', 'Video 15s', 'Video 30s', 'Carousel 3 Urun', 'Carousel 5 Urun', 'Hikaye - Dikey', 'Collection - Katalog', 'Dinamik - Otomatik'];
const OBJECTIVES = ['OUTCOME_SALES', 'OUTCOME_TRAFFIC', 'OUTCOME_LEADS', 'OUTCOME_AWARENESS', 'OUTCOME_ENGAGEMENT'];
const OPTIMIZATION_GOALS = ['OFFSITE_CONVERSIONS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH', 'LANDING_PAGE_VIEWS'];
const BILLING_EVENTS = ['IMPRESSIONS', 'LINK_CLICKS'];
const BID_STRATEGIES = ['LOWEST_COST_WITHOUT_CAP', 'COST_CAP', 'BID_CAP'];

const ACCOUNTS = [
  { metaAccountId: '100001', name: 'E-Ticaret Ana Hesap', currency: 'TRY', timezone: 'Europe/Istanbul' },
  { metaAccountId: '100002', name: 'Marka Bilinirlik Hesabi', currency: 'TRY', timezone: 'Europe/Istanbul' },
  { metaAccountId: '100003', name: 'Performans Pazarlama', currency: 'TRY', timezone: 'Europe/Istanbul' },
];

async function main() {
  // Get admin + workspace
  const admin = await prisma.user.findFirst({ where: { isAdmin: true } });
  if (!admin) { console.error('Run `npx ts-node prisma/seed.ts` first'); process.exit(1); }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: admin.id },
  });
  if (!membership) { console.error('No workspace'); process.exit(1); }
  const workspaceId = membership.workspaceId;

  // Create MetaConnection (fake but encrypted so app doesn't crash)
  const connection = await prisma.metaConnection.upsert({
    where: { workspaceId_metaUserId: { workspaceId, metaUserId: 'local-seed-user' } },
    update: { accessToken: encrypt('fake-local-token'), status: 'ACTIVE' },
    create: { workspaceId, metaUserId: 'local-seed-user', accessToken: encrypt('fake-local-token'), status: 'ACTIVE' },
  });

  for (const acctDef of ACCOUNTS) {
    console.log(`\n--- ${acctDef.name} ---`);

    const adAccount = await prisma.adAccount.upsert({
      where: { workspaceId_metaAccountId: { workspaceId, metaAccountId: acctDef.metaAccountId } },
      update: { name: acctDef.name, lastSyncAt: new Date() },
      create: {
        metaConnectionId: connection.id,
        workspaceId,
        metaAccountId: acctDef.metaAccountId,
        name: acctDef.name,
        currency: acctDef.currency,
        timezone: acctDef.timezone,
      },
    });

    // Create campaigns
    const numCampaigns = randInt(8, 16);
    const usedNames = new Set<string>();

    for (let ci = 0; ci < numCampaigns; ci++) {
      let name = pick(CAMPAIGN_NAMES);
      while (usedNames.has(name)) name = pick(CAMPAIGN_NAMES) + ` #${ci}`;
      usedNames.add(name);

      const status = Math.random() > 0.3 ? 'ACTIVE' : 'PAUSED';
      const dailyBudget = randInt(50, 500) * 10; // 500-5000 TRY
      const startDate = new Date(Date.now() - randInt(7, 90) * 86400_000);

      const campaign = await prisma.campaign.create({
        data: {
          adAccountId: adAccount.id,
          metaCampaignId: `meta_c_${crypto.randomBytes(6).toString('hex')}`,
          name,
          status: status as any,
          objective: pick(OBJECTIVES),
          buyingType: 'AUCTION',
          dailyBudget,
          bidStrategy: pick(BID_STRATEGIES),
          specialAdCategories: [],
          startTime: startDate,
          syncStatus: 'SYNCED',
          lastSyncAt: new Date(),
        },
      });

      // Create ad sets per campaign
      const numAdSets = randInt(2, 5);
      for (let si = 0; si < numAdSets; si++) {
        const adSetName = `${pick(ADSET_PREFIXES)} - ${name.slice(0, 20)}`;
        const adSetBudget = Math.round(dailyBudget / numAdSets);

        const adSet = await prisma.adSet.create({
          data: {
            campaignId: campaign.id,
            adAccountId: adAccount.id,
            metaAdSetId: `meta_as_${crypto.randomBytes(6).toString('hex')}`,
            name: adSetName,
            status: status as any,
            dailyBudget: adSetBudget,
            optimizationGoal: pick(OPTIMIZATION_GOALS),
            billingEvent: pick(BILLING_EVENTS),
            scheduledStart: startDate,
            targeting: {
              age_min: randInt(18, 30),
              age_max: randInt(35, 65),
              genders: [randInt(0, 2)],
              geo_locations: { countries: ['TR'] },
            },
            syncStatus: 'SYNCED',
          },
        });

        // Create ads per ad set
        const numAds = randInt(2, 4);
        for (let ai = 0; ai < numAds; ai++) {
          await prisma.ad.create({
            data: {
              adSetId: adSet.id,
              adAccountId: adAccount.id,
              metaAdId: `meta_ad_${crypto.randomBytes(6).toString('hex')}`,
              name: `${pick(AD_NAMES)} - ${adSetName.slice(0, 15)}`,
              status: status as any,
              syncStatus: 'SYNCED',
            },
          });
        }
      }

      // Create daily insight snapshots (last 30 days)
      for (let d = 0; d < 30; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        date.setHours(0, 0, 0, 0);

        const daySpend = rand(dailyBudget * 0.6, dailyBudget * 1.1);
        const impressions = randInt(1000, 50000);
        const reach = Math.round(impressions * rand(0.7, 0.95));
        const clicks = Math.round(impressions * rand(0.01, 0.06));
        const conversions = Math.round(clicks * rand(0.02, 0.15));
        const revenue = conversions * rand(50, 300);
        const ctr = (clicks / impressions) * 100;
        const cpm = (daySpend / impressions) * 1000;
        const cpc = clicks > 0 ? daySpend / clicks : 0;
        const cpa = conversions > 0 ? daySpend / conversions : 0;
        const roas = daySpend > 0 ? revenue / daySpend : 0;
        const frequency = impressions / (reach || 1);

        await prisma.insightSnapshot.upsert({
          where: {
            adAccountId_entityType_entityId_date: {
              adAccountId: adAccount.id,
              entityType: 'CAMPAIGN',
              entityId: campaign.id,
              date,
            },
          },
          update: { spend: daySpend, impressions, reach, clicks, conversions, revenue, ctr, cpm, cpc, cpa, roas, frequency },
          create: {
            adAccountId: adAccount.id,
            entityType: 'CAMPAIGN',
            entityId: campaign.id,
            date,
            spend: daySpend,
            impressions,
            reach,
            clicks,
            conversions,
            revenue,
            ctr,
            cpm,
            cpc,
            cpa,
            roas,
            frequency,
          },
        });
      }
    }

    console.log(`  Created ${numCampaigns} campaigns with ad sets, ads & 30 days of insights`);
  }

  // Create some notifications
  const notifications = [
    { type: 'AUTOPILOT_ACTION', title: 'Düşük performanslı kampanya duraklatıldı', body: '"Kış Sezonu" son 3 günde hedef ROAS altında kaldı.' },
    { type: 'SUGGESTION', title: 'Bütçe yeniden dağıtım önerisi', body: 'En iyi 2 reklam setine bütçe aktararak %18 ROAS artışı sağlayabilirsiniz.' },
    { type: 'META_CONNECTION', title: 'Hesap senkronizasyonu tamamlandı', body: '3 reklam hesabı başarıyla senkronize edildi.' },
    { type: 'SYSTEM', title: 'Haftalık performans raporu hazır', body: 'Son 7 günün detaylı kampanya performans raporu incelenmeye hazır.' },
    { type: 'BILLING', title: 'Bütçe uyarısı: Günlük harcama limitine yaklaşıldı', body: 'Günlük bütçenizin %85\'ini kullandınız.' },
  ];

  for (const n of notifications) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        workspaceId,
        type: n.type as any,
        title: n.title,
        body: n.body,
      },
    });
  }

  // Print summary
  const counts = {
    accounts: await prisma.adAccount.count(),
    campaigns: await prisma.campaign.count(),
    adSets: await prisma.adSet.count(),
    ads: await prisma.ad.count(),
    insights: await prisma.insightSnapshot.count(),
    notifications: await prisma.notification.count(),
  };

  console.log(`\n✓ Seed complete!`);
  console.log(`  ${counts.accounts} ad accounts`);
  console.log(`  ${counts.campaigns} campaigns`);
  console.log(`  ${counts.adSets} ad sets`);
  console.log(`  ${counts.ads} ads`);
  console.log(`  ${counts.insights} insight snapshots (30 days)`);
  console.log(`  ${counts.notifications} notifications`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

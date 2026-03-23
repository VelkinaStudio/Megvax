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

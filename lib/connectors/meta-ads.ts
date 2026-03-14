import type { NormalizedMetric } from './google-ads';

export async function syncMetaAds(creds: { access_token: string; metadata?: any }): Promise<NormalizedMetric[]> {
  // In production: call Meta Marketing API
  // GET https://graph.facebook.com/v18.0/act_{ad_account_id}/insights
  // ?fields=spend,impressions,clicks,actions,action_values&time_range={"since":"2024-01-01","until":"2024-01-31"}&time_increment=1
  
  // const adAccountId = creds.metadata?.ad_account_id;
  // const res = await fetch(`https://graph.facebook.com/v18.0/act_${adAccountId}/insights?...&access_token=${creds.access_token}`);
  
  console.log('[meta-ads] Sync called \u2014 configure META_AD_ACCOUNT_ID in org metadata to enable');
  return [];
}

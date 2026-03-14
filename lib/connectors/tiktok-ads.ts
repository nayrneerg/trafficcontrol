import type { NormalizedMetric } from './google-ads';

export async function syncTikTokAds(creds: { access_token: string; metadata?: any }): Promise<NormalizedMetric[]> {
  // In production: call TikTok Business API
  // GET https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/
  // with advertiser_id, report_type=BASIC, dimensions=["stat_time_day"], metrics=[...]
  
  console.log('[tiktok-ads] Sync called \u2014 configure TIKTOK_ADVERTISER_ID in org metadata to enable');
  return [];
}

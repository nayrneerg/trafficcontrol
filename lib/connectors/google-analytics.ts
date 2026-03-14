import type { NormalizedMetric } from './google-ads';

export async function syncGoogleAnalytics(creds: { access_token: string; metadata?: any }): Promise<NormalizedMetric[]> {
  // In production: call GA4 Data API
  // POST https://analyticsdata.googleapis.com/v1beta/properties/{property_id}:runReport
  // with dimensions=[{name:"date"}], metrics=[{name:"sessions"},{name:"conversions"},{name:"totalRevenue"}]
  
  console.log('[google-analytics] Sync called \u2014 configure GA4_PROPERTY_ID in org metadata to enable');
  return [];
}

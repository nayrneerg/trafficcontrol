export interface NormalizedMetric {
  date: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  roas?: number;
  cpl?: number;
  ctr?: number;
  cpc?: number;
  raw?: Record<string, any>;
}

export async function syncGoogleAds(creds: { access_token: string; metadata?: any }): Promise<NormalizedMetric[]> {
  // In production: call Google Ads API v14 reporting endpoint
  // POST https://googleads.googleapis.com/v14/customers/{customer_id}/googleAds:searchStream
  // with GAQL query for campaign stats grouped by date
  
  // Placeholder: return empty array until real credentials are configured
  // Real implementation would look like:
  // const res = await fetch(`https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:searchStream`, {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${creds.access_token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN! },
  //   body: JSON.stringify({ query: 'SELECT campaign.id, segments.date, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS' })
  // });
  
  console.log('[google-ads] Sync called — configure GOOGLE_ADS_CUSTOMER_ID and GOOGLE_ADS_DEVELOPER_TOKEN to enable');
  return [];
}

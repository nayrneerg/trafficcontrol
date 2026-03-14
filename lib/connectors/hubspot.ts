import type { NormalizedMetric } from './google-ads';

export interface HubSpotDeal {
  crm_deal_id: string;
  deal_name: string;
  stage: string;
  is_closed_won: boolean;
  amount: number;
  close_date: string | null;
  created_date: string | null;
  lead_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  contact_email: string | null;
  raw_data: Record<string, any>;
}

// Map HubSpot lifecycle/deal stages to closed-won
const CLOSED_WON_STAGES = new Set([
  'closedwon',
  'closed won',
  'closed_won',
  'won',
]);

export async function syncHubspot(
  creds: { access_token: string; metadata?: any }
): Promise<NormalizedMetric[]> {
  // Sync deals separately via syncHubSpotDeals — metrics cache gets lead counts
  const deals = await syncHubSpotDeals(creds);
  const closedWon = deals.filter(d => d.is_closed_won);

  // Return normalized metric rows (one per day aggregated)
  const byDate: Record<string, { conversions: number; revenue: number }> = {};
  for (const deal of closedWon) {
    const date = deal.close_date?.split('T')[0] ?? new Date().toISOString().split('T')[0];
    if (!byDate[date]) byDate[date] = { conversions: 0, revenue: 0 };
    byDate[date].conversions += 1;
    byDate[date].revenue += deal.amount;
  }

  return Object.entries(byDate).map(([date, vals]) => ({
    platform: 'hubspot' as any,
    date,
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: vals.conversions,
    revenue: vals.revenue,
    roas: 0,
    cpl: 0,
    ctr: 0,
    cpc: 0,
  }));
}

export async function syncHubSpotDeals(
  creds: { access_token: string; metadata?: any },
  daysBack = 90
): Promise<HubSpotDeal[]> {
  const after = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
  const deals: HubSpotDeal[] = [];
  let after_cursor: string | undefined;

  const properties = [
    'dealname',
    'dealstage',
    'amount',
    'closedate',
    'createdate',
    'hs_lead_status',
    'lead_source', // custom or standard
    'hs_analytics_source',
    'hs_analytics_source_data_1',
    'hs_analytics_source_data_2',
    'utm_source',
     'utm_medium',
    'utm_campaign',
  ].join(',');

  do {
    const params = new URLSearchParams({
      limit: '100',
      properties,
      filterGroups: JSON.stringify([{
        filters: [{
          propertyName: 'createdate',
          operator: 'GTE',
          value: after,
        }],
      }]),
    });
    if (after_cursor) params.set('after', after_cursor);

    const res = await fetch(
      `https://api.hubapi.com/crm/v3/objects/deals/search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 100,
          after: after_cursor,
          filterGroups: [{
            filters: [{
              propertyName: 'createdate',
              operator: 'GTE',
              value: String(new Date(after).getTime()),
            }],
          }],
          properties: properties.split(','),
          sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
        }),
      }
    );

    if (!res.ok) {
      console.error('[hubspot] deals fetch failed:', res.status, await res.text());
      break;
    }

    const data = await res.json();
    const results: any[] = data.results ?? [];

    for (const item of results) {
      const p = item.properties ?? {};
      const stage = (p.dealstage ?? '').toLowerCase().trim();
      const isWon = CLOSED_WON_STAGES.has(stage);

      // Try to get UTM from deal properties or analytics source
      const utmSource =
        p.utm_source ||
        mapHubSpotSource(p.hs_analytics_source) ||
        p.lead_source ||
        null;

      deals.push({
        crm_deal_id: item.id,
        deal_name: p.dealname ?? null,
        stage: p.dealstage ?? '',
        is_closed_won: isWon,
        amount: parseFloat(p.amount ?? '0') || 0,
        close_date: p.closedate ?? null,
        created_date: p.createdate ?? null,
        lead_source: p.hs_analytics_source ?? p.lead_source ?? null,
        utm_source: utmSource,
        utm_medium: p.utm_medium ?? p.hs_analytics_source_data_1 ?? null,
        utm_campaign: p.utm_campaign ?? p.hs_analytics_source_data_2 ?? null,
        contact_email: null, // fetched separately if needed
        raw_data: p,
      });
    }

    after_cursor = data.paging?.next?.after;
  } while (after_cursor);

  console.log(`[hubspot] synced ${deals.length} deals (${deals.filter(d => d.is_closed_won).length} closed-won)`);
  return deals;
}

// Map HubSpot hs_analytics_source values to channel slugs
function mapHubSpotSource(source: string | null | undefined): string | null {
  if (!source) return null;
  const s = source.toLowerCase();
  if (s.includes('paid_search') || s.includes('google')) return 'google_ads';
  if (s.includes('paid_social') || s.includes('facebook') || s.includes('meta')) return 'meta_ads';
  if (s.includes('tiktok')) return 'tiktok_ads';
  if (s.includes('organic_search') || s.includes('seo')) return 'organic';
  if (s.includes('email')) return 'email';
  if (s.includes('direct')) return 'direct';
  if (s.includes('referral')) return 'referral';
  return source;
}

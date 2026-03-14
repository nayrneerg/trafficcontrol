import type { NormalizedMetric } from './google-ads';

export interface SalesforceDeal {
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

const CLOSED_WON_STAGES = new Set([
  'closed won',
  'closedwon',
  'closed_won',
  'won',
]);

export async function syncSalesforce(
  creds: { access_token: string; metadata?: any }
): Promise<NormalizedMetric[]> {
  const deals = await syncSalesforceDeals(creds);
  const closedWon = deals.filter(d => d.is_closed_won);

  const byDate: Record<string, { conversions: number; revenue: number }> = {};
  for (const deal of closedWon) {
    const date = deal.close_date?.split('T')[0] ?? new Date().toISOString().split('T')[0];
    if (!byDate[date]) byDate[date] = { conversions: 0, revenue: 0 };
    byDate[date].conversions += 1;
    byDate[date].revenue += deal.amount;
  }

  return Object.entries(byDate).map(([date, vals]) => ({
    platform: 'salesforce' as any,
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

export async function syncSalesforceDeals(
  creds: { access_token: string; metadata?: any },
  daysBack = 90
): Promise<SalesforceDeal[]> {
  const instanceUrl = creds.metadata?.instance_url;
  if (!instanceUrl) {
    console.error('[salesforce] No instance_url in metadata \u2014 cannot sync');
    return [];
  }

  const apiVersion = creds.metadata?.api_version ?? 'v58.0';
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // SOQL \u2014 fetch Opportunities with lead source and UTM custom fields
  // UTM fields are optional; Salesforce orgs may have them as custom fields
  const soql = `
    SELECT
      Id, Name, StageName, Amount, CloseDate, CreatedDate,
      LeadSource,
      UTM_Source__c, UTM_Medium__c, UTM_Campaign__c,
      Account.Name
    FROM Opportunity
    WHERE CreatedDate >= ${since}T00:00:00Z
    ORDER BY CreatedDate DESC
    LIMIT 2000
  `.replace(/\s+/g, ' ').trim();

  const url = `${instanceUrl}/services/data/${apiVersion}/query?q=${encodeURIComponent(soql)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${creds.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    // If UTM custom fields don't exist, retry without them
    if (errText.includes('UTM_Source__c') || errText.includes('No such column')) {
      console.warn('[salesforce] UTM custom fields not found \u2014 retrying without them');
      return syncSalesforceDealsBasic(creds, instanceUrl, apiVersion, since);
    }
    console.error('[salesforce] query failed:', res.status, errText);
    return [];
  }

  const data = await res.json();
  const records: any[] = data.records ?? [];
  const deals = records.map(r => mapSalesforceRecord(r));

  console.log(`[salesforce] synced ${deals.length} opportunities (${deals.filter(d => d.is_closed_won).length} closed-won)`);
  return deals;
}

async function syncSalesforceDealsBasic(
  creds: { access_token: string; metadata?: any },
  instanceUrl: string,
  apiVersion: string,
  since: string
): Promise<SalesforceDeal[]> {
  const soql = `
    SELECT Id, Name, StageName, Amount, CloseDate, CreatedDate, LeadSource
    FROM Opportunity
    WHERE CreatedDate >= ${since}T00:00:00Z
    ORDER BY CreatedDate DESC
    LIMIT 2000
  `.replace(/\s+/g, ' ').trim();

  const res = await fetch(
    `${instanceUrl}/services/data/${apiVersion}/query?q=${encodeURIComponent(soql)}`,
    {
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    console.error('[salesforce] basic query also failed:', res.status);
    return [];
  }

  const data = await res.json();
  return (data.records ?? []).map(mapSalesforceRecord);
}

function mapSalesforceRecord(r: any): SalesforceDeal {
  const stage = (r.StageName ?? '').toLowerCase().trim();
  const isWon = CLOSED_WON_STAGES.has(stage);

  const utmSource =
    r.UTM_Source__c ??
    mapSalesforceLeadSource(r.LeadSource) ??
    null;

  return {
    crm_deal_id: r.Id,
    deal_name: r.Name ?? null,
    stage: r.StageName ?? '',
    is_closed_won: isWon,
    amount: parseFloat(r.Amount ?? '0') || 0,
    close_date: r.CloseDate ?? null,
    created_date: r.CreatedDate ?? null,
    lead_source: r.LeadSource ?? null,
    utm_source: utmSource,
    utm_medium: r.UTM_Medium__c ?? null,
    utm_campaign: r.UTM_Campaign__c ?? null,
    contact_email: null,
    raw_data: r,
  };
}

function mapSalesforceLeadSource(source: string | null | undefined): string | null {
  if (!source) return null;
  const s = source.toLowerCase();
  if (s.includes('google') || s.includes('paid search') || s.includes('adwords')) return 'google_ads';
  if (s.includes('facebook') || s.includes('meta') || s.includes('instagram') || s.includes('paid social')) return 'meta_ads';
  if (s.includes('tiktok')) return 'tiktok_ads';
  if (s.includes('organic') || s.includes('seo')) return 'organic';
  if (s.includes('email')) return 'email';
  if (s.includes('web') || s.includes('direct')) return 'direct';
  if (s.includes('referral') || s.includes('partner')) return 'referral';
  return source;
}

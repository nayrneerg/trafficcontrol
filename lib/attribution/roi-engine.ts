import type { SupabaseClient } from '@supabase/supabase-js';

export interface ChannelROI {
  channel: string;
  label: string;
  ad_spend: number;
  closed_revenue: number;
  deals_count: number;
  leads_count: number;
  cost_per_lead: number | null;
  cost_per_deal: number | null;
  roi_percent: number | null;       // (revenue - spend) / spend * 100
  roas: number | null;              // revenue / spend
  avg_deal_size: number | null;
}

export interface ROISummary {
  period_start: string;
  period_end: string;
  channels: ChannelROI[];
  totals: {
    ad_spend: number;
    closed_revenue: number;
    deals_count: number;
    leads_count: number;
    blended_roi_percent: number | null;
    blended_roas: number | null;
  };
}

const CHANNEL_LABELS: Record<string, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  tiktok_ads: 'TikTok Ads',
  hubspot: 'HubSpot (CRM)',
  salesforce: 'Salesforce (CRM)',
  organic: 'Organic / SEO',
  email: 'Email',
  direct: 'Direct',
  referral: 'Referral',
  unknown: 'Unknown / Unattributed',
};

// Paid channels that have ad spend in metrics_cache
const PAID_CHANNELS = new Set(['google_ads', 'meta_ads', 'tiktok_ads']);

/**
 * Core attribution function.
 * 
 * Strategy (in priority order per deal):
 *   1. UTM source on the deal -> map to channel via lead_source_mappings
 *   2. CRM lead_source field -> map via lead_source_mappings
 *   3. Fallback: 'unknown'
 *
 * Then joins attributed revenue against ad spend from metrics_cache
 * for the same org + channel + date range.
 */
export async function calculateROI(
  supabase: SupabaseClient,
  orgId: string,
  periodStart: string,
  periodEnd: string
): Promise<ROISummary> {
  // 1. Load lead source mappings for this org
  const { data: mappingRows } = await supabase
    .from('lead_source_mappings')
    .select('lead_source_value, mapped_channel')
    .eq('org_id', orgId);

  const mappings = new Map<string, string>();
  for (const row of mappingRows ?? []) {
    mappings.set(row.lead_source_value.toLowerCase(), row.mapped_channel);
  }

  // 2. Load closed-won deals in the period
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_closed_won', true)
    .gte('close_date', periodStart)
    .lte('close_date', periodEnd);

  // 3. Load all deals (including open/leads) to count total leads per channel
  const { data: allDeals } = await supabase
    .from('deals')
    .select('id, utm_source, lead_source, is_closed_won')
    .eq('org_id', orgId)
    .gte('created_date', periodStart)
    .lte('created_date', periodEnd);

  // 4. Load ad spend from metrics_cache for paid channels
  const { data: spendRows } = await supabase
    .from('metrics_cache')
    .select('platform, spend, conversions')
    .eq('org_id', orgId)
    .gte('metric_date', periodStart)
    .lte('metric_date', periodEnd)
    .in('platform', Array.from(PAID_CHANNELS));

  // Aggregate spend per channel
  const spendByChannel: Record<string, number> = {};
  const adLeadsByChannel: Record<string, number> = {};
  for (const row of spendRows ?? []) {
    spendByChannel[row.platform] = (spendByChannel[row.platform] ?? 0) + (row.spend ?? 0);
    adLeadsByChannel[row.platform] = (adLeadsByChannel[row.platform] ?? 0) + (row.conversions ?? 0);
  }

  // 5. Attribute each closed deal to a channel
  const revenueByChannel: Record<string, number> = {};
  const dealsByChannel: Record<string, number> = {};

  for (const deal of deals ?? []) {
    const channel = resolveChannel(deal, mappings);
    revenueByChannel[channel] = (revenueByChannel[channel] ?? 0) + deal.amount;
    dealsByChannel[channel] = (dealsByChannel[channel] ?? 0) + 1;
  }

  // 6. Attribute all leads (open + closed) to channels for CPL calc
  const leadsByChannel: Record<string, number> = {};
  for (const deal of allDeals ?? []) {
    const channel = resolveChannel(deal, mappings);
    leadsByChannel[channel] = (leadsByChannel[channel] ?? 0) + 1;
  }

  // 7. Build per-channel ROI rows
  // Union of all channels that appear in spend OR deals
  const allChannels = new Set([
    ...Object.keys(spendByChannel),
    ...Object.keys(revenueByChannel),
  ]);

  const channels: ChannelROI[] = Array.from(allChannels).map(channel => {
    const spend = spendByChannel[channel] ?? 0;
    const revenue = revenueByChannel[channel] ?? 0;
    const deals_count = dealsByChannel[channel] ?? 0;
    // For paid channels, use ad platform conversion count as leads; else CRM leads
    const leads_count = PAID_CHANNELS.has(channel)
      ? (adLeadsByChannel[channel] ?? leadsByChannel[channel] ?? 0)
      : (leadsByChannel[channel] ?? 0);

    return {
      channel,
      label: CHANNEL_LABELS[channel] ?? channel,
      ad_spend: spend,
      closed_revenue: revenue,
      deals_count,
      leads_count,
      cost_per_lead: spend > 0 && leads_count > 0 ? spend / leads_count : null,
      cost_per_deal: spend > 0 && deals_count > 0 ? spend / deals_count : null,
      roi_percent: spend > 0 ? ((revenue - spend) / spend) * 100 : null,
      roas: spend > 0 ? revenue / spend : null,
      avg_deal_size: deals_count > 0 ? revenue / deals_count : null,
    };
  });

  // Sort: paid channels first (by spend desc), then others
  channels.sort((a, b) => {
    const aPaid = PAID_CHANNELS.has(a.channel) ? 1 : 0;
    const bPaid = PAID_CHANNELS.has(b.channel) ? 1 : 0;
    if (aPaid !== bPaid) return bPaid - aPaid;
    return b.ad_spend - a.ad_spend;
  });

  // 8. Totals
  const totalSpend = channels.reduce((s, c) => s + c.ad_spend, 0);
  const totalRevenue = channels.reduce((s, c) => s + c.closed_revenue, 0);
  const totalDeals = channels.reduce((s, c) => s + c.deals_count, 0);
  const totalLeads = channels.reduce((s, c) => s + c.leads_count, 0);

  return {
    period_start: periodStart,
    period_end: periodEnd,
    channels,
    totals: {
      ad_spend: totalSpend,
      closed_revenue: totalRevenue,
      deals_count: totalDeals,
      leads_count: totalLeads,
      blended_roi_percent: totalSpend > 0
        ? ((totalRevenue - totalSpend) / totalSpend) * 100
        : null,
      blended_roas: totalSpend > 0 ? totalRevenue / totalSpend : null,
    },
  };
}

/**
 * Persist calculated ROI into roi_cache for fast dashboard reads.
 */
export async function upsertROICache(
  supabase: SupabaseClient,
  orgId: string,
  summary: ROISummary
): Promise<void> {
  const rows = summary.channels.map(c => ({
    org_id: orgId,
    channel: c.channel,
    period_start: summary.period_start,
    period_end: summary.period_end,
    ad_spend: c.ad_spend,
    closed_revenue: c.closed_revenue,
    deals_count: c.deals_count,
    leads_count: c.leads_count,
    cost_per_lead: c.cost_per_lead,
    cost_per_deal: c.cost_per_deal,
    roi_percent: c.roi_percent,
    roas: c.roas,
    avg_deal_size: c.avg_deal_size,
    calculated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('roi_cache')
    .upsert(rows, { onConflict: 'org_id,channel,period_start,period_end' });

  if (error) console.error('[roi-engine] upsert roi_cache failed:', error);
}

// ---------- helpers ----------

function resolveChannel(
  deal: { utm_source?: string | null; lead_source?: string | null },
  mappings: Map<string, string>
): string {
  // Priority 1: UTM source
  if (deal.utm_source) {
    const mapped = mappings.get(deal.utm_source.toLowerCase());
    if (mapped) return mapped;
    // Try partial match
    for (const [key, val] of mappings) {
      if (deal.utm_source.toLowerCase().includes(key)) return val;
    }
    return deal.utm_source.toLowerCase();
  }

  // Priority 2: CRM lead source
  if (deal.lead_source) {
    const mapped = mappings.get(deal.lead_source.toLowerCase());
    if (mapped) return mapped;
    for (const [key, val] of mappings) {
      if (deal.lead_source.toLowerCase().includes(key)) return val;
    }
    return deal.lead_source.toLowerCase();
  }

  return 'unknown';
}

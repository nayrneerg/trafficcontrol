import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { calculateROI, upsertROICache } from '@/lib/attribution/roi-engine';
import { syncHubSpotDeals } from '@/lib/connectors/hubspot';
import { syncSalesforceDeals } from '@/lib/connectors/salesforce';

/**
 * GET /api/roi?period=30d|90d|custom&start=YYYY-MM-DD&end=YYYY-MM-DD
 *
 * Returns per-channel ROI: spend vs closed revenue, CPL, cost-per-deal, ROI%
 * Reads from roi_cache if fresh (< 6h), else recalculates live.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('users').select('org_id, role').eq('id', user.id).single();
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') ?? '30d';
    const forceRefresh = searchParams.get('refresh') === 'true';

    const { periodStart, periodEnd } = resolvePeriod(period, searchParams);

    // Check roi_cache freshness (skip if forceRefresh)
    if (!forceRefresh) {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      const { data: cached } = await supabase
        .from('roi_cache')
        .select('*')
        .eq('org_id', profile.org_id)
        .eq('period_start', periodStart)
        .eq('period_end', periodEnd)
        .gte('calculated_at', sixHoursAgo);

      if (cached && cached.length > 0) {
        return NextResponse.json({
          source: 'cache',
          period_start: periodStart,
          period_end: periodEnd,
          channels: cached.map(formatCacheRow),
          totals: computeTotals(cached.map(formatCacheRow)),
        });
      }
    }

    // Live calculation — use service client for cron/background safety
    const service = createServiceClient();

    // Trigger deal sync if we have CRM credentials
    await syncCRMDeals(service, profile.org_id);

    // Run attribution engine
    const summary = await calculateROI(service, profile.org_id, periodStart, periodEnd);

    // Persist to cache
    await upsertROICache(service, profile.org_id, summary);

    return NextResponse.json({
      source: 'live',
      ...summary,
    });
  } catch (err: any) {
    console.error('[/api/roi] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/roi/sync
 * Manually trigger a CRM deal sync + ROI recalculation for the org.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('users').select('org_id, role').eq('id', user.id).single();
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 });
    if (profile.role !== 'agency_admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const service = createServiceClient();
    const synced = await syncCRMDeals(service, profile.org_id);

    // Recalculate for last 30d and 90d
    for (const period of ['30d', '90d']) {
      const { periodStart, periodEnd } = resolvePeriod(period, new URLSearchParams());
      const summary = await calculateROI(service, profile.org_id, periodStart, periodEnd);
      await upsertROICache(service, profile.org_id, summary);
    }

    return NextResponse.json({ ok: true, deals_synced: synced });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---------- helpers ----------

function resolvePeriod(
  period: string,
  searchParams: URLSearchParams
): { periodStart: string; periodEnd: string } {
  const today = new Date().toISOString().split('T')[0];

  if (period === 'custom') {
    return {
      periodStart: searchParams.get('start') ?? subtractDays(30),
      periodEnd: searchParams.get('end') ?? today,
    };
  }

  const days = period === '90d' ? 90 : period === '7d' ? 7 : 30;
  return { periodStart: subtractDays(days), periodEnd: today };
}

function subtractDays(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

async function syncCRMDeals(service: any, orgId: string): Promise<number> {
  let count = 0;

  // Load CRM credentials
  const { data: creds } = await service
    .from('integration_credentials')
    .select('platform, access_token, metadata')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .in('platform', ['hubspot', 'salesforce']);

  for (const cred of creds ?? []) {
    try {
      let deals: any[] = [];
      if (cred.platform === 'hubspot') {
        deals = await syncHubSpotDeals({ access_token: cred.access_token, metadata: cred.metadata });
      } else if (cred.platform === 'salesforce') {
        deals = await syncSalesforceDeals({ access_token: cred.access_token, metadata: cred.metadata });
      }

      if (deals.length === 0) continue;

      // Upsert deals into deals table
      const rows = deals.map(d => ({
        org_id: orgId,
        crm_platform: cred.platform,
        crm_deal_id: d.crm_deal_id,
        deal_name: d.deal_name,
        stage: d.stage,
        is_closed_won: d.is_closed_won,
        amount: d.amount,
        close_date: d.close_date ? d.close_date.split('T')[0] : null,
        created_date: d.created_date ? d.created_date.split('T')[0] : null,
        lead_source: d.lead_source,
        utm_source: d.utm_source,
        utm_medium: d.utm_medium,
        utm_campaign: d.utm_campaign,
        contact_email: d.contact_email,
        raw_data: d.raw_data,
        synced_at: new Date().toISOString(),
      }));

      const { error } = await service
        .from('deals')
        .upsert(rows, { onConflict: 'org_id,crm_platform,crm_deal_id' });

      if (error) console.error(`[roi/sync] upsert deals error (${cred.platform}):`, error);
      else count += rows.length;
    } catch (err) {
      console.error(`[roi/sync] ${cred.platform} sync error:`, err);
    }
  }

  return count;
}

function formatCacheRow(row: any) {
  return {
    channel: row.channel,
    label: row.label ?? row.channel,
    ad_spend: row.ad_spend,
    closed_revenue: row.closed_revenue,
    deals_count: row.deals_count,
    leads_count: row.leads_count,
    cost_per_lead: row.cost_per_lead,
    cost_per_deal: row.cost_per_deal,
    roi_percent: row.roi_percent,
    roas: row.roas,
    avg_deal_size: row.avg_deal_size,
  };
}

function computeTotals(channels: ReturnType<typeof formatCacheRow>[]) {
  const totalSpend = channels.reduce((s, c) => s + (c.ad_spend ?? 0), 0);
  const totalRevenue = channels.reduce((s, c) => s + (c.closed_revenue ?? 0), 0);
  return {
    ad_spend: totalSpend,
    closed_revenue: totalRevenue,
    deals_count: channels.reduce((s, c) => s + c.deals_count, 0),
    leads_count: channels.reduce((s, c) => s + c.leads_count, 0),
    blended_roi_percent: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : null,
    blended_roas: totalSpend > 0 ? totalRevenue / totalSpend : null,
  };
}

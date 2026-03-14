import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncGoogleAds } from '@/lib/connectors/google-ads';
import { syncMetaAds } from '@/lib/connectors/meta-ads';
import { syncTikTokAds } from '@/lib/connectors/tiktok-ads';
import { syncGoogleAnalytics } from '@/lib/connectors/google-analytics';
import { syncHubspot } from '@/lib/connectors/hubspot';

const SYNC_HANDLERS: Record<string, Function> = {
  google_ads: syncGoogleAds,
  meta_ads: syncMetaAds,
  tiktok_ads: syncTikTokAds,
  google_analytics: syncGoogleAnalytics,
  hubspot: syncHubspot,
};

export async function POST(
  req: NextRequest,
  { params }: { params: { platform: string } }
) {
  const { platform } = params;
  const handler = SYNC_HANDLERS[platform];
  if (!handler) {
    return NextResponse.json({ error: `Unknown platform: ${platform}` }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userProfile } = await supabase
      .from('users')
      .select('org_id, role')
      .eq('id', user.id)
      .single();
    if (!userProfile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 });

    const { data: creds } = await supabase
      .from('integration_credentials')
      .select('*')
      .eq('org_id', userProfile.org_id)
      .eq('platform', platform)
      .eq('is_active', true)
      .single();

    if (!creds) {
      return NextResponse.json({ error: `No credentials found for ${platform}` }, { status: 404 });
    }

    // Call the platform-specific sync handler
    const metrics = await handler(creds);

    // Upsert normalized metrics into metrics_cache
    const rows = metrics.map((m: any) => ({
      org_id: userProfile.org_id,
      platform,
      metric_date: m.date,
      spend: m.spend ?? null,
      impressions: m.impressions ?? null,
      clicks: m.clicks ?? null,
      conversions: m.conversions ?? null,
      revenue: m.revenue ?? null,
      roas: m.roas ?? null,
      cpl: m.cpl ?? null,
      ctr: m.ctr ?? null,
      cpc: m.cpc ?? null,
      raw_data: m.raw ?? null,
    }));

    await supabase
      .from('metrics_cache')
      .upsert(rows, { onConflict: 'org_id,platform,metric_date' });

    return NextResponse.json({ success: true, platform, rows: rows.length, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

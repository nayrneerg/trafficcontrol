import { NextRequest, NextResponse } from 'next/server';

// Vercel Cron Job — runs every 6 hours
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const platforms = ['google_ads', 'meta_ads', 'tiktok_ads', 'google_analytics', 'hubspot'];
    const results: Record<string, string> = {};

    for (const platform of platforms) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sync/${platform}`, {
          method: 'POST',
          headers: { 'x-cron-secret': process.env.CRON_SECRET || '' },
        });
        results[platform] = res.ok ? 'synced' : `failed (${res.status})`;
      } catch (err: any) {
        results[platform] = `error: ${err.message}`;
      }
    }

    console.log('[cron/sync] Results:', results);
    return NextResponse.json({ success: true, results, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

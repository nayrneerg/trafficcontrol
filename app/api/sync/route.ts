import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Placeholder for data sync endpoint
  // In production: reads integration credentials from Supabase,
  // calls each platform API, normalizes metrics, stores in metrics_cache
  return NextResponse.json({ success: true, message: 'Sync triggered', timestamp: new Date().toISOString() });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    lastSync: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    platforms: ['google_ads', 'meta_ads', 'tiktok_ads'],
  });
}

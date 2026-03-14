import { NextRequest, NextResponse } from 'next/server';

// Vercel Cron Job — runs daily at 8am UTC
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // In production: fetch all active orgs from Supabase and generate insights for each
    // const supabase = createServiceClient();
    // const { data: orgs } = await supabase.from('organizations').select('id, slug');
    // for (const org of orgs) { await generateInsights(org.id); }

    console.log('[cron/insights] Daily insights generation triggered');
    return NextResponse.json({
      success: true,
      message: 'Insights generation triggered for all active orgs',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

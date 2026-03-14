import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TOKEN_ENDPOINTS: Record<string, string> = {
  google_ads: 'https://oauth2.googleapis.com/token',
  google_analytics: 'https://oauth2.googleapis.com/token',
  meta_ads: 'https://graph.facebook.com/v18.0/oauth/access_token',
  hubspot: 'https://api.hubapi.com/oauth/v1/token',
  tiktok_ads: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/',
  salesforce: 'https://login.salesforce.com/services/oauth2/token',
};

export async function GET(
  req: NextRequest,
  { params }: { params: { platform: string } }
) {
  const { platform } = params;
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=${error || 'no_code'}`
    );
  }

  try {
    const clientIds: Record<string, string | undefined> = {
      google_ads: process.env.GOOGLE_ADS_CLIENT_ID,
      google_analytics: process.env.GOOGLE_ANALYTICS_CLIENT_ID,
      meta_ads: process.env.META_CLIENT_ID,
      hubspot: process.env.HUBSPOT_CLIENT_ID,
      tiktok_ads: process.env.TIKTOK_CLIENT_ID,
      salesforce: process.env.SALESFORCE_CLIENT_ID,
    };
    const clientSecrets: Record<string, string | undefined> = {
      google_ads: process.env.GOOGLE_ADS_CLIENT_SECRET,
      google_analytics: process.env.GOOGLE_ANALYTICS_CLIENT_SECRET,
      meta_ads: process.env.META_CLIENT_SECRET,
      hubspot: process.env.HUBSPOT_CLIENT_SECRET,
      tiktok_ads: process.env.TIKTOK_CLIENT_SECRET,
      salesforce: process.env.SALESFORCE_CLIENT_SECRET,
    };

    const tokenRes = await fetch(TOKEN_ENDPOINTS[platform], {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientIds[platform] || '',
        client_secret: clientSecrets[platform] || '',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/${platform}/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokens.error_description || 'Token exchange failed');

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: userProfile } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.org_id) throw new Error('No org found');

    await supabase.from('integration_credentials').upsert(
      {
        org_id: userProfile.org_id,
        platform,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        is_active: true,
      },
      { onConflict: 'org_id,platform' }
    );

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?connected=${platform}`
    );
  } catch (err: any) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=${encodeURIComponent(err.message)}`
    );
  }
}

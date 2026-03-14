import { NextRequest, NextResponse } from 'next/server';

const OAUTH_CONFIGS: Record<string, { authUrl: string; scopes: string[] }> = {
  google_ads: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/adwords'],
  },
  google_analytics: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  },
  meta_ads: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['ads_read', 'ads_management'],
  },
  hubspot: {
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    scopes: ['crm.objects.contacts.read', 'crm.objects.deals.read'],
  },
  tiktok_ads: {
    authUrl: 'https://business-api.tiktok.com/portal/auth',
    scopes: ['campaign.show', 'report.show'],
  },
  salesforce: {
    authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    scopes: ['api', 'refresh_token'],
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: { platform: string } }
) {
  const { platform } = params;
  const config = OAUTH_CONFIGS[platform];
  if (!config) {
    return NextResponse.json({ error: 'Unknown platform' }, { status: 400 });
  }

  const clientIds: Record<string, string | undefined> = {
    google_ads: process.env.GOOGLE_ADS_CLIENT_ID,
    google_analytics: process.env.GOOGLE_ANALYTICS_CLIENT_ID,
    meta_ads: process.env.META_CLIENT_ID,
    hubspot: process.env.HUBSPOT_CLIENT_ID,
    tiktok_ads: process.env.TIKTOK_CLIENT_ID,
    salesforce: process.env.SALESFORCE_CLIENT_ID,
  };

  const clientId = clientIds[platform];
  if (!clientId) {
    return NextResponse.json(
      { error: `Missing client ID for ${platform}. Configure in environment variables.` },
      { status: 400 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/${platform}/callback`;
  const state = Buffer.from(
    JSON.stringify({ platform, timestamp: Date.now() })
  ).toString('base64');

  const params2 = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return NextResponse.redirect(`${config.authUrl}?${params2.toString()}`);
}

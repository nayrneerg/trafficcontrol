import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { orgSlug, expiresInDays = 7 } = body;

    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    const tokenData = {
      orgSlug,
      expiresAt: expiresAt.toISOString(),
      createdBy: user.id,
      nonce: crypto.randomUUID().slice(0, 8),
    };

    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64url');
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/report/${token}`;

    return NextResponse.json({
      shareUrl,
      expiresAt: expiresAt.toISOString(),
      token,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

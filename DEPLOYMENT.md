# ControlTower — Deployment Guide

## Prerequisites
- Node.js 18+, npm or pnpm
- Supabase account + project
- Vercel account
- Platform developer accounts (Google, Meta, TikTok, HubSpot as needed)

---

## 1. Local Development Setup

```bash
git clone <your-repo>
cd controltower
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY at minimum
npm run dev
```

Visit http://localhost:3000 — you'll be redirected to /login.

---

## 2. Supabase Setup

1. Create a new project at https://supabase.com
2. Go to **SQL Editor** and paste the full contents of `supabase/migrations/001_initial_schema.sql`, then run it
3. Go to **Settings > API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (never expose client-side)
4. Go to **Authentication > Providers** and enable Email
5. Go to **Authentication > URL Configuration** and add:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/api/auth/callback`
   - Also add `http://localhost:3000/api/auth/callback` for local dev

---

## 3. Deploy to Vercel

1. Push your code to GitHub
2. Import the project at https://vercel.com/new
3. Set all environment variables from `.env.example` in the Vercel dashboard
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL (e.g. `https://controltower.vercel.app`)
5. Generate a secure `CRON_SECRET`: `openssl rand -base64 32`
6. Click **Deploy**

Vercel will automatically detect Next.js and configure the build.

---

## 4. Configure OAuth Apps

### Google Ads + Google Analytics 4
1. Go to https://console.cloud.google.com and create a project
2. Enable: **Google Ads API** and **Google Analytics Data API**
3. Go to **APIs & Services > Credentials > Create OAuth 2.0 Client ID**
4. Add authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/google_ads/callback`
   - `https://your-app.vercel.app/api/auth/google_analytics/callback`
5. Copy Client ID + Secret to env vars
6. Apply for Google Ads API access and get a Developer Token

### Meta Ads
1. Create an app at https://developers.facebook.com
2. Add the **Marketing API** product
3. Set OAuth Redirect URI: `https://your-app.vercel.app/api/auth/meta_ads/callback`
4. Copy App ID + Secret to `META_CLIENT_ID` / `META_CLIENT_SECRET`

### HubSpot
1. Create an app at https://developers.hubspot.com
2. Set redirect URL: `https://your-app.vercel.app/api/auth/hubspot/callback`
3. Add scopes: `crm.objects.contacts.read`, `crm.objects.deals.read`
4. Copy Client ID + Secret to env vars

### TikTok Ads
1. Create an app at https://business-api.tiktok.com
2. Set redirect URI: `https://your-app.vercel.app/api/auth/tiktok_ads/callback`
3. Copy App ID + Secret to env vars

### Salesforce
1. Go to Setup > App Manager > New Connected App
2. Enable OAuth, set callback: `https://your-app.vercel.app/api/auth/salesforce/callback`
3. Add scopes: `api`, `refresh_token`
4. Copy Consumer Key + Secret to env vars

---

## 5. Vercel Cron Jobs

`vercel.json` configures two cron jobs automatically on deploy:

| Job | Schedule | Purpose |
|-----|----------|---------|
| `/api/cron/sync` | Every 6 hours | Syncs metrics from all connected platforms |
| `/api/cron/insights` | Daily at 8am UTC | Generates fresh AI insights for all orgs |

Monitor cron runs at **Vercel Dashboard > Your Project > Cron Jobs**.

Cron jobs are authenticated via `CRON_SECRET` — Vercel automatically sends this as a Bearer token.

---

## 6. AI Insights (OpenAI)

1. Get an API key at https://platform.openai.com
2. Set `OPENAI_API_KEY` in Vercel env vars
3. Without the key, the insights engine falls back to rule-based analysis automatically

---

## 7. Error Monitoring (Sentry)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

This generates `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`.

Set `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, and `SENTRY_PROJECT` in Vercel env vars.

---

## 8. First Login

1. Visit your deployed app — you'll be redirected to `/login`
2. Click **Sign Up** and create your account
3. The DB trigger automatically sets your role to `agency_admin` (first user)
4. Go to **Settings > Integrations** and connect your first platform
5. Click **Sync Data** in the top bar to trigger an immediate sync
6. Data will appear in the dashboard within 30 seconds

---

## 9. Adding Client Organizations

Via Supabase SQL Editor:

```sql
-- Create a client org
INSERT INTO organizations (name, slug, primary_color)
VALUES ('Client Name', 'client-slug', '#6366f1');

-- Assign a user to that org (after they sign up)
UPDATE users
SET org_id = (SELECT id FROM organizations WHERE slug = 'client-slug'),
    role = 'client_viewer'
WHERE email = 'client@example.com';
```

Then invite them to log in at `https://your-app.vercel.app/client/client-slug`.

Or use **Settings > Team** to manage team members from the UI.

---

## 10. Shareable Reports

Generate a read-only report link (no login required):

```bash
curl -X POST https://your-app.vercel.app/api/reports/share \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <your-session-cookie>' \
  -d '{"orgSlug": "client-slug", "expiresInDays": 7}'
```

Returns a `shareUrl` like `/report/eyJ...` that can be shared directly with clients.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Redirected to login on every page | Check `NEXT_PUBLIC_SUPABASE_URL` and `ANON_KEY` are set correctly |
| Sync failing with 404 | Check integration credentials are marked `is_active = true` in Supabase |
| OAuth redirect mismatch | Ensure redirect URIs in each platform app exactly match your deployment URL |
| RLS blocking queries | Check user has `org_id` set — run `SELECT * FROM users WHERE email = 'you@example.com'` |
| Cron jobs not running | Verify `CRON_SECRET` is set and matches in Vercel env vars |
| Insights returning mock data | Set `OPENAI_API_KEY` in env vars and redeploy |

---

## Environment Variables Reference

See `.env.example` for the full list. Minimum required to run:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`

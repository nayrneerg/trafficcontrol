-- ============================================================
-- DEALS TABLE
-- Stores closed deals/leads pulled from HubSpot & Salesforce
-- ============================================================
create table if not exists public.deals (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  crm_platform text not null check (crm_platform in ('hubspot', 'salesforce')),
  crm_deal_id text not null,                    -- native ID from CRM
  deal_name text,
  stage text not null,                           -- e.g. 'closedwon', 'Closed Won'
  is_closed_won boolean not null default false,
  amount numeric(14,2) not null default 0,       -- deal value in USD
  close_date date,
  created_date date,
  lead_source text,                              -- CRM lead source field
  utm_source text,                               -- UTM params if available
  utm_medium text,
  utm_campaign text,
  contact_email text,
  raw_data jsonb,
  synced_at timestamptz not null default now(),
  unique(org_id, crm_platform, crm_deal_id)
);

alter table public.deals enable row level security;

create policy "agency_admin_all_deals" on public.deals
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'agency_admin'
    )
  );

create policy "client_viewer_org_deals" on public.deals
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and org_id = deals.org_id
    )
  );

create index deals_org_close_date on public.deals(org_id, close_date);
create index deals_org_is_won on public.deals(org_id, is_closed_won);
create index deals_utm_source on public.deals(org_id, utm_source);

-- ============================================================
-- ROI CACHE TABLE
-- Pre-aggregated per-channel ROI for fast dashboard queries
-- ============================================================
create table if not exists public.roi_cache (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  channel text not null,                         -- 'google_ads', 'meta_ads', etc.
  period_start date not null,
  period_end date not null,
  ad_spend numeric(14,2) not null default 0,
  closed_revenue numeric(14,2) not null default 0,
  deals_count integer not null default 0,
  leads_count integer not null default 0,
  cost_per_lead numeric(10,2),
  cost_per_deal numeric(10,2),
  roi_percent numeric(10,2),                     -- (revenue - spend) / spend * 100
  roas numeric(8,4),                             -- revenue / spend
  avg_deal_size numeric(14,2),
  calculated_at timestamptz not null default now(),
  unique(org_id, channel, period_start, period_end)
);

alter table public.roi_cache enable row level security;

create policy "agency_admin_all_roi" on public.roi_cache
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'agency_admin'
    )
  );

create policy "client_viewer_org_roi" on public.roi_cache
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and org_id = roi_cache.org_id
    )
  );

-- ============================================================
-- LEAD SOURCE -> CHANNEL MAPPING TABLE
-- Lets agency map CRM lead sources to ad channels
-- ============================================================
create table if not exists public.lead_source_mappings (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  lead_source_value text not null,               -- e.g. 'Google Ads', 'GOOGLE_ADS'
  mapped_channel text not null,                  -- 'google_ads', 'meta_ads', etc.
  created_at timestamptz not null default now(),
  unique(org_id, lead_source_value)
);

alter table public.lead_source_mappings enable row level security;

create policy "agency_admin_all_mappings" on public.lead_source_mappings
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'agency_admin'
    )
  );

create policy "client_viewer_org_mappings" on public.lead_source_mappings
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and org_id = lead_source_mappings.org_id
    )
  );

-- Seed sensible defaults (agency can override per-org via the UI)
insert into public.lead_source_mappings (org_id, lead_source_value, mapped_channel)
select o.id, v.lead_source_value, v.mapped_channel
from public.organizations o
cross join (values
  ('Google Ads', 'google_ads'),
  ('google_ads', 'google_ads'),
  ('GOOGLE_ADS', 'google_ads'),
  ('google', 'google_ads'),
  ('Google', 'google_ads'),
  ('cpc', 'google_ads'),
  ('Facebook', 'meta_ads'),
  ('facebook', 'meta_ads'),
  ('Meta', 'meta_ads'),
  ('meta_ads', 'meta_ads'),
  ('Instagram', 'meta_ads'),
  ('instagram', 'meta_ads'),
  ('TikTok', 'tiktok_ads'),
  ('tiktok', 'tiktok_ads'),
  ('tiktok_ads', 'tiktok_ads'),
  ('Organic Search', 'organic'),
  ('organic', 'organic'),
  ('SEO', 'organic'),
  ('Email', 'email'),
  ('email', 'email'),
  ('Direct', 'direct'),
  ('Referral', 'referral')
) as v(lead_source_value, mapped_channel)
on conflict do nothing;

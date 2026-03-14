-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  logo_url text,
  primary_color text default '#6366f1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('agency_admin', 'client_viewer')) default 'client_viewer',
  org_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- ============================================================
-- INTEGRATION CREDENTIALS
-- ============================================================
create table if not exists public.integration_credentials (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  platform text not null check (platform in ('google_ads','meta_ads','tiktok_ads','google_analytics','hubspot','salesforce','seo')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scopes text[],
  metadata jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(org_id, platform)
);

alter table public.integration_credentials enable row level security;

-- ============================================================
-- METRICS CACHE
-- ============================================================
create table if not exists public.metrics_cache (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  platform text not null,
  metric_date date not null,
  spend numeric(12,2),
  impressions bigint,
  clicks bigint,
  conversions integer,
  revenue numeric(12,2),
  roas numeric(8,4),
  cpl numeric(10,2),
  ctr numeric(8,6),
  cpc numeric(10,2),
  raw_data jsonb,
  created_at timestamptz not null default now(),
  unique(org_id, platform, metric_date)
);

alter table public.metrics_cache enable row level security;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Organizations: agency_admin sees all, client_viewer sees own org
create policy "agency_admin_all_orgs" on public.organizations
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'agency_admin'
    )
  );

create policy "client_viewer_own_org" on public.organizations
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and org_id = organizations.id
    )
  );

-- Users: agency_admin sees all, users see themselves
create policy "agency_admin_all_users" on public.users
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'agency_admin'
    )
  );

create policy "users_own_record" on public.users
  for select using (id = auth.uid());

-- Integration credentials: scoped to org
create policy "agency_admin_all_credentials" on public.integration_credentials
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'agency_admin'
    )
  );

create policy "client_viewer_org_credentials" on public.integration_credentials
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and org_id = integration_credentials.org_id
    )
  );

-- Metrics cache: scoped to org
create policy "agency_admin_all_metrics" on public.metrics_cache
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'agency_admin'
    )
  );

create policy "client_viewer_org_metrics" on public.metrics_cache
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and org_id = metrics_cache.org_id
    )
  );

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger integration_credentials_updated_at
  before update on public.integration_credentials
  for each row execute function public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'client_viewer'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

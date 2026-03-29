-- LeadForge — run in Supabase SQL Editor or via CLI.
-- Regenerate TS types after changes: npx supabase gen types typescript --project-id <ref> > lib/database.types.ts

create extension if not exists "pgcrypto";

-- Tier limits in app: see lib/plans.ts (monthly leads + max campaigns).
create type public.user_tier as enum ('free', 'starter', 'pro', 'enterprise');

-- ---------------------------------------------------------------------------
-- public.users (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  payment_customer_id text,
  tier public.user_tier not null default 'free',
  monthly_lead_quota_override int,
  created_at timestamptz not null default now(),
  constraint monthly_lead_quota_override_positive
    check (monthly_lead_quota_override is null or monthly_lead_quota_override > 0)
);

create index users_email_idx on public.users (email);

-- ---------------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------------
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  search_parms jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create index campaigns_user_id_idx on public.campaigns (user_id);

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  name text not null,
  linkedin_url text,
  email text,
  personalised_pitch text,
  created_at timestamptz not null default now()
);

create index leads_campaign_id_idx on public.leads (campaign_id);

-- ---------------------------------------------------------------------------
-- Sync new auth.users -> public.users
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.campaigns enable row level security;
alter table public.leads enable row level security;

-- users: own row only
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users_delete_own"
  on public.users for delete
  using (auth.uid() = id);

-- campaigns: scoped by user_id
create policy "campaigns_select_own"
  on public.campaigns for select
  using (user_id = auth.uid());

create policy "campaigns_insert_own"
  on public.campaigns for insert
  with check (user_id = auth.uid());

create policy "campaigns_update_own"
  on public.campaigns for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "campaigns_delete_own"
  on public.campaigns for delete
  using (user_id = auth.uid());

-- leads: only under the user's campaigns
create policy "leads_select_own"
  on public.leads for select
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = leads.campaign_id and c.user_id = auth.uid()
    )
  );

create policy "leads_insert_own"
  on public.leads for insert
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.user_id = auth.uid()
    )
  );

create policy "leads_update_own"
  on public.leads for update
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = leads.campaign_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.user_id = auth.uid()
    )
  );

create policy "leads_delete_own"
  on public.leads for delete
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = leads.campaign_id and c.user_id = auth.uid()
    )
  );

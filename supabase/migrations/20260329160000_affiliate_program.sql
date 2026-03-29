-- LeadForge affiliate program (60% recurring commission on referred payments)

-- ---------------------------------------------------------------------------
-- affiliates (one row per partner user)
-- ---------------------------------------------------------------------------
create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  referral_code text not null unique,
  total_earnings_minor bigint not null default 0 check (total_earnings_minor >= 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- users: who referred this customer (set once at signup via referral cookie)
-- ---------------------------------------------------------------------------
alter table public.users
  add column if not exists referred_by_affiliate_id uuid references public.affiliates (id) on delete set null;

create index users_referred_by_affiliate_id_idx on public.users (referred_by_affiliate_id);

-- ---------------------------------------------------------------------------
-- affiliate_commissions (one row per successful payment from a referred user)
-- ---------------------------------------------------------------------------
create table public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  referred_user_id uuid not null references public.users (id) on delete cascade,
  payment_intent_id text not null unique,
  amount_paid_minor bigint not null check (amount_paid_minor > 0),
  commission_minor bigint not null check (commission_minor >= 0),
  currency text not null,
  created_at timestamptz not null default now()
);

create index affiliate_commissions_affiliate_id_idx on public.affiliate_commissions (affiliate_id);
create index affiliate_commissions_created_at_idx on public.affiliate_commissions (created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.affiliates enable row level security;
alter table public.affiliate_commissions enable row level security;

create policy "affiliates_select_own"
  on public.affiliates for select
  using (auth.uid() = user_id);

create policy "affiliates_insert_own"
  on public.affiliates for insert
  with check (auth.uid() = user_id);

create policy "affiliate_commissions_select_own"
  on public.affiliate_commissions for select
  using (
    affiliate_id in (select id from public.affiliates where user_id = auth.uid())
  );

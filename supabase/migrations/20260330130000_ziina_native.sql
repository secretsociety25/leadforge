-- Legacy rename if an older migration added stripe_subscription_id.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'stripe_subscription_id'
  ) then
    alter table public.users
      rename column stripe_subscription_id to ziina_last_payment_intent_id;
  end if;
end $$;

alter table public.users
  add column if not exists ziina_last_payment_intent_id text;

alter table public.users
  add column if not exists tier_expires_at timestamptz;

create table if not exists public.ziina_checkout_operations (
  operation_id uuid primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  tier public.user_tier not null,
  billing_interval text not null,
  created_at timestamptz not null default now(),
  constraint ziina_checkout_operations_billing_interval_check
    check (billing_interval in ('month', 'year')),
  constraint ziina_checkout_operations_tier_paid_check
    check (tier in ('starter', 'pro', 'enterprise'))
);

create index if not exists ziina_checkout_operations_user_id_idx
  on public.ziina_checkout_operations (user_id);

alter table public.ziina_checkout_operations enable row level security;

-- Repair: create ziina_checkout_operations (and related billing bits) if the project
-- never applied earlier migrations — fixes PostgREST "not in schema cache" / missing table.

create table if not exists public.ziina_checkout_operations (
  operation_id uuid primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  tier public.user_tier not null,
  billing_interval text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ziina_checkout_operations_billing_interval_check'
  ) then
    alter table public.ziina_checkout_operations
      add constraint ziina_checkout_operations_billing_interval_check
      check (billing_interval in ('month', 'year'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ziina_checkout_operations_tier_paid_check'
  ) then
    alter table public.ziina_checkout_operations
      add constraint ziina_checkout_operations_tier_paid_check
      check (tier in ('starter', 'pro', 'enterprise'));
  end if;
end $$;

alter table public.ziina_checkout_operations
  add column if not exists currency text not null default 'AED';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ziina_checkout_operations_currency_check'
  ) then
    alter table public.ziina_checkout_operations
      add constraint ziina_checkout_operations_currency_check
      check (currency in ('AED', 'GBP', 'EUR'));
  end if;
end $$;

alter table public.ziina_checkout_operations
  add column if not exists payment_intent_id text;

create index if not exists ziina_checkout_operations_user_id_idx
  on public.ziina_checkout_operations (user_id);

create index if not exists ziina_checkout_operations_payment_intent_id_idx
  on public.ziina_checkout_operations (payment_intent_id)
  where payment_intent_id is not null;

alter table public.ziina_checkout_operations enable row level security;

-- Webhook idempotency (often missing together with checkout operations)
create table if not exists public.processed_webhook_events (
  id text primary key,
  provider text not null default 'ziina',
  created_at timestamptz not null default now()
);

alter table public.processed_webhook_events enable row level security;

-- Columns the Ziina webhook updates on users
alter table public.users
  add column if not exists ziina_customer_id text,
  add column if not exists ziina_last_payment_intent_id text,
  add column if not exists tier_expires_at timestamptz,
  add column if not exists billing_currency text;

create index if not exists users_ziina_customer_id_idx on public.users (ziina_customer_id);

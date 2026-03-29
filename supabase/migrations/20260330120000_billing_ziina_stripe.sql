-- Billing: Ziina payment customer id + last payment intent ref + webhook idempotency.
alter table public.users
  add column if not exists ziina_customer_id text,
  add column if not exists ziina_last_payment_intent_id text;

create index if not exists users_ziina_customer_id_idx on public.users (ziina_customer_id);

create table if not exists public.processed_webhook_events (
  id text primary key,
  provider text not null default 'ziina',
  created_at timestamptz not null default now()
);

alter table public.processed_webhook_events enable row level security;

-- No policies: anon/authenticated cannot access; service role bypasses RLS for webhooks.

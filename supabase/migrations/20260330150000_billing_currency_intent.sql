-- Last successful checkout currency + payment intent ref on checkout row and user profile.
alter table public.ziina_checkout_operations
  add column if not exists payment_intent_id text;

alter table public.users
  add column if not exists billing_currency text;

create index if not exists ziina_checkout_operations_payment_intent_id_idx
  on public.ziina_checkout_operations (payment_intent_id)
  where payment_intent_id is not null;

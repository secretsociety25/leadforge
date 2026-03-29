-- Track billing currency for Ziina payment intent + webhook amount checks.
alter table public.ziina_checkout_operations
  add column if not exists currency text not null default 'AED';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ziina_checkout_operations_currency_check'
  ) then
    alter table public.ziina_checkout_operations
      add constraint ziina_checkout_operations_currency_check
      check (currency in ('AED', 'GBP', 'EUR'));
  end if;
end $$;

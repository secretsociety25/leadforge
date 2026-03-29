-- LeadForge CSV + AI email MVP: extra columns on public.leads

alter table public.leads
  add column if not exists status text not null default 'pending';

alter table public.leads
  add column if not exists first_name text;

alter table public.leads
  add column if not exists company text;

alter table public.leads
  add column if not exists target_problem text;

alter table public.leads
  add column if not exists ai_email_draft text;

alter table public.leads
  add column if not exists raw_row jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_status_check'
  ) then
    alter table public.leads
      add constraint leads_status_check
      check (status in ('pending', 'ready', 'generated', 'error'));
  end if;
end $$;

create index if not exists leads_campaign_id_status_idx on public.leads (campaign_id, status);

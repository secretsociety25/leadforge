-- Atomic monthly lead quota: single transaction + row lock on public.users.
-- Tier limits MUST match lib/plans.ts (TIER_LIMITS.monthlyLeads + override rules).

-- Start of current calendar month in UTC (matches prior JS startOfUtcMonthIso / count queries).
create or replace function public.utc_month_start()
returns timestamptz
language sql
stable
set search_path = public
as $$
  select (date_trunc('month', timezone('UTC', now()))) at time zone 'UTC';
$$;

-- Lead count this month for the authenticated user (same boundary as quota enforcement).
create or replace function public.count_user_leads_this_month()
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::integer
  from public.leads l
  inner join public.campaigns c on c.id = l.campaign_id
  where c.user_id = auth.uid()
    and l.created_at >= public.utc_month_start();
$$;

-- Lock user row -> count -> optional insert; prevents concurrent quota bypass.
create or replace function public.insert_lead_with_quota(
  p_campaign_id uuid,
  p_name text,
  p_linkedin_url text,
  p_email text,
  p_personalised_pitch text
)
returns public.leads
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tier public.user_tier;
  v_override int;
  v_limit int;
  v_used int;
  v_row public.leads;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select u.tier, u.monthly_lead_quota_override
  into v_tier, v_override
  from public.users u
  where u.id = v_user_id
  for update;

  if not found then
    raise exception 'User profile not found';
  end if;

  v_limit := case
    when v_override is not null and v_override > 0 then v_override
    when v_tier = 'enterprise' then null
    when v_tier = 'free' then 25
    when v_tier = 'starter' then 500
    when v_tier = 'pro' then 5000
    else null
  end;

  if not exists (
    select 1 from public.campaigns c
    where c.id = p_campaign_id and c.user_id = v_user_id
  ) then
    raise exception 'Campaign not found or access denied';
  end if;

  if v_limit is not null then
    select count(*)::int into v_used
    from public.leads l
    inner join public.campaigns c on c.id = l.campaign_id
    where c.user_id = v_user_id
      and l.created_at >= public.utc_month_start();

    if v_used >= v_limit then
      raise exception 'Monthly lead limit reached for your tier';
    end if;
  end if;

  insert into public.leads (campaign_id, name, linkedin_url, email, personalised_pitch)
  values (p_campaign_id, p_name, p_linkedin_url, p_email, p_personalised_pitch)
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.utc_month_start() from public;
revoke all on function public.count_user_leads_this_month() from public;
revoke all on function public.insert_lead_with_quota(uuid, text, text, text, text) from public;

grant execute on function public.utc_month_start() to authenticated;
grant execute on function public.count_user_leads_this_month() to authenticated;
grant execute on function public.insert_lead_with_quota(uuid, text, text, text, text) to authenticated;

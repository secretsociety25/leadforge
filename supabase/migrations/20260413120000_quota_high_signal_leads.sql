-- Align quota CASE with lib/plans.ts TIER_LIMITS (starter 1000, pro 3500, enterprise 10000).
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
    when v_tier = 'free' then 25
    when v_tier = 'starter' then 1000
    when v_tier = 'pro' then 3500
    when v_tier = 'enterprise' then 10000
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

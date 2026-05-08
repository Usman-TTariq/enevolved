-- Fast aggregates for /api/admin/dashboard-stats (service_role only; API uses service key).

create or replace function public.admin_sum_go_link_clicks()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(click_count), 0)::bigint from public.publisher_go_links;
$$;

create or replace function public.admin_publisher_earnings_currency_totals()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with t as (
    select
      upper(trim(currency)) as k,
      sum(commission_total)::numeric as comm,
      sum(sale_total)::numeric as sale
    from public.publisher_earnings_daily
    group by 1
  )
  select jsonb_build_object(
    'commissionByCurrency',
    coalesce((select jsonb_object_agg(k, comm) from t), '{}'::jsonb),
    'saleByCurrency',
    coalesce((select jsonb_object_agg(k, sale) from t), '{}'::jsonb)
  );
$$;

create or replace function public.admin_awin_transactions_window_totals(p_start timestamptz, p_end timestamptz)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with filtered as (
    select sale_amount, sale_currency, commission_amount, commission_currency, publisher_id
    from public.awin_transactions
    where transaction_date >= p_start and transaction_date <= p_end
  ),
  counts as (
    select
      count(*)::bigint as cnt_all,
      count(*) filter (where publisher_id is not null)::bigint as cnt_attr
    from filtered
  ),
  sale as (
    select
      upper(coalesce(nullif(trim(sale_currency), ''), 'GBP')) as k,
      sum(sale_amount)::numeric as v
    from filtered
    group by 1
  ),
  comm as (
    select
      upper(coalesce(nullif(trim(commission_currency), ''), 'GBP')) as k,
      sum(commission_amount)::numeric as v
    from filtered
    group by 1
  )
  select jsonb_build_object(
    'countAll', (select cnt_all from counts),
    'countAttributed', (select cnt_attr from counts),
    'saleByCurrency', coalesce((select jsonb_object_agg(k, v) from sale), '{}'::jsonb),
    'commissionByCurrency', coalesce((select jsonb_object_agg(k, v) from comm), '{}'::jsonb)
  );
$$;

create or replace function public.admin_sum_attributed_awin_by_currency()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with filtered as (
    select sale_amount, sale_currency, commission_amount, commission_currency
    from public.awin_transactions
    where publisher_id is not null
  ),
  sale as (
    select
      upper(coalesce(nullif(trim(sale_currency), ''), 'GBP')) as k,
      sum(sale_amount)::numeric as v
    from filtered
    group by 1
  ),
  comm as (
    select
      upper(coalesce(nullif(trim(commission_currency), ''), 'GBP')) as k,
      sum(commission_amount)::numeric as v
    from filtered
    group by 1
  )
  select jsonb_build_object(
    'commissionByCurrency', coalesce((select jsonb_object_agg(k, v) from comm), '{}'::jsonb),
    'saleByCurrency', coalesce((select jsonb_object_agg(k, v) from sale), '{}'::jsonb)
  );
$$;

revoke all on function public.admin_sum_go_link_clicks() from public;
grant execute on function public.admin_sum_go_link_clicks() to service_role;

revoke all on function public.admin_publisher_earnings_currency_totals() from public;
grant execute on function public.admin_publisher_earnings_currency_totals() to service_role;

revoke all on function public.admin_awin_transactions_window_totals(timestamptz, timestamptz) from public;
grant execute on function public.admin_awin_transactions_window_totals(timestamptz, timestamptz) to service_role;

revoke all on function public.admin_sum_attributed_awin_by_currency() from public;
grant execute on function public.admin_sum_attributed_awin_by_currency() to service_role;

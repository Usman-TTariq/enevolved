-- Fast paths for GET /api/admin/signups (service_role only).

create or replace function public.admin_signups_daily_by_pub_currency(p_publisher_ids uuid[])
returns table (
  publisher_id uuid,
  currency text,
  commission_total numeric,
  sale_total numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.publisher_id,
    upper(trim(d.currency)) as currency,
    sum(d.commission_total)::numeric as commission_total,
    sum(d.sale_total)::numeric as sale_total
  from public.publisher_earnings_daily as d
  where d.publisher_id = any(p_publisher_ids)
  group by d.publisher_id, upper(trim(d.currency));
$$;

-- Direct Awin rows (publisher_id set): commission and sale grouped separately per currency.
create or replace function public.admin_signups_awin_direct_lines(p_publisher_ids uuid[])
returns table (
  publisher_id uuid,
  kind text,
  currency text,
  amount numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    t.publisher_id,
    'commission'::text as kind,
    upper(coalesce(nullif(trim(t.commission_currency), ''), 'GBP')) as currency,
    sum(t.commission_amount)::numeric as amount
  from public.awin_transactions as t
  where t.publisher_id is not null
    and t.publisher_id = any(p_publisher_ids)
  group by t.publisher_id, upper(coalesce(nullif(trim(t.commission_currency), ''), 'GBP'))
  union all
  select
    t.publisher_id,
    'sale'::text as kind,
    upper(coalesce(nullif(trim(t.sale_currency), ''), 'GBP')) as currency,
    sum(t.sale_amount)::numeric as amount
  from public.awin_transactions as t
  where t.publisher_id is not null
    and t.publisher_id = any(p_publisher_ids)
  group by t.publisher_id, upper(coalesce(nullif(trim(t.sale_currency), ''), 'GBP'));
$$;

-- Slug-only bucket: unattributed rows (publisher_id is null) matched to a publisher via go_link_slug,
-- exact click_ref, or /go/short/{slug} in click_ref (no broad %slug% scan).
create or replace function public.admin_signups_awin_slug_null_pub_lines(p_publisher_ids uuid[])
returns table (
  publisher_id uuid,
  kind text,
  currency text,
  amount numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with links as (
    select l.publisher_id, trim(l.slug) as slug
    from public.publisher_go_links as l
    where l.publisher_id = any(p_publisher_ids)
      and char_length(trim(l.slug)) between 6 and 32
  ),
  hit as (
    select distinct on (t.awin_transaction_id, l.publisher_id)
      l.publisher_id as owner_id,
      t.commission_amount,
      t.commission_currency,
      t.sale_amount,
      t.sale_currency
    from public.awin_transactions as t
    inner join links as l
      on (
        t.go_link_slug = l.slug
        or (t.click_ref is not null and trim(t.click_ref) = l.slug)
        or (
          t.click_ref is not null
          and t.click_ref ilike '%/go/short/' || l.slug || '%'
        )
      )
    where t.publisher_id is null
    order by t.awin_transaction_id, l.publisher_id
  )
  select
    h.owner_id as publisher_id,
    'commission'::text as kind,
    upper(coalesce(nullif(trim(h.commission_currency), ''), 'GBP')) as currency,
    sum(h.commission_amount)::numeric as amount
  from hit as h
  group by h.owner_id, upper(coalesce(nullif(trim(h.commission_currency), ''), 'GBP'))
  union all
  select
    h.owner_id as publisher_id,
    'sale'::text as kind,
    upper(coalesce(nullif(trim(h.sale_currency), ''), 'GBP')) as currency,
    sum(h.sale_amount)::numeric as amount
  from hit as h
  group by h.owner_id, upper(coalesce(nullif(trim(h.sale_currency), ''), 'GBP'));
$$;

revoke all on function public.admin_signups_daily_by_pub_currency(uuid[]) from public;
grant execute on function public.admin_signups_daily_by_pub_currency(uuid[]) to service_role;

revoke all on function public.admin_signups_awin_direct_lines(uuid[]) from public;
grant execute on function public.admin_signups_awin_direct_lines(uuid[]) to service_role;

revoke all on function public.admin_signups_awin_slug_null_pub_lines(uuid[]) from public;
grant execute on function public.admin_signups_awin_slug_null_pub_lines(uuid[]) to service_role;

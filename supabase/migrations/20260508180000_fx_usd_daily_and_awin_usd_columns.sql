-- ECB (via Frankfurter) daily FX cached in DB; USD columns on awin_transactions filled at sync time.

create table if not exists public.fx_daily_rates (
  rate_date date not null,
  currency text not null,
  usd_per_unit numeric(20, 10) not null,
  source text not null default 'frankfurter',
  fetched_at timestamptz not null default now(),
  primary key (rate_date, currency)
);

comment on table public.fx_daily_rates is 'USD per 1 unit of currency for rate_date (UTC calendar day of transaction).';

create index if not exists fx_daily_rates_currency_date_idx
  on public.fx_daily_rates (currency, rate_date desc);

alter table public.awin_transactions
  add column if not exists commission_amount_usd numeric(18, 6) not null default 0,
  add column if not exists sale_amount_usd numeric(18, 6) not null default 0;

comment on column public.awin_transactions.commission_amount_usd is 'Approx commission in USD (ECB/Frankfurter vs transaction UTC date).';
comment on column public.awin_transactions.sale_amount_usd is 'Approx sale in USD (ECB/Frankfurter vs transaction UTC date).';

alter table public.publisher_earnings_daily
  add column if not exists commission_total_usd numeric(18, 6) not null default 0,
  add column if not exists sale_total_usd numeric(18, 6) not null default 0;

create or replace function public.refresh_publisher_earnings_daily()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  truncate table public.publisher_earnings_daily;
  insert into public.publisher_earnings_daily (
    publisher_id,
    earn_date,
    currency,
    commission_total,
    sale_total,
    txn_count,
    commission_total_usd,
    sale_total_usd,
    updated_at
  )
  select
    t.publisher_id,
    (t.transaction_date at time zone 'UTC')::date as earn_date,
    t.commission_currency,
    sum(t.commission_amount)::numeric(18, 6),
    sum(t.sale_amount)::numeric(18, 6),
    count(*)::int,
    sum(coalesce(t.commission_amount_usd, 0))::numeric(18, 6),
    sum(coalesce(t.sale_amount_usd, 0))::numeric(18, 6),
    now()
  from public.awin_transactions t
  where t.publisher_id is not null
  group by t.publisher_id, (t.transaction_date at time zone 'UTC')::date, t.commission_currency;
end;
$$;

grant execute on function public.refresh_publisher_earnings_daily() to service_role;

alter table public.fx_daily_rates enable row level security;

notify pgrst, 'reload schema';

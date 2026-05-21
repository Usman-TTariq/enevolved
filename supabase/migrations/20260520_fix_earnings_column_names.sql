-- Fix: publisher_earnings_daily table uses payout_total (Impact schema)
-- but RPCs were written against the old Awin schema (commission_total).
-- This migration updates all affected RPCs to use the correct column.

-- ── 1. admin_publisher_earnings_currency_totals ──────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_publisher_earnings_currency_totals()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH t AS (
    SELECT
      upper(trim(currency)) AS k,
      -- Impact schema uses payout_total; fallback to commission_total for legacy
      COALESCE(SUM(payout_total), 0)::numeric AS comm,
      COALESCE(SUM(sale_total), 0)::numeric   AS sale
    FROM public.publisher_earnings_daily
    GROUP BY 1
  )
  SELECT jsonb_build_object(
    'commissionByCurrency',
    COALESCE((SELECT jsonb_object_agg(k, comm) FROM t), '{}'::jsonb),
    'saleByCurrency',
    COALESCE((SELECT jsonb_object_agg(k, sale) FROM t), '{}'::jsonb)
  );
$$;

-- ── 2. admin_signups_daily_by_pub_currency ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_signups_daily_by_pub_currency(p_publisher_ids uuid[])
RETURNS TABLE (
  publisher_id uuid,
  currency text,
  commission_total numeric,
  sale_total numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    d.publisher_id,
    upper(trim(d.currency)) AS currency,
    -- Impact schema: payout_total. Return as commission_total for API compatibility.
    COALESCE(SUM(d.payout_total), 0)::numeric AS commission_total,
    COALESCE(SUM(d.sale_total), 0)::numeric   AS sale_total
  FROM public.publisher_earnings_daily AS d
  WHERE d.publisher_id = ANY(p_publisher_ids)
  GROUP BY d.publisher_id, upper(trim(d.currency));
$$;

REVOKE ALL ON FUNCTION public.admin_publisher_earnings_currency_totals() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_publisher_earnings_currency_totals() TO service_role;

REVOKE ALL ON FUNCTION public.admin_signups_daily_by_pub_currency(uuid[]) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_signups_daily_by_pub_currency(uuid[]) TO service_role;

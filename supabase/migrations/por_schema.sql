-- ─────────────────────────────────────────────────────────────────────────────
-- PaidOnResults Integration Schema
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Merchants cache
CREATE TABLE IF NOT EXISTS public.por_merchants (
  id                    bigserial PRIMARY KEY,
  merchant_id           text NOT NULL UNIQUE,          -- MerchantID from API
  name                  text NOT NULL,                 -- MerchantName
  url                   text,                          -- MerchantURL
  tracking_url          text,                          -- AffiliateURL (base tracking URL)
  logo_url              text,                          -- Creative120x60 (banner)
  category              text,                          -- MerchantCategory
  description           text,                          -- MerchantCaption
  commission_rate       text,                          -- SampleCommissionRates (e.g. "10%")
  average_commission    text,                          -- AverageCommission
  average_basket        text,                          -- AverageBasket
  cookie_length         integer,                       -- CookieLength (days)
  deep_links            boolean DEFAULT false,         -- DeepLinks YES/NO
  merchant_status       text DEFAULT 'LIVE',           -- MerchantStatus
  affiliate_status      text,                          -- AffiliateStatus (JOINED etc)
  conversion_ratio      text,                          -- ConversionRatio
  approval_rate         text,                          -- ApprovalRate
  void_rate             text,                          -- VoidRate
  raw                   jsonb,
  fetched_at            timestamptz DEFAULT now(),
  created_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_por_merchants_status ON public.por_merchants (affiliate_status);
CREATE INDEX IF NOT EXISTS idx_por_merchants_category ON public.por_merchants (category);

-- 2. Transactions
CREATE TABLE IF NOT EXISTS public.por_transactions (
  id                  bigserial PRIMARY KEY,
  network_order_id    text NOT NULL UNIQUE,            -- NetworkOrderID
  merchant_id         text,                            -- MerchantID
  merchant_name       text,                            -- MerchantName
  order_date          timestamptz,                     -- OrderDate
  date_added          timestamptz,                     -- DateAdded
  date_updated        timestamptz,                     -- DateUpdated
  order_value         numeric(12,4),                   -- OrderValue
  affiliate_commission numeric(12,4) DEFAULT 0,        -- AffiliateCommission
  currency            text DEFAULT 'GBP',
  transaction_type    text,                            -- TransactionType (Sale/Lead)
  transaction_status  text DEFAULT 'pending',          -- pending | validated | void
  paid_to_affiliate   boolean DEFAULT false,           -- PaidtoAffiliate
  custom_tracking_id  text,                            -- CustomTrackingID = our go-link slug
  go_link_slug        text,                            -- resolved publisher slug
  publisher_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  synced_at           timestamptz DEFAULT now(),
  raw                 jsonb
);

CREATE INDEX IF NOT EXISTS idx_por_txn_merchant    ON public.por_transactions (merchant_id);
CREATE INDEX IF NOT EXISTS idx_por_txn_publisher   ON public.por_transactions (publisher_id);
CREATE INDEX IF NOT EXISTS idx_por_txn_slug        ON public.por_transactions (go_link_slug) WHERE go_link_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_por_txn_date        ON public.por_transactions (order_date);
CREATE INDEX IF NOT EXISTS idx_por_txn_tracking    ON public.por_transactions (custom_tracking_id) WHERE custom_tracking_id IS NOT NULL;

-- 3. Publisher applications
CREATE TABLE IF NOT EXISTS public.publisher_por_applications (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  publisher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id  text NOT NULL,
  status       text NOT NULL DEFAULT 'pending',        -- pending | approved | rejected
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (publisher_id, merchant_id)
);

CREATE INDEX IF NOT EXISTS idx_por_apps_publisher ON public.publisher_por_applications (publisher_id);
CREATE INDEX IF NOT EXISTS idx_por_apps_merchant  ON public.publisher_por_applications (merchant_id);
CREATE INDEX IF NOT EXISTS idx_por_apps_status    ON public.publisher_por_applications (status);

-- 4. Sync state
CREATE TABLE IF NOT EXISTS public.por_sync_state (
  id                text PRIMARY KEY DEFAULT 'default',
  last_completed_at timestamptz,
  last_error        text,
  updated_at        timestamptz DEFAULT now()
);

INSERT INTO public.por_sync_state (id) VALUES ('default') ON CONFLICT DO NOTHING;

-- 5. Daily earnings rollup
CREATE TABLE IF NOT EXISTS public.por_publisher_earnings_daily (
  publisher_id         uuid NOT NULL,
  date                 date NOT NULL,
  merchant_id          text NOT NULL DEFAULT '',
  commission           numeric(12,4) DEFAULT 0,
  order_value          numeric(12,4) DEFAULT 0,
  currency             text NOT NULL DEFAULT 'GBP',
  transaction_count    integer DEFAULT 0,
  PRIMARY KEY (publisher_id, date, merchant_id, currency)
);

CREATE INDEX IF NOT EXISTS idx_por_daily_publisher ON public.por_publisher_earnings_daily (publisher_id);
CREATE INDEX IF NOT EXISTS idx_por_daily_date      ON public.por_publisher_earnings_daily (date);

-- 6. RLS
ALTER TABLE public.por_merchants                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.por_transactions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_por_applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.por_sync_state               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.por_publisher_earnings_daily ENABLE ROW LEVEL SECURITY;

-- Service role bypass
CREATE POLICY "service_all_por_merchants"  ON public.por_merchants                FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_por_txn"        ON public.por_transactions             FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_por_apps"       ON public.publisher_por_applications   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_por_sync"       ON public.por_sync_state               FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_por_daily"      ON public.por_publisher_earnings_daily FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Publishers read all merchants
CREATE POLICY "authenticated_read_por_merchants" ON public.por_merchants
  FOR SELECT TO authenticated USING (true);

-- Publishers read/insert own applications
CREATE POLICY "publisher_read_own_por_apps" ON public.publisher_por_applications
  FOR SELECT TO authenticated USING (publisher_id = auth.uid());
CREATE POLICY "publisher_insert_own_por_apps" ON public.publisher_por_applications
  FOR INSERT TO authenticated WITH CHECK (publisher_id = auth.uid());

-- Publishers read own earnings
CREATE POLICY "publisher_read_own_por_daily" ON public.por_publisher_earnings_daily
  FOR SELECT TO authenticated USING (publisher_id = auth.uid());

-- 7. Earnings refresh function
CREATE OR REPLACE FUNCTION public.refresh_por_publisher_earnings_daily()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  TRUNCATE TABLE public.por_publisher_earnings_daily;
  INSERT INTO public.por_publisher_earnings_daily
    (publisher_id, date, merchant_id, commission, order_value, currency, transaction_count)
  SELECT
    publisher_id,
    DATE(COALESCE(order_date, date_added) AT TIME ZONE 'UTC') AS date,
    COALESCE(merchant_id, '')                                  AS merchant_id,
    SUM(affiliate_commission)                                  AS commission,
    SUM(COALESCE(order_value, 0))                              AS order_value,
    COALESCE(currency, 'GBP')                                  AS currency,
    COUNT(*)                                                   AS transaction_count
  FROM public.por_transactions
  WHERE publisher_id IS NOT NULL
    AND transaction_status IN ('validated', 'pending')
    AND COALESCE(order_date, date_added) IS NOT NULL
  GROUP BY publisher_id, date, merchant_id, currency;
END;
$$;

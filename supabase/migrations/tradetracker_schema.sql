-- ─────────────────────────────────────────────────────────────────────────────
-- TradeTracker Integration Schema
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Campaigns cache (from all locales)
CREATE TABLE IF NOT EXISTS public.tradetracker_campaigns (
  id                    bigserial PRIMARY KEY,
  tt_campaign_id        text NOT NULL UNIQUE,          -- Campaign.ID from SOAP
  locale                text NOT NULL DEFAULT 'nl_NL', -- which locale/passphrase fetched it
  name                  text NOT NULL,
  url                   text,                          -- Campaign.URL (advertiser website)
  tracking_url          text,                          -- CampaignInfo.trackingURL
  logo_url              text,                          -- CampaignInfo.imageURL
  assignment_status     text,                          -- accepted | pending | rejected
  commission_type       text,                          -- percentage | fixed | lead
  commission_percentage numeric(10,4),
  commission_fixed_fee  numeric(10,4),
  currency              text DEFAULT 'EUR',
  description           text,
  deeplinking_supported boolean DEFAULT false,
  raw                   jsonb,
  fetched_at            timestamptz DEFAULT now(),
  created_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tt_campaigns_locale ON public.tradetracker_campaigns (locale);
CREATE INDEX IF NOT EXISTS idx_tt_campaigns_status ON public.tradetracker_campaigns (assignment_status);

-- 2. Conversion transactions
CREATE TABLE IF NOT EXISTS public.tradetracker_transactions (
  id                  bigserial PRIMARY KEY,
  tt_transaction_id   text NOT NULL UNIQUE,            -- ConversionTransaction.ID
  tt_campaign_id      text,
  locale              text,
  affiliate_site_id   text,
  reference           text,                            -- our go-link slug passed as ?r=<slug>
  transaction_type    text,                            -- sale | lead | click
  transaction_status  text,                            -- pending | accepted | rejected
  commission          numeric(12,4) DEFAULT 0,
  order_amount        numeric(12,4),
  currency            text DEFAULT 'EUR',
  registration_date   timestamptz,
  go_link_slug        text,                            -- resolved slug
  publisher_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  synced_at           timestamptz DEFAULT now(),
  raw                 jsonb
);

CREATE INDEX IF NOT EXISTS idx_tt_txn_campaign   ON public.tradetracker_transactions (tt_campaign_id);
CREATE INDEX IF NOT EXISTS idx_tt_txn_publisher  ON public.tradetracker_transactions (publisher_id);
CREATE INDEX IF NOT EXISTS idx_tt_txn_slug       ON public.tradetracker_transactions (go_link_slug) WHERE go_link_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tt_txn_date       ON public.tradetracker_transactions (registration_date);
CREATE INDEX IF NOT EXISTS idx_tt_txn_reference  ON public.tradetracker_transactions (reference) WHERE reference IS NOT NULL;

-- 3. Publisher applications for TradeTracker campaigns
CREATE TABLE IF NOT EXISTS public.publisher_tradetracker_applications (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  publisher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id  text NOT NULL,
  status       text NOT NULL DEFAULT 'pending',     -- pending | approved | rejected
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (publisher_id, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_tt_apps_publisher ON public.publisher_tradetracker_applications (publisher_id);
CREATE INDEX IF NOT EXISTS idx_tt_apps_campaign  ON public.publisher_tradetracker_applications (campaign_id);
CREATE INDEX IF NOT EXISTS idx_tt_apps_status    ON public.publisher_tradetracker_applications (status);

-- 4. Sync state
CREATE TABLE IF NOT EXISTS public.tradetracker_sync_state (
  id                text PRIMARY KEY DEFAULT 'default',
  last_completed_at timestamptz,
  last_window_end   timestamptz,
  last_error        text,
  updated_at        timestamptz DEFAULT now()
);

INSERT INTO public.tradetracker_sync_state (id) VALUES ('default') ON CONFLICT DO NOTHING;

-- 5. Daily earnings rollup
CREATE TABLE IF NOT EXISTS public.tradetracker_publisher_earnings_daily (
  publisher_id      uuid NOT NULL,
  date              date NOT NULL,
  campaign_id       text NOT NULL DEFAULT '',
  locale            text NOT NULL DEFAULT '',
  commission        numeric(12,4) DEFAULT 0,
  order_amount      numeric(12,4) DEFAULT 0,
  currency          text NOT NULL DEFAULT 'EUR',
  transaction_count integer DEFAULT 0,
  PRIMARY KEY (publisher_id, date, campaign_id, currency)
);

CREATE INDEX IF NOT EXISTS idx_tt_daily_publisher ON public.tradetracker_publisher_earnings_daily (publisher_id);
CREATE INDEX IF NOT EXISTS idx_tt_daily_date      ON public.tradetracker_publisher_earnings_daily (date);

-- 6. RLS policies
ALTER TABLE public.tradetracker_campaigns              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradetracker_transactions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_tradetracker_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradetracker_sync_state             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradetracker_publisher_earnings_daily ENABLE ROW LEVEL SECURITY;

-- Service-role bypass (used by server-side API routes)
CREATE POLICY "service_all_tt_campaigns"   ON public.tradetracker_campaigns              FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_tt_txn"         ON public.tradetracker_transactions           FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_tt_apps"        ON public.publisher_tradetracker_applications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_tt_sync"        ON public.tradetracker_sync_state             FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_tt_daily"       ON public.tradetracker_publisher_earnings_daily FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Publishers can read their own applications
CREATE POLICY "publisher_read_own_tt_apps" ON public.publisher_tradetracker_applications
  FOR SELECT TO authenticated USING (publisher_id = auth.uid());

-- Publishers can insert their own applications
CREATE POLICY "publisher_insert_own_tt_apps" ON public.publisher_tradetracker_applications
  FOR INSERT TO authenticated WITH CHECK (publisher_id = auth.uid());

-- Publishers can see all campaigns
CREATE POLICY "authenticated_read_tt_campaigns" ON public.tradetracker_campaigns
  FOR SELECT TO authenticated USING (true);

-- Publishers can see their own earnings
CREATE POLICY "publisher_read_own_tt_daily" ON public.tradetracker_publisher_earnings_daily
  FOR SELECT TO authenticated USING (publisher_id = auth.uid());

-- 7. Refresh function
CREATE OR REPLACE FUNCTION public.refresh_tradetracker_publisher_earnings_daily()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  TRUNCATE TABLE public.tradetracker_publisher_earnings_daily;
  INSERT INTO public.tradetracker_publisher_earnings_daily
    (publisher_id, date, campaign_id, locale, commission, order_amount, currency, transaction_count)
  SELECT
    publisher_id,
    DATE(registration_date AT TIME ZONE 'UTC') AS date,
    COALESCE(tt_campaign_id, '')                AS campaign_id,
    COALESCE(locale, '')                        AS locale,
    SUM(commission)                             AS commission,
    SUM(COALESCE(order_amount, 0))              AS order_amount,
    currency,
    COUNT(*)                                    AS transaction_count
  FROM public.tradetracker_transactions
  WHERE publisher_id IS NOT NULL
    AND transaction_status IN ('accepted', 'pending')
    AND registration_date IS NOT NULL
  GROUP BY publisher_id, date, tt_campaign_id, locale, currency;
END;
$$;

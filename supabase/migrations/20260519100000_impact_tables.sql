-- ============================================================
-- Add Impact.com integration tables alongside existing Awin schema
-- ============================================================

-- impact_campaigns  (mirrors awin_programmes, but uses text campaign IDs)
CREATE TABLE IF NOT EXISTS public.impact_campaigns (
  impact_id        text NOT NULL,
  name             text NOT NULL,
  advertiser_name  text,
  logo_url         text,
  click_through_url text,
  currency         text,
  status           text,
  raw              jsonb,
  fetched_at       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT impact_campaigns_pkey PRIMARY KEY (impact_id)
);

-- impact_action_sync_state  (mirrors awin_transaction_sync_state)
CREATE TABLE IF NOT EXISTS public.impact_action_sync_state (
  id                   text NOT NULL DEFAULT 'default'::text,
  last_completed_at    timestamp with time zone,
  last_window_end      timestamp with time zone,
  last_error           text,
  updated_at           timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT impact_action_sync_state_pkey PRIMARY KEY (id)
);

-- impact_actions  (mirrors awin_transactions; payout = publisher commission)
CREATE TABLE IF NOT EXISTS public.impact_actions (
  action_id             text NOT NULL,
  campaign_id           text,
  order_id              text,
  action_status         text,
  payout                numeric NOT NULL DEFAULT 0,
  payout_currency       text NOT NULL DEFAULT 'USD'::text,
  payout_usd            numeric NOT NULL DEFAULT 0,
  sale_amount           numeric NOT NULL DEFAULT 0,
  sale_currency         text NOT NULL DEFAULT 'USD'::text,
  sale_amount_usd       numeric NOT NULL DEFAULT 0,
  action_date           timestamp with time zone NOT NULL,
  sub_id3               text,            -- our go-link slug passed as SubId3 on redirect
  publisher_id          uuid,
  go_link_slug          text,
  synced_at             timestamp with time zone NOT NULL DEFAULT now(),
  manually_assigned_at  timestamp with time zone,
  manually_assigned_by  uuid,
  raw                   jsonb,
  CONSTRAINT impact_actions_pkey PRIMARY KEY (action_id),
  CONSTRAINT impact_actions_publisher_id_fkey
    FOREIGN KEY (publisher_id) REFERENCES public.profiles(id),
  CONSTRAINT impact_actions_manually_assigned_by_fkey
    FOREIGN KEY (manually_assigned_by) REFERENCES public.profiles(id)
);

-- publisher_impact_applications  (mirrors publisher_awin_applications)
CREATE TABLE IF NOT EXISTS public.publisher_impact_applications (
  id           uuid NOT NULL DEFAULT gen_random_uuid(),
  publisher_id uuid NOT NULL,
  campaign_id  text NOT NULL,
  status       text NOT NULL DEFAULT 'pending'::text
    CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at   timestamp with time zone NOT NULL DEFAULT now(),
  updated_at   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT publisher_impact_applications_pkey PRIMARY KEY (id),
  CONSTRAINT publisher_impact_applications_publisher_id_fkey
    FOREIGN KEY (publisher_id) REFERENCES public.profiles(id),
  CONSTRAINT publisher_impact_applications_campaign_id_fkey
    FOREIGN KEY (campaign_id) REFERENCES public.impact_campaigns(impact_id)
);

-- impact_publisher_earnings_daily  (separate from Awin's publisher_earnings_daily to avoid column conflicts)
CREATE TABLE IF NOT EXISTS public.impact_publisher_earnings_daily (
  publisher_id     uuid NOT NULL,
  earn_date        date NOT NULL,
  currency         text NOT NULL,
  payout_total     numeric NOT NULL DEFAULT 0,
  payout_total_usd numeric NOT NULL DEFAULT 0,
  sale_total       numeric NOT NULL DEFAULT 0,
  sale_total_usd   numeric NOT NULL DEFAULT 0,
  action_count     integer NOT NULL DEFAULT 0,
  updated_at       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT impact_publisher_earnings_daily_pkey
    PRIMARY KEY (publisher_id, earn_date, currency),
  CONSTRAINT impact_publisher_earnings_daily_publisher_id_fkey
    FOREIGN KEY (publisher_id) REFERENCES public.profiles(id)
);

-- ============================================================
-- Extend publisher_go_links to support multiple networks
-- ============================================================

-- Make programme_id nullable so Impact go-links (no Awin programme) are allowed
ALTER TABLE public.publisher_go_links
  ALTER COLUMN programme_id DROP NOT NULL;

-- Network flag: 'awin' (default) | 'impact'
ALTER TABLE public.publisher_go_links
  ADD COLUMN IF NOT EXISTS network text NOT NULL DEFAULT 'awin'
    CHECK (network = ANY (ARRAY['awin'::text, 'impact'::text]));

-- Optional FK to impact_campaigns when network='impact'
ALTER TABLE public.publisher_go_links
  ADD COLUMN IF NOT EXISTS impact_campaign_id text;

ALTER TABLE public.publisher_go_links
  ADD CONSTRAINT IF NOT EXISTS publisher_go_links_impact_campaign_id_fkey
    FOREIGN KEY (impact_campaign_id) REFERENCES public.impact_campaigns(impact_id);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS impact_actions_publisher_id_idx   ON public.impact_actions (publisher_id);
CREATE INDEX IF NOT EXISTS impact_actions_campaign_id_idx    ON public.impact_actions (campaign_id);
CREATE INDEX IF NOT EXISTS impact_actions_action_date_idx    ON public.impact_actions (action_date DESC);
CREATE INDEX IF NOT EXISTS impact_actions_sub_id3_idx        ON public.impact_actions (sub_id3) WHERE sub_id3 IS NOT NULL;
CREATE INDEX IF NOT EXISTS pub_impact_apps_publisher_idx     ON public.publisher_impact_applications (publisher_id);
CREATE INDEX IF NOT EXISTS impact_earn_daily_publisher_idx   ON public.impact_publisher_earnings_daily (publisher_id, earn_date DESC);
CREATE INDEX IF NOT EXISTS pub_go_links_network_idx          ON public.publisher_go_links (network);

-- ============================================================
-- Enable RLS on new tables
-- ============================================================
ALTER TABLE public.impact_campaigns                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_action_sync_state          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_actions                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_impact_applications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_publisher_earnings_daily   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS policies for new tables
-- ============================================================

-- impact_campaigns: authenticated users can browse
CREATE POLICY "impact_campaigns_select" ON public.impact_campaigns
  FOR SELECT TO authenticated USING (true);

-- impact_action_sync_state: service role only (no policy = blocked for anon/auth)

-- impact_actions: publishers see their own
CREATE POLICY "impact_actions_select_own" ON public.impact_actions
  FOR SELECT USING (auth.uid() = publisher_id);

-- publisher_impact_applications: publishers manage their own
CREATE POLICY "pub_impact_apps_select_own" ON public.publisher_impact_applications
  FOR SELECT USING (auth.uid() = publisher_id);
CREATE POLICY "pub_impact_apps_insert_own" ON public.publisher_impact_applications
  FOR INSERT WITH CHECK (auth.uid() = publisher_id);

-- impact_publisher_earnings_daily: publishers see their own
CREATE POLICY "impact_earn_daily_select_own" ON public.impact_publisher_earnings_daily
  FOR SELECT USING (auth.uid() = publisher_id);

-- ============================================================
-- RPC: rebuild Impact earnings rollup (service-role only)
-- ============================================================
CREATE OR REPLACE FUNCTION public.refresh_impact_publisher_earnings_daily()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.impact_publisher_earnings_daily;

  INSERT INTO public.impact_publisher_earnings_daily (
    publisher_id,
    earn_date,
    currency,
    payout_total,
    payout_total_usd,
    sale_total,
    sale_total_usd,
    action_count,
    updated_at
  )
  SELECT
    publisher_id,
    (action_date AT TIME ZONE 'UTC')::date AS earn_date,
    payout_currency                         AS currency,
    SUM(payout)                             AS payout_total,
    SUM(payout_usd)                         AS payout_total_usd,
    SUM(sale_amount)                        AS sale_total,
    SUM(sale_amount_usd)                    AS sale_total_usd,
    COUNT(*)                                AS action_count,
    NOW()                                   AS updated_at
  FROM public.impact_actions
  WHERE publisher_id IS NOT NULL
  GROUP BY publisher_id, (action_date AT TIME ZONE 'UTC')::date, payout_currency;
END;
$$;

-- ============================================================
-- STEP 1: DROP all existing public tables (cascade)
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;

-- ============================================================
-- STEP 2: Create new Impact-based schema
-- ============================================================

-- profiles (must come first — other tables reference it)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role = ANY (ARRAY['publisher'::text, 'advertiser'::text])),
  email text NOT NULL,
  company_name text,
  website text,
  company_description text,
  payment_email text,
  tax_id text,
  address text,
  city text,
  country text,
  approval_status text NOT NULL DEFAULT 'pending'::text
    CHECK (approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- impact_campaigns  (replaces awin_programmes)
-- Impact program/campaign IDs are strings (e.g. "12345"), not bigints
CREATE TABLE public.impact_campaigns (
  impact_id text NOT NULL,
  name text NOT NULL,
  advertiser_name text,
  logo_url text,
  click_through_url text,
  currency text,
  status text,
  raw jsonb,                  -- full Impact API response cached here
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT impact_campaigns_pkey PRIMARY KEY (impact_id)
);

-- impact_action_sync_state  (replaces awin_transaction_sync_state)
CREATE TABLE public.impact_action_sync_state (
  id text NOT NULL DEFAULT 'default'::text,
  last_completed_at timestamp with time zone,
  last_window_end timestamp with time zone,
  last_error text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT impact_action_sync_state_pkey PRIMARY KEY (id)
);

-- impact_actions  (replaces awin_transactions)
-- Mirrors Impact /Actions API response fields
CREATE TABLE public.impact_actions (
  action_id text NOT NULL,                            -- Impact ActionId
  campaign_id text,                                   -- Impact CampaignId (FK to impact_campaigns)
  order_id text,                                      -- OrderId / MerchantOrderId from Impact
  action_status text,                                 -- PENDING | APPROVED | REVERSED | PENDING_REVIEW
  payout numeric NOT NULL DEFAULT 0,                  -- publisher commission in native currency
  payout_currency text NOT NULL DEFAULT 'USD',
  payout_usd numeric NOT NULL DEFAULT 0,              -- converted to USD
  sale_amount numeric NOT NULL DEFAULT 0,
  sale_currency text NOT NULL DEFAULT 'USD',
  sale_amount_usd numeric NOT NULL DEFAULT 0,
  action_date timestamp with time zone NOT NULL,
  sub_id3 text,                                       -- our click_id passed as SubId3 on redirect
  publisher_id uuid,
  go_link_slug text,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  manually_assigned_at timestamp with time zone,
  manually_assigned_by uuid,
  raw jsonb,                                          -- full raw action row from Impact API
  CONSTRAINT impact_actions_pkey PRIMARY KEY (action_id),
  CONSTRAINT impact_actions_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.profiles(id),
  CONSTRAINT impact_actions_manually_assigned_by_fkey FOREIGN KEY (manually_assigned_by) REFERENCES public.profiles(id)
);

-- fx_daily_rates  (unchanged — currency conversion lookup)
CREATE TABLE public.fx_daily_rates (
  rate_date date NOT NULL,
  currency text NOT NULL,
  usd_per_unit numeric NOT NULL,
  source text NOT NULL DEFAULT 'frankfurter'::text,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fx_daily_rates_pkey PRIMARY KEY (rate_date, currency)
);

-- publisher_impact_applications  (replaces publisher_awin_applications)
CREATE TABLE public.publisher_impact_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  publisher_id uuid NOT NULL,
  campaign_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text
    CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT publisher_impact_applications_pkey PRIMARY KEY (id),
  CONSTRAINT publisher_impact_applications_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.profiles(id),
  CONSTRAINT publisher_impact_applications_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.impact_campaigns(impact_id)
);

-- publisher_earnings_daily  (same structure, now aggregates Impact actions)
CREATE TABLE public.publisher_earnings_daily (
  publisher_id uuid NOT NULL,
  earn_date date NOT NULL,
  currency text NOT NULL,
  payout_total numeric NOT NULL DEFAULT 0,
  payout_total_usd numeric NOT NULL DEFAULT 0,
  sale_total numeric NOT NULL DEFAULT 0,
  sale_total_usd numeric NOT NULL DEFAULT 0,
  action_count integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT publisher_earnings_daily_pkey PRIMARY KEY (publisher_id, earn_date, currency),
  CONSTRAINT publisher_earnings_daily_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.profiles(id)
);

-- publisher_go_links  (same concept, now references impact_campaigns)
CREATE TABLE public.publisher_go_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE
    CHECK (char_length(slug) >= 6 AND char_length(slug) <= 32),
  publisher_id uuid NOT NULL,
  campaign_id text NOT NULL,
  target_url text NOT NULL,
  deep_link boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  click_count bigint NOT NULL DEFAULT 0,
  CONSTRAINT publisher_go_links_pkey PRIMARY KEY (id),
  CONSTRAINT publisher_go_links_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.profiles(id),
  CONSTRAINT publisher_go_links_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.impact_campaigns(impact_id)
);

-- ============================================================
-- STEP 3: Useful indexes
-- ============================================================
CREATE INDEX ON public.impact_actions (publisher_id);
CREATE INDEX ON public.impact_actions (campaign_id);
CREATE INDEX ON public.impact_actions (action_date DESC);
CREATE INDEX ON public.impact_actions (sub_id3) WHERE sub_id3 IS NOT NULL;
CREATE INDEX ON public.publisher_go_links (publisher_id);
CREATE INDEX ON public.publisher_go_links (slug);
CREATE INDEX ON public.publisher_impact_applications (publisher_id);
CREATE INDEX ON public.publisher_earnings_daily (publisher_id, earn_date DESC);

-- ============================================================
-- STEP 4: Enable RLS on all tables
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_action_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fx_daily_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_impact_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_earnings_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_go_links ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 5: RLS policies
-- ============================================================

-- profiles: own row only
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- impact_campaigns: all authenticated users can browse
CREATE POLICY "impact_campaigns_select" ON public.impact_campaigns
  FOR SELECT TO authenticated USING (true);

-- impact_action_sync_state: service role only (no public access)
-- (no policy = blocked for all non-service roles — correct for admin-only sync)

-- impact_actions: publishers see their own
CREATE POLICY "impact_actions_select_own" ON public.impact_actions
  FOR SELECT USING (auth.uid() = publisher_id);

-- fx_daily_rates: all authenticated can read
CREATE POLICY "fx_daily_rates_select" ON public.fx_daily_rates
  FOR SELECT TO authenticated USING (true);

-- publisher_impact_applications: publishers manage their own
CREATE POLICY "pub_impact_apps_select_own" ON public.publisher_impact_applications
  FOR SELECT USING (auth.uid() = publisher_id);
CREATE POLICY "pub_impact_apps_insert_own" ON public.publisher_impact_applications
  FOR INSERT WITH CHECK (auth.uid() = publisher_id);

-- publisher_earnings_daily: publishers see their own
CREATE POLICY "pub_earnings_select_own" ON public.publisher_earnings_daily
  FOR SELECT USING (auth.uid() = publisher_id);

-- publisher_go_links: publishers manage their own
CREATE POLICY "pub_go_links_select_own" ON public.publisher_go_links
  FOR SELECT USING (auth.uid() = publisher_id);
CREATE POLICY "pub_go_links_insert_own" ON public.publisher_go_links
  FOR INSERT WITH CHECK (auth.uid() = publisher_id);
CREATE POLICY "pub_go_links_update_own" ON public.publisher_go_links
  FOR UPDATE USING (auth.uid() = publisher_id);
CREATE POLICY "pub_go_links_delete_own" ON public.publisher_go_links
  FOR DELETE USING (auth.uid() = publisher_id);

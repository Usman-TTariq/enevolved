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
-- STEP 2: Create new schema
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

-- awin_programmes
CREATE TABLE public.awin_programmes (
  programme_id bigint NOT NULL,
  name text NOT NULL,
  description text,
  display_url text,
  logo_url text,
  click_through_url text,
  currency_code text,
  programme_status text,
  primary_region jsonb,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  valid_domains text[],
  CONSTRAINT awin_programmes_pkey PRIMARY KEY (programme_id)
);

-- awin_transaction_sync_state
CREATE TABLE public.awin_transaction_sync_state (
  id text NOT NULL DEFAULT 'default'::text,
  last_completed_at timestamp with time zone,
  last_window_end timestamp with time zone,
  last_error text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT awin_transaction_sync_state_pkey PRIMARY KEY (id)
);

-- awin_transactions
CREATE TABLE public.awin_transactions (
  awin_transaction_id text NOT NULL,
  advertiser_id bigint,
  commission_status text,
  commission_amount numeric NOT NULL DEFAULT 0,
  commission_currency text NOT NULL DEFAULT 'GBP'::text,
  sale_amount numeric NOT NULL DEFAULT 0,
  sale_currency text NOT NULL DEFAULT 'GBP'::text,
  transaction_date timestamp with time zone NOT NULL,
  click_ref text,
  publisher_id uuid,
  go_link_slug text,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  manually_assigned_at timestamp with time zone,
  manually_assigned_by uuid,
  commission_amount_usd numeric NOT NULL DEFAULT 0,
  sale_amount_usd numeric NOT NULL DEFAULT 0,
  CONSTRAINT awin_transactions_pkey PRIMARY KEY (awin_transaction_id),
  CONSTRAINT awin_transactions_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.profiles(id),
  CONSTRAINT awin_transactions_manually_assigned_by_fkey FOREIGN KEY (manually_assigned_by) REFERENCES public.profiles(id)
);

-- fx_daily_rates
CREATE TABLE public.fx_daily_rates (
  rate_date date NOT NULL,
  currency text NOT NULL,
  usd_per_unit numeric NOT NULL,
  source text NOT NULL DEFAULT 'frankfurter'::text,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fx_daily_rates_pkey PRIMARY KEY (rate_date, currency)
);

-- publisher_awin_applications
CREATE TABLE public.publisher_awin_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  publisher_id uuid NOT NULL,
  programme_id bigint NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text
    CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT publisher_awin_applications_pkey PRIMARY KEY (id),
  CONSTRAINT publisher_awin_applications_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.profiles(id),
  CONSTRAINT publisher_awin_applications_programme_id_fkey FOREIGN KEY (programme_id) REFERENCES public.awin_programmes(programme_id)
);

-- publisher_earnings_daily
CREATE TABLE public.publisher_earnings_daily (
  publisher_id uuid NOT NULL,
  earn_date date NOT NULL,
  currency text NOT NULL,
  commission_total numeric NOT NULL DEFAULT 0,
  sale_total numeric NOT NULL DEFAULT 0,
  txn_count integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  commission_total_usd numeric NOT NULL DEFAULT 0,
  sale_total_usd numeric NOT NULL DEFAULT 0,
  CONSTRAINT publisher_earnings_daily_pkey PRIMARY KEY (publisher_id, earn_date, currency),
  CONSTRAINT publisher_earnings_daily_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.profiles(id)
);

-- publisher_go_links
CREATE TABLE public.publisher_go_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE
    CHECK (char_length(slug) >= 6 AND char_length(slug) <= 32),
  publisher_id uuid NOT NULL,
  programme_id bigint NOT NULL,
  target_url text NOT NULL,
  deep_link boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  click_count bigint NOT NULL DEFAULT 0,
  CONSTRAINT publisher_go_links_pkey PRIMARY KEY (id),
  CONSTRAINT publisher_go_links_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.profiles(id),
  CONSTRAINT publisher_go_links_programme_id_fkey FOREIGN KEY (programme_id) REFERENCES public.awin_programmes(programme_id)
);

-- ============================================================
-- STEP 3: Enable RLS on all tables
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awin_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awin_transaction_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fx_daily_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_awin_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_earnings_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_go_links ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 4: Basic RLS policies
-- ============================================================

-- profiles: users can read/update their own row
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- awin_programmes: any authenticated user can read
CREATE POLICY "awin_programmes_select" ON public.awin_programmes
  FOR SELECT TO authenticated USING (true);

-- awin_transactions: publisher sees their own
CREATE POLICY "awin_transactions_select_own" ON public.awin_transactions
  FOR SELECT USING (auth.uid() = publisher_id);

-- fx_daily_rates: any authenticated user can read
CREATE POLICY "fx_daily_rates_select" ON public.fx_daily_rates
  FOR SELECT TO authenticated USING (true);

-- publisher_awin_applications: publisher sees their own
CREATE POLICY "pub_awin_apps_select_own" ON public.publisher_awin_applications
  FOR SELECT USING (auth.uid() = publisher_id);
CREATE POLICY "pub_awin_apps_insert_own" ON public.publisher_awin_applications
  FOR INSERT WITH CHECK (auth.uid() = publisher_id);

-- publisher_earnings_daily: publisher sees their own
CREATE POLICY "pub_earnings_select_own" ON public.publisher_earnings_daily
  FOR SELECT USING (auth.uid() = publisher_id);

-- publisher_go_links: publisher manages their own
CREATE POLICY "pub_go_links_select_own" ON public.publisher_go_links
  FOR SELECT USING (auth.uid() = publisher_id);
CREATE POLICY "pub_go_links_insert_own" ON public.publisher_go_links
  FOR INSERT WITH CHECK (auth.uid() = publisher_id);
CREATE POLICY "pub_go_links_update_own" ON public.publisher_go_links
  FOR UPDATE USING (auth.uid() = publisher_id);
CREATE POLICY "pub_go_links_delete_own" ON public.publisher_go_links
  FOR DELETE USING (auth.uid() = publisher_id);

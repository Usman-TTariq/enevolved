-- Drop FK constraint that ties publisher_go_links.campaign_id to impact_campaigns only
ALTER TABLE public.publisher_go_links
  DROP CONSTRAINT IF EXISTS publisher_go_links_campaign_id_fkey;

-- Add a network column to distinguish Impact vs TradeTracker vs PaidOnResults links
ALTER TABLE public.publisher_go_links
  ADD COLUMN IF NOT EXISTS network text NOT NULL DEFAULT 'impact';

-- Back-fill existing rows (all current rows are Impact links)
UPDATE public.publisher_go_links SET network = 'impact' WHERE network IS NULL OR network = '';

-- Drop old check constraint and recreate with all three networks
ALTER TABLE public.publisher_go_links
  DROP CONSTRAINT IF EXISTS publisher_go_links_network_check;

ALTER TABLE public.publisher_go_links
  ADD CONSTRAINT publisher_go_links_network_check
  CHECK (network IN ('impact', 'tradetracker', 'paidonresults'));

-- Index for fast lookup by network
CREATE INDEX IF NOT EXISTS idx_go_links_network ON public.publisher_go_links (network);

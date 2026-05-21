-- Add category fields to tradetracker_campaigns
-- Run this in Supabase SQL Editor

ALTER TABLE public.tradetracker_campaigns
  ADD COLUMN IF NOT EXISTS category_id   text,
  ADD COLUMN IF NOT EXISTS category_name text;

CREATE INDEX IF NOT EXISTS idx_tt_campaigns_category
  ON public.tradetracker_campaigns (category_name);

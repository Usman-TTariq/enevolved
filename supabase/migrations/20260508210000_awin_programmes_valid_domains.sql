-- Allowed merchant hostnames for deep-link landing validation (from Awin programmedetails + display URLs).
alter table public.awin_programmes
  add column if not exists valid_domains text[] null;

comment on column public.awin_programmes.valid_domains is
  'Normalized hostnames (e.g. brand.com, brand.de) allowed for deep-link destinations; merged from Awin validDomains and programme URLs.';

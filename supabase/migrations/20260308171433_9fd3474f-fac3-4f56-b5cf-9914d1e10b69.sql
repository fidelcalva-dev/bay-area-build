
-- STEP 1: Create archive tables (clone structure, no FK constraints, no triggers)
CREATE TABLE IF NOT EXISTS public.sales_leads_archive (LIKE public.sales_leads INCLUDING DEFAULTS INCLUDING CONSTRAINTS);
ALTER TABLE public.sales_leads_archive DROP CONSTRAINT IF EXISTS sales_leads_archive_pkey;
ALTER TABLE public.sales_leads_archive ADD PRIMARY KEY (id);

CREATE TABLE IF NOT EXISTS public.quotes_archive (LIKE public.quotes INCLUDING DEFAULTS INCLUDING CONSTRAINTS);
ALTER TABLE public.quotes_archive DROP CONSTRAINT IF EXISTS quotes_archive_pkey;
ALTER TABLE public.quotes_archive ADD PRIMARY KEY (id);

CREATE TABLE IF NOT EXISTS public.customers_archive (LIKE public.customers INCLUDING DEFAULTS INCLUDING CONSTRAINTS);
ALTER TABLE public.customers_archive DROP CONSTRAINT IF EXISTS customers_archive_pkey;
ALTER TABLE public.customers_archive ADD PRIMARY KEY (id);

CREATE TABLE IF NOT EXISTS public.orders_archive (LIKE public.orders INCLUDING DEFAULTS INCLUDING CONSTRAINTS);
ALTER TABLE public.orders_archive DROP CONSTRAINT IF EXISTS orders_archive_pkey;
ALTER TABLE public.orders_archive ADD PRIMARY KEY (id);

CREATE TABLE IF NOT EXISTS public.lead_events_archive (LIKE public.lead_events INCLUDING DEFAULTS INCLUDING CONSTRAINTS);
ALTER TABLE public.lead_events_archive DROP CONSTRAINT IF EXISTS lead_events_archive_pkey;
ALTER TABLE public.lead_events_archive ADD PRIMARY KEY (id);

CREATE TABLE IF NOT EXISTS public.lifecycle_events_archive (LIKE public.lifecycle_events INCLUDING DEFAULTS INCLUDING CONSTRAINTS);
ALTER TABLE public.lifecycle_events_archive DROP CONSTRAINT IF EXISTS lifecycle_events_archive_pkey;
ALTER TABLE public.lifecycle_events_archive ADD PRIMARY KEY (id);

-- Add archived_at timestamp to each archive table
ALTER TABLE public.sales_leads_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.quotes_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.customers_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.orders_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.lead_events_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.lifecycle_events_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();

-- Drop all foreign key constraints from archive tables so they're independent
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname, conrelid::regclass AS tbl
    FROM pg_constraint
    WHERE contype = 'f'
      AND conrelid::regclass::text IN (
        'sales_leads_archive','quotes_archive','customers_archive',
        'orders_archive','lead_events_archive','lifecycle_events_archive'
      )
  ) LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', r.tbl, r.conname);
  END LOOP;
END $$;

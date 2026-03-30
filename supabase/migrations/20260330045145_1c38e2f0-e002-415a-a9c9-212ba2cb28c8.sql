
-- =====================================================
-- SERVICE LINE MODEL: Add service_line + cleanup fields
-- to sales_leads and customers tables
-- =====================================================

-- Add service_line columns to sales_leads
ALTER TABLE public.sales_leads 
  ADD COLUMN IF NOT EXISTS service_line text DEFAULT 'DUMPSTER',
  ADD COLUMN IF NOT EXISTS cleanup_service_type text,
  ADD COLUMN IF NOT EXISTS project_scope text,
  ADD COLUMN IF NOT EXISTS project_stage text,
  ADD COLUMN IF NOT EXISTS project_size_sqft text,
  ADD COLUMN IF NOT EXISTS debris_condition text,
  ADD COLUMN IF NOT EXISTS contractor_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_service_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_frequency text,
  ADD COLUMN IF NOT EXISTS need_dumpster_too boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS bundle_opportunity_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS photos_uploaded_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS needs_site_visit boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS requested_timeline text,
  ADD COLUMN IF NOT EXISTS requested_start_date date,
  ADD COLUMN IF NOT EXISTS cleanup_notes text;

-- Add service_line to customers
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS service_line text DEFAULT 'DUMPSTER';

-- Add service_line to quotes
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS service_line text DEFAULT 'DUMPSTER',
  ADD COLUMN IF NOT EXISTS cleanup_service_type text;

-- Add service_line to orders  
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS service_line text DEFAULT 'DUMPSTER';

-- Create index for efficient service_line filtering
CREATE INDEX IF NOT EXISTS idx_sales_leads_service_line ON public.sales_leads(service_line);
CREATE INDEX IF NOT EXISTS idx_sales_leads_contractor_flag ON public.sales_leads(contractor_flag) WHERE contractor_flag = true;
CREATE INDEX IF NOT EXISTS idx_sales_leads_bundle_flag ON public.sales_leads(bundle_opportunity_flag) WHERE bundle_opportunity_flag = true;
CREATE INDEX IF NOT EXISTS idx_sales_leads_recurring_flag ON public.sales_leads(recurring_service_flag) WHERE recurring_service_flag = true;

-- Comment the columns
COMMENT ON COLUMN public.sales_leads.service_line IS 'DUMPSTER, CLEANUP, or BOTH';
COMMENT ON COLUMN public.sales_leads.cleanup_service_type IS 'CONSTRUCTION_CLEANUP, POST_CONSTRUCTION_CLEANUP, DEMOLITION_DEBRIS_CLEANUP, RECURRING_JOBSITE_CLEANUP, LABOR_ASSISTED_CLEANUP, NOT_SURE';
COMMENT ON COLUMN public.sales_leads.bundle_opportunity_flag IS 'True when lead needs both cleanup and dumpster services';

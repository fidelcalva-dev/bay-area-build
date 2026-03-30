-- =============================================
-- sales_leads: add missing CRM matrix fields
-- =============================================
ALTER TABLE public.sales_leads
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS readiness_state text DEFAULT 'raw';

-- =============================================
-- quotes: add missing CRM matrix fields
-- =============================================
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS quote_type text DEFAULT 'DUMPSTER_RENTAL',
  ADD COLUMN IF NOT EXISTS discounts_total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extras_total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS taxes_total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grand_total numeric,
  ADD COLUMN IF NOT EXISTS contract_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS addendum_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_required boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notes_customer text,
  ADD COLUMN IF NOT EXISTS notes_internal text,
  ADD COLUMN IF NOT EXISTS assigned_rep_id uuid,
  ADD COLUMN IF NOT EXISTS preview_html text,
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS signed_pdf_url text,
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.sales_leads(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotes_lead_id ON public.quotes(lead_id);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_type ON public.quotes(quote_type);
CREATE INDEX IF NOT EXISTS idx_quotes_service_line ON public.quotes(service_line);

-- Expand contractor_applications with all required fields
ALTER TABLE public.contractor_applications
  ADD COLUMN IF NOT EXISTS legal_business_name TEXT,
  ADD COLUMN IF NOT EXISTS dba_name TEXT,
  ADD COLUMN IF NOT EXISTS role_title TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS business_address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS zip TEXT,
  ADD COLUMN IF NOT EXISTS contractor_type TEXT,
  ADD COLUMN IF NOT EXISTS license_number TEXT,
  ADD COLUMN IF NOT EXISTS is_insured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
  ADD COLUMN IF NOT EXISTS service_area TEXT,
  ADD COLUMN IF NOT EXISTS typical_project_type TEXT,
  ADD COLUMN IF NOT EXISTS current_active_projects INTEGER,
  ADD COLUMN IF NOT EXISTS average_project_size TEXT,
  ADD COLUMN IF NOT EXISTS service_line_interest TEXT DEFAULT 'DUMPSTER',
  ADD COLUMN IF NOT EXISTS monthly_dumpster_usage_estimate TEXT,
  ADD COLUMN IF NOT EXISTS monthly_cleanup_usage_estimate TEXT,
  ADD COLUMN IF NOT EXISTS recurring_service_interest BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_cleanup_frequency TEXT,
  ADD COLUMN IF NOT EXISTS common_dumpster_sizes TEXT[],
  ADD COLUMN IF NOT EXISTS common_materials TEXT[],
  ADD COLUMN IF NOT EXISTS need_priority_service BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS need_net_terms BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS required_dump_sites TEXT,
  ADD COLUMN IF NOT EXISTS docs_uploaded_json JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pricing_tier_recommendation TEXT,
  ADD COLUMN IF NOT EXISTS approved_discount_percent NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS approved_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS declined_reason TEXT,
  ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lead_id UUID,
  ADD COLUMN IF NOT EXISTS contractor_fit_score INTEGER,
  ADD COLUMN IF NOT EXISTS brand_origin TEXT DEFAULT 'CALSAN_DUMPSTERS_PRO';

-- Update status defaults to use the expanded workflow statuses
-- The existing status column already allows text values

-- Add lead_id reference
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'contractor_applications_lead_id_fkey'
  ) THEN
    ALTER TABLE public.contractor_applications
      ADD CONSTRAINT contractor_applications_lead_id_fkey
      FOREIGN KEY (lead_id) REFERENCES public.sales_leads(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add contractor_application_id to sales_leads for cross-referencing
ALTER TABLE public.sales_leads
  ADD COLUMN IF NOT EXISTS contractor_application_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'sales_leads_contractor_application_id_fkey'
  ) THEN
    ALTER TABLE public.sales_leads
      ADD CONSTRAINT sales_leads_contractor_application_id_fkey
      FOREIGN KEY (contractor_application_id) REFERENCES public.contractor_applications(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add contractor fields to customers table for converted contractors
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS is_contractor_account BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS contractor_type TEXT,
  ADD COLUMN IF NOT EXISTS contractor_application_id UUID,
  ADD COLUMN IF NOT EXISTS service_line_permissions TEXT DEFAULT 'DUMPSTER',
  ADD COLUMN IF NOT EXISTS net_terms_approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS documents_status TEXT DEFAULT 'incomplete';

-- Create storage bucket for contractor documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('contractor-documents', 'contractor-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for contractor-documents bucket
CREATE POLICY "Anyone can upload contractor docs"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'contractor-documents');

CREATE POLICY "Authenticated can view contractor docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'contractor-documents');

CREATE POLICY "Authenticated can delete contractor docs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'contractor-documents');

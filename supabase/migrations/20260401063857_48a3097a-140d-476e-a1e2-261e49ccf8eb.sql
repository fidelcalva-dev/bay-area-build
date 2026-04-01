
-- =============================================
-- PHASE 7: Contractor Tiers Master Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.contractor_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_code text NOT NULL UNIQUE,
  tier_label text NOT NULL,
  discount_percent numeric NOT NULL DEFAULT 0,
  minimum_margin_pct numeric NOT NULL DEFAULT 15,
  approval_required boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  notes text,
  non_discountable_items text[] DEFAULT ARRAY[
    'disposal_passthrough', 'customer_required_dump_premium', 'green_halo_premium',
    'rebar_premium', 'permit_assistance', 'toll_surcharges',
    'rush_same_day_after_hours', 'dry_run', 'contamination_reroute'
  ],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default tiers
INSERT INTO public.contractor_tiers (tier_code, tier_label, discount_percent, minimum_margin_pct, approval_required, sort_order)
VALUES
  ('RETAIL', 'Retail', 0, 20, false, 0),
  ('CONTRACTOR_TIER_1', 'Contractor Tier 1', 5, 18, false, 1),
  ('CONTRACTOR_TIER_2', 'Contractor Tier 2', 8, 16, false, 2),
  ('COMMERCIAL_ACCOUNT', 'Commercial Account', 10, 15, false, 3),
  ('MANUAL_RATE_CARD', 'Custom / Manual', 0, 10, true, 4)
ON CONFLICT (tier_code) DO NOTHING;

-- RLS
ALTER TABLE public.contractor_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read contractor tiers"
  ON public.contractor_tiers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage contractor tiers"
  ON public.contractor_tiers FOR ALL
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

-- Anon can read tiers (for public quote flow contractor pricing display)
CREATE POLICY "Anon can read active tiers"
  ON public.contractor_tiers FOR SELECT
  TO anon
  USING (is_active = true);

-- =============================================
-- Add contractor_accounts fields for service lines and application linkage
-- =============================================
ALTER TABLE public.contractor_accounts 
  ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES public.contractor_applications(id),
  ADD COLUMN IF NOT EXISTS service_line_permissions text DEFAULT 'DUMPSTER',
  ADD COLUMN IF NOT EXISTS recurring_service_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS required_dump_sites text,
  ADD COLUMN IF NOT EXISTS monthly_cleanup_estimate text,
  ADD COLUMN IF NOT EXISTS preferred_cleanup_frequency text,
  ADD COLUMN IF NOT EXISTS years_in_business int,
  ADD COLUMN IF NOT EXISTS active_projects_count int,
  ADD COLUMN IF NOT EXISTS contractor_type text,
  ADD COLUMN IF NOT EXISTS documents_status text DEFAULT 'incomplete';

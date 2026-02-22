
-- Add assessment quick-access columns to sales_leads
ALTER TABLE public.sales_leads
  ADD COLUMN IF NOT EXISTS latest_assessment_id uuid REFERENCES public.waste_vision_analyses(id),
  ADD COLUMN IF NOT EXISTS latest_recommended_size integer,
  ADD COLUMN IF NOT EXISTS latest_heavy_flag boolean DEFAULT false;

-- Create media_assessment_assets for frames/thumbnails
CREATE TABLE IF NOT EXISTS public.media_assessment_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES public.waste_vision_analyses(id) ON DELETE CASCADE,
  asset_type text NOT NULL DEFAULT 'ORIGINAL',
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.media_assessment_assets ENABLE ROW LEVEL SECURITY;

-- Staff-only SELECT on media_assessment_assets
CREATE POLICY "Staff can view assessment assets"
  ON public.media_assessment_assets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role, 'finance'::app_role, 'cs'::app_role, 'cs_agent'::app_role, 'ops_admin'::app_role, 'executive'::app_role)
    )
  );

-- Service role can insert
CREATE POLICY "Service can insert assessment assets"
  ON public.media_assessment_assets FOR INSERT
  WITH CHECK (true);

-- Tighten waste_vision_analyses SELECT to staff-only (drop public read)
DROP POLICY IF EXISTS "Anyone can read waste vision analyses" ON public.waste_vision_analyses;

CREATE POLICY "Staff can read waste vision analyses"
  ON public.waste_vision_analyses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role, 'finance'::app_role, 'cs'::app_role, 'cs_agent'::app_role, 'ops_admin'::app_role, 'executive'::app_role)
    )
    OR auth.uid() IS NOT NULL
  );

-- Index for fast lead lookup
CREATE INDEX IF NOT EXISTS idx_waste_vision_lead ON public.waste_vision_analyses(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_assets_analysis ON public.media_assessment_assets(analysis_id);

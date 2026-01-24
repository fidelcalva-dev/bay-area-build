-- ============================================================
-- WASTE VISION AI - DATABASE SCHEMA
-- Stores AI analysis results for debris/waste photos
-- ============================================================

-- Main analysis results table
CREATE TABLE public.waste_vision_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Link to quote/order (optional - can be standalone)
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  
  -- Session tracking (for anonymous users)
  session_id TEXT,
  
  -- Input metadata
  image_count INTEGER NOT NULL DEFAULT 1,
  input_type TEXT NOT NULL DEFAULT 'photo' CHECK (input_type IN ('photo', 'video')),
  reference_object TEXT, -- 'pickup', 'door', 'person', 'bucket', 'none'
  
  -- AI Model outputs (JSONB for flexibility)
  materials_detected JSONB NOT NULL DEFAULT '[]'::jsonb,
  hazards_detected JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Volume estimation
  volume_cy_low NUMERIC(6,2),
  volume_cy_high NUMERIC(6,2),
  
  -- Weight estimation (tons)
  weight_tons_low NUMERIC(6,2),
  weight_tons_high NUMERIC(6,2),
  
  -- Pickup load equivalents
  pickup_loads_low INTEGER,
  pickup_loads_high INTEGER,
  
  -- Recommendations
  recommended_waste_type TEXT CHECK (recommended_waste_type IN ('heavy', 'mixed')),
  recommended_size INTEGER CHECK (recommended_size IN (6, 8, 10, 20, 30, 40, 50)),
  alternate_sizes INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  fit_confidence TEXT CHECK (fit_confidence IN ('safe', 'tight', 'risk', 'overflow')),
  recommendation_notes TEXT[],
  
  -- Green Halo eligibility
  green_halo_eligible BOOLEAN DEFAULT false,
  green_halo_note TEXT,
  
  -- Hazard review status
  hazard_review_required BOOLEAN DEFAULT false,
  hazard_review_status TEXT DEFAULT 'none' CHECK (hazard_review_status IN ('none', 'pending', 'approved', 'rejected')),
  hazard_reviewer_id UUID,
  hazard_review_notes TEXT,
  
  -- Overall confidence
  overall_confidence TEXT CHECK (overall_confidence IN ('high', 'medium', 'low')),
  
  -- Raw AI response (for debugging/auditing)
  raw_ai_response JSONB,
  
  -- Usage tracking
  applied_to_quote BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE
);

-- Index for quote/order lookups
CREATE INDEX idx_waste_vision_quote ON public.waste_vision_analyses(quote_id) WHERE quote_id IS NOT NULL;
CREATE INDEX idx_waste_vision_order ON public.waste_vision_analyses(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_waste_vision_session ON public.waste_vision_analyses(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_waste_vision_hazard_review ON public.waste_vision_analyses(hazard_review_required, hazard_review_status) WHERE hazard_review_required = true;

-- Enable RLS
ALTER TABLE public.waste_vision_analyses ENABLE ROW LEVEL SECURITY;

-- Public can create analyses (anonymous photo uploads)
CREATE POLICY "Anyone can create waste vision analyses"
  ON public.waste_vision_analyses
  FOR INSERT
  WITH CHECK (true);

-- Public can read analyses (needed for anonymous users)
CREATE POLICY "Anyone can read waste vision analyses"
  ON public.waste_vision_analyses
  FOR SELECT
  USING (true);

-- Admins can update analyses (for hazard review)
CREATE POLICY "Admins can update waste vision analyses"
  ON public.waste_vision_analyses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'ops_admin', 'cs', 'cs_agent')
    )
  );

-- Add AI analysis fields to quotes table
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS ai_analysis_id UUID REFERENCES public.waste_vision_analyses(id);
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS ai_materials_json JSONB;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS ai_hazards_json JSONB;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS ai_volume_range JSONB;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS ai_weight_range JSONB;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS ai_recommended_size INTEGER;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS ai_confidence TEXT;

COMMENT ON TABLE public.waste_vision_analyses IS 'Stores AI-powered waste/debris photo analysis results including material detection, hazard flags, and size recommendations';
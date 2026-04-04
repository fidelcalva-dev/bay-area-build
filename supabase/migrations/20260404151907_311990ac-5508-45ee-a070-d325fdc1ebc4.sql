
ALTER TABLE public.quote_sessions
  ADD COLUMN IF NOT EXISTS selected_materials_json JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS has_recyclable_materials BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_separate_recyclables TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS mixed_load_flag BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS possible_recycling_credit_flag BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_manual_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pricing_family TEXT DEFAULT NULL;

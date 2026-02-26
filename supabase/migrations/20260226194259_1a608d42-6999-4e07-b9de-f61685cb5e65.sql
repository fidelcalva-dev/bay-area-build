
-- ============================================================
-- ASSISTANT LEARNING TABLE — safe, no PII, admin-only access
-- ============================================================
CREATE TABLE public.assistant_learning (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  lead_id uuid,
  user_type text,
  project_type text,
  material_type text,
  recommended_size int,
  selected_size int,
  confidence numeric,
  converted_to_quote boolean DEFAULT false,
  converted_to_order boolean DEFAULT false,
  revenue_cents int,
  margin_band text,
  ai_mode text DEFAULT 'OFF',
  drop_off_step text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.assistant_learning ENABLE ROW LEVEL SECURITY;

-- Admin/manager read only
CREATE POLICY "Admin can read assistant_learning"
  ON public.assistant_learning FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No public insert — service role only (edge functions)
-- No INSERT/UPDATE/DELETE policies = blocked for all non-service-role

-- Performance indexes
CREATE INDEX idx_assistant_learning_created ON public.assistant_learning(created_at DESC);
CREATE INDEX idx_assistant_learning_converted ON public.assistant_learning(converted_to_order);
CREATE INDEX idx_assistant_learning_mode ON public.assistant_learning(ai_mode);

-- Auto-update trigger
CREATE TRIGGER update_assistant_learning_updated_at
  BEFORE UPDATE ON public.assistant_learning
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default config: assistant_learning.mode = OFF
INSERT INTO public.config_settings (category, key, value, description)
VALUES ('assistant_learning', 'mode', '"OFF"', 'Controls assistant learning data collection: OFF, DRY_RUN, LIVE')
ON CONFLICT DO NOTHING;

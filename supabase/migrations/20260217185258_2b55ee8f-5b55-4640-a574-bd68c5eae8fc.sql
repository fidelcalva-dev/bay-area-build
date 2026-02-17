
-- Phase 1: System error logging table
CREATE TABLE public.system_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  function_name TEXT NOT NULL,
  route TEXT,
  user_id UUID,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  payload_json JSONB,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('info','warn','error','critical')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view system errors"
  ON public.system_errors FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'system_admin'));

CREATE POLICY "Edge functions can insert errors"
  ON public.system_errors FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE INDEX idx_system_errors_created ON public.system_errors(created_at DESC);
CREATE INDEX idx_system_errors_function ON public.system_errors(function_name);
CREATE INDEX idx_system_errors_severity ON public.system_errors(severity);

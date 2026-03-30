-- =============================================
-- quote_sessions: progressive capture of quote journey
-- =============================================
CREATE TABLE IF NOT EXISTS public.quote_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.sales_leads(id),
  customer_id uuid REFERENCES public.customers(id),
  quote_id uuid REFERENCES public.quotes(id),
  
  -- Progress tracking
  current_step text,
  completed_steps_json jsonb DEFAULT '[]'::jsonb,
  
  -- Project context
  project_type text,
  material_type text,
  material_class text,
  heavy_group text,
  selected_size_yd integer,
  quantity integer DEFAULT 1,
  rental_days integer DEFAULT 7,
  extras_json jsonb DEFAULT '[]'::jsonb,
  
  -- Delivery / placement
  requested_delivery_date date,
  requested_time_window text,
  placement_type_requested text,
  placement_notes text,
  access_notes text,
  gate_code text,
  permit_required boolean DEFAULT false,
  
  -- Dump site
  customer_required_dump_flag boolean DEFAULT false,
  requested_dump_site_name text,
  requested_dump_site_notes text,
  
  -- Customer notes
  quote_notes_customer text,
  
  -- Timestamps
  last_saved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.quote_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read quote_sessions"
  ON public.quote_sessions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert quote_sessions"
  ON public.quote_sessions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update quote_sessions"
  ON public.quote_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow anon insert for public quote flow
CREATE POLICY "Allow anon insert quote_sessions"
  ON public.quote_sessions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update quote_sessions"
  ON public.quote_sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quote_sessions_lead_id ON public.quote_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_quote_sessions_customer_id ON public.quote_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_quote_sessions_quote_id ON public.quote_sessions(quote_id);
-- =============================================
-- quote_line_items: individual priced lines on a quote
-- =============================================
CREATE TABLE IF NOT EXISTS public.quote_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  
  -- Type
  line_type text NOT NULL DEFAULT 'DUMPSTER',
  
  -- Product details
  dumpster_size_yd integer,
  material_type text,
  material_class text,
  heavy_group text,
  quantity integer DEFAULT 1,
  rental_days integer,
  included_tons numeric,
  overage_rate numeric,
  
  -- Pricing
  unit_price numeric DEFAULT 0,
  line_total numeric DEFAULT 0,
  
  -- Notes
  notes_customer text,
  notes_internal text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read quote_line_items"
  ON public.quote_line_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert quote_line_items"
  ON public.quote_line_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update quote_line_items"
  ON public.quote_line_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete quote_line_items"
  ON public.quote_line_items FOR DELETE TO authenticated USING (true);

-- Allow anon for public quote flow
CREATE POLICY "Allow anon insert quote_line_items"
  ON public.quote_line_items FOR INSERT TO anon WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote_id ON public.quote_line_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_line_items_line_type ON public.quote_line_items(line_type);
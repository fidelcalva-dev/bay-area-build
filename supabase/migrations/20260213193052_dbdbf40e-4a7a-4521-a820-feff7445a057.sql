
-- Create quote_site_placement table for placements before order creation
CREATE TABLE public.quote_site_placement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  geometry_json JSONB NOT NULL,
  screenshot_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_site_placement ENABLE ROW LEVEL SECURITY;

-- Public insert policy (quotes are created by anonymous visitors)
CREATE POLICY "Anyone can insert quote placement"
  ON public.quote_site_placement
  FOR INSERT
  WITH CHECK (true);

-- Public select by quote_id (customer can view their own via quote link)
CREATE POLICY "Anyone can view quote placement"
  ON public.quote_site_placement
  FOR SELECT
  USING (true);

-- Staff can update
CREATE POLICY "Staff can update quote placement"
  ON public.quote_site_placement
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'dispatcher'));

-- Index for fast lookup
CREATE INDEX idx_quote_site_placement_quote_id ON public.quote_site_placement (quote_id);

-- Trigger for updated_at
CREATE TRIGGER update_quote_site_placement_updated_at
  BEFORE UPDATE ON public.quote_site_placement
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

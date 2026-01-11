-- Add priority_rank to vendors table for vendor selection ordering
ALTER TABLE public.vendors
ADD COLUMN priority_rank integer NOT NULL DEFAULT 100;

-- Create quotes table to store quote records
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Customer info
  customer_name text,
  customer_email text,
  customer_phone text,
  user_type text NOT NULL DEFAULT 'homeowner',
  -- Location
  zip_code text NOT NULL,
  zone_id uuid REFERENCES public.pricing_zones(id),
  -- Quote details
  size_id uuid REFERENCES public.dumpster_sizes(id),
  material_type text NOT NULL,
  rental_days integer NOT NULL DEFAULT 7,
  extras text[] DEFAULT '{}',
  -- Pricing
  subtotal numeric NOT NULL,
  estimated_min numeric NOT NULL,
  estimated_max numeric NOT NULL,
  discount_percent numeric DEFAULT 0,
  -- Vendor selection
  selected_vendor_id uuid REFERENCES public.vendors(id),
  vendor_cost numeric,
  margin numeric,
  is_calsan_fulfillment boolean NOT NULL DEFAULT true,
  -- Status
  status text NOT NULL DEFAULT 'pending',
  converted_at timestamp with time zone,
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on quotes
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Admins can manage all quotes
CREATE POLICY "Admins can manage quotes"
ON public.quotes
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Public can insert quotes (for lead capture)
CREATE POLICY "Anyone can create quotes"
ON public.quotes
FOR INSERT
WITH CHECK (true);

-- Create index for vendor lookup by zone
CREATE INDEX idx_vendor_zones_zone_id ON public.vendor_zones(zone_id);
CREATE INDEX idx_vendor_zones_vendor_id ON public.vendor_zones(vendor_id);
CREATE INDEX idx_quotes_zip_code ON public.quotes(zip_code);
CREATE INDEX idx_quotes_status ON public.quotes(status);

-- Trigger for updated_at
CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
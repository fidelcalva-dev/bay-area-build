-- Create service_receipts table to store receipt records
CREATE TABLE public.service_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  
  -- Ticket data
  facility_name TEXT,
  ticket_date TIMESTAMP WITH TIME ZONE,
  total_tons NUMERIC NOT NULL,
  ticket_url TEXT,
  ticket_number TEXT,
  
  -- Calculated fields
  included_tons NUMERIC,
  overage_tons NUMERIC DEFAULT 0,
  overage_rate NUMERIC,
  overage_charge NUMERIC DEFAULT 0,
  pricing_rule TEXT, -- 'heavy_flat' | 'mixed_small' | 'mixed_large'
  
  -- Delivery tracking
  sms_sent_at TIMESTAMP WITH TIME ZONE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_receipts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can create receipts"
ON public.service_receipts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view their receipts by quote"
ON public.service_receipts
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage receipts"
ON public.service_receipts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update trigger
CREATE TRIGGER update_service_receipts_updated_at
BEFORE UPDATE ON public.service_receipts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for dump tickets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dump-tickets', 'dump-tickets', true);

-- Storage policies for dump tickets
CREATE POLICY "Anyone can view dump tickets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'dump-tickets');

CREATE POLICY "Admins can upload dump tickets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'dump-tickets');

CREATE POLICY "Admins can update dump tickets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'dump-tickets');

CREATE POLICY "Admins can delete dump tickets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'dump-tickets');

-- Add completion tracking to quotes if not exists
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS receipt_sent_at TIMESTAMP WITH TIME ZONE;
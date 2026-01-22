-- Create quick_links table for shareable order links
CREATE TABLE public.quick_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(32) NOT NULL UNIQUE,
  
  -- Link configuration
  name TEXT, -- Admin-friendly label
  preset_zip TEXT,
  preset_size INTEGER,
  preset_material TEXT CHECK (preset_material IN ('general', 'heavy')),
  preset_yard_id UUID REFERENCES public.yards(id),
  preset_extras JSONB DEFAULT '[]'::jsonb,
  
  -- Customer association (optional)
  customer_id UUID REFERENCES public.customers(id),
  preferred_address TEXT,
  
  -- Metadata
  source TEXT DEFAULT 'manual', -- manual, crm, system
  created_by UUID REFERENCES auth.users(id),
  
  -- Expiration & status
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  use_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER, -- null = unlimited
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for token lookups
CREATE INDEX idx_quick_links_token ON public.quick_links(token);
CREATE INDEX idx_quick_links_customer ON public.quick_links(customer_id);
CREATE INDEX idx_quick_links_active ON public.quick_links(is_active, expires_at);

-- Enable RLS
ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all quick links
CREATE POLICY "Admins can manage quick links"
ON public.quick_links
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'sales', 'sales_admin', 'ops_admin')
  )
);

-- Policy: Anyone can read active non-expired links (for validation)
CREATE POLICY "Anyone can view active quick links"
ON public.quick_links
FOR SELECT
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
);

-- Trigger for updated_at
CREATE TRIGGER update_quick_links_updated_at
BEFORE UPDATE ON public.quick_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add quick_link_id to quotes for tracking
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS quick_link_id UUID REFERENCES public.quick_links(id);

-- Add quick_link_id to orders for tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quick_link_id UUID REFERENCES public.quick_links(id);

-- Grant permissions
GRANT SELECT ON public.quick_links TO anon;
GRANT ALL ON public.quick_links TO authenticated;
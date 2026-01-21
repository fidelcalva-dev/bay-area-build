-- Inventory tracking table for dumpsters per yard/size
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  yard_id UUID NOT NULL REFERENCES public.yards(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES public.dumpster_sizes(id) ON DELETE CASCADE,
  total_count INTEGER NOT NULL DEFAULT 0,
  available_count INTEGER NOT NULL DEFAULT 0,
  reserved_count INTEGER NOT NULL DEFAULT 0,
  in_use_count INTEGER NOT NULL DEFAULT 0,
  maintenance_count INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(yard_id, size_id)
);

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Anyone can view inventory (for quote availability)
CREATE POLICY "Anyone can view inventory"
ON public.inventory FOR SELECT
USING (true);

-- Staff can manage inventory
CREATE POLICY "Staff can manage inventory"
ON public.inventory FOR ALL
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role]));

-- Trigger for updated_at
CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inventory movement log for audit trail
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL, -- reserve, release, deploy, return, maintenance_in, maintenance_out
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Staff can view movements
CREATE POLICY "Staff can view inventory movements"
ON public.inventory_movements FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role]));

-- Staff can create movements
CREATE POLICY "Staff can create inventory movements"
ON public.inventory_movements FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role]));

-- Add inventory_id to orders for tracking which specific inventory is allocated
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS inventory_id UUID REFERENCES public.inventory(id);

-- Quote events table for tracking quote lifecycle
CREATE TABLE public.quote_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- created, saved, resumed, converted, expired, abandoned
  event_data JSONB,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_events ENABLE ROW LEVEL SECURITY;

-- Anyone can create quote events (for lead tracking)
CREATE POLICY "Anyone can create quote events"
ON public.quote_events FOR INSERT
WITH CHECK (true);

-- Staff can view all quote events
CREATE POLICY "Staff can view quote events"
ON public.quote_events FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role]));

-- Enable realtime for orders table (for dispatch updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
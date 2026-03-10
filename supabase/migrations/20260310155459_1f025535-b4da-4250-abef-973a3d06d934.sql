
-- Create dump_tickets table for disposal documentation
CREATE TABLE public.dump_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID REFERENCES public.runs(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  ticket_number TEXT,
  weight NUMERIC(10,2),
  dump_fee NUMERIC(10,2),
  material_type TEXT,
  ticket_photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dump_tickets ENABLE ROW LEVEL SECURITY;

-- Staff can manage dump tickets
CREATE POLICY "Staff can manage dump_tickets"
  ON public.dump_tickets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner', 'ops_admin', 'dispatcher', 'driver', 'finance')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner', 'ops_admin', 'dispatcher', 'driver', 'finance')
    )
  );

-- Index for quick lookups
CREATE INDEX idx_dump_tickets_run_id ON public.dump_tickets(run_id);
CREATE INDEX idx_dump_tickets_order_id ON public.dump_tickets(order_id);
CREATE INDEX idx_dump_tickets_facility_id ON public.dump_tickets(facility_id);

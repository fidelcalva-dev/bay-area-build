-- Add scheduled_requested to allowed order statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN (
  'pending', 'confirmed', 'scheduled', 'scheduled_requested', 
  'en_route', 'delivered', 'pickup_requested', 'pickup_scheduled', 
  'picked_up', 'completed', 'cancelled'
));
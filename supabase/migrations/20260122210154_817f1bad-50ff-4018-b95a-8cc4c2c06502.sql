-- Add schedule change fields to service_requests
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS change_type TEXT CHECK (change_type IN ('delivery', 'pickup', 'both')),
ADD COLUMN IF NOT EXISTS requested_delivery_date DATE,
ADD COLUMN IF NOT EXISTS requested_delivery_window TEXT CHECK (requested_delivery_window IN ('morning', 'midday', 'afternoon')),
ADD COLUMN IF NOT EXISTS requested_pickup_date DATE,
ADD COLUMN IF NOT EXISTS requested_pickup_window TEXT CHECK (requested_pickup_window IN ('morning', 'midday', 'afternoon')),
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Add index for faster queue lookups
CREATE INDEX IF NOT EXISTS idx_service_requests_status_created 
ON public.service_requests(status, created_at DESC);

-- Add index for order lookups
CREATE INDEX IF NOT EXISTS idx_service_requests_order_id 
ON public.service_requests(order_id);

-- Create function to enforce rate limiting (max 2 requests per day per order)
CREATE OR REPLACE FUNCTION public.check_request_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.service_requests
  WHERE order_id = NEW.order_id
    AND created_at > NOW() - INTERVAL '24 hours'
    AND id != COALESCE(NEW.id, gen_random_uuid());
  
  IF recent_count >= 2 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 2 requests per order per 24 hours';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS enforce_request_rate_limit ON public.service_requests;
CREATE TRIGGER enforce_request_rate_limit
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.check_request_rate_limit();

-- Create function to block requests on completed/cancelled orders
CREATE OR REPLACE FUNCTION public.check_order_status_for_request()
RETURNS TRIGGER AS $$
DECLARE
  order_status TEXT;
BEGIN
  SELECT status INTO order_status
  FROM public.orders
  WHERE id = NEW.order_id;
  
  IF order_status IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot create requests for completed or cancelled orders';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to block requests on completed orders
DROP TRIGGER IF EXISTS check_order_status_before_request ON public.service_requests;
CREATE TRIGGER check_order_status_before_request
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.check_order_status_for_request();
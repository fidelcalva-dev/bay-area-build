
-- Attach triggers to orders table for event-driven automation
-- Drop triggers if they exist (safe re-run)
DROP TRIGGER IF EXISTS trigger_order_scheduled ON public.orders;
DROP TRIGGER IF EXISTS trigger_order_delivered ON public.orders;
DROP TRIGGER IF EXISTS trigger_order_completed ON public.orders;
DROP TRIGGER IF EXISTS trigger_order_cancelled ON public.orders;

-- Create trigger for when order is scheduled (reserve asset)
CREATE TRIGGER trigger_order_scheduled
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_scheduled();

-- Create trigger for when order is delivered (deploy asset)
CREATE TRIGGER trigger_order_delivered
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_delivered();

-- Create trigger for when order is completed (return asset)
CREATE TRIGGER trigger_order_completed
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_completed();

-- Create trigger for when order is cancelled (release asset)
CREATE TRIGGER trigger_order_cancelled
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_cancelled();

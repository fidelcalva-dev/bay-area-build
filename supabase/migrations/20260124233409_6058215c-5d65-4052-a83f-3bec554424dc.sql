-- =====================================================
-- RUNS DISPATCH SYSTEM - Phase 2: Auto-Create Runs from Orders
-- =====================================================

-- Function to create a DELIVERY run when order is scheduled
CREATE OR REPLACE FUNCTION public.create_delivery_run_from_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote RECORD;
  v_existing_run_id UUID;
  v_origin_yard_id UUID;
  v_asset_id UUID;
BEGIN
  -- Only trigger when status changes TO 'scheduled'
  IF NEW.status = 'scheduled' AND (OLD.status IS NULL OR OLD.status != 'scheduled') THEN
    
    -- Check if a DELIVERY run already exists for this order (idempotency)
    SELECT id INTO v_existing_run_id
    FROM public.runs
    WHERE order_id = NEW.id 
      AND run_type = 'DELIVERY'
      AND status NOT IN ('COMPLETED', 'CANCELLED');
    
    IF v_existing_run_id IS NOT NULL THEN
      -- Run already exists, skip
      RETURN NEW;
    END IF;
    
    -- Get quote info for customer details
    SELECT q.customer_name, q.customer_phone, q.delivery_address
    INTO v_quote
    FROM public.quotes q
    WHERE q.id = NEW.quote_id;
    
    -- Determine origin yard (prefer origin_yard_id, then assigned_yard_id)
    v_origin_yard_id := COALESCE(NEW.origin_yard_id, NEW.assigned_yard_id);
    
    -- Determine asset (primary_dumpster_id is the asset)
    v_asset_id := NEW.primary_dumpster_id;
    
    -- Create the DELIVERY run
    INSERT INTO public.runs (
      run_type,
      order_id,
      asset_id,
      origin_type,
      origin_yard_id,
      destination_type,
      destination_address,
      scheduled_date,
      scheduled_window,
      customer_name,
      customer_phone,
      status,
      priority,
      notes
    ) VALUES (
      'DELIVERY',
      NEW.id,
      v_asset_id,
      'yard',
      v_origin_yard_id,
      'customer',
      COALESCE(v_quote.delivery_address, ''),
      NEW.scheduled_delivery_date,
      NEW.scheduled_delivery_window,
      v_quote.customer_name,
      v_quote.customer_phone,
      'SCHEDULED',
      3,
      'Auto-created from order scheduling'
    );
    
    -- Create required checkpoints for DELIVERY
    INSERT INTO public.run_checkpoints (run_id, checkpoint_type, is_required)
    SELECT 
      (SELECT id FROM public.runs WHERE order_id = NEW.id AND run_type = 'DELIVERY' ORDER BY created_at DESC LIMIT 1),
      'DELIVERY_POD'::checkpoint_type,
      true;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to create a PICKUP run when order is delivered (and pickup scheduled)
CREATE OR REPLACE FUNCTION public.create_pickup_run_from_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote RECORD;
  v_existing_run_id UUID;
  v_destination_yard_id UUID;
  v_asset_id UUID;
BEGIN
  -- Only trigger when status changes TO 'delivered' AND pickup date is set
  IF NEW.status = 'delivered' 
     AND (OLD.status IS NULL OR OLD.status != 'delivered')
     AND NEW.scheduled_pickup_date IS NOT NULL THEN
    
    -- Check if a PICKUP run already exists for this order (idempotency)
    SELECT id INTO v_existing_run_id
    FROM public.runs
    WHERE order_id = NEW.id 
      AND run_type = 'PICKUP'
      AND status NOT IN ('COMPLETED', 'CANCELLED');
    
    IF v_existing_run_id IS NOT NULL THEN
      -- Run already exists, skip
      RETURN NEW;
    END IF;
    
    -- Get quote info for customer details
    SELECT q.customer_name, q.customer_phone, q.delivery_address
    INTO v_quote
    FROM public.quotes q
    WHERE q.id = NEW.quote_id;
    
    -- Determine destination yard
    v_destination_yard_id := COALESCE(NEW.destination_yard_id, NEW.assigned_yard_id);
    
    -- Determine asset
    v_asset_id := NEW.primary_dumpster_id;
    
    -- Create the PICKUP run
    INSERT INTO public.runs (
      run_type,
      order_id,
      asset_id,
      origin_type,
      origin_address,
      destination_type,
      destination_yard_id,
      scheduled_date,
      scheduled_window,
      customer_name,
      customer_phone,
      status,
      priority,
      notes
    ) VALUES (
      'PICKUP',
      NEW.id,
      v_asset_id,
      'customer',
      COALESCE(v_quote.delivery_address, ''),
      'yard',
      v_destination_yard_id,
      NEW.scheduled_pickup_date,
      NEW.scheduled_pickup_window,
      v_quote.customer_name,
      v_quote.customer_phone,
      'SCHEDULED',
      3,
      'Auto-created on delivery completion'
    );
    
    -- Create required checkpoints for PICKUP
    INSERT INTO public.run_checkpoints (run_id, checkpoint_type, is_required)
    SELECT 
      (SELECT id FROM public.runs WHERE order_id = NEW.id AND run_type = 'PICKUP' ORDER BY created_at DESC LIMIT 1),
      checkpoint_type,
      true
    FROM (VALUES ('PICKUP_POD'::checkpoint_type), ('DUMP_TICKET'::checkpoint_type)) AS t(checkpoint_type);
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to cancel open runs when order is completed or cancelled
CREATE OR REPLACE FUNCTION public.cancel_runs_on_order_close()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when status changes TO 'completed' or 'cancelled'
  IF NEW.status IN ('completed', 'cancelled') 
     AND (OLD.status IS NULL OR OLD.status NOT IN ('completed', 'cancelled')) THEN
    
    -- Cancel all non-completed runs for this order
    UPDATE public.runs
    SET 
      status = 'CANCELLED',
      cancelled_at = now(),
      cancellation_reason = 'Order ' || NEW.status
    WHERE order_id = NEW.id
      AND status NOT IN ('COMPLETED', 'CANCELLED');
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- ATTACH TRIGGERS TO ORDERS TABLE
-- =====================================================

-- Drop existing triggers if they exist (for idempotency)
DROP TRIGGER IF EXISTS trigger_create_delivery_run ON public.orders;
DROP TRIGGER IF EXISTS trigger_create_pickup_run ON public.orders;
DROP TRIGGER IF EXISTS trigger_cancel_runs_on_close ON public.orders;

-- Create triggers
CREATE TRIGGER trigger_create_delivery_run
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_delivery_run_from_order();

CREATE TRIGGER trigger_create_pickup_run
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_pickup_run_from_order();

CREATE TRIGGER trigger_cancel_runs_on_close
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.cancel_runs_on_order_close();

-- =====================================================
-- HELPER FUNCTION: Manual run creation for dispatchers
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_run_for_order(
  p_order_id UUID,
  p_run_type run_type,
  p_scheduled_date DATE,
  p_scheduled_window TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_quote RECORD;
  v_run_id UUID;
BEGIN
  -- Get order details
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;
  
  -- Get quote details
  SELECT customer_name, customer_phone, delivery_address
  INTO v_quote
  FROM public.quotes WHERE id = v_order.quote_id;
  
  -- Create the run
  INSERT INTO public.runs (
    run_type,
    order_id,
    asset_id,
    origin_type,
    origin_yard_id,
    origin_address,
    destination_type,
    destination_yard_id,
    destination_address,
    scheduled_date,
    scheduled_window,
    customer_name,
    customer_phone,
    status,
    notes,
    created_by
  ) VALUES (
    p_run_type,
    p_order_id,
    v_order.primary_dumpster_id,
    CASE WHEN p_run_type = 'DELIVERY' THEN 'yard' ELSE 'customer' END,
    CASE WHEN p_run_type = 'DELIVERY' THEN COALESCE(v_order.origin_yard_id, v_order.assigned_yard_id) ELSE NULL END,
    CASE WHEN p_run_type != 'DELIVERY' THEN v_quote.delivery_address ELSE NULL END,
    CASE WHEN p_run_type = 'PICKUP' THEN 'yard' WHEN p_run_type = 'HAUL' THEN 'facility' ELSE 'customer' END,
    CASE WHEN p_run_type = 'PICKUP' THEN COALESCE(v_order.destination_yard_id, v_order.assigned_yard_id) ELSE NULL END,
    CASE WHEN p_run_type = 'DELIVERY' THEN v_quote.delivery_address ELSE NULL END,
    p_scheduled_date,
    p_scheduled_window,
    v_quote.customer_name,
    v_quote.customer_phone,
    'DRAFT',
    COALESCE(p_notes, 'Manually created run'),
    auth.uid()
  ) RETURNING id INTO v_run_id;
  
  RETURN v_run_id;
END;
$$;
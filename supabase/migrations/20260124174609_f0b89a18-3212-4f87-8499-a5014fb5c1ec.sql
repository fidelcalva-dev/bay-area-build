-- =====================================================
-- PHASE 2: EVENT-DRIVEN TRIGGERS
-- Auto-update asset state on order status changes
-- Log all movements idempotently
-- =====================================================

-- 1) Function to update asset on DELIVERY (order -> delivered)
CREATE OR REPLACE FUNCTION public.handle_order_delivered()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_id UUID;
  v_from_yard_id UUID;
  v_movement_exists BOOLEAN;
BEGIN
  -- Only trigger when status changes TO 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    
    -- Get the asset_id (check both asset_id and inventory_id for compatibility)
    v_asset_id := COALESCE(NEW.asset_id, NULL);
    
    -- If no asset assigned, skip (asset assignment is done manually or via UI)
    IF v_asset_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Get origin yard
    v_from_yard_id := COALESCE(NEW.origin_yard_id, NEW.assigned_yard_id);
    
    -- Check if MOVE_OUT already logged for this order+asset (idempotency)
    SELECT EXISTS(
      SELECT 1 FROM public.inventory_movements 
      WHERE asset_id = v_asset_id 
        AND order_id = NEW.id 
        AND movement_type = 'MOVE_OUT'
    ) INTO v_movement_exists;
    
    IF NOT v_movement_exists THEN
      -- Update asset state
      UPDATE public.assets_dumpsters SET
        asset_status = 'deployed',
        current_location_type = 'field',
        current_order_id = NEW.id,
        current_yard_id = NULL,
        deployed_at = COALESCE(NEW.delivery_completed_at, now()),
        last_movement_at = now(),
        days_out = 0,
        total_deployments = total_deployments + 1
      WHERE id = v_asset_id;
      
      -- Log MOVE_OUT movement
      INSERT INTO public.inventory_movements (
        asset_id, order_id, movement_type, quantity,
        from_location_type, from_yard_id,
        to_location_type, to_yard_id,
        driver_id, notes, created_at
      ) VALUES (
        v_asset_id, NEW.id, 'MOVE_OUT', 1,
        'yard', v_from_yard_id,
        'field', NULL,
        NEW.assigned_driver_id,
        'Auto-logged on delivery',
        now()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2) Function to update asset on PICKUP COMPLETED (order -> completed)
CREATE OR REPLACE FUNCTION public.handle_order_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_id UUID;
  v_to_yard_id UUID;
  v_movement_exists BOOLEAN;
BEGIN
  -- Only trigger when status changes TO 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    v_asset_id := COALESCE(NEW.asset_id, NULL);
    
    IF v_asset_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Determine return yard (priority: destination_yard, origin_yard, assigned_yard)
    v_to_yard_id := COALESCE(NEW.destination_yard_id, NEW.origin_yard_id, NEW.assigned_yard_id);
    
    -- Check if MOVE_IN already logged (idempotency)
    SELECT EXISTS(
      SELECT 1 FROM public.inventory_movements 
      WHERE asset_id = v_asset_id 
        AND order_id = NEW.id 
        AND movement_type = 'MOVE_IN'
    ) INTO v_movement_exists;
    
    IF NOT v_movement_exists THEN
      -- Update asset state
      UPDATE public.assets_dumpsters SET
        asset_status = 'available',
        current_location_type = 'yard',
        current_order_id = NULL,
        current_yard_id = v_to_yard_id,
        deployed_at = NULL,
        last_movement_at = now(),
        days_out = 0
      WHERE id = v_asset_id;
      
      -- Log MOVE_IN movement
      INSERT INTO public.inventory_movements (
        asset_id, order_id, movement_type, quantity,
        from_location_type, from_yard_id,
        to_location_type, to_yard_id,
        driver_id, notes, created_at
      ) VALUES (
        v_asset_id, NEW.id, 'MOVE_IN', 1,
        'field', NULL,
        'yard', v_to_yard_id,
        NEW.assigned_driver_id,
        'Auto-logged on pickup completion',
        now()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3) Function to handle asset reservation (order -> scheduled)
CREATE OR REPLACE FUNCTION public.handle_order_scheduled()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_id UUID;
BEGIN
  -- Only trigger when status changes TO 'scheduled' and asset is assigned
  IF NEW.status = 'scheduled' AND (OLD.status IS NULL OR OLD.status != 'scheduled') THEN
    v_asset_id := COALESCE(NEW.asset_id, NULL);
    
    IF v_asset_id IS NOT NULL THEN
      -- Reserve the asset
      UPDATE public.assets_dumpsters SET
        asset_status = 'reserved',
        current_order_id = NEW.id,
        last_movement_at = now()
      WHERE id = v_asset_id AND asset_status = 'available';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 4) Function to handle cancellation (release asset)
CREATE OR REPLACE FUNCTION public.handle_order_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_id UUID;
BEGIN
  -- Only trigger when status changes TO 'cancelled'
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    v_asset_id := COALESCE(NEW.asset_id, NULL);
    
    IF v_asset_id IS NOT NULL THEN
      -- Release the asset back to available
      UPDATE public.assets_dumpsters SET
        asset_status = 'available',
        current_location_type = 'yard',
        current_order_id = NULL,
        deployed_at = NULL,
        days_out = 0,
        last_movement_at = now()
      WHERE id = v_asset_id;
      
      -- Log release movement
      INSERT INTO public.inventory_movements (
        asset_id, order_id, movement_type, quantity,
        notes, created_at
      ) VALUES (
        v_asset_id, NEW.id, 'RELEASE', 1,
        'Released due to order cancellation',
        now()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 5) Create triggers on orders table
DROP TRIGGER IF EXISTS trg_order_delivered ON public.orders;
CREATE TRIGGER trg_order_delivered
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_delivered();

DROP TRIGGER IF EXISTS trg_order_completed ON public.orders;
CREATE TRIGGER trg_order_completed
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_completed();

DROP TRIGGER IF EXISTS trg_order_scheduled ON public.orders;
CREATE TRIGGER trg_order_scheduled
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_scheduled();

DROP TRIGGER IF EXISTS trg_order_cancelled ON public.orders;
CREATE TRIGGER trg_order_cancelled
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_cancelled();

-- 6) Function to update days_out for all deployed assets
CREATE OR REPLACE FUNCTION public.update_assets_days_out()
RETURNS void AS $$
BEGIN
  UPDATE public.assets_dumpsters
  SET days_out = EXTRACT(DAY FROM (now() - deployed_at))::INTEGER
  WHERE asset_status = 'deployed' AND deployed_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 7) Create asset inventory summary view
CREATE OR REPLACE VIEW public.asset_inventory_summary AS
SELECT 
  y.id as yard_id,
  y.name as yard_name,
  ds.id as size_id,
  ds.label as size_label,
  ds.size_value,
  COUNT(*) FILTER (WHERE ad.asset_status = 'available') as available_count,
  COUNT(*) FILTER (WHERE ad.asset_status = 'reserved') as reserved_count,
  COUNT(*) FILTER (WHERE ad.asset_status = 'deployed') as deployed_count,
  COUNT(*) FILTER (WHERE ad.asset_status = 'maintenance') as maintenance_count,
  COUNT(*) FILTER (WHERE ad.asset_status IS NOT NULL AND ad.asset_status != 'retired') as total_count
FROM public.yards y
CROSS JOIN public.dumpster_sizes ds
LEFT JOIN public.assets_dumpsters ad ON ad.current_yard_id = y.id AND ad.size_id = ds.id AND ad.asset_status != 'retired'
WHERE y.is_active = true AND ds.is_active = true
GROUP BY y.id, y.name, ds.id, ds.label, ds.size_value
ORDER BY y.priority_rank, ds.display_order;
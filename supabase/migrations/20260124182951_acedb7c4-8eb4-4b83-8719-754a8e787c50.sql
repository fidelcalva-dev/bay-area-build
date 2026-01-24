
-- Fix handle_order_delivered to also set inventory_id (for backward compatibility)
CREATE OR REPLACE FUNCTION public.handle_order_delivered()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_asset_id UUID;
  v_from_yard_id UUID;
  v_movement_exists BOOLEAN;
BEGIN
  -- Only trigger when status changes TO 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    
    -- Get the asset_id
    v_asset_id := COALESCE(NEW.asset_id, NULL);
    
    -- If no asset assigned, skip
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
        total_deployments = total_deployments + 1,
        overdue_notified = false
      WHERE id = v_asset_id;
      
      -- Log MOVE_OUT movement (include inventory_id for compatibility)
      INSERT INTO public.inventory_movements (
        asset_id, inventory_id, order_id, movement_type, quantity,
        from_location_type, from_yard_id,
        to_location_type, to_yard_id,
        driver_id, notes, created_at
      ) VALUES (
        v_asset_id, v_asset_id, NEW.id, 'MOVE_OUT', 1,
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
$function$;

-- Fix handle_order_completed
CREATE OR REPLACE FUNCTION public.handle_order_completed()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
    
    -- Determine return yard
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
        days_out = 0,
        overdue_notified = false
      WHERE id = v_asset_id;
      
      -- Log MOVE_IN movement
      INSERT INTO public.inventory_movements (
        asset_id, inventory_id, order_id, movement_type, quantity,
        from_location_type, from_yard_id,
        to_location_type, to_yard_id,
        driver_id, notes, created_at
      ) VALUES (
        v_asset_id, v_asset_id, NEW.id, 'MOVE_IN', 1,
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
$function$;

-- Fix handle_order_cancelled
CREATE OR REPLACE FUNCTION public.handle_order_cancelled()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
        last_movement_at = now(),
        overdue_notified = false
      WHERE id = v_asset_id;
      
      -- Log release movement
      INSERT INTO public.inventory_movements (
        asset_id, inventory_id, order_id, movement_type, quantity,
        notes, created_at
      ) VALUES (
        v_asset_id, v_asset_id, NEW.id, 'RELEASE', 1,
        'Released due to order cancellation',
        now()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

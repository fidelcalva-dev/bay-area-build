
-- PHASE 4: System Audit Fixes (Corrected)
-- =====================================================
-- 1. Remove duplicate triggers (keep the properly named ones)
-- =====================================================

DROP TRIGGER IF EXISTS trg_order_cancelled ON public.orders;
DROP TRIGGER IF EXISTS trg_order_completed ON public.orders;
DROP TRIGGER IF EXISTS trg_order_delivered ON public.orders;
DROP TRIGGER IF EXISTS trg_order_scheduled ON public.orders;

-- =====================================================
-- 2. Add missing composite index for movement deduplication
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_inv_movements_dedup 
ON public.inventory_movements (asset_id, order_id, movement_type, created_at);

-- =====================================================
-- 3. Add constraint to prevent illegal asset states
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_asset_state()
RETURNS TRIGGER AS $$
BEGIN
  -- Deployed assets must have deployed_at
  IF NEW.asset_status = 'deployed' AND NEW.deployed_at IS NULL THEN
    NEW.deployed_at := now();
  END IF;
  
  -- Available assets should not have current_order_id
  IF NEW.asset_status = 'available' THEN
    NEW.current_order_id := NULL;
    NEW.deployed_at := NULL;
    NEW.days_out := 0;
    NEW.overdue_notified := false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_validate_asset_state ON public.assets_dumpsters;
CREATE TRIGGER trigger_validate_asset_state
  BEFORE INSERT OR UPDATE ON public.assets_dumpsters
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_asset_state();

-- =====================================================
-- 4. Make movement triggers idempotent
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_order_delivered()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_asset_id UUID;
  v_from_yard_id UUID;
  v_movement_exists BOOLEAN;
BEGIN
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    v_asset_id := NEW.asset_id;
    
    IF v_asset_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    v_from_yard_id := COALESCE(NEW.origin_yard_id, NEW.assigned_yard_id);
    
    SELECT EXISTS(
      SELECT 1 FROM public.inventory_movements 
      WHERE asset_id = v_asset_id AND order_id = NEW.id AND movement_type = 'MOVE_OUT'
    ) INTO v_movement_exists;
    
    IF NOT v_movement_exists THEN
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
$$;

CREATE OR REPLACE FUNCTION public.handle_order_completed()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_asset_id UUID;
  v_to_yard_id UUID;
  v_movement_exists BOOLEAN;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    v_asset_id := NEW.asset_id;
    
    IF v_asset_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    v_to_yard_id := COALESCE(NEW.destination_yard_id, NEW.origin_yard_id, NEW.assigned_yard_id);
    
    SELECT EXISTS(
      SELECT 1 FROM public.inventory_movements 
      WHERE asset_id = v_asset_id AND order_id = NEW.id AND movement_type = 'MOVE_IN'
    ) INTO v_movement_exists;
    
    IF NOT v_movement_exists THEN
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
$$;

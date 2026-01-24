
-- Make inventory_id nullable and drop the FK to allow using asset_id as primary reference
ALTER TABLE public.inventory_movements 
ALTER COLUMN inventory_id DROP NOT NULL;

-- Drop the foreign key constraint on inventory_id (it points to legacy inventory table)
ALTER TABLE public.inventory_movements 
DROP CONSTRAINT IF EXISTS inventory_movements_inventory_id_fkey;

-- Add a foreign key to assets_dumpsters if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'inventory_movements_asset_id_fkey'
  ) THEN
    ALTER TABLE public.inventory_movements 
    ADD CONSTRAINT inventory_movements_asset_id_fkey 
    FOREIGN KEY (asset_id) REFERENCES public.assets_dumpsters(id);
  END IF;
END $$;

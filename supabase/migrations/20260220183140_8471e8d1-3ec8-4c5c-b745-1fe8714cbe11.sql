
-- Add PAUSED to run_status enum
ALTER TYPE run_status ADD VALUE IF NOT EXISTS 'PAUSED' AFTER 'ARRIVED';

-- Add pause/resume fields to runs
ALTER TABLE public.runs
  ADD COLUMN IF NOT EXISTS pause_reason text,
  ADD COLUMN IF NOT EXISTS paused_at timestamptz,
  ADD COLUMN IF NOT EXISTS resumed_at timestamptz;

-- Add current_run_id to assets_dumpsters
ALTER TABLE public.assets_dumpsters
  ADD COLUMN IF NOT EXISTS current_run_id uuid REFERENCES public.runs(id);

-- Add run_id to inventory_movements if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_movements' AND column_name='run_id') THEN
    ALTER TABLE public.inventory_movements ADD COLUMN run_id uuid REFERENCES public.runs(id);
  END IF;
END $$;

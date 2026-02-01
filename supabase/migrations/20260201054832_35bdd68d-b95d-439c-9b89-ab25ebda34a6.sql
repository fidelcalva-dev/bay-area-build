-- =====================================================
-- DISPATCH + LOGISTICS + DRIVER FINALIZATION - PART 1
-- Enum additions and table structure only
-- =====================================================

-- 1. Add ARRIVED status to run_status enum
ALTER TYPE run_status ADD VALUE IF NOT EXISTS 'ARRIVED' AFTER 'EN_ROUTE';

-- 2. Add new run types for comprehensive logistics
ALTER TYPE run_type ADD VALUE IF NOT EXISTS 'DUMP_AND_RETURN';
ALTER TYPE run_type ADD VALUE IF NOT EXISTS 'YARD_TRANSFER';

-- 3. Add additional checkpoint types for heavy and SWAP workflows
ALTER TYPE checkpoint_type ADD VALUE IF NOT EXISTS 'FILL_LINE_PHOTO';
ALTER TYPE checkpoint_type ADD VALUE IF NOT EXISTS 'MATERIAL_CLOSEUP';
ALTER TYPE checkpoint_type ADD VALUE IF NOT EXISTS 'CONTAMINATION_PHOTO';
ALTER TYPE checkpoint_type ADD VALUE IF NOT EXISTS 'SWAP_PICKUP_POD';
ALTER TYPE checkpoint_type ADD VALUE IF NOT EXISTS 'SWAP_DELIVERY_POD';
ALTER TYPE checkpoint_type ADD VALUE IF NOT EXISTS 'OVERFILL_PHOTO';
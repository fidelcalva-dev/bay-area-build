-- Add billing columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS amount_due NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due NUMERIC DEFAULT 0;

-- Update existing orders to set amount_due from final_total
UPDATE public.orders
SET 
  amount_due = COALESCE(final_total, 0),
  balance_due = COALESCE(final_total, 0) - COALESCE(amount_paid, 0)
WHERE amount_due = 0 OR amount_due IS NULL;

-- Add overdue to payment_status check constraint
-- First drop the existing constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

-- Add new constraint with overdue option
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overdue', 'refunded'));

-- Add PAYMENT_UPDATED to order_events event types (no constraint on this column, just documentation)
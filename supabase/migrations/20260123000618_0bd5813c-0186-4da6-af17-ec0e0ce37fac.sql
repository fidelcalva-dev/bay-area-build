-- FIX REMAINING RLS POLICY WARNINGS
-- Drop the old permissive policies and ensure only validated ones exist

-- =====================================================
-- 1. QUOTE_EVENTS - Drop old policy, keep the validated one
-- =====================================================
DROP POLICY IF EXISTS "Anyone can create quote events" ON public.quote_events;

-- The "Public can insert quote events for existing quotes" policy already exists
-- and has proper validation (EXISTS check on quote_id)

-- =====================================================
-- 2. QUOTES - The public quote creation policy is intentional
-- but we route through edge function anyway, so we can restrict it
-- However, this breaks the quote calculator if accessed directly
-- Keep as-is since save-quote edge function uses service role
-- =====================================================
-- Note: "Public quote creation" stays as it's needed for lead capture
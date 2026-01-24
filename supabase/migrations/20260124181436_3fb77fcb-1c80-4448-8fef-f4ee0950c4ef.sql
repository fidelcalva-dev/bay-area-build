
-- Add overdue_notified flag to track notifications
ALTER TABLE public.assets_dumpsters 
ADD COLUMN IF NOT EXISTS overdue_notified BOOLEAN DEFAULT false;

-- Create overdue assets view with correct column references
CREATE OR REPLACE VIEW public.overdue_assets AS
SELECT 
  ad.id,
  ad.asset_code,
  ad.days_out,
  ad.deployed_at,
  ad.current_order_id,
  o.included_days,
  o.customer_id,
  c.company_name as customer_name,
  COALESCE(c.billing_phone, c.phone) as customer_phone,
  (ad.days_out - COALESCE(o.included_days, 7)) as days_overdue
FROM public.assets_dumpsters ad
LEFT JOIN public.orders o ON ad.current_order_id = o.id
LEFT JOIN public.customers c ON o.customer_id = c.id
WHERE ad.asset_status = 'deployed'
  AND ad.days_out > COALESCE(o.included_days, 7);

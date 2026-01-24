
-- Fix security definer view by recreating with security_invoker
DROP VIEW IF EXISTS public.overdue_assets;

CREATE VIEW public.overdue_assets 
WITH (security_invoker = true) AS
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

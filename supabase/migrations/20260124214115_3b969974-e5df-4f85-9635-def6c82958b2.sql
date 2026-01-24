
-- Fix the security definer view by making it a regular view with explicit security invoker
DROP VIEW IF EXISTS public.overdue_assets_billing_vw;

CREATE VIEW public.overdue_assets_billing_vw 
WITH (security_invoker = true)
AS
SELECT 
  ad.id as asset_id,
  ad.asset_code,
  ad.days_out,
  ad.asset_status,
  ad.deployed_at,
  ad.overdue_notified,
  o.id as order_id,
  o.status as order_status,
  o.included_days,
  GREATEST(ad.days_out - o.included_days, 0) as overdue_days,
  o.customer_id,
  c.company_name as customer_name,
  COALESCE(c.billing_phone, c.phone) as customer_phone,
  c.billing_email as customer_email,
  COALESCE(obs.billed_overdue_days_total, 0) as billed_overdue_days_total,
  obs.last_billed_at,
  obs.last_notified_at,
  GREATEST(ad.days_out - o.included_days - COALESCE(obs.billed_overdue_days_total, 0), 0) as billable_days,
  i.id as invoice_id,
  i.invoice_number
FROM assets_dumpsters ad
JOIN orders o ON ad.current_order_id = o.id
JOIN customers c ON o.customer_id = c.id
LEFT JOIN overdue_billing_state obs ON obs.asset_id = ad.id AND obs.order_id = o.id
LEFT JOIN invoices i ON i.order_id = o.id
WHERE ad.asset_status = 'deployed'
  AND ad.days_out > o.included_days;

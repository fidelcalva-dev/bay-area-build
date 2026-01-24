-- Fix SECURITY DEFINER view issue
DROP VIEW IF EXISTS public.asset_inventory_summary;

CREATE VIEW public.asset_inventory_summary 
WITH (security_invoker = true)
AS
SELECT 
  y.id as yard_id,
  y.name as yard_name,
  ds.id as size_id,
  ds.label as size_label,
  ds.size_value,
  COUNT(*) FILTER (WHERE ad.asset_status = 'available') as available_count,
  COUNT(*) FILTER (WHERE ad.asset_status = 'reserved') as reserved_count,
  COUNT(*) FILTER (WHERE ad.asset_status = 'deployed') as deployed_count,
  COUNT(*) FILTER (WHERE ad.asset_status = 'maintenance') as maintenance_count,
  COUNT(*) FILTER (WHERE ad.asset_status IS NOT NULL AND ad.asset_status != 'retired') as total_count
FROM public.yards y
CROSS JOIN public.dumpster_sizes ds
LEFT JOIN public.assets_dumpsters ad ON ad.current_yard_id = y.id AND ad.size_id = ds.id AND ad.asset_status != 'retired'
WHERE y.is_active = true AND ds.is_active = true
GROUP BY y.id, y.name, ds.id, ds.label, ds.size_value
ORDER BY y.priority_rank, ds.display_order;
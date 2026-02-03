
-- Fix ambiguous column reference in get_search_index_stats
DROP FUNCTION IF EXISTS public.get_search_index_stats();

CREATE OR REPLACE FUNCTION public.get_search_index_stats()
RETURNS TABLE (
  entity_type_out text,
  total_count bigint,
  indexed_count bigint,
  coverage_pct numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'CUSTOMER'::text AS entity_type_out,
    (SELECT COUNT(*) FROM public.customers)::bigint AS total_count,
    (SELECT COUNT(*) FROM public.search_index si WHERE si.entity_type = 'CUSTOMER')::bigint AS indexed_count,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.customers) = 0 THEN 100.00
      ELSE ROUND(
        (SELECT COUNT(*) FROM public.search_index si WHERE si.entity_type = 'CUSTOMER')::numeric / 
        (SELECT COUNT(*) FROM public.customers)::numeric * 100, 2
      )
    END AS coverage_pct
  UNION ALL
  SELECT 
    'CONTACT'::text AS entity_type_out,
    (SELECT COUNT(*) FROM public.contacts)::bigint AS total_count,
    (SELECT COUNT(*) FROM public.search_index si WHERE si.entity_type = 'CONTACT')::bigint AS indexed_count,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.contacts) = 0 THEN 100.00
      ELSE ROUND(
        (SELECT COUNT(*) FROM public.search_index si WHERE si.entity_type = 'CONTACT')::numeric / 
        (SELECT COUNT(*) FROM public.contacts)::numeric * 100, 2
      )
    END AS coverage_pct;
END;
$$;

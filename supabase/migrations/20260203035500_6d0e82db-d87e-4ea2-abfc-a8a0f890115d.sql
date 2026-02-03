
-- Drop existing global_search function with old signature
DROP FUNCTION IF EXISTS public.global_search(text, integer);

-- ============================================================
-- PHASE 6: UPDATE GLOBAL_SEARCH RPC WITH RANKING PRIORITY
-- ============================================================

CREATE OR REPLACE FUNCTION public.global_search(
  p_query text,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  entity_type text,
  entity_id uuid,
  title text,
  subtitle text,
  rank real,
  match_type text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone_digits text;
  v_query_lower text;
BEGIN
  -- Normalize query for phone matching
  v_phone_digits := regexp_replace(p_query, '\D', '', 'g');
  v_query_lower := lower(trim(p_query));
  
  RETURN QUERY
  WITH scored AS (
    SELECT 
      si.entity_type,
      si.entity_id,
      si.title,
      si.subtitle,
      -- Calculate match scores
      CASE 
        -- Exact phone match (priority 100)
        WHEN v_phone_digits != '' AND length(v_phone_digits) >= 7 
          AND si.phone_normalized = v_phone_digits THEN 100.0
        -- Phone contains (priority 90)
        WHEN v_phone_digits != '' AND length(v_phone_digits) >= 4 
          AND si.phone_normalized LIKE '%' || v_phone_digits || '%' THEN 90.0
        -- Exact title match (priority 80)
        WHEN lower(si.title) = v_query_lower THEN 80.0
        -- Title starts with (priority 70)
        WHEN lower(si.title) LIKE v_query_lower || '%' THEN 70.0
        -- Title contains (priority 60)
        WHEN lower(si.title) LIKE '%' || v_query_lower || '%' THEN 60.0
        -- FTS match (priority based on ts_rank)
        WHEN si.search_text @@ plainto_tsquery('english', p_query) THEN 
          30.0 + (ts_rank(to_tsvector('english', si.search_text), plainto_tsquery('english', p_query)) * 20.0)
        -- Trigram similarity fallback
        WHEN similarity(si.title, p_query) > 0.3 THEN 
          10.0 + (similarity(si.title, p_query) * 10.0)
        ELSE 0.0
      END AS score,
      -- Match type for debugging/display
      CASE 
        WHEN v_phone_digits != '' AND length(v_phone_digits) >= 7 
          AND si.phone_normalized = v_phone_digits THEN 'exact_phone'
        WHEN v_phone_digits != '' AND length(v_phone_digits) >= 4 
          AND si.phone_normalized LIKE '%' || v_phone_digits || '%' THEN 'partial_phone'
        WHEN lower(si.title) = v_query_lower THEN 'exact_title'
        WHEN lower(si.title) LIKE v_query_lower || '%' THEN 'title_prefix'
        WHEN lower(si.title) LIKE '%' || v_query_lower || '%' THEN 'title_contains'
        WHEN si.search_text @@ plainto_tsquery('english', p_query) THEN 'fts'
        WHEN similarity(si.title, p_query) > 0.3 THEN 'fuzzy'
        ELSE 'none'
      END AS match_type,
      -- Entity type priority (CUSTOMER > CONTACT > others)
      CASE si.entity_type
        WHEN 'CUSTOMER' THEN 0
        WHEN 'CONTACT' THEN 1
        WHEN 'ORDER' THEN 2
        WHEN 'INVOICE' THEN 3
        WHEN 'LEAD' THEN 4
        ELSE 5
      END AS entity_priority
    FROM public.search_index si
    WHERE 
      si.status = 'active'
      AND (
        -- Phone search
        (v_phone_digits != '' AND length(v_phone_digits) >= 4 
          AND si.phone_normalized LIKE '%' || v_phone_digits || '%')
        -- FTS search
        OR si.search_text @@ plainto_tsquery('english', p_query)
        -- Title substring
        OR lower(si.title) LIKE '%' || v_query_lower || '%'
        -- Trigram fuzzy
        OR similarity(si.title, p_query) > 0.3
      )
  )
  SELECT 
    s.entity_type,
    s.entity_id,
    s.title,
    s.subtitle,
    s.score::real AS rank,
    s.match_type
  FROM scored s
  WHERE s.score > 0
  ORDER BY 
    s.entity_priority ASC,  -- CUSTOMER first
    s.score DESC,           -- Then by score
    s.title ASC             -- Alphabetical tiebreaker
  LIMIT p_limit;
END;
$$;

-- ============================================================
-- HELPER: Backfill function for manual use
-- ============================================================

CREATE OR REPLACE FUNCTION public.backfill_search_index_customers()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
  v_customer RECORD;
BEGIN
  FOR v_customer IN SELECT * FROM public.customers LOOP
    UPDATE public.customers SET updated_at = now() WHERE id = v_customer.id;
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.backfill_search_index_contacts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
  v_contact RECORD;
BEGIN
  FOR v_contact IN SELECT * FROM public.contacts LOOP
    UPDATE public.contacts SET updated_at = now() WHERE id = v_contact.id;
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

-- ============================================================
-- STATS FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_search_index_stats()
RETURNS TABLE (
  entity_type text,
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
    'CUSTOMER' AS entity_type,
    (SELECT COUNT(*) FROM public.customers)::bigint AS total_count,
    (SELECT COUNT(*) FROM public.search_index WHERE entity_type = 'CUSTOMER')::bigint AS indexed_count,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.customers) = 0 THEN 100.00
      ELSE ROUND(
        (SELECT COUNT(*) FROM public.search_index WHERE entity_type = 'CUSTOMER')::numeric / 
        (SELECT COUNT(*) FROM public.customers)::numeric * 100, 2
      )
    END AS coverage_pct
  UNION ALL
  SELECT 
    'CONTACT' AS entity_type,
    (SELECT COUNT(*) FROM public.contacts)::bigint AS total_count,
    (SELECT COUNT(*) FROM public.search_index WHERE entity_type = 'CONTACT')::bigint AS indexed_count,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.contacts) = 0 THEN 100.00
      ELSE ROUND(
        (SELECT COUNT(*) FROM public.search_index WHERE entity_type = 'CONTACT')::numeric / 
        (SELECT COUNT(*) FROM public.contacts)::numeric * 100, 2
      )
    END AS coverage_pct;
END;
$$;

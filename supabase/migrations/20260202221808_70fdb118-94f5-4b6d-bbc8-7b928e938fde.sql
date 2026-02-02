-- Enable pg_trgm extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create the search_index table
CREATE TABLE public.search_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  title text,
  subtitle text,
  search_text text NOT NULL,
  phone_normalized text,
  address_normalized text,
  market_code text,
  status text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

-- Full-text search index
CREATE INDEX idx_search_text_fts
ON public.search_index
USING gin (to_tsvector('english', search_text));

-- Trigram index for fuzzy title matching
CREATE INDEX idx_search_title_trgm
ON public.search_index
USING gin (title gin_trgm_ops);

-- Phone lookup index
CREATE INDEX idx_search_phone
ON public.search_index (phone_normalized);

-- Entity lookup index
CREATE INDEX idx_search_entity
ON public.search_index (entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.search_index ENABLE ROW LEVEL SECURITY;

-- RLS policy for staff access
CREATE POLICY "Staff can search"
ON public.search_index
FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'dispatcher', 'driver', 'finance']::app_role[])
);

-- Create the global_search RPC function
CREATE OR REPLACE FUNCTION public.global_search(
  p_query text,
  p_limit int default 20
)
RETURNS TABLE (
  entity_type text,
  entity_id uuid,
  title text,
  subtitle text,
  rank real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    si.entity_type,
    si.entity_id,
    si.title,
    si.subtitle,
    ts_rank(
      to_tsvector('english', si.search_text),
      plainto_tsquery('english', p_query)
    ) AS rank
  FROM search_index si
  WHERE
    si.search_text @@ plainto_tsquery('english', p_query)
    OR si.phone_normalized LIKE '%' || regexp_replace(p_query, '\D', '', 'g') || '%'
  ORDER BY rank DESC
  LIMIT p_limit;
$$;
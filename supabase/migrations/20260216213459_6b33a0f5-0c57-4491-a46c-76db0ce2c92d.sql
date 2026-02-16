
-- Add a sequential display ID to quotes
ALTER TABLE public.quotes ADD COLUMN display_id text UNIQUE;

-- Create a sequence for quote numbering
CREATE SEQUENCE public.quotes_display_id_seq START WITH 1;

-- Backfill existing quotes in chronological order
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.quotes
)
UPDATE public.quotes q
SET display_id = 'CA-' || LPAD(n.rn::text, 3, '0')
FROM numbered n
WHERE q.id = n.id;

-- Set sequence to next value after backfill
SELECT setval('public.quotes_display_id_seq', COALESCE((SELECT MAX(SUBSTRING(display_id FROM 4)::int) FROM public.quotes), 0));

-- Auto-assign display_id on new inserts
CREATE OR REPLACE FUNCTION public.set_quote_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'CA-' || LPAD(nextval('public.quotes_display_id_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_set_quote_display_id
BEFORE INSERT ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.set_quote_display_id();

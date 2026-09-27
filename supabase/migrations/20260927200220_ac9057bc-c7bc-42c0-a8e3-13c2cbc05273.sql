CREATE OR REPLACE FUNCTION public.set_quote_display_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE n text;
BEGIN
  IF NEW.display_id IS NULL THEN
    n := nextval('public.quotes_display_id_seq')::text;
    NEW.display_id := 'CA-' || CASE WHEN length(n) < 3 THEN LPAD(n, 3, '0') ELSE n END;
  END IF;
  RETURN NEW;
END;
$function$;
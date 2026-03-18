
-- Drop conflicting function and recreate
DROP FUNCTION IF EXISTS public.normalize_phone(text);

CREATE OR REPLACE FUNCTION public.normalize_phone(raw text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT RIGHT(regexp_replace(COALESCE(raw, ''), '[^0-9]', '', 'g'), 10)
$$;

CREATE OR REPLACE FUNCTION public.trg_normalize_lead_identity()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.normalized_phone := public.normalize_phone(NEW.customer_phone);
  NEW.normalized_email := LOWER(TRIM(NEW.customer_email));
  NEW.latest_touch_at := now();
  IF NEW.first_touch_at IS NULL THEN
    NEW.first_touch_at := now();
  END IF;
  IF NEW.next_best_action IS NULL OR OLD IS NULL OR OLD.lead_status IS DISTINCT FROM NEW.lead_status THEN
    NEW.next_best_action := CASE NEW.lead_status
      WHEN 'new' THEN 'Call Customer'
      WHEN 'contacted' THEN 'Send Quote'
      WHEN 'quote_started' THEN 'Finish Quote'
      WHEN 'price_shown' THEN 'Send Quote'
      WHEN 'contact_captured' THEN 'Send Quote'
      WHEN 'quote_ready' THEN 'Send Contract'
      WHEN 'contract_pending' THEN 'Send Payment Link'
      WHEN 'payment_pending' THEN 'Call Customer'
      WHEN 'ready_for_dispatch' THEN 'Schedule Delivery'
      ELSE NEW.next_best_action
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_identity_normalize ON public.sales_leads;
CREATE TRIGGER trg_lead_identity_normalize
  BEFORE INSERT OR UPDATE ON public.sales_leads
  FOR EACH ROW EXECUTE FUNCTION public.trg_normalize_lead_identity();


-- ============================================================
-- COMPLETE SEARCH INDEX INFRASTRUCTURE
-- ============================================================

-- PHASE 1: CREATE CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  full_name text,
  email text,
  phone text,
  phone_normalized text,
  job_title text,
  is_primary boolean DEFAULT false,
  street_address text,
  city text,
  state text,
  zip text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_customer_id ON public.contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_normalized ON public.contacts(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Staff can read contacts') THEN
    CREATE POLICY "Staff can read contacts" ON public.contacts FOR SELECT TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'dispatcher', 'driver', 'finance']::app_role[]));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Staff can insert contacts') THEN
    CREATE POLICY "Staff can insert contacts" ON public.contacts FOR INSERT TO authenticated
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs']::app_role[]));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Staff can update contacts') THEN
    CREATE POLICY "Staff can update contacts" ON public.contacts FOR UPDATE TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs']::app_role[]));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Admin can delete contacts') THEN
    CREATE POLICY "Admin can delete contacts" ON public.contacts FOR DELETE TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));
  END IF;
END $$;

-- PHASE 2: NORMALIZATION FUNCTIONS
CREATE OR REPLACE FUNCTION public.normalize_phone(p_phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN p_phone IS NULL OR p_phone = '' THEN NULL
    ELSE regexp_replace(p_phone, '\D', '', 'g')
  END
$$;

CREATE OR REPLACE FUNCTION public.normalize_address(p_address text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN p_address IS NULL OR p_address = '' THEN NULL
    ELSE lower(regexp_replace(trim(p_address), '[^a-zA-Z0-9\s]', ' ', 'g'))
  END
$$;

-- PHASE 3: UPSERT FUNCTION
CREATE OR REPLACE FUNCTION public.upsert_search_index(
  p_entity_type text,
  p_entity_id uuid,
  p_title text,
  p_subtitle text DEFAULT NULL,
  p_search_text text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_market_code text DEFAULT NULL,
  p_status text DEFAULT 'active'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_phone_normalized text;
  v_address_normalized text;
BEGIN
  v_phone_normalized := public.normalize_phone(p_phone);
  v_address_normalized := public.normalize_address(p_address);
  
  INSERT INTO public.search_index (
    entity_type, entity_id, title, subtitle, search_text,
    phone_normalized, address_normalized, market_code, status, updated_at
  ) VALUES (
    p_entity_type, p_entity_id, p_title, p_subtitle, p_search_text,
    v_phone_normalized, v_address_normalized, p_market_code, p_status, now()
  )
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    search_text = EXCLUDED.search_text,
    phone_normalized = EXCLUDED.phone_normalized,
    address_normalized = EXCLUDED.address_normalized,
    market_code = EXCLUDED.market_code,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- PHASE 4: CUSTOMER INDEXING TRIGGER
CREATE OR REPLACE FUNCTION public.trg_index_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
  v_subtitle text;
  v_search_text text;
  v_phone text;
  v_address text;
  v_status text;
  v_contact_phones text;
  v_contact_emails text;
  v_contact_names text;
BEGIN
  v_title := COALESCE(NEW.company_name, NEW.billing_email, 'Customer');
  v_subtitle := COALESCE(NEW.billing_phone, NEW.billing_email, '');
  v_phone := COALESCE(NEW.billing_phone, NEW.phone);
  v_address := COALESCE(NEW.billing_address, '');
  v_status := CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END;
  
  SELECT 
    string_agg(DISTINCT c.phone, ' '),
    string_agg(DISTINCT c.email, ' '),
    string_agg(DISTINCT c.full_name, ' ')
  INTO v_contact_phones, v_contact_emails, v_contact_names
  FROM public.contacts c
  WHERE c.customer_id = NEW.id AND c.is_active = true;
  
  v_search_text := COALESCE(NEW.company_name, '') || ' ' ||
    COALESCE(NEW.billing_phone, '') || ' ' ||
    COALESCE(NEW.phone, '') || ' ' ||
    COALESCE(NEW.billing_email, '') || ' ' ||
    COALESCE(NEW.billing_address, '') || ' ' ||
    COALESCE(NEW.customer_type, '') || ' ' ||
    COALESCE(NEW.notes, '') || ' ' ||
    COALESCE(v_contact_phones, '') || ' ' ||
    COALESCE(v_contact_emails, '') || ' ' ||
    COALESCE(v_contact_names, '');
  
  PERFORM public.upsert_search_index(
    'CUSTOMER', NEW.id, v_title, v_subtitle, v_search_text, v_phone, v_address, NULL, v_status
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_customers_search_index ON public.customers;
CREATE TRIGGER trg_customers_search_index
  AFTER INSERT OR UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_index_customer();

-- PHASE 5: CONTACT INDEXING TRIGGER
CREATE OR REPLACE FUNCTION public.trg_index_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
  v_subtitle text;
  v_search_text text;
  v_address text;
  v_status text;
  v_customer_name text;
BEGIN
  v_title := COALESCE(NEW.full_name, NEW.email, NEW.phone, 'Contact');
  
  IF NEW.customer_id IS NOT NULL THEN
    SELECT company_name INTO v_customer_name FROM public.customers WHERE id = NEW.customer_id;
  END IF;
  
  IF NEW.customer_id IS NOT NULL AND v_customer_name IS NOT NULL THEN
    v_subtitle := COALESCE(NEW.phone, NEW.email, '') || ' @ ' || v_customer_name;
  ELSE
    v_subtitle := COALESCE(NEW.phone, NEW.email, '');
  END IF;
  
  v_address := COALESCE(NEW.street_address, NULLIF(CONCAT_WS(' ', NEW.city, NEW.state, NEW.zip), ''));
  v_status := CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END;
  
  v_search_text := COALESCE(NEW.full_name, '') || ' ' ||
    COALESCE(v_customer_name, '') || ' ' ||
    COALESCE(NEW.phone, '') || ' ' ||
    COALESCE(NEW.email, '') || ' ' ||
    COALESCE(NEW.job_title, '') || ' ' ||
    COALESCE(NEW.street_address, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.state, '') || ' ' ||
    COALESCE(NEW.zip, '') || ' ' ||
    COALESCE(NEW.notes, '');
  
  NEW.phone_normalized := public.normalize_phone(NEW.phone);
  
  PERFORM public.upsert_search_index('CONTACT', NEW.id, v_title, v_subtitle, v_search_text, NEW.phone, v_address, NULL, v_status);
  
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE public.customers SET updated_at = now() WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_contact_delete_reindex()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.search_index WHERE entity_type = 'CONTACT' AND entity_id = OLD.id;
  IF OLD.customer_id IS NOT NULL THEN
    UPDATE public.customers SET updated_at = now() WHERE id = OLD.customer_id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_contacts_search_index ON public.contacts;
CREATE TRIGGER trg_contacts_search_index
  BEFORE INSERT OR UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_index_contact();

DROP TRIGGER IF EXISTS trg_contacts_delete ON public.contacts;
CREATE TRIGGER trg_contacts_delete
  AFTER DELETE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_contact_delete_reindex();

-- PHASE 6: BACKFILL HELPERS
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

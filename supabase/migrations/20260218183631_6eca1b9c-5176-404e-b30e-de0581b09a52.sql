
-- Table to store card info per lead
CREATE TABLE public.lead_card_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  card_holder_name TEXT,
  card_number_encrypted TEXT NOT NULL,
  card_last_four TEXT NOT NULL,
  expiration_month SMALLINT NOT NULL,
  expiration_year SMALLINT NOT NULL,
  cvv_encrypted TEXT NOT NULL,
  card_brand TEXT,
  added_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lead_id)
);

ALTER TABLE public.lead_card_info ENABLE ROW LEVEL SECURITY;

-- Security definer function: check if user has finance or billing_specialist role
CREATE OR REPLACE FUNCTION public.has_billing_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('finance', 'billing_specialist', 'admin', 'finance_admin')
  )
$$;

-- All authenticated staff can INSERT (sales agents adding card info)
CREATE POLICY "Staff can insert card info"
  ON public.lead_card_info FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = added_by);

-- All authenticated can SELECT (but we'll control what columns via a view)
CREATE POLICY "Authenticated can read card info"
  ON public.lead_card_info FOR SELECT
  TO authenticated
  USING (true);

-- Only finance/billing can UPDATE
CREATE POLICY "Billing staff can update card info"
  ON public.lead_card_info FOR UPDATE
  TO authenticated
  USING (public.has_billing_access(auth.uid()));

-- Only finance/billing can DELETE
CREATE POLICY "Billing staff can delete card info"
  ON public.lead_card_info FOR DELETE
  TO authenticated
  USING (public.has_billing_access(auth.uid()));

-- View that masks sensitive fields based on role
CREATE OR REPLACE VIEW public.lead_card_info_view
WITH (security_invoker = on) AS
SELECT
  id,
  lead_id,
  card_holder_name,
  CASE
    WHEN public.has_billing_access(auth.uid()) THEN card_number_encrypted
    ELSE '****-****-****-' || card_last_four
  END AS card_number,
  card_last_four,
  expiration_month,
  expiration_year,
  CASE
    WHEN public.has_billing_access(auth.uid()) THEN cvv_encrypted
    ELSE '***'
  END AS cvv,
  card_brand,
  added_by,
  created_at,
  updated_at,
  public.has_billing_access(auth.uid()) AS can_view_full
FROM public.lead_card_info;

-- Trigger for updated_at
CREATE TRIGGER update_lead_card_info_updated_at
  BEFORE UPDATE ON public.lead_card_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

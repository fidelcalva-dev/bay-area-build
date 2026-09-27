DROP POLICY IF EXISTS "Public can update recent own quotes before order" ON public.quotes;
DROP POLICY IF EXISTS "Public quote creation" ON public.quotes;

CREATE POLICY "Public quote creation (draft or pending only)"
  ON public.quotes FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['admin','sales','dispatcher']::app_role[])
    OR (
      COALESCE(status, 'pending') IN ('draft','pending')
      AND order_id IS NULL
      AND converted_at IS NULL
    )
  );
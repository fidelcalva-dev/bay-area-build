-- CAL 011 — Customer files, intake rules and deactivated staff.
-- Tightening only. No data rows are changed. Recovery notes: docs/CAL_010.md (CAL 011 section).

-- 1) Deactivated staff lose every role-based permission (disabling a user only changed staff_users.status).
CREATE INDEX IF NOT EXISTS idx_staff_users_user_id ON public.staff_users(user_id);

CREATE OR REPLACE FUNCTION public.staff_is_deactivated(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT _user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.staff_users s
    WHERE s.user_id = _user_id AND s.status IN ('inactive','disabled','suspended','terminated'))
$$;
REVOKE ALL ON FUNCTION public.staff_is_deactivated(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.staff_is_deactivated(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
     AND NOT public.staff_is_deactivated(_user_id)
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles))
     AND NOT public.staff_is_deactivated(_user_id)
$$;

CREATE OR REPLACE FUNCTION public.has_billing_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
                 AND role IN ('finance','billing_specialist','admin','finance_admin'))
     AND NOT public.staff_is_deactivated(_user_id)
$$;

CREATE OR REPLACE FUNCTION public.check_admin_permission(_user_id uuid, _module text, _action text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  has_permission boolean := false;
  user_role app_role;
BEGIN
  IF public.staff_is_deactivated(_user_id) THEN
    RETURN false;
  END IF;
  FOR user_role IN SELECT role FROM user_roles WHERE user_id = _user_id
  LOOP
    SELECT CASE _action
        WHEN 'read' THEN can_read
        WHEN 'write' THEN can_write
        WHEN 'approve' THEN can_approve
        WHEN 'delete' THEN can_delete
        ELSE false
      END INTO has_permission
    FROM admin_permissions
    WHERE role = user_role AND module = _module;
    IF has_permission THEN
      RETURN true;
    END IF;
  END LOOP;
  RETURN false;
END;
$function$;

-- Policies that read user_roles directly (23 at the time of writing): add the deactivation check.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename, policyname, qual, with_check FROM pg_policies
    WHERE schemaname = 'public'
      AND (qual ILIKE '%from user_roles%' OR with_check ILIKE '%from user_roles%')
      AND coalesce(qual, '') NOT ILIKE '%staff_is_deactivated%'
      AND coalesce(with_check, '') NOT ILIKE '%staff_is_deactivated%'
  LOOP
    EXECUTE format('ALTER POLICY %I ON public.%I %s %s', r.policyname, r.tablename,
      CASE WHEN r.qual IS NOT NULL THEN format('USING ((%s) AND NOT public.staff_is_deactivated(auth.uid()))', r.qual) ELSE '' END,
      CASE WHEN r.with_check IS NOT NULL THEN format('WITH CHECK ((%s) AND NOT public.staff_is_deactivated(auth.uid()))', r.with_check) ELSE '' END);
  END LOOP;
END $$;

-- 2) "Office staff": active staff with an office role (excludes drivers, owner-operators, customers).
--    No argument: it only answers for the caller, so it cannot be used to probe other accounts.
CREATE OR REPLACE FUNCTION public.current_user_is_office_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND public.is_staff(auth.uid())
    AND NOT public.staff_is_deactivated(auth.uid())
    AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid()
      AND r.role::text IN ('admin','system_admin','owner','executive','ops_admin','sales','sales_admin','sales_rep',
                           'dispatcher','cs','cs_agent','customer_service','finance','finance_admin','billing_specialist'))
$$;
REVOKE ALL ON FUNCTION public.current_user_is_office_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_is_office_staff() TO anon, authenticated, service_role;

-- 3) Customer photos (waste-uploads): visitors can still upload for the size analysis; only office staff can read.
DROP POLICY IF EXISTS "Anyone can read waste uploads" ON storage.objects;
CREATE POLICY "Office staff read waste uploads" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'waste-uploads' AND public.current_user_is_office_staff());
ALTER POLICY "Anyone can upload waste photos" ON storage.objects
  WITH CHECK (bucket_id = 'waste-uploads'
    AND (name ~ '^photo_[0-9]{10,16}_[a-z0-9]{0,12}\.jpg$'
         OR name ~ '^(photo|video)-assessments/[0-9]{10,16}_[a-z0-9]{0,12}\.(jpg|mp4)$'));

-- Contractor application documents: applicants upload; only office staff read or delete.
DROP POLICY IF EXISTS "Authenticated can view contractor docs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete contractor docs" ON storage.objects;
CREATE POLICY "Office staff view contractor docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'contractor-documents' AND public.current_user_is_office_staff());
CREATE POLICY "Office staff delete contractor docs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'contractor-documents' AND public.current_user_is_office_staff());
ALTER POLICY "Anyone can upload contractor docs" ON storage.objects
  WITH CHECK (bucket_id = 'contractor-documents' AND name ~ '^applications/[0-9]{10,16}_[a-z0-9_]{1,40}\.[A-Za-z0-9]{1,10}$');

-- Placement screenshots from the public quote flow: only office staff read.
DROP POLICY IF EXISTS "Authenticated users can read placement screenshots" ON storage.objects;
CREATE POLICY "Office staff read placement screenshots" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'placements-private' AND public.current_user_is_office_staff());
ALTER POLICY "Anyone can upload placement screenshots" ON storage.objects
  WITH CHECK (bucket_id = 'placements-private' AND name ~ '^quotes/[0-9a-f-]{36}/[0-9]{10,16}_placement\.png$');

-- Order documents: any signed-in account could add, replace or delete them.
ALTER POLICY "Staff can upload order documents" ON storage.objects
  WITH CHECK (bucket_id = 'order-documents' AND public.current_user_is_office_staff());
ALTER POLICY "Staff can update order documents" ON storage.objects
  USING (bucket_id = 'order-documents' AND public.current_user_is_office_staff());
ALTER POLICY "Staff can delete order documents" ON storage.objects
  USING (bucket_id = 'order-documents' AND public.current_user_is_office_staff());

-- Quote photos (public links already shared keep working): stop listing; only office staff add/delete.
DROP POLICY IF EXISTS "Public read access for quote photos" ON storage.objects;
ALTER POLICY "Authenticated users can upload quote photos" ON storage.objects
  WITH CHECK (bucket_id = 'quote-photos' AND public.current_user_is_office_staff());
ALTER POLICY "Authenticated users can delete quote photos" ON storage.objects
  USING (bucket_id = 'quote-photos' AND public.current_user_is_office_staff());

-- Vehicle photos (public links keep working): stop listing; only active staff (incl. drivers) upload.
DROP POLICY IF EXISTS "Anyone can view vehicle photos" ON storage.objects;
ALTER POLICY "Authenticated users can upload vehicle photos" ON storage.objects
  WITH CHECK (bucket_id = 'vehicle-photos' AND public.is_staff(auth.uid()));

-- Call recordings are written by the backend only.
DROP POLICY IF EXISTS "System can upload call recordings" ON storage.objects;
-- Lead exports and camera videos: office staff only.
ALTER POLICY "System can upload lead exports" ON storage.objects
  WITH CHECK (bucket_id = 'lead-exports' AND public.current_user_is_office_staff());
ALTER POLICY "Upload camera videos" ON storage.objects
  WITH CHECK (bucket_id = 'camera-videos' AND public.current_user_is_office_staff());

-- 4) Cameras and customer profiles: no public writes (camera-webhook uses the backend key).
DROP POLICY IF EXISTS "Anon insert clips" ON public.camera_clips;
DROP POLICY IF EXISTS "Anon insert camera events" ON public.camera_events;
ALTER POLICY "Insert clips" ON public.camera_clips WITH CHECK (public.current_user_is_office_staff());
ALTER POLICY "Service can insert camera events" ON public.camera_events WITH CHECK (public.current_user_is_office_staff());
DROP POLICY IF EXISTS "Anyone can create customer profiles" ON public.customer_profiles;

-- 5) Remaining "anyone" rules from the scan.
DROP POLICY IF EXISTS "Anyone can read permissions" ON public.role_permissions;
CREATE POLICY "Staff can read permissions" ON public.role_permissions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Anyone can insert selections" ON public.quote_item_selections;
DROP POLICY IF EXISTS "Anyone can read selections" ON public.quote_item_selections;
CREATE POLICY "Office staff read selections" ON public.quote_item_selections FOR SELECT TO authenticated
  USING (public.current_user_is_office_staff());

DROP POLICY IF EXISTS "Service insert lead_visitor_links" ON public.lead_visitor_links;

-- Placement from the public quote flow: only for an existing, recent, unconverted quote; reads are staff only.
CREATE OR REPLACE FUNCTION public.quote_accepts_public_placement(_quote_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT _quote_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = _quote_id AND q.created_at > now() - interval '30 days'
      AND coalesce(q.status, '') NOT IN ('converted','cancelled','canceled','lost','expired'))
$$;
REVOKE ALL ON FUNCTION public.quote_accepts_public_placement(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.quote_accepts_public_placement(uuid) TO anon, authenticated, service_role;
ALTER POLICY "Anyone can insert quote placement" ON public.quote_site_placement
  WITH CHECK (public.quote_accepts_public_placement(quote_id));
DROP POLICY IF EXISTS "Anyone can view quote placement" ON public.quote_site_placement;
CREATE POLICY "Office staff view quote placement" ON public.quote_site_placement FOR SELECT TO authenticated
  USING (public.current_user_is_office_staff());

-- Chat hand-off packets: visitors may create one (unreviewed, unassigned); only active staff read/update.
ALTER POLICY "Service insert handoff_packets" ON public.lead_handoff_packets
  WITH CHECK (coalesce(is_reviewed, false) = false AND reviewed_by IS NULL AND reviewed_at IS NULL
              AND assigned_user_id IS NULL AND length(coalesce(summary_text, '')) <= 10000);
ALTER POLICY "Authenticated read handoff_packets" ON public.lead_handoff_packets
  USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated update handoff_packets" ON public.lead_handoff_packets
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Photo analyses: any signed-in account (customers included) could read every analysis.
ALTER POLICY "Staff can read waste vision analyses" ON public.waste_vision_analyses
  USING (public.current_user_is_office_staff());

-- 6) Quote messages: an idempotency key so a retried send never sends twice.
ALTER TABLE public.outbound_quote_messages ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE UNIQUE INDEX IF NOT EXISTS outbound_quote_messages_idem_uq
  ON public.outbound_quote_messages (outbound_quote_id, channel, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
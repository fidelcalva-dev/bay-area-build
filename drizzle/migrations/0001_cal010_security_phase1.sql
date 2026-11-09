-- CAL 010 — Security hardening, phase 1.
-- Closes rules that let anyone on the internet (or any self-registered account)
-- read or change other people's records. Service-role code is unaffected (it bypasses RLS).

-- 1) Helper: active staff member = has a non-customer role and is not deactivated.
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT _user_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.user_roles r
                WHERE r.user_id = _user_id AND r.role::text NOT IN ('customer','user'))
    AND NOT EXISTS (SELECT 1 FROM public.staff_users s
                    WHERE s.user_id = _user_id AND s.status IS DISTINCT FROM 'active')
$$;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO anon, authenticated, service_role;

-- 2) "Service" policies that were attached to every role instead of service_role.
DROP POLICY IF EXISTS "Service can manage links" ON public.entity_google_links;
DROP POLICY IF EXISTS "Service role can manage sync logs" ON public.ghl_sync_log;
DROP POLICY IF EXISTS "Service role full access deliveries" ON public.internal_alert_deliveries;
DROP POLICY IF EXISTS "Service role full access internal_alerts" ON public.internal_alerts;

-- 3) Anonymous read/update on tables only edge functions use.
DROP POLICY IF EXISTS "Anon can read by token" ON public.activation_tokens;
DROP POLICY IF EXISTS "Anyone can read customer profiles" ON public.customer_profiles;
DROP POLICY IF EXISTS "Anyone can read own draft by token" ON public.quote_drafts;
DROP POLICY IF EXISTS "Anyone can update own draft by token" ON public.quote_drafts;
DROP POLICY IF EXISTS "Allow anon update quote_sessions" ON public.quote_sessions;
DROP POLICY IF EXISTS "Service update visitor_profiles" ON public.visitor_profiles;
DROP POLICY IF EXISTS "Service update visitor_sessions" ON public.visitor_sessions;
ALTER POLICY "Users can view compensation periods" ON public.compensation_periods USING (public.is_staff(auth.uid()));

-- 4) Audit log: no inserts from unauthenticated requests.
ALTER POLICY "Staff can insert audit logs" ON public.audit_logs WITH CHECK (public.is_staff(auth.uid()));

-- 5) Website chat: stop public listing/updating of every conversation.
DROP POLICY IF EXISTS "Authenticated read ai_chat_messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Authenticated read ai_chat_sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Anon can update own session" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Anyone can read own conversation by session" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update own conversation" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can read messages" ON public.chat_messages;
CREATE POLICY "Staff read ai_chat_messages" ON public.ai_chat_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff read ai_chat_sessions" ON public.ai_chat_sessions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update ai_chat_sessions" ON public.ai_chat_sessions FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff read chat_conversations" ON public.chat_conversations FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update chat_conversations" ON public.chat_conversations FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff read chat_messages" ON public.chat_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.chat_session_create(
  p_utm_source text DEFAULT NULL, p_utm_medium text DEFAULT NULL, p_utm_campaign text DEFAULT NULL,
  p_referrer_url text DEFAULT NULL, p_landing_url text DEFAULT NULL, p_user_agent text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.ai_chat_sessions;
BEGIN
  INSERT INTO public.ai_chat_sessions (utm_source, utm_medium, utm_campaign, referrer_url, landing_url, capture_user_agent)
  VALUES (left(p_utm_source,200), left(p_utm_medium,200), left(p_utm_campaign,200),
          left(p_referrer_url,1000), left(p_landing_url,1000), left(p_user_agent,500))
  RETURNING * INTO r;
  RETURN jsonb_build_object('id', r.id, 'session_token', r.session_token, 'lead_id', r.lead_id,
                            'status', r.status, 'context_json', r.context_json);
END $$;

CREATE OR REPLACE FUNCTION public.chat_session_update(
  p_session_id uuid, p_session_token text,
  p_context jsonb DEFAULT NULL, p_status text DEFAULT NULL, p_lead_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_lead uuid;
BEGIN
  IF p_status IS NOT NULL AND p_status NOT IN ('HANDED_OFF','CLOSED') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;
  UPDATE public.ai_chat_sessions
     SET context_json = COALESCE(p_context, context_json),
         status = COALESCE(p_status, status),
         lead_id = COALESCE(lead_id, p_lead_id),
         last_event_at = now()
   WHERE id = p_session_id AND session_token = p_session_token
   RETURNING lead_id INTO v_lead;
  RETURN v_lead;
END $$;

CREATE OR REPLACE FUNCTION public.chat_session_lead(p_session_id uuid, p_session_token text)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lead_id FROM public.ai_chat_sessions WHERE id = p_session_id AND session_token = p_session_token
$$;

CREATE OR REPLACE FUNCTION public.chat_conversation_update(
  p_id uuid, p_context jsonb DEFAULT NULL, p_customer_name text DEFAULT NULL,
  p_customer_phone text DEFAULT NULL, p_customer_email text DEFAULT NULL, p_escalate boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.chat_conversations
     SET context_json = COALESCE(p_context, context_json),
         customer_name = COALESCE(left(p_customer_name,200), customer_name),
         customer_phone = COALESCE(left(p_customer_phone,40), customer_phone),
         customer_email = COALESCE(left(p_customer_email,200), customer_email),
         status = CASE WHEN p_escalate THEN 'escalated' ELSE status END,
         escalation_reason = CASE WHEN p_escalate THEN 'Lead captured via chat' ELSE escalation_reason END,
         updated_at = now()
   WHERE id = p_id AND status IN ('active','escalated');
END $$;

REVOKE ALL ON FUNCTION public.chat_session_create(text,text,text,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.chat_session_update(uuid,text,jsonb,text,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.chat_session_lead(uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.chat_conversation_update(uuid,jsonb,text,text,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.chat_session_create(text,text,text,text,text,text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.chat_session_update(uuid,text,jsonb,text,uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.chat_session_lead(uuid,text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.chat_conversation_update(uuid,jsonb,text,text,text,boolean) TO anon, authenticated, service_role;

-- 6) Contract signing links: no public listing; signing only through a checked function.
-- Holding the link (contract id) is what authorizes viewing/signing; it is not identity proof.
DROP POLICY IF EXISTS "Anon can view contracts for signing" ON public.contracts;
DROP POLICY IF EXISTS "Anon can sign contracts" ON public.contracts;

CREATE OR REPLACE FUNCTION public.contract_for_signing(p_contract_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.contracts; q record;
BEGIN
  SELECT * INTO c FROM public.contracts WHERE id = p_contract_id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF c.status = 'pending' THEN
    UPDATE public.contracts SET viewed_at = now() WHERE id = c.id AND viewed_at IS NULL;
    INSERT INTO public.contract_events (contract_id, event_type, metadata)
    VALUES (c.id, 'viewed', jsonb_build_object('timestamp', now()));
  END IF;
  IF c.quote_id IS NOT NULL THEN
    SELECT customer_name, subtotal, material_type, zip_code INTO q FROM public.quotes WHERE id = c.quote_id;
  END IF;
  RETURN jsonb_build_object(
    'contract', jsonb_build_object(
      'id', c.id, 'customer_id', c.customer_id, 'contract_type', c.contract_type, 'status', c.status,
      'terms_content', c.terms_content, 'service_address', c.service_address, 'signed_at', c.signed_at,
      'signer_name', c.signer_name, 'expires_at', c.expires_at, 'quote_id', c.quote_id,
      'contract_version', c.contract_version, 'terms_version', c.terms_version),
    'quote', CASE WHEN q IS NULL THEN NULL ELSE jsonb_build_object(
      'customer_name', q.customer_name, 'subtotal', q.subtotal, 'material_type', q.material_type, 'zip_code', q.zip_code) END);
END $$;

CREATE OR REPLACE FUNCTION public.contract_sign(
  p_contract_id uuid, p_signer_name text, p_signer_email text, p_terms_version text,
  p_policy_version text, p_user_agent text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.contracts; v_now timestamptz := now(); v_name text := btrim(coalesce(p_signer_name,''));
BEGIN
  IF length(v_name) < 2 OR length(v_name) > 200 THEN RAISE EXCEPTION 'signer name required'; END IF;
  SELECT * INTO c FROM public.contracts WHERE id = p_contract_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
  IF c.status = 'signed' THEN RETURN jsonb_build_object('ok', true, 'already_signed', true); END IF;
  IF c.status <> 'pending' THEN RETURN jsonb_build_object('ok', false, 'code', 'not_pending'); END IF;
  IF c.expires_at IS NOT NULL AND c.expires_at < v_now THEN RETURN jsonb_build_object('ok', false, 'code', 'expired'); END IF;

  UPDATE public.contracts SET status = 'signed', signed_at = v_now, signer_name = v_name,
         signer_email = NULLIF(left(btrim(coalesce(p_signer_email,'')),200), ''),
         signature_method = 'web_link', esign_consent_at = v_now,
         terms_version = left(p_terms_version,40), contract_version = left(p_terms_version,40)
   WHERE id = c.id;

  INSERT INTO public.contract_events (contract_id, event_type, metadata)
  VALUES (c.id, 'signed', jsonb_build_object('method','web_link','signer_name',v_name,
          'signer_email', NULLIF(btrim(coalesce(p_signer_email,'')),''), 'esign_consent', true,
          'terms_version', p_terms_version, 'policy_version', p_policy_version,
          'authorization', 'link_holder'));

  INSERT INTO public.document_acceptances (customer_id, contract_id, document_type, version_code,
          signer_name, signer_email, delivery_method, electronic_consent_given, electronic_consent_at, user_agent)
  VALUES (c.customer_id, c.id, CASE WHEN c.contract_type = 'msa' THEN 'contract_msa' ELSE 'contract_addendum' END,
          left(p_terms_version,40), v_name, NULLIF(btrim(coalesce(p_signer_email,'')),''), 'sms_link', true, v_now,
          left(p_user_agent,500));

  IF c.customer_id IS NOT NULL THEN
    INSERT INTO public.timeline_events (entity_type, entity_id, customer_id, event_type, event_action, summary, details_json)
    VALUES ('CUSTOMER', c.customer_id, c.customer_id, 'SYSTEM', 'COMPLETED', 'Contract signed by ' || v_name,
            jsonb_build_object('contract_id', c.id, 'contract_type', c.contract_type, 'signer_name', v_name,
                               'terms_version', p_terms_version, 'event', 'CONTRACT_SIGNED'));
  END IF;
  RETURN jsonb_build_object('ok', true, 'already_signed', false);
END $$;

REVOKE ALL ON FUNCTION public.contract_for_signing(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.contract_sign(uuid,text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.contract_for_signing(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.contract_sign(uuid,text,text,text,text,text) TO anon, authenticated, service_role;

-- 7) Rules that only checked "someone is signed in": anyone can create an account,
--    so these now require an active staff member.
ALTER POLICY "Authenticated users can insert events" ON public.ai_control_events WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read events" ON public.ai_control_events USING (public.is_staff(auth.uid()));
ALTER POLICY "Staff can read knowledge base" ON public.ai_control_knowledge USING (public.is_staff(auth.uid()));
ALTER POLICY "Insert clips" ON public.camera_clips WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Service can insert camera events" ON public.camera_events WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_companies" ON public.companies USING (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_cs" ON public.company_services USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read contractor_accounts" ON public.contractor_accounts USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read contractor_pricing_rules" ON public.contractor_pricing_rules USING (public.is_staff(auth.uid()));
ALTER POLICY "Staff can read contractor tiers" ON public.contractor_tiers USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can insert crm_errors" ON public.crm_errors WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read crm_errors" ON public.crm_errors USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage customer contacts" ON public.customer_contacts USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_dump_rules" ON public.customer_required_dump_rules USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage customer sites" ON public.customer_sites USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can insert document_acceptances" ON public.document_acceptances WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read document_acceptances" ON public.document_acceptances USING (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_dt" ON public.document_templates_mt USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read document_versions" ON public.document_versions USING (public.is_staff(auth.uid()));
ALTER POLICY "Drivers and admins can insert truck assignments" ON public.driver_truck_assignments WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read truck assignments" ON public.driver_truck_assignments USING (public.is_staff(auth.uid()));
ALTER POLICY "Admins can update truck assignments" ON public.driver_truck_assignments USING (public.is_staff(auth.uid()));
ALTER POLICY "Anyone can view dumpster dimensions" ON public.dumpster_dimensions USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated can view links" ON public.entity_google_links USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can insert stage history" ON public.entity_stage_history WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can view stage history" ON public.entity_stage_history USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can update stage history" ON public.entity_stage_history USING (public.is_staff(auth.uid()));
ALTER POLICY "Staff can read extra_catalog" ON public.extra_catalog USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage extra_items" ON public.extra_items USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read extra_items" ON public.extra_items USING (public.is_staff(auth.uid()));
ALTER POLICY "Staff can read extra_pricing_rules" ON public.extra_pricing_rules USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read templates" ON public.followup_templates USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage identity groups" ON public.identity_groups USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage merge suggestions" ON public.identity_merge_suggestions USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can insert lead activity logs" ON public.lead_activity_log WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read lead activity logs" ON public.lead_activity_log USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can delete lead addresses" ON public.lead_addresses USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can insert lead addresses" ON public.lead_addresses WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read lead addresses" ON public.lead_addresses USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can update lead addresses" ON public.lead_addresses USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated can read card info" ON public.lead_card_info USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can view lead channels" ON public.lead_channels USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage follow-up tasks" ON public.lead_follow_up_tasks USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Allow authenticated insert lead_source_events" ON public.lead_source_events WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Allow authenticated read lead_source_events" ON public.lead_source_events USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can insert lifecycle_alerts" ON public.lifecycle_alerts WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read lifecycle_alerts" ON public.lifecycle_alerts USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can update lifecycle_alerts" ON public.lifecycle_alerts USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can insert lifecycle_entities" ON public.lifecycle_entities WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read lifecycle_entities" ON public.lifecycle_entities USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can update lifecycle_entities" ON public.lifecycle_entities USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can insert lifecycle_events" ON public.lifecycle_events WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read lifecycle_events" ON public.lifecycle_events USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated can view SLA config" ON public.lifecycle_sla_config USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read lifecycle_stages" ON public.lifecycle_stages USING (public.is_staff(auth.uid()));
ALTER POLICY "Admin/maintenance can manage work orders" ON public.maintenance_work_orders WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read work orders" ON public.maintenance_work_orders USING (public.is_staff(auth.uid()));
ALTER POLICY "Admin/maintenance can update work orders" ON public.maintenance_work_orders USING (public.is_staff(auth.uid()));
ALTER POLICY "Market rates readable by authenticated users" ON public.market_rates USING (public.is_staff(auth.uid()));
ALTER POLICY "Markets readable by authenticated users" ON public.markets USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can view notification events" ON public.notification_events USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can view routing config" ON public.notification_routing_config USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage order_extras" ON public.order_extras USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read order_extras" ON public.order_extras USING (public.is_staff(auth.uid()));
ALTER POLICY "Staff can insert outbound quote messages" ON public.outbound_quote_messages WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Staff can read outbound quote messages" ON public.outbound_quote_messages USING (public.is_staff(auth.uid()));
ALTER POLICY "Staff can read outbound quotes" ON public.outbound_quotes USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage payment_requests" ON public.payment_requests USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Anyone can read pod_requirements" ON public.pod_requirements USING (public.is_staff(auth.uid()));
ALTER POLICY "admin_insert_audit" ON public.pricing_audit_log WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_audit" ON public.pricing_audit_log USING (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_pf" ON public.pricing_families USING (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_general_debris" ON public.pricing_general_debris USING (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_heavy_groups" ON public.pricing_heavy_groups USING (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_heavy_costs" ON public.pricing_heavy_service_costs USING (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_policies" ON public.pricing_policies USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read pricing rules" ON public.pricing_rules USING (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_versions" ON public.pricing_versions USING (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_pp" ON public.provider_profiles USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can insert quote_contracts" ON public.quote_contracts WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Allow authenticated delete quote_line_items" ON public.quote_line_items USING (public.is_staff(auth.uid()));
ALTER POLICY "Allow authenticated insert quote_line_items" ON public.quote_line_items WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Allow authenticated read quote_line_items" ON public.quote_line_items USING (public.is_staff(auth.uid()));
ALTER POLICY "Allow authenticated update quote_line_items" ON public.quote_line_items USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Allow authenticated insert quote_sessions" ON public.quote_sessions WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Allow authenticated read quote_sessions" ON public.quote_sessions USING (public.is_staff(auth.uid()));
ALTER POLICY "Allow authenticated update quote_sessions" ON public.quote_sessions USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "All can view role definitions" ON public.role_definitions USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read rush_delivery_config" ON public.rush_delivery_config USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage seo_audit_results" ON public.seo_audit_results USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read seo_audit_results" ON public.seo_audit_results USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage seo_metrics" ON public.seo_metrics USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read seo_metrics" ON public.seo_metrics USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage seo_page_index" ON public.seo_page_index USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read seo_page_index" ON public.seo_page_index USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage seo_queue" ON public.seo_queue USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read seo_queue" ON public.seo_queue USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage seo_rules" ON public.seo_rules USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read seo_rules" ON public.seo_rules USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can manage seo_services" ON public.seo_services USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read seo_services" ON public.seo_services USING (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_sv" ON public.service_verticals USING (public.is_staff(auth.uid()));
ALTER POLICY "System can insert notifications" ON public.staff_notifications WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_plans" ON public.subscription_plans USING (public.is_staff(auth.uid()));
ALTER POLICY "Anyone can view truck dimensions" ON public.truck_dimensions USING (public.is_staff(auth.uid()));
ALTER POLICY "Admin can manage vehicle documents" ON public.vehicle_documents WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read vehicle documents" ON public.vehicle_documents USING (public.is_staff(auth.uid()));
ALTER POLICY "Admin can update vehicle documents" ON public.vehicle_documents USING (public.is_staff(auth.uid()));
ALTER POLICY "Drivers can insert inspections" ON public.vehicle_inspections WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read inspections" ON public.vehicle_inspections USING (public.is_staff(auth.uid()));
ALTER POLICY "Drivers can upload issue photos" ON public.vehicle_issue_photos WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read issue photos" ON public.vehicle_issue_photos USING (public.is_staff(auth.uid()));
ALTER POLICY "Drivers can report issues" ON public.vehicle_issues WITH CHECK (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read vehicle issues" ON public.vehicle_issues USING (public.is_staff(auth.uid()));
ALTER POLICY "Admin/maintenance can update issues" ON public.vehicle_issues USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read vendors" ON public.vendors USING (public.is_staff(auth.uid()));
ALTER POLICY "auth_read_waste_profiles" ON public.waste_profiles USING (public.is_staff(auth.uid()));
ALTER POLICY "Authenticated users can read zone_surcharges" ON public.zone_surcharges USING (public.is_staff(auth.uid()));
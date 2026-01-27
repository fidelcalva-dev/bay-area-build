-- =============================================
-- GOOGLE WORKSPACE INTEGRATION - DATA MODEL
-- =============================================

-- Enum for Google connection status
CREATE TYPE public.google_connection_status AS ENUM ('CONNECTED', 'EXPIRED', 'REVOKED', 'PENDING');

-- Enum for Google event action types
CREATE TYPE public.google_action_type AS ENUM (
  'SEND_EMAIL', 
  'READ_EMAIL', 
  'SYNC_THREAD',
  'CREATE_MEET', 
  'UPDATE_MEET',
  'CREATE_DRIVE_FOLDER', 
  'UPLOAD_DRIVE', 
  'ATTACH_FILE',
  'POST_CHAT_MESSAGE',
  'OAUTH_CONNECT',
  'OAUTH_REFRESH',
  'OAUTH_REVOKE'
);

-- Enum for Google event status
CREATE TYPE public.google_event_status AS ENUM ('DRY_RUN', 'LIVE', 'SUCCESS', 'FAILED', 'PENDING');

-- =============================================
-- 1) google_connections - User OAuth tokens
-- =============================================
CREATE TABLE public.google_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_email TEXT NOT NULL,
  scopes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  status google_connection_status NOT NULL DEFAULT 'CONNECTED',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.google_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own connection"
  ON public.google_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connection"
  ON public.google_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connection"
  ON public.google_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connection"
  ON public.google_connections FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all connections"
  ON public.google_connections FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 2) google_events_log - Audit trail
-- =============================================
CREATE TABLE public.google_events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type google_action_type NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  request_json JSONB,
  response_json JSONB,
  status google_event_status NOT NULL DEFAULT 'PENDING',
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.google_events_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON public.google_events_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs"
  ON public.google_events_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert logs"
  ON public.google_events_log FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_google_events_entity ON public.google_events_log(entity_type, entity_id);
CREATE INDEX idx_google_events_user ON public.google_events_log(user_id, created_at DESC);

-- =============================================
-- 3) entity_google_links - Link entities to Google resources
-- =============================================
CREATE TABLE public.entity_google_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  gmail_thread_ids JSONB DEFAULT '[]'::jsonb,
  chat_space_id TEXT,
  chat_thread_ids JSONB DEFAULT '[]'::jsonb,
  meet_event_id TEXT,
  meet_link TEXT,
  drive_folder_id TEXT,
  drive_folder_url TEXT,
  drive_file_ids_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

ALTER TABLE public.entity_google_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view links"
  ON public.entity_google_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service can manage links"
  ON public.entity_google_links FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_entity_google_links_entity ON public.entity_google_links(entity_type, entity_id);

-- =============================================
-- 4) google_chat_spaces - Team chat space webhooks
-- =============================================
CREATE TABLE public.google_chat_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_name TEXT NOT NULL,
  space_purpose TEXT NOT NULL,
  target_team TEXT NOT NULL,
  webhook_url_encrypted TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(space_name)
);

ALTER TABLE public.google_chat_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chat spaces"
  ON public.google_chat_spaces FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 5) Add Google config settings (fixed ON CONFLICT)
-- =============================================
INSERT INTO public.config_settings (category, key, value, description, is_sensitive)
VALUES 
  ('google', 'google.mode', '"DRY_RUN"', 'Google integration mode: DRY_RUN or LIVE', false),
  ('google', 'google.allowed_domains', '["calsandumpsterspro.com"]', 'Allowed Google account domains for connection', false),
  ('google', 'google.auto_create_drive_folder', 'true', 'Automatically create Drive folders for new entities', false),
  ('google', 'google.auto_create_meet_for_roles', '["sales", "cs"]', 'Roles that can auto-create Meet links', false),
  ('google', 'google.gmail_enabled', 'true', 'Enable Gmail integration', false),
  ('google', 'google.drive_enabled', 'true', 'Enable Drive integration', false),
  ('google', 'google.meet_enabled', 'true', 'Enable Meet integration', false),
  ('google', 'google.chat_enabled', 'true', 'Enable Chat integration', false)
ON CONFLICT (category, key) DO NOTHING;

-- =============================================
-- 6) Helper functions
-- =============================================

CREATE OR REPLACE FUNCTION public.get_google_connection(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  google_email TEXT,
  status google_connection_status,
  scopes_json JSONB,
  token_expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gc.id,
    gc.google_email,
    gc.status,
    gc.scopes_json,
    gc.token_expires_at
  FROM public.google_connections gc
  WHERE gc.user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_google_event(
  p_user_id UUID,
  p_action_type google_action_type,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_request_json JSONB DEFAULT NULL,
  p_response_json JSONB DEFAULT NULL,
  p_status google_event_status DEFAULT 'PENDING',
  p_error_message TEXT DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.google_events_log (
    user_id, action_type, entity_type, entity_id,
    request_json, response_json, status, error_message, duration_ms
  ) VALUES (
    p_user_id, p_action_type, p_entity_type, p_entity_id,
    p_request_json, p_response_json, p_status, p_error_message, p_duration_ms
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_entity_google_link(
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_gmail_thread_id TEXT DEFAULT NULL,
  p_chat_space_id TEXT DEFAULT NULL,
  p_meet_event_id TEXT DEFAULT NULL,
  p_meet_link TEXT DEFAULT NULL,
  p_drive_folder_id TEXT DEFAULT NULL,
  p_drive_folder_url TEXT DEFAULT NULL,
  p_drive_file_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link_id UUID;
  v_existing RECORD;
BEGIN
  SELECT * INTO v_existing
  FROM public.entity_google_links
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id;
  
  IF v_existing IS NULL THEN
    INSERT INTO public.entity_google_links (
      entity_type, entity_id,
      gmail_thread_ids, chat_space_id,
      meet_event_id, meet_link,
      drive_folder_id, drive_folder_url, drive_file_ids_json
    ) VALUES (
      p_entity_type, p_entity_id,
      CASE WHEN p_gmail_thread_id IS NOT NULL THEN jsonb_build_array(p_gmail_thread_id) ELSE '[]'::jsonb END,
      p_chat_space_id,
      p_meet_event_id, p_meet_link,
      p_drive_folder_id, p_drive_folder_url,
      CASE WHEN p_drive_file_id IS NOT NULL THEN jsonb_build_array(p_drive_file_id) ELSE '[]'::jsonb END
    )
    RETURNING id INTO v_link_id;
  ELSE
    UPDATE public.entity_google_links SET
      gmail_thread_ids = CASE 
        WHEN p_gmail_thread_id IS NOT NULL 
        THEN gmail_thread_ids || jsonb_build_array(p_gmail_thread_id)
        ELSE gmail_thread_ids END,
      chat_space_id = COALESCE(p_chat_space_id, chat_space_id),
      meet_event_id = COALESCE(p_meet_event_id, meet_event_id),
      meet_link = COALESCE(p_meet_link, meet_link),
      drive_folder_id = COALESCE(p_drive_folder_id, drive_folder_id),
      drive_folder_url = COALESCE(p_drive_folder_url, drive_folder_url),
      drive_file_ids_json = CASE 
        WHEN p_drive_file_id IS NOT NULL 
        THEN drive_file_ids_json || jsonb_build_array(p_drive_file_id)
        ELSE drive_file_ids_json END,
      updated_at = now()
    WHERE entity_type = p_entity_type AND entity_id = p_entity_id
    RETURNING id INTO v_link_id;
  END IF;
  
  RETURN v_link_id;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_google_connections_updated_at
  BEFORE UPDATE ON public.google_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entity_google_links_updated_at
  BEFORE UPDATE ON public.entity_google_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_google_chat_spaces_updated_at
  BEFORE UPDATE ON public.google_chat_spaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
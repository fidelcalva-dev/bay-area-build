
-- ============================================================
-- PHASE 3: Create missing archive tables + system_reset_audit
-- ============================================================

-- Archive tables that already exist: sales_leads_archive, quotes_archive, 
-- customers_archive, orders_archive, lead_events_archive, lifecycle_events_archive
-- We need to add metadata columns to existing ones and create missing ones.

-- Add metadata columns to EXISTING archive tables
ALTER TABLE public.sales_leads_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.sales_leads_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.sales_leads_archive ADD COLUMN IF NOT EXISTS reset_mode text;

ALTER TABLE public.quotes_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.quotes_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.quotes_archive ADD COLUMN IF NOT EXISTS reset_mode text;

ALTER TABLE public.customers_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.customers_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.customers_archive ADD COLUMN IF NOT EXISTS reset_mode text;

ALTER TABLE public.orders_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.orders_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.orders_archive ADD COLUMN IF NOT EXISTS reset_mode text;

ALTER TABLE public.lead_events_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.lead_events_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.lead_events_archive ADD COLUMN IF NOT EXISTS reset_mode text;

ALTER TABLE public.lifecycle_events_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.lifecycle_events_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.lifecycle_events_archive ADD COLUMN IF NOT EXISTS reset_mode text;

-- Create NEW archive tables for tables not yet archived
CREATE TABLE IF NOT EXISTS public.invoices_archive (LIKE public.invoices INCLUDING DEFAULTS);
ALTER TABLE public.invoices_archive ADD PRIMARY KEY (id);
ALTER TABLE public.invoices_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.invoices_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.invoices_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.invoices_archive ADD COLUMN IF NOT EXISTS reset_mode text;

CREATE TABLE IF NOT EXISTS public.payments_archive (LIKE public.payments INCLUDING DEFAULTS);
ALTER TABLE public.payments_archive ADD PRIMARY KEY (id);
ALTER TABLE public.payments_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.payments_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.payments_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.payments_archive ADD COLUMN IF NOT EXISTS reset_mode text;

CREATE TABLE IF NOT EXISTS public.runs_archive (LIKE public.runs INCLUDING DEFAULTS);
ALTER TABLE public.runs_archive ADD PRIMARY KEY (id);
ALTER TABLE public.runs_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.runs_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.runs_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.runs_archive ADD COLUMN IF NOT EXISTS reset_mode text;

CREATE TABLE IF NOT EXISTS public.run_events_archive (LIKE public.run_events INCLUDING DEFAULTS);
ALTER TABLE public.run_events_archive ADD PRIMARY KEY (id);
ALTER TABLE public.run_events_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.run_events_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.run_events_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.run_events_archive ADD COLUMN IF NOT EXISTS reset_mode text;

CREATE TABLE IF NOT EXISTS public.ai_chat_sessions_archive (LIKE public.ai_chat_sessions INCLUDING DEFAULTS);
ALTER TABLE public.ai_chat_sessions_archive ADD PRIMARY KEY (id);
ALTER TABLE public.ai_chat_sessions_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.ai_chat_sessions_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.ai_chat_sessions_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.ai_chat_sessions_archive ADD COLUMN IF NOT EXISTS reset_mode text;

CREATE TABLE IF NOT EXISTS public.ai_chat_messages_archive (LIKE public.ai_chat_messages INCLUDING DEFAULTS);
ALTER TABLE public.ai_chat_messages_archive ADD PRIMARY KEY (id);
ALTER TABLE public.ai_chat_messages_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.ai_chat_messages_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.ai_chat_messages_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.ai_chat_messages_archive ADD COLUMN IF NOT EXISTS reset_mode text;

CREATE TABLE IF NOT EXISTS public.assistant_learning_archive (LIKE public.assistant_learning INCLUDING DEFAULTS);
ALTER TABLE public.assistant_learning_archive ADD PRIMARY KEY (id);
ALTER TABLE public.assistant_learning_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();
ALTER TABLE public.assistant_learning_archive ADD COLUMN IF NOT EXISTS archive_batch_id uuid;
ALTER TABLE public.assistant_learning_archive ADD COLUMN IF NOT EXISTS archive_reason text;
ALTER TABLE public.assistant_learning_archive ADD COLUMN IF NOT EXISTS reset_mode text;

-- Drop FK constraints from ALL new archive tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname, conrelid::regclass AS tbl
    FROM pg_constraint
    WHERE contype = 'f'
      AND conrelid::regclass::text IN (
        'invoices_archive','payments_archive','runs_archive','run_events_archive',
        'ai_chat_sessions_archive','ai_chat_messages_archive','assistant_learning_archive'
      )
  ) LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', r.tbl, r.conname);
  END LOOP;
END $$;

-- Enable RLS on new archive tables (admin-only)
ALTER TABLE public.invoices_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_events_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_learning_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read archive" ON public.invoices_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read archive" ON public.payments_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read archive" ON public.runs_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read archive" ON public.run_events_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read archive" ON public.ai_chat_sessions_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read archive" ON public.ai_chat_messages_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read archive" ON public.assistant_learning_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- System Reset Audit Log table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.system_reset_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_by_user_id uuid NOT NULL,
  reset_mode text NOT NULL,
  archive_batch_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  success boolean DEFAULT false,
  tables_archived jsonb DEFAULT '[]'::jsonb,
  tables_cleared jsonb DEFAULT '[]'::jsonb,
  records_archived_count jsonb DEFAULT '{}'::jsonb,
  notes text
);

ALTER TABLE public.system_reset_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read reset audit" ON public.system_reset_audit FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert reset audit" ON public.system_reset_audit FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update reset audit" ON public.system_reset_audit FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

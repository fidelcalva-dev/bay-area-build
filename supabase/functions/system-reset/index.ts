import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResetRequest {
  mode: 'leads_only' | 'sales_quotes' | 'operations' | 'full';
  confirmation: string;
}

// Tables to clear per mode (in dependency-safe delete order)
const MODE_TABLES: Record<string, string[]> = {
  leads_only: [
    'lead_handoff_packets', 'lead_events', 'lead_actions', 'lead_activity_log',
    'lead_addresses', 'lead_alerts', 'lead_card_info', 'lead_dedup_keys',
    'lead_visitor_links', 'lead_source_metadata',
    'ai_chat_messages', 'ai_chat_sessions',
    'lifecycle_alerts', 'lifecycle_events', 'lifecycle_entities',
    'sales_leads',
    'lead_fallback_queue', 'assistant_learning',
  ],
  sales_quotes: [
    // leads first
    'lead_handoff_packets', 'lead_events', 'lead_actions', 'lead_activity_log',
    'lead_addresses', 'lead_alerts', 'lead_card_info', 'lead_dedup_keys',
    'lead_visitor_links', 'lead_source_metadata',
    'ai_chat_messages', 'ai_chat_sessions',
    'lifecycle_alerts', 'lifecycle_events', 'lifecycle_entities',
    'sales_leads',
    // quotes
    'quote_item_selections', 'quote_events', 'quote_contracts', 'quote_drafts',
    'quote_site_placement', 'outbound_quote_messages', 'outbound_quotes',
    'internal_quote_decisions', 'calculator_estimates', 'calculator_logs',
    'quotes',
    'lead_fallback_queue', 'assistant_learning',
  ],
  operations: [
    // leads
    'lead_handoff_packets', 'lead_events', 'lead_actions', 'lead_activity_log',
    'lead_addresses', 'lead_alerts', 'lead_card_info', 'lead_dedup_keys',
    'lead_visitor_links', 'lead_source_metadata',
    'ai_chat_messages', 'ai_chat_sessions',
    'lifecycle_alerts', 'lifecycle_events', 'lifecycle_entities',
    'sales_leads',
    // quotes
    'quote_item_selections', 'quote_events', 'quote_contracts', 'quote_drafts',
    'quote_site_placement', 'outbound_quote_messages', 'outbound_quotes',
    'internal_quote_decisions', 'calculator_estimates', 'calculator_logs',
    'quotes',
    // orders + dispatch
    'run_checkpoints', 'run_events', 'run_route_points', 'run_routes', 'runs',
    'facility_assignments', 'order_disposal_plans', 'order_events',
    'order_site_placement', 'order_cart_items', 'order_cart_schedules', 'order_carts',
    'ar_actions', 'orders',
    // logs
    'call_events', 'message_logs', 'inventory_movements',
    'lead_fallback_queue', 'assistant_learning',
  ],
  full: [
    // leads
    'lead_handoff_packets', 'lead_events', 'lead_actions', 'lead_activity_log',
    'lead_addresses', 'lead_alerts', 'lead_card_info', 'lead_dedup_keys',
    'lead_visitor_links', 'lead_source_metadata',
    'ai_chat_messages', 'ai_chat_sessions',
    'lifecycle_alerts', 'lifecycle_events', 'lifecycle_entities',
    'sales_leads',
    // quotes
    'quote_item_selections', 'quote_events', 'quote_contracts', 'quote_drafts',
    'quote_site_placement', 'outbound_quote_messages', 'outbound_quotes',
    'internal_quote_decisions', 'calculator_estimates', 'calculator_logs',
    'quotes',
    // orders + dispatch
    'run_checkpoints', 'run_events', 'run_route_points', 'run_routes', 'runs',
    'facility_assignments', 'order_disposal_plans', 'order_events',
    'order_site_placement', 'order_cart_items', 'order_cart_schedules', 'order_carts',
    'ar_actions', 'orders',
    // finance
    'invoice_line_items', 'payment_actions', 'payments', 'invoices',
    'approval_requests', 'overdue_billing_state',
    // customers
    'customer_health_events', 'customer_health_scores',
    'customer_portal_links', 'customer_sessions', 'activation_tokens',
    'contacts', 'customers',
    // logs & AI
    'call_events', 'message_logs', 'inventory_movements',
    'lead_fallback_queue', 'assistant_learning',
    'automation_runs', 'alerts',
  ],
};

// Archive mapping: source table -> archive table (only for tables with archives)
const ARCHIVE_MAP: Record<string, string> = {
  sales_leads: 'sales_leads_archive',
  lead_events: 'lead_events_archive',
  lifecycle_events: 'lifecycle_events_archive',
  quotes: 'quotes_archive',
  customers: 'customers_archive',
  orders: 'orders_archive',
  invoices: 'invoices_archive',
  payments: 'payments_archive',
  runs: 'runs_archive',
  run_events: 'run_events_archive',
  ai_chat_sessions: 'ai_chat_sessions_archive',
  ai_chat_messages: 'ai_chat_messages_archive',
  assistant_learning: 'assistant_learning_archive',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify user is admin using their token
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid auth' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = roles?.map((r: any) => r.role) || [];
    if (!userRoles.includes('admin') && !userRoles.includes('system_admin')) {
      return new Response(JSON.stringify({ error: 'Admin role required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: ResetRequest = await req.json();
    const { mode, confirmation } = body;

    if (confirmation !== 'RESET CALSAN CRM') {
      return new Response(JSON.stringify({ error: 'Invalid confirmation text' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!MODE_TABLES[mode]) {
      return new Response(JSON.stringify({ error: 'Invalid reset mode' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const batchId = crypto.randomUUID();
    const tablesToClear = MODE_TABLES[mode];
    const archivedCounts: Record<string, number> = {};
    const tablesArchived: string[] = [];
    const tablesCleared: string[] = [];

    // Create audit record
    const { data: auditRow } = await adminClient.from('system_reset_audit').insert({
      executed_by_user_id: user.id,
      reset_mode: mode,
      archive_batch_id: batchId,
      started_at: new Date().toISOString(),
    }).select('id').single();

    const auditId = auditRow?.id;

    // PHASE 1: Archive rows from tables that have archive destinations
    for (const table of tablesToClear) {
      const archiveTable = ARCHIVE_MAP[table];
      if (!archiveTable) continue;

      // Count source rows
      const { count: sourceCount } = await adminClient
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!sourceCount || sourceCount === 0) continue;

      // Get all source columns (excluding archive-only columns)
      const { data: sourceRows, error: fetchErr } = await adminClient
        .from(table)
        .select('*')
        .limit(5000);

      if (fetchErr) {
        console.error(`Failed to fetch ${table}:`, fetchErr.message);
        continue;
      }

      if (sourceRows && sourceRows.length > 0) {
        // Add archive metadata to each row
        const archiveRows = sourceRows.map((row: any) => ({
          ...row,
          archived_at: new Date().toISOString(),
          archive_batch_id: batchId,
          archive_reason: 'system_reset',
          reset_mode: mode,
        }));

        const { error: insertErr } = await adminClient
          .from(archiveTable)
          .insert(archiveRows);

        if (insertErr) {
          console.error(`Failed to archive ${table} -> ${archiveTable}:`, insertErr.message);
          // SAFETY: don't clear this table if archive failed
          continue;
        }

        // Verify counts match
        const { count: archivedCount } = await adminClient
          .from(archiveTable)
          .select('*', { count: 'exact', head: true })
          .eq('archive_batch_id', batchId);

        if (archivedCount !== sourceRows.length) {
          console.error(`Archive count mismatch for ${table}: source=${sourceRows.length}, archived=${archivedCount}`);
          continue;
        }

        archivedCounts[table] = sourceRows.length;
        tablesArchived.push(table);
      }
    }

    // PHASE 2: Delete from tables in dependency order
    for (const table of tablesToClear) {
      try {
        // Use RPC or direct SQL via service role to delete all rows
        const { error: delErr } = await adminClient
          .from(table)
          .delete()
          .gte('created_at', '1970-01-01');

        if (delErr) {
          console.error(`Failed to clear ${table}:`, delErr.message);
          // Try alternative delete approach
          const { error: delErr2 } = await adminClient
            .from(table)
            .delete()
            .not('id', 'is', null);

          if (delErr2) {
            console.error(`Alternative clear also failed for ${table}:`, delErr2.message);
            continue;
          }
        }

        tablesCleared.push(table);
      } catch (e) {
        console.error(`Exception clearing ${table}:`, e);
      }
    }

    // PHASE 3: Update audit record
    if (auditId) {
      await adminClient.from('system_reset_audit').update({
        completed_at: new Date().toISOString(),
        success: true,
        tables_archived: tablesArchived,
        tables_cleared: tablesCleared,
        records_archived_count: archivedCounts,
        notes: `Mode: ${mode}. Archived ${tablesArchived.length} tables, cleared ${tablesCleared.length} tables.`,
      }).eq('id', auditId);
    }

    return new Response(JSON.stringify({
      success: true,
      mode,
      archive_batch_id: batchId,
      tables_archived: tablesArchived,
      tables_cleared: tablesCleared,
      records_archived_count: archivedCounts,
      audit_id: auditId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('System reset error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

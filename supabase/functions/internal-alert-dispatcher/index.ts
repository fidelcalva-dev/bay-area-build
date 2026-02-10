import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRequest {
  event_type: 'LEAD_CREATED' | 'QUOTE_SAVED' | 'ORDER_CONFIRMED' | 'PAYMENT_RECEIVED';
  entity_type: 'LEAD' | 'QUOTE' | 'ORDER' | 'PAYMENT';
  entity_id: string;
  source?: string;
  payload: {
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    city?: string;
    zip_code?: string;
    material_type?: string;
    size_label?: string;
    total?: number;
    subtotal?: number;
    amount?: number;
    address?: string;
    source_key?: string;
  };
}

// =====================================================
// EMAIL TEMPLATES
// =====================================================

function buildSubject(event_type: string, p: AlertRequest['payload']): string {
  const loc = [p.city, p.zip_code].filter(Boolean).join(' ');
  const name = p.customer_name || p.customer_phone || 'Unknown';

  switch (event_type) {
    case 'LEAD_CREATED':
      return `[NEW LEAD] ${loc} — ${name}`;
    case 'QUOTE_SAVED':
      return `[QUOTE SAVED] ${loc} — ${p.size_label || ''}yd ${p.material_type || ''}`.trim();
    case 'ORDER_CONFIRMED':
      return `[ORDER CONFIRMED] ${loc} — ${p.size_label || ''}yd ${p.material_type || ''} — $${(p.total || p.subtotal || 0).toFixed(0)}`;
    case 'PAYMENT_RECEIVED':
      return `[PAYMENT RECEIVED] ${loc} — $${(p.amount || 0).toFixed(2)}`;
    default:
      return `[ALERT] ${event_type}`;
  }
}

function buildBodyText(event_type: string, entity_id: string, p: AlertRequest['payload']): string {
  const lines: string[] = [];
  if (p.customer_name) lines.push(`Customer: ${p.customer_name}`);
  if (p.customer_phone) lines.push(`Phone: ${p.customer_phone}`);
  if (p.customer_email) lines.push(`Email: ${p.customer_email}`);
  if (p.address) lines.push(`Address: ${p.address}`);
  if (p.city || p.zip_code) lines.push(`Location: ${[p.city, p.zip_code].filter(Boolean).join(', ')}`);
  if (p.material_type) lines.push(`Material: ${p.material_type}`);
  if (p.size_label) lines.push(`Size: ${p.size_label} yd`);
  if (p.total || p.subtotal) lines.push(`Price: $${(p.total || p.subtotal || 0).toFixed(2)}`);
  if (p.amount) lines.push(`Amount: $${p.amount.toFixed(2)}`);
  lines.push(`Source: ${p.source_key || 'Website'}`);
  return lines.join('\n');
}

function buildEmailHtml(event_type: string, entity_type: string, entity_id: string, p: AlertRequest['payload'], links: Array<{label: string; url: string}>): string {
  const subject = buildSubject(event_type, p);
  const rows: string[] = [];
  if (p.customer_name) rows.push(`<tr><td style="padding:4px 12px;color:#666">Customer</td><td style="padding:4px 12px;font-weight:600">${p.customer_name}</td></tr>`);
  if (p.customer_phone) rows.push(`<tr><td style="padding:4px 12px;color:#666">Phone</td><td style="padding:4px 12px"><a href="tel:${p.customer_phone}">${p.customer_phone}</a></td></tr>`);
  if (p.customer_email) rows.push(`<tr><td style="padding:4px 12px;color:#666">Email</td><td style="padding:4px 12px">${p.customer_email}</td></tr>`);
  if (p.address) rows.push(`<tr><td style="padding:4px 12px;color:#666">Address</td><td style="padding:4px 12px">${p.address}</td></tr>`);
  if (p.city || p.zip_code) rows.push(`<tr><td style="padding:4px 12px;color:#666">Location</td><td style="padding:4px 12px">${[p.city, p.zip_code].filter(Boolean).join(', ')}</td></tr>`);
  if (p.material_type) rows.push(`<tr><td style="padding:4px 12px;color:#666">Material</td><td style="padding:4px 12px">${p.material_type}</td></tr>`);
  if (p.size_label) rows.push(`<tr><td style="padding:4px 12px;color:#666">Size</td><td style="padding:4px 12px">${p.size_label} yd</td></tr>`);
  if (p.total || p.subtotal) rows.push(`<tr><td style="padding:4px 12px;color:#666">Price</td><td style="padding:4px 12px;font-weight:600">$${(p.total || p.subtotal || 0).toFixed(2)}</td></tr>`);
  if (p.amount) rows.push(`<tr><td style="padding:4px 12px;color:#666">Amount</td><td style="padding:4px 12px;font-weight:600">$${p.amount.toFixed(2)}</td></tr>`);

  const linkButtons = links.map(l => `<a href="${l.url}" style="display:inline-block;background:#2563eb;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;margin-right:8px;margin-top:8px">${l.label}</a>`).join('');

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1e40af;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:18px">${subject}</h2>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 8px 8px">
        <table style="width:100%;border-collapse:collapse">${rows.join('')}</table>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb">${linkButtons}</div>
        <p style="color:#9ca3af;font-size:12px;margin-top:16px">Internal alert — do not forward to customers</p>
      </div>
    </div>`;
}

function buildLinks(entity_type: string, entity_id: string, baseUrl: string): Array<{label: string; url: string}> {
  const links: Array<{label: string; url: string}> = [];
  switch (entity_type) {
    case 'LEAD':
      links.push({ label: 'Open Lead in CRM', url: `${baseUrl}/admin/leads?id=${entity_id}` });
      break;
    case 'QUOTE':
      links.push({ label: 'Open Quote', url: `${baseUrl}/admin/orders?quote=${entity_id}` });
      break;
    case 'ORDER':
      links.push({ label: 'Open Order', url: `${baseUrl}/admin/orders?id=${entity_id}` });
      break;
    case 'PAYMENT':
      links.push({ label: 'Open Payment', url: `${baseUrl}/admin/orders?payment=${entity_id}` });
      break;
  }
  return links;
}

function buildChatMessage(event_type: string, entity_type: string, entity_id: string, p: AlertRequest['payload'], links: Array<{label: string; url: string}>): string {
  const subject = buildSubject(event_type, p);
  const linkStr = links.map(l => l.url).join('\n');
  const details: string[] = [];
  if (p.customer_name) details.push(p.customer_name);
  if (p.customer_phone) details.push(p.customer_phone);
  if (p.material_type) details.push(p.material_type);
  if (p.size_label) details.push(`${p.size_label}yd`);

  return `${subject}\n${details.join(' | ')}\n${linkStr}`;
}

// =====================================================
// MAIN HANDLER
// =====================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: AlertRequest = await req.json();
    const { event_type, entity_type, entity_id, source = 'WEBSITE', payload } = body;

    if (!event_type || !entity_type || !entity_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[internal-alert] ${event_type} ${entity_type}:${entity_id}`);

    // =====================================================
    // LOAD CONFIG
    // =====================================================
    const configKeys = [
      'internal_notifications.mode',
      'internal_notifications.email_recipients',
      'internal_notifications.chat_enabled',
      'internal_notifications.chat_mode',
      'internal_notifications.dedupe_minutes',
    ];
    const { data: configs } = await supabase
      .from('config_settings')
      .select('key, value')
      .in('key', configKeys);

    const cfg: Record<string, string> = {};
    (configs || []).forEach((c: { key: string; value: string }) => { cfg[c.key] = c.value; });

    // Safe JSON parse helper - handles both raw strings and JSON-encoded strings
    function safeParse<T>(val: string | undefined, fallback: T): T {
      if (val === undefined || val === null) return fallback;
      try { return JSON.parse(val) as T; } catch { return val as unknown as T; }
    }

    const mode = safeParse<string>(cfg['internal_notifications.mode'], 'DRY_RUN');
    const emailRecipients = safeParse<string[]>(cfg['internal_notifications.email_recipients'], []);
    const chatEnabled = cfg['internal_notifications.chat_enabled'] === 'true';
    const chatMode = safeParse<string>(cfg['internal_notifications.chat_mode'], 'IN_APP_ONLY');
    const dedupeMinutes = parseInt(cfg['internal_notifications.dedupe_minutes'] || '10', 10);

    // =====================================================
    // DEDUPE CHECK
    // =====================================================
    const dedupeKey = `${event_type}:${entity_type}:${entity_id}`;
    const dedupeThreshold = new Date(Date.now() - dedupeMinutes * 60 * 1000).toISOString();

    const { data: existingAlert } = await supabase
      .from('internal_alerts')
      .select('id')
      .eq('dedupe_key', dedupeKey)
      .gte('created_at', dedupeThreshold)
      .limit(1)
      .maybeSingle();

    if (existingAlert) {
      console.log(`[internal-alert] Skipped (dedupe): ${dedupeKey}`);
      return new Response(
        JSON.stringify({ success: true, action: 'SKIPPED', reason: 'dedupe' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================================================
    // BUILD ALERT
    // =====================================================
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://calsandumpsterspro.com';
    const links = buildLinks(entity_type, entity_id, baseUrl);
    const title = buildSubject(event_type, payload);
    const bodyText = buildBodyText(event_type, entity_id, payload);

    const alertStatus = mode === 'LIVE' ? 'SENT' : 'DRAFT';

    const { data: alert, error: alertError } = await supabase
      .from('internal_alerts')
      .insert({
        event_type,
        source,
        entity_type,
        entity_id,
        title,
        body_text: bodyText,
        links_json: links,
        dedupe_key: dedupeKey,
        status: 'DRAFT', // will update after sending
        payload_json: payload,
      })
      .select('id')
      .single();

    if (alertError || !alert) {
      console.error('[internal-alert] Failed to create alert:', alertError);
      throw new Error('Failed to create alert record');
    }

    const deliveries: Array<{ channel: string; recipient: string; status: string; provider: string; error_message?: string }> = [];

    // =====================================================
    // EMAIL DELIVERY
    // =====================================================
    if (emailRecipients.length > 0) {
      const emailHtml = buildEmailHtml(event_type, entity_type, entity_id, payload, links);

      if (mode === 'LIVE') {
        const resendKey = Deno.env.get('RESEND_API_KEY');
        if (resendKey) {
          const resend = new Resend(resendKey);
          for (const recipient of emailRecipients) {
            try {
              await resend.emails.send({
                from: 'Calsan Alerts <alerts@calsandumpsterspro.com>',
                to: [recipient],
                subject: title,
                html: emailHtml,
              });
              deliveries.push({ channel: 'EMAIL', recipient, status: 'SENT', provider: 'RESEND' });
            } catch (e) {
              const errMsg = e instanceof Error ? e.message : String(e);
              console.error(`[internal-alert] Email to ${recipient} failed:`, errMsg);
              deliveries.push({ channel: 'EMAIL', recipient, status: 'FAILED', provider: 'RESEND', error_message: errMsg });
            }
          }
        } else {
          for (const recipient of emailRecipients) {
            deliveries.push({ channel: 'EMAIL', recipient, status: 'FAILED', provider: 'RESEND', error_message: 'RESEND_API_KEY not configured' });
          }
        }
      } else {
        for (const recipient of emailRecipients) {
          deliveries.push({ channel: 'EMAIL', recipient, status: 'DRAFT', provider: 'RESEND' });
        }
      }
    }

    // =====================================================
    // CHAT DELIVERY (Google Chat or In-App)
    // =====================================================
    if (chatEnabled) {
      const chatMessage = buildChatMessage(event_type, entity_type, entity_id, payload, links);

      if (chatMode === 'GOOGLE_CHAT') {
        // Try to find an admin/sales space webhook
        const { data: chatSpaces } = await supabase
          .from('google_chat_spaces')
          .select('space_name, webhook_url_encrypted')
          .eq('is_active', true)
          .limit(5);

        const adminSpace = (chatSpaces || []).find((s: { space_name: string }) =>
          s.space_name.toLowerCase().includes('admin') || s.space_name.toLowerCase().includes('sales') || s.space_name.toLowerCase().includes('alert')
        ) || (chatSpaces || [])[0];

        if (adminSpace?.webhook_url_encrypted && mode === 'LIVE') {
          try {
            const webhookUrl = atob(adminSpace.webhook_url_encrypted);
            const resp = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: chatMessage }),
            });
            if (!resp.ok) {
              const errText = await resp.text();
              throw new Error(errText);
            }
            await resp.text();
            deliveries.push({ channel: 'CHAT', recipient: adminSpace.space_name, status: 'SENT', provider: 'GOOGLE_CHAT' });
          } catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            console.error('[internal-alert] Chat failed:', errMsg);
            deliveries.push({ channel: 'CHAT', recipient: adminSpace.space_name, status: 'FAILED', provider: 'GOOGLE_CHAT', error_message: errMsg });
          }
        } else if (adminSpace && mode === 'DRY_RUN') {
          deliveries.push({ channel: 'CHAT', recipient: adminSpace.space_name, status: 'DRAFT', provider: 'GOOGLE_CHAT' });
        } else {
          // Fallback to in-app
          await createInAppNotification(supabase, event_type, title, bodyText, entity_type, entity_id, links, mode);
          deliveries.push({ channel: 'IN_APP', recipient: 'ADMIN_TEAM', status: mode === 'LIVE' ? 'SENT' : 'DRAFT', provider: 'IN_APP' });
        }
      } else {
        // IN_APP_ONLY mode
        await createInAppNotification(supabase, event_type, title, bodyText, entity_type, entity_id, links, mode);
        deliveries.push({ channel: 'IN_APP', recipient: 'ADMIN_TEAM', status: mode === 'LIVE' ? 'SENT' : 'DRAFT', provider: 'IN_APP' });
      }
    }

    // =====================================================
    // SAVE DELIVERIES
    // =====================================================
    if (deliveries.length > 0) {
      await supabase.from('internal_alert_deliveries').insert(
        deliveries.map(d => ({ alert_id: alert.id, ...d }))
      );
    }

    // Update alert status
    const anyFailed = deliveries.some(d => d.status === 'FAILED');
    const allDraft = deliveries.every(d => d.status === 'DRAFT');
    const finalStatus = allDraft ? 'DRAFT' : anyFailed ? 'FAILED' : 'SENT';

    await supabase
      .from('internal_alerts')
      .update({ status: finalStatus })
      .eq('id', alert.id);

    console.log(`[internal-alert] Alert ${alert.id} → ${finalStatus} (${deliveries.length} deliveries)`);

    return new Response(
      JSON.stringify({
        success: true,
        alert_id: alert.id,
        status: finalStatus,
        mode,
        deliveries: deliveries.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[internal-alert] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// =====================================================
// IN-APP NOTIFICATION HELPER
// =====================================================
async function createInAppNotification(
  supabase: ReturnType<typeof createClient>,
  event_type: string,
  title: string,
  message: string,
  entity_type: string,
  entity_id: string,
  links: Array<{label: string; url: string}>,
  mode: string,
) {
  if (mode !== 'LIVE') return;

  // Get admin/sales users
  const { data: adminUsers } = await supabase
    .from('user_roles')
    .select('user_id')
    .in('role', ['admin', 'sales_manager']);

  if (!adminUsers || adminUsers.length === 0) return;

  const notifications = adminUsers.map((u: { user_id: string }) => ({
    user_id: u.user_id,
    notification_type: event_type,
    priority: 'HIGH',
    channel: 'IN_APP',
    title,
    message,
    action_url: links[0]?.url || null,
  }));

  await supabase.from('staff_notifications').insert(notifications);
}

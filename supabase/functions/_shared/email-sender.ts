import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export interface EmailConfig {
  fromName: string;
  fromEmail: string;
  replyTo: string;
  mode: "DRY_RUN" | "LIVE";
  domainVerified: boolean;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  entityType?: string;
  entityId?: string;
  cc?: string;
  bcc?: string;
}

export interface SendEmailResult {
  success: boolean;
  status: "SENT" | "DRY_RUN" | "FAILED";
  messageId?: string;
  error?: string;
  logId?: string;
}

function safeParse<T>(val: string | undefined | null, fallback: T): T {
  if (val === undefined || val === null) return fallback;
  try { return JSON.parse(val) as T; } catch { return val as unknown as T; }
}

/**
 * Load email configuration from config_settings.
 */
export async function loadEmailConfig(supabaseAdmin: ReturnType<typeof createClient>): Promise<EmailConfig> {
  const keys = [
    'email.from_name',
    'email.from_email',
    'email.reply_to',
    'email.mode',
    'email.domain_verified',
  ];

  const { data: configs } = await supabaseAdmin
    .from('config_settings')
    .select('key, value')
    .in('key', keys);

  const cfg: Record<string, string> = {};
  (configs || []).forEach((c: { key: string; value: string }) => { cfg[c.key] = c.value; });

  return {
    fromName: safeParse(cfg['email.from_name'], 'Calsan Dumpsters Pro'),
    fromEmail: safeParse(cfg['email.from_email'], 'noreply@calsandumpsterspro.com'),
    replyTo: safeParse(cfg['email.reply_to'], 'info@calsandumpsterspro.com'),
    mode: safeParse(cfg['email.mode'], 'DRY_RUN') === 'LIVE' ? 'LIVE' : 'DRY_RUN',
    domainVerified: safeParse(cfg['email.domain_verified'], false) === true || safeParse(cfg['email.domain_verified'], 'false') === 'true',
  };
}

/**
 * Send an email through Resend with unified logging to message_logs.
 * Respects email.mode and email.domain_verified config.
 */
export async function sendEmail(
  supabaseAdmin: ReturnType<typeof createClient>,
  config: EmailConfig,
  params: SendEmailParams,
): Promise<SendEmailResult> {
  const fromHeader = `${config.fromName} <${config.fromEmail}>`;

  // DRY_RUN guard
  if (config.mode !== 'LIVE') {
    console.log(`[EMAIL DRY_RUN] Would send to ${params.to}: ${params.subject}`);
    const logId = await logMessage(supabaseAdmin, {
      channel: 'EMAIL',
      toAddress: params.to,
      subject: params.subject,
      body: params.html.substring(0, 500),
      provider: 'RESEND',
      status: 'DRY_RUN',
      entityType: params.entityType,
      entityId: params.entityId,
    });
    return { success: true, status: 'DRY_RUN', logId };
  }

  // Domain verification guard
  if (!config.domainVerified) {
    const error = 'Domain not verified in Resend. Set email.domain_verified=true after DNS verification.';
    console.error(`[EMAIL BLOCKED] ${error}`);
    const logId = await logMessage(supabaseAdmin, {
      channel: 'EMAIL',
      toAddress: params.to,
      subject: params.subject,
      body: params.html.substring(0, 500),
      provider: 'RESEND',
      status: 'FAILED',
      errorMessage: error,
      entityType: params.entityType,
      entityId: params.entityId,
    });
    return { success: false, status: 'FAILED', error, logId };
  }

  // LIVE send via Resend
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) {
    const error = 'RESEND_API_KEY not configured';
    const logId = await logMessage(supabaseAdmin, {
      channel: 'EMAIL',
      toAddress: params.to,
      subject: params.subject,
      body: params.html.substring(0, 500),
      provider: 'RESEND',
      status: 'FAILED',
      errorMessage: error,
      entityType: params.entityType,
      entityId: params.entityId,
    });
    return { success: false, status: 'FAILED', error, logId };
  }

  try {
    const emailPayload: Record<string, unknown> = {
      from: fromHeader,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      reply_to: config.replyTo,
    };
    if (params.cc) emailPayload.cc = [params.cc];
    if (params.bcc) emailPayload.bcc = [params.bcc];

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      const error = result?.message || result?.error || `Resend API ${response.status}`;
      const logId = await logMessage(supabaseAdmin, {
        channel: 'EMAIL',
        toAddress: params.to,
        subject: params.subject,
        body: params.html.substring(0, 500),
        provider: 'RESEND',
        status: 'FAILED',
        errorMessage: error,
        response: result,
        entityType: params.entityType,
        entityId: params.entityId,
      });
      return { success: false, status: 'FAILED', error, logId };
    }

    const logId = await logMessage(supabaseAdmin, {
      channel: 'EMAIL',
      toAddress: params.to,
      subject: params.subject,
      body: params.html.substring(0, 500),
      provider: 'RESEND',
      providerMessageId: result.id,
      status: 'SENT',
      response: result,
      entityType: params.entityType,
      entityId: params.entityId,
    });

    console.log(`[EMAIL SENT] to=${params.to} id=${result.id}`);
    return { success: true, status: 'SENT', messageId: result.id, logId };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const logId = await logMessage(supabaseAdmin, {
      channel: 'EMAIL',
      toAddress: params.to,
      subject: params.subject,
      body: params.html.substring(0, 500),
      provider: 'RESEND',
      status: 'FAILED',
      errorMessage: error,
      entityType: params.entityType,
      entityId: params.entityId,
    });
    return { success: false, status: 'FAILED', error, logId };
  }
}

// Unified message_logs insert
interface LogParams {
  channel: string;
  toAddress: string;
  subject: string;
  body: string;
  provider: string;
  providerMessageId?: string;
  status: string;
  errorMessage?: string;
  response?: unknown;
  entityType?: string;
  entityId?: string;
}

async function logMessage(supabaseAdmin: ReturnType<typeof createClient>, p: LogParams): Promise<string | undefined> {
  try {
    const { data } = await supabaseAdmin.from('message_logs').insert({
      channel: p.channel,
      to_address: p.toAddress,
      subject: p.subject,
      body: p.body,
      provider: p.provider,
      provider_message_id: p.providerMessageId || null,
      status: p.status,
      error_message: p.errorMessage || null,
      response: p.response || null,
    }).select('id').single();
    return data?.id;
  } catch (err) {
    console.error('[email-sender] Failed to log message:', err);
    return undefined;
  }
}

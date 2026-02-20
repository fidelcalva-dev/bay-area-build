import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keywords that trigger the scheduling auto-reply
const SCHEDULE_KEYWORDS = ['SCHEDULE', 'SCHED', 'PROGRAMAR', 'PROGRAMA', 'AGENDAR', 'AGENDA'];

// Bilingual response templates
const templates = {
  en: {
    scheduleReply: (link: string) =>
      `Great — let's schedule ✅\nPick your delivery window here:\n${link}`,
    noQuoteFound: (link: string) =>
      `We couldn't find an active quote. Get a new one here: ${link}`,
    quoteExpired: (link: string) =>
      `Your quote has expired. Get a fresh estimate here: ${link}`,
    rateLimited: `You've reached the message limit. Please try again in an hour or call us at (510) 680-2150.`,
  },
  es: {
    scheduleReply: (link: string) =>
      `Perfecto — vamos a programar ✅\nElige tu ventana de entrega aquí:\n${link}`,
    noQuoteFound: (link: string) =>
      `No encontramos una cotización activa. Obtén una nueva aquí: ${link}`,
    quoteExpired: (link: string) =>
      `Tu cotización expiró. Obtén un nuevo estimado aquí: ${link}`,
    rateLimited: `Has alcanzado el límite de mensajes. Intenta en una hora o llámanos al (510) 680-2150.`,
  },
};

const BASE_URL = 'https://app.trashlab.com';

// Normalize phone to E.164 format
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  return phone; // Return original if can't normalize
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Parse Twilio webhook data (application/x-www-form-urlencoded)
    const formData = await req.formData();
    const fromPhone = formData.get("From") as string;
    const messageBody = formData.get("Body") as string;
    const messageSid = formData.get("MessageSid") as string;

    if (!fromPhone || !messageBody) {
      console.error("Missing From or Body in webhook");
      return new Response("OK", { status: 200 });
    }

    const normalizedPhone = normalizePhone(fromPhone);
    const keyword = messageBody.trim().toUpperCase();

    console.log(`[twilio-sms-webhook] Inbound from ${normalizedPhone}: "${keyword}"`);

    // Log inbound message
    await supabase.from('message_history').insert({
      customer_phone: normalizedPhone,
      direction: 'inbound',
      channel: 'sms',
      message_body: messageBody,
      external_id: messageSid,
      template_key: keyword,
    });

    // =====================================================
    // Unified pipeline: route through lead-ingest (non-blocking)
    // =====================================================
    try {
      await fetch(`${supabaseUrl}/functions/v1/lead-ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          source_channel: 'SMS_INBOUND',
          source_detail: 'twilio_sms_webhook',
          phone: normalizedPhone,
          message: messageBody,
          consent_status: 'OPTED_IN',
          raw_payload: { messageSid, keyword },
        }),
      });
    } catch (ingestErr) {
      console.error('[twilio-sms-webhook] lead-ingest failed (non-critical):', ingestErr);
    }

    // Check if this is a scheduling keyword
    if (!SCHEDULE_KEYWORDS.includes(keyword)) {
      console.log(`[twilio-sms-webhook] Keyword "${keyword}" not a schedule trigger, ignoring`);
      // Return TwiML with empty response (no reply)
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    // Rate limiting: Max 3 auto-replies per phone per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentReplies } = await supabase
      .from('message_history')
      .select('*', { count: 'exact', head: true })
      .eq('customer_phone', normalizedPhone)
      .eq('direction', 'outbound')
      .eq('template_key', 'SMS_SCHEDULE_AUTO_REPLY')
      .gte('created_at', oneHourAgo);

    if (recentReplies && recentReplies >= 3) {
      console.log(`[twilio-sms-webhook] Rate limited: ${normalizedPhone}`);
      // Send rate limit message
      const rateLimitMsg = templates.en.rateLimited;
      await sendSmsReply(rateLimitMsg);
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${rateLimitMsg}</Message></Response>`,
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    // Find most recent saved quote for this phone
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('id, status, created_at, quote_snapshot')
      .eq('phone', normalizedPhone)
      .eq('status', 'saved')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Determine language from quote or default to EN
    let lang: 'en' | 'es' = 'en';
    if (quote?.quote_snapshot && typeof quote.quote_snapshot === 'object') {
      const snapshot = quote.quote_snapshot as Record<string, unknown>;
      if (snapshot.language === 'es') {
        lang = 'es';
      }
    }

    const t = templates[lang];
    const newQuoteLink = `${BASE_URL}/#quote`;
    let replyMessage: string;
    let eventType = 'SMS_SCHEDULE_LINK_SENT';

    if (!quote) {
      // No active quote found
      console.log(`[twilio-sms-webhook] No quote found for ${normalizedPhone}`);
      replyMessage = t.noQuoteFound(newQuoteLink);
      eventType = 'SMS_NO_QUOTE_FOUND';
    } else {
      // Check if quote is expired (older than 7 days)
      const quoteDate = new Date(quote.created_at);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      if (quoteDate < sevenDaysAgo) {
        console.log(`[twilio-sms-webhook] Quote expired for ${normalizedPhone}`);
        replyMessage = t.quoteExpired(newQuoteLink);
        eventType = 'SMS_QUOTE_EXPIRED';
      } else {
        // Generate scheduling link
        const scheduleLink = `${BASE_URL}/quote?resume=${quote.id}&action=schedule`;
        replyMessage = t.scheduleReply(scheduleLink);

        // Log quote event
        await supabase.from('quote_events').insert({
          quote_id: quote.id,
          event_type: 'SMS_SCHEDULE_LINK_SENT',
          event_data: { 
            trigger: 'inbound_sms', 
            keyword,
            language: lang,
          },
        });
      }
    }

    // Log outbound auto-reply
    await supabase.from('message_history').insert({
      customer_phone: normalizedPhone,
      direction: 'outbound',
      channel: 'sms',
      message_body: replyMessage,
      template_key: 'SMS_SCHEDULE_AUTO_REPLY',
      status: 'sent',
    });

    console.log(`[twilio-sms-webhook] Sending reply: ${eventType}`);

    // Return TwiML response with reply message
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(replyMessage)}</Message></Response>`;

    return new Response(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });

  } catch (error) {
    console.error("[twilio-sms-webhook] Error:", error);
    // Always return 200 to Twilio to prevent retries
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  }
};

// Helper to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper for direct SMS sending (if needed outside TwiML)
async function sendSmsReply(message: string): Promise<void> {
  // This is a placeholder - actual TwiML response handles the reply
  console.log(`[twilio-sms-webhook] Would send: ${message}`);
}

serve(handler);

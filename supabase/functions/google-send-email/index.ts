import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getValidAccessToken, checkGoogleMode } from "../_shared/google-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  bodyType?: 'text' | 'html';
  entityType?: string;
  entityId?: string;
  cc?: string;
  bcc?: string;
}

function createMimeMessage(params: {
  from: string;
  to: string;
  subject: string;
  body: string;
  bodyType: 'text' | 'html';
  cc?: string;
  bcc?: string;
}): string {
  const boundary = `boundary_${crypto.randomUUID()}`;
  const contentType = params.bodyType === 'html' ? 'text/html' : 'text/plain';
  
  let message = [
    `From: ${params.from}`,
    `To: ${params.to}`,
    params.cc ? `Cc: ${params.cc}` : null,
    params.bcc ? `Bcc: ${params.bcc}` : null,
    `Subject: ${params.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: ${contentType}; charset="UTF-8"`,
    ``,
    params.body,
  ].filter(Boolean).join('\r\n');

  // Base64url encode
  return btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claims.claims.sub as string;

    // Parse request
    const body: SendEmailRequest = await req.json();
    const { to, subject, body: emailBody, bodyType = 'text', entityType, entityId, cc, bcc } = body;

    if (!to || !subject || !emailBody) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check mode
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const mode = await checkGoogleMode(supabaseAdmin);

    // Get valid access token
    const tokenData = await getValidAccessToken(supabaseAdmin, userId);
    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: 'No Google account connected or token expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestPayload = { to, subject, bodyType, entityType, entityId, cc, bcc };

    if (mode === 'DRY_RUN') {
      // Log but don't send
      await supabaseAdmin.rpc('log_google_event', {
        p_user_id: userId,
        p_action_type: 'SEND_EMAIL',
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_request_json: requestPayload,
        p_status: 'DRY_RUN',
        p_duration_ms: Date.now() - startTime,
      });

      console.log('[DRY_RUN] Would send email:', { to, subject, from: tokenData.googleEmail });

      return new Response(
        JSON.stringify({ 
          success: true, 
          mode: 'DRY_RUN',
          message: 'Email would be sent (DRY_RUN mode)',
          wouldSend: { from: tokenData.googleEmail, to, subject }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // LIVE mode - actually send
    const rawMessage = createMimeMessage({
      from: tokenData.googleEmail,
      to,
      subject,
      body: emailBody,
      bodyType,
      cc,
      bcc,
    });

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rawMessage }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gmail API error:', errorText);
      
      await supabaseAdmin.rpc('log_google_event', {
        p_user_id: userId,
        p_action_type: 'SEND_EMAIL',
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_request_json: requestPayload,
        p_status: 'FAILED',
        p_error_message: errorText,
        p_duration_ms: Date.now() - startTime,
      });

      throw new Error(`Gmail API error: ${errorText}`);
    }

    const result = await response.json();

    // Log success and link to entity
    await supabaseAdmin.rpc('log_google_event', {
      p_user_id: userId,
      p_action_type: 'SEND_EMAIL',
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_request_json: requestPayload,
      p_response_json: { messageId: result.id, threadId: result.threadId },
      p_status: 'SUCCESS',
      p_duration_ms: Date.now() - startTime,
    });

    // Link email thread to entity
    if (entityType && entityId) {
      await supabaseAdmin.rpc('upsert_entity_google_link', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_gmail_thread_id: result.threadId,
      });
    }

    console.log('Email sent successfully:', result.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        mode: 'LIVE',
        messageId: result.id,
        threadId: result.threadId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Send email error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

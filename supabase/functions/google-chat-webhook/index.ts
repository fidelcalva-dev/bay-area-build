import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkGoogleMode } from "../_shared/google-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PostChatRequest {
  spaceName: string; // Name of the space to post to
  text: string;
  thread?: string; // Optional thread name
  entityType?: string;
  entityId?: string;
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
    const body: PostChatRequest = await req.json();
    const { spaceName, text, thread, entityType, entityId } = body;

    if (!spaceName || !text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: spaceName, text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin client for accessing chat spaces
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check mode
    const mode = await checkGoogleMode(supabaseAdmin);

    // Get webhook URL for the space
    const { data: spaceConfig, error: spaceError } = await supabaseAdmin
      .from('google_chat_spaces')
      .select('webhook_url_encrypted, is_active')
      .eq('space_name', spaceName)
      .single();

    if (spaceError || !spaceConfig) {
      return new Response(
        JSON.stringify({ error: `Chat space not found: ${spaceName}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!spaceConfig.is_active) {
      return new Response(
        JSON.stringify({ error: `Chat space is inactive: ${spaceName}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!spaceConfig.webhook_url_encrypted) {
      return new Response(
        JSON.stringify({ error: `No webhook URL configured for space: ${spaceName}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt webhook URL (simple base64 for now)
    const webhookUrl = atob(spaceConfig.webhook_url_encrypted);

    const requestPayload = { spaceName, text, thread, entityType, entityId };

    if (mode === 'DRY_RUN') {
      // Log but don't post
      await supabaseAdmin.rpc('log_google_event', {
        p_user_id: userId,
        p_action_type: 'POST_CHAT_MESSAGE',
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_request_json: requestPayload,
        p_status: 'DRY_RUN',
        p_duration_ms: Date.now() - startTime,
      });

      console.log('[DRY_RUN] Would post to chat:', { spaceName, text: text.substring(0, 50) });

      return new Response(
        JSON.stringify({ 
          success: true, 
          mode: 'DRY_RUN',
          message: 'Message would be posted (DRY_RUN mode)',
          wouldPost: { spaceName, textPreview: text.substring(0, 100) }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // LIVE mode - post to webhook
    const payload: Record<string, unknown> = { text };
    if (thread) {
      payload.thread = { name: thread };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat webhook error:', errorText);
      
      await supabaseAdmin.rpc('log_google_event', {
        p_user_id: userId,
        p_action_type: 'POST_CHAT_MESSAGE',
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_request_json: requestPayload,
        p_status: 'FAILED',
        p_error_message: errorText,
        p_duration_ms: Date.now() - startTime,
      });

      throw new Error(`Chat webhook error: ${errorText}`);
    }

    const result = await response.json();

    // Log success
    await supabaseAdmin.rpc('log_google_event', {
      p_user_id: userId,
      p_action_type: 'POST_CHAT_MESSAGE',
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_request_json: requestPayload,
      p_response_json: result,
      p_status: 'SUCCESS',
      p_duration_ms: Date.now() - startTime,
    });

    console.log('Chat message posted successfully to:', spaceName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        mode: 'LIVE',
        message: 'Message posted successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Post chat error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

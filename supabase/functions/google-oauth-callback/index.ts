import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  exchangeCodeForTokens, 
  getGoogleUserInfo, 
  encryptToken 
} from "../_shared/google-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return new Response(
        `<html><body><script>window.opener?.postMessage({ type: 'google-oauth-error', error: '${error}' }, '*'); window.close();</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing code or state' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode and verify state
    let stateData: { userId: string; timestamp: number; nonce: string };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid state' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check state isn't too old (10 minute max)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      return new Response(
        JSON.stringify({ error: 'State expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = stateData.userId;

    // Exchange code for tokens
    const baseUrl = Deno.env.get('SUPABASE_URL')!;
    const redirectUri = `${baseUrl}/functions/v1/google-oauth-callback`;
    
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    
    // Get user info
    const userInfo = await getGoogleUserInfo(tokens.access_token);

    // Check allowed domains
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: domainConfig } = await supabaseAdmin
      .from('config_settings')
      .select('value')
      .eq('key', 'google.allowed_domains')
      .single();

    if (domainConfig?.value) {
      const allowedDomains = JSON.parse(domainConfig.value) as string[];
      const emailDomain = userInfo.email.split('@')[1];
      
      // Empty array means allow all, otherwise check domain
      if (allowedDomains.length > 0 && !allowedDomains.includes(emailDomain)) {
        console.log('Domain not allowed:', emailDomain);
        return new Response(
          `<html><body><script>window.opener?.postMessage({ type: 'google-oauth-error', error: 'Domain not allowed' }, '*'); window.close();</script></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
    }

    // Store connection
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    const { error: upsertError } = await supabaseAdmin
      .from('google_connections')
      .upsert({
        user_id: userId,
        google_email: userInfo.email,
        scopes_json: tokens.scope.split(' '),
        access_token_encrypted: encryptToken(tokens.access_token),
        refresh_token_encrypted: encryptToken(tokens.refresh_token),
        token_expires_at: expiresAt.toISOString(),
        status: 'CONNECTED',
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Failed to save connection:', upsertError);
      throw new Error('Failed to save connection');
    }

    // Log event
    await supabaseAdmin.rpc('log_google_event', {
      p_user_id: userId,
      p_action_type: 'OAUTH_CONNECT',
      p_status: 'SUCCESS',
      p_response_json: { google_email: userInfo.email },
    });

    console.log('Google account connected:', userInfo.email, 'for user:', userId);

    // Return success page that closes popup and notifies parent
    return new Response(
      `<html>
        <body>
          <h2>Google Account Connected!</h2>
          <p>You can close this window.</p>
          <script>
            window.opener?.postMessage({ 
              type: 'google-oauth-success', 
              email: '${userInfo.email}' 
            }, '*');
            setTimeout(() => window.close(), 1500);
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error: unknown) {
    console.error('OAuth callback error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      `<html><body><script>window.opener?.postMessage({ type: 'google-oauth-error', error: '${message}' }, '*'); window.close();</script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
});

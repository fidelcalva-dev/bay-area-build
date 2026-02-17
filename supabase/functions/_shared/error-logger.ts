/**
 * Centralized error logger for edge functions.
 * Logs errors to system_errors table and optionally triggers alerts.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ErrorLogInput {
  functionName: string;
  route?: string;
  userId?: string;
  errorMessage: string;
  errorStack?: string;
  payload?: Record<string, unknown>;
  severity?: 'info' | 'warn' | 'error' | 'critical';
}

export async function logError(input: ErrorLogInput): Promise<void> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase.from('system_errors').insert({
      function_name: input.functionName,
      route: input.route || null,
      user_id: input.userId || null,
      error_message: input.errorMessage,
      error_stack: input.errorStack || null,
      payload_json: input.payload || null,
      severity: input.severity || 'error',
    });

    // For critical errors, dispatch internal alert
    if (input.severity === 'critical') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      try {
        await fetch(`${supabaseUrl}/functions/v1/internal-alert-dispatcher`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            event_type: 'SYSTEM_ERROR',
            entity_type: 'SYSTEM',
            entity_id: input.functionName,
            source: 'EDGE_FUNCTION',
            payload: {
              function_name: input.functionName,
              error_message: input.errorMessage,
              severity: input.severity,
            },
          }),
        });
      } catch (_alertErr) {
        // Alert dispatch is best-effort
      }
    }
  } catch (_err) {
    // Error logging itself should never throw
    console.error('[error-logger] Failed to log error:', _err);
  }
}

/**
 * Wraps an edge function handler with automatic error logging
 */
export function withErrorLogging(
  functionName: string,
  handler: (req: Request) => Promise<Response>,
  corsHeaders: Record<string, string>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      await logError({
        functionName,
        errorMessage,
        errorStack,
        severity: 'error',
      });

      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  };
}

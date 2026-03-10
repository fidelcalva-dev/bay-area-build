import { supabase } from '@/integrations/supabase/client';

/**
 * Log a CRM error to the crm_errors table.
 * Non-blocking — failures are silently caught.
 */
export async function logCrmError(params: {
  action: string;
  error_message: string;
  user_id?: string;
  error_detail?: Record<string, unknown>;
  source_page?: string;
  entity_type?: string;
  entity_id?: string;
}) {
  try {
    await (supabase.from('crm_errors' as any) as any).insert({
      action: params.action,
      error_message: params.error_message,
      user_id: params.user_id || null,
      error_detail: params.error_detail || {},
      source_page: params.source_page || (typeof window !== 'undefined' ? window.location.pathname : null),
      entity_type: params.entity_type || null,
      entity_id: params.entity_id || null,
    });
  } catch {
    // Silently fail — error logging should never block user flows
  }
}

/**
 * Assistant Learning Client
 * Fires-and-forgets learning events to the assistant-learning edge function.
 * Respects mode server-side — always safe to call.
 */
import { supabase } from '@/integrations/supabase/client';

export interface AssistantLearningEvent {
  session_id?: string;
  lead_id?: string;
  user_type?: 'homeowner' | 'contractor' | 'commercial';
  project_type?: string;
  material_type?: string;
  recommended_size?: number;
  selected_size?: number;
  confidence?: number;
  converted_to_quote?: boolean;
  converted_to_order?: boolean;
  revenue_cents?: number;
  margin_band?: 'LOW' | 'MED' | 'HIGH';
  drop_off_step?: string;
}

/**
 * Record an assistant learning event.
 * Fire-and-forget — never blocks UI. Mode is checked server-side.
 */
export function recordLearningEvent(event: AssistantLearningEvent): void {
  supabase.functions
    .invoke('assistant-learning', { body: event })
    .then(({ error }) => {
      if (error) console.warn('[assistant-learning] Event failed:', error.message);
    })
    .catch(() => {
      // Silent fail — learning is optional
    });
}

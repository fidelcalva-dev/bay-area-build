// ============================================================
// CHAT HANDOFF SERVICE
// Manages session lifecycle, lead creation, and handoff packets
// ============================================================

import { supabase } from '@/integrations/supabase/client';
import {
  classifyIntent,
  extractFieldsFromMessages,
  type ChatIntent,
  type HandoffDepartment,
  type RiskBand,
  type IntentResult,
} from './chatIntentClassifier';

export interface ChatSession {
  id: string;
  session_token: string;
  lead_id: string | null;
  status: string;
  context_json: Record<string, unknown>;
}

// ---- Session management ----

export async function createChatSession(params: {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer_url?: string;
  landing_url?: string;
}): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('ai_chat_sessions' as never)
    .insert({
      utm_source: params.utm_source || null,
      utm_medium: params.utm_medium || null,
      utm_campaign: params.utm_campaign || null,
      referrer_url: params.referrer_url || null,
      landing_url: params.landing_url || null,
      capture_user_agent: navigator.userAgent,
    } as never)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to create chat session:', error);
    return null;
  }
  return data as unknown as ChatSession;
}

export async function updateSessionContext(
  sessionId: string,
  context: Record<string, unknown>
): Promise<void> {
  await supabase
    .from('ai_chat_sessions' as never)
    .update({
      context_json: context,
      last_event_at: new Date().toISOString(),
    } as never)
    .eq('id', sessionId);
}

export async function markSessionHandedOff(sessionId: string): Promise<void> {
  await supabase
    .from('ai_chat_sessions' as never)
    .update({ status: 'HANDED_OFF', last_event_at: new Date().toISOString() } as never)
    .eq('id', sessionId);
}

export async function closeSession(sessionId: string): Promise<void> {
  await supabase
    .from('ai_chat_sessions' as never)
    .update({ status: 'CLOSED', last_event_at: new Date().toISOString() } as never)
    .eq('id', sessionId);
}

// ---- Message persistence ----

export async function saveChatMessage(params: {
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  messageText: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  await supabase
    .from('ai_chat_messages' as never)
    .insert({
      session_id: params.sessionId,
      role: params.role,
      message_text: params.messageText,
      meta_json: params.meta || {},
    } as never);
}

// ---- Lead creation via lead-ingest ----

export async function ensureLeadCreated(params: {
  sessionId: string;
  context: Record<string, unknown>;
  messages: Array<{ role: string; content: string }>;
}): Promise<string | null> {
  // Check if session already has a lead
  const { data: session } = await supabase
    .from('ai_chat_sessions' as never)
    .select('lead_id')
    .eq('id', params.sessionId)
    .single();

  if ((session as any)?.lead_id) return (session as any).lead_id;

  const fields = extractFieldsFromMessages(params.messages, params.context);

  // Build transcript excerpt
  const transcript = params.messages.slice(-10).map(m =>
    `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`
  ).join('\n\n');

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lead-ingest`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          source_channel: 'AI_CHAT',
          source_detail: 'ai_chat_handoff',
          name: (fields.name as string) || undefined,
          phone: (fields.phone as string) || undefined,
          email: (fields.email as string) || undefined,
          zip: (fields.zip as string) || undefined,
          address: (fields.address as string) || undefined,
          material_category: (fields.material as string) || undefined,
          size_preference: fields.size ? String(fields.size) : undefined,
          message: `AI Chat Session\n\n${transcript}`,
          utm_source: (params.context.utm_source as string) || undefined,
          utm_medium: (params.context.utm_medium as string) || undefined,
          utm_campaign: (params.context.utm_campaign as string) || undefined,
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      const leadId = result.lead_id;

      if (leadId) {
        // Link lead to session
        await supabase
          .from('ai_chat_sessions' as never)
          .update({ lead_id: leadId } as never)
          .eq('id', params.sessionId);
        return leadId;
      }
    }
  } catch (err) {
    console.error('Lead creation from chat failed:', err);
  }
  return null;
}

// ---- Handoff packet creation ----

export async function createHandoffPacket(params: {
  leadId: string;
  sessionId: string;
  department: HandoffDepartment;
  intent: IntentResult;
  messages: Array<{ role: string; content: string }>;
  context: Record<string, unknown>;
  riskBand: RiskBand;
}): Promise<string | null> {
  const fields = extractFieldsFromMessages(params.messages, params.context);

  // Generate summary
  const userMessages = params.messages.filter(m => m.role === 'user').map(m => m.content);
  const summary = generateHandoffSummary(params.intent, fields, userMessages);

  // Determine recommended action
  const action = getRecommendedAction(params.intent.label, params.riskBand);

  const { data, error } = await supabase
    .from('lead_handoff_packets' as never)
    .insert({
      lead_id: params.leadId,
      session_id: params.sessionId,
      assigned_team: params.department,
      summary_text: summary,
      extracted_fields_json: fields,
      recommended_next_action: action,
      risk_band: params.riskBand,
    } as never)
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create handoff packet:', error);
    return null;
  }

  // Mark session as handed off
  await markSessionHandedOff(params.sessionId);

  // Log lifecycle event
  await logHandoffEvent(params.leadId, params.sessionId, params.department, params.intent.label);

  return (data as any)?.id || null;
}

function generateHandoffSummary(
  intent: IntentResult,
  fields: Record<string, unknown>,
  userMessages: string[]
): string {
  const parts: string[] = [];
  parts.push(`Intent: ${intent.label} (${(intent.confidence * 100).toFixed(0)}% confidence)`);
  parts.push(`Urgency: ${intent.urgency}`);
  parts.push(`Department: ${intent.department}`);

  if (fields.zip) parts.push(`ZIP: ${fields.zip}`);
  if (fields.material) parts.push(`Material: ${fields.material}`);
  if (fields.size) parts.push(`Size: ${fields.size}yd`);
  if (fields.timeline) parts.push(`Timeline: ${fields.timeline}`);
  if (fields.phone) parts.push(`Phone: ${fields.phone}`);
  if (fields.email) parts.push(`Email: ${fields.email}`);

  // Last customer message as context
  const lastMsg = userMessages[userMessages.length - 1];
  if (lastMsg) {
    parts.push(`Last message: "${lastMsg.slice(0, 200)}"`);
  }

  return parts.join(' | ');
}

function getRecommendedAction(intent: ChatIntent, riskBand: RiskBand): string {
  if (riskBand === 'RED') return 'MANAGER_REVIEW';
  if (riskBand === 'AMBER') return 'VERIFY_THEN_QUOTE';

  switch (intent) {
    case 'READY_TO_BOOK': return 'SEND_QUOTE';
    case 'NEED_PRICE': return 'SEND_QUOTE';
    case 'COMMERCIAL_ACCOUNT': return 'CALL_IMMEDIATELY';
    case 'CONTRACTOR_MULTI': return 'CALL_IMMEDIATELY';
    case 'PAYMENT_HELP': return 'CHECK_BILLING';
    case 'PICKUP_REQUEST': return 'SCHEDULE_PICKUP';
    case 'SCHEDULE_REQUEST': return 'CONFIRM_SCHEDULE';
    case 'SUPPORT_ISSUE': return 'INVESTIGATE_ISSUE';
    default: return 'FOLLOW_UP_CALL';
  }
}

async function logHandoffEvent(
  leadId: string,
  sessionId: string,
  department: string,
  intent: string
): Promise<void> {
  // Log to lead_events
  await supabase.from('lead_events' as never).insert({
    lead_id: leadId,
    event_type: 'AI_HANDOFF_CREATED',
    event_data: { session_id: sessionId, department, intent },
  } as never);
}

// ---- Analyze conversation for handoff decision ----

export function analyzeForHandoff(
  messages: Array<{ role: string; content: string }>,
  context: Record<string, unknown>
): IntentResult {
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
  return classifyIntent(userMessages, {
    zip: context.zip as string,
    material: context.material as string,
    size: context.size as number,
    hasOrder: !!context.orderId,
    isExistingCustomer: !!context.customerId,
    riskBand: (context.riskBand as RiskBand) || 'GREEN',
    messageCount: messages.length,
  });
}

// ---- Business hours check ----

export function isBusinessHours(): boolean {
  const now = new Date();
  const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const day = pst.getDay(); // 0=Sun
  const hour = pst.getHours();
  // Mon-Sat 7AM-6PM
  if (day === 0) return false;
  return hour >= 7 && hour < 18;
}

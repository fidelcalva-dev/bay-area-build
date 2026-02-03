import { supabase } from "@/integrations/supabase/client";

export interface GHLMessage {
  id: string;
  ghl_message_id: string | null;
  ghl_conversation_id: string;
  direction: "INBOUND" | "OUTBOUND";
  channel: "SMS" | "EMAIL" | "FB" | "IG" | "WHATSAPP" | "CHAT";
  from_number: string | null;
  to_number: string | null;
  from_email: string | null;
  to_email: string | null;
  subject: string | null;
  body_text: string | null;
  sent_at: string | null;
  status: string;
  error_message: string | null;
  contact_id: string | null;
  customer_id: string | null;
  lead_id: string | null;
  order_id: string | null;
  template_key: string | null;
  is_automated: boolean;
  created_at: string;
}

export interface GHLCallLog {
  id: string;
  ghl_call_id: string | null;
  direction: "INBOUND" | "OUTBOUND";
  from_number: string;
  to_number: string;
  caller_name: string | null;
  duration_seconds: number;
  status: string;
  recording_url: string | null;
  started_at: string | null;
  contact_id: string | null;
  customer_id: string | null;
  lead_id: string | null;
  order_id: string | null;
  created_at: string;
}

export interface GHLThread {
  id: string;
  ghl_conversation_id: string;
  channel: string;
  phone_number: string | null;
  email_address: string | null;
  last_message_at: string | null;
  last_message_direction: string | null;
  unread_count: number;
  contact_id: string | null;
  customer_id: string | null;
  lead_id: string | null;
  created_at: string;
}

export interface CommunicationItem {
  id: string;
  type: "message" | "call";
  direction: "INBOUND" | "OUTBOUND";
  channel: string;
  timestamp: string;
  status: string;
  // Message fields
  body?: string;
  subject?: string;
  from?: string;
  to?: string;
  // Call fields
  duration_seconds?: number;
  recording_url?: string;
  // Linked entities
  contact_id?: string | null;
  customer_id?: string | null;
  lead_id?: string | null;
  order_id?: string | null;
}

// Fetch messages for an entity
export async function getMessagesForEntity(
  entityType: "customer" | "contact" | "lead" | "order",
  entityId: string,
  limit = 50
): Promise<GHLMessage[]> {
  let query = supabase
    .from("ghl_messages")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (entityType === "customer") {
    query = query.eq("customer_id", entityId);
  } else if (entityType === "contact") {
    query = query.eq("contact_id", entityId);
  } else if (entityType === "lead") {
    query = query.eq("lead_id", entityId);
  } else if (entityType === "order") {
    query = query.eq("order_id", entityId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as GHLMessage[];
}

// Fetch call logs for an entity
export async function getCallsForEntity(
  entityType: "customer" | "contact" | "lead" | "order",
  entityId: string,
  limit = 50
): Promise<GHLCallLog[]> {
  let query = supabase
    .from("ghl_call_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (entityType === "customer") {
    query = query.eq("customer_id", entityId);
  } else if (entityType === "contact") {
    query = query.eq("contact_id", entityId);
  } else if (entityType === "lead") {
    query = query.eq("lead_id", entityId);
  } else if (entityType === "order") {
    query = query.eq("order_id", entityId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as GHLCallLog[];
}

// Get unified communication timeline
export async function getCommunicationTimeline(
  entityType: "customer" | "contact" | "lead" | "order",
  entityId: string,
  limit = 50
): Promise<CommunicationItem[]> {
  const [messages, calls] = await Promise.all([
    getMessagesForEntity(entityType, entityId, limit),
    getCallsForEntity(entityType, entityId, limit),
  ]);

  const items: CommunicationItem[] = [];

  // Add messages
  for (const msg of messages) {
    items.push({
      id: msg.id,
      type: "message",
      direction: msg.direction,
      channel: msg.channel,
      timestamp: msg.sent_at || msg.created_at,
      status: msg.status,
      body: msg.body_text || undefined,
      subject: msg.subject || undefined,
      from: msg.from_number || msg.from_email || undefined,
      to: msg.to_number || msg.to_email || undefined,
      contact_id: msg.contact_id,
      customer_id: msg.customer_id,
      lead_id: msg.lead_id,
      order_id: msg.order_id,
    });
  }

  // Add calls
  for (const call of calls) {
    items.push({
      id: call.id,
      type: "call",
      direction: call.direction,
      channel: "CALL",
      timestamp: call.started_at || call.created_at,
      status: call.status,
      from: call.from_number,
      to: call.to_number,
      duration_seconds: call.duration_seconds,
      recording_url: call.recording_url || undefined,
      contact_id: call.contact_id,
      customer_id: call.customer_id,
      lead_id: call.lead_id,
      order_id: call.order_id,
    });
  }

  // Sort by timestamp descending
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return items.slice(0, limit);
}

// Get threads for an entity
export async function getThreadsForEntity(
  entityType: "customer" | "contact" | "lead",
  entityId: string
): Promise<GHLThread[]> {
  let query = supabase
    .from("ghl_message_threads")
    .select("*")
    .order("last_message_at", { ascending: false });

  if (entityType === "customer") {
    query = query.eq("customer_id", entityId);
  } else if (entityType === "contact") {
    query = query.eq("contact_id", entityId);
  } else if (entityType === "lead") {
    query = query.eq("lead_id", entityId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as GHLThread[];
}

// Send outbound message
export async function sendOutboundMessage(params: {
  channel: "sms" | "email";
  contact_id?: string;
  customer_id?: string;
  lead_id?: string;
  phone?: string;
  email?: string;
  template_key?: string;
  variables?: Record<string, string>;
  subject?: string;
  body?: string;
  entity_type?: string;
  entity_id?: string;
}): Promise<{ success: boolean; status: string; message_id?: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke("ghl-send-outbound", {
    body: params,
  });

  if (error) {
    return { success: false, status: "ERROR", error: error.message };
  }

  return data;
}

// Mark thread as read
export async function markThreadAsRead(threadId: string): Promise<void> {
  const { error } = await supabase
    .from("ghl_message_threads")
    .update({ unread_count: 0 })
    .eq("id", threadId);

  if (error) throw error;
}

// Get GHL messaging mode
export async function getGHLMessagingMode(): Promise<"DRY_RUN" | "LIVE"> {
  const { data } = await supabase
    .from("config_settings")
    .select("value")
    .eq("key", "ghl.messaging_mode")
    .single();

  if (!data?.value) return "DRY_RUN";
  try {
    const val = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
    return val === "LIVE" ? "LIVE" : "DRY_RUN";
  } catch {
    return "DRY_RUN";
  }
}

// Format duration for display
export function formatCallDuration(seconds: number): string {
  if (seconds === 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

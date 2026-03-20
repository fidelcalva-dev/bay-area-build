import { supabase } from "@/integrations/supabase/client";

export interface MessageTemplate {
  id: string;
  key: string;
  channel: string;
  name: string;
  subject: string | null;
  body: string;
  variables: unknown[];
  category: string | null;
  is_active: boolean;
}

export interface QueuedMessage {
  id: string;
  channel: string;
  to_address: string;
  subject: string | null;
  body: string;
  template_key: string | null;
  status: string;
  mode: string | null;
  created_at: string;
  sent_at: string | null;
  error_message: string | null;
  retry_count: number | null;
  entity_type: string | null;
  entity_id: string | null;
}

export async function getMessageTemplates(channel?: "sms" | "email"): Promise<MessageTemplate[]> {
  let query = supabase
    .from("message_templates")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("name");

  if (channel) {
    query = query.eq("channel", channel);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((t: any) => ({
    ...t,
    channel: t.channel as string,
    variables: Array.isArray(t.variables) ? t.variables.map(String) : [],
  })) as MessageTemplate[];
}

export async function renderTemplate(
  templateKey: string,
  variables: Record<string, string>
): Promise<{ subject: string | null; body: string }> {
  const { data: template, error } = await supabase
    .from("message_templates")
    .select("subject, body")
    .eq("key", templateKey)
    .single();

  if (error || !template) throw new Error("Template not found");

  let body = template.body;
  let subject = template.subject;

  Object.entries(variables).forEach(([key, value]) => {
    body = body.replace(new RegExp(`\\{${key}\\}`, "g"), value || "");
    if (subject) {
      subject = subject.replace(new RegExp(`\\{${key}\\}`, "g"), value || "");
    }
  });

  return { subject, body };
}

export async function enqueueMessage(params: {
  channel: "sms" | "email";
  to_address: string;
  template_key: string;
  variables: Record<string, string>;
  entity_type?: string;
  entity_id?: string;
  contact_id?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc("enqueue_ghl_message", {
    p_channel: params.channel,
    p_to_address: params.to_address,
    p_template_key: params.template_key,
    p_variables: params.variables,
    p_entity_type: params.entity_type || null,
    p_entity_id: params.entity_id || null,
    p_contact_id: params.contact_id || null,
  });

  if (error) throw error;
  return data as string;
}

export async function sendMessageDirect(params: {
  channel: "sms" | "email";
  to_address: string;
  subject?: string;
  body: string;
  contact_id?: string;
  customer_id?: string;
  lead_id?: string;
  entity_type?: string;
  entity_id?: string;
}): Promise<{ success: boolean; status: string; error?: string }> {
  const response = await supabase.functions.invoke("ghl-send-outbound", {
    body: {
      channel: params.channel,
      phone: params.channel === "sms" ? params.to_address : undefined,
      email: params.channel === "email" ? params.to_address : undefined,
      subject: params.subject,
      body: params.body,
      contact_id: params.contact_id,
      customer_id: params.customer_id,
      lead_id: params.lead_id,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
    },
  });

  if (response.error) {
    return { success: false, status: "ERROR", error: response.error.message };
  }

  return response.data;
}

export async function getMessageQueue(
  filters?: { status?: string; channel?: string },
  limit = 50
): Promise<QueuedMessage[]> {
  let query = supabase
    .from("message_queue")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.channel) {
    query = query.eq("channel", filters.channel);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * @deprecated Use getGHLMessagingMode from ghlCommunication.ts instead.
 * This re-export maintains backward compatibility.
 */
export { getGHLMessagingMode as getMessagingMode } from './ghlCommunication';

export async function setMessagingMode(mode: "DRY_RUN" | "LIVE"): Promise<void> {
  const { error } = await supabase
    .from("config_settings")
    .update({ value: JSON.stringify(mode) as unknown as Json })
    .eq("key", "ghl.messaging_mode");

  if (error) throw error;
}

// Business data helpers
export const SUPPORT_PHONE = "(510) 680-2150";
export const COMPANY_NAME = "Calsan Dumpsters Pro";

export function getDefaultVariables(): Record<string, string> {
  return {
    support_phone: SUPPORT_PHONE,
    company_name: COMPANY_NAME,
  };
}

import { supabase } from "@/integrations/supabase/client";

interface LeadContext {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  company_name: string | null;
  city: string | null;
  zip: string | null;
  customer_type_detected: string | null;
  project_category: string | null;
  lead_quality_label: string | null;
  lead_quality_score: number | null;
  lead_risk_score: number | null;
  lead_status: string;
  first_response_at: string | null;
  first_response_sent_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
  consent_status: string | null;
}

export interface GeneratedScript {
  channel: "CALL" | "SMS" | "EMAIL";
  subject: string | null;
  body: string;
  templateKey: string;
  canSend: boolean;
  disabledReason: string | null;
}

export interface FollowUpResult {
  scripts: GeneratedScript[];
  nextBestAction: string;
  stage: string;
}

function determineStage(lead: LeadContext, slaBreached: boolean): string {
  if (slaBreached && !lead.first_response_at && !lead.first_response_sent_at) return "SLA_BREACH";
  if (lead.lead_status === "LOST" || lead.lead_status === "WON") return lead.lead_status;
  if (!lead.first_response_at && !lead.first_response_sent_at) return "NEW";
  if (lead.last_contacted_at) {
    const sinceContact = (Date.now() - new Date(lead.last_contacted_at).getTime()) / 60000;
    if (sinceContact > 240) return "FOLLOWUP";
  }
  return "NEW";
}

function interpolate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value || "");
  }
  return result;
}

export async function generateFollowUpScripts(
  lead: LeadContext,
  agentName: string = "Your Agent"
): Promise<FollowUpResult> {
  const slaMinutes = (Date.now() - new Date(lead.created_at).getTime()) / 60000;
  const slaBreached = slaMinutes > 15 && !lead.first_response_at && !lead.first_response_sent_at;
  const stage = determineStage(lead, slaBreached);
  const band = lead.lead_quality_label || "GREEN";
  const custType = lead.customer_type_detected || "homeowner";

  // Fetch matching templates
  const { data: templates } = await supabase
    .from("followup_templates")
    .select("*")
    .eq("is_active", true);

  if (!templates || templates.length === 0) {
    return { scripts: [], nextBestAction: "No templates configured", stage };
  }

  // Template matching: score each template for relevance
  const scored = templates.map((t: any) => {
    let score = 0;
    if (t.stage === stage) score += 10;
    else if (t.stage === "NEW" && stage !== "SLA_BREACH") score += 2;
    if (t.lead_quality_band === band) score += 5;
    else if (t.lead_quality_band === "any") score += 1;
    if (t.customer_type === custType) score += 5;
    else if (t.customer_type === "any") score += 1;
    return { ...t, _score: score };
  });

  // Pick best template per channel
  const channels: Array<"CALL" | "SMS" | "EMAIL"> = ["CALL", "SMS", "EMAIL"];
  const vars: Record<string, string> = {
    name: lead.customer_name || "there",
    agent_name: agentName,
    city_or_zip: lead.city || lead.zip || "your area",
    zip: lead.zip || "",
    size: "10",
    included_days: "7",
    included_tons: "1",
    schedule_link: `${window.location.origin}/portal/schedule`,
    payment_link: `${window.location.origin}/portal/pay`,
  };

  const isRed = band === "RED";
  const hasPhone = !!lead.customer_phone;
  const hasEmail = !!lead.customer_email;
  // Check opt-out (simplified: if consent_status is 'opted_out')
  const smsOptedOut = lead.consent_status === "opted_out";

  const scripts: GeneratedScript[] = channels.map((ch) => {
    const candidates = scored
      .filter((t: any) => t.channel === ch)
      .sort((a: any, b: any) => b._score - a._score);

    const best = candidates[0];
    if (!best) {
      return {
        channel: ch,
        subject: null,
        body: `No ${ch} template available for this lead profile.`,
        templateKey: "",
        canSend: false,
        disabledReason: "No template available",
      };
    }

    let body = interpolate(best.body_text, vars);
    let subject = best.subject ? interpolate(best.subject, vars) : null;

    // Strip payment links for RED leads
    if (isRed) {
      body = body
        .replace(/pay here:.*$/m, "")
        .replace(/\{payment_link\}/g, "")
        .replace(/you can pay here.*$/im, "");
    }

    let canSend = true;
    let disabledReason: string | null = null;

    if (ch === "SMS" && !hasPhone) {
      canSend = false;
      disabledReason = "No phone number on file";
    } else if (ch === "SMS" && smsOptedOut) {
      canSend = false;
      disabledReason = "Lead opted out of SMS";
    } else if (ch === "EMAIL" && !hasEmail) {
      canSend = false;
      disabledReason = "No email address on file";
    } else if (ch === "CALL" && !hasPhone) {
      canSend = false;
      disabledReason = "No phone number on file";
    }

    return { channel: ch, subject, body, templateKey: best.template_key, canSend, disabledReason };
  });

  // Next best action
  let nextBestAction = "Call the lead";
  if (isRed) {
    nextBestAction = "Manual call required - verify details";
  } else if (stage === "SLA_BREACH") {
    nextBestAction = "Urgent: Contact immediately";
  } else if (stage === "FOLLOWUP") {
    nextBestAction = "Send follow-up SMS or call";
  } else if (band === "AMBER") {
    nextBestAction = "Call to verify details before payment";
  } else {
    nextBestAction = hasPhone ? "Call to close" : "Send email with quote";
  }

  return { scripts, nextBestAction, stage };
}

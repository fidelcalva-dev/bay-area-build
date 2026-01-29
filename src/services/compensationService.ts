import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  CompensationPlan,
  CompensationEarning,
  CompensationAdjustment,
  CompensationAuditLog,
  UserCompensationSummary,
  CompensationStats,
  EarningStatus,
  AdjustmentType
} from "@/types/compensation";

type AppRole = Database["public"]["Enums"]["app_role"];

// =============================================
// PLANS
// =============================================

export async function getCompensationPlans(activeOnly = true): Promise<CompensationPlan[]> {
  let query = supabase
    .from("compensation_plans")
    .select("*, compensation_rules(*)")
    .order("role", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching compensation plans:", error);
    throw error;
  }

  return (data || []) as unknown as CompensationPlan[];
}

export async function updateCompensationPlan(
  planId: string,
  updates: Partial<Omit<CompensationPlan, 'role'> & { role?: AppRole }>
): Promise<CompensationPlan> {
  const updatePayload: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("compensation_plans")
    .update(updatePayload as never)
    .eq("id", planId)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as CompensationPlan;
}

// =============================================
// EARNINGS
// =============================================

export async function getCompensationEarnings(filters?: {
  userId?: string;
  period?: string;
  status?: EarningStatus;
  role?: AppRole;
  limit?: number;
}): Promise<CompensationEarning[]> {
  let query = supabase
    .from("compensation_earnings")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }
  if (filters?.period) {
    query = query.eq("period", filters.period);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.role) {
    query = query.eq("role", filters.role);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching compensation earnings:", error);
    throw error;
  }

  return (data || []) as unknown as CompensationEarning[];
}

export async function getPendingEarnings(): Promise<CompensationEarning[]> {
  return getCompensationEarnings({ status: "PENDING" });
}

// =============================================
// ADJUSTMENTS
// =============================================

export async function getCompensationAdjustments(filters?: {
  userId?: string;
  period?: string;
  status?: EarningStatus;
  type?: AdjustmentType;
  limit?: number;
}): Promise<CompensationAdjustment[]> {
  let query = supabase
    .from("compensation_adjustments")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }
  if (filters?.period) {
    query = query.eq("period", filters.period);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.type) {
    query = query.eq("adjustment_type", filters.type);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching compensation adjustments:", error);
    throw error;
  }

  return (data || []) as unknown as CompensationAdjustment[];
}

export async function createAdjustment(adjustment: {
  user_id: string;
  adjustment_type: AdjustmentType;
  reason: string;
  amount: number;
  related_entity_type?: string;
  related_entity_id?: string;
}): Promise<CompensationAdjustment> {
  const period = new Date().toISOString().slice(0, 7);
  
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("compensation_adjustments")
    .insert({
      ...adjustment,
      period,
      status: "PENDING",
      created_by: user.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as CompensationAdjustment;
}

// =============================================
// AUDIT LOG
// =============================================

export async function getCompensationAuditLog(filters?: {
  targetUserId?: string;
  actorUserId?: string;
  action?: string;
  limit?: number;
}): Promise<CompensationAuditLog[]> {
  let query = supabase
    .from("compensation_audit_log")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.targetUserId) {
    query = query.eq("target_user_id", filters.targetUserId);
  }
  if (filters?.actorUserId) {
    query = query.eq("actor_user_id", filters.actorUserId);
  }
  if (filters?.action) {
    query = query.eq("action", filters.action);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching compensation audit log:", error);
    throw error;
  }

  return (data || []) as unknown as CompensationAuditLog[];
}

// =============================================
// SUMMARY & STATS
// =============================================

export async function getUserCompensationSummary(
  userId: string,
  period?: string
): Promise<UserCompensationSummary | null> {
  const targetPeriod = period || new Date().toISOString().slice(0, 7);
  
  const { data, error } = await supabase
    .from("user_compensation_summary")
    .select("*")
    .eq("user_id", userId)
    .eq("period", targetPeriod)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user compensation summary:", error);
    throw error;
  }

  return data as unknown as UserCompensationSummary | null;
}

export async function getCompensationStats(period?: string): Promise<CompensationStats> {
  const targetPeriod = period || new Date().toISOString().slice(0, 7);

  const [earningsResult, adjustmentsResult] = await Promise.all([
    supabase
      .from("compensation_earnings")
      .select("payout_amount, status")
      .eq("period", targetPeriod),
    supabase
      .from("compensation_adjustments")
      .select("amount, adjustment_type, status")
      .eq("period", targetPeriod)
  ]);

  const earnings = earningsResult.data || [];
  const adjustments = adjustmentsResult.data || [];

  const stats: CompensationStats = {
    totalEarnings: 0,
    totalAdjustments: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    paidAmount: 0,
    voidedAmount: 0,
    earningsCount: earnings.length,
    adjustmentsCount: adjustments.length
  };

  for (const earning of earnings) {
    if (earning.status !== "VOIDED") {
      stats.totalEarnings += earning.payout_amount;
    }
    if (earning.status === "PENDING") {
      stats.pendingAmount += earning.payout_amount;
    } else if (earning.status === "APPROVED") {
      stats.approvedAmount += earning.payout_amount;
    } else if (earning.status === "PAID") {
      stats.paidAmount += earning.payout_amount;
    } else if (earning.status === "VOIDED") {
      stats.voidedAmount += earning.payout_amount;
    }
  }

  for (const adj of adjustments) {
    const amount = ["BONUS", "CREDIT"].includes(adj.adjustment_type) ? adj.amount : -adj.amount;
    if (adj.status !== "VOIDED") {
      stats.totalAdjustments += amount;
    }
  }

  return stats;
}

// =============================================
// APPROVAL ACTIONS
// =============================================

export async function approveEarnings(earningIds: string[]): Promise<{ success: boolean; errors: string[] }> {
  const { data: session } = await supabase.auth.getSession();
  
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compensation-approval-worker`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.session?.access_token}`
      },
      body: JSON.stringify({
        action: "bulk_approve",
        earningIds
      })
    }
  );

  return response.json();
}

export async function voidEarning(earningId: string, reason: string): Promise<{ success: boolean }> {
  const { data: session } = await supabase.auth.getSession();
  
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compensation-approval-worker`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.session?.access_token}`
      },
      body: JSON.stringify({
        action: "void",
        earningIds: [earningId],
        reason
      })
    }
  );

  return response.json();
}

export async function markEarningsAsPaid(earningIds: string[]): Promise<{ success: boolean; errors: string[] }> {
  const { data: session } = await supabase.auth.getSession();
  
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compensation-approval-worker`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.session?.access_token}`
      },
      body: JSON.stringify({
        action: "bulk_pay",
        earningIds
      })
    }
  );

  return response.json();
}

// =============================================
// CONFIG
// =============================================

export async function getCompensationMode(): Promise<string> {
  const { data, error } = await supabase
    .from("config_settings")
    .select("value")
    .eq("key", "compensation.mode")
    .single();

  if (error) return "DRY_RUN";
  return (data?.value as string)?.replace(/"/g, '') || "DRY_RUN";
}

export async function setCompensationMode(mode: "DRY_RUN" | "LIVE"): Promise<void> {
  const { error } = await supabase
    .from("config_settings")
    .update({ value: JSON.stringify(mode), updated_at: new Date().toISOString() })
    .eq("key", "compensation.mode");

  if (error) throw error;
}

// =============================================
// TRIGGER CALCULATIONS (for testing)
// =============================================

export async function triggerPaymentCompensation(paymentId: string, orderId: string, amount: number): Promise<unknown> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compensation-calc-on-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ paymentId, orderId, amount })
    }
  );

  return response.json();
}

export async function triggerRunCompensation(
  runId: string,
  driverId: string,
  onTime: boolean,
  hasPod: boolean,
  hasDumpTicket: boolean
): Promise<unknown> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compensation-calc-on-run`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ runId, driverId, onTime, hasPod, hasDumpTicket })
    }
  );

  return response.json();
}

export async function triggerKpiEvaluation(period: "weekly" | "monthly"): Promise<unknown> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compensation-kpi-evaluator`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ period })
    }
  );

  return response.json();
}

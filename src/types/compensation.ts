// Compensation Types

export type CommissionType = 'PERCENTAGE' | 'FLAT' | 'TIERED' | 'KPI_BASED';
export type CompensationTrigger = 'PAYMENT_CAPTURED' | 'ORDER_COMPLETED' | 'RUN_COMPLETED' | 'KPI_PERIOD_END' | 'MANUAL';
export type EarningStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'VOIDED';
export type AdjustmentType = 'BONUS' | 'PENALTY' | 'CREDIT' | 'CLAWBACK';

export interface CompensationPlan {
  id: string;
  role: string;
  plan_name: string;
  commission_type: CommissionType;
  rules_json: Record<string, unknown>;
  description?: string;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  updated_at: string;
  compensation_rules?: CompensationRule[];
}

export interface CompensationRule {
  id: string;
  plan_id: string;
  rule_name: string;
  trigger_event: CompensationTrigger;
  condition_json: Record<string, unknown>;
  payout_formula_json: Record<string, unknown>;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompensationEarning {
  id: string;
  user_id: string;
  role: string;
  plan_id?: string;
  rule_id?: string;
  entity_type: string;
  entity_id: string;
  gross_amount: number;
  payout_amount: number;
  calculation_details: Record<string, unknown>;
  status: EarningStatus;
  period: string;
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
  voided_at?: string;
  void_reason?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_email?: string;
}

export interface CompensationAdjustment {
  id: string;
  user_id: string;
  adjustment_type: AdjustmentType;
  reason: string;
  amount: number;
  related_entity_type?: string;
  related_entity_id?: string;
  period: string;
  status: EarningStatus;
  approved_by?: string;
  approved_at?: string;
  created_by?: string;
  created_at: string;
  // Joined fields
  user_email?: string;
}

export interface CompensationAuditLog {
  id: string;
  action: string;
  actor_user_id?: string;
  target_user_id?: string;
  entity_type?: string;
  entity_id?: string;
  before_data?: Record<string, unknown>;
  after_data?: Record<string, unknown>;
  details_json: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
  // Joined fields
  actor_email?: string;
  target_email?: string;
}

export interface UserCompensationSummary {
  id: string;
  user_id: string;
  period: string;
  total_earnings: number;
  total_adjustments: number;
  pending_amount: number;
  approved_amount: number;
  paid_amount: number;
  voided_amount: number;
  updated_at: string;
  // Joined fields
  user_email?: string;
}

export interface CompensationStats {
  totalEarnings: number;
  totalAdjustments: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  voidedAmount: number;
  earningsCount: number;
  adjustmentsCount: number;
}

// Internal Calculator Types

export type CustomerType = 'homeowner' | 'contractor' | 'commercial';
export type CustomerTier = 'standard' | 'preferred' | 'vip';
export type ServiceType = 'DELIVERY' | 'PICKUP' | 'SWAP';
export type MaterialCategory = 'DEBRIS' | 'HEAVY' | 'DEBRIS_HEAVY' | 'CLEAN_RECYCLING';
export type SlaClass = 'FAST' | 'STANDARD' | 'LONG';
export type MarginClass = 'GREEN' | 'AMBER' | 'RED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
export type DiscountType = 'PERCENTAGE' | 'FLAT' | 'FREE_DAY';
export type RestrictionType = 'NO_SAME_DAY_SWAP' | 'NO_HEAVY' | 'NO_LARGE_SIZE' | 'TIME_WINDOW';

export interface ZoneRestriction {
  id: string;
  market_code: string;
  restriction_type: RestrictionType;
  applies_to: string[];
  max_size_yd?: number;
  time_window_start?: string;
  time_window_end?: string;
  reason: string;
  is_active: boolean;
}

export interface CalculatorInputs {
  market_code: string;
  yard_id: string;
  service_type: ServiceType;
  material_category: MaterialCategory;
  dumpster_size: number;
  customer_type: CustomerType;
  customer_tier: CustomerTier;
  destination_address?: string;
  destination_lat?: number;
  destination_lng?: number;
  facility_id?: string;
  is_same_day: boolean;
  traffic_mode: 'REAL_TIME' | 'AVERAGE';
}

export interface CalculatorEstimate {
  id: string;
  market_code: string;
  yard_id?: string;
  service_type: ServiceType;
  material_category: MaterialCategory;
  dumpster_size: number;
  customer_type: CustomerType;
  customer_tier?: CustomerTier;
  destination_address?: string;
  destination_lat?: number;
  destination_lng?: number;
  facility_id?: string;
  is_same_day?: boolean;
  traffic_mode?: string;
  
  // Calculated outputs
  total_time_minutes?: number;
  time_breakdown?: TimeBreakdown;
  sla_class?: SlaClass;
  is_feasible?: boolean;
  blocked_reason?: string;
  
  // Pricing
  customer_price?: number;
  internal_cost?: number;
  margin_pct?: number;
  margin_class?: MarginClass;
  final_price?: number;
  final_margin_pct?: number;
  
  // Discounts
  discount_type?: DiscountType;
  discount_value?: number;
  discount_reason?: string;
  
  // Approval
  requires_approval?: boolean;
  approval_status?: ApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  
  // Links
  linked_lead_id?: string;
  linked_quote_id?: string;
  linked_order_id?: string;
  
  route_details?: RouteDetails;
  recommendations?: Recommendation[];
  warnings?: string[];
  
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeBreakdown {
  yard_time: number;
  drive_time: number;
  jobsite_time: number;
  dump_time: number;
  buffer: number;
}

export interface RouteDetails {
  yard_to_site_miles?: number;
  site_to_dump_miles?: number;
  dump_to_yard_miles?: number;
  total_miles?: number;
}

export interface Recommendation {
  type: 'BEST_MARGIN' | 'CHEAPEST' | 'FASTEST' | 'ALTERNATIVE';
  label: string;
  description: string;
  service_type?: ServiceType;
  dumpster_size?: number;
  estimated_margin_pct?: number;
  estimated_time_minutes?: number;
}

export interface CalculatorLog {
  id: string;
  estimate_id?: string;
  user_id?: string;
  user_role?: string;
  action_type: 'CALCULATE' | 'APPLY_DISCOUNT' | 'OVERRIDE' | 'CONVERT_TO_QUOTE' | 'CONVERT_TO_ORDER';
  inputs_json: CalculatorInputs;
  outputs_json?: Partial<CalculatorEstimate>;
  discount_applied?: {
    type: DiscountType;
    value: number;
    reason?: string;
  };
  override_details?: {
    field: string;
    original_value: unknown;
    new_value: unknown;
  };
  linked_entity_type?: 'LEAD' | 'QUOTE' | 'ORDER';
  linked_entity_id?: string;
  notes?: string;
  created_at: string;
}

export interface CalculatorResult {
  success: boolean;
  estimate: CalculatorEstimate;
  restrictions_checked: ZoneRestriction[];
  is_blocked: boolean;
  block_reason?: string;
  alternative_suggestions?: Recommendation[];
  error?: string;
}

// Service Cost Engine Types

export type ServiceType = 'DELIVERY' | 'PICKUP' | 'SWAP';
export type MaterialCategory = 'DEBRIS' | 'HEAVY' | 'DEBRIS_HEAVY' | 'CLEAN_RECYCLING';
export type CostModel = 'IN_HOUSE' | 'OWNER_OPERATOR';
export type VehicleType = 'ROLLOFF' | 'HIGHSIDE' | 'END_DUMP' | 'SUPER10' | 'TENWHEEL' | 'PICKUP';
export type DumpCostModel = 'PER_TON' | 'PER_LOAD' | 'FLAT';
export type GuardrailSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export interface ServiceCostRequest {
  market_code: string;
  vehicle_type?: VehicleType;
  cost_model_override?: CostModel;
  service_type: ServiceType;
  origin_yard_id: string;
  destination_address?: string;
  destination_lat?: number;
  destination_lng?: number;
  facility_id?: string;
  material_category: MaterialCategory;
  material_code?: string;
  dumpster_size?: number;
  customer_price: number;
  actual_weight_tons?: number;
  route_miles?: number;
  compare_models?: boolean;
  entity_type?: 'QUOTE' | 'ORDER' | 'RUN';
  entity_id?: string;
}

export interface CostBreakdown {
  model: CostModel;
  hours?: number;
  miles?: number;
  base_payout?: number;
  mileage_cost?: number;
  toll_estimate?: number;
  minimum_applied: boolean;
  overhead_multiplier?: number;
  total_truck_cost: number;
}

export interface DumpFeeBreakdown {
  model: DumpCostModel;
  assumed_tons?: number;
  cost_per_ton?: number;
  cost_per_load?: number;
  total_dump_cost: number;
}

export interface ModelEstimate {
  cost_model: CostModel;
  truck_cost: number;
  dump_cost: number;
  total_cost: number;
  customer_price: number;
  margin: number;
  margin_pct: number;
  breakdown: CostBreakdown;
}

export interface TimeBreakdown {
  total_minutes: number;
  drive_minutes: number;
  handling_minutes: number;
  dump_minutes: number;
}

export interface Guardrail {
  severity: GuardrailSeverity;
  reason: string;
  recommended_action: string;
}

export interface ServiceCostResponse {
  success: boolean;
  primary_estimate: ModelEstimate;
  alternative_estimate?: ModelEstimate;
  best_model: CostModel;
  margin_delta?: number;
  cost_delta?: number;
  time_breakdown?: TimeBreakdown;
  dump_breakdown: DumpFeeBreakdown;
  guardrail?: Guardrail;
  error?: string;
}

export interface ServiceCostEstimate {
  id: string;
  entity_type: 'QUOTE' | 'ORDER' | 'RUN';
  entity_id: string;
  market_code: string;
  service_type: ServiceType;
  vehicle_type?: VehicleType;
  material_category: MaterialCategory;
  material_code?: string;
  estimated_total_minutes: number;
  estimated_drive_minutes: number;
  estimated_handling_minutes: number;
  estimated_dump_minutes: number;
  assumed_dump_fee_cost: number;
  estimated_truck_cost: number;
  estimated_total_cost: number;
  customer_price: number;
  estimated_margin: number;
  estimated_margin_pct: number;
  cost_model_used: CostModel;
  truck_cost_breakdown_json: CostBreakdown;
  dump_cost_breakdown_json: DumpFeeBreakdown;
  comparison_json?: {
    primary: ModelEstimate;
    alternative?: ModelEstimate;
    best_model: CostModel;
    margin_delta?: number;
    cost_delta?: number;
  };
  route_miles?: number;
  alternative_model_cost?: number;
  alternative_model_margin_pct?: number;
  best_model?: CostModel;
  created_at: string;
}

export interface ProfitGuardrailEvent {
  id: string;
  entity_type: string;
  entity_id: string;
  severity: GuardrailSeverity;
  reason: string;
  recommended_action?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
}

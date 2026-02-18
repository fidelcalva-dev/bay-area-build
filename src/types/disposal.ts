// Disposal Cost Engine Types

export interface DisposalSite {
  id: string;
  name: string;
  type: 'transfer_station' | 'recycling' | 'landfill' | 'composting';
  address: string;
  city: string;
  state: string;
  zip: string | null;
  lat: number | null;
  lng: number | null;
  materials_accepted: string[];
  is_active: boolean;
  compliance_rating: number;
  typical_wait_time_min: number;
  ticket_required: boolean;
  phone: string | null;
  hours: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisposalRate {
  id: string;
  disposal_site_id: string;
  material_type: string;
  price_per_ton: number | null;
  flat_fee: number | null;
  minimum_fee: number | null;
  last_verified_at: string | null;
  source: 'manual' | 'phone' | 'website';
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialWeightReference {
  id: string;
  material_name: string;
  estimated_weight_per_cubic_yard: number;
  weight_range_min: number | null;
  weight_range_max: number | null;
  typical_density_class: 'light' | 'medium' | 'heavy';
  allowed_in_general: boolean;
  requires_separation: boolean;
  heavy_only: boolean;
  max_dumpster_size: number | null;
  fill_line_pct: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface YardDisposalConfig {
  id: string;
  yard_id: string;
  default_disposal_site_ids: string[];
  markup_pct: number;
  fuel_cost_per_mile: number;
  labor_hourly_rate: number;
  overhead_factor: number;
  min_margin_pct: number;
  compliance_mode: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Cost engine types
export interface DisposalCostInput {
  yard_id: string;
  destination_lat: number;
  destination_lng: number;
  material_type: string;
  dumpster_size_yd: number;
  service_type: 'DELIVERY' | 'PICKUP' | 'SWAP' | 'DUMP_AND_RETURN';
  compliance_mode?: boolean;
}

export interface DisposalRouteOption {
  route_label: 'affordable' | 'premium';
  disposal_site: Pick<DisposalSite, 'id' | 'name' | 'type' | 'city' | 'compliance_rating' | 'typical_wait_time_min'>;
  distance_miles: number;
  disposal_cost: number;
  truck_cycle_cost: number;
  overhead_cost: number;
  total_internal_cost: number;
  suggested_price: number;
  margin_pct: number;
  margin_class: 'GREEN' | 'AMBER' | 'RED';
  estimated_cycle_minutes: number;
  breakdown: {
    yard_prep_min: number;
    travel_to_site_min: number;
    dropoff_min: number;
    pickup_secure_min: number;
    travel_to_disposal_min: number;
    dump_wait_min: number;
    return_to_yard_min: number;
  };
}

export interface DisposalCostResult {
  success: boolean;
  affordable_option?: DisposalRouteOption;
  premium_option?: DisposalRouteOption;
  material_weight: {
    material_name: string;
    estimated_tons: number;
    density_class: string;
    is_heavy: boolean;
  };
  warnings: string[];
  error?: string;
}

export interface MaterialBreakdownItem {
  material_name: string;
  cubic_yards: number;
  estimated_weight_lbs: number;
  estimated_tons: number;
  estimated_disposal_cost: number;
  is_heavy: boolean;
  requires_separation: boolean;
}

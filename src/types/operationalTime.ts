// Operational Time Calculator Types

export type ServiceType = 'DELIVERY' | 'PICKUP' | 'SWAP' | 'DUMP_AND_RETURN';
export type MaterialCategory = 'DEBRIS' | 'HEAVY' | 'DEBRIS_HEAVY' | 'CLEAN_RECYCLING';
export type TrafficMode = 'REAL_TIME' | 'AVERAGE';
export type SlaClass = 'FAST' | 'STANDARD' | 'LONG';
export type RunRecommendation = 'SAME_DAY' | 'NEXT_DAY' | 'SCHEDULED';

export interface OperationalTimeRequest {
  origin_yard_id: string;
  destination_address?: string;
  destination_lat?: number;
  destination_lng?: number;
  service_type: ServiceType;
  material_category: MaterialCategory;
  dumpster_size?: number;
  disposal_facility_id?: string;
  market_code?: string;
  traffic_mode?: TrafficMode;
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
  dump_to_site_miles?: number;
  site_to_yard_miles?: number;
}

export interface OperationalTimeResult {
  success: boolean;
  service_type: ServiceType;
  origin_yard: string;
  job_site_city?: string;
  facility?: string;
  total_time_minutes: number;
  breakdown: TimeBreakdown;
  sla_class: SlaClass;
  recommended_run_type: RunRecommendation;
  route_details?: RouteDetails;
  error?: string;
}

export interface Yard {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  market: string;
  address: string;
  is_active: boolean;
}

export interface Facility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  facility_type: string;
  accepted_material_classes: string[];
  status: string;
}

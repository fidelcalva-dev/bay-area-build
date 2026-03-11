// Site Placement Types

export interface RectangleGeometry {
  center: { lat: number; lng: number };
  width_ft: number;
  length_ft: number;
  rotation_deg: number;
}

export interface DumpsterDimensions {
  id: string;
  size_yd: number;
  width_ft: number;
  length_ft: number;
  height_ft: number | null;
  description: string | null;
  is_active: boolean;
}

export interface TruckDimensions {
  id: string;
  truck_type: TruckType;
  width_ft: number;
  length_ft: number;
  clearance_notes: string | null;
  is_active: boolean;
}

export type TruckType = 'ROLLOFF' | 'HIGHSIDE' | 'END_DUMP' | 'TENWHEEL' | 'SUPER10';

export type PlacementCreatorRole = 'CUSTOMER' | 'SALES' | 'CS' | 'DISPATCH' | 'ADMIN' | 'DRIVER';

export interface OrderSitePlacement {
  id: string;
  order_id: string;
  created_by_user_id: string | null;
  created_by_role: PlacementCreatorRole;
  map_provider: string;
  map_center_lat: number;
  map_center_lng: number;
  map_zoom: number;
  dumpster_size_yd: number;
  dumpster_rect_json: RectangleGeometry;
  truck_type: TruckType;
  truck_rect_json: RectangleGeometry;
  placement_notes: string | null;
  image_storage_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlacementFormData {
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  dumpsterSize: number;
  dumpsterRect: RectangleGeometry;
  truckType: TruckType;
  truckRect: RectangleGeometry;
  placementNotes: string;
}

// Default fallback dimensions if database fetch fails
export const DEFAULT_DUMPSTER_DIMENSIONS: Record<number, { width_ft: number; length_ft: number }> = {
  5: { width_ft: 4, length_ft: 8 },
  // 6yd entry removed — canonical sizes are 5, 8, 10, 20, 30, 40, 50
  8: { width_ft: 6, length_ft: 12 },
  10: { width_ft: 7, length_ft: 14 },
  20: { width_ft: 8, length_ft: 22 },
  30: { width_ft: 8, length_ft: 22 },
  40: { width_ft: 8, length_ft: 22 },
  50: { width_ft: 8, length_ft: 22 },
};

export const DEFAULT_TRUCK_DIMENSIONS: Record<TruckType, { width_ft: number; length_ft: number }> = {
  ROLLOFF: { width_ft: 10, length_ft: 35 },
  HIGHSIDE: { width_ft: 10, length_ft: 40 },
  END_DUMP: { width_ft: 10, length_ft: 45 },
  TENWHEEL: { width_ft: 9, length_ft: 30 },
  SUPER10: { width_ft: 9, length_ft: 35 },
};

export const TRUCK_TYPE_LABELS: Record<TruckType, string> = {
  ROLLOFF: 'Roll-Off Truck',
  HIGHSIDE: 'High-Side Trailer',
  END_DUMP: 'End Dump',
  TENWHEEL: 'Ten-Wheeler',
  SUPER10: 'Super 10',
};

export const SNAP_ANGLES = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345];

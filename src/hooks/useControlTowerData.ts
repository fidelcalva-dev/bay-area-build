import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface YardMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  market: string;
  slug: string;
  address: string;
  priority_rank: number;
}

export interface FacilityMarker {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  facility_type: string;
  city: string;
  status: string;
}

export interface RunLine {
  id: string;
  run_type: string;
  status: string;
  scheduled_date: string;
  assigned_driver_id: string | null;
  asset_id: string | null;
  customer_name: string | null;
  origin_lat: number | null;
  origin_lng: number | null;
  destination_lat: number | null;
  destination_lng: number | null;
  destination_address: string | null;
  estimated_miles: number | null;
  estimated_duration_mins: number | null;
  run_number: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface AssetMarker {
  id: string;
  asset_code: string;
  asset_status: string;
  current_location_type: string;
  current_yard_id: string | null;
  days_out: number;
  size_id: string;
}

export function useYards() {
  return useQuery({
    queryKey: ['control-tower-yards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('yards')
        .select('id, name, latitude, longitude, market, slug, address, priority_rank')
        .eq('is_active', true)
        .order('priority_rank');
      if (error) throw error;
      return data as unknown as YardMarker[];
    },
  });
}

export function useFacilities() {
  return useQuery({
    queryKey: ['control-tower-facilities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('id, name, lat, lng, facility_type, city, status')
        .eq('status', 'active');
      if (error) throw error;
      return data as FacilityMarker[];
    },
  });
}

export function useRunsForDate(date: string) {
  return useQuery({
    queryKey: ['control-tower-runs', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('runs')
        .select('id, run_type, status, scheduled_date, assigned_driver_id, asset_id, customer_name, origin_lat, origin_lng, destination_lat, destination_lng, destination_address, estimated_miles, estimated_duration_mins, run_number, started_at, completed_at')
        .eq('scheduled_date', date)
        .order('scheduled_start', { ascending: true });
      if (error) throw error;
      return data as RunLine[];
    },
  });
}

export function useRunRoutes(runIds: string[]) {
  return useQuery({
    queryKey: ['control-tower-routes', runIds],
    queryFn: async () => {
      if (!runIds.length) return [];
      const { data, error } = await supabase
        .from('run_routes')
        .select('*')
        .in('run_id', runIds);
      if (error) throw error;
      return data;
    },
    enabled: runIds.length > 0,
  });
}

export function useAssets() {
  return useQuery({
    queryKey: ['control-tower-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets_dumpsters')
        .select('id, asset_code, asset_status, current_location_type, current_yard_id, days_out, size_id');
      if (error) throw error;
      return data as AssetMarker[];
    },
  });
}

export function useRunCheckpoints(runId: string | null) {
  return useQuery({
    queryKey: ['run-checkpoints', runId],
    queryFn: async () => {
      if (!runId) return [];
      const { data, error } = await supabase
        .from('run_checkpoints')
        .select('*')
        .eq('run_id', runId)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!runId,
  });
}

/**
 * Camera Service — Fleet camera events, GPS traces, safety alerts
 */
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

// =====================================================
// TYPES
// =====================================================

export type CameraEventType =
  | 'COLLISION' | 'HARSH_BRAKE' | 'HARSH_ACCEL' | 'LANE_DEPARTURE'
  | 'DISTRACTED_DRIVING' | 'SPEEDING' | 'ROLLING_STOP' | 'TAILGATING'
  | 'CAMERA_OFFLINE' | 'MANUAL_TRIGGER' | 'UNKNOWN';

export type CameraEventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CameraEvent {
  id: string;
  run_id: string | null;
  truck_id: string;
  driver_id: string | null;
  provider_id: string | null;
  event_type: string;
  gps_lat: number | null;
  gps_lng: number | null;
  speed_mph: number | null;
  heading: number | null;
  video_url: string | null;
  thumbnail_url: string | null;
  severity: string;
  metadata: Record<string, unknown>;
  event_timestamp: string;
  created_at: string;
  trucks?: { truck_number: string; truck_type: string | null };
  drivers?: { name: string };
  runs?: { run_number: string | null; status: string };
}

export interface CameraClip {
  id: string;
  event_id: string;
  file_url: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  created_at: string;
}

export interface CameraProvider {
  id: string;
  name: string;
  api_base_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CameraAlertRule {
  id: string;
  event_type: string;
  severity: string;
  notify_dispatch: boolean;
  notify_safety: boolean;
  auto_create_issue: boolean;
  is_active: boolean;
}

// =====================================================
// SEVERITY CONFIG
// =====================================================

export const SEVERITY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  CRITICAL: { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🟠' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🟡' },
  LOW: { label: 'Low', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🔵' },
  INFO: { label: 'Info', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '⚪' },
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  COLLISION: 'Collision Detected',
  HARSH_BRAKE: 'Harsh Braking',
  HARSH_ACCEL: 'Harsh Acceleration',
  LANE_DEPARTURE: 'Lane Departure',
  DISTRACTED_DRIVING: 'Distracted Driving',
  SPEEDING: 'Speeding',
  ROLLING_STOP: 'Rolling Stop',
  TAILGATING: 'Tailgating',
  CAMERA_OFFLINE: 'Camera Offline',
  MANUAL_TRIGGER: 'Manual Trigger',
  UNKNOWN: 'Unknown Event',
};

// =====================================================
// QUERIES
// =====================================================

export async function getCameraEventsForTruck(
  truckId: string,
  filters?: { dateFrom?: string; dateTo?: string; eventType?: string; runId?: string }
): Promise<CameraEvent[]> {
  const query: AnyQuery = supabase.from('camera_events');
  let q = query
    .select('*, trucks(truck_number, truck_type), drivers:driver_id(name), runs:run_id(run_number, status)')
    .eq('truck_id', truckId)
    .order('event_timestamp', { ascending: false })
    .limit(200);

  if (filters?.dateFrom) q = q.gte('event_timestamp', filters.dateFrom);
  if (filters?.dateTo) q = q.lte('event_timestamp', filters.dateTo);
  if (filters?.eventType && filters.eventType !== 'ALL') q = q.eq('event_type', filters.eventType);
  if (filters?.runId) q = q.eq('run_id', filters.runId);

  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as CameraEvent[];
}

export async function getCameraEventsForRun(runId: string): Promise<CameraEvent[]> {
  const query: AnyQuery = supabase.from('camera_events');
  const { data, error } = await query
    .select('*, trucks(truck_number)')
    .eq('run_id', runId)
    .order('event_timestamp', { ascending: true });
  if (error) throw error;
  return (data || []) as CameraEvent[];
}

export async function getRecentCameraEvents(limit = 50): Promise<CameraEvent[]> {
  const query: AnyQuery = supabase.from('camera_events');
  const { data, error } = await query
    .select('*, trucks(truck_number, truck_type), drivers:driver_id(name), runs:run_id(run_number, status)')
    .order('event_timestamp', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as CameraEvent[];
}

export async function getCameraClipsForEvent(eventId: string): Promise<CameraClip[]> {
  const query: AnyQuery = supabase.from('camera_clips');
  const { data, error } = await query
    .select('*')
    .eq('event_id', eventId)
    .order('created_at');
  if (error) throw error;
  return (data || []) as CameraClip[];
}

export async function getCameraProviders(): Promise<CameraProvider[]> {
  const query: AnyQuery = supabase.from('camera_providers');
  const { data, error } = await query
    .select('id, name, api_base_url, is_active, created_at')
    .order('name');
  if (error) throw error;
  return (data || []) as CameraProvider[];
}

export async function getAlertRules(): Promise<CameraAlertRule[]> {
  const query: AnyQuery = supabase.from('camera_alert_rules');
  const { data, error } = await query
    .select('*')
    .order('event_type');
  if (error) throw error;
  return (data || []) as CameraAlertRule[];
}

// =====================================================
// GPS TRACE — Build polyline from camera events
// =====================================================

export interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: string;
  event_type: string;
  speed_mph: number | null;
}

export function buildGpsTrace(events: CameraEvent[]): GpsPoint[] {
  return events
    .filter(e => e.gps_lat && e.gps_lng)
    .map(e => ({
      lat: e.gps_lat!,
      lng: e.gps_lng!,
      timestamp: e.event_timestamp,
      event_type: e.event_type,
      speed_mph: e.speed_mph,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// =====================================================
// CAMERA STATS
// =====================================================

export async function getCameraStats(): Promise<{
  totalEvents: number;
  criticalToday: number;
  activeProviders: number;
  trucksWithCameras: number;
}> {
  const today = new Date().toISOString().split('T')[0];

  const [eventsRes, criticalRes, providersRes] = await Promise.all([
    (supabase.from('camera_events') as AnyQuery).select('id', { count: 'exact', head: true }),
    (supabase.from('camera_events') as AnyQuery)
      .select('id', { count: 'exact', head: true })
      .in('severity', ['CRITICAL', 'HIGH'])
      .gte('event_timestamp', today),
    (supabase.from('camera_providers') as AnyQuery)
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
  ]);

  return {
    totalEvents: eventsRes.count || 0,
    criticalToday: criticalRes.count || 0,
    activeProviders: providersRes.count || 0,
    trucksWithCameras: 0, // placeholder
  };
}

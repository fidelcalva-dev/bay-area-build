// Operational Time Calculator Service

import { supabase } from '@/integrations/supabase/client';
import type { 
  OperationalTimeRequest, 
  OperationalTimeResult,
  Yard,
  Facility 
} from '@/types/operationalTime';

export async function calculateOperationalTime(
  request: OperationalTimeRequest
): Promise<OperationalTimeResult> {
  const { data, error } = await supabase.functions.invoke('calculate-operational-time', {
    body: request,
  });

  if (error) {
    console.error('Operational time calculation error:', error);
    throw new Error(error.message || 'Failed to calculate operational time');
  }

  return data as OperationalTimeResult;
}

export async function getActiveYards(): Promise<Yard[]> {
  const { data, error } = await supabase
    .from('yards')
    .select('*')
    .eq('is_active', true)
    .order('priority_rank', { ascending: true });

  if (error) {
    console.error('Failed to fetch yards:', error);
    return [];
  }

  return data as Yard[];
}

export async function getActiveFacilities(): Promise<Facility[]> {
  const { data, error } = await supabase
    .from('facilities')
    .select('id, name, lat, lng, facility_type, accepted_material_classes, status')
    .eq('status', 'active');

  if (error) {
    console.error('Failed to fetch facilities:', error);
    return [];
  }

  return data as Facility[];
}

export async function getFacilitiesForMaterial(materialCategory: string): Promise<Facility[]> {
  const materialClasses = materialCategory === 'HEAVY' || materialCategory === 'DEBRIS_HEAVY'
    ? ['HEAVY_CLEAN_BASE', 'HEAVY_MIXED', 'HEAVY_PLUS_200']
    : ['MIXED_GENERAL'];

  const { data, error } = await supabase
    .from('facilities')
    .select('id, name, lat, lng, facility_type, accepted_material_classes, status')
    .eq('status', 'active')
    .overlaps('accepted_material_classes', materialClasses);

  if (error) {
    console.error('Failed to fetch facilities for material:', error);
    return [];
  }

  return data as Facility[];
}

// Format time in hours and minutes
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

// Get SLA class display info
export function getSlaClassInfo(slaClass: string): { label: string; color: string; bgColor: string } {
  switch (slaClass) {
    case 'FAST':
      return { label: 'Fast', color: 'text-green-700', bgColor: 'bg-green-100' };
    case 'STANDARD':
      return { label: 'Standard', color: 'text-blue-700', bgColor: 'bg-blue-100' };
    case 'LONG':
      return { label: 'Long', color: 'text-amber-700', bgColor: 'bg-amber-100' };
    default:
      return { label: 'Unknown', color: 'text-muted-foreground', bgColor: 'bg-muted' };
  }
}

// Get run recommendation display info
export function getRunRecommendationInfo(recommendation: string): { label: string; color: string } {
  switch (recommendation) {
    case 'SAME_DAY':
      return { label: 'Same Day Eligible', color: 'text-green-600' };
    case 'NEXT_DAY':
      return { label: 'Next Day', color: 'text-blue-600' };
    case 'SCHEDULED':
      return { label: 'Requires Scheduling', color: 'text-amber-600' };
    default:
      return { label: 'Unknown', color: 'text-muted-foreground' };
  }
}

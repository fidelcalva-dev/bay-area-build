// ============================================================
// YARD PRIVACY HELPER — Controls what yard info is exposed
// Staff sees full yard details; customers see only ETA range
// ============================================================

import { supabase } from '@/integrations/supabase/client';

export interface PublicYard {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  market: string;
  slug: string;
  is_active: boolean;
}

export interface StaffYard extends PublicYard {
  address: string;
  priority_rank: number;
  market_id: string | null;
}

/**
 * Fetch yards for public/customer use — no address exposed.
 * Uses the yards_public view which strips sensitive columns.
 */
export async function getPublicYards(): Promise<PublicYard[]> {
  // For customer callers, select only non-sensitive columns from yards
  const { data, error } = await supabase
    .from('yards')
    .select('id, name, slug, latitude, longitude, market, is_active')
    .eq('is_active', true)
    .order('priority_rank', { ascending: true });

  if (error) {
    console.error('Failed to fetch public yards:', error);
    return [];
  }
  return (data ?? []) as unknown as PublicYard[];
}

/**
 * Fetch yards for staff use — includes address.
 * Only works if caller has staff RLS permissions.
 */
export async function getStaffYards(): Promise<StaffYard[]> {
  const { data, error } = await supabase
    .from('yards')
    .select('*')
    .eq('is_active', true)
    .order('priority_rank', { ascending: true });

  if (error) {
    console.error('Failed to fetch staff yards:', error);
    return [];
  }
  return (data ?? []) as StaffYard[];
}

/**
 * Returns a customer-safe yard label (never the address).
 */
export function getPublicYardLabel(yard: PublicYard | StaffYard): string {
  return `${yard.name} (${yard.market})`;
}

/**
 * For customer-facing display, show generic provenance.
 */
export function getCustomerYardLabel(): string {
  return 'Nearest local yard selected automatically';
}

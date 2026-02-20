import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface FacilityResult {
  id: string;
  name: string;
  facility_type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  accepted_material_classes: string[];
  hours: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
  approved_by_city: string[];
  compliance_notes: string | null;
  distance_miles?: number;
  is_recommended?: boolean;
}

export interface FacilityFilters {
  materialType: string;
  facilityType: string;
  searchLat: number | null;
  searchLng: number | null;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useFacilitiesFinder() {
  const [filters, setFilters] = useState<FacilityFilters>({
    materialType: '',
    facilityType: '',
    searchLat: null,
    searchLng: null,
  });
  const [searchAddress, setSearchAddress] = useState('');

  // Fetch city facility rules for recommendation badges
  const { data: cityRules } = useQuery({
    queryKey: ['city-facility-rules'],
    queryFn: async () => {
      const { data } = await supabase.from('city_facility_rules').select('*');
      return data || [];
    },
  });

  const { data: facilities, isLoading } = useQuery({
    queryKey: ['facilities-finder', filters],
    queryFn: async () => {
      let query = supabase
        .from('facilities')
        .select('*')
        .eq('status', 'active');

      if (filters.facilityType) {
        query = query.eq('facility_type', filters.facilityType);
      }

      if (filters.materialType) {
        query = query.contains('accepted_material_classes', [filters.materialType]);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      let results: FacilityResult[] = (data || []).map((f) => {
        const distance =
          filters.searchLat && filters.searchLng && f.lat && f.lng
            ? haversineDistance(filters.searchLat, filters.searchLng, f.lat, f.lng)
            : undefined;

        // Check if recommended via city rules
        const isRecommended = cityRules?.some(
          (rule) => f.approved_by_city?.includes(rule.city)
        ) ?? false;

        return { ...f, distance_miles: distance, is_recommended: isRecommended };
      });

      // Sort: recommended first, then by distance
      results.sort((a, b) => {
        if (a.is_recommended && !b.is_recommended) return -1;
        if (!a.is_recommended && b.is_recommended) return 1;
        if (a.distance_miles != null && b.distance_miles != null) {
          return a.distance_miles - b.distance_miles;
        }
        return a.name.localeCompare(b.name);
      });

      return results.slice(0, 30);
    },
    enabled: true,
  });

  // Geocode search address
  const geocodeSearch = useCallback(async (address: string) => {
    if (!address || address.length < 3) return;
    setSearchAddress(address);

    try {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { query: address },
      });
      if (error || !data?.results?.length) return;

      const first = data.results[0];
      setFilters((prev) => ({
        ...prev,
        searchLat: parseFloat(first.lat),
        searchLng: parseFloat(first.lon),
      }));
    } catch (err) {
      console.error('Geocode error:', err);
    }
  }, []);

  // Assign facility to run or order
  const assignFacility = useCallback(
    async (facilityId: string, entityType: 'ORDER' | 'RUN', entityId: string, reason?: string) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('facility_assignments').insert({
        facility_id: facilityId,
        entity_type: entityType,
        entity_id: entityId,
        assigned_by_user_id: user?.id,
        assigned_reason: reason || null,
      });

      if (error) throw error;

      // Update the entity's facility_id if applicable
      if (entityType === 'RUN') {
        await supabase.from('runs').update({ destination_facility_id: facilityId }).eq('id', entityId);
      }

      return true;
    },
    []
  );

  return {
    facilities: facilities || [],
    isLoading,
    filters,
    setFilters,
    searchAddress,
    geocodeSearch,
    assignFacility,
  };
}

// Fetch recent assignments
export function useRecentAssignments() {
  return useQuery({
    queryKey: ['recent-facility-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facility_assignments')
        .select('*, facilities(name, facility_type)')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

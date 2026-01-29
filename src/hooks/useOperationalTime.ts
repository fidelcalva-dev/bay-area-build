// Hook for Operational Time Calculator

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  calculateOperationalTime, 
  getActiveYards,
  getActiveFacilities,
  getFacilitiesForMaterial
} from '@/services/operationalTimeService';
import type { 
  OperationalTimeRequest, 
  OperationalTimeResult,
  ServiceType,
  MaterialCategory 
} from '@/types/operationalTime';

export function useOperationalTimeCalculation() {
  const [result, setResult] = useState<OperationalTimeResult | null>(null);

  const mutation = useMutation({
    mutationFn: calculateOperationalTime,
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      console.error('Operational time calculation failed:', error);
    },
  });

  const calculate = useCallback((request: OperationalTimeRequest) => {
    mutation.mutate(request);
  }, [mutation]);

  const reset = useCallback(() => {
    setResult(null);
    mutation.reset();
  }, [mutation]);

  return {
    result,
    calculate,
    reset,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useYards() {
  return useQuery({
    queryKey: ['yards-active'],
    queryFn: getActiveYards,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFacilities() {
  return useQuery({
    queryKey: ['facilities-active'],
    queryFn: getActiveFacilities,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacilitiesForMaterial(materialCategory: MaterialCategory | null) {
  return useQuery({
    queryKey: ['facilities-for-material', materialCategory],
    queryFn: () => getFacilitiesForMaterial(materialCategory || 'DEBRIS'),
    enabled: !!materialCategory,
    staleTime: 5 * 60 * 1000,
  });
}

// Helper to build request from order/quote data
export function buildOperationalTimeRequest(params: {
  yardId: string;
  destinationAddress?: string;
  destinationLat?: number;
  destinationLng?: number;
  serviceType: ServiceType;
  materialCategory: MaterialCategory;
  facilityId?: string;
  dumpsterSize?: number;
}): OperationalTimeRequest {
  return {
    origin_yard_id: params.yardId,
    destination_address: params.destinationAddress,
    destination_lat: params.destinationLat,
    destination_lng: params.destinationLng,
    service_type: params.serviceType,
    material_category: params.materialCategory,
    disposal_facility_id: params.facilityId,
    dumpster_size: params.dumpsterSize,
    traffic_mode: 'AVERAGE',
  };
}

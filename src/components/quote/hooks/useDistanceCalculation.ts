// Hook for distance-based pricing calculation
// Fetches yards, geocodes ZIP, calculates distance, and determines pricing adjustment

import { useState, useEffect, useCallback } from 'react';
import {
  geocodeZip,
  fetchYards,
  fetchDistanceBrackets,
  findNearestYard,
  getDistanceBracket,
  type Yard,
  type DistanceBracket,
  type GeocodingResult,
  type DistanceResult,
} from '@/lib/distanceService';

export interface DistanceState {
  isLoading: boolean;
  error: string | null;
  geocoding: GeocodingResult | null;
  distance: DistanceResult | null;
  yards: Yard[];
  brackets: DistanceBracket[];
}

/**
 * Hook to calculate distance-based pricing from a ZIP code
 */
export function useDistanceCalculation(zip: string, overrideLat?: number, overrideLng?: number) {
  const [state, setState] = useState<DistanceState>({
    isLoading: false,
    error: null,
    geocoding: null,
    distance: null,
    yards: [],
    brackets: [],
  });

  // Load yards and brackets on mount
  useEffect(() => {
    async function loadStaticData() {
      const [yards, brackets] = await Promise.all([
        fetchYards(),
        fetchDistanceBrackets(),
      ]);
      setState(prev => ({ ...prev, yards, brackets }));
    }
    loadStaticData();
  }, []);

  // Calculate distance when ZIP changes
  useEffect(() => {
    if (state.yards.length === 0) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        geocoding: null,
        distance: null,
        error: null,
      }));
      return;
    }

    // If we have override coordinates, skip ZIP geocoding
    const hasOverride = overrideLat != null && overrideLng != null;
    if (!hasOverride && zip.length !== 5) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        geocoding: null,
        distance: null,
        error: null,
      }));
      return;
    }

    async function calculate() {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Use override coordinates or geocode ZIP
        let geocoding: GeocodingResult;
        if (hasOverride) {
          geocoding = { success: true, lat: overrideLat!, lng: overrideLng!, displayName: '' };
        } else {
          geocoding = await geocodeZip(zip);
        }
        
        if (!geocoding.success) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            geocoding: null,
            distance: null,
            error: 'Could not locate this ZIP code',
          }));
          return;
        }

        // Find nearest yard (Haversine for initial selection)
        const nearestResult = findNearestYard(
          geocoding.lat,
          geocoding.lng,
          state.yards
        );

        if (!nearestResult) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            geocoding,
            distance: null,
            error: 'No yards available',
          }));
          return;
        }

        const { yard, distance: haversineDistance } = nearestResult;
        
        // Try truck-aware routing via edge function
        let truckRoute: {
          distanceMiles: number;
          durationMinutes: number;
          durationTrafficMin: number;
          durationTrafficMax: number;
          polyline: string;
          provider: 'google_routes' | 'haversine_fallback';
        } | null = null;

        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const response = await supabase.functions.invoke('truck-route', {
            body: {
              originLat: yard.latitude,
              originLng: yard.longitude,
              destinationLat: geocoding.lat,
              destinationLng: geocoding.lng,
              yardName: yard.name,
            },
          });

          if (response.data?.success) {
            truckRoute = {
              distanceMiles: response.data.distanceMiles,
              durationMinutes: response.data.durationMinutes,
              durationTrafficMin: response.data.durationTrafficMin,
              durationTrafficMax: response.data.durationTrafficMax,
              polyline: response.data.polyline || '',
              provider: response.data.provider,
            };
          }
        } catch (routeError) {
          console.error('Truck route API error, using Haversine fallback:', routeError);
        }

        // Use truck route data if available, otherwise Haversine fallback
        const finalDistance = truckRoute?.distanceMiles ?? Math.round(haversineDistance * 100) / 100;
        const finalMinutes = truckRoute?.durationMinutes ?? Math.round(haversineDistance * 2.5);
        const bracket = getDistanceBracket(finalDistance, state.brackets);

        const distanceResult: DistanceResult = {
          distanceMiles: finalDistance,
          distanceMinutes: finalMinutes,
          durationTrafficMin: truckRoute?.durationTrafficMin ?? Math.round(finalMinutes * 0.85),
          durationTrafficMax: truckRoute?.durationTrafficMax ?? Math.round(finalMinutes * 1.25),
          polyline: truckRoute?.polyline,
          routingProvider: truckRoute?.provider ?? 'haversine_fallback',
          yard,
          bracket,
          priceAdjustment: bracket?.priceAdjustment || 0,
          requiresReview: bracket?.requiresReview || finalDistance > 25,
        };

        setState(prev => ({
          ...prev,
          isLoading: false,
          geocoding,
          distance: distanceResult,
          error: null,
        }));
      } catch (err) {
        console.error('Distance calculation error:', err);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to calculate distance',
        }));
      }
    }

    calculate();
  }, [zip, overrideLat, overrideLng, state.yards, state.brackets]);

  // Recalculate function for manual refresh
  const recalculate = useCallback(async () => {
    if (zip.length !== 5) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    const geocoding = await geocodeZip(zip);
    if (!geocoding.success || state.yards.length === 0) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const nearestResult = findNearestYard(geocoding.lat, geocoding.lng, state.yards);
    if (!nearestResult) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const { yard, distance } = nearestResult;
    const bracket = getDistanceBracket(distance, state.brackets);

    setState(prev => ({
      ...prev,
      isLoading: false,
      geocoding,
      distance: {
        distanceMiles: Math.round(distance * 100) / 100,
        distanceMinutes: Math.round(distance * 2.5),
        yard,
        bracket,
        priceAdjustment: bracket?.priceAdjustment || 0,
        requiresReview: bracket?.requiresReview || distance > 25,
      },
    }));
  }, [zip, state.yards, state.brackets]);

  return {
    ...state,
    recalculate,
  };
}

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
export function useDistanceCalculation(zip: string) {
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
    if (zip.length !== 5 || state.yards.length === 0) {
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
        // Geocode the ZIP
        const geocoding = await geocodeZip(zip);
        
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

        // Find nearest yard
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

        const { yard, distance } = nearestResult;
        const bracket = getDistanceBracket(distance, state.brackets);

        // Estimate driving time
        const estimatedMinutes = Math.round(distance * 2.5);

        const distanceResult: DistanceResult = {
          distanceMiles: Math.round(distance * 100) / 100,
          distanceMinutes: estimatedMinutes,
          yard,
          bracket,
          priceAdjustment: bracket?.priceAdjustment || 0,
          requiresReview: bracket?.requiresReview || distance > 25,
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
  }, [zip, state.yards, state.brackets]);

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

// Hook for Heavy Material Data and Calculations
import { useState, useEffect, useMemo } from 'react';
import {
  fetchHeavyMaterialProfiles,
  fetchWeightRulesForSize,
  estimateHeavyWeight,
  enforceFillLimit,
  buildHeavyQuoteData,
  getWeightWarningMessage,
  getHeavyEducationText,
  type HeavyMaterialProfile,
  type HeavyWeightRule,
  type WeightEstimation,
  type HeavyQuoteData,
  HEAVY_SIZES,
} from '@/lib/heavyMaterialService';

interface UseHeavyMaterialsOptions {
  sizeYd?: number;
  materialCode?: string | null;
  fillPct?: number;
  requestGreenHalo?: boolean;
}

interface UseHeavyMaterialsReturn {
  // Data
  profiles: HeavyMaterialProfile[];
  selectedProfile: HeavyMaterialProfile | null;
  weightRules: HeavyWeightRule[];
  isLoading: boolean;
  error: string | null;
  
  // Calculations
  estimation: WeightEstimation | null;
  quoteData: HeavyQuoteData;
  warning: { message: string; severity: 'info' | 'warning' | 'error' } | null;
  educationText: string | null;
  
  // Fill enforcement
  enforcedFillPct: number;
  fillWasEnforced: boolean;
  fillEnforcementMessage: string | null;
  
  // Helpers
  isHeavySize: boolean;
  allowedSizes: readonly number[];
}

export function useHeavyMaterials({
  sizeYd = 10,
  materialCode = null,
  fillPct = 1.0,
  requestGreenHalo = false,
}: UseHeavyMaterialsOptions = {}): UseHeavyMaterialsReturn {
  const [profiles, setProfiles] = useState<HeavyMaterialProfile[]>([]);
  const [weightRules, setWeightRules] = useState<HeavyWeightRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profiles on mount
  useEffect(() => {
    async function loadProfiles() {
      try {
        const data = await fetchHeavyMaterialProfiles();
        setProfiles(data);
        setError(null);
      } catch (err) {
        setError('Failed to load heavy material profiles');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfiles();
  }, []);

  // Fetch weight rules when size changes
  useEffect(() => {
    async function loadRules() {
      if (HEAVY_SIZES.includes(sizeYd as (typeof HEAVY_SIZES)[number])) {
        try {
          const data = await fetchWeightRulesForSize(sizeYd);
          setWeightRules(data);
        } catch (err) {
          console.error('Failed to load weight rules:', err);
        }
      }
    }
    loadRules();
  }, [sizeYd]);

  // Find selected profile
  const selectedProfile = useMemo(() => {
    if (!materialCode) return null;
    return profiles.find(p => p.material_code === materialCode) || null;
  }, [profiles, materialCode]);

  // Enforce fill limit
  const { enforcedFillPct, fillWasEnforced, fillEnforcementMessage } = useMemo(() => {
    if (!selectedProfile) {
      return { enforcedFillPct: fillPct, fillWasEnforced: false, fillEnforcementMessage: null };
    }
    const result = enforceFillLimit(selectedProfile, fillPct);
    return {
      enforcedFillPct: result.fillPct,
      fillWasEnforced: result.wasEnforced,
      fillEnforcementMessage: result.message || null,
    };
  }, [selectedProfile, fillPct]);

  // Calculate estimation
  const estimation = useMemo(() => {
    if (!selectedProfile) return null;
    return estimateHeavyWeight(sizeYd, selectedProfile, enforcedFillPct);
  }, [selectedProfile, sizeYd, enforcedFillPct]);

  // Build quote data
  const quoteData = useMemo(() => {
    return buildHeavyQuoteData(selectedProfile, sizeYd, enforcedFillPct, requestGreenHalo);
  }, [selectedProfile, sizeYd, enforcedFillPct, requestGreenHalo]);

  // Get warning message
  const warning = useMemo(() => {
    if (!estimation) return null;
    return getWeightWarningMessage(estimation.riskLevel, estimation.weightMinTons, estimation.weightMaxTons);
  }, [estimation]);

  // Get education text
  const educationText = useMemo(() => {
    if (!selectedProfile) return null;
    return getHeavyEducationText(selectedProfile, sizeYd);
  }, [selectedProfile, sizeYd]);

  // Check if current size is heavy-compatible
  const isHeavySize = HEAVY_SIZES.includes(sizeYd as (typeof HEAVY_SIZES)[number]);

  return {
    profiles,
    selectedProfile,
    weightRules,
    isLoading,
    error,
    estimation,
    quoteData,
    warning,
    educationText,
    enforcedFillPct,
    fillWasEnforced,
    fillEnforcementMessage,
    isHeavySize,
    allowedSizes: HEAVY_SIZES,
  };
}

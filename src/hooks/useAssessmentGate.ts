// Assessment Gate Hook
// Evaluates whether the current quote context triggers a "Project Size Assessment" gate
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AssessmentGateConfig {
  mode: 'OFF' | 'RECOMMEND' | 'REQUIRE';
  minConfidenceToSkip: number;
  requireForHeavy: boolean;
  requireForMixed: boolean;
  requireForLowConfidence: boolean;
  requireForLargeSizes: boolean;
  largeSizeThreshold: number;
  allowStaffOverride: boolean;
}

export interface GateTriggerResult {
  triggered: boolean;
  reasons: string[];
  mode: 'OFF' | 'RECOMMEND' | 'REQUIRE';
  config: AssessmentGateConfig;
}

interface GateInput {
  materialCategory?: string | null;
  selectedSize?: number | null;
  heavyFlag?: boolean | null;
  assessmentConfidence?: number | null;
  hasAssessment?: boolean;
  riskBand?: string | null;
}

const DEFAULT_CONFIG: AssessmentGateConfig = {
  mode: 'RECOMMEND',
  minConfidenceToSkip: 0.70,
  requireForHeavy: true,
  requireForMixed: true,
  requireForLowConfidence: true,
  requireForLargeSizes: true,
  largeSizeThreshold: 30,
  allowStaffOverride: true,
};

export function useAssessmentGate(input: GateInput) {
  const [config, setConfig] = useState<AssessmentGateConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // Load config from config_settings
  useEffect(() => {
    async function loadConfig() {
      try {
        const { data } = await supabase
          .from('config_settings')
          .select('key, value')
          .eq('category', 'assessment');

        if (data && data.length > 0) {
          const cfg = { ...DEFAULT_CONFIG };
          for (const row of data) {
            const val = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
            const parsed = (() => { try { return JSON.parse(val); } catch { return val; } })();
            switch (row.key) {
              case 'assessment.mode': cfg.mode = parsed; break;
              case 'assessment.min_confidence_to_skip': cfg.minConfidenceToSkip = Number(parsed); break;
              case 'assessment.require_for_heavy': cfg.requireForHeavy = parsed === true || parsed === 'true'; break;
              case 'assessment.require_for_mixed': cfg.requireForMixed = parsed === true || parsed === 'true'; break;
              case 'assessment.require_for_low_confidence': cfg.requireForLowConfidence = parsed === true || parsed === 'true'; break;
              case 'assessment.require_for_large_sizes': cfg.requireForLargeSizes = parsed === true || parsed === 'true'; break;
              case 'assessment.large_size_threshold': cfg.largeSizeThreshold = Number(parsed); break;
              case 'assessment.allow_staff_override': cfg.allowStaffOverride = parsed === true || parsed === 'true'; break;
            }
          }
          setConfig(cfg);
        }
      } catch (err) {
        console.error('[AssessmentGate] Config load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const evaluate = useCallback((): GateTriggerResult => {
    if (config.mode === 'OFF') {
      return { triggered: false, reasons: [], mode: 'OFF', config };
    }

    // If assessment already done with sufficient confidence, skip gate
    if (input.hasAssessment && input.assessmentConfidence != null && input.assessmentConfidence >= config.minConfidenceToSkip) {
      return { triggered: false, reasons: [], mode: config.mode, config };
    }

    const reasons: string[] = [];

    // A) Heavy material
    if (config.requireForHeavy && input.heavyFlag) {
      reasons.push('Heavy materials detected (concrete, dirt, asphalt, brick)');
    }

    // B) Mixed or unknown material
    if (config.requireForMixed && input.materialCategory) {
      const mat = input.materialCategory.toUpperCase();
      if (mat.includes('MIXED') || mat === 'UNKNOWN' || mat === 'GENERAL_DEBRIS') {
        reasons.push('Mixed or general debris material selected');
      }
    }

    // C) Large size
    if (config.requireForLargeSizes && input.selectedSize && input.selectedSize >= config.largeSizeThreshold) {
      reasons.push(`Large container size selected (${input.selectedSize} yards)`);
    }

    // D) Low confidence on existing assessment
    if (config.requireForLowConfidence && input.hasAssessment && input.assessmentConfidence != null && input.assessmentConfidence < config.minConfidenceToSkip) {
      reasons.push('Previous assessment had low confidence');
    }

    // E) Risk band
    if (input.riskBand === 'RED' || input.riskBand === 'AMBER') {
      reasons.push(`Account risk level: ${input.riskBand}`);
    }

    return {
      triggered: reasons.length > 0,
      reasons,
      mode: config.mode,
      config,
    };
  }, [config, input]);

  return { evaluate, config, loading };
}

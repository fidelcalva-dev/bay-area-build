import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ConfidenceLevel = 'high' | 'medium' | 'limited' | 'unknown';

export interface AvailabilityResult {
  confidence: ConfidenceLevel;
  availableCount: number;
  sameDayLikely: boolean;
  loading: boolean;
}

// Size value → dumpster_sizes.size_value mapping
const SIZE_TO_VALUE: Record<number, number> = {
  5: 5, 8: 8, 10: 10, 20: 20, 30: 30, 40: 40, 50: 50,
};

const HIGH_THRESHOLD = 4;
const MEDIUM_THRESHOLD = 1;
const SAME_DAY_CUTOFF_HOUR = 12; // noon local

export function useAvailabilityConfidence(
  yardId: string | null | undefined,
  sizeYd: number,
): AvailabilityResult {
  const [result, setResult] = useState<AvailabilityResult>({
    confidence: 'unknown',
    availableCount: 0,
    sameDayLikely: false,
    loading: false,
  });

  useEffect(() => {
    if (!yardId) {
      setResult({ confidence: 'unknown', availableCount: 0, sameDayLikely: false, loading: false });
      return;
    }

    let cancelled = false;
    setResult((r) => ({ ...r, loading: true }));

    (async () => {
      try {
        // Get size_id for the requested size
        const { data: sizeRow } = await supabase
          .from('dumpster_sizes')
          .select('id')
          .eq('size_value', SIZE_TO_VALUE[sizeYd] ?? sizeYd)
          .maybeSingle();

        if (cancelled) return;

        let availableCount = 0;

        if (sizeRow) {
          const { count } = await supabase
            .from('assets_dumpsters')
            .select('id', { count: 'exact', head: true })
            .eq('current_yard_id', yardId)
            .eq('asset_status', 'available')
            .eq('size_id', sizeRow.id);

          if (cancelled) return;
          availableCount = count ?? 0;
        } else {
          // Fallback: count all available at yard
          const { count } = await supabase
            .from('assets_dumpsters')
            .select('id', { count: 'exact', head: true })
            .eq('current_yard_id', yardId)
            .eq('asset_status', 'available');

          if (cancelled) return;
          availableCount = count ?? 0;
        }

        const now = new Date();
        const currentHour = now.getHours();
        const withinCutoff = currentHour < SAME_DAY_CUTOFF_HOUR;

        let confidence: ConfidenceLevel;
        if (availableCount >= HIGH_THRESHOLD) {
          confidence = 'high';
        } else if (availableCount >= MEDIUM_THRESHOLD) {
          confidence = 'medium';
        } else {
          confidence = 'limited';
        }

        const sameDayLikely = confidence === 'high' && withinCutoff;

        if (!cancelled) {
          setResult({ confidence, availableCount, sameDayLikely, loading: false });
        }
      } catch {
        if (!cancelled) {
          setResult({ confidence: 'unknown', availableCount: 0, sameDayLikely: false, loading: false });
        }
      }
    })();

    return () => { cancelled = true; };
  }, [yardId, sizeYd]);

  return result;
}

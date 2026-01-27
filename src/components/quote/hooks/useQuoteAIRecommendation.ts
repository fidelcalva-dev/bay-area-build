// ============================================================
// USE QUOTE AI RECOMMENDATION HOOK
// Calls quote-ai-recommend edge function with session caching
// Supports DRY_RUN, LIVE_SOFT, LIVE modes for controlled rollout
// ============================================================
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AIRecommendationInput, AIRecommendationOutput } from '../types/aiRecommendation';
import { DEFAULT_AI_RECOMMENDATION } from '../types/aiRecommendation';
import type { ItemSelection } from './useDisposalItemCatalog';
import { getConfig, type QuoteAIMode } from '@/lib/configService';
import { analytics } from '@/lib/analytics';

interface UseQuoteAIRecommendationOptions {
  zip: string;
  marketCode: string | null;
  yardId: string | null;
  availableSizes: number[];
  customerType?: 'homeowner' | 'contractor' | 'commercial' | 'unknown';
  recyclingReceiptRequired?: boolean;
}

interface UseQuoteAIRecommendationResult {
  recommendation: AIRecommendationOutput;
  isLoading: boolean;
  error: string | null;
  mode: QuoteAIMode;
  shouldPreselect: boolean;
  fetchRecommendation: (selections: ItemSelection[]) => Promise<void>;
  clearCache: () => void;
  trackAccept: (size: number, wasPreselected: boolean) => void;
  trackChange: (selectedSize: number, reason: string) => void;
}

// Session cache for recommendations
const recommendationCache = new Map<string, AIRecommendationOutput>();

function generateCacheKey(options: UseQuoteAIRecommendationOptions, selections: ItemSelection[]): string {
  const selectionKey = selections
    .map(s => `${s.itemCode}:${s.quantity}`)
    .sort()
    .join(',');
  return `${options.zip}|${options.marketCode}|${selectionKey}`;
}

export function useQuoteAIRecommendation(
  options: UseQuoteAIRecommendationOptions
): UseQuoteAIRecommendationResult {
  const [recommendation, setRecommendation] = useState<AIRecommendationOutput>(DEFAULT_AI_RECOMMENDATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<QuoteAIMode>('DRY_RUN');
  const abortControllerRef = useRef<AbortController | null>(null);
  const recommendationShownAtRef = useRef<number>(0);

  // Load config mode on mount
  useEffect(() => {
    async function loadMode() {
      try {
        const configMode = await getConfig('quote_ai.mode');
        setMode(configMode);
      } catch {
        // Default to DRY_RUN if config fails
        setMode('DRY_RUN');
      }
    }
    loadMode();
  }, []);

  // Determine if preselection is enabled based on mode
  const shouldPreselect = mode === 'LIVE_SOFT' || mode === 'LIVE';

  const fetchRecommendation = useCallback(async (selections: ItemSelection[]) => {
    // Early return if no selections
    if (selections.length === 0) {
      setRecommendation(DEFAULT_AI_RECOMMENDATION);
      return;
    }

    // Check cache
    const cacheKey = generateCacheKey(options, selections);
    const cached = recommendationCache.get(cacheKey);
    if (cached) {
      setRecommendation(cached);
      recommendationShownAtRef.current = Date.now();
      
      // Track recommendation shown from cache
      analytics.aiRecommendationShown(
        cached.recommended_size_yd,
        cached.category,
        cached.confidence_score,
        mode
      );
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const input: AIRecommendationInput = {
        zip: options.zip,
        market_code: options.marketCode,
        yard_id: options.yardId,
        available_sizes: options.availableSizes,
        customer_type_detected: options.customerType || 'unknown',
        selected_chips: selections.map(s => ({
          code: s.itemCode,
          quantity: s.quantity,
        })),
        recycling_receipt_required: options.recyclingReceiptRequired,
      };

      const { data, error: fnError } = await supabase.functions.invoke('quote-ai-recommend', {
        body: input,
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to get recommendation');
      }

      if (data) {
        const result = data as AIRecommendationOutput;
        setRecommendation(result);
        recommendationCache.set(cacheKey, result);
        recommendationShownAtRef.current = Date.now();

        // Track recommendation shown
        analytics.aiRecommendationShown(
          result.recommended_size_yd,
          result.category,
          result.confidence_score,
          mode
        );

        // Track preselection in LIVE modes
        if (shouldPreselect) {
          analytics.aiRecommendationPreselected(result.recommended_size_yd, mode);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      console.error('[useQuoteAIRecommendation] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to default recommendation
      setRecommendation(DEFAULT_AI_RECOMMENDATION);
    } finally {
      setIsLoading(false);
    }
  }, [options, mode, shouldPreselect]);

  // Track when user accepts recommendation
  const trackAccept = useCallback((size: number, wasPreselected: boolean) => {
    const timeToDecision = Date.now() - recommendationShownAtRef.current;
    analytics.aiRecommendationAccepted(size, wasPreselected, timeToDecision);
  }, []);

  // Track when user changes from recommendation
  const trackChange = useCallback((selectedSize: number, reason: string) => {
    const recommendedSize = recommendation.recommended_size_yd;
    analytics.aiRecommendationChanged(recommendedSize, selectedSize, reason);
    
    if (selectedSize !== recommendedSize) {
      analytics.aiSizeOverride(recommendedSize, selectedSize, selectedSize < recommendedSize);
    }
  }, [recommendation.recommended_size_yd]);

  const clearCache = useCallback(() => {
    recommendationCache.clear();
    setRecommendation(DEFAULT_AI_RECOMMENDATION);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    recommendation,
    isLoading,
    error,
    mode,
    shouldPreselect,
    fetchRecommendation,
    clearCache,
    trackAccept,
    trackChange,
  };
}

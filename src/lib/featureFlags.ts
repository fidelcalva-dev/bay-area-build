// ============================================================
// FEATURE FLAGS - Safe rollout of v2 Uber-like experience
// ============================================================
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlags {
  // Public theme v2 (Uber-like design)
  'public_theme.v2_uber': boolean;
  // Quote flow v2 (minimal 6-step)
  'quote_flow.v2_minimal': boolean;
  // Quote flow v3 (Uber-style project cards)
  'quote_flow.v3': boolean;
  // Portal tracking features
  'portal.tracking_enabled': boolean;
  // Portal placement tool
  'portal.placement_enabled': boolean;
  // Preview mode for internal testing
  'preview.enabled': boolean;
  // AI Homepage chat hero
  'ai_home.enabled': boolean;
  // AI Homepage photo upload
  'ai_home.photo_upload.enabled': boolean;
  // AI Homepage booking + payment
  'ai_home.booking.enabled': boolean;
  // AI Homepage contractor fast mode
  'ai_home.contractor_mode.enabled': boolean;
  // AI Homepage placement tool
  'ai_home.placement.enabled': boolean;
}

// Default values - all off by default for safety
const DEFAULT_FLAGS: FeatureFlags = {
  'public_theme.v2_uber': false,
  'quote_flow.v2_minimal': false,
  'quote_flow.v3': false,
  'portal.tracking_enabled': true, // Tracking already working
  'portal.placement_enabled': true, // Placement already working
  'preview.enabled': true, // Allow internal preview
  'ai_home.enabled': false,
  'ai_home.photo_upload.enabled': false,
  'ai_home.booking.enabled': false,
  'ai_home.contractor_mode.enabled': false,
  'ai_home.placement.enabled': false,
};

let cachedFlags: FeatureFlags | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Fetch feature flags from config_settings table
 */
export async function fetchFeatureFlags(): Promise<FeatureFlags> {
  const now = Date.now();
  
  // Return cached if fresh
  if (cachedFlags && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedFlags;
  }

  try {
    const { data, error } = await supabase
      .from('config_settings')
      .select('key, value')
      .like('key', 'feature.%');

    if (error) {
      console.error('Failed to fetch feature flags:', error);
      return { ...DEFAULT_FLAGS };
    }

    const flags = { ...DEFAULT_FLAGS };
    
    for (const row of data || []) {
      const flagKey = row.key.replace('feature.', '') as keyof FeatureFlags;
      if (flagKey in flags) {
        // Parse JSON value
        try {
          flags[flagKey] = JSON.parse(row.value as string);
        } catch {
          flags[flagKey] = row.value === 'true';
        }
      }
    }

    cachedFlags = flags;
    cacheTimestamp = now;
    return flags;
  } catch (err) {
    console.error('Feature flags fetch error:', err);
    return { ...DEFAULT_FLAGS };
  }
}

/**
 * Check a single feature flag (sync - uses cache)
 */
export function getFeatureFlag(key: keyof FeatureFlags): boolean {
  if (cachedFlags) {
    return cachedFlags[key] ?? DEFAULT_FLAGS[key];
  }
  return DEFAULT_FLAGS[key];
}

/**
 * Check if preview mode is active (URL-based override)
 */
export function isPreviewMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/preview/');
}

/**
 * Hook to check if v2 theme should be active
 */
export function shouldUseV2Theme(): boolean {
  // Preview routes always use v2
  if (isPreviewMode()) return true;
  return getFeatureFlag('public_theme.v2_uber');
}

/**
 * Hook to check if v2 quote flow should be active
 */
export function shouldUseV2QuoteFlow(): boolean {
  if (isPreviewMode()) return true;
  return getFeatureFlag('quote_flow.v2_minimal');
}

/**
 * Hook to check if v3 quote flow should be active
 */
export function shouldUseV3QuoteFlow(): boolean {
  if (isPreviewMode()) return true;
  return getFeatureFlag('quote_flow.v3');
}

/**
 * Update a feature flag (admin only)
 */
export async function updateFeatureFlag(
  key: keyof FeatureFlags,
  value: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // First try to update existing
    const { data: existing } = await supabase
      .from('config_settings')
      .select('id')
      .eq('key', `feature.${key}`)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('config_settings')
        .update({
          value: JSON.stringify(value),
          updated_at: new Date().toISOString(),
        })
        .eq('key', `feature.${key}`);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('config_settings')
        .insert({
          key: `feature.${key}`,
          value: JSON.stringify(value),
          category: 'feature',
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    // Invalidate cache
    cachedFlags = null;
    cacheTimestamp = 0;

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Check if AI homepage should be active
 */
export function shouldUseAIHome(): boolean {
  if (isPreviewMode()) return true;
  return getFeatureFlag('ai_home.enabled');
}

/**
 * Initialize feature flags on app load
 */
export async function initializeFeatureFlags(): Promise<void> {
  await fetchFeatureFlags();
}

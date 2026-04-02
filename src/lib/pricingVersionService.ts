/**
 * Pricing Version Service — Manages draft/publish lifecycle
 */
import { supabase } from '@/integrations/supabase/client';
import { compilePriceCatalog, checkPublicCatalogHealth } from './pricingCatalogCompiler';
import { invalidatePublicPricingCache } from './publicPricingService';

export interface PricingVersion {
  id: string;
  version_code: string;
  status: 'draft' | 'pending_approval' | 'published' | 'archived';
  effective_from: string | null;
  effective_to: string | null;
  created_by: string | null;
  approved_by: string | null;
  published_at: string | null;
  archived_at: string | null;
  notes: string | null;
  created_at: string;
}

export async function fetchVersions(): Promise<PricingVersion[]> {
  const { data, error } = await supabase
    .from('pricing_versions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as PricingVersion[];
}

export async function getPublishedVersion(): Promise<PricingVersion | null> {
  const { data } = await supabase
    .from('pricing_versions')
    .select('*')
    .eq('status', 'published')
    .maybeSingle();
  return data as PricingVersion | null;
}

export async function createDraftVersion(
  versionCode: string,
  notes: string,
  createdBy?: string,
): Promise<PricingVersion | null> {
  const { data, error } = await supabase
    .from('pricing_versions')
    .insert({
      version_code: versionCode,
      status: 'draft',
      notes,
      created_by: createdBy || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create draft:', error);
    return null;
  }
  return data as PricingVersion;
}

export async function publishVersion(
  versionId: string,
  approvedBy?: string,
): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // 1. Archive current published version
    const { data: currentPublished } = await supabase
      .from('pricing_versions')
      .select('id')
      .eq('status', 'published')
      .maybeSingle();

    if (currentPublished && currentPublished.id !== versionId) {
      await supabase
        .from('pricing_versions')
        .update({ status: 'archived', archived_at: new Date().toISOString() })
        .eq('id', currentPublished.id);
    }

    // 2. Compile public catalog
    const compileResult = await compilePriceCatalog(versionId);
    if (!compileResult.success) {
      errors.push(...compileResult.errors);
    }
    warnings.push(...compileResult.warnings);

    // 3. Run health check
    const health = await checkPublicCatalogHealth();
    if (!health.healthy) {
      warnings.push(...health.issues);
    }

    // 4. Mark version as published
    await supabase
      .from('pricing_versions')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        approved_by: approvedBy || null,
      })
      .eq('id', versionId);

    // 5. Invalidate cache
    invalidatePublicPricingCache();

    return { success: errors.length === 0, errors, warnings };
  } catch (err: any) {
    return { success: false, errors: [err.message], warnings };
  }
}

/**
 * Pricing Catalog Compiler
 * 
 * Reads the internal pricing tables for a given version and compiles
 * them into the `public_price_catalog` table for website consumption.
 * 
 * Called when publishing a pricing version from /admin/pricing.
 */
import { supabase } from '@/integrations/supabase/client';
import { GENERAL_DEBRIS_SIZES } from '@/config/pricingConfig';
import { HEAVY_MATERIAL_GROUPS, HEAVY_SERVICE_COSTS, HEAVY_ALLOWED_SIZES, type HeavySize } from '@/config/heavyMaterialConfig';
import { invalidatePublicPricingCache } from './publicPricingService';

export interface CompileResult {
  success: boolean;
  generalRows: number;
  heavyRows: number;
  errors: string[];
  warnings: string[];
}

/**
 * Compile the public price catalog from internal pricing tables.
 * 
 * Steps:
 * 1. Read general debris prices from pricing_general_debris
 * 2. Read heavy pricing from pricing_heavy_service_costs + pricing_heavy_groups
 * 3. Upsert into public_price_catalog
 * 4. Invalidate public pricing cache
 */
export async function compilePriceCatalog(
  versionId: string,
  marketCode = 'default'
): Promise<CompileResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let generalRows = 0;
  let heavyRows = 0;

  try {
    // ── Step 1: General Debris ──────────────────────────────
    const { data: generalData } = await supabase
      .from('pricing_general_debris')
      .select('*')
      .eq('market_code', marketCode)
      .eq('active', true)
      .order('size_yd');

    const generalPrices = generalData && generalData.length > 0
      ? generalData
      : GENERAL_DEBRIS_SIZES.map(s => ({
          size_yd: s.size,
          base_price: s.price,
          included_tons: s.includedTons,
          rental_days: 7,
          overage_rate: 165,
          best_for: s.bestFor,
        }));

    // Validate required sizes
    const requiredSizes = [5, 8, 10, 20, 30, 40, 50];
    const foundSizes = generalPrices.map((p: any) => p.size_yd);
    for (const s of requiredSizes) {
      if (!foundSizes.includes(s)) {
        errors.push(`Missing general debris price for ${s} yard`);
      }
    }

    // Upsert general rows
    for (const row of generalPrices) {
      const { error } = await supabase
        .from('public_price_catalog')
        .upsert({
          pricing_version_id: versionId,
          market_code: marketCode,
          service_line: 'DUMPSTER_RENTAL',
          price_family: 'GENERAL_DEBRIS',
          size_yd: row.size_yd,
          material_group_code: null,
          public_price: Number(row.base_price),
          included_days: row.rental_days || 7,
          included_tons: Number(row.included_tons),
          overage_rate: Number(row.overage_rate || 165),
          public_label: `${row.size_yd} Yard Dumpster`,
          public_description: row.best_for || `${row.size_yd} yard dumpster rental`,
          public_visible: true,
          active: true,
        }, {
          onConflict: 'idx_public_price_catalog_unique',
        });

      if (error) {
        warnings.push(`General ${row.size_yd}yd upsert warning: ${error.message}`);
      } else {
        generalRows++;
      }
    }

    // ── Step 2: Heavy Materials ─────────────────────────────
    const { data: heavyServiceData } = await supabase
      .from('pricing_heavy_service_costs')
      .select('*')
      .eq('active', true);

    const { data: heavyGroupData } = await supabase
      .from('pricing_heavy_groups')
      .select('*')
      .eq('active', true);

    // Build service cost map
    const serviceCosts: Record<number, number> = { ...HEAVY_SERVICE_COSTS };
    if (heavyServiceData) {
      for (const row of heavyServiceData) {
        serviceCosts[row.size_yd] = Number(row.service_cost);
      }
    }

    // Build group dump fee map
    const groupFees: Record<string, { dumpFeePerYard: number; label: string; description: string }> = {};
    for (const g of HEAVY_MATERIAL_GROUPS) {
      groupFees[g.id] = { dumpFeePerYard: g.dumpFeePerYard, label: g.label, description: g.description };
    }
    if (heavyGroupData) {
      for (const row of heavyGroupData) {
        groupFees[row.heavy_group_code] = {
          dumpFeePerYard: Number(row.dump_fee_per_yard),
          label: row.label || row.heavy_group_code,
          description: row.description || '',
        };
      }
    }

    // Compile heavy prices
    for (const groupCode of Object.keys(groupFees)) {
      const group = groupFees[groupCode];
      for (const size of HEAVY_ALLOWED_SIZES) {
        const sc = serviceCosts[size] || 0;
        const dumpFee = size * group.dumpFeePerYard;
        const totalPrice = sc + dumpFee;

        const { error } = await supabase
          .from('public_price_catalog')
          .upsert({
            pricing_version_id: versionId,
            market_code: marketCode,
            service_line: 'DUMPSTER_RENTAL',
            price_family: 'HEAVY_MATERIAL',
            size_yd: size,
            material_group_code: groupCode,
            public_price: totalPrice,
            included_days: 7,
            included_tons: size, // heavy is flat fee, tons = capacity
            overage_rate: 0, // flat fee, no overage
            public_label: `${size} Yard - ${group.label}`,
            public_description: `${group.description} — disposal included`,
            public_visible: true,
            active: true,
          }, {
            onConflict: 'idx_public_price_catalog_unique',
          });

        if (error) {
          warnings.push(`Heavy ${groupCode} ${size}yd upsert warning: ${error.message}`);
        } else {
          heavyRows++;
        }
      }
    }

    // Invalidate cache
    invalidatePublicPricingCache();

    return {
      success: errors.length === 0,
      generalRows,
      heavyRows,
      errors,
      warnings,
    };
  } catch (err: any) {
    return {
      success: false,
      generalRows,
      heavyRows,
      errors: [err.message || 'Unknown compilation error'],
      warnings,
    };
  }
}

/**
 * Health check — validate public catalog completeness
 */
export async function checkPublicCatalogHealth(
  marketCode = 'default'
): Promise<{ healthy: boolean; issues: string[] }> {
  const issues: string[] = [];

  const { data, error } = await supabase
    .from('public_price_catalog')
    .select('price_family, size_yd, material_group_code')
    .eq('market_code', marketCode)
    .eq('active', true)
    .eq('public_visible', true);

  if (error || !data) {
    return { healthy: false, issues: ['Cannot read public_price_catalog'] };
  }

  // Check general debris completeness
  const generalSizes = data.filter(r => r.price_family === 'GENERAL_DEBRIS').map(r => r.size_yd);
  for (const s of [5, 8, 10, 20, 30, 40, 50]) {
    if (!generalSizes.includes(s)) {
      issues.push(`Missing general debris public price for ${s} yard`);
    }
  }

  // Check heavy completeness
  const heavyRows = data.filter(r => r.price_family === 'HEAVY_MATERIAL');
  for (const group of ['CLEAN_NO_1', 'CLEAN_NO_2', 'ALL_MIXED', 'OTHER_HEAVY']) {
    for (const size of [5, 8, 10]) {
      const found = heavyRows.some(r => r.size_yd === size && r.material_group_code === group);
      if (!found) {
        issues.push(`Missing heavy public price for ${group} ${size} yard`);
      }
    }
  }

  return { healthy: issues.length === 0, issues };
}

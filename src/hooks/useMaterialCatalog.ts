// Smart Material Catalog Hook
// Fetches and filters materials based on customer type and project category

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ============================================================
// TYPES
// ============================================================

export interface ProjectCategory {
  id: string;
  category_code: string;
  display_name: string;
  display_name_es: string | null;
  description: string | null;
  description_es: string | null;
  icon: string;
  is_active: boolean;
  display_order: number;
  allowed_customer_types: string[] | null;
}

export interface MaterialCatalogItem {
  id: string;
  material_code: string;
  display_name: string;
  display_name_es: string | null;
  group_name: string;
  description_short: string | null;
  description_short_es: string | null;
  default_pricing_model: 'DEBRIS' | 'DEBRIS_HEAVY' | 'HEAVY_BASE' | 'GREEN_HALO';
  green_halo_allowed: boolean;
  allowed_sizes_json: number[];
  icon: string;
  density_hint: string;
  requires_contamination_check: boolean;
  is_heavy_material: boolean;
  heavy_increment: number;
  is_active: boolean;
  display_order: number;
}

export interface MaterialOffer {
  material_code: string;
  priority: number;
  is_recommended: boolean;
  is_hidden: boolean;
  material: MaterialCatalogItem;
}

export interface SmartMaterialResult {
  recommended: MaterialOffer[];
  other: MaterialOffer[];
  all: MaterialOffer[];
}

// Customer types that match our system
export type CustomerType = 'homeowner' | 'contractor' | 'business' | 'preferred_contractor' | 'wholesaler';

// Map user types to customer types for offers lookup
const USER_TYPE_TO_CUSTOMER_TYPE: Record<string, CustomerType> = {
  'homeowner': 'homeowner',
  'contractor': 'contractor',
  'business': 'business',
  'preferred_contractor': 'preferred_contractor',
  'wholesaler': 'wholesaler',
};

// ============================================================
// HOOK: useProjectCategories
// ============================================================

export function useProjectCategories(customerType?: string) {
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [visibility, setVisibility] = useState<Record<string, { is_visible: boolean; display_order: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const ct = customerType ? (USER_TYPE_TO_CUSTOMER_TYPE[customerType] || 'homeowner') : null;
        
        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('project_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (catError) throw catError;
        // Cast allowed_customer_types from JSON to string array
        const typedCategories = (catData || []).map(c => ({
          ...c,
          allowed_customer_types: Array.isArray(c.allowed_customer_types) 
            ? c.allowed_customer_types as string[]
            : null,
        })) as ProjectCategory[];
        setCategories(typedCategories);

        // Fetch visibility rules if customer type is specified
        if (ct) {
          const { data: visData, error: visError } = await supabase
            .from('customer_category_visibility')
            .select('category_code, is_visible, display_order')
            .eq('customer_type', ct);

          if (visError) throw visError;
          
          const visMap: Record<string, { is_visible: boolean; display_order: number }> = {};
          (visData || []).forEach(v => {
            visMap[v.category_code] = { is_visible: v.is_visible, display_order: v.display_order };
          });
          setVisibility(visMap);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch project categories:', err);
        setError('Failed to load project categories');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [customerType]);

  // Filter and sort categories based on customer type visibility rules and allowed_customer_types
  const filteredCategories = useMemo(() => {
    if (!customerType) return categories;
    
    const ct = USER_TYPE_TO_CUSTOMER_TYPE[customerType] || 'homeowner';
    
    // First filter by allowed_customer_types from the category itself
    let filtered = categories.filter(c => {
      // If allowed_customer_types is defined, check if customer type is in the list
      if (c.allowed_customer_types && Array.isArray(c.allowed_customer_types)) {
        return c.allowed_customer_types.includes(ct);
      }
      // Fallback: allow all if not specified
      return true;
    });
    
    // Then apply visibility rules if they exist
    if (Object.keys(visibility).length > 0) {
      filtered = filtered
        .filter(c => {
          const rule = visibility[c.category_code];
          // If no rule exists, default to visible
          return rule ? rule.is_visible : true;
        })
        .sort((a, b) => {
          const orderA = visibility[a.category_code]?.display_order ?? a.display_order;
          const orderB = visibility[b.category_code]?.display_order ?? b.display_order;
          return orderA - orderB;
        });
    }

    return filtered;
  }, [categories, customerType, visibility]);

  return { categories: filteredCategories, allCategories: categories, isLoading, error };
}

// ============================================================
// HOOK: useMaterialCatalog
// ============================================================

export function useMaterialCatalog() {
  const [materials, setMaterials] = useState<MaterialCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const { data, error: fetchError } = await supabase
          .from('material_catalog')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (fetchError) throw fetchError;
        
        // Parse allowed_sizes_json and cast types properly
        const parsed: MaterialCatalogItem[] = (data || []).map(m => ({
          id: m.id,
          material_code: m.material_code,
          display_name: m.display_name,
          display_name_es: m.display_name_es,
          group_name: m.group_name,
          description_short: m.description_short,
          description_short_es: m.description_short_es,
          default_pricing_model: m.default_pricing_model as 'DEBRIS' | 'DEBRIS_HEAVY' | 'HEAVY_BASE' | 'GREEN_HALO',
          green_halo_allowed: m.green_halo_allowed ?? false,
          allowed_sizes_json: Array.isArray(m.allowed_sizes_json) 
            ? m.allowed_sizes_json as number[]
            : JSON.parse((m.allowed_sizes_json as string) || '[]'),
          icon: m.icon ?? 'package',
          density_hint: m.density_hint ?? 'Medium',
          requires_contamination_check: m.requires_contamination_check ?? false,
          is_heavy_material: m.is_heavy_material ?? false,
          heavy_increment: m.heavy_increment ?? 0,
          is_active: m.is_active ?? true,
          display_order: m.display_order ?? 100,
        }));
        
        setMaterials(parsed);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch material catalog:', err);
        setError('Failed to load materials');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMaterials();
  }, []);

  return { materials, isLoading, error };
}

// ============================================================
// HOOK: useSmartMaterials - Filtered by customer type + project category
// ============================================================

export function useSmartMaterials(customerType: string, projectCategoryCode: string | null) {
  const { materials, isLoading: materialsLoading, error: materialsError } = useMaterialCatalog();
  const [offers, setOffers] = useState<MaterialOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch offers for the customer type and project category
  useEffect(() => {
    async function fetchOffers() {
      if (!projectCategoryCode || materials.length === 0) {
        setOffers([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const ct = USER_TYPE_TO_CUSTOMER_TYPE[customerType] || 'homeowner';
        
        const { data, error: fetchError } = await supabase
          .from('customer_material_offers')
          .select('*')
          .eq('customer_type', ct)
          .eq('project_category_code', projectCategoryCode)
          .eq('is_hidden', false)
          .order('priority', { ascending: true });

        if (fetchError) throw fetchError;

        // Join with material data
        const offersWithMaterials: MaterialOffer[] = (data || [])
          .map(offer => {
            const material = materials.find(m => m.material_code === offer.material_code);
            if (!material) return null;
            return {
              material_code: offer.material_code,
              priority: offer.priority,
              is_recommended: offer.is_recommended,
              is_hidden: offer.is_hidden,
              material,
            };
          })
          .filter((o): o is MaterialOffer => o !== null);

        setOffers(offersWithMaterials);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch material offers:', err);
        setError('Failed to load material options');
        setOffers([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffers();
  }, [customerType, projectCategoryCode, materials]);

  // Split into recommended and other
  const result = useMemo<SmartMaterialResult>(() => {
    const recommended = offers.filter(o => o.is_recommended);
    const other = offers.filter(o => !o.is_recommended);
    return { recommended, other, all: offers };
  }, [offers]);

  // Fallback: if no offers configured, show all materials
  const fallbackMaterials = useMemo<SmartMaterialResult>(() => {
    if (offers.length > 0) return result;
    
    // No offers configured, show all materials as fallback
    const allOffers: MaterialOffer[] = materials.map((m, idx) => ({
      material_code: m.material_code,
      priority: idx + 1,
      is_recommended: false,
      is_hidden: false,
      material: m,
    }));

    return { recommended: [], other: allOffers, all: allOffers };
  }, [materials, offers, result]);

  return {
    ...fallbackMaterials,
    isLoading: materialsLoading || isLoading,
    error: materialsError || error,
    hasConfiguredOffers: offers.length > 0,
  };
}

// ============================================================
// HELPER: Get pricing model info
// ============================================================

export function getPricingModelInfo(model: string): {
  label: string;
  description: string;
  badgeColor: string;
} {
  switch (model) {
    case 'HEAVY_BASE':
      return {
        label: 'Flat Fee',
        description: 'No weight charges - disposal included',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case 'DEBRIS_HEAVY':
      return {
        label: 'Debris Heavy',
        description: 'Includes tons by size, overage at $165/ton',
        badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      };
    case 'GREEN_HALO':
      return {
        label: 'Green Halo™',
        description: 'Recycling facility with compliance documentation',
        badgeColor: 'bg-green-100 text-green-800 border-green-200',
      };
    case 'DEBRIS':
    default:
      return {
        label: 'Standard',
        description: 'Billed by tons with included tonnage',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      };
  }
}

// ============================================================
// HELPER: Check if size is allowed for material
// ============================================================

export function isSizeAllowedForMaterial(size: number, material: MaterialCatalogItem): boolean {
  return material.allowed_sizes_json.includes(size);
}

// ============================================================
// HELPER: Get allowed sizes for a material
// ============================================================

export function getAllowedSizesForMaterial(material: MaterialCatalogItem): number[] {
  return material.allowed_sizes_json;
}

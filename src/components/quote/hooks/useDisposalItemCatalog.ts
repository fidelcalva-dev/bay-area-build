// ============================================================
// DISPOSAL ITEM CATALOG HOOK - Fetches and caches catalog items
// ============================================================
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DisposalItem {
  id: string;
  item_code: string;
  display_name: string;
  item_group: 'HOUSEHOLD' | 'CONSTRUCTION' | 'HEAVY' | 'RECYCLING' | 'YARD';
  volume_points: number;
  weight_class: 'LIGHT' | 'MED' | 'HEAVY';
  forces_category: 'YARD_WASTE' | 'HEAVY_MATERIALS' | 'CLEAN_RECYCLING' | null;
  default_material_code: string | null;
  icon_name: string | null;
  display_order: number;
}

export interface ItemSelection {
  itemCode: string;
  quantity: 'SMALL' | 'MED' | 'LARGE';
}

export function useDisposalItemCatalog() {
  return useQuery({
    queryKey: ['disposal-item-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disposal_item_catalog' as 'dumpster_sizes')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as DisposalItem[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// Group items by category for display
export function groupItemsByCategory(items: DisposalItem[]) {
  const groups: Record<string, DisposalItem[]> = {
    HOUSEHOLD: [],
    CONSTRUCTION: [],
    HEAVY: [],
    RECYCLING: [],
    YARD: [],
  };

  for (const item of items) {
    if (groups[item.item_group]) {
      groups[item.item_group].push(item);
    }
  }

  return groups;
}

// Get the "Most Common" items (top 8 by display order)
export function getMostCommonItems(items: DisposalItem[]): DisposalItem[] {
  const commonCodes = [
    'FURNITURE',
    'GENERAL_JUNK',
    'DRYWALL',
    'WOOD_FRAMING',
    'ROOFING_SHINGLES',
    'CABINETS',
    'APPLIANCES',
    'MATTRESS',
  ];
  
  return items.filter(item => commonCodes.includes(item.item_code));
}

// ============================================================
// SMART MATERIALS LIST - Option B Chip-Based Intake
// 8 Default East Bay chips with expand option
// ============================================================
import { useState, useMemo, useCallback } from 'react';
import { 
  Package, Armchair, BedDouble, Refrigerator, Trash2,
  Square, Grid2x2, LayoutGrid, Home, Wrench,
  Layers, Grid3x3, Mountain, Gem, Diamond,
  Trees, Sparkles, Factory, Boxes, Container,
  Leaf, TreePine, Flower2, ChevronDown, ChevronUp,
  Check, CircleDashed, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { DisposalItem, ItemSelection } from '../hooks/useDisposalItemCatalog';

// Icon mapping for Lucide icons by name
const ICON_MAP: Record<string, LucideIcon> = {
  Package,
  Armchair,
  Bed: BedDouble,
  BedDouble,
  Refrigerator,
  Trash2,
  Square,
  Logs: TreePine,
  Grid2x2,
  LayoutGrid,
  Home,
  Layers,
  Grid3x3,
  CircleDashed,
  Mountain,
  Gem,
  Diamond,
  Trees,
  Sparkles,
  Factory,
  Boxes,
  Container,
  Leaf,
  TreePine,
  Flower2,
  Wrench,
};

// Default 8 East Bay chips (simple display names, code mappings)
const DEFAULT_CHIP_CONFIG: { code: string; label: string; icon: LucideIcon }[] = [
  { code: 'GENERAL_JUNK', label: 'Household Junk', icon: Trash2 },
  { code: 'REMODEL', label: 'Remodel Debris', icon: Wrench },
  { code: 'CONSTRUCTION', label: 'Construction Debris', icon: Home },
  { code: 'CONCRETE', label: 'Concrete / Brick / Tile', icon: Layers },
  { code: 'DIRT', label: 'Clean Fill Dirt / Soil', icon: Mountain },
  { code: 'GRASS_YARD_WASTE', label: 'Yard Waste', icon: Leaf },
  { code: 'CLEAN_WOOD', label: 'Clean Wood / Wood Chips', icon: Trees },
  { code: 'COMMERCIAL', label: 'Commercial Trash', icon: Boxes },
];

// Codes that map to multiple catalog items (aggregate chips)
const AGGREGATE_MAPPINGS: Record<string, string[]> = {
  REMODEL: ['DRYWALL', 'CABINETS', 'FLOORING'],
  CONSTRUCTION: ['WOOD_FRAMING', 'ROOFING_SHINGLES', 'DRYWALL'],
  COMMERCIAL: ['GENERAL_JUNK', 'BOXES', 'CARDBOARD'],
};

interface SmartMaterialsListProps {
  catalogItems: DisposalItem[];
  selections: ItemSelection[];
  onSelectionsChange: (selections: ItemSelection[]) => void;
  className?: string;
}

export function SmartMaterialsList({
  catalogItems,
  selections,
  onSelectionsChange,
  className,
}: SmartMaterialsListProps) {
  const [showMore, setShowMore] = useState(false);

  // Build catalog lookup
  const catalogMap = useMemo(() => {
    const map = new Map<string, DisposalItem>();
    for (const item of catalogItems) {
      map.set(item.item_code, item);
    }
    return map;
  }, [catalogItems]);

  // Get the actual item codes for a chip (handles aggregates)
  const getItemCodesForChip = useCallback((chipCode: string): string[] => {
    if (AGGREGATE_MAPPINGS[chipCode]) {
      return AGGREGATE_MAPPINGS[chipCode];
    }
    // Direct mapping to catalog item
    return [chipCode];
  }, []);

  // Check if a chip is selected (any of its codes are in selections)
  const isChipSelected = useCallback((chipCode: string): boolean => {
    const codes = getItemCodesForChip(chipCode);
    return codes.some(code => selections.some(s => s.itemCode === code));
  }, [selections, getItemCodesForChip]);

  // Toggle chip selection
  const toggleChip = useCallback((chipCode: string) => {
    const codes = getItemCodesForChip(chipCode);
    const isSelected = isChipSelected(chipCode);

    if (isSelected) {
      // Remove all related codes
      onSelectionsChange(selections.filter(s => !codes.includes(s.itemCode)));
    } else {
      // Add all related codes with MED quantity
      const newSelections = codes
        .filter(code => catalogMap.has(code))
        .map(code => ({ itemCode: code, quantity: 'MED' as const }));
      onSelectionsChange([...selections, ...newSelections]);
    }
  }, [selections, onSelectionsChange, getItemCodesForChip, isChipSelected, catalogMap]);

  // Toggle an individual catalog item (for expanded view)
  const toggleItem = useCallback((itemCode: string) => {
    const exists = selections.find(s => s.itemCode === itemCode);
    if (exists) {
      onSelectionsChange(selections.filter(s => s.itemCode !== itemCode));
    } else {
      onSelectionsChange([...selections, { itemCode, quantity: 'MED' }]);
    }
  }, [selections, onSelectionsChange]);

  // Cycle quantity for an item
  const cycleQuantity = useCallback((itemCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const quantityOrder: ItemSelection['quantity'][] = ['SMALL', 'MED', 'LARGE'];
    onSelectionsChange(selections.map(s => {
      if (s.itemCode === itemCode) {
        const idx = quantityOrder.indexOf(s.quantity);
        const nextIdx = (idx + 1) % quantityOrder.length;
        return { ...s, quantity: quantityOrder[nextIdx] };
      }
      return s;
    }));
  }, [selections, onSelectionsChange]);

  // Get icon component for an item
  const getIcon = (iconName: string | null): LucideIcon => {
    return (iconName && ICON_MAP[iconName]) || Package;
  };

  // Render a default chip
  const renderDefaultChip = (chip: typeof DEFAULT_CHIP_CONFIG[0]) => {
    const selected = isChipSelected(chip.code);
    const Icon = chip.icon;

    return (
      <button
        key={chip.code}
        type="button"
        onClick={() => toggleChip(chip.code)}
        className={cn(
          "relative flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all text-left",
          "hover:border-primary/50 hover:bg-primary/5",
          selected
            ? "border-primary bg-primary/10"
            : "border-border bg-card"
        )}
      >
        <Icon className={cn(
          "w-5 h-5 shrink-0",
          selected ? "text-primary" : "text-muted-foreground"
        )} />
        
        <span className={cn(
          "text-sm font-medium",
          selected ? "text-foreground" : "text-muted-foreground"
        )}>
          {chip.label}
        </span>

        {selected && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </button>
    );
  };

  // Render expanded catalog item
  const renderCatalogItem = (item: DisposalItem) => {
    const Icon = getIcon(item.icon_name);
    const selected = selections.some(s => s.itemCode === item.item_code);
    const selection = selections.find(s => s.itemCode === item.item_code);
    const isHeavy = item.forces_category === 'HEAVY_MATERIALS';
    const isYard = item.forces_category === 'YARD_WASTE';

    return (
      <button
        key={item.item_code}
        type="button"
        onClick={() => toggleItem(item.item_code)}
        className={cn(
          "relative flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left",
          "hover:border-primary/50 hover:bg-primary/5",
          selected
            ? "border-primary bg-primary/10"
            : "border-border bg-card",
          (isHeavy || isYard) && "border-l-4 border-l-warning"
        )}
      >
        <Icon className={cn(
          "w-4 h-4 shrink-0",
          selected ? "text-primary" : "text-muted-foreground"
        )} />
        
        <span className={cn(
          "text-sm font-medium truncate",
          selected ? "text-foreground" : "text-muted-foreground"
        )}>
          {item.display_name}
        </span>

        {selected && selection && (
          <button
            type="button"
            onClick={(e) => cycleQuantity(item.item_code, e)}
            className={cn(
              "ml-auto px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase",
              "bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            )}
          >
            {selection.quantity}
          </button>
        )}

        {selected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-primary-foreground" />
          </div>
        )}
      </button>
    );
  };

  // Group catalog items for expanded view
  const groupedItems = useMemo(() => {
    const groups: Record<string, DisposalItem[]> = {
      HOUSEHOLD: [],
      CONSTRUCTION: [],
      HEAVY: [],
      RECYCLING: [],
      YARD: [],
    };

    for (const item of catalogItems) {
      if (item.forces_category === 'HEAVY_MATERIALS') {
        groups.HEAVY.push(item);
      } else if (item.forces_category === 'YARD_WASTE') {
        groups.YARD.push(item);
      } else if (item.forces_category === 'CLEAN_RECYCLING') {
        groups.RECYCLING.push(item);
      } else if (item.item_group === 'CONSTRUCTION') {
        groups.CONSTRUCTION.push(item);
      } else {
        groups.HOUSEHOLD.push(item);
      }
    }

    return groups;
  }, [catalogItems]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Default 8 chips in 2-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DEFAULT_CHIP_CONFIG.map(renderDefaultChip)}
      </div>

      {/* Expand button */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showMore ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            More items
          </>
        )}
      </button>

      {/* Expanded catalog items */}
      {showMore && (
        <div className="space-y-4 pt-2 border-t border-border">
          {/* Household */}
          {groupedItems.HOUSEHOLD.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Household
              </p>
              <div className="flex flex-wrap gap-2">
                {groupedItems.HOUSEHOLD.map(renderCatalogItem)}
              </div>
            </div>
          )}

          {/* Construction */}
          {groupedItems.CONSTRUCTION.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Construction
              </p>
              <div className="flex flex-wrap gap-2">
                {groupedItems.CONSTRUCTION.map(renderCatalogItem)}
              </div>
            </div>
          )}

          {/* Heavy */}
          {groupedItems.HEAVY.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Heavy Materials
              </p>
              <div className="flex flex-wrap gap-2">
                {groupedItems.HEAVY.map(renderCatalogItem)}
              </div>
            </div>
          )}

          {/* Recycling */}
          {groupedItems.RECYCLING.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Recycling
              </p>
              <div className="flex flex-wrap gap-2">
                {groupedItems.RECYCLING.map(renderCatalogItem)}
              </div>
            </div>
          )}

          {/* Yard */}
          {groupedItems.YARD.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Yard Waste
              </p>
              <div className="flex flex-wrap gap-2">
                {groupedItems.YARD.map(renderCatalogItem)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selection count */}
      {selections.length > 0 && (
        <div className="pt-2 text-sm text-muted-foreground text-center">
          {selections.length} item{selections.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}

// ============================================================
// SMART MATERIALS LIST STEP
// Quick chip-based selection of common materials
// ============================================================
import { useState, useMemo, useCallback } from 'react';
import { 
  Package, Armchair, BedDouble, Refrigerator, Trash2,
  Square, CircleDashed, Grid2x2, LayoutGrid, Home,
  Layers, Grid3x3, Mountain, Gem, Diamond,
  Trees, Sparkles, Factory, Boxes, Container,
  Leaf, TreePine, Flower2, ChevronDown, ChevronUp,
  Check, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { DisposalItem, ItemSelection } from '../hooks/useDisposalItemCatalog';
import { getMostCommonItems, groupItemsByCategory } from '../hooks/useDisposalItemCatalog';

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
};

interface SmartMaterialsListProps {
  catalogItems: DisposalItem[];
  selections: ItemSelection[];
  onSelectionsChange: (selections: ItemSelection[]) => void;
  className?: string;
}

// Category display config
const CATEGORY_CONFIG: Record<string, { label: string; defaultOpen: boolean }> = {
  MOST_COMMON: { label: 'Most Common', defaultOpen: true },
  CONSTRUCTION: { label: 'Construction', defaultOpen: false },
  HEAVY: { label: 'Heavy Materials', defaultOpen: false },
  RECYCLING: { label: 'Recycling', defaultOpen: false },
  YARD: { label: 'Yard & Landscaping', defaultOpen: false },
};

export function SmartMaterialsList({
  catalogItems,
  selections,
  onSelectionsChange,
  className,
}: SmartMaterialsListProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['MOST_COMMON']));

  // Organize items by category
  const organizedItems = useMemo(() => {
    const mostCommon = getMostCommonItems(catalogItems);
    const grouped = groupItemsByCategory(catalogItems);
    
    return {
      MOST_COMMON: mostCommon,
      CONSTRUCTION: grouped.CONSTRUCTION.filter(
        item => !mostCommon.some(m => m.item_code === item.item_code)
      ),
      HEAVY: grouped.HEAVY,
      RECYCLING: grouped.RECYCLING,
      YARD: grouped.YARD,
    };
  }, [catalogItems]);

  // Toggle item selection
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

  // Toggle category open/closed
  const toggleCategory = useCallback((category: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  // Get icon component for an item
  const getIcon = (iconName: string | null): LucideIcon => {
    return (iconName && ICON_MAP[iconName]) || Package;
  };

  // Check if item is selected
  const isSelected = (itemCode: string) => selections.some(s => s.itemCode === itemCode);
  
  // Get quantity for selected item
  const getQuantity = (itemCode: string) => {
    const sel = selections.find(s => s.itemCode === itemCode);
    return sel?.quantity || 'MED';
  };

  const renderChip = (item: DisposalItem) => {
    const Icon = getIcon(item.icon_name);
    const selected = isSelected(item.item_code);
    const quantity = getQuantity(item.item_code);
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

        {selected && (
          <button
            type="button"
            onClick={(e) => cycleQuantity(item.item_code, e)}
            className={cn(
              "ml-auto px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase",
              "bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            )}
          >
            {quantity}
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

  const renderCategory = (categoryKey: string, items: DisposalItem[]) => {
    if (items.length === 0) return null;
    
    const config = CATEGORY_CONFIG[categoryKey];
    const isOpen = openCategories.has(categoryKey);

    return (
      <Collapsible
        key={categoryKey}
        open={isOpen}
        onOpenChange={() => toggleCategory(categoryKey)}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <span>{config?.label || categoryKey}</span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pb-3">
          <div className="flex flex-wrap gap-2">
            {items.map(renderChip)}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Most Common - always show first */}
      {renderCategory('MOST_COMMON', organizedItems.MOST_COMMON)}
      
      {/* Other categories */}
      {renderCategory('CONSTRUCTION', organizedItems.CONSTRUCTION)}
      {renderCategory('HEAVY', organizedItems.HEAVY)}
      {renderCategory('RECYCLING', organizedItems.RECYCLING)}
      {renderCategory('YARD', organizedItems.YARD)}
      
      {/* Selection count */}
      {selections.length > 0 && (
        <div className="pt-2 text-sm text-muted-foreground">
          {selections.length} item{selections.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}

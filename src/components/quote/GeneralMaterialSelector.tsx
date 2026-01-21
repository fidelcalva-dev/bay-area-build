// General Material Sub-Classification Selector
// Helps users identify their debris type for better size recommendations
// Uses Lucide SVG icons exclusively - NO emojis

import { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle, Home, Hammer, Leaf, Package, Archive, 
  Recycle, AlertCircle, Scale, Info, TreePine, Wrench,
  LayoutGrid, Cylinder, Square, Layers, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

// General debris categories with overage info
export const GENERAL_DEBRIS_CATEGORIES = [
  {
    id: 'mixed_cd',
    label: 'Mixed C&D Debris',
    description: 'Construction & demolition mix',
    icon: Layers,
    densityHint: 'Medium-heavy',
    examples: ['Drywall + Lumber', 'Flooring mix', 'Demo debris', 'Remodel waste'],
  },
  {
    id: 'household',
    label: 'Household/Junk',
    description: 'Furniture, boxes, clothes, general clutter',
    icon: Home,
    densityHint: 'Light-medium',
    examples: ['Furniture', 'Appliances', 'Boxes', 'Toys', 'Clothes'],
  },
  {
    id: 'cleanout',
    label: 'Estate/Garage Cleanout',
    description: 'Mixed items from storage or cleanouts',
    icon: Archive,
    densityHint: 'Light-medium',
    examples: ['Storage items', 'Old furniture', 'Misc. junk', 'Decor'],
  },
  {
    id: 'construction',
    label: 'Construction/Remodel',
    description: 'Drywall, lumber, flooring, cabinets',
    icon: Hammer,
    densityHint: 'Medium-heavy',
    examples: ['Drywall', 'Lumber', 'Carpet', 'Cabinets', 'Fixtures'],
  },
  {
    id: 'roofing_only',
    label: 'Roofing Only (100% Clean)',
    description: 'Asphalt shingles only — recyclable',
    icon: Home,
    densityHint: 'Heavy',
    examples: ['Asphalt shingles', 'Felt paper', 'Flashing'],
    weightWarning: true,
    recyclable: true,
    greenHalo: true,
  },
  {
    id: 'wood_clean',
    label: 'Clean Wood & Tree Waste',
    description: 'Untreated lumber, branches, tree debris',
    icon: TreePine,
    densityHint: 'Light-medium',
    examples: ['Lumber', 'Branches', 'Tree stumps', 'Pallets', 'Plywood'],
    recyclable: true,
    greenHalo: true,
  },
  {
    id: 'yard',
    label: 'Yard/Green Waste',
    description: 'Grass, shrubs, leaves, landscaping',
    icon: Leaf,
    densityHint: 'Light',
    examples: ['Grass clippings', 'Shrubs', 'Leaves', 'Sod', 'Dirt (small qty)'],
  },
  {
    id: 'metal',
    label: 'Metal (100% Clean)',
    description: 'Scrap metal, pipes, fixtures',
    icon: Wrench,
    densityHint: 'Heavy',
    examples: ['Steel', 'Aluminum', 'Copper', 'Pipes', 'Fixtures'],
    recyclable: true,
    greenHalo: true,
  },
  {
    id: 'cardboard',
    label: 'Cardboard & Paper',
    description: 'Boxes, packaging, paper products',
    icon: Package,
    densityHint: 'Very light',
    examples: ['Cardboard boxes', 'Packaging', 'Office paper', 'Magazines'],
    recyclable: true,
    greenHalo: true,
  },
  {
    id: 'plastic',
    label: 'Plastic (100% Clean)',
    description: 'Plastic containers, packaging, materials',
    icon: Cylinder,
    densityHint: 'Very light',
    examples: ['Plastic bins', 'Packaging', 'PVC', 'Containers'],
    recyclable: true,
    greenHalo: true,
  },
  {
    id: 'drywall',
    label: 'Drywall Only (100% Clean)',
    description: 'Sheetrock, gypsum board only',
    icon: Square,
    densityHint: 'Medium',
    examples: ['Sheetrock', 'Gypsum board', 'Drywall scraps'],
    recyclable: true,
    greenHalo: true,
  },
  {
    id: 'mixed',
    label: 'Mixed/Other Debris',
    description: 'Combination of multiple categories',
    icon: LayoutGrid,
    densityHint: 'Varies',
    examples: ['Multiple types above', 'Demo + Junk', 'Various materials'],
  },
];

interface GeneralMaterialSelectorProps {
  onClassificationChange: (result: GeneralClassificationResult) => void;
  selectedSize: number;
}

export interface GeneralClassificationResult {
  category: string | null;
  densityHint: string | null;
  hasWeightWarning: boolean;
  isRecyclable: boolean;
  isComplete: boolean;
}

export function GeneralMaterialSelector({ 
  onClassificationChange, 
  selectedSize,
}: GeneralMaterialSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Determine classification
  const classification = useMemo(() => {
    if (!selectedCategory) {
      return {
        category: null,
        densityHint: null,
        hasWeightWarning: false,
        isRecyclable: false,
        isComplete: false,
      };
    }

    const category = GENERAL_DEBRIS_CATEGORIES.find(c => c.id === selectedCategory);
    return {
      category: selectedCategory,
      densityHint: category?.densityHint || null,
      hasWeightWarning: category?.weightWarning || false,
      isRecyclable: category?.recyclable || false,
      isComplete: true,
    };
  }, [selectedCategory]);

  // Notify parent of changes
  useEffect(() => {
    onClassificationChange(classification);
  }, [classification, onClassificationChange]);

  // Get overage info based on size
  const getOverageInfo = () => {
    if (selectedSize <= 10) {
      return {
        type: 'capacity',
        rate: '$30',
        unit: 'per extra cubic yard',
        note: 'Overage charged if debris exceeds container height',
      };
    }
    return {
      type: 'weight',
      rate: '$165',
      unit: 'per extra ton',
      note: 'Overage charged after included tonnage',
    };
  };

  const overageInfo = getOverageInfo();

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Recycle className="w-4 h-4 text-primary" strokeWidth={2} />
          <span className="text-sm font-medium text-foreground">
            What type of debris are you disposing?
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          This helps us ensure you get the right size and pricing
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {GENERAL_DEBRIS_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            const isRecyclable = 'recyclable' in category && category.recyclable;
            
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "p-2.5 rounded-xl border-2 text-left transition-all relative",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/50"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    isSelected ? "bg-primary/10" : "bg-muted"
                  )}>
                    <IconComponent 
                      className={cn(
                        "w-4 h-4",
                        isSelected ? "text-primary" : "text-foreground/70"
                      )} 
                      strokeWidth={2} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-xs leading-tight">
                      {category.label}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                      {category.description}
                    </div>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                
                <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                  {'greenHalo' in category && category.greenHalo && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Green Halo™
                    </span>
                  )}
                  {isRecyclable && !('greenHalo' in category && category.greenHalo) && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      <Recycle className="w-2.5 h-2.5" />
                      Recyclable
                    </span>
                  )}
                  {category.weightWarning && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Heavy
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Category Details */}
      {selectedCategory && (
        <>
          <div className="border-t border-border my-4" />
          
          {(() => {
            const category = GENERAL_DEBRIS_CATEGORIES.find(c => c.id === selectedCategory);
            if (!category) return null;

            return (
              <div className="space-y-3">
                {/* Examples */}
                <div className="p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Common items:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.examples.map((example, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 bg-background rounded text-xs text-muted-foreground border border-border"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Weight/Capacity Info */}
                <div className={cn(
                  "p-3 rounded-xl border",
                  category.weightWarning 
                    ? "bg-amber-500/5 border-amber-500/20" 
                    : "bg-primary/5 border-primary/20"
                )}>
                  <div className="flex items-start gap-3">
                    <Scale className={cn(
                      "w-5 h-5 flex-shrink-0 mt-0.5",
                      category.weightWarning ? "text-amber-600" : "text-primary"
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {selectedSize <= 10 ? 'Capacity-based pricing' : 'Weight-based pricing'}
                        </span>
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded font-medium",
                          category.weightWarning 
                            ? "bg-amber-500/10 text-amber-600" 
                            : "bg-primary/10 text-primary"
                        )}>
                          {category.densityHint}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {overageInfo.note}
                      </p>
                      <div className="mt-2 text-xs">
                        <span className="text-foreground font-medium">Overage rate:</span>
                        <span className="text-muted-foreground ml-1">
                          {overageInfo.rate} {overageInfo.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Roofing weight warning */}
                {category.weightWarning && selectedSize >= 20 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-amber-800 font-medium">
                          Roofing is heavy! Consider the included tonnage carefully.
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          A 2,000 sq ft roof can weigh 4-6+ tons. Pre-purchase extra tons at 5% off to lock in savings.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground">
        * Pricing confirmed after disposal. Overages billed based on scale ticket or visual inspection.
      </p>
    </div>
  );
}

export default GeneralMaterialSelector;

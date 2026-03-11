// Heavy Material Sub-Classification Selector
// Two-question flow: 1) Trash? 2) Single material? 3) Which type?
// Uses Lucide SVG icons exclusively - NO emojis

import { useState, useMemo, useEffect } from 'react';
import { 
  Check, AlertTriangle, Trash2, Scale, HardHat, CheckCircle, 
  CircleOff, Shuffle, Mountain, Grip, Landmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  HEAVY_MATERIAL_CATEGORIES, 
  calculateHeavyPrice, 
  checkTrashContamination,
  formatHeavyPrice,
  type HeavyMaterialClass 
} from '@/lib/heavyPricing';

interface HeavyMaterialSelectorProps {
  onClassificationChange: (result: HeavyClassificationResult) => void;
  selectedSize: 5 | 8 | 10;
  cityId?: string;
}

export interface HeavyClassificationResult {
  materialClass: HeavyMaterialClass | null;
  isCleanSingleType: boolean | null;
  hasTrash: boolean | null;
  reclassifiedToMixed: boolean;
  price: number | null;
  increment: number;
}

export function HeavyMaterialSelector({ 
  onClassificationChange, 
  selectedSize,
  cityId = 'oakland'
}: HeavyMaterialSelectorProps) {
  const [isCleanSingleType, setIsCleanSingleType] = useState<boolean | null>(null);
  const [hasTrash, setHasTrash] = useState<boolean | null>(null);
  const [selectedMaterialType, setSelectedMaterialType] = useState<'base' | 'plus_200' | null>(null);

  // Determine classification based on answers
  const classification = useMemo(() => {
    // If trash is present, reclassify to mixed
    if (hasTrash === true) {
      const reclassResult = checkTrashContamination(true, 'heavy');
      return {
        materialClass: null,
        isCleanSingleType,
        hasTrash: true,
        reclassifiedToMixed: true,
        price: null,
        increment: 0,
      };
    }

    // No trash, determine heavy class
    if (hasTrash === false) {
      let materialClass: HeavyMaterialClass;
      
      if (isCleanSingleType === true && selectedMaterialType) {
        // Clean single type: base or +$200
        materialClass = selectedMaterialType;
      } else if (isCleanSingleType === false) {
        // Mixed heavy materials: +$300
        materialClass = 'mixed_heavy';
      } else {
        // Not fully determined yet
        return {
          materialClass: null,
          isCleanSingleType,
          hasTrash: false,
          reclassifiedToMixed: false,
          price: null,
          increment: 0,
        };
      }

      const priceResult = calculateHeavyPrice(selectedSize, materialClass, cityId);
      return {
        materialClass,
        isCleanSingleType,
        hasTrash: false,
        reclassifiedToMixed: false,
        price: priceResult.roundedPrice,
        increment: priceResult.incrementApplied,
      };
    }

    return {
      materialClass: null,
      isCleanSingleType,
      hasTrash,
      reclassifiedToMixed: false,
      price: null,
      increment: 0,
    };
  }, [isCleanSingleType, hasTrash, selectedMaterialType, selectedSize, cityId]);

  // Notify parent of changes
  useEffect(() => {
    onClassificationChange(classification);
  }, [classification, onClassificationChange]);

  // Question 1: Any trash mixed in?
  const renderTrashQuestion = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trash2 className="w-4 h-4 text-amber-500" strokeWidth={2} />
        <span className="text-sm font-medium text-foreground">
          Is there any trash mixed in?
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Trash, wood, drywall, plastic, junk, or C&D debris
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setHasTrash(false)}
          className={cn(
            "p-3 rounded-xl border-2 text-center transition-all",
            hasTrash === false
              ? "border-success bg-success/5"
              : "border-border bg-background hover:border-success/50"
          )}
        >
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-success/10 flex items-center justify-center">
            <CircleOff className="w-5 h-5 text-success" strokeWidth={2} />
          </div>
          <div className="font-semibold text-foreground text-sm">No Trash</div>
          <div className="text-xs text-muted-foreground">Clean heavy only</div>
          {hasTrash === false && (
            <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
              <CheckCircle className="w-3 h-3" />
              Flat fee eligible
            </div>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => setHasTrash(true)}
          className={cn(
            "p-3 rounded-xl border-2 text-center transition-all",
            hasTrash === true
              ? "border-amber-500 bg-amber-500/5"
              : "border-border bg-background hover:border-amber-500/50"
          )}
        >
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-amber-500" strokeWidth={2} />
          </div>
          <div className="font-semibold text-foreground text-sm">Yes, Trash</div>
          <div className="text-xs text-muted-foreground">Mixed with debris</div>
          {hasTrash === true && (
            <div className="mt-2 flex items-center justify-center gap-1 text-xs text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              Reclassified
            </div>
          )}
        </button>
      </div>
    </div>
  );

  // Question 2: Clean single type?
  const renderCleanTypeQuestion = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Scale className="w-4 h-4 text-primary" strokeWidth={2} />
        <span className="text-sm font-medium text-foreground">
          Is your heavy material clean and separated into ONE type?
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setIsCleanSingleType(true)}
          className={cn(
            "p-3 rounded-xl border-2 text-center transition-all",
            isCleanSingleType === true
              ? "border-primary bg-primary/5"
              : "border-border bg-background hover:border-primary/50"
          )}
        >
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
            <Mountain className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div className="font-semibold text-foreground text-sm">Yes</div>
          <div className="text-xs text-muted-foreground">Single material type</div>
        </button>
        
        <button
          type="button"
          onClick={() => {
            setIsCleanSingleType(false);
            setSelectedMaterialType(null);
          }}
          className={cn(
            "p-3 rounded-xl border-2 text-center transition-all",
            isCleanSingleType === false
              ? "border-amber-500 bg-amber-500/5"
              : "border-border bg-background hover:border-amber-500/50"
          )}
        >
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Shuffle className="w-5 h-5 text-amber-500" strokeWidth={2} />
          </div>
          <div className="font-semibold text-foreground text-sm">No</div>
          <div className="text-xs text-muted-foreground">Multiple heavy types</div>
          {isCleanSingleType === false && (
            <div className="mt-2 text-xs text-amber-600 font-medium">+$300 mixed</div>
          )}
        </button>
      </div>
    </div>
  );

  // Question 3: Which material type? (only if clean single type)
  const renderMaterialTypeQuestion = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <HardHat className="w-4 h-4 text-primary" strokeWidth={2} />
        <span className="text-sm font-medium text-foreground">
          Which type of heavy material?
        </span>
      </div>
      
      <div className="grid gap-3">
        {/* Base materials */}
        <button
          type="button"
          onClick={() => setSelectedMaterialType('base')}
          className={cn(
            "p-4 rounded-xl border-2 text-left transition-all",
            selectedMaterialType === 'base'
              ? "border-success bg-success/5"
              : "border-border bg-background hover:border-success/50"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Mountain className="w-5 h-5 text-foreground/70" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">Base Materials</span>
                {selectedMaterialType === 'base' && (
                  <span className="px-1.5 py-0.5 bg-success text-success-foreground text-[10px] rounded font-bold">
                    Best Rate
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Clean concrete, soil/dirt, sand, gravel
              </div>
            </div>
            {selectedMaterialType === 'base' && (
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            )}
          </div>
        </button>

        {/* +$200 materials */}
        <button
          type="button"
          onClick={() => setSelectedMaterialType('plus_200')}
          className={cn(
            "p-4 rounded-xl border-2 text-left transition-all",
            selectedMaterialType === 'plus_200'
              ? "border-primary bg-primary/5"
              : "border-border bg-background hover:border-primary/50"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Grip className="w-5 h-5 text-foreground/70" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">Specialty Materials</span>
                <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 text-[10px] rounded font-bold">
                  +$200
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Brick, asphalt, tile, roofing gravel, rock/stone
              </div>
            </div>
            {selectedMaterialType === 'plus_200' && (
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
            )}
          </div>
        </button>
      </div>
    </div>
  );

  // Reclassification notice
  const renderReclassificationNotice = () => (
    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground">Reclassified as Mixed Debris</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Heavy materials mixed with trash/C&D become general debris with per-ton billing. 
            You'll have access to larger sizes (20-50 yd) if needed.
          </p>
          <p className="text-xs text-amber-600 mt-2 font-medium">
            Flat-fee heavy pricing is not available when trash is present.
          </p>
        </div>
      </div>
    </div>
  );

  // Price summary
  const renderPriceSummary = () => {
    if (!classification.materialClass || classification.reclassifiedToMixed) return null;

    const category = HEAVY_MATERIAL_CATEGORIES.find(c => c.id === classification.materialClass);
    const priceResult = calculateHeavyPrice(selectedSize, classification.materialClass, cityId);

    return (
      <div className="p-4 rounded-xl bg-success/5 border border-success/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-foreground">{selectedSize} Yard Heavy</span>
          <span className="text-xl font-bold text-success">{formatHeavyPrice(priceResult.roundedPrice)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Check className="w-3 h-3 text-success" />
          <span>Flat fee — disposal included, no weight charges</span>
        </div>
        {category && category.increment > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            Includes +${category.increment} {category.label.toLowerCase()} handling
          </div>
        )}
        {priceResult.savingsMessage && (
          <div className="mt-2 text-xs text-success font-medium flex items-center gap-1">
            <Landmark className="w-3 h-3" />
            {priceResult.savingsMessage}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Question 1: Trash? */}
      {renderTrashQuestion()}

      {/* Show reclassification notice if trash present */}
      {hasTrash === true && renderReclassificationNotice()}

      {/* Question 2: Clean single type? (only if no trash) */}
      {hasTrash === false && (
        <>
          <div className="border-t border-border my-4" />
          {renderCleanTypeQuestion()}
        </>
      )}

      {/* Question 3: Which material? (only if clean single type) */}
      {hasTrash === false && isCleanSingleType === true && (
        <>
          <div className="border-t border-border my-4" />
          {renderMaterialTypeQuestion()}
        </>
      )}

      {/* Price summary */}
      {hasTrash === false && (isCleanSingleType === false || selectedMaterialType) && (
        <>
          <div className="border-t border-border my-4" />
          {renderPriceSummary()}
        </>
      )}

      {/* Disclaimer */}
      {hasTrash === false && (
        <p className="text-[10px] text-muted-foreground">
          * May be recyclable depending on facility and location. Estimates vary by material and loading. 
          Final billing is confirmed after the disposal scale ticket.
        </p>
      )}
    </div>
  );
}

export default HeavyMaterialSelector;

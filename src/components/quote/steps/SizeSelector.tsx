import { Package, Ruler, Weight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DUMPSTER_SIZES, MATERIAL_TYPES } from '@/components/quote/constants';

interface SizeSelectorProps {
  value: number;
  onChange: (size: number) => void;
  materialType: 'general' | 'heavy';
  onOpenEstimator?: () => void;
}

export function SizeSelector({ value, onChange, materialType, onOpenEstimator }: SizeSelectorProps) {
  const material = MATERIAL_TYPES.find((m) => m.value === materialType);
  const availableSizes = DUMPSTER_SIZES.filter((s) => material?.allowedSizes.includes(s.value));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Package className="w-4 h-4" />
          Dumpster Size
        </label>
        
        {onOpenEstimator && (
          <button
            type="button"
            onClick={onOpenEstimator}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Help me choose
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {availableSizes.map((size) => (
          <button
            key={size.id}
            type="button"
            onClick={() => onChange(size.value)}
            className={cn(
              "relative py-3 px-2 rounded-xl border-2 text-center transition-all duration-200",
              "hover:shadow-md",
              value === size.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-input bg-background hover:border-primary/50"
            )}
          >
            {size.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full whitespace-nowrap">
                POPULAR
              </span>
            )}
            
            <div className="text-xl font-bold text-foreground">{size.value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">yard</div>
            
            {value === size.value && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selected size details */}
      {value && (
        <div className="bg-muted/50 rounded-lg p-3">
          {(() => {
            const selectedSize = DUMPSTER_SIZES.find((s) => s.value === value);
            if (!selectedSize) return null;
            
            return (
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground">{selectedSize.label}</div>
                  <div className="text-sm text-muted-foreground">{selectedSize.description}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      {selectedSize.dimensions}
                    </span>
                    <span className="flex items-center gap-1">
                      <Weight className="w-3 h-3" />
                      {selectedSize.includedTons}T included
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

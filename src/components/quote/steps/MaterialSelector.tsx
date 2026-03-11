import { Trash2, HardHat, AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MATERIAL_TYPES } from '@/components/quote/constants';

interface MaterialSelectorProps {
  value: 'general' | 'heavy';
  onChange: (value: 'general' | 'heavy') => void;
}

// Icon mapping for material types (using canonical Lucide icons)
const MATERIAL_ICONS = {
  'general': Trash2,
  'heavy': HardHat,
} as const;

export function MaterialSelector({ value, onChange }: MaterialSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        What are you throwing away?
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {MATERIAL_TYPES.map((material) => {
          const IconComponent = MATERIAL_ICONS[material.value];
          const isSelected = value === material.value;
          
          return (
            <button
              key={material.value}
              type="button"
              onClick={() => onChange(material.value)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-input bg-background hover:border-primary/50"
              )}
            >
              {/* Icon in circular container - matches site-wide icon system */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                "bg-muted/80 border border-border/50",
                isSelected && "bg-primary/10 border-primary/20"
              )}>
                <IconComponent 
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isSelected ? "text-primary" : "text-foreground/70"
                  )}
                  strokeWidth={2}
                />
              </div>
              
              {/* Label and description */}
              <div className="font-semibold text-foreground">{material.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{material.description}</div>
              
              {/* Heavy materials size restriction notice */}
              {material.value === 'heavy' && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3 h-3" strokeWidth={2} />
                  <span>Limited to 5-10 yd</span>
                </div>
              )}
              
              {/* Selection checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { Recycle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MATERIAL_TYPES } from '@/components/quote/constants';

interface MaterialSelectorProps {
  value: 'general' | 'heavy';
  onChange: (value: 'general' | 'heavy') => void;
}

export function MaterialSelector({ value, onChange }: MaterialSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Recycle className="w-4 h-4" />
        What are you throwing away?
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {MATERIAL_TYPES.map((material) => (
          <button
            key={material.value}
            type="button"
            onClick={() => onChange(material.value)}
            className={cn(
              "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
              "hover:shadow-md",
              value === material.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-input bg-background hover:border-primary/50"
            )}
          >
            <div className="text-2xl mb-2">{material.icon}</div>
            <div className="font-semibold text-foreground">{material.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{material.description}</div>
            
            {material.value === 'heavy' && (
              <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Limited to 6-10 yd</span>
              </div>
            )}
            
            {value === material.value && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

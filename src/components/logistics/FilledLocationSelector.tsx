import { Warehouse, Truck, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { FilledLocation } from '@/lib/logisticsService';

interface FilledLocationSelectorProps {
  value: FilledLocation | null;
  onChange: (value: FilledLocation) => void;
  disabled?: boolean;
}

const LOCATIONS: { value: FilledLocation; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'customer', label: 'Customer Site', icon: <User className="w-4 h-4" />, description: 'Filled at customer location' },
  { value: 'yard', label: 'Yard', icon: <Warehouse className="w-4 h-4" />, description: 'Pre-filled at yard' },
  { value: 'truck', label: 'Truck', icon: <Truck className="w-4 h-4" />, description: 'Loaded directly on truck' },
];

export function FilledLocationSelector({ value, onChange, disabled = false }: FilledLocationSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Where was it filled?</Label>
      <RadioGroup
        value={value || ''}
        onValueChange={(v) => onChange(v as FilledLocation)}
        className="grid grid-cols-3 gap-2"
        disabled={disabled}
      >
        {LOCATIONS.map((location) => (
          <div key={location.value}>
            <RadioGroupItem
              value={location.value}
              id={`filled-${location.value}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`filled-${location.value}`}
              className={cn(
                "flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all text-center",
                "hover:border-primary/50 hover:bg-muted/50",
                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="p-2 rounded-full bg-muted">
                {location.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{location.label}</p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

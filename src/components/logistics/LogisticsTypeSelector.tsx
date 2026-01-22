import { useState } from 'react';
import { 
  Truck, Package, RefreshCw, Timer, RotateCw, Move, 
  HelpCircle, Warehouse, XCircle, List, Wrench, AlertTriangle
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LogisticsType, LOGISTICS_CONFIG } from '@/lib/logisticsService';

interface LogisticsTypeSelectorProps {
  value: LogisticsType;
  onChange: (value: LogisticsType) => void;
  showAll?: boolean;
  disabled?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  truck: <Truck className="w-4 h-4" />,
  package: <Package className="w-4 h-4" />,
  'refresh-cw': <RefreshCw className="w-4 h-4" />,
  timer: <Timer className="w-4 h-4" />,
  'rotate-cw': <RotateCw className="w-4 h-4" />,
  move: <Move className="w-4 h-4" />,
  'help-circle': <HelpCircle className="w-4 h-4" />,
  warehouse: <Warehouse className="w-4 h-4" />,
  'x-circle': <XCircle className="w-4 h-4" />,
  list: <List className="w-4 h-4" />,
  wrench: <Wrench className="w-4 h-4" />,
  'alert-triangle': <AlertTriangle className="w-4 h-4" />,
};

// Common scenarios shown by default
const COMMON_TYPES: LogisticsType[] = ['delivery', 'pickup', 'swap', 'live_load', 'dump_and_return'];

export function LogisticsTypeSelector({ value, onChange, showAll = false, disabled = false }: LogisticsTypeSelectorProps) {
  const [showMore, setShowMore] = useState(showAll);
  
  const typesToShow = showMore 
    ? (Object.keys(LOGISTICS_CONFIG) as LogisticsType[])
    : COMMON_TYPES;

  return (
    <div className="space-y-3">
      <Label>Logistics Type</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as LogisticsType)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        disabled={disabled}
      >
        {typesToShow.map((type) => {
          const config = LOGISTICS_CONFIG[type];
          return (
            <div key={type}>
              <RadioGroupItem
                value={type}
                id={`logistics-${type}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`logistics-${type}`}
                className={cn(
                  "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                  "hover:border-primary/50 hover:bg-muted/50",
                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className={cn("p-2 rounded-full", config.color)}>
                  {ICON_MAP[config.icon] || <Truck className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{config.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{config.description}</p>
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      
      {!showAll && (
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="text-sm text-primary hover:underline"
        >
          {showMore ? 'Show less' : 'Show all options...'}
        </button>
      )}
    </div>
  );
}

export function LogisticsTypeBadge({ type, className }: { type: LogisticsType; className?: string }) {
  const config = LOGISTICS_CONFIG[type];
  if (!config) return null;
  
  return (
    <Badge className={cn(config.color, className)}>
      {ICON_MAP[config.icon]}
      <span className="ml-1">{config.label}</span>
    </Badge>
  );
}

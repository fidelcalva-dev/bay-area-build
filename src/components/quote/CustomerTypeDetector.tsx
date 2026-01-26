// Customer Type Detector Component
// Shows auto-detected customer type with confidence and override option

import { useState } from 'react';
import { 
  Home, HardHat, Building2, Star, Warehouse, 
  ChevronDown, Check, RefreshCw, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  type CustomerType,
  type DetectionResult,
  getCustomerTypeLabel,
  getConfidenceBadgeColor,
} from '@/hooks/useCustomerTypeDetection';
import { Skeleton } from '@/components/ui/skeleton';

// Icon mapping
const CUSTOMER_TYPE_ICONS = {
  homeowner: Home,
  contractor: HardHat,
  business: Building2,
  preferred_contractor: Star,
  wholesaler: Warehouse,
};

const CUSTOMER_TYPES: CustomerType[] = ['homeowner', 'contractor', 'business'];

interface CustomerTypeDetectorProps {
  detectionResult: DetectionResult;
  selectedType: CustomerType;
  onTypeChange: (type: CustomerType) => void;
  isLoading?: boolean;
  isSpanish?: boolean;
  compact?: boolean;
}

export function CustomerTypeDetector({
  detectionResult,
  selectedType,
  onTypeChange,
  isLoading = false,
  isSpanish = false,
  compact = false,
}: CustomerTypeDetectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const IconComponent = CUSTOMER_TYPE_ICONS[selectedType] || User;
  const confidenceColor = getConfidenceBadgeColor(detectionResult.confidenceLevel);
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
    );
  }

  // Compact mode - just show chips
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {CUSTOMER_TYPES.map((type) => {
          const TypeIcon = CUSTOMER_TYPE_ICONS[type];
          const isSelected = selectedType === type;
          
          return (
            <button
              key={type}
              type="button"
              onClick={() => onTypeChange(type)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <TypeIcon className="w-4 h-4" strokeWidth={2} />
              <span>{getCustomerTypeLabel(type, isSpanish)}</span>
              {isSelected && detectionResult.wasAutoDetected && (
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", confidenceColor)}>
                  {isSpanish ? 'Detectado' : 'Detected'}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Full mode - dropdown with detection info
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex items-center gap-2 h-10 px-4",
                detectionResult.wasAutoDetected && "border-primary/50"
              )}
            >
              <IconComponent className="w-4 h-4" strokeWidth={2} />
              <span>{getCustomerTypeLabel(selectedType, isSpanish)}</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {CUSTOMER_TYPES.map((type) => {
              const TypeIcon = CUSTOMER_TYPE_ICONS[type];
              const isSelected = selectedType === type;
              
              return (
                <DropdownMenuItem
                  key={type}
                  onClick={() => {
                    onTypeChange(type);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    <TypeIcon className="w-4 h-4" strokeWidth={2} />
                    <span>{getCustomerTypeLabel(type, isSpanish)}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Detection badge */}
        {detectionResult.wasAutoDetected && (
          <Badge variant="outline" className={cn("text-xs", confidenceColor)}>
            <RefreshCw className="w-3 h-3 mr-1" />
            {detectionResult.confidenceLevel === 'high' 
              ? (isSpanish ? 'Alta confianza' : 'High confidence')
              : detectionResult.confidenceLevel === 'medium'
              ? (isSpanish ? 'Detectado' : 'Detected')
              : (isSpanish ? 'Sugerido' : 'Suggested')
            }
          </Badge>
        )}
      </div>

      {/* Detection signals (if any and not high confidence) */}
      {detectionResult.signals.length > 0 && detectionResult.confidenceLevel !== 'high' && (
        <p className="text-xs text-muted-foreground">
          {isSpanish 
            ? 'Basado en: ' + detectionResult.signals.slice(0, 2).map(s => s.ruleName).join(', ')
            : 'Based on: ' + detectionResult.signals.slice(0, 2).map(s => s.ruleName).join(', ')
          }
        </p>
      )}
    </div>
  );
}

export default CustomerTypeDetector;

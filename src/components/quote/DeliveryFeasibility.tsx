// Delivery Feasibility Check Component
// Shows delivery status based on ZIP and zone data

import { Truck, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliveryFeasibilityProps {
  zoneName: string | null;
  cityName?: string;
  isServiceable: boolean;
  className?: string;
}

// ZIP codes with known tight access issues (examples - expand as needed)
const TIGHT_ACCESS_ZIPS = ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112'];

export function DeliveryFeasibility({ 
  zoneName, 
  cityName, 
  isServiceable,
  className 
}: DeliveryFeasibilityProps) {
  if (!isServiceable) {
    return null; // Don't show if outside service area
  }

  // Determine if this is a tight access area
  const isTightAccess = zoneName?.toLowerCase().includes('sf') || 
                        cityName?.toLowerCase().includes('san francisco') ||
                        zoneName?.toLowerCase().includes('downtown');

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border",
      isTightAccess 
        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
        : "bg-success/5 border-success/30",
      className
    )}>
      {isTightAccess ? (
        <>
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm">
              Tight access — placement review recommended
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Urban areas may have limited space. We'll confirm placement during booking.
            </p>
          </div>
        </>
      ) : (
        <>
          <Truck className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm">
              Delivery looks good for this area
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cityName || zoneName} • Same-day delivery available
            </p>
          </div>
        </>
      )}
    </div>
  );
}

interface SaveResumeButtonProps {
  onSave: () => void;
  isLoading?: boolean;
  className?: string;
}

export function SaveResumeButton({ onSave, isLoading, className }: SaveResumeButtonProps) {
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-dashed border-primary/50 text-primary text-sm font-medium hover:bg-primary/5 transition-colors disabled:opacity-50",
        className
      )}
    >
      <MapPin className="w-4 h-4" />
      <span>Save & Resume Later</span>
    </button>
  );
}

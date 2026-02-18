// AccessConstraintStep — Lightweight "Placement & Access" questions
// Integrates into V3 quote flow or standalone

import { useState, useEffect } from 'react';
import { MapPin, Home, Construction, AlertTriangle, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { detectAccessConstraints, isHillZip, isSfZip, type AccessDetectionInput } from '@/lib/logistics/accessDetection';
import type { AccessFlag } from '@/lib/logistics/buffersConfig';

export type PlacementType = 'driveway' | 'street' | 'jobsite';

export interface AccessConstraintData {
  placementType: PlacementType;
  isTightAccess: boolean;
  gateCode: string;
  flags: AccessFlag[];
  flagsMap: Record<string, boolean>;
  warnings: string[];
  customerNote: string;
}

interface AccessConstraintStepProps {
  zip: string;
  city?: string;
  onComplete: (data: AccessConstraintData) => void;
  onSkip?: () => void;
  className?: string;
}

const PLACEMENT_OPTIONS: { value: PlacementType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'driveway', label: 'Driveway', icon: <Home className="w-5 h-5" />, desc: 'Private driveway or parking area' },
  { value: 'street', label: 'Street', icon: <MapPin className="w-5 h-5" />, desc: 'Public road or curbside' },
  { value: 'jobsite', label: 'Job Site', icon: <Construction className="w-5 h-5" />, desc: 'Construction or project site' },
];

export function AccessConstraintStep({
  zip,
  city,
  onComplete,
  onSkip,
  className,
}: AccessConstraintStepProps) {
  const [placementType, setPlacementType] = useState<PlacementType | null>(null);
  const [isTightAccess, setIsTightAccess] = useState<boolean | null>(null);
  const [gateCode, setGateCode] = useState('');
  const [showTightQ, setShowTightQ] = useState(false);

  // Show tight access question when placement is selected
  useEffect(() => {
    if (placementType) {
      setShowTightQ(true);
    }
  }, [placementType]);

  // Auto-detect if we should ask about tight access
  const isHilly = isHillZip(zip);
  const isSf = isSfZip(zip);

  const handleSubmit = () => {
    if (!placementType) return;

    const input: AccessDetectionInput = {
      zip,
      city,
      placementType,
      isTightAccess: isTightAccess ?? false,
      hasGateCode: gateCode.trim().length > 0,
    };

    const result = detectAccessConstraints(input);

    onComplete({
      placementType,
      isTightAccess: isTightAccess ?? false,
      gateCode: gateCode.trim(),
      flags: result.flags,
      flagsMap: result.flagsMap,
      warnings: result.warnings,
      customerNote: result.customerNote,
    });
  };

  return (
    <div className={cn('space-y-5', className)}>
      {/* Question 1: Where will it go? */}
      <div>
        <h4 className="text-base font-semibold text-foreground mb-1">Where will the dumpster go?</h4>
        <p className="text-sm text-muted-foreground mb-3">This helps us plan the delivery route and timing.</p>

        <div className="grid grid-cols-3 gap-2">
          {PLACEMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPlacementType(opt.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center',
                placementType === opt.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/40 bg-card'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center',
                placementType === opt.value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {opt.icon}
              </div>
              <span className="text-xs font-medium text-foreground">{opt.label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Question 2: Tight access? — shown after placement selection */}
      {showTightQ && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h4 className="text-base font-semibold text-foreground mb-1">Is access tight?</h4>
          <p className="text-sm text-muted-foreground mb-3">
            {isHilly
              ? 'Your area has steep grades. Let us know if the driveway or street is narrow.'
              : 'Narrow driveways, low-hanging trees, or limited clearance.'}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setIsTightAccess(true)}
              className={cn(
                'flex-1 p-3 rounded-xl border text-sm font-medium transition-all',
                isTightAccess === true
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-border bg-card text-foreground hover:border-amber-300'
              )}
            >
              Yes, it might be tight
            </button>
            <button
              onClick={() => setIsTightAccess(false)}
              className={cn(
                'flex-1 p-3 rounded-xl border text-sm font-medium transition-all',
                isTightAccess === false
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/40'
              )}
            >
              No, plenty of room
            </button>
          </div>
        </div>
      )}

      {/* Question 3: Gate code — optional */}
      {isTightAccess !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h4 className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            Gate code (optional)
          </h4>
          <Input
            value={gateCode}
            onChange={(e) => setGateCode(e.target.value)}
            placeholder="Enter gate code if applicable"
            className="rounded-xl"
          />
        </div>
      )}

      {/* Detected warnings */}
      {placementType && (isHilly || isSf || isTightAccess) && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            Access conditions may affect delivery timing and placement. Our dispatch team will coordinate accordingly.
          </p>
        </div>
      )}

      {/* Actions */}
      {isTightAccess !== null && (
        <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Button
            variant="cta"
            size="lg"
            className="flex-1 h-12 rounded-xl font-semibold"
            onClick={handleSubmit}
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {onSkip && (
        <button
          onClick={onSkip}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
        >
          Skip — our team will confirm access details
        </button>
      )}
    </div>
  );
}

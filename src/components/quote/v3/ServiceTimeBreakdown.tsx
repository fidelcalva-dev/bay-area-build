// ============================================================
// SERVICE TIME BREAKDOWN — Public + Internal views
// Shows delivery/pickup/swap time estimates in Price Moment
// ============================================================

import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Truck, MapPin, Timer, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceTimeEstimate } from './types';
import { SERVICE_TIME_DEFAULTS } from './types';

interface ServiceTimeBreakdownProps {
  estimate: ServiceTimeEstimate;
  yardName?: string;
  /** Show full internal breakdown (staff-only) */
  showInternal?: boolean;
  className?: string;
}

export function ServiceTimeBreakdown({
  estimate,
  yardName,
  showInternal = false,
  className,
}: ServiceTimeBreakdownProps) {
  const [expanded, setExpanded] = useState(false);

  const deliveryWindowMin = estimate.yardLoadMin + estimate.driveToSiteMin + estimate.dropoffMin;
  const deliveryWindowMax = estimate.yardLoadMin + estimate.driveToSiteMax + estimate.dropoffMin;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Public-facing service timing */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>
            Delivery: <span className="font-semibold text-foreground">{deliveryWindowMin}–{deliveryWindowMax} min</span>
            {yardName ? ` from ${yardName}` : ' from yard'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Pickup: scheduled on request</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Disposal handled by our team</span>
        </div>
      </div>

      {estimate.isSwap && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Swap includes pickup + delivery of replacement container</span>
        </div>
      )}

      {/* Internal breakdown toggle (staff-only) */}
      {showInternal && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
        >
          <Timer className="w-3 h-3" />
          <span className="font-medium">Full time breakdown</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}

      {showInternal && expanded && (
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5 text-xs">
          <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">Full Time Breakdown</p>

          <TimeRow icon={Truck} label="Yard load" min={estimate.yardLoadMin} max={estimate.yardLoadMin} />
          <TimeRow icon={ArrowRight} label="Drive to site" min={estimate.driveToSiteMin} max={estimate.driveToSiteMax} />
          <TimeRow icon={MapPin} label="Drop-off" min={estimate.dropoffMin} max={estimate.dropoffMin} />
          <TimeRow icon={Truck} label="Pickup" min={estimate.pickupMin} max={estimate.pickupMax} />
          <TimeRow icon={ArrowRight} label="Drive to facility" min={estimate.driveToFacilityMin} max={estimate.driveToFacilityMax} />
          <TimeRow icon={Timer} label="Dump" min={estimate.dumpTimeMin} max={estimate.dumpTimeMax} />
          <TimeRow icon={ArrowRight} label="Return to yard" min={estimate.returnToYardMin} max={estimate.returnToYardMax} />

          {estimate.isSwap && estimate.swapExtraMin != null && (
            <>
              <div className="border-t border-border/50 my-1.5" />
              <TimeRow icon={RotateCcw} label="Swap extra (drop + pick)" min={estimate.swapExtraMin} max={estimate.swapExtraMax ?? estimate.swapExtraMin} />
            </>
          )}

          <div className="border-t border-border my-1.5" />
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>Total cycle</span>
            <span>{estimate.totalMin}–{estimate.totalMax} min</span>
          </div>
        </div>
      )}
    </div>
  );
}

function TimeRow({
  icon: Icon,
  label,
  min,
  max,
}: {
  icon: React.ElementType;
  label: string;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-primary/60" />
        {label}
      </span>
      <span className="font-mono text-foreground/80">
        {min === max ? `${min} min` : `${min}–${max} min`}
      </span>
    </div>
  );
}

/** Build a ServiceTimeEstimate from distance data.
 *  Now delegates to the Calsan serviceTimeEngine for consistent standards. */
export function buildServiceTimeEstimate(params: {
  driveMinutes?: number;
  driveToFacilityMinutes?: number;
  returnMinutes?: number;
  isSwap?: boolean;
}): ServiceTimeEstimate {
  // Import Calsan standards inline to avoid circular deps
  const C = SERVICE_TIME_DEFAULTS;

  const driveMin = params.driveMinutes ?? 20;
  const driveToSiteMin = Math.round(driveMin * 0.85);
  const driveToSiteMax = Math.round(driveMin * 1.15);

  const facilityDrive = params.driveToFacilityMinutes ?? Math.round(driveMin * 0.8);
  const driveToFacilityMin = Math.round(facilityDrive * 0.85);
  const driveToFacilityMax = Math.round(facilityDrive * 1.15);

  const returnDrive = params.returnMinutes ?? Math.round(driveMin * 1.1);
  const returnMin = Math.round(returnDrive * 0.85);
  const returnMax = Math.round(returnDrive * 1.15);

  const isSwap = params.isSwap ?? false;
  const swapExtraMin = isSwap ? C.swapExtraMin : 0;
  const swapExtraMax = isSwap ? C.swapExtraMax : 0;

  const totalMin =
    C.yardLoad +
    driveToSiteMin +
    C.dropoff +
    C.pickupMin +
    driveToFacilityMin +
    C.dumpTimeMin +
    returnMin +
    swapExtraMin;

  const totalMax =
    C.yardLoad +
    driveToSiteMax +
    (isSwap ? 20 : C.dropoff) + // dropoff max for swap
    C.pickupMax +
    driveToFacilityMax +
    C.dumpTimeMax +
    returnMax +
    swapExtraMax;

  return {
    yardLoadMin: C.yardLoad,
    driveToSiteMin,
    driveToSiteMax,
    dropoffMin: C.dropoff,
    pickupMin: isSwap ? 30 : C.pickupMin,
    pickupMax: isSwap ? 30 : C.pickupMax,
    driveToFacilityMin,
    driveToFacilityMax,
    dumpTimeMin: C.dumpTimeMin,
    dumpTimeMax: C.dumpTimeMax,
    returnToYardMin: returnMin,
    returnToYardMax: returnMax,
    totalMin,
    totalMax,
    isSwap,
    swapExtraMin: isSwap ? C.swapExtraMin : undefined,
    swapExtraMax: isSwap ? C.swapExtraMax : undefined,
  };
}

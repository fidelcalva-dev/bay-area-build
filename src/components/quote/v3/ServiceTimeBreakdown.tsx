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
      {/* Public-facing delivery estimate */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>
          Estimated delivery: <span className="font-semibold text-foreground">{deliveryWindowMin}–{deliveryWindowMax} min</span>
          {yardName ? ` from ${yardName}` : ' from yard'}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>Pickup + disposal handled by our team</span>
      </div>

      {estimate.isSwap && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Swap includes pickup + delivery of replacement container</span>
        </div>
      )}

      {/* Internal breakdown toggle */}
      {showInternal && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
        >
          <Timer className="w-3 h-3" />
          <span className="font-medium">Time breakdown</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}

      {showInternal && expanded && (
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5 text-xs">
          <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">Service Time Breakdown</p>

          <TimeRow icon={Truck} label="Yard load" min={estimate.yardLoadMin} max={estimate.yardLoadMin} />
          <TimeRow icon={ArrowRight} label="Drive to site" min={estimate.driveToSiteMin} max={estimate.driveToSiteMax} />
          <TimeRow icon={MapPin} label="Dropoff" min={estimate.dropoffMin} max={estimate.dropoffMin} />

          <div className="border-t border-border/50 my-1.5" />

          <TimeRow icon={Truck} label="Pickup" min={estimate.pickupMin} max={estimate.pickupMax} />
          <TimeRow icon={ArrowRight} label="Drive to facility" min={estimate.driveToFacilityMin} max={estimate.driveToFacilityMax} />
          <TimeRow icon={Timer} label="Dump time" min={estimate.dumpTimeMin} max={estimate.dumpTimeMax} />
          <TimeRow icon={ArrowRight} label="Return to yard" min={estimate.returnToYardMin} max={estimate.returnToYardMax} />

          {estimate.isSwap && estimate.swapExtraMin != null && (
            <>
              <div className="border-t border-border/50 my-1.5" />
              <TimeRow icon={RotateCcw} label="Swap extra (drop + pick)" min={estimate.swapExtraMin} max={estimate.swapExtraMax ?? estimate.swapExtraMin} />
            </>
          )}

          <div className="border-t border-border my-1.5" />
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>Total estimated</span>
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

/** Build a ServiceTimeEstimate from distance data */
export function buildServiceTimeEstimate(params: {
  driveMinutes?: number;
  driveToFacilityMinutes?: number;
  returnMinutes?: number;
  isSwap?: boolean;
}): ServiceTimeEstimate {
  const driveMin = params.driveMinutes ?? 20;
  const driveToSiteMin = Math.round(driveMin * 0.85);
  const driveToSiteMax = Math.round(driveMin * 1.25);

  const facilityDrive = params.driveToFacilityMinutes ?? Math.round(driveMin * 0.8);
  const driveToFacilityMin = Math.round(facilityDrive * 0.85);
  const driveToFacilityMax = Math.round(facilityDrive * 1.25);

  const returnDrive = params.returnMinutes ?? Math.round(driveMin * 1.1);
  const returnMin = Math.round(returnDrive * 0.85);
  const returnMax = Math.round(returnDrive * 1.25);

  const isSwap = params.isSwap ?? false;
  const swapExtraMin = isSwap ? SERVICE_TIME_DEFAULTS.swapExtraMin : 0;
  const swapExtraMax = isSwap ? SERVICE_TIME_DEFAULTS.swapExtraMax : 0;

  const totalMin =
    SERVICE_TIME_DEFAULTS.yardLoad +
    driveToSiteMin +
    SERVICE_TIME_DEFAULTS.dropoff +
    SERVICE_TIME_DEFAULTS.pickupMin +
    driveToFacilityMin +
    SERVICE_TIME_DEFAULTS.dumpTimeMin +
    returnMin +
    swapExtraMin;

  const totalMax =
    SERVICE_TIME_DEFAULTS.yardLoad +
    driveToSiteMax +
    SERVICE_TIME_DEFAULTS.dropoff +
    SERVICE_TIME_DEFAULTS.pickupMax +
    driveToFacilityMax +
    SERVICE_TIME_DEFAULTS.dumpTimeMax +
    returnMax +
    swapExtraMax;

  return {
    yardLoadMin: SERVICE_TIME_DEFAULTS.yardLoad,
    driveToSiteMin,
    driveToSiteMax,
    dropoffMin: SERVICE_TIME_DEFAULTS.dropoff,
    pickupMin: SERVICE_TIME_DEFAULTS.pickupMin,
    pickupMax: SERVICE_TIME_DEFAULTS.pickupMax,
    driveToFacilityMin,
    driveToFacilityMax,
    dumpTimeMin: SERVICE_TIME_DEFAULTS.dumpTimeMin,
    dumpTimeMax: SERVICE_TIME_DEFAULTS.dumpTimeMax,
    returnToYardMin: returnMin,
    returnToYardMax: returnMax,
    totalMin,
    totalMax,
    isSwap,
    swapExtraMin: isSwap ? SERVICE_TIME_DEFAULTS.swapExtraMin : undefined,
    swapExtraMax: isSwap ? SERVICE_TIME_DEFAULTS.swapExtraMax : undefined,
  };
}

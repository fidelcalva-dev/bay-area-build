import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ServiceTimeEstimate } from '../types';

interface ServiceCycleBarProps {
  estimate: ServiceTimeEstimate;
  showInternalLink?: boolean;
  onToggleInternal?: () => void;
  className?: string;
}

const SEGMENTS = [
  { key: 'prep', label: 'Prep', colorClass: 'bg-primary/20' },
  { key: 'deliver', label: 'Deliver', colorClass: 'bg-primary/35' },
  { key: 'pickup', label: 'Pickup', colorClass: 'bg-primary/50' },
  { key: 'dispose', label: 'Dispose + Return', colorClass: 'bg-primary/30' },
] as const;

function getSegmentWeights(est: ServiceTimeEstimate) {
  const prep = est.yardLoadMin;
  const deliver = (est.driveToSiteMin + est.driveToSiteMax) / 2 + est.dropoffMin;
  const pickup = (est.pickupMin + est.pickupMax) / 2;
  const dispose =
    (est.driveToFacilityMin + est.driveToFacilityMax) / 2 +
    (est.dumpTimeMin + est.dumpTimeMax) / 2 +
    (est.returnToYardMin + est.returnToYardMax) / 2;
  const total = prep + deliver + pickup + dispose;
  return [prep / total, deliver / total, pickup / total, dispose / total];
}

export function ServiceCycleBar({
  estimate,
  showInternalLink = false,
  onToggleInternal,
  className,
}: ServiceCycleBarProps) {
  const weights = useMemo(() => getSegmentWeights(estimate), [estimate]);

  const totalHoursMin = (estimate.totalMin / 60).toFixed(1);
  const totalHoursMax = (estimate.totalMax / 60).toFixed(1);
  const isSwap = estimate.isSwap;

  const segments = useMemo(
    () =>
      SEGMENTS.map((s) =>
        s.key === 'pickup' && isSwap ? { ...s, label: 'Swap' } : s
      ),
    [isSwap]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Title */}
      <div className="space-y-0.5">
        <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">
          Service Time (Estimated)
        </p>
        <p className="text-xs text-muted-foreground">
          {isSwap ? 'Swap cycle estimated' : 'Total service cycle'}:{' '}
          <span className="font-semibold text-foreground">
            {totalHoursMin}&ndash;{totalHoursMax} hours
          </span>
        </p>
      </div>

      {/* Bar */}
      <div className="flex h-[10px] rounded-full overflow-hidden bg-muted/40 border border-border/30">
        {segments.map((seg, i) => (
          <div
            key={seg.key}
            className={cn(
              seg.colorClass,
              'transition-all duration-300',
              i < segments.length - 1 && 'border-r border-background/60'
            )}
            style={{ width: `${(weights[i] * 100).toFixed(1)}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg, i) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <span
              className={cn('w-2 h-2 rounded-full shrink-0', seg.colorClass)}
            />
            <span className="text-[10px] text-muted-foreground">{seg.label}</span>
          </div>
        ))}
      </div>

      {/* Subtext */}
      <p className="text-[10px] text-muted-foreground/70">
        Time varies by traffic, access, and facility routing.
      </p>

      {/* Staff link */}
      {showInternalLink && onToggleInternal && (
        <button
          type="button"
          onClick={onToggleInternal}
          className="text-[10px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
        >
          View full breakdown
        </button>
      )}
    </div>
  );
}

export default ServiceCycleBar;

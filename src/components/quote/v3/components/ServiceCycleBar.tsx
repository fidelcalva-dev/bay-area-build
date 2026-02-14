import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import type { ServiceTimeEstimate } from '../types';

interface ServiceCycleBarProps {
  estimate: ServiceTimeEstimate;
  showInternalLink?: boolean;
  onToggleInternal?: () => void;
  className?: string;
}

const SEGMENTS = [
  { key: 'prep', label: 'Prep', colorClass: 'bg-foreground/10' },
  { key: 'deliver', label: 'Deliver', colorClass: 'bg-foreground/18' },
  { key: 'pickup', label: 'Pickup', colorClass: 'bg-primary/25' },
  { key: 'dispose', label: 'Dispose + Return', colorClass: 'bg-foreground/12' },
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const totalHoursMin = (estimate.totalMin / 60).toFixed(1);
  const totalHoursMax = (estimate.totalMax / 60).toFixed(1);
  const isSwap = estimate.isSwap;

  // Typical marker
  const typicalMin = Math.round((estimate.totalMin + estimate.totalMax) / 2);
  const typicalHours = (typicalMin / 60).toFixed(1);
  const range = estimate.totalMax - estimate.totalMin;
  const typicalPct = range > 0
    ? Math.min(0.9, Math.max(0.1, (typicalMin - estimate.totalMin) / range))
    : 0.5;

  const segments = useMemo(
    () =>
      SEGMENTS.map((s) =>
        s.key === 'pickup' && isSwap ? { ...s, label: 'Swap' } : s
      ),
    [isSwap]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Title + subtitle */}
      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
          Service Time (Estimated)
        </p>
        <p className="text-sm text-muted-foreground">
          {isSwap ? 'Swap cycle estimated' : 'Total service cycle'}:{' '}
          <span className="font-semibold text-foreground">
            {totalHoursMin}&ndash;{totalHoursMax} hours
          </span>
        </p>
      </div>

      {/* Badge row */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 border border-border/40 rounded-full px-2.5 py-0.5">
          <MapPin className="w-3 h-3" />
          Local routing selected automatically
        </span>
        <span className="text-[10px] text-muted-foreground/70 bg-muted/30 border border-border/30 rounded-full px-2.5 py-0.5">
          Time varies by traffic and access
        </span>
      </div>

      {/* Bar with marker */}
      <div className="relative pt-6 pb-1">
        {/* Typical marker */}
        <div
          className={cn(
            'absolute top-0 flex flex-col items-center transition-opacity duration-300',
            mounted ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            left: `${(typicalPct * 100).toFixed(1)}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="text-[9px] font-medium text-foreground bg-background border border-border/60 rounded-full px-2 py-0.5 whitespace-nowrap shadow-sm">
            Typical: {typicalHours}h
          </span>
          <div className="w-px h-2 bg-foreground/40" />
        </div>

        {/* Bar */}
        <div className="flex h-[10px] rounded-full overflow-hidden bg-muted/40 border border-border/30">
          {segments.map((seg, i) => (
            <div
              key={seg.key}
              className={cn(
                seg.colorClass,
                'transition-all ease-out',
                i < segments.length - 1 && 'border-r border-background/60'
              )}
              style={{
                width: mounted ? `${(weights[i] * 100).toFixed(1)}%` : '0%',
                transitionDuration: `${400 + i * 100}ms`,
                transitionDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full shrink-0', seg.colorClass)} />
            <span className="text-[10px] text-muted-foreground">{seg.label}</span>
          </div>
        ))}
      </div>

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

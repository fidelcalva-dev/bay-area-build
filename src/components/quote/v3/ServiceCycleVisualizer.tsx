// ============================================================
// SERVICE CYCLE VISUALIZER — Premium animated logistics timeline
// Uber Black-grade visual for customer-facing service cycle
// ============================================================

import { useRef, useMemo, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Truck, MapPin, Package, Shield, Clock, RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ServiceTimeEstimate } from './types';

// ── Phase definitions ────────────────────────────────────────
interface Phase {
  id: string;
  label: string;
  icon: LucideIcon;
  tooltip: string;
  getRange: (est: ServiceTimeEstimate) => { min: number; max: number };
}

const DELIVERY_PHASES: Phase[] = [
  {
    id: 'load',
    label: 'Load at Yard',
    icon: Package,
    tooltip: 'Container is secured to truck before departure.',
    getRange: (est) => ({ min: est.yardLoadMin, max: est.yardLoadMin }),
  },
  {
    id: 'travel-to-site',
    label: 'Travel to Site',
    icon: Truck,
    tooltip: 'Route optimized based on traffic conditions.',
    getRange: (est) => ({ min: est.driveToSiteMin, max: est.driveToSiteMax }),
  },
  {
    id: 'dropoff',
    label: 'Drop-Off',
    icon: MapPin,
    tooltip: 'Driver places container safely and confirms positioning.',
    getRange: (est) => ({ min: est.dropoffMin, max: est.dropoffMin }),
  },
  {
    id: 'pickup',
    label: 'Pickup',
    icon: Shield,
    tooltip: 'Container is secured and prepared for transport.',
    getRange: (est) => ({ min: est.pickupMin, max: est.pickupMax }),
  },
  {
    id: 'disposal',
    label: 'Disposal',
    icon: RotateCcw,
    tooltip: 'Material unloaded at authorized facility.',
    getRange: (est) => ({ min: est.dumpTimeMin, max: est.dumpTimeMax }),
  },
  {
    id: 'return',
    label: 'Return',
    icon: Truck,
    tooltip: 'Truck returns to yard for next dispatch.',
    getRange: (est) => ({ min: est.returnToYardMin, max: est.returnToYardMax }),
  },
];

// ── Internal breakdown rows ──────────────────────────────────
interface InternalRow {
  label: string;
  getRange: (est: ServiceTimeEstimate) => { min: number; max: number };
}

const INTERNAL_ROWS: InternalRow[] = [
  { label: 'Yard Load', getRange: (e) => ({ min: e.yardLoadMin, max: e.yardLoadMin }) },
  { label: 'Drive to Site', getRange: (e) => ({ min: e.driveToSiteMin, max: e.driveToSiteMax }) },
  { label: 'Drop-off', getRange: (e) => ({ min: e.dropoffMin, max: e.dropoffMin }) },
  { label: 'Pickup', getRange: (e) => ({ min: e.pickupMin, max: e.pickupMax }) },
  { label: 'Drive to Facility', getRange: (e) => ({ min: e.driveToFacilityMin, max: e.driveToFacilityMax }) },
  { label: 'Dump Process', getRange: (e) => ({ min: e.dumpTimeMin, max: e.dumpTimeMax }) },
  { label: 'Return to Yard', getRange: (e) => ({ min: e.returnToYardMin, max: e.returnToYardMax }) },
];

// ── Props ────────────────────────────────────────────────────
interface ServiceCycleVisualizerProps {
  estimate: ServiceTimeEstimate;
  showInternal?: boolean;
  className?: string;
}

// ── Component ────────────────────────────────────────────────
export function ServiceCycleVisualizer({
  estimate,
  showInternal = false,
  className,
}: ServiceCycleVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const isMobile = useIsMobile();

  // Swap label override
  const phases = useMemo(() => {
    if (!estimate.isSwap) return DELIVERY_PHASES;
    return DELIVERY_PHASES.map((p) =>
      p.id === 'pickup'
        ? { ...p, label: 'Swap', tooltip: 'Full container picked up and replacement dropped.' }
        : p
    );
  }, [estimate.isSwap]);

  // Total cycle
  const totalMin = estimate.totalMin;
  const totalMax = estimate.totalMax;
  const totalMinHours = (totalMin / 60).toFixed(1);
  const totalMaxHours = (totalMax / 60).toFixed(1);

  return (
    <div ref={containerRef} className={cn('space-y-4', className)}>
      {/* Title */}
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">
          Professional Service Cycle
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your container is handled from yard to disposal and back.
        </p>
      </div>

      {/* Conversion line */}
      <p className="text-xs font-medium text-foreground/80">
        Handled by a real local yard, not a broker.
      </p>

      {/* Timeline */}
      <TooltipProvider delayDuration={200}>
        {isMobile ? (
          <VerticalTimeline phases={phases} estimate={estimate} isInView={isInView} />
        ) : (
          <HorizontalTimeline phases={phases} estimate={estimate} isInView={isInView} />
        )}
      </TooltipProvider>

      {/* Total duration — appears after animation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: phases.length * 0.5 + 0.3, duration: 0.4, ease: 'easeOut' }}
        className="rounded-xl border border-border/50 bg-card p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {estimate.isSwap ? 'Swap cycle estimated' : 'Estimated Full Service Cycle'}:&nbsp;
              {totalMinHours} &ndash; {totalMaxHours} hours
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Includes travel, placement, secure transport, legal disposal, and return routing.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Transparency line */}
      <p className="text-[11px] text-muted-foreground text-center">
        Transparent operations. Transparent pricing.
      </p>

      <p className="text-[10px] text-muted-foreground/70 text-center">
        Timing may vary slightly depending on traffic and material type.
      </p>

      {/* Internal breakdown — staff only */}
      {showInternal && (
        <InternalBreakdown estimate={estimate} />
      )}
    </div>
  );
}

// ── Horizontal Timeline (Desktop) ───────────────────────────
function HorizontalTimeline({
  phases,
  estimate,
  isInView,
}: {
  phases: Phase[];
  estimate: ServiceTimeEstimate;
  isInView: boolean;
}) {
  return (
    <div className="relative flex items-start gap-0 overflow-x-auto pb-2">
      {phases.map((phase, i) => {
        const range = phase.getRange(estimate);
        const isLast = i === phases.length - 1;
        const Icon = phase.icon;

        return (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              delay: i * 0.5,
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="flex items-start flex-1 min-w-0"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-2 cursor-default px-1 w-full">
                  {/* Icon circle */}
                  <motion.div
                    initial={{ backgroundColor: 'hsl(var(--muted))' }}
                    animate={
                      isInView
                        ? { backgroundColor: 'hsl(var(--primary) / 0.12)' }
                        : {}
                    }
                    transition={{ delay: i * 0.5 + 0.2, duration: 0.3 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-border/40 shrink-0"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                  </motion.div>

                  {/* Label */}
                  <span className="text-[10px] font-medium text-foreground text-center leading-tight">
                    {phase.label}
                  </span>

                  {/* Duration */}
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {range.min === range.max
                      ? `${range.min}m`
                      : `${range.min}-${range.max}m`}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                <p className="font-semibold mb-0.5">{phase.label}</p>
                <p className="text-muted-foreground">{phase.tooltip}</p>
              </TooltipContent>
            </Tooltip>

            {/* Connector line */}
            {!isLast && (
              <div className="flex items-center pt-5 px-0">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{
                    delay: i * 0.5 + 0.3,
                    duration: 0.3,
                    ease: 'easeOut',
                  }}
                  className="h-px w-4 bg-border origin-left shrink-0"
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Vertical Timeline (Mobile) ──────────────────────────────
function VerticalTimeline({
  phases,
  estimate,
  isInView,
}: {
  phases: Phase[];
  estimate: ServiceTimeEstimate;
  isInView: boolean;
}) {
  const [tappedPhase, setTappedPhase] = useState<string | null>(null);

  return (
    <div className="relative space-y-0">
      {phases.map((phase, i) => {
        const range = phase.getRange(estimate);
        const isLast = i === phases.length - 1;
        const Icon = phase.icon;
        const isTapped = tappedPhase === phase.id;

        return (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              delay: i * 0.5,
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative flex gap-3"
          >
            {/* Vertical connector */}
            {!isLast && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={isInView ? { scaleY: 1 } : {}}
                transition={{ delay: i * 0.5 + 0.3, duration: 0.3 }}
                className="absolute left-5 top-10 w-px h-[calc(100%-4px)] bg-border origin-top"
              />
            )}

            {/* Icon */}
            <motion.div
              initial={{ backgroundColor: 'hsl(var(--muted))' }}
              animate={isInView ? { backgroundColor: 'hsl(var(--primary) / 0.12)' } : {}}
              transition={{ delay: i * 0.5 + 0.2, duration: 0.3 }}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border/40 shrink-0 z-10"
            >
              <Icon className="w-4 h-4 text-primary" />
            </motion.div>

            {/* Content */}
            <button
              type="button"
              onClick={() => setTappedPhase(isTapped ? null : phase.id)}
              className={cn(
                'flex-1 text-left pb-4 pt-2 transition-colors',
                !isLast && 'border-b-0'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{phase.label}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {range.min === range.max
                    ? `${range.min} min`
                    : `${range.min}-${range.max} min`}
                </span>
              </div>
              {isTapped && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-muted-foreground mt-1 leading-relaxed"
                >
                  {phase.tooltip}
                </motion.p>
              )}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Internal Breakdown (Staff Only) ─────────────────────────
function InternalBreakdown({ estimate }: { estimate: ServiceTimeEstimate }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 space-y-2">
      <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">
        Internal Logistics Breakdown
      </p>
      <div className="space-y-1.5">
        {INTERNAL_ROWS.map((row) => {
          const range = row.getRange(estimate);
          return (
            <div key={row.label} className="flex justify-between text-xs text-muted-foreground">
              <span>{row.label}</span>
              <span className="font-mono text-foreground/80">
                {range.min === range.max ? `${range.min} min` : `${range.min}-${range.max} min`}
              </span>
            </div>
          );
        })}
        {estimate.isSwap && estimate.swapExtraMin != null && (
          <>
            <div className="border-t border-border/40 my-1" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Swap Extra (drop + pick)</span>
              <span className="font-mono text-foreground/80">
                {estimate.swapExtraMin}-{estimate.swapExtraMax ?? estimate.swapExtraMin} min
              </span>
            </div>
          </>
        )}
        <div className="border-t border-border my-1" />
        <div className="flex justify-between text-xs font-semibold text-foreground">
          <span>Total Cycle</span>
          <span>{estimate.totalMin}-{estimate.totalMax} min</span>
        </div>
      </div>
    </div>
  );
}

export default ServiceCycleVisualizer;

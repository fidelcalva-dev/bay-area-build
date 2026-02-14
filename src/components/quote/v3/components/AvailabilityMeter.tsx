import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ConfidenceLevel } from '../hooks/useAvailabilityConfidence';

interface AvailabilityMeterProps {
  confidence: ConfidenceLevel;
  sameDayLikely: boolean;
  loading: boolean;
  className?: string;
}

const LEVELS: { key: ConfidenceLevel; label: string; color: string }[] = [
  { key: 'limited', label: 'Limited', color: 'bg-foreground/15' },
  { key: 'medium', label: 'Medium', color: 'bg-primary/30' },
  { key: 'high', label: 'High', color: 'bg-primary/60' },
];

const SUBTEXT: Record<ConfidenceLevel, string> = {
  high: 'Same-day may be available. Next-day likely.',
  medium: 'Next-day likely. Same-day may be limited.',
  limited: 'Limited availability. We may confirm an alternate time.',
  unknown: 'Availability confirmed at scheduling.',
};

const URGENCY: Record<ConfidenceLevel, string | null> = {
  high: 'Reserve now to lock availability.',
  medium: null,
  limited: 'Call dispatch for fastest confirmation.',
  unknown: null,
};

export function AvailabilityMeter({
  confidence,
  sameDayLikely,
  loading,
  className,
}: AvailabilityMeterProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (confidence === 'unknown' && !loading) {
    return (
      <div className={cn('space-y-1.5', className)}>
        <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
          Delivery Availability (Estimated)
        </p>
        <p className="text-[10px] text-muted-foreground">
          Service time confirmed at scheduling.
        </p>
      </div>
    );
  }

  const activeIdx = LEVELS.findIndex((l) => l.key === confidence);
  const urgencyText = URGENCY[confidence];

  return (
    <div className={cn('space-y-2.5', className)}>
      {/* Title */}
      <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
        Delivery Availability (Estimated)
      </p>

      {/* Meter bar */}
      <div className="flex gap-1 h-[8px]">
        {LEVELS.map((level, i) => {
          const isActive = i <= activeIdx && !loading;
          return (
            <div
              key={level.key}
              className={cn(
                'flex-1 rounded-full transition-all duration-500',
                isActive && mounted ? level.color : 'bg-muted/40',
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            />
          );
        })}
      </div>

      {/* Label row */}
      <div className="flex justify-between">
        {LEVELS.map((level, i) => (
          <span
            key={level.key}
            className={cn(
              'text-[9px] uppercase tracking-wide',
              i === activeIdx && !loading
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground/50',
            )}
          >
            {level.label}
          </span>
        ))}
      </div>

      {/* Subtext */}
      {!loading && (
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {SUBTEXT[confidence]}
        </p>
      )}

      {/* Urgency note */}
      {!loading && urgencyText && (
        <p className="text-[10px] font-medium text-foreground/80">
          {urgencyText}
        </p>
      )}

      {/* Disclaimer */}
      <p className="text-[9px] text-muted-foreground/60">
        Availability depends on routing and confirmed scheduling.
      </p>
    </div>
  );
}

export default AvailabilityMeter;

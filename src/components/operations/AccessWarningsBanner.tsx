// Dispatch Access Warnings — shown in run detail for dispatchers/drivers

import { AlertTriangle, Mountain, MapPin, Lock, Ban, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccessFlag } from '@/lib/logistics/buffersConfig';

interface AccessWarningsBannerProps {
  accessFlags: Record<string, boolean> | AccessFlag[];
  placementType?: string;
  gateCode?: string;
  /** compact = inline badge row, full = detailed list */
  variant?: 'compact' | 'full';
  className?: string;
}

const FLAG_CONFIG: Record<AccessFlag, { icon: React.ReactNode; label: string; detail: string; color: string }> = {
  tight_access: {
    icon: <Ban className="w-3.5 h-3.5" />,
    label: 'Tight Access',
    detail: 'Narrow driveway or limited clearance. Approach with caution.',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  hills: {
    icon: <Mountain className="w-3.5 h-3.5" />,
    label: 'Hillside',
    detail: 'Steep grade area. Use wheel chocks and verify placement stability.',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
  },
  street_placement: {
    icon: <MapPin className="w-3.5 h-3.5" />,
    label: 'Street Placement',
    detail: 'Dumpster placed on public road. Verify permit and coning requirements.',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  gated: {
    icon: <Lock className="w-3.5 h-3.5" />,
    label: 'Gated',
    detail: 'Gated property. Confirm gate code before dispatch.',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  limited_access: {
    icon: <Truck className="w-3.5 h-3.5" />,
    label: 'Limited Access',
    detail: 'Restricted access area. Advance coordination required.',
    color: 'text-red-700 bg-red-50 border-red-200',
  },
};

export function AccessWarningsBanner({
  accessFlags,
  placementType,
  gateCode,
  variant = 'compact',
  className,
}: AccessWarningsBannerProps) {
  // Normalize flags to array
  const activeFlags: AccessFlag[] = Array.isArray(accessFlags)
    ? accessFlags
    : (Object.entries(accessFlags)
        .filter(([, v]) => v)
        .map(([k]) => k) as AccessFlag[]);

  if (activeFlags.length === 0) return null;

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {activeFlags.map((flag) => {
          const config = FLAG_CONFIG[flag];
          if (!config) return null;
          return (
            <span
              key={flag}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium',
                config.color
              )}
            >
              {config.icon}
              {config.label}
            </span>
          );
        })}
      </div>
    );
  }

  // Full variant — detailed list for dispatch/driver
  return (
    <div className={cn('rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-2', className)}>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
        <AlertTriangle className="w-4 h-4" />
        Access Warnings
      </div>

      {activeFlags.map((flag) => {
        const config = FLAG_CONFIG[flag];
        if (!config) return null;
        return (
          <div key={flag} className="flex items-start gap-2 text-xs">
            <span className={cn('mt-0.5', config.color.split(' ')[0])}>{config.icon}</span>
            <div>
              <span className="font-medium text-foreground">{config.label}:</span>{' '}
              <span className="text-muted-foreground">{config.detail}</span>
            </div>
          </div>
        );
      })}

      {placementType && (
        <div className="text-xs text-muted-foreground pt-1 border-t border-amber-200/50">
          Placement: <span className="font-medium text-foreground capitalize">{placementType}</span>
        </div>
      )}

      {gateCode && (
        <div className="text-xs text-muted-foreground">
          Gate Code: <span className="font-mono font-medium text-foreground">{gateCode}</span>
        </div>
      )}
    </div>
  );
}

// Visual Timeline for Operational Time

import { Truck, MapPin, Factory, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/services/operationalTimeService';
import type { OperationalTimeResult, ServiceType } from '@/types/operationalTime';

interface OperationalTimeTimelineProps {
  result: OperationalTimeResult;
  className?: string;
}

export function OperationalTimeTimeline({ result, className }: OperationalTimeTimelineProps) {
  const steps = buildTimelineSteps(result);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-sm font-medium text-muted-foreground mb-3">
        Service Flow: {result.service_type}
      </div>
      
      <div className="flex items-center gap-1 flex-wrap">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <TimelineStep step={step} />
            {index < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total Time</span>
        <span className="text-lg font-bold">{formatDuration(result.total_time_minutes)}</span>
      </div>
    </div>
  );
}

interface TimelineStepData {
  icon: React.ReactNode;
  label: string;
  duration: number;
  type: 'location' | 'action' | 'travel';
}

function TimelineStep({ step }: { step: TimelineStepData }) {
  const bgColor = step.type === 'location' 
    ? 'bg-primary/10 text-primary' 
    : step.type === 'travel' 
    ? 'bg-muted text-muted-foreground'
    : 'bg-secondary text-secondary-foreground';

  return (
    <div className={cn('flex flex-col items-center p-2 rounded-lg min-w-[80px]', bgColor)}>
      <div className="mb-1">{step.icon}</div>
      <div className="text-xs font-medium text-center">{step.label}</div>
      <div className="text-xs opacity-75">{formatDuration(step.duration)}</div>
    </div>
  );
}

function buildTimelineSteps(result: OperationalTimeResult): TimelineStepData[] {
  const { service_type, breakdown, route_details } = result;
  const steps: TimelineStepData[] = [];

  // All flows start at yard
  steps.push({
    icon: <Truck className="h-5 w-5" />,
    label: result.origin_yard,
    duration: breakdown.yard_time,
    type: 'location',
  });

  // Drive to site
  const yardToSiteDrive = route_details?.yard_to_site_miles 
    ? Math.round((route_details.yard_to_site_miles / 25) * 60) // ~25 mph average
    : Math.round(breakdown.drive_time / 3);

  steps.push({
    icon: <MapPin className="h-5 w-5" />,
    label: 'Drive',
    duration: yardToSiteDrive,
    type: 'travel',
  });

  // At job site
  if (service_type === 'DELIVERY') {
    steps.push({
      icon: <MapPin className="h-5 w-5" />,
      label: 'Job Site',
      duration: breakdown.jobsite_time,
      type: 'location',
    });
  } else if (service_type === 'PICKUP') {
    steps.push({
      icon: <MapPin className="h-5 w-5" />,
      label: 'Pickup',
      duration: Math.round(breakdown.jobsite_time / 2),
      type: 'location',
    });

    // Drive to facility
    steps.push({
      icon: <Clock className="h-5 w-5" />,
      label: 'Drive',
      duration: Math.round(breakdown.drive_time / 3),
      type: 'travel',
    });

    // At facility
    if (result.facility) {
      steps.push({
        icon: <Factory className="h-5 w-5" />,
        label: 'Dump',
        duration: breakdown.dump_time,
        type: 'location',
      });
    }

    // Drive back to yard
    steps.push({
      icon: <Clock className="h-5 w-5" />,
      label: 'Return',
      duration: Math.round(breakdown.drive_time / 3),
      type: 'travel',
    });

    steps.push({
      icon: <Truck className="h-5 w-5" />,
      label: 'Yard',
      duration: 0,
      type: 'location',
    });

  } else if (service_type === 'SWAP') {
    // First stop - pickup
    steps.push({
      icon: <MapPin className="h-5 w-5" />,
      label: 'Pickup',
      duration: Math.round(breakdown.jobsite_time / 3),
      type: 'location',
    });

    // To facility
    steps.push({
      icon: <Clock className="h-5 w-5" />,
      label: 'Drive',
      duration: Math.round(breakdown.drive_time / 4),
      type: 'travel',
    });

    // Dump
    if (result.facility) {
      steps.push({
        icon: <Factory className="h-5 w-5" />,
        label: 'Dump',
        duration: breakdown.dump_time,
        type: 'location',
      });
    }

    // Back to site
    steps.push({
      icon: <Clock className="h-5 w-5" />,
      label: 'Drive',
      duration: Math.round(breakdown.drive_time / 4),
      type: 'travel',
    });

    // Deliver new
    steps.push({
      icon: <MapPin className="h-5 w-5" />,
      label: 'Deliver',
      duration: Math.round(breakdown.jobsite_time / 3),
      type: 'location',
    });

    // Return to yard
    steps.push({
      icon: <Clock className="h-5 w-5" />,
      label: 'Return',
      duration: Math.round(breakdown.drive_time / 4),
      type: 'travel',
    });

    steps.push({
      icon: <Truck className="h-5 w-5" />,
      label: 'Yard',
      duration: 0,
      type: 'location',
    });
  }

  return steps;
}

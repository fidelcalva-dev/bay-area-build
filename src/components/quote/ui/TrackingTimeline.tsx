// ============================================================
// TRACKING TIMELINE - Uber-like order status timeline
// Shows order progress from placement to completion
// ============================================================
import { cn } from '@/lib/utils';
import { 
  Check, Clock, Truck, Package, Calendar, 
  CheckCircle, Circle, MapPin, type LucideIcon 
} from 'lucide-react';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  status: 'completed' | 'current' | 'upcoming';
  timestamp?: string | Date;
  eta?: string;
}

interface TrackingTimelineProps {
  steps: TimelineStep[];
  className?: string;
  showTimestamps?: boolean;
  compact?: boolean;
}

const STATUS_CONFIGS = {
  completed: {
    iconBg: 'bg-success',
    iconColor: 'text-success-foreground',
    lineColor: 'bg-success',
    textColor: 'text-foreground',
    Icon: Check,
  },
  current: {
    iconBg: 'bg-primary',
    iconColor: 'text-primary-foreground',
    lineColor: 'bg-border',
    textColor: 'text-foreground font-semibold',
    Icon: Clock,
  },
  upcoming: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    lineColor: 'bg-border',
    textColor: 'text-muted-foreground',
    Icon: Circle,
  },
};

function formatTimestamp(timestamp: string | Date | undefined): string | null {
  if (!timestamp) return null;
  
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    if (!isValid(date)) return null;
    
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    return format(date, 'MMM d, h:mm a');
  } catch {
    return null;
  }
}

export function TrackingTimeline({
  steps,
  className,
  showTimestamps = true,
  compact = false,
}: TrackingTimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {steps.map((step, index) => {
        const config = STATUS_CONFIGS[step.status];
        const isLast = index === steps.length - 1;
        const StepIcon = step.icon || config.Icon;
        const formattedTime = showTimestamps ? formatTimestamp(step.timestamp) : null;

        return (
          <div 
            key={step.id} 
            className={cn(
              'relative flex gap-4',
              !isLast && (compact ? 'pb-4' : 'pb-6')
            )}
          >
            {/* Vertical line */}
            {!isLast && (
              <div 
                className={cn(
                  'absolute left-4 top-8 w-0.5 bottom-0 -translate-x-1/2',
                  config.lineColor
                )}
                aria-hidden="true"
              />
            )}

            {/* Icon */}
            <div 
              className={cn(
                'relative z-10 flex shrink-0 items-center justify-center rounded-full',
                compact ? 'w-6 h-6' : 'w-8 h-8',
                config.iconBg
              )}
            >
              <StepIcon className={cn(
                config.iconColor,
                compact ? 'w-3 h-3' : 'w-4 h-4'
              )} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className={cn(
                  compact ? 'text-sm' : 'text-base',
                  config.textColor
                )}>
                  {step.label}
                </span>
                {formattedTime && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formattedTime}
                  </span>
                )}
              </div>
              
              {step.description && (
                <p className={cn(
                  'text-muted-foreground mt-0.5',
                  compact ? 'text-xs' : 'text-sm'
                )}>
                  {step.description}
                </p>
              )}
              
              {step.eta && step.status === 'current' && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  <Clock className="w-3 h-3" />
                  ETA: {step.eta}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Pre-defined timeline generators for common order flows
export function generateOrderTimeline(
  status: string,
  timestamps?: {
    created?: string;
    scheduled?: string;
    delivered?: string;
    pickupScheduled?: string;
    completed?: string;
  }
): TimelineStep[] {
  const statusOrder = ['placed', 'scheduled', 'delivered', 'pickup_scheduled', 'completed'];
  const currentIndex = statusOrder.indexOf(status) !== -1 ? statusOrder.indexOf(status) : 0;

  const getStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  return [
    {
      id: 'placed',
      label: 'Order Placed',
      description: 'Your order has been confirmed',
      icon: CheckCircle,
      status: getStatus(0),
      timestamp: timestamps?.created,
    },
    {
      id: 'scheduled',
      label: 'Delivery Scheduled',
      description: 'Driver assigned and en route',
      icon: Calendar,
      status: getStatus(1),
      timestamp: timestamps?.scheduled,
    },
    {
      id: 'delivered',
      label: 'Dumpster Delivered',
      description: 'On-site and ready to use',
      icon: Package,
      status: getStatus(2),
      timestamp: timestamps?.delivered,
    },
    {
      id: 'pickup_scheduled',
      label: 'Pickup Scheduled',
      description: 'We will pick up your dumpster',
      icon: Truck,
      status: getStatus(3),
      timestamp: timestamps?.pickupScheduled,
    },
    {
      id: 'completed',
      label: 'Order Complete',
      description: 'Thank you for your business',
      icon: CheckCircle,
      status: getStatus(4),
      timestamp: timestamps?.completed,
    },
  ];
}

export default TrackingTimeline;

// Order Status Timeline Component for Customer Portal

import { CheckCircle2, Circle, Clock, Truck, Calendar, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStep {
  key: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  current: boolean;
  timestamp?: string | null;
}

interface OrderTimelineProps {
  status: string;
  scheduledDeliveryDate?: string | null;
  actualDeliveryAt?: string | null;
  scheduledPickupDate?: string | null;
  actualPickupAt?: string | null;
  createdAt?: string | null;
}

export function OrderTimeline({
  status,
  scheduledDeliveryDate,
  actualDeliveryAt,
  scheduledPickupDate,
  actualPickupAt,
  createdAt,
}: OrderTimelineProps) {
  const statusOrder = ['pending', 'confirmed', 'scheduled', 'delivered', 'pickup_scheduled', 'completed'];
  const currentIndex = statusOrder.indexOf(status);
  const isCancelled = status === 'cancelled';

  const steps: TimelineStep[] = [
    {
      key: 'placed',
      label: 'Order Placed',
      description: 'Your order has been received',
      icon: Package,
      completed: currentIndex >= 0 || isCancelled,
      current: currentIndex === 0,
      timestamp: createdAt,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      description: 'Order confirmed by our team',
      icon: CheckCircle2,
      completed: currentIndex >= 1,
      current: currentIndex === 1,
    },
    {
      key: 'scheduled',
      label: 'Scheduled',
      description: scheduledDeliveryDate 
        ? `Delivery: ${new Date(scheduledDeliveryDate).toLocaleDateString()}`
        : 'Awaiting scheduling',
      icon: Calendar,
      completed: currentIndex >= 2,
      current: currentIndex === 2,
      timestamp: scheduledDeliveryDate,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: actualDeliveryAt 
        ? `Delivered: ${new Date(actualDeliveryAt).toLocaleDateString()}`
        : 'Dumpster on-site',
      icon: Truck,
      completed: currentIndex >= 3,
      current: currentIndex === 3,
      timestamp: actualDeliveryAt,
    },
    {
      key: 'pickup',
      label: 'Pickup',
      description: scheduledPickupDate
        ? `Pickup: ${new Date(scheduledPickupDate).toLocaleDateString()}`
        : 'Request when ready',
      icon: Clock,
      completed: currentIndex >= 4 || currentIndex === 5,
      current: currentIndex === 4,
      timestamp: scheduledPickupDate,
    },
    {
      key: 'completed',
      label: 'Completed',
      description: actualPickupAt
        ? `Completed: ${new Date(actualPickupAt).toLocaleDateString()}`
        : 'Service complete',
      icon: CheckCircle2,
      completed: currentIndex >= 5,
      current: currentIndex === 5,
      timestamp: actualPickupAt,
    },
  ];

  if (isCancelled) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center gap-2 text-red-700">
          <Circle className="w-5 h-5" />
          <span className="font-medium">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.key} className="flex gap-3">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                  step.completed 
                    ? "bg-green-500 border-green-500 text-white" 
                    : step.current
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && (
                <div 
                  className={cn(
                    "w-0.5 h-12 -my-1",
                    step.completed ? "bg-green-500" : "bg-gray-200"
                  )} 
                />
              )}
            </div>
            
            {/* Content */}
            <div className="pb-6">
              <p className={cn(
                "font-medium",
                step.completed || step.current ? "text-gray-900" : "text-gray-400"
              )}>
                {step.label}
              </p>
              <p className="text-sm text-gray-500">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

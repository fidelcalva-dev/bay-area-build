import { useState, useEffect } from 'react';
import { 
  CreditCard, AlertTriangle, Package, ShieldCheck, 
  TrendingUp, TrendingDown, RefreshCw, Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  getCustomerHealthEvents, 
  type CustomerHealthEvent,
  type HealthEventType,
  type HealthEventSeverity
} from '@/lib/customerHealthService';
import { cn } from '@/lib/utils';

interface HealthEventsTimelineProps {
  customerId: string;
  limit?: number;
  className?: string;
}

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PAYMENT_RECEIVED: CreditCard,
  PAYMENT_OVERDUE: CreditCard,
  CHARGEBACK: AlertTriangle,
  REFUND: CreditCard,
  DISPUTE: AlertTriangle,
  CANCELLATION: Package,
  NO_SHOW: Package,
  BLOCKED_ACCESS: Package,
  RESCHEDULE: Package,
  CONTAMINATION: AlertTriangle,
  OVERWEIGHT: AlertTriangle,
  POD_MISSING: Package,
  REPEAT_ORDER: TrendingUp,
  HIGH_VOLUME: TrendingUp,
  FAST_PAY: CreditCard,
  CLEAN_COMPLIANCE: ShieldCheck,
  REVIEW_POSITIVE: TrendingUp,
  REVIEW_NEGATIVE: TrendingDown,
  INITIAL_SCORE: Clock,
};

const SEVERITY_COLORS: Record<HealthEventSeverity, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MED: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
};

function formatEventType(type: HealthEventType): string {
  return type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
}

export function HealthEventsTimeline({ customerId, limit = 20, className }: HealthEventsTimelineProps) {
  const [events, setEvents] = useState<CustomerHealthEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [customerId]);

  async function loadEvents() {
    setIsLoading(true);
    const data = await getCustomerHealthEvents(customerId, { limit });
    setEvents(data);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Health History</CardTitle>
            <CardDescription>Score changes and events</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={loadEvents}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No health events recorded yet
          </p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {events.map((event) => {
                const Icon = EVENT_ICONS[event.event_type] || Clock;
                const isPositive = event.delta_score > 0;
                
                return (
                  <div key={event.id} className="flex gap-3">
                    <div className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      isPositive ? 'bg-green-100' : 'bg-red-100'
                    )}>
                      <Icon className={cn(
                        'w-4 h-4',
                        isPositive ? 'text-green-600' : 'text-red-600'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {formatEventType(event.event_type)}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', SEVERITY_COLORS[event.severity])}
                        >
                          {event.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                        {event.score_before !== null && event.score_after !== null && (
                          <span className={cn(
                            'font-medium',
                            isPositive ? 'text-green-600' : 'text-red-600'
                          )}>
                            {event.score_before} → {event.score_after} ({isPositive ? '+' : ''}{event.delta_score})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

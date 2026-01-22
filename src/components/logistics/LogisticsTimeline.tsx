import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Truck, Camera, MapPin, User, Clock, CheckCircle2,
  XCircle, AlertTriangle, Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getLogisticsEvents, LOGISTICS_CONFIG, type LogisticsEvent } from '@/lib/logisticsService';
import { cn } from '@/lib/utils';

interface LogisticsTimelineProps {
  orderId: string;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  status_change: <CheckCircle2 className="w-4 h-4" />,
  photo_uploaded: <Camera className="w-4 h-4" />,
  location_update: <MapPin className="w-4 h-4" />,
  inventory_event: <Truck className="w-4 h-4" />,
  exception: <AlertTriangle className="w-4 h-4" />,
  dry_run: <XCircle className="w-4 h-4" />,
};

export function LogisticsTimeline({ orderId }: LogisticsTimelineProps) {
  const [events, setEvents] = useState<LogisticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      const data = await getLogisticsEvents(orderId);
      setEvents(data);
      setIsLoading(false);
    }
    loadEvents();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No logistics events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Truck className="w-4 h-4" />
        Logistics Timeline
      </h3>

      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

        <div className="space-y-4">
          {events.map((event) => {
            const config = LOGISTICS_CONFIG[event.logistics_type as keyof typeof LOGISTICS_CONFIG];
            
            return (
              <div key={event.id} className="relative flex gap-4 pl-10">
                <div className={cn(
                  "absolute left-2 w-5 h-5 rounded-full flex items-center justify-center",
                  config?.color || "bg-gray-100 text-gray-700"
                )}>
                  {EVENT_ICONS[event.event_type] || <Clock className="w-3 h-3" />}
                </div>

                <div className="flex-1 bg-muted/30 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={config?.color}>
                          {config?.label || event.logistics_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {event.event_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      {event.from_status && event.to_status && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">{event.from_status}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium">{event.to_status}</span>
                        </p>
                      )}

                      {event.filled_location && (
                        <p className="text-sm text-muted-foreground">
                          Filled at: <span className="capitalize">{event.filled_location}</span>
                        </p>
                      )}

                      {event.notes && (
                        <p className="text-sm text-muted-foreground">{event.notes}</p>
                      )}

                      {event.actor_role && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          by {event.actor_role}
                        </p>
                      )}
                    </div>

                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(event.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>

                  {event.photo_url && (
                    <div className="mt-2">
                      <a href={event.photo_url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={event.photo_url} 
                          alt="Event photo" 
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

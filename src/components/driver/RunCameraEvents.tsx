/**
 * RunCameraEvents — shows camera events for the current run in driver app
 */
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Camera, Loader2, Video, MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCameraEventsForRun, SEVERITY_CONFIG, EVENT_TYPE_LABELS, type CameraEvent } from '@/lib/cameraService';

interface RunCameraEventsProps {
  runId: string;
}

export function RunCameraEvents({ runId }: RunCameraEventsProps) {
  const [events, setEvents] = useState<CameraEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCameraEventsForRun(runId);
        setEvents(data);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    })();
  }, [runId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        <Camera className="w-6 h-6 mx-auto mb-1 opacity-40" />
        No camera events for this run
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-1.5">
        <Camera className="w-4 h-4" /> Camera Events ({events.length})
      </h4>
      {events.slice(0, 5).map(event => {
        const sev = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.INFO;
        return (
          <div key={event.id} className="flex items-center gap-3 bg-muted/30 rounded-lg p-2">
            <span className="text-sm">{sev.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium truncate">
                  {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                </span>
                <Badge variant="outline" className={cn('text-[10px] px-1.5', sev.color)}>
                  {sev.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                {format(new Date(event.event_timestamp), 'h:mm a')}
                {event.speed_mph && <span>• {event.speed_mph} mph</span>}
              </div>
            </div>
            {event.thumbnail_url && (
              <img src={event.thumbnail_url} alt="" className="w-10 h-7 object-cover rounded" />
            )}
          </div>
        );
      })}
      {events.length > 5 && (
        <p className="text-xs text-muted-foreground text-center">+{events.length - 5} more events</p>
      )}
    </div>
  );
}

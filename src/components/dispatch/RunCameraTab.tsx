/**
 * RunCameraTab — Safety & Video tab for dispatch run detail
 * Shows camera events for the run with severity, GPS, and signed clip playback.
 */
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Camera, Loader2, Play, Clock, Gauge, MapPin, AlertTriangle, Video, ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import {
  getCameraEventsForRun,
  getCameraClipsForEvent,
  SEVERITY_CONFIG,
  EVENT_TYPE_LABELS,
  type CameraEvent,
  type CameraClip,
} from '@/lib/cameraService';
import { toast } from 'sonner';

interface RunCameraTabProps {
  runId: string;
}

export function RunCameraTab({ runId }: RunCameraTabProps) {
  const [events, setEvents] = useState<CameraEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CameraEvent | null>(null);
  const [clips, setClips] = useState<CameraClip[]>([]);
  const [clipsLoading, setClipsLoading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await getCameraEventsForRun(runId);
        setEvents(data);
      } catch { /* silent */ } finally { setIsLoading(false); }
    })();
  }, [runId]);

  async function openEvent(event: CameraEvent) {
    setSelectedEvent(event);
    setClipsLoading(true);
    try {
      const c = await getCameraClipsForEvent(event.id);
      setClips(c);
      // Get signed URLs for clips
      for (const clip of c) {
        try {
          const { data } = await supabase.functions.invoke('camera-clip-url', {
            body: { clip_id: clip.id },
          });
          if (data?.signed_url) {
            setSignedUrls(prev => ({ ...prev, [clip.id]: data.signed_url }));
          }
        } catch { /* use file_url fallback */ }
      }
    } catch { setClips([]); }
    finally { setClipsLoading(false); }
  }

  const criticalCount = events.filter(e => ['CRITICAL', 'HIGH'].includes(e.severity)).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <Card className="flex-1">
          <CardContent className="pt-4 flex items-center gap-3">
            <Camera className="w-5 h-5 text-primary" />
            <div>
              <div className="text-2xl font-bold">{events.length}</div>
              <div className="text-xs text-muted-foreground">Camera Events</div>
            </div>
          </CardContent>
        </Card>
        {criticalCount > 0 && (
          <Card className="flex-1 border-destructive">
            <CardContent className="pt-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
                <div className="text-xs text-muted-foreground">Critical/High</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Camera className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No camera events for this run</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map(event => {
            const sev = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.INFO;
            return (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openEvent(event)}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{sev.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                          </span>
                          <Badge variant="outline" className={cn('text-xs', sev.color)}>
                            {sev.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.event_timestamp), 'h:mm:ss a')}
                          </span>
                          {event.speed_mph && (
                            <span className="flex items-center gap-1">
                              <Gauge className="w-3 h-3" />
                              {event.speed_mph} mph
                            </span>
                          )}
                          {event.gps_lat && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.gps_lat.toFixed(4)}, {event.gps_lng?.toFixed(4)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.thumbnail_url && (
                        <img src={event.thumbnail_url} alt="" className="w-16 h-10 object-cover rounded" />
                      )}
                      {event.video_url && <Video className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && (
                <>
                  <span>{SEVERITY_CONFIG[selectedEvent.severity]?.icon}</span>
                  {EVENT_TYPE_LABELS[selectedEvent.event_type] || selectedEvent.event_type}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.video_url && (
                <div className="rounded-lg overflow-hidden bg-black">
                  <video controls className="w-full max-h-[300px]" poster={selectedEvent.thumbnail_url || undefined}>
                    <source src={selectedEvent.video_url} type="video/mp4" />
                  </video>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Timestamp</span>
                  <p className="font-medium">{format(new Date(selectedEvent.event_timestamp), 'MMM d, yyyy h:mm:ss a')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Severity</span>
                  <p><Badge className={SEVERITY_CONFIG[selectedEvent.severity]?.color}>{selectedEvent.severity}</Badge></p>
                </div>
                {selectedEvent.speed_mph && (
                  <div>
                    <span className="text-muted-foreground">Speed</span>
                    <p className="font-medium">{selectedEvent.speed_mph} mph</p>
                  </div>
                )}
                {selectedEvent.gps_lat && (
                  <div>
                    <span className="text-muted-foreground">Location</span>
                    <p className="font-medium">{selectedEvent.gps_lat.toFixed(5)}, {selectedEvent.gps_lng?.toFixed(5)}</p>
                  </div>
                )}
              </div>

              {/* Clips with signed URLs */}
              {clipsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : clips.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Video Clips ({clips.length})</h4>
                  <div className="space-y-2">
                    {clips.map(clip => (
                      <div key={clip.id} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                        <Play className="w-4 h-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm">
                            {clip.duration_seconds ? `${clip.duration_seconds}s` : 'Unknown duration'}
                            {clip.file_size_bytes ? ` • ${(clip.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : ''}
                          </p>
                        </div>
                        <a href={signedUrls[clip.id] || clip.file_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="gap-1">
                            <ExternalLink className="w-3 h-3" /> Play
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

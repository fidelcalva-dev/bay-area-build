/**
 * Truck Cameras — GPS trace + camera events for a specific truck
 * /dispatch/truck-cameras/:truckId
 */
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, Video, MapPin, AlertTriangle, Filter,
  Loader2, Play, Eye, Clock, Gauge, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  getCameraEventsForTruck,
  getCameraClipsForEvent,
  buildGpsTrace,
  SEVERITY_CONFIG,
  EVENT_TYPE_LABELS,
  type CameraEvent,
  type CameraClip,
  type GpsPoint,
} from '@/lib/cameraService';
import { getTruckById, type Truck } from '@/lib/fleetService';

export default function TruckCameras() {
  const { truckId } = useParams<{ truckId: string }>();
  const navigate = useNavigate();

  const [truck, setTruck] = useState<Truck | null>(null);
  const [events, setEvents] = useState<CameraEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<CameraEvent | null>(null);
  const [clips, setClips] = useState<CameraClip[]>([]);
  const [clipsLoading, setClipsLoading] = useState(false);

  useEffect(() => {
    if (!truckId) return;
    (async () => {
      setIsLoading(true);
      try {
        const [t, evts] = await Promise.all([
          getTruckById(truckId),
          getCameraEventsForTruck(truckId, {
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            eventType: eventTypeFilter !== 'ALL' ? eventTypeFilter : undefined,
          }),
        ]);
        setTruck(t);
        setEvents(evts);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [truckId, dateFrom, dateTo, eventTypeFilter]);

  const gpsTrace = useMemo(() => buildGpsTrace(events), [events]);

  async function openEventDetail(event: CameraEvent) {
    setSelectedEvent(event);
    setClipsLoading(true);
    try {
      const c = await getCameraClipsForEvent(event.id);
      setClips(c);
    } catch {
      setClips([]);
    } finally {
      setClipsLoading(false);
    }
  }

  const eventTypes = [...new Set(events.map(e => e.event_type))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Truck Cameras — {truck?.truck_number || 'Unknown'}
          </h1>
          <p className="text-muted-foreground">
            {truck?.make} {truck?.model} {truck?.year} • {truck?.plate_number || truck?.license_plate}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Event Type</label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Events</SelectItem>
                  {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant="secondary" className="h-9 px-3">
              {events.length} events
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events" className="gap-1"><Video className="w-4 h-4" /> Events</TabsTrigger>
          <TabsTrigger value="gps" className="gap-1"><MapPin className="w-4 h-4" /> GPS Trace</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No camera events found for this truck</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map(event => {
                const sev = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.INFO;
                return (
                  <Card
                    key={event.id}
                    className={cn('cursor-pointer hover:shadow-md transition-shadow', sev.color.split(' ')[0])}
                    onClick={() => openEventDetail(event)}
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
                                {format(new Date(event.event_timestamp), 'MMM d, h:mm:ss a')}
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
                              {event.runs?.run_number && (
                                <span>Run #{event.runs.run_number}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.thumbnail_url && (
                            <img src={event.thumbnail_url} alt="" className="w-16 h-10 object-cover rounded" />
                          )}
                          {event.video_url && <Play className="w-5 h-5 text-muted-foreground" />}
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gps" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" /> GPS Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gpsTrace.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No GPS data available</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {gpsTrace.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{EVENT_TYPE_LABELS[point.event_type] || point.event_type}</span>
                          {point.speed_mph && (
                            <Badge variant="secondary" className="text-xs">{point.speed_mph} mph</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {point.lat.toFixed(5)}, {point.lng.toFixed(5)} • {format(new Date(point.timestamp), 'h:mm:ss a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              {/* Video player */}
              {selectedEvent.video_url && (
                <div className="rounded-lg overflow-hidden bg-black">
                  <video
                    controls
                    className="w-full max-h-[300px]"
                    poster={selectedEvent.thumbnail_url || undefined}
                  >
                    <source src={selectedEvent.video_url} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                </div>
              )}

              {/* Event info */}
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
                {selectedEvent.runs?.run_number && (
                  <div>
                    <span className="text-muted-foreground">Run</span>
                    <p className="font-medium">#{selectedEvent.runs.run_number} ({selectedEvent.runs.status})</p>
                  </div>
                )}
                {selectedEvent.drivers?.name && (
                  <div>
                    <span className="text-muted-foreground">Driver</span>
                    <p className="font-medium">{selectedEvent.drivers.name}</p>
                  </div>
                )}
              </div>

              {/* Clips */}
              {clipsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : clips.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Video Clips ({clips.length})</h4>
                  <div className="space-y-2">
                    {clips.map(clip => (
                      <div key={clip.id} className="flex items-center gap-3 bg-muted/30 rounded-lg p-2">
                        <Play className="w-4 h-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm">
                            {clip.duration_seconds ? `${clip.duration_seconds}s` : 'Unknown duration'}
                            {clip.file_size_bytes ? ` • ${(clip.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : ''}
                          </p>
                        </div>
                        <a href={clip.file_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">View</Button>
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

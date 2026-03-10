import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { MapPin, RefreshCw, Route, Clock, Camera, Loader2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useYards, useFacilities, useRunsForDate, useRunRoutes, useAssets, useRunCheckpoints, type RunLine } from '@/hooks/useControlTowerData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useControlTowerCameraLayer } from '@/components/dispatch/ControlTowerCameraLayer';
import { JobQueuePanel, FleetPanel, KpiBar, useFleetStatus } from '@/components/dispatch/control-tower';

const RUN_COLORS: Record<string, string> = {
  DELIVERY: '#3b82f6',
  PICKUP: '#f97316',
  SWAP: '#8b5cf6',
  DUMP_RETURN: '#6b7280',
  DUMP_AND_RETURN: '#6b7280',
  YARD_TRANSFER: '#10b981',
};

function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

export default function ControlTower() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [layers, setLayers] = useState({ yards: true, facilities: true, runs: true, assets: false, drivers: false, cameras: false });
  const [selectedRun, setSelectedRun] = useState<RunLine | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);

  const { isLoaded, load, isLoading: mapsLoading } = useGoogleMaps();
  const { data: yards } = useYards();
  const { data: facilities } = useFacilities();
  const { data: runs, refetch: refetchRuns } = useRunsForDate(selectedDate);
  const { data: assets } = useAssets();
  const { data: fleet, isLoading: fleetLoading } = useFleetStatus(selectedDate);

  const runIds = useMemo(() => (runs || []).map(r => r.id), [runs]);
  const { data: routes } = useRunRoutes(runIds);
  const { data: checkpoints } = useRunCheckpoints(selectedRun?.id || null);

  useControlTowerCameraLayer({ map: mapInstanceRef.current, visible: layers.cameras });

  useEffect(() => { load(); }, [load]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 37.55, lng: -122.05 },
      zoom: 10,
      mapTypeControl: true,
      streetViewControl: false,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });
  }, [isLoaded]);

  const renderMap = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.setMap(null));
    polylinesRef.current.forEach(p => p.setMap(null));
    markersRef.current = [];
    polylinesRef.current = [];

    if (layers.yards && yards) {
      yards.forEach(yard => {
        const marker = new window.google.maps.Marker({
          position: { lat: yard.latitude, lng: yard.longitude },
          map,
          title: yard.name,
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#22c55e', fillOpacity: 0.9, strokeColor: '#15803d', strokeWeight: 2 },
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-family:system-ui;padding:4px"><strong>${yard.name}</strong><br/><span style="color:#666">${yard.market}</span><br/><small>${yard.address}</small></div>`,
        });
        marker.addListener('click', () => info.open(map, marker));
        markersRef.current.push(marker);
      });
    }

    if (layers.facilities && facilities) {
      facilities.forEach(fac => {
        if (!fac.lat || !fac.lng) return;
        const marker = new window.google.maps.Marker({
          position: { lat: fac.lat, lng: fac.lng },
          map,
          title: fac.name,
          icon: { path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 7, fillColor: '#6b7280', fillOpacity: 0.8, strokeColor: '#374151', strokeWeight: 2 },
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-family:system-ui;padding:4px"><strong>${fac.name}</strong><br/><span style="color:#666">${fac.facility_type} - ${fac.city}</span></div>`,
        });
        marker.addListener('click', () => info.open(map, marker));
        markersRef.current.push(marker);
      });
    }

    if (layers.runs && runs && routes) {
      runs.forEach(run => {
        const color = RUN_COLORS[run.run_type] || '#6b7280';
        const runRoutes = routes.filter(r => r.run_id === run.id);
        runRoutes.forEach(route => {
          if (!route.polyline) return;
          const path = decodePolyline(route.polyline);
          const polyline = new window.google.maps.Polyline({ path, strokeColor: color, strokeOpacity: 0.8, strokeWeight: 3, map });
          polyline.addListener('click', () => { setSelectedRun(run); setDrawerOpen(true); });
          polylinesRef.current.push(polyline);
        });

        if (run.destination_lat && run.destination_lng) {
          const marker = new window.google.maps.Marker({
            position: { lat: run.destination_lat, lng: run.destination_lng },
            map,
            title: `${run.run_type} - ${run.run_number || run.id.slice(0, 8)}`,
            icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 6, fillColor: color, fillOpacity: 0.9, strokeColor: '#fff', strokeWeight: 1 },
          });
          marker.addListener('click', () => { setSelectedRun(run); setDrawerOpen(true); });
          markersRef.current.push(marker);
        }
      });
    }
  }, [layers, yards, facilities, runs, routes]);

  useEffect(() => { renderMap(); }, [renderMap]);

  const handleCalculateRoute = async (runId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('route-calculate-and-store', { body: { run_id: runId } });
      if (error) throw error;
      toast.success(`Route calculated: ${data.total_miles?.toFixed(1)} mi, ${data.total_duration_minutes?.toFixed(0)} min`);
      refetchRuns();
    } catch (err: any) {
      toast.error(`Route calculation failed: ${err.message}`);
    }
  };

  if (mapsLoading || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading maps...</span>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Control Tower | Dispatch</title></Helmet>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card">
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="font-semibold text-lg">Control Tower</h1>
          <Separator orientation="vertical" className="h-6" />
          <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-40" />
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}>Today</Button>
          <Button variant="outline" size="sm" onClick={() => refetchRuns()}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>

          <Separator orientation="vertical" className="h-6" />
          <KpiBar runs={runs} />

          <div className="ml-auto flex items-center gap-3 text-sm">
            {(['yards', 'facilities', 'runs', 'assets', 'cameras'] as const).map(key => (
              <div key={key} className="flex items-center gap-1.5">
                <Switch
                  id={`ly-${key}`}
                  checked={layers[key]}
                  onCheckedChange={v => setLayers(p => ({ ...p, [key]: v }))}
                  className="scale-75"
                />
                <Label htmlFor={`ly-${key}`} className="text-xs cursor-pointer capitalize flex items-center gap-1">
                  {key === 'cameras' && <Camera className="w-3 h-3" />}
                  {key}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* 3-panel layout */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left: Job Queue */}
          <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
            <JobQueuePanel
              runs={runs}
              selectedRunId={selectedRun?.id || null}
              onSelectRun={(run) => { setSelectedRun(run); setDrawerOpen(true); }}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center: Map */}
          <ResizablePanel defaultSize={56} minSize={30}>
            <div className="relative h-full">
              <div ref={mapRef} className="w-full h-full" />
              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border border-border rounded-lg p-3 text-xs space-y-1">
                <div className="font-medium mb-1 flex items-center gap-1"><Layers className="w-3 h-3" /> Legend</div>
                {Object.entries(RUN_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} />
                    <span>{type.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right: Fleet Status */}
          <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
            <FleetPanel
              drivers={fleet?.drivers}
              trucks={fleet?.trucks}
              isLoading={fleetLoading}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Run Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[400px] sm:w-[480px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Run {selectedRun?.run_number || selectedRun?.id.slice(0, 8)}
            </SheetTitle>
          </SheetHeader>
          {selectedRun && (
            <ScrollArea className="h-[calc(100vh-100px)] mt-4">
              <div className="space-y-4 pr-2">
                <Card>
                  <CardContent className="pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <Badge style={{ backgroundColor: RUN_COLORS[selectedRun.run_type] || '#6b7280', color: '#fff' }}>
                        {selectedRun.run_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline">{selectedRun.status}</Badge>
                    </div>
                    {selectedRun.customer_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer</span>
                        <span>{selectedRun.customer_name}</span>
                      </div>
                    )}
                    {selectedRun.destination_address && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destination</span>
                        <span className="text-right max-w-[200px] truncate">{selectedRun.destination_address}</span>
                      </div>
                    )}
                    {selectedRun.estimated_miles != null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Route</span>
                        <span>{selectedRun.estimated_miles.toFixed(1)} mi, ~{selectedRun.estimated_duration_mins} min</span>
                      </div>
                    )}
                    {selectedRun.started_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started</span>
                        <span>{format(new Date(selectedRun.started_at), 'h:mm a')}</span>
                      </div>
                    )}
                    {selectedRun.completed_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed</span>
                        <span>{format(new Date(selectedRun.completed_at), 'h:mm a')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleCalculateRoute(selectedRun.id)}>
                    <Route className="w-4 h-4 mr-1" /> Recalculate Route
                  </Button>
                </div>

                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Checkpoint Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    {!checkpoints?.length ? (
                      <p className="text-xs text-muted-foreground">No checkpoints recorded</p>
                    ) : (
                      <div className="space-y-2">
                        {checkpoints.map((cp: any) => (
                          <div key={cp.id} className="flex items-start gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full mt-1 ${cp.completed_at ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                            <div>
                              <span className="font-medium">{cp.checkpoint_type}</span>
                              {cp.completed_at && (
                                <span className="text-muted-foreground ml-2">{format(new Date(cp.completed_at), 'h:mm a')}</span>
                              )}
                              {cp.notes && <p className="text-muted-foreground mt-0.5">{cp.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { Calendar as CalIcon, Layers, MapPin, Truck, Factory, Box, RefreshCw, Route, X, Phone, Clock, ChevronRight, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useYards, useFacilities, useRunsForDate, useRunRoutes, useAssets, useRunCheckpoints, type RunLine } from '@/hooks/useControlTowerData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useControlTowerCameraLayer } from '@/components/dispatch/ControlTowerCameraLayer';

const RUN_COLORS: Record<string, string> = {
  DELIVERY: '#3b82f6',
  PICKUP: '#f97316',
  SWAP: '#8b5cf6',
  DUMP_RETURN: '#6b7280',
  DUMP_AND_RETURN: '#6b7280',
  YARD_TRANSFER: '#10b981',
};

const ASSET_STATUS_COLORS: Record<string, string> = {
  available: '#22c55e',
  deployed: '#f59e0b',
  maintenance: '#ef4444',
  reserved: '#3b82f6',
};

// Decode Google encoded polyline
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
  
  const runIds = useMemo(() => (runs || []).map(r => r.id), [runs]);
  const { data: routes } = useRunRoutes(runIds);
  const { data: checkpoints } = useRunCheckpoints(selectedRun?.id || null);

  // Camera events layer
  useControlTowerCameraLayer({
    map: mapInstanceRef.current,
    visible: layers.cameras,
  });

  // Load Google Maps
  useEffect(() => { load(); }, [load]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 37.55, lng: -122.05 },
      zoom: 10,
      mapTypeControl: true,
      streetViewControl: false,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });
    mapInstanceRef.current = map;
  }, [isLoaded]);

  // Render markers and polylines
  const renderMap = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous
    markersRef.current.forEach(m => m.setMap(null));
    polylinesRef.current.forEach(p => p.setMap(null));
    markersRef.current = [];
    polylinesRef.current = [];

    // Yards
    if (layers.yards && yards) {
      yards.forEach(yard => {
        const marker = new window.google.maps.Marker({
          position: { lat: yard.latitude, lng: yard.longitude },
          map,
          title: yard.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#22c55e',
            fillOpacity: 0.9,
            strokeColor: '#15803d',
            strokeWeight: 2,
          },
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-family:system-ui;padding:4px"><strong>${yard.name}</strong><br/><span style="color:#666">${yard.market}</span><br/><small>${yard.address}</small></div>`,
        });
        marker.addListener('click', () => info.open(map, marker));
        markersRef.current.push(marker);
      });
    }

    // Facilities
    if (layers.facilities && facilities) {
      facilities.forEach(fac => {
        if (!fac.lat || !fac.lng) return;
        const marker = new window.google.maps.Marker({
          position: { lat: fac.lat, lng: fac.lng },
          map,
          title: fac.name,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 7,
            fillColor: '#6b7280',
            fillOpacity: 0.8,
            strokeColor: '#374151',
            strokeWeight: 2,
          },
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-family:system-ui;padding:4px"><strong>${fac.name}</strong><br/><span style="color:#666">${fac.facility_type} - ${fac.city}</span></div>`,
        });
        marker.addListener('click', () => info.open(map, marker));
        markersRef.current.push(marker);
      });
    }

    // Runs polylines + destination markers
    if (layers.runs && runs && routes) {
      runs.forEach(run => {
        const color = RUN_COLORS[run.run_type] || '#6b7280';
        
        // Draw route polylines
        const runRoutes = routes.filter(r => r.run_id === run.id);
        runRoutes.forEach(route => {
          if (!route.polyline) return;
          const path = decodePolyline(route.polyline);
          const polyline = new window.google.maps.Polyline({
            path,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map,
          });
          polyline.addListener('click', () => {
            setSelectedRun(run);
            setDrawerOpen(true);
          });
          polylinesRef.current.push(polyline);
        });

        // Destination marker
        if (run.destination_lat && run.destination_lng) {
          const marker = new window.google.maps.Marker({
            position: { lat: run.destination_lat, lng: run.destination_lng },
            map,
            title: `${run.run_type} - ${run.run_number || run.id.slice(0, 8)}`,
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: color,
              fillOpacity: 0.9,
              strokeColor: '#fff',
              strokeWeight: 1,
            },
          });
          marker.addListener('click', () => {
            setSelectedRun(run);
            setDrawerOpen(true);
          });
          markersRef.current.push(marker);
        }
      });
    }
  }, [layers, yards, facilities, runs, routes]);

  useEffect(() => { renderMap(); }, [renderMap]);

  // Calculate route for a run
  const handleCalculateRoute = async (runId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('route-calculate-and-store', {
        body: { run_id: runId },
      });
      if (error) throw error;
      toast.success(`Route calculated: ${data.total_miles?.toFixed(1)} mi, ${data.total_duration_minutes?.toFixed(0)} min`);
      refetchRuns();
    } catch (err: any) {
      toast.error(`Route calculation failed: ${err.message}`);
    }
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default';
      case 'EN_ROUTE': case 'ARRIVED': return 'secondary';
      case 'CANCELLED': case 'FAILED': return 'destructive';
      default: return 'outline';
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
          <Input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetchRuns()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Switch id="ly-yards" checked={layers.yards} onCheckedChange={v => setLayers(p => ({ ...p, yards: v }))} />
              <Label htmlFor="ly-yards" className="text-xs cursor-pointer">Yards</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Switch id="ly-fac" checked={layers.facilities} onCheckedChange={v => setLayers(p => ({ ...p, facilities: v }))} />
              <Label htmlFor="ly-fac" className="text-xs cursor-pointer">Facilities</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Switch id="ly-runs" checked={layers.runs} onCheckedChange={v => setLayers(p => ({ ...p, runs: v }))} />
              <Label htmlFor="ly-runs" className="text-xs cursor-pointer">Runs</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Switch id="ly-assets" checked={layers.assets} onCheckedChange={v => setLayers(p => ({ ...p, assets: v }))} />
              <Label htmlFor="ly-assets" className="text-xs cursor-pointer">Assets</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Switch id="ly-cameras" checked={layers.cameras} onCheckedChange={v => setLayers(p => ({ ...p, cameras: v }))} />
              <Label htmlFor="ly-cameras" className="text-xs cursor-pointer flex items-center gap-1"><Camera className="w-3 h-3" />Cameras</Label>
            </div>
          </div>
        </div>

        {/* Main area: map + run list */}
        <div className="flex-1 flex">
          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapRef} className="w-full h-full" />
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border border-border rounded-lg p-3 text-xs space-y-1">
              <div className="font-medium mb-1">Legend</div>
              {Object.entries(RUN_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} />
                  <span>{type.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar: run list */}
          <div className="w-80 border-l border-border bg-card overflow-hidden flex flex-col">
            <div className="p-3 border-b border-border">
              <h2 className="font-medium text-sm flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Runs for {format(new Date(selectedDate + 'T12:00:00'), 'MMM d, yyyy')}
                {runs && <Badge variant="secondary" className="text-xs">{runs.length}</Badge>}
              </h2>
            </div>
            <ScrollArea className="flex-1">
              {!runs?.length ? (
                <div className="p-4 text-sm text-muted-foreground text-center">No runs scheduled</div>
              ) : (
                <div className="divide-y divide-border">
                  {runs.map(run => (
                    <button
                      key={run.id}
                      onClick={() => { setSelectedRun(run); setDrawerOpen(true); }}
                      className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RUN_COLORS[run.run_type] || '#6b7280' }} />
                          <span className="text-xs font-mono">{run.run_number || run.id.slice(0, 8)}</span>
                        </div>
                        <Badge variant={statusBadgeVariant(run.status)} className="text-[10px]">{run.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {run.run_type.replace(/_/g, ' ')} {run.customer_name ? `- ${run.customer_name}` : ''}
                      </div>
                      {run.destination_address && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">{run.destination_address}</div>
                      )}
                      {run.estimated_miles != null && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {run.estimated_miles.toFixed(1)} mi | {run.estimated_duration_mins} min
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Run Drawer */}
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
                {/* Summary */}
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
                      <Badge variant={statusBadgeVariant(selectedRun.status)}>{selectedRun.status}</Badge>
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
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleCalculateRoute(selectedRun.id)}>
                    <Route className="w-4 h-4 mr-1" /> Recalculate Route
                  </Button>
                </div>

                {/* Checkpoints */}
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
                                <span className="text-muted-foreground ml-2">
                                  {format(new Date(cp.completed_at), 'h:mm a')}
                                </span>
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

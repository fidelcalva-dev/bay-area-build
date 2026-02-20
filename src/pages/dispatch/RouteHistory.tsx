import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { History, Search, MapPin, Play, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

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

export default function RouteHistory() {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [runType, setRunType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replayRunId, setReplayRunId] = useState<string | null>(null);

  const { isLoaded, load } = useGoogleMaps();
  const replayMapRef = useRef<HTMLDivElement>(null);
  const replayMapInstance = useRef<any>(null);

  useEffect(() => { load(); }, [load]);

  const { data: historyRuns, isLoading } = useQuery({
    queryKey: ['route-history', dateFrom, dateTo, runType, statusFilter],
    queryFn: async () => {
      let q = supabase
        .from('runs')
        .select('id, run_type, status, scheduled_date, assigned_driver_id, run_number, started_at, completed_at, estimated_miles, estimated_duration_mins, destination_address, customer_name, destination_facility_id')
        .gte('scheduled_date', dateFrom)
        .lte('scheduled_date', dateTo)
        .order('scheduled_date', { ascending: false });
      
      if (runType !== 'all') q = q.eq('run_type', runType as any);
      if (statusFilter !== 'all') q = q.eq('status', statusFilter as any);
      
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const { data: replayRoutes } = useQuery({
    queryKey: ['replay-routes', replayRunId],
    queryFn: async () => {
      if (!replayRunId) return [];
      const { data, error } = await supabase
        .from('run_routes')
        .select('*')
        .eq('run_id', replayRunId);
      if (error) throw error;
      return data;
    },
    enabled: !!replayRunId,
  });

  const { data: replayCheckpoints } = useQuery({
    queryKey: ['replay-checkpoints', replayRunId],
    queryFn: async () => {
      if (!replayRunId) return [];
      const { data, error } = await supabase
        .from('run_checkpoints')
        .select('*')
        .eq('run_id', replayRunId)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!replayRunId,
  });

  const filtered = useMemo(() => {
    if (!historyRuns) return [];
    if (!searchQuery) return historyRuns;
    const q = searchQuery.toLowerCase();
    return historyRuns.filter(r =>
      (r.run_number || '').toLowerCase().includes(q) ||
      (r.customer_name || '').toLowerCase().includes(q) ||
      (r.destination_address || '').toLowerCase().includes(q)
    );
  }, [historyRuns, searchQuery]);

  // Render replay map
  const renderReplay = useCallback(() => {
    if (!isLoaded || !replayMapRef.current || !replayRoutes?.length) return;

    const map = new window.google.maps.Map(replayMapRef.current, {
      center: { lat: 37.55, lng: -122.05 },
      zoom: 11,
      streetViewControl: false,
    });
    replayMapInstance.current = map;

    const bounds = new window.google.maps.LatLngBounds();
    const RUN_COLORS: Record<string, string> = {
      YARD_TO_SITE: '#3b82f6',
      SITE_TO_FACILITY: '#f97316',
      FACILITY_TO_YARD: '#6b7280',
      FULL_CYCLE: '#8b5cf6',
    };

    replayRoutes.forEach((route: any) => {
      if (!route.polyline) return;
      const path = decodePolyline(route.polyline);
      const color = RUN_COLORS[route.route_type] || '#6b7280';
      
      const poly = new window.google.maps.Polyline({
        path,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      });

      path.forEach(p => bounds.extend(p));

      // Origin marker
      if (path.length > 0) {
        new window.google.maps.Marker({
          position: path[0],
          map,
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: '#22c55e', fillOpacity: 1, strokeWeight: 2, strokeColor: '#fff' },
          title: `Start: ${route.route_type}`,
        });
      }
      // Dest marker
      if (path.length > 1) {
        new window.google.maps.Marker({
          position: path[path.length - 1],
          map,
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: '#ef4444', fillOpacity: 1, strokeWeight: 2, strokeColor: '#fff' },
          title: `End: ${route.route_type}`,
        });
      }
    });

    if (!bounds.isEmpty()) map.fitBounds(bounds, 60);
  }, [isLoaded, replayRoutes]);

  useEffect(() => { renderReplay(); }, [renderReplay]);

  return (
    <>
      <Helmet><title>Route History | Dispatch</title></Helmet>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold">Route History</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36" />
          <span className="text-muted-foreground text-sm">to</span>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36" />
          <Select value={runType} onValueChange={setRunType}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Run type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="DELIVERY">Delivery</SelectItem>
              <SelectItem value="PICKUP">Pickup</SelectItem>
              <SelectItem value="SWAP">Swap</SelectItem>
              <SelectItem value="DUMP_RETURN">Dump Return</SelectItem>
              <SelectItem value="DUMP_AND_RETURN">Dump and Return</SelectItem>
              <SelectItem value="YARD_TRANSFER">Yard Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="EN_ROUTE">En Route</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search run #, customer, address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Miles</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No runs found for the selected filters
                    </TableCell>
                  </TableRow>
                )}
                {filtered?.map(run => (
                  <TableRow key={run.id}>
                    <TableCell className="font-mono text-xs">{run.run_number || run.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-sm">{run.scheduled_date}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{run.run_type.replace(/_/g, ' ')}</Badge></TableCell>
                    <TableCell><Badge variant={run.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-xs">{run.status}</Badge></TableCell>
                    <TableCell className="text-sm">{run.customer_name || '-'}</TableCell>
                    <TableCell className="text-sm">{run.estimated_miles?.toFixed(1) || '-'}</TableCell>
                    <TableCell className="text-sm">{run.estimated_duration_mins ? `${run.estimated_duration_mins} min` : '-'}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{run.destination_address || '-'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => setReplayRunId(run.id)}>
                        <Play className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Replay Sheet */}
      <Sheet open={!!replayRunId} onOpenChange={open => { if (!open) setReplayRunId(null); }}>
        <SheetContent className="w-[600px] sm:w-[700px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Route Replay
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div ref={replayMapRef} className="w-full h-[400px] rounded-lg border" />
            
            {/* Route segments */}
            {replayRoutes && replayRoutes.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Route Segments</h3>
                {replayRoutes.map((route: any) => (
                  <div key={route.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                    <span>{route.route_type.replace(/_/g, ' ')}</span>
                    <span>{route.distance_miles?.toFixed(1)} mi | {route.duration_minutes?.toFixed(0)} min</span>
                  </div>
                ))}
              </div>
            )}

            {/* Checkpoints */}
            {replayCheckpoints && replayCheckpoints.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Checkpoints</h3>
                {replayCheckpoints.map((cp: any) => (
                  <div key={cp.id} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${cp.completed_at ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                    <span className="font-medium">{cp.checkpoint_type}</span>
                    {cp.completed_at && (
                      <span className="text-muted-foreground">{format(new Date(cp.completed_at), 'h:mm a')}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

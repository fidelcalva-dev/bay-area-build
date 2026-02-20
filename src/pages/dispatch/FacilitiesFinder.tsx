import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, MapPin, Phone, Clock, FileText, Star, Building2, Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useFacilitiesFinder, useRecentAssignments, type FacilityResult } from '@/hooks/useFacilitiesFinder';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const MATERIAL_OPTIONS = [
  { value: '', label: 'All Materials' },
  { value: 'MIXED_GENERAL', label: 'General Debris (C&D)' },
  { value: 'CD_WASTE', label: 'Mixed Debris' },
  { value: 'HEAVY_CLEAN_BASE', label: 'Concrete (clean)' },
  { value: 'INERT', label: 'Dirt (clean fill)' },
  { value: 'GREEN_WASTE', label: 'Green waste / clean wood' },
  { value: 'RECYCLING', label: 'Drywall / Recycling' },
  { value: 'HEAVY_MIXED', label: 'Asphalt / Mixed Heavy' },
];

const FACILITY_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'recycling_center', label: 'Recycling' },
  { value: 'transfer_station', label: 'Transfer Station' },
  { value: 'landfill', label: 'Landfill' },
  { value: 'inert', label: 'Dump Site / Inert' },
  { value: 'green_waste', label: 'Green Waste' },
];

export default function FacilitiesFinder() {
  const { isLoaded, load } = useGoogleMaps();
  const {
    facilities,
    isLoading,
    filters,
    setFilters,
    searchAddress,
    geocodeSearch,
    assignFacility,
  } = useFacilitiesFinder();
  const { data: recentAssignments } = useRecentAssignments();

  const [searchInput, setSearchInput] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<FacilityResult | null>(null);
  const [assignDialog, setAssignDialog] = useState<{ facility: FacilityResult; type: 'ORDER' | 'RUN' } | null>(null);
  const [assignEntityId, setAssignEntityId] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [assigning, setAssigning] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Load Google Maps on mount
  useEffect(() => { load(); }, [load]);

  // Fetch runs for assignment dialog
  const { data: availableRuns } = useQuery({
    queryKey: ['available-runs-for-assign'],
    queryFn: async () => {
      const { data } = await supabase
        .from('runs')
        .select('id, run_type, status, scheduled_date')
        .in('status', ['DRAFT', 'SCHEDULED', 'ASSIGNED'])
        .order('scheduled_date', { ascending: true })
        .limit(20);
      return data || [];
    },
    enabled: !!assignDialog,
  });

  // Init map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: 37.55, lng: -122.05 },
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
    });
  }, [isLoaded]);

  // Update markers when facilities change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    // Search location marker
    if (filters.searchLat && filters.searchLng) {
      const pos = { lat: filters.searchLat, lng: filters.searchLng };
      bounds.extend(pos);
      hasPoints = true;
      const marker = new google.maps.Marker({
        position: pos,
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: 'Search Location',
      });
      markersRef.current.push(marker);
    }

    // Facility markers
    facilities.forEach((f) => {
      if (!f.lat || !f.lng) return;
      const pos = { lat: f.lat, lng: f.lng };
      bounds.extend(pos);
      hasPoints = true;

      const color = f.is_recommended ? '#f59e0b' : '#6b7280';
      const marker = new google.maps.Marker({
        position: pos,
        map: mapInstanceRef.current!,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#fff',
          strokeWeight: 1,
        },
        title: f.name,
      });
      marker.addListener('click', () => setSelectedFacility(f));
      markersRef.current.push(marker);
    });

    if (hasPoints) {
      mapInstanceRef.current.fitBounds(bounds, 60);
    }
  }, [facilities, filters.searchLat, filters.searchLng]);

  const handleSearch = useCallback(() => {
    if (searchInput.trim().length >= 3) {
      geocodeSearch(searchInput.trim());
    }
  }, [searchInput, geocodeSearch]);

  const handleAssign = useCallback(async () => {
    if (!assignDialog || !assignEntityId) return;
    setAssigning(true);
    try {
      await assignFacility(assignDialog.facility.id, assignDialog.type, assignEntityId, assignReason);
      toast.success(`Facility assigned to ${assignDialog.type.toLowerCase()}`);
      setAssignDialog(null);
      setAssignEntityId('');
      setAssignReason('');
    } catch (err) {
      toast.error('Failed to assign facility');
    } finally {
      setAssigning(false);
    }
  }, [assignDialog, assignEntityId, assignReason, assignFacility]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      {/* Left Panel - Filters */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border bg-card overflow-auto">
        <div className="p-4 space-y-4">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Facilities Finder
          </h1>

          {/* Search */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Search by ZIP or Address</Label>
            <div className="flex gap-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter ZIP or address"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button size="icon" variant="secondary" onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Material Filter */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Material Type</Label>
            <Select
              value={filters.materialType}
              onValueChange={(v) => setFilters((p) => ({ ...p, materialType: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Materials" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Facility Type Filter */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Facility Type</Label>
            <Select
              value={filters.facilityType}
              onValueChange={(v) => setFilters((p) => ({ ...p, facilityType: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {FACILITY_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Results List */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {isLoading ? 'Searching...' : `${facilities.length} facilities found`}
            </p>
            <ScrollArea className="max-h-[40vh]">
              <div className="space-y-2 pr-2">
                {facilities.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFacility(f)}
                    className="w-full text-left p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{f.city}, {f.state}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {f.is_recommended && (
                          <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">
                            <Star className="w-2.5 h-2.5 mr-0.5" /> Rec
                          </Badge>
                        )}
                        {f.distance_miles != null && (
                          <span className="text-[10px] text-muted-foreground">
                            {f.distance_miles.toFixed(1)} mi
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] mt-1">
                      {f.facility_type}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Recent Assignments */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Recent Assignments</p>
            <ScrollArea className="max-h-32">
              <div className="space-y-1 pr-2">
                {(recentAssignments || []).slice(0, 10).map((a: any) => (
                  <div key={a.id} className="text-[11px] text-muted-foreground p-1.5 rounded bg-muted/30">
                    <span className="font-medium text-foreground">{a.facilities?.name}</span>
                    {' → '}{a.entity_type} · {new Date(a.created_at).toLocaleDateString()}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Map Panel */}
      <div className="flex-1 relative">
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : null}
        <div ref={mapRef} className="w-full h-full min-h-[400px]" />
      </div>

      {/* Facility Detail Drawer */}
      <Sheet open={!!selectedFacility} onOpenChange={(open) => !open && setSelectedFacility(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-auto">
          {selectedFacility && (
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selectedFacility.name}
                  {selectedFacility.is_recommended && (
                    <Badge className="bg-primary text-primary-foreground text-[10px]">Recommended</Badge>
                  )}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-3">
                {/* Type + Distance */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{selectedFacility.facility_type}</Badge>
                  {selectedFacility.distance_miles != null && (
                    <Badge variant="outline">{selectedFacility.distance_miles.toFixed(1)} miles</Badge>
                  )}
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span>{selectedFacility.address}, {selectedFacility.city}, {selectedFacility.state} {selectedFacility.zip}</span>
                </div>

                {/* Phone */}
                {selectedFacility.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${selectedFacility.phone}`} className="text-primary hover:underline">
                      {selectedFacility.phone}
                    </a>
                  </div>
                )}

                {/* Hours */}
                {selectedFacility.hours && (
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span>{selectedFacility.hours}</span>
                  </div>
                )}

                <Separator />

                {/* Accepted Materials */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Accepted Materials</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedFacility.accepted_material_classes?.map((m) => (
                      <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                    ))}
                  </div>
                </div>

                {/* Notes / Rules */}
                {selectedFacility.notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notes / Rules</p>
                    <p className="text-sm text-foreground bg-muted/50 p-2 rounded">{selectedFacility.notes}</p>
                  </div>
                )}

                {/* Compliance */}
                {selectedFacility.compliance_notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Compliance Notes</p>
                    <p className="text-sm text-foreground bg-muted/50 p-2 rounded">{selectedFacility.compliance_notes}</p>
                  </div>
                )}

                {/* Approved Cities */}
                {selectedFacility.approved_by_city?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Approved by City</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedFacility.approved_by_city.map((c) => (
                        <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => setAssignDialog({ facility: selectedFacility, type: 'RUN' })}
                  >
                    Assign to Run
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAssignDialog({ facility: selectedFacility, type: 'ORDER' })}
                  >
                    Assign to Order
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Assign Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={(open) => !open && setAssignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign {assignDialog?.facility.name} to {assignDialog?.type === 'RUN' ? 'Run' : 'Order'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {assignDialog?.type === 'RUN' ? (
              <div className="space-y-2">
                <Label>Select Run</Label>
                <Select value={assignEntityId} onValueChange={setAssignEntityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a run" />
                  </SelectTrigger>
                  <SelectContent>
                    {(availableRuns || []).map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.run_type} - {r.status} ({r.scheduled_date || 'unscheduled'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Order ID</Label>
                <Input
                  value={assignEntityId}
                  onChange={(e) => setAssignEntityId(e.target.value)}
                  placeholder="Paste order UUID"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                value={assignReason}
                onChange={(e) => setAssignReason(e.target.value)}
                placeholder="Why this facility?"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignEntityId || assigning}>
              {assigning ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

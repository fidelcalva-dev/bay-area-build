/**
 * Facilities Finder — Internal Operations Tool
 * Search disposal, recycling, and transfer options by location and material.
 * Admin / Dispatch / Logistics only.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Search, MapPin, Phone, Clock, FileText, Star, Building2,
  Loader2, RefreshCw, Plus, ChevronRight, AlertTriangle, Route,
  DollarSign, Timer, Info,
} from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useFacilitiesFinder, useRecentAssignments, type FacilityResult } from '@/hooks/useFacilitiesFinder';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// =====================================================
// MATERIAL OPTIONS (exact copy from prompt)
// =====================================================
const MATERIAL_OPTIONS = [
  { value: '', label: 'All materials' },
  { value: 'MIXED_GENERAL', label: 'General debris (C&D)' },
  { value: 'CD_WASTE', label: 'Mixed debris' },
  { value: 'HEAVY_CLEAN_BASE', label: 'Concrete (clean)' },
  { value: 'INERT', label: 'Dirt (clean fill)' },
  { value: 'HEAVY_PLUS_200', label: 'Asphalt (clean)' },
  { value: 'GREEN_WASTE', label: 'Green waste / clean wood' },
  { value: 'RECYCLING', label: 'Drywall (clean)' },
  { value: 'METAL_CLEAN', label: 'Metal (recyclable)' },
  { value: 'CARDBOARD', label: 'Cardboard (recyclable)' },
  { value: 'HEAVY_MIXED', label: 'Other / not sure' },
];

const FACILITY_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'recycler', label: 'Recycling' },
  { value: 'transfer_station', label: 'Transfer station' },
  { value: 'landfill', label: 'Landfill' },
  { value: 'inert', label: 'Dump site' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'distance', label: 'Closest distance' },
  { value: 'name', label: 'Alphabetical' },
];

// Color map for facility type markers
const FACILITY_TYPE_COLORS: Record<string, string> = {
  recycler: '#22c55e',
  transfer_station: '#3b82f6',
  landfill: '#ef4444',
  inert: '#a855f7',
  organics: '#84cc16',
  metal: '#f59e0b',
  mixed_c_and_d: '#6366f1',
  roofing: '#ec4899',
  green_waste: '#10b981',
  recycling_center: '#22c55e',
};

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
  const [sortBy, setSortBy] = useState('recommended');
  const [showRates, setShowRates] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<FacilityResult | null>(null);
  const [assignDialog, setAssignDialog] = useState<{ facility: FacilityResult; type: 'ORDER' | 'RUN' } | null>(null);
  const [assignEntityId, setAssignEntityId] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

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
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });
  }, [isLoaded]);

  // Sort facilities
  const sortedFacilities = [...facilities].sort((a, b) => {
    if (sortBy === 'distance') {
      if (a.distance_miles != null && b.distance_miles != null) return a.distance_miles - b.distance_miles;
      if (a.distance_miles != null) return -1;
      if (b.distance_miles != null) return 1;
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    // recommended (default) — already sorted from hook
    return 0;
  });

  // Update markers when facilities change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

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
        zIndex: 999,
      });
      markersRef.current.push(marker);
    }

    // Facility markers — color by type
    sortedFacilities.forEach((f) => {
      if (!f.lat || !f.lng) return;
      const pos = { lat: f.lat, lng: f.lng };
      bounds.extend(pos);
      hasPoints = true;

      const color = FACILITY_TYPE_COLORS[f.facility_type] || '#6b7280';
      const marker = new google.maps.Marker({
        position: pos,
        map: mapInstanceRef.current!,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 7,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#fff',
          strokeWeight: 1.5,
        },
        title: f.name,
      });
      marker.addListener('click', () => setSelectedFacility(f));
      markersRef.current.push(marker);
    });

    if (hasPoints) {
      mapInstanceRef.current.fitBounds(bounds, 60);
    }
  }, [sortedFacilities, filters.searchLat, filters.searchLng]);

  const handleSearch = useCallback(async () => {
    if (searchInput.trim().length < 3) return;
    setIsGeocoding(true);
    await geocodeSearch(searchInput.trim());
    setIsGeocoding(false);
  }, [searchInput, geocodeSearch]);

  const handleAssign = useCallback(async () => {
    if (!assignDialog || !assignEntityId) return;
    setAssigning(true);
    try {
      await assignFacility(assignDialog.facility.id, assignDialog.type, assignEntityId, assignReason);
      toast.success('Facility assigned successfully.');
      setAssignDialog(null);
      setAssignEntityId('');
      setAssignReason('');
    } catch (err) {
      toast.error('Failed to assign facility');
    } finally {
      setAssigning(false);
    }
  }, [assignDialog, assignEntityId, assignReason, assignFacility]);

  const handleRefresh = () => {
    setFilters(prev => ({ ...prev }));
  };

  // Derive context label
  const materialLabel = MATERIAL_OPTIONS.find(o => o.value === filters.materialType)?.label || 'all materials';
  const locationLabel = searchAddress || 'your area';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            Facilities Finder
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search disposal, recycling, and transfer options by location and material.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT — Filters */}
        <div className="w-full lg:w-72 xl:w-80 border-b lg:border-b-0 lg:border-r border-border bg-card overflow-auto shrink-0">
          <div className="p-4 space-y-4">

            {/* Search Location */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Search location</Label>
              <div className="flex gap-1.5">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter ZIP code or full address"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 text-sm"
                />
                <Button size="sm" onClick={handleSearch} disabled={isGeocoding}>
                  {isGeocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {isGeocoding
                  ? 'Geocoding address...'
                  : "We'll calculate distance and estimated drive time from this location."}
              </p>
            </div>

            <Separator />

            {/* Material Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Material type</Label>
              <Select
                value={filters.materialType}
                onValueChange={(v) => setFilters((p) => ({ ...p, materialType: v }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All materials" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Filters facilities based on accepted materials and rules.
              </p>
            </div>

            {/* Facility Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Facility type</Label>
              <Select
                value={filters.facilityType}
                onValueChange={(v) => setFilters((p) => ({ ...p, facilityType: v }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  {FACILITY_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Use this to narrow the results by facility category.
              </p>
            </div>

            {/* Sort */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Sort results by</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Recommended uses market rules when available.
              </p>
            </div>

            <Separator />

            {/* Toggles */}
            <div className="space-y-2">
              <ToggleWithTooltip
                checked={showRates}
                onCheckedChange={setShowRates}
                label="Show rates"
                tooltip="Displays rate cards if pricing data is available."
              />
              <ToggleWithTooltip
                checked={showRules}
                onCheckedChange={setShowRules}
                label="Show rules"
                tooltip="Displays contamination rules and restrictions."
              />
              <ToggleWithTooltip
                checked={showHours}
                onCheckedChange={setShowHours}
                label="Show hours"
                tooltip="Displays operating hours and cutoff notes."
              />
            </div>
          </div>
        </div>

        {/* CENTER — Google Map */}
        <div className="flex-1 relative min-h-[300px]">
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[10px] font-medium text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded border border-border">
              Facility map — Click a marker to view details or assign to a run.
            </span>
          </div>
          {!isLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* RIGHT — Results List */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card overflow-auto shrink-0">
          <div className="p-4">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-foreground">Results</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isLoading
                  ? 'Searching...'
                  : `Showing ${sortedFacilities.length} facilities for ${materialLabel} near ${locationLabel}.`}
              </p>
            </div>

            {sortedFacilities.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No facilities found.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try changing material type or search a nearby ZIP.
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[calc(100vh-200px)]">
                <div className="space-y-2 pr-1">
                  {sortedFacilities.map((f) => (
                    <FacilityCard
                      key={f.id}
                      facility={f}
                      showRates={showRates}
                      showRules={showRules}
                      showHours={showHours}
                      onSelect={() => setSelectedFacility(f)}
                      onAssign={() => setAssignDialog({ facility: f, type: 'RUN' })}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-muted/30 px-4 py-1.5 shrink-0">
        <p className="text-[10px] text-muted-foreground text-center">
          Internal operations tool. Not visible to customers.
        </p>
      </div>

      {/* Facility Detail Drawer */}
      <Sheet open={!!selectedFacility} onOpenChange={(open) => !open && setSelectedFacility(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-auto">
          {selectedFacility && (
            <FacilityDetailDrawer
              facility={selectedFacility}
              onAssignRun={() => setAssignDialog({ facility: selectedFacility, type: 'RUN' })}
              onAssignOrder={() => setAssignDialog({ facility: selectedFacility, type: 'ORDER' })}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Assign Facility Modal */}
      <Dialog open={!!assignDialog} onOpenChange={(open) => !open && setAssignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign facility</DialogTitle>
            <DialogDescription>
              Attach this facility to an active run or order for disposal routing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {assignDialog?.facility.name}
            </div>

            {/* Assign to type */}
            <div className="space-y-2">
              <Label>Assign to</Label>
              <Select
                value={assignDialog?.type || 'RUN'}
                onValueChange={(v) => assignDialog && setAssignDialog({ ...assignDialog, type: v as 'RUN' | 'ORDER' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUN">Run</SelectItem>
                  <SelectItem value="ORDER">Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {assignDialog?.type === 'RUN' ? (
              <div className="space-y-2">
                <Label>Select run</Label>
                <Select value={assignEntityId} onValueChange={setAssignEntityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a run" />
                  </SelectTrigger>
                  <SelectContent>
                    {(availableRuns || []).map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.run_type} — {r.status} ({r.scheduled_date || 'unscheduled'})
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
                placeholder="Example: Closest clean concrete recycling option for this ZIP"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignEntityId || assigning}>
              {assigning ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Confirm assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =====================================================
// Sub-components
// =====================================================

function ToggleWithTooltip({
  checked,
  onCheckedChange,
  label,
  tooltip,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  tooltip: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(!!v)}
        id={`toggle-${label}`}
      />
      <label htmlFor={`toggle-${label}`} className="text-xs text-foreground cursor-pointer">
        {label}
      </label>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-3 h-3 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px] text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function FacilityCard({
  facility,
  showRates,
  showRules,
  showHours,
  onSelect,
  onAssign,
}: {
  facility: FacilityResult;
  showRates: boolean;
  showRules: boolean;
  showHours: boolean;
  onSelect: () => void;
  onAssign: () => void;
}) {
  return (
    <Card className="overflow-hidden hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer">
      <CardContent className="p-3 space-y-2" onClick={onSelect}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{facility.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {facility.city}, {facility.state}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {facility.is_recommended && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                Recommended
              </Badge>
            )}
          </div>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="secondary" className="text-[10px]">
            {facility.facility_type.replace(/_/g, ' ')}
          </Badge>
          {facility.distance_miles != null && (
            <Badge variant="outline" className="text-[10px]">
              <MapPin className="w-2.5 h-2.5 mr-0.5" />
              {facility.distance_miles.toFixed(1)} mi
            </Badge>
          )}
        </div>

        {/* Conditional sections */}
        {showHours && facility.hours && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {facility.hours}
          </p>
        )}
        {showRules && facility.notes && (
          <p className="text-[10px] text-muted-foreground flex items-start gap-1">
            <FileText className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{facility.notes}</span>
          </p>
        )}
        {showRates && (
          <p className="text-[10px] text-muted-foreground italic">
            Rates not available for this facility.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" className="flex-1 h-7 text-[11px]" onClick={onSelect}>
            View details
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" className="flex-1 h-7 text-[11px]" onClick={onAssign}>
                Assign
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              Assign this facility to a run or order.
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}

function FacilityDetailDrawer({
  facility,
  onAssignRun,
  onAssignOrder,
}: {
  facility: FacilityResult;
  onAssignRun: () => void;
  onAssignOrder: () => void;
}) {
  return (
    <div className="space-y-5">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2 text-base">
          {facility.name}
          {facility.is_recommended && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Recommended</Badge>
          )}
        </SheetTitle>
      </SheetHeader>

      {/* Facility summary */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Facility summary</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">{facility.facility_type.replace(/_/g, ' ')}</Badge>
            {facility.distance_miles != null && (
              <Badge variant="outline" className="text-xs">{facility.distance_miles.toFixed(1)} miles</Badge>
            )}
          </div>

          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <span>{facility.address}, {facility.city}, {facility.state} {facility.zip}</span>
          </div>

          {facility.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a href={`tel:${facility.phone}`} className="text-primary hover:underline">{facility.phone}</a>
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* Accepted materials */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accepted materials</h3>
        <p className="text-[11px] text-muted-foreground">
          Only materials listed here should be routed to this facility.
        </p>
        <div className="flex flex-wrap gap-1">
          {facility.accepted_material_classes?.map((m) => (
            <Badge key={m} variant="outline" className="text-[10px]">{m.replace(/_/g, ' ')}</Badge>
          ))}
          {(!facility.accepted_material_classes || facility.accepted_material_classes.length === 0) && (
            <p className="text-[11px] text-muted-foreground italic">No material data available.</p>
          )}
        </div>
      </section>

      <Separator />

      {/* Current rates */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current rates</h3>
        <p className="text-[11px] text-muted-foreground italic">
          Rates not available for this facility.
        </p>
        <p className="text-[10px] text-muted-foreground">
          Rates are estimates and may change. Confirm before final billing.
        </p>
      </section>

      <Separator />

      {/* Rules & restrictions */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rules &amp; restrictions</h3>
        {facility.notes ? (
          <div className="text-sm text-foreground bg-muted/50 p-2.5 rounded-md">{facility.notes}</div>
        ) : (
          <p className="text-[11px] text-muted-foreground italic">No rules recorded.</p>
        )}
        {facility.compliance_notes && (
          <div className="text-sm text-foreground bg-muted/50 p-2.5 rounded-md mt-2">{facility.compliance_notes}</div>
        )}
      </section>

      <Separator />

      {/* Hours & cutoff */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hours &amp; cutoff</h3>
        {facility.hours ? (
          <div className="flex items-start gap-2 text-sm">
            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <span>{facility.hours}</span>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground italic">Hours not recorded.</p>
        )}
        <p className="text-[10px] text-muted-foreground">
          Some facilities have cutoff times that affect same-day disposal.
        </p>
      </section>

      {/* Approved Cities */}
      {facility.approved_by_city?.length > 0 && (
        <>
          <Separator />
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approved by city</h3>
            <div className="flex flex-wrap gap-1">
              {facility.approved_by_city.map((c) => (
                <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
              ))}
            </div>
          </section>
        </>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button className="flex-1" onClick={onAssignRun}>
          Assign to Run
        </Button>
        <Button variant="outline" className="flex-1" onClick={onAssignOrder}>
          Assign to Order
        </Button>
      </div>
    </div>
  );
}

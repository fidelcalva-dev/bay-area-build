// Placement Map Step - Interactive map with draggable pin + yard marker
// Uses Leaflet for mapping

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Move, AlertTriangle, CheckCircle, FileText, Truck, Navigation, Home, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Yard } from '@/lib/distanceService';
import 'leaflet/dist/leaflet.css';

// ============================================================
// CUSTOM ICONS
// ============================================================

// Yard icon (green truck marker) - SVG inline
const createYardIcon = () => {
  return L.divIcon({
    className: 'custom-yard-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <svg style="transform: rotate(45deg); width: 16px; height: 16px; color: white;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 9H12V18"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Customer address icon (blue pin marker) - SVG inline
const createAddressIcon = () => {
  return L.divIcon({
    className: 'custom-address-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <svg style="transform: rotate(45deg); width: 14px; height: 14px; color: white;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Custom dumpster marker icon (draggable, orange) - SVG inline
const createDumpsterIcon = () => {
  return L.divIcon({
    className: 'custom-dumpster-marker',
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #f97316, #ea580c);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
        animation: pulse 2s infinite;
      ">
        <svg style="transform: rotate(45deg); width: 22px; height: 22px; color: white;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
};

interface PlacementResult {
  lat: number;
  lng: number;
  placementType: 'driveway' | 'street';
  notes: string;
}

interface PlacementMapProps {
  addressLat: number;
  addressLng: number;
  onPlacementConfirmed: (placement: PlacementResult) => void;
  value?: PlacementResult | null;
  // Optional yard info for distance display
  yard?: Yard | null;
  distanceMiles?: number;
}

// Component to handle map bounds updates
function MapFitBounds({ bounds, zoom }: { bounds: L.LatLngBoundsExpression | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: zoom || 17 });
    }
  }, [map, bounds, zoom]);
  return null;
}

// Draggable marker component
function DraggableMarker({ 
  position, 
  onPositionChange 
}: { 
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);
  const [dragging, setDragging] = useState(false);

  const eventHandlers = {
    dragstart: () => setDragging(true),
    dragend: () => {
      setDragging(false);
      const marker = markerRef.current;
      if (marker) {
        const latlng = marker.getLatLng();
        onPositionChange(latlng.lat, latlng.lng);
      }
    },
  };

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={createDumpsterIcon()}
      draggable
      eventHandlers={eventHandlers}
    />
  );
}

export function PlacementMap({ 
  addressLat, 
  addressLng, 
  onPlacementConfirmed, 
  value,
  yard,
  distanceMiles 
}: PlacementMapProps) {
  const [pinPosition, setPinPosition] = useState<[number, number]>([
    value?.lat || addressLat,
    value?.lng || addressLng
  ]);
  const [placementType, setPlacementType] = useState<'driveway' | 'street'>(
    value?.placementType || 'driveway'
  );
  const [notes, setNotes] = useState(value?.notes || '');
  const [isConfirmed, setIsConfirmed] = useState(!!value);
  const [showNotes, setShowNotes] = useState(!!value?.notes);

  // Calculate bounds to fit all markers
  const bounds = useMemo(() => {
    if (yard) {
      // Include yard, address, and placement pin
      const points = [
        L.latLng(yard.latitude, yard.longitude),
        L.latLng(addressLat, addressLng),
        L.latLng(pinPosition[0], pinPosition[1]),
      ];
      return L.latLngBounds(points);
    }
    // Just address and placement pin
    const corner1 = L.latLng(addressLat, addressLng);
    const corner2 = L.latLng(pinPosition[0], pinPosition[1]);
    return L.latLngBounds(corner1, corner2);
  }, [yard, addressLat, addressLng, pinPosition]);

  // Handle position change from dragging
  const handlePositionChange = useCallback((lat: number, lng: number) => {
    setPinPosition([lat, lng]);
    setIsConfirmed(false);
  }, []);

  // Handle placement type change
  const handlePlacementTypeChange = (type: 'driveway' | 'street') => {
    setPlacementType(type);
    setIsConfirmed(false);
  };

  // Confirm placement
  const handleConfirm = () => {
    const result: PlacementResult = {
      lat: pinPosition[0],
      lng: pinPosition[1],
      placementType,
      notes: notes.trim(),
    };
    setIsConfirmed(true);
    onPlacementConfirmed(result);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Pin Dumpster Location</h4>
          <p className="text-sm text-muted-foreground">
            Drag the pin to the exact spot where you want the dumpster placed
          </p>
        </div>
      </div>

      {/* Distance Info (if yard is provided) */}
      {yard && distanceMiles !== undefined && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-success/5 border-success/30">
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
            <Truck className="w-4 h-4 text-success" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {distanceMiles.toFixed(1)} miles
              </span>
              <span className="text-sm text-muted-foreground">
                from {yard.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 px-3 py-2 rounded-lg">
        <Move className="w-4 h-4" />
        <span>Drag the orange pin to your desired location</span>
      </div>

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-border shadow-sm">
        <MapContainer
          center={[addressLat, addressLng]}
          zoom={17}
          style={{ height: '300px', width: '100%' }}
          scrollWheelZoom={true}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Fit bounds to show all markers */}
          <MapFitBounds bounds={bounds} zoom={yard ? 14 : 18} />

          {/* Yard Marker (if provided) */}
          {yard && (
            <Marker
              position={[yard.latitude, yard.longitude]}
              icon={createYardIcon()}
            />
          )}

          {/* Address Marker (static) */}
          <Marker
            position={[addressLat, addressLng]}
            icon={createAddressIcon()}
          />

          {/* Dumpster Placement Pin (draggable) */}
          <DraggableMarker position={pinPosition} onPositionChange={handlePositionChange} />

          {/* Line from yard to address (if yard provided) */}
          {yard && (
            <Polyline
              positions={[
                [yard.latitude, yard.longitude],
                [addressLat, addressLng],
              ]}
              color="#22c55e"
              weight={2}
              opacity={0.6}
              dashArray="6, 6"
            />
          )}
        </MapContainer>

        {/* Coordinates Overlay */}
        <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground font-mono">
          {pinPosition[0].toFixed(6)}, {pinPosition[1].toFixed(6)}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        {yard && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-success"></span>
            <span>Our Yard</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>Your Address</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary"></span>
          <span>Dumpster</span>
        </div>
      </div>

      {/* Placement Type Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handlePlacementTypeChange('driveway')}
          className={cn(
            "p-3 rounded-xl border-2 text-center transition-all",
            placementType === 'driveway'
              ? "border-primary bg-primary/5"
              : "border-input bg-background hover:border-primary/50"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors",
            "bg-muted/80 border border-border/50",
            placementType === 'driveway' && "bg-primary/10 border-primary/20"
          )}>
            <Home className={cn(
              "w-5 h-5 transition-colors",
              placementType === 'driveway' ? "text-primary" : "text-foreground/70"
            )} strokeWidth={2} />
          </div>
          <div className="font-medium text-foreground text-sm">Driveway</div>
          <div className="text-xs text-muted-foreground">Private property</div>
        </button>

        <button
          type="button"
          onClick={() => handlePlacementTypeChange('street')}
          className={cn(
            "p-3 rounded-xl border-2 text-center transition-all",
            placementType === 'street'
              ? "border-primary bg-primary/5"
              : "border-input bg-background hover:border-primary/50"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors",
            "bg-muted/80 border border-border/50",
            placementType === 'street' && "bg-primary/10 border-primary/20"
          )}>
            <Route className={cn(
              "w-5 h-5 transition-colors",
              placementType === 'street' ? "text-primary" : "text-foreground/70"
            )} strokeWidth={2} />
          </div>
          <div className="font-medium text-foreground text-sm">Street</div>
          <div className="text-xs text-muted-foreground">Public right-of-way</div>
        </button>
      </div>

      {/* Street Permit Warning */}
      {placementType === 'street' && (
        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-3 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">Permit may be required</span>
            <p className="text-xs mt-0.5 opacity-80">
              Street placement often requires a city permit. We'll help you check!
            </p>
          </div>
        </div>
      )}

      {/* Placement Notes */}
      <div>
        {!showNotes ? (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <FileText className="w-4 h-4" />
            Add placement notes (optional)
          </button>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Placement Notes
            </label>
            <Textarea
              placeholder="Gate code, slope, obstacles, special instructions..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setIsConfirmed(false);
              }}
              rows={2}
              className="resize-none text-sm"
            />
          </div>
        )}
      </div>

      {/* Confirm Button */}
      <Button
        type="button"
        variant={isConfirmed ? "outline" : "cta"}
        size="lg"
        className="w-full h-12"
        onClick={handleConfirm}
      >
        {isConfirmed ? (
          <>
            <CheckCircle className="w-5 h-5 text-success" />
            Placement Confirmed
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Confirm Pin Location
          </>
        )}
      </Button>
    </div>
  );
}
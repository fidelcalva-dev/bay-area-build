// Placement Map Step - Interactive map with draggable pin
// Uses Leaflet for mapping

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Move, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Custom dumpster marker icon
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
      ">
        <span style="transform: rotate(45deg); font-size: 20px;">🗑️</span>
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
}

// Component to handle map center updates
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 18);
  }, [center, map]);
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

export function PlacementMap({ addressLat, addressLng, onPlacementConfirmed, value }: PlacementMapProps) {
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

      {/* Instructions */}
      <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 px-3 py-2 rounded-lg">
        <Move className="w-4 h-4" />
        <span>Drag the orange pin to your desired location</span>
      </div>

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-border shadow-sm">
        <MapContainer
          center={pinPosition}
          zoom={18}
          style={{ height: '280px', width: '100%' }}
          scrollWheelZoom={true}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={pinPosition} />
          <DraggableMarker position={pinPosition} onPositionChange={handlePositionChange} />
        </MapContainer>

        {/* Coordinates Overlay */}
        <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground font-mono">
          {pinPosition[0].toFixed(6)}, {pinPosition[1].toFixed(6)}
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
          <div className="text-2xl mb-1">🏠</div>
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
          <div className="text-2xl mb-1">🛣️</div>
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

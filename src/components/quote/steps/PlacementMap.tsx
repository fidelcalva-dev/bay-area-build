/**
 * PlacementMap - Quote flow placement step using Google Maps satellite view
 * Replaces Leaflet with Google Maps for precise property-level placement
 */
import { useState, useCallback, useRef } from 'react';
import { MapPin, Move, AlertTriangle, CheckCircle, FileText, Truck, Home, Route, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Yard } from '@/lib/distanceService';
import { DEFAULT_DUMPSTER_DIMENSIONS, DEFAULT_TRUCK_DIMENSIONS } from '@/types/sitePlacement';
import { GoogleMapPlacement, type RectState, type EntryState } from '@/components/placement/GoogleMapPlacement';
import { toPng } from 'html-to-image';

export interface PlacementRectPayload {
  centerLat: number;
  centerLng: number;
  widthFt: number;
  lengthFt: number;
  rotationDeg: number;
}

export interface PlacementEntryPayload {
  lat: number;
  lng: number;
  bearingDeg: number;
}

export interface PlacementResult {
  dumpsterRect: PlacementRectPayload;
  truckRect: PlacementRectPayload;
  entry: PlacementEntryPayload;
  notes: string;
  screenshotBlob: Blob | null;
}

interface PlacementMapProps {
  addressLat: number;
  addressLng: number;
  onPlacementConfirmed: (placement: PlacementResult) => void;
  value?: PlacementResult | null;
  dumpsterSizeYd?: number;
  yard?: Yard | null;
  distanceMiles?: number;
}

export function PlacementMap({
  addressLat,
  addressLng,
  onPlacementConfirmed,
  value,
  dumpsterSizeYd = 20,
  yard,
  distanceMiles,
}: PlacementMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const dumpsterDims = DEFAULT_DUMPSTER_DIMENSIONS[dumpsterSizeYd] || DEFAULT_DUMPSTER_DIMENSIONS[20];
  const truckDims = DEFAULT_TRUCK_DIMENSIONS.ROLLOFF;

  const [dumpster, setDumpster] = useState<RectState>({
    lat: value?.dumpsterRect?.centerLat || addressLat,
    lng: value?.dumpsterRect?.centerLng || addressLng,
    widthFt: dumpsterDims.width_ft,
    lengthFt: dumpsterDims.length_ft,
    rotationDeg: value?.dumpsterRect?.rotationDeg || 0,
  });

  const [truck, setTruck] = useState<RectState>({
    lat: value?.truckRect?.centerLat || addressLat + 0.0001,
    lng: value?.truckRect?.centerLng || addressLng,
    widthFt: truckDims.width_ft,
    lengthFt: truckDims.length_ft,
    rotationDeg: value?.truckRect?.rotationDeg || 0,
  });

  const [entry, setEntry] = useState<EntryState>({
    lat: value?.entry?.lat || addressLat + 0.0002,
    lng: value?.entry?.lng || addressLng,
    bearingDeg: value?.entry?.bearingDeg || 0,
  });

  const [placementType, setPlacementType] = useState<'driveway' | 'street'>('driveway');
  const [notes, setNotes] = useState(value?.notes || '');
  const [isConfirmed, setIsConfirmed] = useState(!!value);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showNotes, setShowNotes] = useState(!!value?.notes);
  const [rotationDeg, setRotationDeg] = useState(value?.dumpsterRect?.rotationDeg || 0);

  const handleDumpsterChange = useCallback((r: RectState) => {
    setDumpster(r);
    setIsConfirmed(false);
  }, []);

  const handleTruckChange = useCallback((r: RectState) => {
    setTruck(r);
    setIsConfirmed(false);
  }, []);

  const handleEntryChange = useCallback((e: EntryState) => {
    setEntry(e);
    setIsConfirmed(false);
  }, []);

  const handleRotationChange = useCallback((deg: number) => {
    setRotationDeg(deg);
    setDumpster(prev => ({ ...prev, rotationDeg: deg }));
    setTruck(prev => ({ ...prev, rotationDeg: deg }));
    setIsConfirmed(false);
  }, []);

  const captureScreenshot = async (): Promise<Blob | null> => {
    if (!mapContainerRef.current) return null;
    try {
      const dataUrl = await toPng(mapContainerRef.current, { quality: 0.85 });
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (err) {
      console.error('Screenshot capture failed:', err);
      return null;
    }
  };

  const handleConfirm = async () => {
    setIsCapturing(true);
    const screenshotBlob = await captureScreenshot();

    const result: PlacementResult = {
      dumpsterRect: {
        centerLat: dumpster.lat,
        centerLng: dumpster.lng,
        widthFt: dumpster.widthFt,
        lengthFt: dumpster.lengthFt,
        rotationDeg: dumpster.rotationDeg,
      },
      truckRect: {
        centerLat: truck.lat,
        centerLng: truck.lng,
        widthFt: truck.widthFt,
        lengthFt: truck.lengthFt,
        rotationDeg: truck.rotationDeg,
      },
      entry: {
        lat: entry.lat,
        lng: entry.lng,
        bearingDeg: entry.bearingDeg,
      },
      notes: notes.trim(),
      screenshotBlob,
    };
    setIsConfirmed(true);
    setIsCapturing(false);
    onPlacementConfirmed(result);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Satellite Placement</h4>
          <p className="text-sm text-muted-foreground">
            Drag the green rectangle to position the dumpster. Blue rectangle shows truck clearance.
          </p>
        </div>
      </div>

      {/* Distance Info */}
      {yard && distanceMiles !== undefined && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-success/5 border-success/30">
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
            <Truck className="w-4 h-4 text-success" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-foreground">{distanceMiles.toFixed(1)} miles</span>
            <span className="text-sm text-muted-foreground ml-2">from {yard.name}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 px-3 py-2 rounded-lg">
        <Move className="w-4 h-4" />
        <span>Drag rectangles to position. Use slider to rotate.</span>
      </div>

      {/* Google Map */}
      <div ref={mapContainerRef}>
        <GoogleMapPlacement
          centerLat={addressLat}
          centerLng={addressLng}
          zoom={19}
          dumpster={dumpster}
          truck={truck}
          entry={entry}
          onDumpsterChange={handleDumpsterChange}
          onTruckChange={handleTruckChange}
          onEntryChange={handleEntryChange}
          height="350px"
          mapRef={googleMapRef}
        />
      </div>

      {/* Rotation Control */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Rotation</span>
        <input
          type="range"
          min={0}
          max={345}
          step={15}
          value={rotationDeg}
          onChange={(e) => handleRotationChange(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="text-sm font-mono text-foreground w-10 text-right">{rotationDeg}</span>
      </div>

      {/* Placement Type Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => { setPlacementType('driveway'); setIsConfirmed(false); }}
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
            <Home className={cn("w-5 h-5 transition-colors", placementType === 'driveway' ? "text-primary" : "text-foreground/70")} strokeWidth={2} />
          </div>
          <div className="font-medium text-foreground text-sm">Driveway</div>
          <div className="text-xs text-muted-foreground">Private property</div>
        </button>

        <button
          type="button"
          onClick={() => { setPlacementType('street'); setIsConfirmed(false); }}
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
            <Route className={cn("w-5 h-5 transition-colors", placementType === 'street' ? "text-primary" : "text-foreground/70")} strokeWidth={2} />
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
            <p className="text-xs mt-0.5 opacity-80">Street placement often requires a city permit. We will help you check.</p>
          </div>
        </div>
      )}

      {/* Placement Notes */}
      <div>
        {!showNotes ? (
          <button type="button" onClick={() => setShowNotes(true)} className="flex items-center gap-2 text-sm text-primary hover:underline">
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
              onChange={(e) => { setNotes(e.target.value); setIsConfirmed(false); }}
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
        disabled={isCapturing}
      >
        {isCapturing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Capturing...
          </>
        ) : isConfirmed ? (
          <>
            <CheckCircle className="w-5 h-5 text-success" />
            Placement Confirmed
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Confirm Placement
          </>
        )}
      </Button>
    </div>
  );
}

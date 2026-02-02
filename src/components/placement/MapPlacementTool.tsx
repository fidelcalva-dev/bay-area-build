/**
 * MapPlacementTool - Interactive map tool for placing dumpster and truck overlays
 * Uses Leaflet for map rendering with custom draggable/rotatable rectangles
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { toPng } from 'html-to-image';
import { 
  Truck, Package, RotateCcw, Save, Camera, AlignCenter, 
  Loader2, MapPin, StickyNote, ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useSitePlacement, useDimensions } from '@/hooks/useSitePlacement';
import { PlacementRectangle } from './PlacementRectangle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { 
  TruckType, 
  PlacementCreatorRole, 
  RectangleGeometry,
  TRUCK_TYPE_LABELS,
  DEFAULT_DUMPSTER_DIMENSIONS,
  DEFAULT_TRUCK_DIMENSIONS,
} from '@/types/sitePlacement';
import 'leaflet/dist/leaflet.css';

// Feet to meters conversion for Leaflet
const FT_TO_METERS = 0.3048;
// Approximate meters per pixel at zoom level 18
const getMetersPerPixel = (lat: number, zoom: number) => {
  return 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
};

interface MapPlacementToolProps {
  orderId: string;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
  dumpsterSizeYd?: number;
  defaultTruckType?: TruckType;
  creatorRole: PlacementCreatorRole;
  readOnly?: boolean;
  onSave?: (placementId: string) => void;
  onClose?: () => void;
}

// Truck type labels
const TRUCK_LABELS: Record<TruckType, string> = {
  ROLLOFF: 'Roll-Off Truck',
  HIGHSIDE: 'High-Side Trailer',
  END_DUMP: 'End Dump',
  TENWHEEL: 'Ten-Wheeler',
  SUPER10: 'Super 10',
};

// Default dimensions as fallback
const DEFAULT_DUMPSTER_DIMS: Record<number, { width_ft: number; length_ft: number }> = {
  5: { width_ft: 4, length_ft: 8 },
  6: { width_ft: 5, length_ft: 10 },
  8: { width_ft: 6, length_ft: 12 },
  10: { width_ft: 7, length_ft: 14 },
  20: { width_ft: 8, length_ft: 22 },
  30: { width_ft: 8, length_ft: 22 },
  40: { width_ft: 8, length_ft: 22 },
  50: { width_ft: 8, length_ft: 22 },
};

const DEFAULT_TRUCK_DIMS: Record<TruckType, { width_ft: number; length_ft: number }> = {
  ROLLOFF: { width_ft: 10, length_ft: 35 },
  HIGHSIDE: { width_ft: 10, length_ft: 40 },
  END_DUMP: { width_ft: 10, length_ft: 45 },
  TENWHEEL: { width_ft: 9, length_ft: 30 },
  SUPER10: { width_ft: 9, length_ft: 35 },
};

// Map event handler component
function MapEventHandler({ onCenterChange, onZoomChange }: { 
  onCenterChange: (lat: number, lng: number) => void;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onCenterChange(center.lat, center.lng);
    },
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

// Overlay layer that renders on top of the map
function OverlayLayer({ 
  dumpsterRect, 
  truckRect,
  dumpsterDims,
  truckDims,
  mapCenter,
  mapZoom,
  activeRect,
  onDumpsterMove,
  onDumpsterRotate,
  onTruckMove,
  onTruckRotate,
  onSetActive,
  snapToAngle,
  readOnly,
}: {
  dumpsterRect: RectangleGeometry;
  truckRect: RectangleGeometry;
  dumpsterDims: { width_ft: number; length_ft: number };
  truckDims: { width_ft: number; length_ft: number };
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  activeRect: 'dumpster' | 'truck' | null;
  onDumpsterMove: (lat: number, lng: number) => void;
  onDumpsterRotate: (deg: number) => void;
  onTruckMove: (lat: number, lng: number) => void;
  onTruckRotate: (deg: number) => void;
  onSetActive: (rect: 'dumpster' | 'truck' | null) => void;
  snapToAngle: boolean;
  readOnly: boolean;
}) {
  const map = useMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Convert lat/lng to container pixels
  const latLngToPixel = useCallback((lat: number, lng: number) => {
    const point = map.latLngToContainerPoint([lat, lng]);
    return { x: point.x, y: point.y };
  }, [map]);

  // Convert container pixels to lat/lng
  const pixelToLatLng = useCallback((x: number, y: number) => {
    const latlng = map.containerPointToLatLng([x, y]);
    return { lat: latlng.lat, lng: latlng.lng };
  }, [map]);

  // Calculate scale (pixels per foot)
  const metersPerPixel = getMetersPerPixel(mapCenter.lat, mapZoom);
  const feetPerPixel = metersPerPixel / FT_TO_METERS;
  const pixelsPerFoot = 1 / feetPerPixel;

  // Get pixel positions
  const dumpsterPixel = latLngToPixel(dumpsterRect.center.lat, dumpsterRect.center.lng);
  const truckPixel = latLngToPixel(truckRect.center.lat, truckRect.center.lng);

  // Handle dumpster move
  const handleDumpsterMove = useCallback((x: number, y: number) => {
    if (readOnly) return;
    const { lat, lng } = pixelToLatLng(x, y);
    onDumpsterMove(lat, lng);
  }, [readOnly, pixelToLatLng, onDumpsterMove]);

  // Handle truck move
  const handleTruckMove = useCallback((x: number, y: number) => {
    if (readOnly) return;
    const { lat, lng } = pixelToLatLng(x, y);
    onTruckMove(lat, lng);
  }, [readOnly, pixelToLatLng, onTruckMove]);

  if (readOnly) {
    return (
      <div ref={containerRef} className="absolute inset-0 pointer-events-none z-[1000]">
        <PlacementRectangle
          id="dumpster"
          label="Dumpster"
          widthFt={dumpsterDims.width_ft}
          lengthFt={dumpsterDims.length_ft}
          centerX={dumpsterPixel.x}
          centerY={dumpsterPixel.y}
          rotation={dumpsterRect.rotation_deg}
          scale={pixelsPerFoot}
          color="rgba(34, 197, 94, 0.4)"
          borderColor="#16a34a"
          onMove={() => {}}
          onRotate={() => {}}
          isActive={false}
        />
        <PlacementRectangle
          id="truck"
          label="Truck Clearance"
          widthFt={truckDims.width_ft}
          lengthFt={truckDims.length_ft}
          centerX={truckPixel.x}
          centerY={truckPixel.y}
          rotation={truckRect.rotation_deg}
          scale={pixelsPerFoot}
          color="rgba(59, 130, 246, 0.3)"
          borderColor="#2563eb"
          onMove={() => {}}
          onRotate={() => {}}
          isActive={false}
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-[1000]"
      onClick={() => onSetActive(null)}
    >
      <PlacementRectangle
        id="dumpster"
        label="Dumpster"
        widthFt={dumpsterDims.width_ft}
        lengthFt={dumpsterDims.length_ft}
        centerX={dumpsterPixel.x}
        centerY={dumpsterPixel.y}
        rotation={dumpsterRect.rotation_deg}
        scale={pixelsPerFoot}
        color="rgba(34, 197, 94, 0.4)"
        borderColor="#16a34a"
        onMove={handleDumpsterMove}
        onRotate={onDumpsterRotate}
        snapToAngle={snapToAngle}
        isActive={activeRect === 'dumpster'}
        onActivate={() => onSetActive('dumpster')}
      />
      <PlacementRectangle
        id="truck"
        label="Truck Clearance"
        widthFt={truckDims.width_ft}
        lengthFt={truckDims.length_ft}
        centerX={truckPixel.x}
        centerY={truckPixel.y}
        rotation={truckRect.rotation_deg}
        scale={pixelsPerFoot}
        color="rgba(59, 130, 246, 0.3)"
        borderColor="#2563eb"
        onMove={handleTruckMove}
        onRotate={onTruckRotate}
        snapToAngle={snapToAngle}
        isActive={activeRect === 'truck'}
        onActivate={() => onSetActive('truck')}
      />
    </div>
  );
}

export function MapPlacementTool({
  orderId,
  initialAddress,
  initialLat = 37.7749,
  initialLng = -122.4194,
  dumpsterSizeYd = 10,
  defaultTruckType = 'ROLLOFF',
  creatorRole,
  readOnly = false,
  onSave,
  onClose,
}: MapPlacementToolProps) {
  const { toast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { 
    placement, 
    isLoading, 
    isSaving, 
    savePlacement, 
    uploadPlacementImage,
    getSignedImageUrl,
  } = useSitePlacement({ orderId });
  const { dumpsterDimensions, truckDimensions, getDumpsterDimension, getTruckDimension } = useDimensions();

  // State
  const [mapCenter, setMapCenter] = useState({ lat: initialLat, lng: initialLng });
  const [mapZoom, setMapZoom] = useState(18);
  const [dumpsterSize, setDumpsterSize] = useState(dumpsterSizeYd);
  const [truckType, setTruckType] = useState<TruckType>(defaultTruckType);
  const [activeRect, setActiveRect] = useState<'dumpster' | 'truck' | null>(null);
  const [snapToAngle, setSnapToAngle] = useState(true);
  const [placementNotes, setPlacementNotes] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Rectangle states
  const [dumpsterRect, setDumpsterRect] = useState<RectangleGeometry>({
    center: { lat: initialLat, lng: initialLng },
    width_ft: DEFAULT_DUMPSTER_DIMS[dumpsterSizeYd]?.width_ft || 7,
    length_ft: DEFAULT_DUMPSTER_DIMS[dumpsterSizeYd]?.length_ft || 14,
    rotation_deg: 0,
  });
  
  const [truckRect, setTruckRect] = useState<RectangleGeometry>({
    center: { lat: initialLat + 0.0001, lng: initialLng },
    width_ft: DEFAULT_TRUCK_DIMS[defaultTruckType].width_ft,
    length_ft: DEFAULT_TRUCK_DIMS[defaultTruckType].length_ft,
    rotation_deg: 0,
  });

  // Load existing placement
  useEffect(() => {
    if (placement) {
      setMapCenter({ lat: placement.map_center_lat, lng: placement.map_center_lng });
      setMapZoom(placement.map_zoom);
      setDumpsterSize(placement.dumpster_size_yd);
      setTruckType(placement.truck_type);
      setDumpsterRect(placement.dumpster_rect_json);
      setTruckRect(placement.truck_rect_json);
      setPlacementNotes(placement.placement_notes || '');
      
      // Load image preview if exists
      if (placement.image_storage_path) {
        getSignedImageUrl(placement.image_storage_path).then(url => {
          if (url) setPreviewImageUrl(url);
        });
      }
    }
  }, [placement, getSignedImageUrl]);

  // Get dimensions
  const dumpsterDims = getDumpsterDimension(dumpsterSize) || DEFAULT_DUMPSTER_DIMS[dumpsterSize] || DEFAULT_DUMPSTER_DIMS[10];
  const truckDims = getTruckDimension(truckType) || DEFAULT_TRUCK_DIMS[truckType];

  // Update dumpster dimensions when size changes
  useEffect(() => {
    const dims = getDumpsterDimension(dumpsterSize) || DEFAULT_DUMPSTER_DIMS[dumpsterSize];
    if (dims) {
      setDumpsterRect(prev => ({
        ...prev,
        width_ft: dims.width_ft,
        length_ft: dims.length_ft,
      }));
    }
  }, [dumpsterSize, getDumpsterDimension]);

  // Update truck dimensions when type changes
  useEffect(() => {
    const dims = getTruckDimension(truckType) || DEFAULT_TRUCK_DIMS[truckType];
    if (dims) {
      setTruckRect(prev => ({
        ...prev,
        width_ft: dims.width_ft,
        length_ft: dims.length_ft,
      }));
    }
  }, [truckType, getTruckDimension]);

  // Handlers
  const handleDumpsterMove = useCallback((lat: number, lng: number) => {
    setDumpsterRect(prev => ({ ...prev, center: { lat, lng } }));
  }, []);

  const handleDumpsterRotate = useCallback((deg: number) => {
    setDumpsterRect(prev => ({ ...prev, rotation_deg: deg }));
  }, []);

  const handleTruckMove = useCallback((lat: number, lng: number) => {
    setTruckRect(prev => ({ ...prev, center: { lat, lng } }));
  }, []);

  const handleTruckRotate = useCallback((deg: number) => {
    setTruckRect(prev => ({ ...prev, rotation_deg: deg }));
  }, []);

  const handleAlignTruck = useCallback(() => {
    setTruckRect(prev => ({
      ...prev,
      rotation_deg: dumpsterRect.rotation_deg,
    }));
    toast({ title: 'Truck aligned with dumpster orientation' });
  }, [dumpsterRect.rotation_deg, toast]);

  const handleReset = useCallback(() => {
    setDumpsterRect({
      center: { lat: mapCenter.lat, lng: mapCenter.lng },
      width_ft: dumpsterDims.width_ft,
      length_ft: dumpsterDims.length_ft,
      rotation_deg: 0,
    });
    setTruckRect({
      center: { lat: mapCenter.lat + 0.0001, lng: mapCenter.lng },
      width_ft: truckDims.width_ft,
      length_ft: truckDims.length_ft,
      rotation_deg: 0,
    });
    setPlacementNotes('');
    toast({ title: 'Placement reset' });
  }, [mapCenter, dumpsterDims, truckDims, toast]);

  const handleCapture = useCallback(async () => {
    if (!mapContainerRef.current) return null;
    
    setIsCapturing(true);
    try {
      const dataUrl = await toPng(mapContainerRef.current, {
        quality: 0.95,
        pixelRatio: 2,
      });
      
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      return blob;
    } catch (err) {
      console.error('Error capturing map:', err);
      toast({ title: 'Failed to capture map image', variant: 'destructive' });
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [toast]);

  const handleSave = useCallback(async () => {
    // Capture image first
    const imageBlob = await handleCapture();
    let imagePath: string | null = null;
    
    if (imageBlob) {
      imagePath = await uploadPlacementImage(imageBlob);
    }
    
    const result = await savePlacement({
      mapCenterLat: mapCenter.lat,
      mapCenterLng: mapCenter.lng,
      mapZoom,
      dumpsterSizeYd: dumpsterSize,
      dumpsterRectJson: dumpsterRect,
      truckType,
      truckRectJson: truckRect,
      placementNotes,
      imageStoragePath: imagePath || undefined,
      creatorRole,
    });
    
    if (result.success && result.placementId) {
      onSave?.(result.placementId);
    }
  }, [
    handleCapture, uploadPlacementImage, savePlacement, mapCenter, mapZoom,
    dumpsterSize, dumpsterRect, truckType, truckRect, placementNotes, creatorRole, onSave
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {!readOnly && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Dumpster Size */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Dumpster Size</Label>
                <Select value={String(dumpsterSize)} onValueChange={(v) => setDumpsterSize(Number(v))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 6, 8, 10, 20, 30, 40, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} yard
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Truck Type */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Truck Type</Label>
                <Select value={truckType} onValueChange={(v) => setTruckType(v as TruckType)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRUCK_LABELS).map(([type, label]) => (
                      <SelectItem key={type} value={type}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Snap to Angle */}
              <div className="flex items-center gap-2">
                <Switch
                  id="snap-angle"
                  checked={snapToAngle}
                  onCheckedChange={setSnapToAngle}
                />
                <Label htmlFor="snap-angle" className="text-sm">Snap to angle</Label>
              </div>

              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleAlignTruck}>
                  <AlignCenter className="w-4 h-4 mr-1" />
                  Align Truck
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <div 
        ref={mapContainerRef}
        className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border"
      >
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={mapZoom}
          className="w-full h-full z-0"
          zoomControl={!readOnly}
          dragging={!readOnly}
          scrollWheelZoom={!readOnly}
        >
          <TileLayer
            attribution='Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
            url="https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
          />
          <MapEventHandler 
            onCenterChange={(lat, lng) => setMapCenter({ lat, lng })}
            onZoomChange={setMapZoom}
          />
          <OverlayLayer
            dumpsterRect={dumpsterRect}
            truckRect={truckRect}
            dumpsterDims={dumpsterDims}
            truckDims={truckDims}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            activeRect={activeRect}
            onDumpsterMove={handleDumpsterMove}
            onDumpsterRotate={handleDumpsterRotate}
            onTruckMove={handleTruckMove}
            onTruckRotate={handleTruckRotate}
            onSetActive={setActiveRect}
            snapToAngle={snapToAngle}
            readOnly={readOnly}
          />
        </MapContainer>
        
        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-lg p-2 shadow-md z-[1001]">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-green-500/40 border border-green-600" />
              <span>Dumpster ({dumpsterSize}yd)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-blue-500/30 border border-blue-600" />
              <span>Truck Clearance</span>
            </div>
          </div>
        </div>

        {/* Capture overlay */}
        {isCapturing && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-[1002]">
            <div className="bg-white rounded-lg p-4 flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Capturing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {!readOnly && (
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <StickyNote className="w-4 h-4" />
            Placement Notes
          </Label>
          <Textarea
            placeholder="Gate code, preferred spot, special instructions..."
            value={placementNotes}
            onChange={(e) => setPlacementNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      )}

      {/* Preview Image */}
      {readOnly && previewImageUrl && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Saved Placement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={previewImageUrl} 
              alt="Site placement" 
              className="w-full rounded-lg border"
            />
            {placement?.placement_notes && (
              <p className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                {placement.placement_notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="flex gap-2 justify-end">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Placement
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * MapPlacementTool - Admin/ops interactive placement tool using Google Maps satellite view
 * Draggable/rotatable dumpster + truck rectangles with save functionality
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import {
  Truck, Package, RotateCcw, Save, Camera, AlignCenter,
  Loader2, StickyNote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useSitePlacement, useDimensions } from '@/hooks/useSitePlacement';
import { GoogleMapPlacement, type RectState } from './GoogleMapPlacement';
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
} from '@/types/sitePlacement';

const TRUCK_LABELS: Record<TruckType, string> = {
  ROLLOFF: 'Roll-Off Truck',
  HIGHSIDE: 'High-Side Trailer',
  END_DUMP: 'End Dump',
  TENWHEEL: 'Ten-Wheeler',
  SUPER10: 'Super 10',
};

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
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const {
    placement, isLoading, isSaving,
    savePlacement, uploadPlacementImage, getSignedImageUrl,
  } = useSitePlacement({ orderId });
  const { getDumpsterDimension, getTruckDimension } = useDimensions();

  const [mapCenter, setMapCenter] = useState({ lat: initialLat, lng: initialLng });
  const [mapZoom, setMapZoom] = useState(19);
  const [dumpsterSize, setDumpsterSize] = useState(dumpsterSizeYd);
  const [truckType, setTruckType] = useState<TruckType>(defaultTruckType);
  const [snapToAngle, setSnapToAngle] = useState(true);
  const [placementNotes, setPlacementNotes] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const dumpsterDims = getDumpsterDimension(dumpsterSize) || DEFAULT_DUMPSTER_DIMS[dumpsterSize] || DEFAULT_DUMPSTER_DIMS[10];
  const truckDims = getTruckDimension(truckType) || DEFAULT_TRUCK_DIMS[truckType];

  const [dumpster, setDumpster] = useState<RectState>({
    lat: initialLat,
    lng: initialLng,
    widthFt: dumpsterDims.width_ft,
    lengthFt: dumpsterDims.length_ft,
    rotationDeg: 0,
  });

  const [truck, setTruck] = useState<RectState>({
    lat: initialLat + 0.0001,
    lng: initialLng,
    widthFt: truckDims.width_ft,
    lengthFt: truckDims.length_ft,
    rotationDeg: 0,
  });

  // Load existing placement
  useEffect(() => {
    if (placement) {
      setMapCenter({ lat: placement.map_center_lat, lng: placement.map_center_lng });
      setMapZoom(placement.map_zoom);
      setDumpsterSize(placement.dumpster_size_yd);
      setTruckType(placement.truck_type);
      const dr = placement.dumpster_rect_json;
      const tr = placement.truck_rect_json;
      setDumpster({
        lat: dr.center.lat, lng: dr.center.lng,
        widthFt: dr.width_ft, lengthFt: dr.length_ft, rotationDeg: dr.rotation_deg,
      });
      setTruck({
        lat: tr.center.lat, lng: tr.center.lng,
        widthFt: tr.width_ft, lengthFt: tr.length_ft, rotationDeg: tr.rotation_deg,
      });
      setPlacementNotes(placement.placement_notes || '');

      if (placement.image_storage_path) {
        getSignedImageUrl(placement.image_storage_path).then(url => {
          if (url) setPreviewImageUrl(url);
        });
      }
    }
  }, [placement, getSignedImageUrl]);

  // Sync dims when size/type changes
  useEffect(() => {
    const dims = getDumpsterDimension(dumpsterSize) || DEFAULT_DUMPSTER_DIMS[dumpsterSize];
    if (dims) setDumpster(prev => ({ ...prev, widthFt: dims.width_ft, lengthFt: dims.length_ft }));
  }, [dumpsterSize, getDumpsterDimension]);

  useEffect(() => {
    const dims = getTruckDimension(truckType) || DEFAULT_TRUCK_DIMS[truckType];
    if (dims) setTruck(prev => ({ ...prev, widthFt: dims.width_ft, lengthFt: dims.length_ft }));
  }, [truckType, getTruckDimension]);

  const handleAlignTruck = useCallback(() => {
    setTruck(prev => ({ ...prev, rotationDeg: dumpster.rotationDeg }));
    toast({ title: 'Truck aligned with dumpster orientation' });
  }, [dumpster.rotationDeg, toast]);

  const handleReset = useCallback(() => {
    setDumpster({
      lat: mapCenter.lat, lng: mapCenter.lng,
      widthFt: dumpsterDims.width_ft, lengthFt: dumpsterDims.length_ft, rotationDeg: 0,
    });
    setTruck({
      lat: mapCenter.lat + 0.0001, lng: mapCenter.lng,
      widthFt: truckDims.width_ft, lengthFt: truckDims.length_ft, rotationDeg: 0,
    });
    setPlacementNotes('');
    toast({ title: 'Placement reset' });
  }, [mapCenter, dumpsterDims, truckDims, toast]);

  const handleCapture = useCallback(async () => {
    if (!mapContainerRef.current) return null;
    setIsCapturing(true);
    try {
      const dataUrl = await toPng(mapContainerRef.current, { quality: 0.95, pixelRatio: 2 });
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (err) {
      console.error('Error capturing map:', err);
      toast({ title: 'Failed to capture map image', variant: 'destructive' });
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [toast]);

  const handleSave = useCallback(async () => {
    const imageBlob = await handleCapture();
    let imagePath: string | null = null;
    if (imageBlob) imagePath = await uploadPlacementImage(imageBlob);

    const toGeometry = (r: RectState): RectangleGeometry => ({
      center: { lat: r.lat, lng: r.lng },
      width_ft: r.widthFt,
      length_ft: r.lengthFt,
      rotation_deg: r.rotationDeg,
    });

    const result = await savePlacement({
      mapCenterLat: mapCenter.lat,
      mapCenterLng: mapCenter.lng,
      mapZoom,
      dumpsterSizeYd: dumpsterSize,
      dumpsterRectJson: toGeometry(dumpster),
      truckType,
      truckRectJson: toGeometry(truck),
      placementNotes,
      imageStoragePath: imagePath || undefined,
      creatorRole,
    });

    if (result.success && result.placementId) {
      onSave?.(result.placementId);
    }
  }, [handleCapture, uploadPlacementImage, savePlacement, mapCenter, mapZoom,
    dumpsterSize, dumpster, truckType, truck, placementNotes, creatorRole, onSave]);

  const handleMapMove = useCallback((lat: number, lng: number, zoom: number) => {
    setMapCenter({ lat, lng });
    setMapZoom(zoom);
  }, []);

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
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Dumpster Size</Label>
                <Select value={String(dumpsterSize)} onValueChange={(v) => setDumpsterSize(Number(v))}>
                  <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 6, 8, 10, 20, 30, 40, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>{size} yard</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Truck Type</Label>
                <Select value={truckType} onValueChange={(v) => setTruckType(v as TruckType)}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRUCK_LABELS).map(([type, label]) => (
                      <SelectItem key={type} value={type}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch id="snap-angle" checked={snapToAngle} onCheckedChange={setSnapToAngle} />
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

      {/* Map */}
      <div ref={mapContainerRef}>
        <GoogleMapPlacement
          centerLat={mapCenter.lat}
          centerLng={mapCenter.lng}
          zoom={mapZoom}
          dumpster={dumpster}
          truck={truck}
          onDumpsterChange={setDumpster}
          onTruckChange={setTruck}
          onMapMove={handleMapMove}
          readOnly={readOnly}
          height={readOnly ? '300px' : '500px'}
          mapRef={googleMapRef}
        />
      </div>

      {/* Capture overlay */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-4 flex items-center gap-2 shadow-lg">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-foreground">Capturing...</span>
          </div>
        </div>
      )}

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

      {/* Preview Image (read-only) */}
      {readOnly && previewImageUrl && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Saved Placement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img src={previewImageUrl} alt="Site placement" className="w-full rounded-lg border" />
            {placement?.placement_notes && (
              <p className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">{placement.placement_notes}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="flex gap-2 justify-end">
          {onClose && (
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Placement
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * GoogleMapPlacement - Google Maps satellite placement with draggable/rotatable rectangles
 * Renders dumpster + truck clearance overlays on satellite imagery
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Loader2 } from 'lucide-react';

// --- Geometry helpers ---
const EARTH_RADIUS_FT = 20902231;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function offsetLatLng(
  lat: number, lng: number, dxFt: number, dyFt: number
): { lat: number; lng: number } {
  const dLat = (dyFt / EARTH_RADIUS_FT) * RAD2DEG;
  const dLng = (dxFt / (EARTH_RADIUS_FT * Math.cos(lat * DEG2RAD))) * RAD2DEG;
  return { lat: lat + dLat, lng: lng + dLng };
}

function rotatePoint(x: number, y: number, angleDeg: number) {
  const rad = angleDeg * DEG2RAD;
  return {
    x: x * Math.cos(rad) - y * Math.sin(rad),
    y: x * Math.sin(rad) + y * Math.cos(rad),
  };
}

function buildRectPath(
  centerLat: number, centerLng: number,
  widthFt: number, lengthFt: number, rotationDeg: number
): google.maps.LatLngLiteral[] {
  const hw = widthFt / 2;
  const hl = lengthFt / 2;
  const corners = [
    { x: -hw, y: -hl },
    { x: hw, y: -hl },
    { x: hw, y: hl },
    { x: -hw, y: hl },
  ];
  return corners.map(c => {
    const r = rotatePoint(c.x, c.y, rotationDeg);
    return offsetLatLng(centerLat, centerLng, r.x, r.y);
  });
}

// --- Types ---
export interface RectState {
  lat: number;
  lng: number;
  widthFt: number;
  lengthFt: number;
  rotationDeg: number;
}

export interface EntryState {
  lat: number;
  lng: number;
  bearingDeg: number;
}

interface GoogleMapPlacementProps {
  centerLat: number;
  centerLng: number;
  zoom?: number;
  dumpster: RectState;
  truck: RectState;
  entry?: EntryState;
  onDumpsterChange: (r: RectState) => void;
  onTruckChange: (r: RectState) => void;
  onEntryChange?: (e: EntryState) => void;
  onMapMove?: (lat: number, lng: number, zoom: number) => void;
  readOnly?: boolean;
  height?: string;
  mapRef?: React.MutableRefObject<google.maps.Map | null>;
}

export function GoogleMapPlacement({
  centerLat, centerLng, zoom = 19,
  dumpster, truck, entry,
  onDumpsterChange, onTruckChange, onEntryChange,
  onMapMove, readOnly = false, height = '400px',
  mapRef: externalMapRef,
}: GoogleMapPlacementProps) {
  const { isLoaded, isLoading, error, load } = useGoogleMaps();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const dumpsterPolyRef = useRef<google.maps.Polygon | null>(null);
  const truckPolyRef = useRef<google.maps.Polygon | null>(null);
  const entryMarkerRef = useRef<google.maps.Marker | null>(null);
  const approachLineRef = useRef<google.maps.Polyline | null>(null);
  const dumpsterLabelRef = useRef<google.maps.Marker | null>(null);
  const truckLabelRef = useRef<google.maps.Marker | null>(null);
  const [activeRect, setActiveRect] = useState<'dumpster' | 'truck' | null>(null);
  const dragRef = useRef<{ startLat: number; startLng: number; origLat: number; origLng: number } | null>(null);
  const rotateRef = useRef<{ startAngle: number; origRotation: number; centerLat: number; centerLng: number } | null>(null);

  // Load Google Maps on mount
  useEffect(() => { load(); }, [load]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapInstanceRef.current) return;

    const map = new google.maps.Map(containerRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom,
      mapTypeId: 'satellite',
      tilt: 0,
      gestureHandling: 'greedy',
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      rotateControl: false,
      styles: [],
    });

    mapInstanceRef.current = map;
    if (externalMapRef) externalMapRef.current = map;

    if (onMapMove) {
      map.addListener('idle', () => {
        const c = map.getCenter();
        const z = map.getZoom();
        if (c && z !== undefined) onMapMove(c.lat(), c.lng(), z);
      });
    }
  }, [isLoaded, centerLat, centerLng, zoom]);

  // --- Polygon updates ---
  const updateDumpsterPoly = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const path = buildRectPath(dumpster.lat, dumpster.lng, dumpster.widthFt, dumpster.lengthFt, dumpster.rotationDeg);

    if (!dumpsterPolyRef.current) {
      const poly = new google.maps.Polygon({
        paths: path,
        strokeColor: '#16a34a',
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: '#22c55e',
        fillOpacity: 0.35,
        map,
        zIndex: 10,
        ...(readOnly ? {} : { draggable: false }),
      });

      if (!readOnly) {
        // Drag
        poly.addListener('mousedown', (e: google.maps.PolyMouseEvent) => {
          if (e.latLng) {
            setActiveRect('dumpster');
            dragRef.current = {
              startLat: e.latLng.lat(), startLng: e.latLng.lng(),
              origLat: dumpster.lat, origLng: dumpster.lng,
            };
            map.set('draggable', false);
          }
        });
      }
      dumpsterPolyRef.current = poly;
    } else {
      dumpsterPolyRef.current.setPath(path);
    }

    // Label
    if (!dumpsterLabelRef.current) {
      dumpsterLabelRef.current = new google.maps.Marker({
        position: { lat: dumpster.lat, lng: dumpster.lng },
        map,
        icon: {
          url: 'data:image/svg+xml,' + encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>`
          ),
          scaledSize: new google.maps.Size(1, 1),
        },
        label: {
          text: `${dumpster.lengthFt}x${dumpster.widthFt}ft`,
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 'bold',
          className: 'placement-label',
        },
        zIndex: 20,
        clickable: false,
      });
    } else {
      dumpsterLabelRef.current.setPosition({ lat: dumpster.lat, lng: dumpster.lng });
    }
  }, [dumpster, readOnly]);

  const updateTruckPoly = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const path = buildRectPath(truck.lat, truck.lng, truck.widthFt, truck.lengthFt, truck.rotationDeg);

    if (!truckPolyRef.current) {
      const poly = new google.maps.Polygon({
        paths: path,
        strokeColor: '#2563eb',
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.25,
        map,
        zIndex: 5,
      });

      if (!readOnly) {
        poly.addListener('mousedown', (e: google.maps.PolyMouseEvent) => {
          if (e.latLng) {
            setActiveRect('truck');
            dragRef.current = {
              startLat: e.latLng.lat(), startLng: e.latLng.lng(),
              origLat: truck.lat, origLng: truck.lng,
            };
            map.set('draggable', false);
          }
        });
      }
      truckPolyRef.current = poly;
    } else {
      truckPolyRef.current.setPath(path);
    }

    // Label
    if (!truckLabelRef.current) {
      truckLabelRef.current = new google.maps.Marker({
        position: { lat: truck.lat, lng: truck.lng },
        map,
        icon: {
          url: 'data:image/svg+xml,' + encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>`
          ),
          scaledSize: new google.maps.Size(1, 1),
        },
        label: {
          text: `Truck ${truck.lengthFt}x${truck.widthFt}ft`,
          color: '#ffffff',
          fontSize: '10px',
          fontWeight: 'bold',
        },
        zIndex: 15,
        clickable: false,
      });
    } else {
      truckLabelRef.current.setPosition({ lat: truck.lat, lng: truck.lng });
    }
  }, [truck, readOnly]);

  // Entry marker + approach line
  const updateEntry = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !entry) return;

    if (!entryMarkerRef.current) {
      entryMarkerRef.current = new google.maps.Marker({
        position: { lat: entry.lat, lng: entry.lng },
        map,
        draggable: !readOnly,
        title: 'Truck Entry',
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 5,
          fillColor: '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: entry.bearingDeg,
        },
        zIndex: 25,
      });

      if (!readOnly && onEntryChange) {
        entryMarkerRef.current.addListener('dragend', () => {
          const pos = entryMarkerRef.current?.getPosition();
          if (pos) {
            // Compute bearing toward dumpster
            const dLat = dumpster.lat - pos.lat();
            const dLng = dumpster.lng - pos.lng();
            const bearing = Math.atan2(dLng, dLat) * RAD2DEG;
            onEntryChange({ lat: pos.lat(), lng: pos.lng(), bearingDeg: (bearing + 360) % 360 });
          }
        });
      }
    } else {
      entryMarkerRef.current.setPosition({ lat: entry.lat, lng: entry.lng });
      const icon = entryMarkerRef.current.getIcon() as google.maps.Symbol;
      if (icon) {
        entryMarkerRef.current.setIcon({ ...icon, rotation: entry.bearingDeg });
      }
    }

    // Approach line: entry -> dumpster
    const linePath = [
      { lat: entry.lat, lng: entry.lng },
      { lat: dumpster.lat, lng: dumpster.lng },
    ];
    if (!approachLineRef.current) {
      approachLineRef.current = new google.maps.Polyline({
        path: linePath,
        strokeColor: '#f59e0b',
        strokeOpacity: 0.7,
        strokeWeight: 3,
        map,
        zIndex: 3,
        icons: [{
          icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3 },
          offset: '50%',
        }],
      });
    } else {
      approachLineRef.current.setPath(linePath);
    }
  }, [entry, dumpster, readOnly, onEntryChange]);

  // Sync polygons
  useEffect(() => { updateDumpsterPoly(); }, [updateDumpsterPoly]);
  useEffect(() => { updateTruckPoly(); }, [updateTruckPoly]);
  useEffect(() => { updateEntry(); }, [updateEntry]);

  // Drag handling on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || readOnly) return;

    const moveListener = map.addListener('mousemove', (e: google.maps.MapMouseEvent) => {
      if (!dragRef.current || !e.latLng) return;
      const dLat = e.latLng.lat() - dragRef.current.startLat;
      const dLng = e.latLng.lng() - dragRef.current.startLng;
      const newLat = dragRef.current.origLat + dLat;
      const newLng = dragRef.current.origLng + dLng;

      if (activeRect === 'dumpster') {
        onDumpsterChange({ ...dumpster, lat: newLat, lng: newLng });
      } else if (activeRect === 'truck') {
        onTruckChange({ ...truck, lat: newLat, lng: newLng });
      }
    });

    const upListener = map.addListener('mouseup', () => {
      if (dragRef.current) {
        dragRef.current = null;
        map.set('draggable', true);
      }
    });

    return () => {
      google.maps.event.removeListener(moveListener);
      google.maps.event.removeListener(upListener);
    };
  }, [activeRect, dumpster, truck, readOnly, onDumpsterChange, onTruckChange]);

  // Touch support for drag
  useEffect(() => {
    const el = containerRef.current;
    const map = mapInstanceRef.current;
    if (!el || !map || readOnly) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragRef.current || !e.touches[0]) return;
      e.preventDefault();
      const touch = e.touches[0];
      const point = new google.maps.Point(touch.clientX - el.getBoundingClientRect().left, touch.clientY - el.getBoundingClientRect().top);
      // Use overlay projection if available, otherwise approximate
      const bounds = map.getBounds();
      const ne = bounds?.getNorthEast();
      const sw = bounds?.getSouthWest();
      if (!ne || !sw) return;
      const lat = ne.lat() - (point.y / el.offsetHeight) * (ne.lat() - sw.lat());
      const lng = sw.lng() + (point.x / el.offsetWidth) * (ne.lng() - sw.lng());
      const dLat = lat - dragRef.current.startLat;
      const dLng = lng - dragRef.current.startLng;
      const newLat = dragRef.current.origLat + dLat;
      const newLng = dragRef.current.origLng + dLng;

      if (activeRect === 'dumpster') {
        onDumpsterChange({ ...dumpster, lat: newLat, lng: newLng });
      } else if (activeRect === 'truck') {
        onTruckChange({ ...truck, lat: newLat, lng: newLng });
      }
    };

    const handleTouchEnd = () => {
      if (dragRef.current) {
        dragRef.current = null;
        map.set('draggable', true);
      }
    };

    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeRect, dumpster, truck, readOnly, onDumpsterChange, onTruckChange]);

  // Cleanup
  useEffect(() => {
    return () => {
      dumpsterPolyRef.current?.setMap(null);
      truckPolyRef.current?.setMap(null);
      entryMarkerRef.current?.setMap(null);
      approachLineRef.current?.setMap(null);
      dumpsterLabelRef.current?.setMap(null);
      truckLabelRef.current?.setMap(null);
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-muted rounded-xl border" style={{ height }}>
        <p className="text-sm text-destructive">Failed to load map: {error}</p>
      </div>
    );
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center bg-muted rounded-xl border" style={{ height }}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-border shadow-sm">
      <div ref={containerRef} style={{ height, width: '100%' }} />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-background/95 backdrop-blur rounded-lg p-2 shadow-md z-10">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm border border-green-600" style={{ backgroundColor: 'rgba(34,197,94,0.35)' }} />
            <span className="text-foreground">Dumpster</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm border border-blue-600" style={{ backgroundColor: 'rgba(59,130,246,0.25)' }} />
            <span className="text-foreground">Truck</span>
          </div>
          {entry && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
              <span className="text-foreground">Entry</span>
            </div>
          )}
        </div>
      </div>

      {/* Active indicator */}
      {activeRect && !readOnly && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-3 py-1 rounded-full shadow text-xs font-medium text-foreground z-10">
          Dragging: {activeRect === 'dumpster' ? 'Dumpster' : 'Truck Clearance'}
        </div>
      )}
    </div>
  );
}

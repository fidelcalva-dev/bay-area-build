// Distance Map Component - Shows yard to customer distance visualization
// Uses Leaflet for mapping with Apple-like UI polish

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Truck, AlertTriangle, Route } from 'lucide-react';
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border: 2px solid white;
      ">
        <svg style="transform: rotate(45deg); width: 18px; height: 18px; color: white;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 9H12V18"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Customer icon (orange pin marker) - SVG inline
const createCustomerIcon = () => {
  return L.divIcon({
    className: 'custom-customer-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #f97316, #ea580c);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border: 2px solid white;
      ">
        <svg style="transform: rotate(45deg); width: 18px; height: 18px; color: white;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// ============================================================
// MAP UPDATER
// ============================================================

function MapFitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, bounds]);
  
  return null;
}

// ============================================================
// DISTANCE MAP COMPONENT
// ============================================================

interface DistanceMapProps {
  customerLat: number;
  customerLng: number;
  yard: Yard;
  distanceMiles: number;
  distanceMinutes?: number;
  durationTrafficMin?: number;
  durationTrafficMax?: number;
  polyline?: string; // Encoded polyline from truck routing
  routingProvider?: 'google_routes' | 'haversine_fallback';
  requiresReview?: boolean;
  className?: string;
}

// Decode Google polyline to array of [lat, lng]
function decodePolyline(encoded: string): [number, number][] {
  const poly: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push([lat / 1e5, lng / 1e5]);
  }

  return poly;
}

export function DistanceMap({
  customerLat,
  customerLng,
  yard,
  distanceMiles,
  distanceMinutes,
  durationTrafficMin,
  durationTrafficMax,
  polyline,
  routingProvider,
  requiresReview = false,
  className,
}: DistanceMapProps) {
  // Calculate bounds to fit both points
  const bounds = useMemo(() => {
    const corner1 = L.latLng(yard.latitude, yard.longitude);
    const corner2 = L.latLng(customerLat, customerLng);
    return L.latLngBounds(corner1, corner2);
  }, [yard.latitude, yard.longitude, customerLat, customerLng]);

  // Decode polyline if available, otherwise use straight line
  const routePositions: [number, number][] = useMemo(() => {
    if (polyline && polyline.length > 0) {
      return decodePolyline(polyline);
    }
    // Fallback to straight line
    return [
      [yard.latitude, yard.longitude],
      [customerLat, customerLng],
    ];
  }, [polyline, yard.latitude, yard.longitude, customerLat, customerLng]);

  const isActualRoute = polyline && polyline.length > 0;
  
  // Determine status color
  const lineColor = requiresReview ? '#f97316' : '#22c55e';
  
  // Format duration display
  const durationDisplay = durationTrafficMin && durationTrafficMax 
    ? `${durationTrafficMin}–${durationTrafficMax} min`
    : distanceMinutes 
      ? `~${distanceMinutes} min` 
      : null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Glass Card Container */}
      <div className="rounded-[20px] bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg overflow-hidden">
        
        {/* Info Chip Header */}
        <div className="px-4 py-3 border-b border-border/30 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                requiresReview ? "bg-warning/15" : "bg-success/15"
              )}>
                <Route className={cn("w-4 h-4", requiresReview ? "text-warning" : "text-success")} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {distanceMiles.toFixed(1)} mi
                  </span>
                  {durationDisplay && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">{durationDisplay}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Truck route from {yard.name}
                </p>
              </div>
            </div>
            
            {/* Provider Badge */}
            {routingProvider === 'google_routes' && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                Live route
              </span>
            )}
          </div>
        </div>

        {/* Map Container with rounded corners */}
        <div className="h-48 sm:h-52">
          <MapContainer
            bounds={bounds}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            <MapFitBounds bounds={bounds} />

            {/* Yard Marker */}
            <Marker
              position={[yard.latitude, yard.longitude]}
              icon={createYardIcon()}
            >
              <Popup>
                <div className="text-center">
                  <strong>{yard.name}</strong>
                  <br />
                  <span className="text-xs text-muted-foreground">{yard.market}</span>
                </div>
              </Popup>
            </Marker>

            {/* Customer Marker */}
            <Marker
              position={[customerLat, customerLng]}
              icon={createCustomerIcon()}
            >
              <Popup>
                <div className="text-center">
                  <strong>Your Location</strong>
                </div>
              </Popup>
            </Marker>

            {/* Route polyline (actual truck route or straight line fallback) */}
            <Polyline
              positions={routePositions}
              color={lineColor}
              weight={isActualRoute ? 4 : 3}
              opacity={isActualRoute ? 0.85 : 0.6}
              dashArray={isActualRoute ? undefined : '8, 8'}
            />
          </MapContainer>
        </div>

        {/* Legend Chips */}
        <div className="px-4 py-3 border-t border-border/30 bg-muted/20">
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-success/10 rounded-full text-xs font-medium text-success">
              <Truck className="w-3 h-3" />
              <span>Our Yard</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
              <MapPin className="w-3 h-3" />
              <span>Your Location</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Warning (outside glass card) */}
      {requiresReview && (
        <div className="px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-foreground">
              This location is outside our standard service area. 
              We'll confirm pricing by text within 15 minutes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SKELETON LOADING STATE (Apple-like)
// ============================================================

export function DistanceMapLoading() {
  return (
    <div className="space-y-3 animate-fade-in">
      {/* Glass Card Skeleton */}
      <div className="rounded-[20px] bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg overflow-hidden">
        {/* Header Skeleton */}
        <div className="px-4 py-3 border-b border-border/30 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted/70 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Map Skeleton */}
        <div className="h-48 sm:h-52 bg-muted/40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Route className="w-8 h-8 text-muted-foreground/40 animate-pulse" />
            <span className="text-xs text-muted-foreground/50">Calculating route...</span>
          </div>
        </div>
        
        {/* Legend Skeleton */}
        <div className="px-4 py-3 border-t border-border/30 bg-muted/20">
          <div className="flex items-center justify-center gap-3">
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPACT DISTANCE BADGE
// ============================================================

interface DistanceBadgeProps {
  distanceMiles: number;
  requiresReview?: boolean;
  className?: string;
}

export function DistanceBadge({ distanceMiles, requiresReview, className }: DistanceBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
      requiresReview 
        ? "bg-warning/10 text-warning border border-warning/30" 
        : "bg-success/10 text-success border border-success/30",
      className
    )}>
      <Truck className="w-3.5 h-3.5" />
      <span>{distanceMiles.toFixed(1)} mi</span>
    </div>
  );
}

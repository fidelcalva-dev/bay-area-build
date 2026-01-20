// Distance Map Component - Shows yard to customer distance visualization
// Uses Leaflet for mapping

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Truck, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Yard, DistanceResult } from '@/lib/distanceService';
import 'leaflet/dist/leaflet.css';

// ============================================================
// CUSTOM ICONS
// ============================================================

// Yard icon (green truck marker)
const createYardIcon = () => {
  return L.divIcon({
    className: 'custom-yard-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 18px;">🚛</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Customer icon (orange pin marker)
const createCustomerIcon = () => {
  return L.divIcon({
    className: 'custom-customer-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #f97316, #ea580c);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <span style="transform: rotate(45deg); font-size: 18px;">📍</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// ============================================================
// MAP UPDATER
// ============================================================

function MapFitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
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
  requiresReview?: boolean;
  className?: string;
}

export function DistanceMap({
  customerLat,
  customerLng,
  yard,
  distanceMiles,
  distanceMinutes,
  requiresReview = false,
  className,
}: DistanceMapProps) {
  // Calculate bounds to fit both points
  const bounds = useMemo(() => {
    const corner1 = L.latLng(yard.latitude, yard.longitude);
    const corner2 = L.latLng(customerLat, customerLng);
    return L.latLngBounds(corner1, corner2);
  }, [yard.latitude, yard.longitude, customerLat, customerLng]);

  // Line between yard and customer
  const linePositions: [number, number][] = [
    [yard.latitude, yard.longitude],
    [customerLat, customerLng],
  ];

  // Determine status color
  const statusColor = requiresReview ? 'orange' : 'green';
  const lineColor = requiresReview ? '#f97316' : '#22c55e';

  return (
    <div className={cn("space-y-3", className)}>
      {/* Distance Info Header */}
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        requiresReview 
          ? "bg-warning/10 border-warning/30" 
          : "bg-success/10 border-success/30"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          requiresReview ? "bg-warning/20" : "bg-success/20"
        )}>
          {requiresReview ? (
            <AlertTriangle className="w-5 h-5 text-warning" />
          ) : (
            <CheckCircle className="w-5 h-5 text-success" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {distanceMiles.toFixed(1)} miles
            </span>
            {distanceMinutes && (
              <span className="text-sm text-muted-foreground">
                (~{distanceMinutes} min drive)
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            from {yard.name}
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="rounded-xl overflow-hidden border border-border h-48 sm:h-56">
        <MapContainer
          bounds={bounds}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

          {/* Line connecting the two */}
          <Polyline
            positions={linePositions}
            color={lineColor}
            weight={3}
            opacity={0.7}
            dashArray="8, 8"
          />
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-success"></span>
          <span>Our Yard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary"></span>
          <span>Your Location</span>
        </div>
      </div>

      {/* Review Warning */}
      {requiresReview && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
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
// LOADING FALLBACK
// ============================================================

export function DistanceMapLoading() {
  return (
    <div className="space-y-3">
      <div className="h-12 bg-muted/50 rounded-lg animate-pulse" />
      <div className="h-48 sm:h-56 bg-muted/50 rounded-xl animate-pulse flex items-center justify-center">
        <MapPin className="w-8 h-8 text-muted-foreground/50 animate-bounce" />
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
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
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

/**
 * SitePlacementViewer - Read-only viewer for dispatch and driver pages
 * Shows the saved placement image and key details
 * Supports both order_site_placement and quote_site_placement sources
 */
import { useState, useEffect } from 'react';
import { MapPin, Truck, Package, ExternalLink, Loader2, Camera, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSitePlacement } from '@/hooks/useSitePlacement';
import { supabase } from '@/integrations/supabase/client';

interface SitePlacementViewerProps {
  orderId?: string;
  quoteId?: string;
  compact?: boolean;
  showOpenInMaps?: boolean;
}

const TRUCK_LABELS: Record<string, string> = {
  ROLLOFF: 'Roll-Off',
  HIGHSIDE: 'High-Side',
  END_DUMP: 'End Dump',
  TENWHEEL: 'Ten-Wheeler',
  SUPER10: 'Super 10',
};

// Extracted geometry from quote_site_placement geometry_json
interface QuotePlacementData {
  dumpsterRect?: { centerLat: number; centerLng: number; widthFt: number; lengthFt: number; rotationDeg: number };
  truckRect?: { centerLat: number; centerLng: number; widthFt: number; lengthFt: number; rotationDeg: number };
  entry?: { lat: number; lng: number; bearingDeg: number };
  notes: string | null;
  screenshotUrl: string | null;
}

export function SitePlacementViewer({ 
  orderId, 
  quoteId,
  compact = false,
  showOpenInMaps = true,
}: SitePlacementViewerProps) {
  // Use existing hook for order placements
  const orderHook = useSitePlacement({ orderId: orderId || '', autoLoad: !!orderId });
  const { placement, isLoading: orderLoading, getSignedImageUrl } = orderHook;
  
  // Quote placement fallback
  const [quotePlacement, setQuotePlacement] = useState<QuotePlacementData | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Fetch quote placement if no order placement and quoteId provided
  useEffect(() => {
    if (placement || !quoteId || orderId) return;
    setQuoteLoading(true);
    supabase
      .from('quote_site_placement')
      .select('*')
      .eq('quote_id', quoteId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const geo = data.geometry_json as any;
          setQuotePlacement({
            dumpsterRect: geo?.dumpsterRect,
            truckRect: geo?.truckRect,
            entry: geo?.entry,
            notes: data.notes,
            screenshotUrl: data.screenshot_url,
          });
        }
        setQuoteLoading(false);
      });
  }, [quoteId, orderId, placement]);

  // Load image URL
  useEffect(() => {
    if (placement?.image_storage_path) {
      getSignedImageUrl(placement.image_storage_path).then(url => {
        if (url) setImageUrl(url);
      });
    } else if (quotePlacement?.screenshotUrl) {
      supabase.storage
        .from('placements-private')
        .createSignedUrl(quotePlacement.screenshotUrl, 3600)
        .then(({ data }) => {
          if (data?.signedUrl) setImageUrl(data.signedUrl);
        });
    }
  }, [placement?.image_storage_path, quotePlacement?.screenshotUrl, getSignedImageUrl]);

  const isLoading = orderLoading || quoteLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Normalize data from either source
  const hasOrderPlacement = !!placement;
  const hasQuotePlacement = !!quotePlacement?.dumpsterRect;

  if (!hasOrderPlacement && !hasQuotePlacement) {
    return (
      <Card className={compact ? 'border-dashed' : ''}>
        <CardContent className="p-4 flex items-center justify-center text-muted-foreground">
          <AlertCircle className="w-4 h-4 mr-2" />
          No site placement saved
        </CardContent>
      </Card>
    );
  }

  // Build normalized display values
  const centerLat = hasOrderPlacement
    ? placement!.dumpster_rect_json.center.lat
    : quotePlacement!.dumpsterRect!.centerLat;
  const centerLng = hasOrderPlacement
    ? placement!.dumpster_rect_json.center.lng
    : quotePlacement!.dumpsterRect!.centerLng;
  const dumpsterWidth = hasOrderPlacement
    ? placement!.dumpster_rect_json.width_ft
    : quotePlacement!.dumpsterRect!.widthFt;
  const dumpsterLength = hasOrderPlacement
    ? placement!.dumpster_rect_json.length_ft
    : quotePlacement!.dumpsterRect!.lengthFt;
  const dumpsterRotation = hasOrderPlacement
    ? placement!.dumpster_rect_json.rotation_deg
    : quotePlacement!.dumpsterRect!.rotationDeg;
  const truckWidth = hasOrderPlacement
    ? placement!.truck_rect_json.width_ft
    : quotePlacement!.truckRect?.widthFt || 10;
  const truckLength = hasOrderPlacement
    ? placement!.truck_rect_json.length_ft
    : quotePlacement!.truckRect?.lengthFt || 35;
  const notes = hasOrderPlacement ? placement!.placement_notes : quotePlacement!.notes;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLng}`;

  if (compact) {
    return (
      <div className="space-y-2">
        {imageUrl && (
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">
            <img 
              src={imageUrl} 
              alt="Site placement" 
              className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity"
            />
          </a>
        )}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Package className="w-3 h-3 mr-1" />
              {dumpsterLength}x{dumpsterWidth}ft
            </Badge>
            {hasOrderPlacement && (
              <Badge variant="outline" className="text-xs">
                <Truck className="w-3 h-3 mr-1" />
                {TRUCK_LABELS[placement!.truck_type] || placement!.truck_type}
              </Badge>
            )}
          </div>
          {showOpenInMaps && (
            <Button variant="ghost" size="sm" asChild>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="w-3 h-3 mr-1" />
                Open
              </a>
            </Button>
          )}
        </div>
        {notes && (
          <p className="text-xs text-muted-foreground bg-muted p-2 rounded line-clamp-2">
            {notes}
          </p>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Site Placement
          {!hasOrderPlacement && (
            <Badge variant="secondary" className="text-xs">From Quote</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Dumpster and truck clearance placement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image */}
        {imageUrl && (
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block">
            <img 
              src={imageUrl} 
              alt="Site placement" 
              className="w-full rounded-lg border hover:opacity-90 transition-opacity"
            />
          </a>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Dumpster</span>
            <div className="font-medium flex items-center gap-1">
              <Package className="w-4 h-4 text-success" />
              {hasOrderPlacement ? `${placement!.dumpster_size_yd} yard` : `${dumpsterLength}x${dumpsterWidth}ft`}
            </div>
            <div className="text-xs text-muted-foreground">
              {dumpsterLength}ft x {dumpsterWidth}ft
              {dumpsterRotation > 0 && (
                <span> • {Math.round(dumpsterRotation)}° rotation</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Truck Clearance</span>
            <div className="font-medium flex items-center gap-1">
              <Truck className="w-4 h-4 text-primary" />
              {hasOrderPlacement
                ? (TRUCK_LABELS[placement!.truck_type] || placement!.truck_type)
                : 'Roll-Off'}
            </div>
            <div className="text-xs text-muted-foreground">
              {truckLength}ft x {truckWidth}ft
            </div>
          </div>
        </div>

        {/* Entry Point */}
        {quotePlacement?.entry && (
          <div className="text-sm">
            <span className="text-muted-foreground">Entry Point</span>
            <div className="text-xs text-muted-foreground font-mono">
              {quotePlacement.entry.lat.toFixed(6)}, {quotePlacement.entry.lng.toFixed(6)} • {quotePlacement.entry.bearingDeg}°
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="bg-muted p-3 rounded-lg">
            <span className="text-xs font-medium text-muted-foreground block mb-1">Notes</span>
            <p className="text-sm">{notes}</p>
          </div>
        )}

        {/* Actions */}
        {showOpenInMaps && (
          <Button variant="outline" className="w-full" asChild>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Google Maps
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

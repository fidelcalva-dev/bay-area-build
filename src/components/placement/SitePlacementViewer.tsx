/**
 * SitePlacementViewer - Read-only viewer for dispatch and driver pages
 * Shows the saved placement image and key details
 */
import { useState, useEffect } from 'react';
import { MapPin, Truck, Package, ExternalLink, Loader2, Camera, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSitePlacement } from '@/hooks/useSitePlacement';

interface SitePlacementViewerProps {
  orderId: string;
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

export function SitePlacementViewer({ 
  orderId, 
  compact = false,
  showOpenInMaps = true,
}: SitePlacementViewerProps) {
  const { placement, isLoading, getSignedImageUrl } = useSitePlacement({ orderId });
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (placement?.image_storage_path) {
      getSignedImageUrl(placement.image_storage_path).then(url => {
        if (url) setImageUrl(url);
      });
    }
  }, [placement?.image_storage_path, getSignedImageUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!placement) {
    return (
      <Card className={compact ? 'border-dashed' : ''}>
        <CardContent className="p-4 flex items-center justify-center text-muted-foreground">
          <AlertCircle className="w-4 h-4 mr-2" />
          No site placement saved
        </CardContent>
      </Card>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${placement.dumpster_rect_json.center.lat},${placement.dumpster_rect_json.center.lng}`;

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
              {placement.dumpster_size_yd}yd
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Truck className="w-3 h-3 mr-1" />
              {TRUCK_LABELS[placement.truck_type] || placement.truck_type}
            </Badge>
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
        {placement.placement_notes && (
          <p className="text-xs text-muted-foreground bg-muted p-2 rounded line-clamp-2">
            {placement.placement_notes}
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
              <Package className="w-4 h-4 text-green-600" />
              {placement.dumpster_size_yd} yard
            </div>
            <div className="text-xs text-muted-foreground">
              {placement.dumpster_rect_json.length_ft}ft x {placement.dumpster_rect_json.width_ft}ft
              {placement.dumpster_rect_json.rotation_deg > 0 && (
                <span> • {Math.round(placement.dumpster_rect_json.rotation_deg)}° rotation</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Truck Clearance</span>
            <div className="font-medium flex items-center gap-1">
              <Truck className="w-4 h-4 text-blue-600" />
              {TRUCK_LABELS[placement.truck_type] || placement.truck_type}
            </div>
            <div className="text-xs text-muted-foreground">
              {placement.truck_rect_json.length_ft}ft x {placement.truck_rect_json.width_ft}ft
            </div>
          </div>
        </div>

        {/* Notes */}
        {placement.placement_notes && (
          <div className="bg-muted p-3 rounded-lg">
            <span className="text-xs font-medium text-muted-foreground block mb-1">Notes</span>
            <p className="text-sm">{placement.placement_notes}</p>
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

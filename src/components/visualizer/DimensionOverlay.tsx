/**
 * Dimension Overlay - Shows canonical dumpster photo with dimension labels
 * Uses approved photorealistic images from the canonical registry
 */
import { cn } from '@/lib/utils';
import { DumpsterSize, DUMPSTER_SPECS } from './constants';
import { getCanonicalDumpsterImage } from '@/lib/canonicalDumpsterImages';
import { Ruler } from 'lucide-react';

interface DimensionOverlayProps {
  size: DumpsterSize;
  className?: string;
  showPickupLoads?: boolean;
}

export function DimensionOverlay({ size, className, showPickupLoads = true }: DimensionOverlayProps) {
  const spec = DUMPSTER_SPECS[size];
  const photoUrl = getCanonicalDumpsterImage(size, 'photo');
  
  return (
    <div className={cn("relative w-full", className)}>
      {/* Size badge */}
      <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold text-lg shadow-md">
        {size} YD
      </div>
      
      {/* Pickup loads badge */}
      {showPickupLoads && (
        <div className="absolute top-2 right-2 z-10 bg-muted text-foreground px-2.5 py-1 rounded-lg text-sm font-medium">
          ~{spec.pickupLoads} pickup loads
        </div>
      )}
      
      {/* Canonical photo container */}
      <div className="relative bg-muted/30 rounded-xl border border-border p-4 pt-14 overflow-hidden">
        {/* Height dimension line - left side */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-xs text-muted-foreground z-10">
          <div className="w-px h-8 bg-primary/60" />
          <span className="font-semibold text-foreground bg-background/90 px-1.5 py-0.5 rounded shadow-sm">
            {spec.heightFt}' H
          </span>
          <div className="w-px h-8 bg-primary/60" />
        </div>
        
        {/* Canonical dumpster photo */}
        <div className="relative mx-8">
          <img 
            src={photoUrl} 
            alt={`${size}-yard dumpster`}
            className="w-full h-auto object-contain rounded-lg"
            loading="lazy"
          />
          
          {/* Width indicator - top */}
          <div className="absolute -top-1 left-1/4 right-1/4 flex items-center justify-center z-10">
            <div className="h-px flex-1 bg-primary/60" />
            <span className="px-2 text-xs font-semibold text-foreground bg-background/90 rounded shadow-sm">
              {spec.widthFt}' W
            </span>
            <div className="h-px flex-1 bg-primary/60" />
          </div>
        </div>
        
        {/* Length dimension line - bottom */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-primary/60" />
          <span className="font-semibold text-foreground bg-background/90 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
            <Ruler className="w-3 h-3" />
            {spec.lengthFt}' L
          </span>
          <div className="h-px flex-1 bg-primary/60" />
        </div>
      </div>
      
      {/* Dimensions summary bar */}
      <div className="mt-3 flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{spec.widthFt}'</span> W
        </span>
        <span className="text-border">×</span>
        <span>
          <span className="font-semibold text-foreground">{spec.lengthFt}'</span> L
        </span>
        <span className="text-border">×</span>
        <span>
          <span className="font-semibold text-foreground">{spec.heightFt}'</span> H
        </span>
      </div>
      
      <p className="text-center text-xs text-muted-foreground mt-2">
        Approx. {spec.volumeCuYd} cubic yards capacity
      </p>
    </div>
  );
}

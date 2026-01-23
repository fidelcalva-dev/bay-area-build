/**
 * Scale Comparison - Shows canonical dumpster photo next to reference objects
 * Person (6ft), Pickup truck (6ft bed), Garage door (7ft)
 * Uses approved photorealistic images from the canonical registry
 */
import { cn } from '@/lib/utils';
import { DumpsterSize, DUMPSTER_SPECS } from './constants';
import { getCanonicalDumpsterImage } from '@/lib/canonicalDumpsterImages';
import { User, Truck, Home } from 'lucide-react';

interface ScaleComparisonSVGProps {
  size: DumpsterSize;
  compareWith: 'person' | 'pickup' | 'garage';
  className?: string;
}

// Reference heights for visual comparison
const REFERENCE_DATA = {
  person: { height: 6, label: "6' person", icon: User },
  pickup: { height: 5.5, label: "Pickup truck", icon: Truck },
  garage: { height: 7, label: "7' garage door", icon: Home },
};

export function ScaleComparisonSVG({ size, compareWith, className }: ScaleComparisonSVGProps) {
  const spec = DUMPSTER_SPECS[size];
  const photoUrl = getCanonicalDumpsterImage(size, 'photo');
  const ref = REFERENCE_DATA[compareWith];
  const RefIcon = ref.icon;
  
  // Calculate relative heights (dumpster height as percentage of reference)
  const dumpsterHeightRatio = spec.heightFt / ref.height;
  const referenceHeightPx = 120; // Base height for reference object
  const dumpsterHeightPx = referenceHeightPx * dumpsterHeightRatio;
  
  return (
    <div className={cn("flex items-end justify-center gap-6 py-4", className)}>
      {/* Dumpster with canonical photo */}
      <div className="flex flex-col items-center">
        <div 
          className="relative flex items-end justify-center"
          style={{ height: Math.max(dumpsterHeightPx, referenceHeightPx) + 20 }}
        >
          <img 
            src={photoUrl}
            alt={`${size}-yard dumpster`}
            className="object-contain rounded-lg shadow-md"
            style={{ 
              height: dumpsterHeightPx,
              maxWidth: '200px',
            }}
            loading="lazy"
          />
        </div>
        <div className="mt-2 text-center">
          <span className="font-bold text-foreground text-lg">{size} YD</span>
          <p className="text-xs text-muted-foreground">{spec.heightFt}' tall</p>
        </div>
      </div>
      
      {/* Visual divider */}
      <div className="h-32 w-px bg-border self-center" />
      
      {/* Reference object */}
      <div className="flex flex-col items-center">
        <div 
          className="relative flex items-end justify-center"
          style={{ height: Math.max(dumpsterHeightPx, referenceHeightPx) + 20 }}
        >
          {compareWith === 'person' && (
            <svg 
              viewBox="0 0 40 120" 
              style={{ height: referenceHeightPx }}
              className="fill-muted-foreground"
            >
              {/* Head */}
              <circle cx="20" cy="12" r="10" />
              {/* Body */}
              <rect x="10" y="24" width="20" height="45" rx="4" />
              {/* Left leg */}
              <rect x="10" y="72" width="8" height="48" rx="3" />
              {/* Right leg */}
              <rect x="22" y="72" width="8" height="48" rx="3" />
            </svg>
          )}
          
          {compareWith === 'pickup' && (
            <svg 
              viewBox="0 0 180 90" 
              style={{ height: referenceHeightPx * 0.75 }}
              className="fill-muted-foreground"
            >
              {/* Cab */}
              <path d="M0,50 L25,50 L35,20 L80,20 L90,50 L180,50 L180,80 L0,80 Z" />
              {/* Wheels */}
              <circle cx="35" cy="78" r="14" className="fill-foreground" />
              <circle cx="145" cy="78" r="14" className="fill-foreground" />
              {/* Bed outline */}
              <rect x="95" y="30" width="75" height="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" className="stroke-background" />
            </svg>
          )}
          
          {compareWith === 'garage' && (
            <svg 
              viewBox="0 0 100 140" 
              style={{ height: referenceHeightPx * 1.1 }}
              className="stroke-muted-foreground"
              fill="none"
              strokeWidth="3"
            >
              {/* Door frame */}
              <rect x="5" y="5" width="90" height="130" rx="2" />
              {/* Panels */}
              <line x1="5" y1="38" x2="95" y2="38" />
              <line x1="5" y1="71" x2="95" y2="71" />
              <line x1="5" y1="104" x2="95" y2="104" />
            </svg>
          )}
        </div>
        <div className="mt-2 text-center">
          <span className="font-medium text-foreground flex items-center gap-1.5 justify-center">
            <RefIcon className="w-4 h-4" />
            {ref.label}
          </span>
          <p className="text-xs text-muted-foreground">{ref.height}' tall</p>
        </div>
      </div>
    </div>
  );
}

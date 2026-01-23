import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Weight, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Canonical dumpster specifications
export const DUMPSTER_SPECS = {
  10: {
    length: '12 ft',
    width: '7.5 ft',
    height: '3 ft',
    loads: '3–4',
    tons: 2,
    description: 'Ideal for small cleanouts',
    popular: false,
  },
  20: {
    length: '18 ft',
    width: '7.5 ft',
    height: '4 ft',
    loads: '6–8',
    tons: 2,
    description: 'Ideal for home renovations',
    popular: true,
  },
  30: {
    length: '18 ft',
    width: '7.5 ft',
    height: '6 ft',
    loads: '9–12',
    tons: 3,
    description: 'Ideal for major projects',
    popular: false,
  },
  40: {
    length: '22 ft',
    width: '7.5 ft',
    height: '8 ft',
    loads: '12–16',
    tons: 4,
    description: 'Ideal for commercial jobs',
    popular: false,
  },
} as const;

type DumpsterSize = keyof typeof DUMPSTER_SPECS;

interface TechnicalDumpsterCardProps {
  size: DumpsterSize;
  ctaLink?: string;
  ctaLabel?: string;
  className?: string;
}

/**
 * Professional Roll-Off Dumpster Silhouette SVG
 * Detailed side-view with structural elements and measurement arrows
 */
function DumpsterSilhouette({ 
  size, 
  className,
}: { 
  size: DumpsterSize; 
  className?: string;
}) {
  const spec = DUMPSTER_SPECS[size];
  
  // Calculate proportional scale based on real specs
  // Using 22ft (40yd) as max length reference, 8ft as max height
  const maxLengthFt = 22;
  const maxHeightFt = 8;
  
  const lengthFt = parseFloat(spec.length);
  const heightFt = parseFloat(spec.height);
  
  // Scale factors for proportional sizing
  const lengthScale = lengthFt / maxLengthFt;
  const heightScale = heightFt / maxHeightFt;
  
  // SVG viewBox dimensions
  const svgWidth = 280;
  const svgHeight = 100;
  
  // Dumpster positioning
  const dumpsterWidth = 220 * lengthScale;
  const dumpsterHeight = 55 * heightScale;
  const startX = (svgWidth - dumpsterWidth) / 2 - 10;
  const groundY = 70;
  const topY = groundY - dumpsterHeight;

  return (
    <div className={cn("relative w-full flex items-center justify-center py-3", className)}>
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full max-w-[220px] h-auto transition-transform duration-300 group-hover:scale-105 text-primary"
        role="img"
        aria-label={`${size} yard roll-off dumpster: ${spec.length} long, ${spec.width} wide, ${spec.height} tall`}
      >
        <defs>
          <filter id={`shadow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15"/>
          </filter>
        </defs>

        <g filter={`url(#shadow-${size})`}>
          {/* Main body fill (slightly trapezoid for perspective) */}
          <path 
            d={`M${startX + 8},${topY} H${startX + dumpsterWidth - 8} L${startX + dumpsterWidth},${topY + 8} V${groundY - 8} L${startX + dumpsterWidth - 4},${groundY} H${startX + 12} L${startX + 8},${groundY - 6} Z`}
            className="fill-primary/15"
          />
          
          {/* Body outline */}
          <path 
            d={`M${startX + 8},${topY} H${startX + dumpsterWidth - 8} L${startX + dumpsterWidth},${topY + 8} V${groundY - 8} L${startX + dumpsterWidth - 4},${groundY} H${startX + 12} L${startX + 8},${groundY - 6} Z`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Top rail (reinforced) */}
          <path 
            d={`M${startX + 8},${topY} H${startX + dumpsterWidth - 8} L${startX + dumpsterWidth},${topY + 8} L${startX + dumpsterWidth - 4},${topY + 12} H${startX + 14} L${startX + 8},${topY + 10} Z`}
            className="fill-primary/25"
          />
          
          {/* Bottom skid rails */}
          <line 
            x1={startX + 18} y1={groundY + 4} 
            x2={startX + dumpsterWidth - 16} y2={groundY + 4}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          />
          <line 
            x1={startX + 24} y1={groundY + 9} 
            x2={startX + dumpsterWidth - 22} y2={groundY + 9}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          />
          
          {/* Front doghouse / hook-up */}
          <path 
            d={`M${startX + 14},${groundY - dumpsterHeight * 0.35} H${startX + 32} C${startX + 42},${groundY - dumpsterHeight * 0.35} ${startX + 46},${groundY - dumpsterHeight * 0.45} ${startX + 48},${groundY - dumpsterHeight * 0.55}`}
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"
          />
          <line 
            x1={startX + 48} y1={groundY - dumpsterHeight * 0.55} 
            x2={startX + 48} y2={groundY - dumpsterHeight * 0.75}
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"
          />
          
          {/* Rear door frame */}
          <line 
            x1={startX + dumpsterWidth - 14} y1={topY + 10} 
            x2={startX + dumpsterWidth - 14} y2={groundY - 4}
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"
          />
          <line 
            x1={startX + dumpsterWidth - 6} y1={topY + 14} 
            x2={startX + dumpsterWidth - 6} y2={groundY - 6}
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"
          />
          
          {/* Vertical ribs (panels) - proportional count */}
          {Array.from({ length: Math.max(4, Math.floor(lengthScale * 10)) }).map((_, i) => {
            const ribX = startX + 26 + i * ((dumpsterWidth - 52) / Math.max(3, Math.floor(lengthScale * 10) - 1));
            return (
              <line
                key={i}
                x1={ribX} y1={topY + 10}
                x2={ribX} y2={groundY - 4}
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.5"
              />
            );
          })}
          
          {/* Horizontal panel seams */}
          {heightScale > 0.4 && (
            <g opacity="0.4">
              <line 
                x1={startX + 18} y1={topY + dumpsterHeight * 0.33} 
                x2={startX + dumpsterWidth - 10} y2={topY + dumpsterHeight * 0.33}
                stroke="currentColor" strokeWidth="1" strokeLinecap="round"
              />
              {heightScale > 0.6 && (
                <line 
                  x1={startX + 16} y1={topY + dumpsterHeight * 0.55} 
                  x2={startX + dumpsterWidth - 8} y2={topY + dumpsterHeight * 0.55}
                  stroke="currentColor" strokeWidth="1" strokeLinecap="round"
                />
              )}
              {heightScale > 0.8 && (
                <line 
                  x1={startX + 14} y1={topY + dumpsterHeight * 0.75} 
                  x2={startX + dumpsterWidth - 6} y2={topY + dumpsterHeight * 0.75}
                  stroke="currentColor" strokeWidth="1" strokeLinecap="round"
                />
              )}
            </g>
          )}
          
          {/* Ladder hint near rear (only on larger sizes) */}
          {heightScale >= 0.5 && (
            <g opacity="0.6">
              {Array.from({ length: Math.min(4, Math.ceil(heightScale * 4)) }).map((_, i) => (
                <line
                  key={i}
                  x1={startX + dumpsterWidth + 2}
                  y1={topY + 12 + i * (dumpsterHeight * 0.22)}
                  x2={startX + dumpsterWidth + 8}
                  y2={topY + 12 + i * (dumpsterHeight * 0.22)}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              ))}
            </g>
          )}
        </g>
        
        {/* Measurement Arrows */}
        <g className="text-muted-foreground opacity-50 group-hover:opacity-90 transition-opacity duration-300">
          {/* Length arrow (bottom) */}
          <line
            x1={startX + 8} y1={groundY + 20}
            x2={startX + dumpsterWidth} y2={groundY + 20}
            stroke="currentColor" strokeWidth="1"
          />
          <polygon 
            points={`${startX + 8},${groundY + 20} ${startX + 14},${groundY + 17} ${startX + 14},${groundY + 23}`}
            fill="currentColor"
          />
          <polygon 
            points={`${startX + dumpsterWidth},${groundY + 20} ${startX + dumpsterWidth - 6},${groundY + 17} ${startX + dumpsterWidth - 6},${groundY + 23}`}
            fill="currentColor"
          />
          <text
            x={startX + dumpsterWidth / 2}
            y={groundY + 32}
            textAnchor="middle"
            className="fill-current text-[9px] font-medium"
          >
            {spec.length}
          </text>
          
          {/* Height arrow (right side) */}
          <line
            x1={startX + dumpsterWidth + 18} y1={topY}
            x2={startX + dumpsterWidth + 18} y2={groundY}
            stroke="currentColor" strokeWidth="1"
          />
          <polygon 
            points={`${startX + dumpsterWidth + 18},${topY} ${startX + dumpsterWidth + 15},${topY + 6} ${startX + dumpsterWidth + 21},${topY + 6}`}
            fill="currentColor"
          />
          <polygon 
            points={`${startX + dumpsterWidth + 18},${groundY} ${startX + dumpsterWidth + 15},${groundY - 6} ${startX + dumpsterWidth + 21},${groundY - 6}`}
            fill="currentColor"
          />
          <text
            x={startX + dumpsterWidth + 30}
            y={(topY + groundY) / 2 + 3}
            textAnchor="start"
            className="fill-current text-[9px] font-medium"
          >
            {spec.height}
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Technical Dumpster Card - Professional, trust-focused design
 * Uses SVG silhouettes with measurement arrows
 */
export function TechnicalDumpsterCard({
  size,
  ctaLink = '/#quote',
  ctaLabel = 'Get Quote',
  className,
}: TechnicalDumpsterCardProps) {
  const spec = DUMPSTER_SPECS[size];
  
  return (
    <div
      className={cn(
        'group relative bg-card rounded-2xl border overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:border-primary/40',
        spec.popular 
          ? 'border-primary ring-1 ring-primary/20' 
          : 'border-border',
        className
      )}
    >
      {/* Popular badge */}
      {spec.popular && (
        <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
          Most Popular
        </div>
      )}
      
      {/* Size label */}
      <div className="pt-4 px-5">
        <h3 className="text-2xl font-bold text-foreground">
          {size} <span className="text-lg font-medium text-muted-foreground">Yard</span>
        </h3>
      </div>
      
      {/* SVG Silhouette with measurements */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <DumpsterSilhouette size={size} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="text-sm">Pickup load ≈ full-size truck bed</p>
        </TooltipContent>
      </Tooltip>
      
      {/* Info Pills */}
      <div className="px-5 pb-2">
        <div className="flex flex-wrap gap-2">
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary"
            aria-label={`${spec.tons} tons included in rental`}
          >
            <Weight className="w-3.5 h-3.5" aria-hidden="true" />
            {spec.tons} Tons Included
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-sm font-medium text-muted-foreground cursor-help"
                aria-label={`Approximately ${spec.loads} pickup truck loads`}
              >
                <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                ≈ {spec.loads} pickup loads
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Based on full-size truck bed capacity</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      {/* Usage line + CTA */}
      <div className="px-5 pb-5 pt-3 space-y-3">
        <p className="text-sm text-muted-foreground">{spec.description}</p>
        
        <Button
          asChild
          variant={spec.popular ? 'cta' : 'default'}
          size="default"
          className="w-full"
        >
          <Link to={ctaLink}>
            {ctaLabel}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Grid of all technical dumpster cards
 */
export function TechnicalDumpsterGrid({
  sizes = [10, 20, 30, 40],
  ctaLink = '/#quote',
  className,
}: {
  sizes?: DumpsterSize[];
  ctaLink?: string;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6', className)}>
      {sizes.map((size) => (
        <TechnicalDumpsterCard
          key={size}
          size={size}
          ctaLink={ctaLink}
        />
      ))}
    </div>
  );
}

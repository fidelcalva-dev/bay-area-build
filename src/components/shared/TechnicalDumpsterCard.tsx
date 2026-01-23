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
 * Realistic Roll-Off Dumpster Silhouette SVG
 * White steel body + green top rail + vertical ribs + skids
 * Matches real Calsan roll-off dumpsters
 */
function DumpsterSilhouetteReal({ 
  size, 
  className,
}: { 
  size: DumpsterSize; 
  className?: string;
}) {
  const spec = DUMPSTER_SPECS[size];
  
  // Proportional scaling based on real dimensions
  const maxLengthFt = 22;
  const maxHeightFt = 8;
  
  const lengthFt = parseFloat(spec.length);
  const heightFt = parseFloat(spec.height);
  
  const lengthScale = lengthFt / maxLengthFt;
  const heightScale = heightFt / maxHeightFt;
  
  // SVG dimensions
  const svgWidth = 320;
  const svgHeight = 100;
  
  // Dumpster body dimensions (scaled)
  const bodyWidth = 220 * lengthScale;
  const bodyHeight = 55 * heightScale;
  const startX = (svgWidth - bodyWidth) / 2 - 10;
  const groundY = 70;
  const topY = groundY - bodyHeight;
  
  // Number of ribs based on length
  const ribCount = Math.max(5, Math.floor(lengthScale * 12));
  
  // Trapezoid offsets for perspective
  const topInset = 8;
  const bottomInset = 4;
  const sideSlope = 12 * heightScale;

  return (
    <div className={cn("relative w-full flex items-center justify-center py-3", className)}>
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full max-w-[220px] h-auto transition-transform duration-300 group-hover:scale-105"
        role="img"
        aria-label={`${size} yard roll-off dumpster: ${spec.length} long, ${spec.width} wide, ${spec.height} tall`}
      >
        <defs>
          <filter id={`shadow-${size}`} x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15"/>
          </filter>
        </defs>

        <g filter={`url(#shadow-${size})`}>
          {/* Body - trapezoid shape */}
          <path 
            d={`M${startX + topInset},${topY} 
                H${startX + bodyWidth - topInset} 
                L${startX + bodyWidth + sideSlope},${topY + sideSlope} 
                V${groundY - sideSlope} 
                L${startX + bodyWidth - bottomInset},${groundY} 
                H${startX + bottomInset} 
                L${startX - sideSlope + bottomInset},${groundY - sideSlope} 
                V${topY + sideSlope} 
                Z`}
            fill="#EDEDED"
            stroke="#2B2B2B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Skid rails */}
          <line 
            x1={startX + 12} y1={groundY + 5}
            x2={startX + bodyWidth - 12} y2={groundY + 5}
            stroke="#2B2B2B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line 
            x1={startX + 18} y1={groundY + 10}
            x2={startX + bodyWidth - 18} y2={groundY + 10}
            stroke="#2B2B2B"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Rear door hints */}
          <line 
            x1={startX + bodyWidth - 14} y1={topY + sideSlope + 4}
            x2={startX + bodyWidth - 14} y2={groundY - sideSlope - 4}
            stroke="#2B2B2B"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <line 
            x1={startX + bodyWidth + sideSlope - 6} y1={topY + sideSlope + 8}
            x2={startX + bodyWidth + sideSlope - 6} y2={groundY - sideSlope - 2}
            stroke="#2B2B2B"
            strokeWidth="1"
            opacity="0.5"
          />
          
          {/* Vertical ribs */}
          {Array.from({ length: ribCount }).map((_, i) => {
            const ribX = startX + 20 + i * ((bodyWidth - 40) / (ribCount - 1));
            return (
              <line
                key={i}
                x1={ribX} y1={topY + sideSlope + 3}
                x2={ribX} y2={groundY - sideSlope - 2}
                stroke="#2B2B2B"
                strokeWidth="1"
                opacity="0.6"
              />
            );
          })}
        </g>
        
        {/* Measurement arrows */}
        <g className="text-muted-foreground opacity-40 group-hover:opacity-80 transition-opacity duration-300">
          {/* Length arrow */}
          <line
            x1={startX - sideSlope} y1={groundY + 18}
            x2={startX + bodyWidth + sideSlope} y2={groundY + 18}
            stroke="currentColor" strokeWidth="1"
          />
          <polygon 
            points={`${startX - sideSlope},${groundY + 18} ${startX - sideSlope + 5},${groundY + 15} ${startX - sideSlope + 5},${groundY + 21}`}
            fill="currentColor"
          />
          <polygon 
            points={`${startX + bodyWidth + sideSlope},${groundY + 18} ${startX + bodyWidth + sideSlope - 5},${groundY + 15} ${startX + bodyWidth + sideSlope - 5},${groundY + 21}`}
            fill="currentColor"
          />
          <text
            x={startX + bodyWidth / 2}
            y={groundY + 28}
            textAnchor="middle"
            className="fill-current text-[8px] font-medium"
          >
            {spec.length}
          </text>
          
          {/* Height arrow */}
          <line
            x1={startX + bodyWidth + sideSlope + 14} y1={topY}
            x2={startX + bodyWidth + sideSlope + 14} y2={groundY}
            stroke="currentColor" strokeWidth="1"
          />
          <polygon 
            points={`${startX + bodyWidth + sideSlope + 14},${topY} ${startX + bodyWidth + sideSlope + 11},${topY + 5} ${startX + bodyWidth + sideSlope + 17},${topY + 5}`}
            fill="currentColor"
          />
          <polygon 
            points={`${startX + bodyWidth + sideSlope + 14},${groundY} ${startX + bodyWidth + sideSlope + 11},${groundY - 5} ${startX + bodyWidth + sideSlope + 17},${groundY - 5}`}
            fill="currentColor"
          />
          <text
            x={startX + bodyWidth + sideSlope + 26}
            y={(topY + groundY) / 2 + 3}
            textAnchor="start"
            className="fill-current text-[8px] font-medium"
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
            <DumpsterSilhouetteReal size={size} />
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

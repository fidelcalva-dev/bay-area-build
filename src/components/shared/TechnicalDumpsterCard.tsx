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
 * Technical Dumpster Silhouette SVG
 * Side-view with measurement arrows - proportionally accurate
 */
function DumpsterSilhouette({ 
  size, 
  className,
}: { 
  size: DumpsterSize; 
  className?: string;
}) {
  const spec = DUMPSTER_SPECS[size];
  
  // Base dimensions for SVG viewport
  const svgWidth = 180;
  const svgHeight = 100;
  
  // Calculate proportional dimensions based on real specs
  // Using 22ft (40yd) as max length reference, 8ft as max height
  const maxLengthFt = 22;
  const maxHeightFt = 8;
  
  const lengthFt = parseFloat(spec.length);
  const heightFt = parseFloat(spec.height);
  
  // Container dimensions within SVG
  const containerMaxWidth = 130;
  const containerMaxHeight = 50;
  
  const containerWidth = (lengthFt / maxLengthFt) * containerMaxWidth;
  const containerHeight = (heightFt / maxHeightFt) * containerMaxHeight;
  
  // Positioning
  const containerX = (svgWidth - containerWidth) / 2;
  const containerY = 55 - containerHeight;
  const groundY = 55;

  return (
    <div className={cn("relative w-full flex items-center justify-center py-4", className)}>
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full max-w-[180px] h-auto transition-transform duration-300 group-hover:scale-105"
        role="img"
        aria-label={`${size} yard roll-off dumpster: ${spec.length} long, ${spec.width} wide, ${spec.height} tall`}
      >
        {/* Shadow under dumpster */}
        <ellipse
          cx={containerX + containerWidth / 2}
          cy={groundY + 5}
          rx={containerWidth / 2 + 5}
          ry="4"
          className="fill-muted-foreground/10"
        />
        
        {/* Dumpster Body */}
        <g>
          {/* Main container body - slight trapezoid shape */}
          <path
            d={`
              M ${containerX + 3} ${groundY}
              L ${containerX} ${containerY}
              L ${containerX + containerWidth} ${containerY}
              L ${containerX + containerWidth - 3} ${groundY}
              Z
            `}
            className="fill-primary/90 group-hover:fill-primary transition-colors duration-300"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
          />
          
          {/* Vertical ribs */}
          {Array.from({ length: Math.max(3, Math.floor(containerWidth / 20)) }).map((_, i) => (
            <line
              key={i}
              x1={containerX + 10 + i * (containerWidth - 20) / Math.max(2, Math.floor(containerWidth / 20) - 1)}
              y1={containerY + 2}
              x2={containerX + 10 + i * (containerWidth - 20) / Math.max(2, Math.floor(containerWidth / 20) - 1)}
              y2={groundY - 2}
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="1"
              opacity="0.2"
            />
          ))}
          
          {/* Top rail - bright green accent */}
          <rect
            x={containerX - 2}
            y={containerY - 4}
            width={containerWidth + 4}
            height="5"
            rx="1.5"
            className="fill-primary"
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
          />
          
          {/* Front hook (Dog House style) */}
          <path
            d={`M ${containerX - 4} ${containerY + 10} 
                L ${containerX - 4} ${containerY - 4} 
                L ${containerX + 8} ${containerY - 4}`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Rear door hinge indicators */}
          <line
            x1={containerX + containerWidth - 2}
            y1={containerY + 5}
            x2={containerX + containerWidth - 2}
            y2={groundY - 5}
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="1"
            opacity="0.3"
          />
          
          {/* Rollers/skids */}
          <rect
            x={containerX + containerWidth - 25}
            y={groundY}
            width="20"
            height="4"
            rx="2"
            className="fill-muted-foreground"
          />
          <rect
            x={containerX + containerWidth - 50}
            y={groundY}
            width="20"
            height="4"
            rx="2"
            className="fill-muted-foreground"
          />
        </g>
        
        {/* Measurement Arrows */}
        <g className="text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          {/* Length arrow (bottom) */}
          <line
            x1={containerX}
            y1={groundY + 18}
            x2={containerX + containerWidth}
            y2={groundY + 18}
            stroke="currentColor"
            strokeWidth="1"
          />
          {/* Arrow heads */}
          <polygon 
            points={`${containerX},${groundY + 18} ${containerX + 5},${groundY + 15} ${containerX + 5},${groundY + 21}`}
            fill="currentColor"
          />
          <polygon 
            points={`${containerX + containerWidth},${groundY + 18} ${containerX + containerWidth - 5},${groundY + 15} ${containerX + containerWidth - 5},${groundY + 21}`}
            fill="currentColor"
          />
          <text
            x={containerX + containerWidth / 2}
            y={groundY + 30}
            textAnchor="middle"
            className="fill-current text-[10px] font-medium"
          >
            {spec.length}
          </text>
          
          {/* Height arrow (right side) */}
          <line
            x1={containerX + containerWidth + 15}
            y1={containerY}
            x2={containerX + containerWidth + 15}
            y2={groundY}
            stroke="currentColor"
            strokeWidth="1"
          />
          {/* Arrow heads */}
          <polygon 
            points={`${containerX + containerWidth + 15},${containerY} ${containerX + containerWidth + 12},${containerY + 5} ${containerX + containerWidth + 18},${containerY + 5}`}
            fill="currentColor"
          />
          <polygon 
            points={`${containerX + containerWidth + 15},${groundY} ${containerX + containerWidth + 12},${groundY - 5} ${containerX + containerWidth + 18},${groundY - 5}`}
            fill="currentColor"
          />
          <text
            x={containerX + containerWidth + 25}
            y={(containerY + groundY) / 2 + 3}
            textAnchor="start"
            className="fill-current text-[10px] font-medium"
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

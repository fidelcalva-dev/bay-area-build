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

// CSS-based scaling for each size (20yd = baseline)
const SCALE_CLASSES: Record<DumpsterSize, string> = {
  10: 'scale-x-[0.72] scale-y-[0.70]',
  20: 'scale-x-100 scale-y-100',
  30: 'scale-x-[1.08] scale-y-[1.12]',
  40: 'scale-x-[1.18] scale-y-[1.25]',
};

/**
 * Clean roll-off dumpster silhouette SVG
 * Uses CSS transforms for size scaling
 */
function DumpsterSilhouetteReal({ 
  size, 
  className,
}: { 
  size: DumpsterSize; 
  className?: string;
}) {
  const spec = DUMPSTER_SPECS[size];

  return (
    <div className={cn("relative w-full flex items-center justify-center py-4 pb-6", className)}>
      <svg 
        viewBox="0 0 900 260"
        className={cn(
          "w-full max-w-[180px] h-auto transition-transform duration-300 origin-center group-hover:scale-105",
          SCALE_CLASSES[size]
        )}
        role="img"
        aria-label={`${size} yard roll-off dumpster: ${spec.length} long, ${spec.width} wide, ${spec.height} tall`}
      >
        <defs>
          <filter id={`shadow-${size}`} x="-5%" y="-5%" width="110%" height="115%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.12"/>
          </filter>
        </defs>

        <g transform="translate(40,30)" filter={`url(#shadow-${size})`}>
          {/* Body */}
          <path 
            d="M40,40 H700 L735,68 V178 L700,205 H60 L40,182 Z"
            fill="#EDEDED"
          />
          <path 
            d="M40,40 H700 L735,68 V178 L700,205 H60 L40,182 Z"
            fill="none"
            stroke="#2B2B2B"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Skids */}
          <path d="M80,212 H660" fill="none" stroke="#2B2B2B" strokeWidth="6" />
          <path d="M95,224 H645" fill="none" stroke="#2B2B2B" strokeWidth="6" />

          {/* Rear door hints */}
          <path d="M690,60 V190" fill="none" stroke="#2B2B2B" strokeWidth="2.5" opacity="0.7" />
          <path d="M712,78 V182" fill="none" stroke="#2B2B2B" strokeWidth="2.5" opacity="0.7" />

          {/* Ribs */}
          <g fill="none" stroke="#2B2B2B" strokeWidth="2.5" opacity="0.7">
            <path d="M100,55 V190"/>
            <path d="M150,55 V190"/>
            <path d="M200,55 V190"/>
            <path d="M250,55 V190"/>
            <path d="M300,55 V190"/>
            <path d="M350,55 V190"/>
            <path d="M400,55 V190"/>
            <path d="M450,55 V190"/>
            <path d="M500,55 V190"/>
            <path d="M550,55 V190"/>
            <path d="M600,55 V190"/>
            <path d="M650,55 V190"/>
          </g>
        </g>
      </svg>
      
      {/* Dimension labels below SVG */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-3 text-[10px] text-muted-foreground opacity-50 group-hover:opacity-90 transition-opacity">
        <span>{spec.length} L</span>
        <span className="opacity-40">×</span>
        <span>{spec.height} H</span>
      </div>
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

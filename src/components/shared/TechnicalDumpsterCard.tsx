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
  
  // Real proportional scaling
  // Using 22ft (40yd) as max length reference, 8ft as max height
  const maxLengthFt = 22;
  const maxHeightFt = 8;
  
  const lengthFt = parseFloat(spec.length);
  const heightFt = parseFloat(spec.height);
  
  // Scale factors for proportional sizing
  const lengthScale = lengthFt / maxLengthFt;
  const heightScale = heightFt / maxHeightFt;
  
  // SVG viewBox dimensions
  const svgWidth = 300;
  const svgHeight = 110;
  
  // Dumpster positioning
  const dumpsterWidth = 230 * lengthScale;
  const dumpsterHeight = 60 * heightScale;
  const startX = (svgWidth - dumpsterWidth) / 2 - 15;
  const groundY = 75;
  const topY = groundY - dumpsterHeight;
  
  // Calculate number of ribs based on size
  const ribCount = Math.max(6, Math.floor(lengthScale * 14));

  // Colors
  const bodyFill = '#F5F5F5';
  const bodyStroke = '#3A3A3A';
  const railFill = 'hsl(var(--primary))';
  const wearColor = '#8B7355';

  return (
    <div className={cn("relative w-full flex items-center justify-center py-4", className)}>
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full max-w-[240px] h-auto transition-transform duration-300 group-hover:scale-105"
        role="img"
        aria-label={`${size} yard roll-off dumpster: ${spec.length} long, ${spec.width} wide, ${spec.height} tall`}
      >
        <defs>
          {/* Drop shadow */}
          <filter id={`shadow-real-${size}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.18"/>
          </filter>
          
          {/* Body gradient for subtle realism */}
          <linearGradient id={`bodyGrad-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FAFAFA"/>
            <stop offset="50%" stopColor="#F0F0F0"/>
            <stop offset="100%" stopColor="#E8E8E8"/>
          </linearGradient>
          
          {/* Green rail gradient */}
          <linearGradient id={`railGrad-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(158, 64%, 28%)"/>
            <stop offset="50%" stopColor="hsl(158, 64%, 22%)"/>
            <stop offset="100%" stopColor="hsl(158, 64%, 18%)"/>
          </linearGradient>
        </defs>

        <g filter={`url(#shadow-real-${size})`}>
          {/* Main body (trapezoid for perspective) */}
          <path 
            d={`M${startX + 10},${topY + 12} 
                H${startX + dumpsterWidth - 10} 
                L${startX + dumpsterWidth + 2},${topY + 18} 
                V${groundY - 6} 
                L${startX + dumpsterWidth - 2},${groundY} 
                H${startX + 14} 
                L${startX + 10},${groundY - 4} 
                Z`}
            fill={`url(#bodyGrad-${size})`}
            stroke={bodyStroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Top reinforced rail (GREEN) */}
          <path 
            d={`M${startX + 10},${topY + 12} 
                H${startX + dumpsterWidth - 10} 
                L${startX + dumpsterWidth + 2},${topY + 18} 
                L${startX + dumpsterWidth - 4},${topY + 26} 
                H${startX + 16} 
                L${startX + 10},${topY + 22} 
                Z`}
            fill={`url(#railGrad-${size})`}
            stroke={bodyStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Rail highlight line */}
          <line 
            x1={startX + 16} y1={topY + 15}
            x2={startX + dumpsterWidth - 14} y2={topY + 15}
            stroke="hsl(158, 64%, 32%)"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />
          
          {/* Vertical ribs (panel seams) */}
          {Array.from({ length: ribCount }).map((_, i) => {
            const ribX = startX + 24 + i * ((dumpsterWidth - 48) / (ribCount - 1));
            return (
              <line
                key={i}
                x1={ribX} y1={topY + 26}
                x2={ribX} y2={groundY - 3}
                stroke={bodyStroke}
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.55"
              />
            );
          })}
          
          {/* Horizontal panel seams */}
          {heightScale > 0.4 && (
            <g opacity="0.35">
              <line 
                x1={startX + 20} y1={topY + dumpsterHeight * 0.4 + 12} 
                x2={startX + dumpsterWidth - 8} y2={topY + dumpsterHeight * 0.4 + 12}
                stroke={bodyStroke} strokeWidth="1" strokeLinecap="round"
              />
              {heightScale > 0.65 && (
                <line 
                  x1={startX + 18} y1={topY + dumpsterHeight * 0.65 + 12} 
                  x2={startX + dumpsterWidth - 6} y2={topY + dumpsterHeight * 0.65 + 12}
                  stroke={bodyStroke} strokeWidth="1" strokeLinecap="round"
                />
              )}
            </g>
          )}
          
          {/* Front doghouse / hook-up */}
          <path 
            d={`M${startX + 16},${groundY - dumpsterHeight * 0.3} 
                H${startX + 36} 
                C${startX + 48},${groundY - dumpsterHeight * 0.3} ${startX + 52},${groundY - dumpsterHeight * 0.42} ${startX + 54},${groundY - dumpsterHeight * 0.55}`}
            fill="none" 
            stroke={bodyStroke} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <line 
            x1={startX + 54} y1={groundY - dumpsterHeight * 0.55} 
            x2={startX + 54} y2={groundY - dumpsterHeight * 0.78}
            stroke={bodyStroke} 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Hook circle */}
          <circle 
            cx={startX + 54} 
            cy={groundY - dumpsterHeight * 0.82} 
            r="3"
            fill="none"
            stroke={bodyStroke}
            strokeWidth="1.5"
          />
          
          {/* Rear door frame */}
          <line 
            x1={startX + dumpsterWidth - 16} y1={topY + 26} 
            x2={startX + dumpsterWidth - 16} y2={groundY - 2}
            stroke={bodyStroke} strokeWidth="1.8" strokeLinecap="round"
          />
          <line 
            x1={startX + dumpsterWidth - 6} y1={topY + 22} 
            x2={startX + dumpsterWidth - 6} y2={groundY - 4}
            stroke={bodyStroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"
          />
          {/* Door hinge hints */}
          <circle cx={startX + dumpsterWidth - 11} cy={topY + 34} r="2" fill={bodyStroke} opacity="0.5"/>
          <circle cx={startX + dumpsterWidth - 11} cy={groundY - 12} r="2" fill={bodyStroke} opacity="0.5"/>
          
          {/* Bottom skid rails (roll-off) */}
          <rect 
            x={startX + 22} y={groundY + 2} 
            width={dumpsterWidth - 44} height={5}
            fill="#4A4A4A"
            rx="1"
          />
          <rect 
            x={startX + 30} y={groundY + 10} 
            width={dumpsterWidth - 60} height={4}
            fill="#3A3A3A"
            rx="1"
          />
          
          {/* Subtle wear marks near bottom (very light) */}
          <g opacity="0.08">
            <ellipse cx={startX + 45} cy={groundY - 8} rx="8" ry="3" fill={wearColor}/>
            <ellipse cx={startX + dumpsterWidth - 50} cy={groundY - 6} rx="6" ry="2" fill={wearColor}/>
            <ellipse cx={startX + dumpsterWidth / 2} cy={groundY - 4} rx="12" ry="2" fill={wearColor}/>
          </g>
          
          {/* Ladder hint near rear (larger sizes only) */}
          {heightScale >= 0.5 && (
            <g stroke={bodyStroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
              {Array.from({ length: Math.min(4, Math.ceil(heightScale * 4)) }).map((_, i) => (
                <line
                  key={i}
                  x1={startX + dumpsterWidth + 4}
                  y1={topY + 24 + i * (dumpsterHeight * 0.2)}
                  x2={startX + dumpsterWidth + 12}
                  y2={topY + 24 + i * (dumpsterHeight * 0.2)}
                />
              ))}
              {/* Ladder uprights */}
              <line 
                x1={startX + dumpsterWidth + 4} y1={topY + 20}
                x2={startX + dumpsterWidth + 4} y2={groundY - 4}
              />
              <line 
                x1={startX + dumpsterWidth + 12} y1={topY + 20}
                x2={startX + dumpsterWidth + 12} y2={groundY - 4}
              />
            </g>
          )}
        </g>
        
        {/* Measurement Arrows */}
        <g className="text-muted-foreground opacity-40 group-hover:opacity-80 transition-opacity duration-300">
          {/* Length arrow (bottom) */}
          <line
            x1={startX + 10} y1={groundY + 22}
            x2={startX + dumpsterWidth + 2} y2={groundY + 22}
            stroke="currentColor" strokeWidth="1"
          />
          <polygon 
            points={`${startX + 10},${groundY + 22} ${startX + 16},${groundY + 19} ${startX + 16},${groundY + 25}`}
            fill="currentColor"
          />
          <polygon 
            points={`${startX + dumpsterWidth + 2},${groundY + 22} ${startX + dumpsterWidth - 4},${groundY + 19} ${startX + dumpsterWidth - 4},${groundY + 25}`}
            fill="currentColor"
          />
          <text
            x={startX + dumpsterWidth / 2}
            y={groundY + 35}
            textAnchor="middle"
            className="fill-current text-[9px] font-medium"
          >
            {spec.length}
          </text>
          
          {/* Height arrow (right side) */}
          <line
            x1={startX + dumpsterWidth + 22} y1={topY + 12}
            x2={startX + dumpsterWidth + 22} y2={groundY}
            stroke="currentColor" strokeWidth="1"
          />
          <polygon 
            points={`${startX + dumpsterWidth + 22},${topY + 12} ${startX + dumpsterWidth + 19},${topY + 18} ${startX + dumpsterWidth + 25},${topY + 18}`}
            fill="currentColor"
          />
          <polygon 
            points={`${startX + dumpsterWidth + 22},${groundY} ${startX + dumpsterWidth + 19},${groundY - 6} ${startX + dumpsterWidth + 25},${groundY - 6}`}
            fill="currentColor"
          />
          <text
            x={startX + dumpsterWidth + 36}
            y={(topY + 12 + groundY) / 2 + 3}
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

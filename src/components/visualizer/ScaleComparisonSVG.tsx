/**
 * Scale Comparison SVG - Shows dumpster next to reference objects
 * Person (6ft), Pickup truck (6ft bed), Garage door (7ft)
 */
import { cn } from '@/lib/utils';
import { DumpsterSize, DUMPSTER_SPECS } from './constants';

interface ScaleComparisonSVGProps {
  size: DumpsterSize;
  compareWith: 'person' | 'pickup' | 'garage';
  className?: string;
}

// Scale factor: 1 foot = 20 pixels
const SCALE = 20;

export function ScaleComparisonSVG({ size, compareWith, className }: ScaleComparisonSVGProps) {
  const spec = DUMPSTER_SPECS[size];
  
  // Dumpster dimensions in pixels
  const dumpsterW = spec.lengthFt * SCALE;
  const dumpsterH = spec.heightFt * SCALE;
  
  // Reference object dimensions
  const personH = 6 * SCALE; // 6 ft
  const pickupL = 12 * SCALE; // ~12 ft total length
  const pickupH = 5.5 * SCALE;
  const garageH = 7 * SCALE;
  const garageW = 8 * SCALE;
  
  // Calculate viewBox to fit content
  const maxWidth = Math.max(dumpsterW, pickupL, garageW) + 60;
  const maxHeight = Math.max(dumpsterH, personH, pickupH, garageH) + 40;
  const viewBoxWidth = maxWidth + 100;
  const viewBoxHeight = maxHeight + 50;
  
  // Ground line Y position
  const groundY = viewBoxHeight - 20;
  
  // Dumpster position
  const dumpsterX = 40;
  const dumpsterY = groundY - dumpsterH - 10;
  
  // Reference position (to the right of dumpster)
  const refX = dumpsterX + dumpsterW + 30;
  
  return (
    <svg 
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className={cn("w-full h-auto", className)}
      role="img"
      aria-label={`${size}-yard dumpster compared to ${compareWith}`}
    >
      <defs>
        <style>
          {`
            .sc-ground { fill: none; stroke: hsl(220 14% 40%); stroke-width: 1.5; stroke-dasharray: 4 4; }
            .sc-dumpster { fill: hsl(220 14% 93%); stroke: hsl(220 20% 20%); stroke-width: 2; }
            .sc-dumpster-rib { stroke: hsl(220 20% 30%); stroke-width: 1; opacity: 0.5; }
            .sc-person { fill: hsl(220 14% 30%); }
            .sc-pickup { fill: hsl(220 14% 40%); stroke: hsl(220 20% 25%); stroke-width: 1.5; }
            .sc-garage { fill: none; stroke: hsl(220 14% 50%); stroke-width: 2; stroke-dasharray: 6 3; }
            .sc-label { font-family: system-ui, sans-serif; font-size: 11px; fill: hsl(220 14% 40%); }
            .sc-dim { font-family: system-ui, sans-serif; font-size: 10px; fill: hsl(220 14% 50%); }
          `}
        </style>
      </defs>
      
      {/* Ground line */}
      <line className="sc-ground" x1="10" y1={groundY} x2={viewBoxWidth - 10} y2={groundY} />
      
      {/* Dumpster body */}
      <g transform={`translate(${dumpsterX}, ${dumpsterY})`}>
        {/* Main body - simplified trapezoid */}
        <path 
          className="sc-dumpster"
          d={`M0,${dumpsterH * 0.15} L0,${dumpsterH} L${dumpsterW},${dumpsterH} L${dumpsterW},${dumpsterH * 0.1} L${dumpsterW * 0.05},${dumpsterH * 0.1} Z`}
        />
        {/* Ribs */}
        {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((pct, i) => (
          <line 
            key={i}
            className="sc-dumpster-rib"
            x1={dumpsterW * pct} 
            y1={dumpsterH * 0.12}
            x2={dumpsterW * pct}
            y2={dumpsterH - 2}
          />
        ))}
        {/* Size label */}
        <text x={dumpsterW / 2} y={dumpsterH / 2 + 4} textAnchor="middle" className="sc-label" style={{ fontWeight: 600 }}>
          {size} YD
        </text>
        {/* Height dimension */}
        <text x={-8} y={dumpsterH / 2} textAnchor="end" className="sc-dim">{spec.heightFt}'</text>
        {/* Length dimension */}
        <text x={dumpsterW / 2} y={dumpsterH + 14} textAnchor="middle" className="sc-dim">{spec.lengthFt}' L</text>
      </g>
      
      {/* Reference object */}
      {compareWith === 'person' && (
        <g transform={`translate(${refX}, ${groundY - personH})`}>
          {/* Simplified person silhouette */}
          <ellipse className="sc-person" cx="15" cy="8" rx="8" ry="8" /> {/* Head */}
          <rect className="sc-person" x="8" y="18" width="14" height="35" rx="3" /> {/* Torso */}
          <rect className="sc-person" x="4" y="55" width="10" height="55" rx="2" /> {/* Left leg */}
          <rect className="sc-person" x="16" y="55" width="10" height="55" rx="2" /> {/* Right leg */}
          <text x="15" y={personH + 14} textAnchor="middle" className="sc-label">6' person</text>
        </g>
      )}
      
      {compareWith === 'pickup' && (
        <g transform={`translate(${refX}, ${groundY - pickupH})`}>
          {/* Simplified pickup truck */}
          <path 
            className="sc-pickup"
            d={`M0,${pickupH * 0.4} 
                L${pickupL * 0.15},${pickupH * 0.4}
                L${pickupL * 0.2},${pickupH * 0.1}
                L${pickupL * 0.45},${pickupH * 0.1}
                L${pickupL * 0.5},${pickupH * 0.4}
                L${pickupL},${pickupH * 0.4}
                L${pickupL},${pickupH * 0.85}
                L0,${pickupH * 0.85}
                Z`}
          />
          {/* Wheels */}
          <circle className="sc-person" cx={pickupL * 0.18} cy={pickupH * 0.85} r="12" />
          <circle className="sc-person" cx={pickupL * 0.82} cy={pickupH * 0.85} r="12" />
          {/* Bed outline */}
          <rect 
            x={pickupL * 0.52} 
            y={pickupH * 0.25} 
            width={pickupL * 0.42} 
            height={pickupH * 0.55} 
            fill="none" 
            stroke="hsl(220 14% 50%)" 
            strokeWidth="1.5" 
            strokeDasharray="3 2"
          />
          <text x={pickupL / 2} y={pickupH + 18} textAnchor="middle" className="sc-label">6' bed pickup</text>
        </g>
      )}
      
      {compareWith === 'garage' && (
        <g transform={`translate(${refX}, ${groundY - garageH})`}>
          {/* Garage door outline */}
          <rect className="sc-garage" x="0" y="0" width={garageW} height={garageH} />
          {/* Panel lines */}
          <line className="sc-garage" x1="0" y1={garageH * 0.25} x2={garageW} y2={garageH * 0.25} />
          <line className="sc-garage" x1="0" y1={garageH * 0.5} x2={garageW} y2={garageH * 0.5} />
          <line className="sc-garage" x1="0" y1={garageH * 0.75} x2={garageW} y2={garageH * 0.75} />
          <text x={garageW / 2} y={garageH + 14} textAnchor="middle" className="sc-label">7' garage door</text>
        </g>
      )}
    </svg>
  );
}

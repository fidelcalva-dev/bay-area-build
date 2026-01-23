/**
 * Plain realistic roll-off dumpster silhouette SVG
 * Industrial gray steel with ribs, skids, hinges, and structural details
 * Each size renders unique proportions based on canonical dimensions
 * 
 * CANONICAL DIMENSIONS (W × L × H in feet):
 * 6 yd:  6   × 12 × 2.25
 * 8 yd:  6   × 12 × 3
 * 10 yd: 7.5 × 12 × 3
 * 20 yd: 7.5 × 18 × 4
 * 30 yd: 7.5 × 18 × 6
 * 40 yd: 7.5 × 24 × 6
 * 50 yd: 7.5 × 24 × 7.5
 */

type DumpsterSizeYd = 6 | 8 | 10 | 20 | 30 | 40 | 50;

interface DumpsterSilhouettePlainProps {
  size?: DumpsterSizeYd;
  className?: string;
}

/**
 * SIZE_PROPS calculated from canonical ratios:
 * 
 * LENGTH BASE: 12ft = 400px
 * - 18ft = 400 × 1.5 = 600px
 * - 24ft = 600 × 1.333 = 800px
 * 
 * HEIGHT BASE: 2.25ft = 75px
 * - 3ft = 75 × 1.333 = 100px
 * - 4ft = 75 × 1.778 = 133px
 * - 6ft = 75 × 2.667 = 200px
 * - 7.5ft = 75 × 3.333 = 250px
 * 
 * VERIFICATION:
 * - 8yd/6yd height: 100/75 = 1.333 ✓
 * - 30yd/20yd height: 200/133 = 1.504 ✓
 * - 50yd/40yd height: 250/200 = 1.25 ✓
 * - 18ft/12ft length: 600/400 = 1.5 ✓
 * - 24ft/18ft length: 800/600 = 1.333 ✓
 */
const SIZE_PROPS: Record<DumpsterSizeYd, {
  viewBoxWidth: number;
  viewBoxHeight: number;
  bodyWidth: number;
  bodyHeight: number;
  ribCount: number;
}> = {
  // 12ft × 2.25ft (6yd)
  6:  { viewBoxWidth: 480, viewBoxHeight: 130, bodyWidth: 400, bodyHeight: 75,  ribCount: 6 },
  // 12ft × 3ft (8yd, 10yd)
  8:  { viewBoxWidth: 480, viewBoxHeight: 155, bodyWidth: 400, bodyHeight: 100, ribCount: 6 },
  10: { viewBoxWidth: 480, viewBoxHeight: 155, bodyWidth: 400, bodyHeight: 100, ribCount: 6 },
  // 18ft × 4ft (20yd)
  20: { viewBoxWidth: 680, viewBoxHeight: 188, bodyWidth: 600, bodyHeight: 133, ribCount: 9 },
  // 18ft × 6ft (30yd)
  30: { viewBoxWidth: 680, viewBoxHeight: 255, bodyWidth: 600, bodyHeight: 200, ribCount: 9 },
  // 24ft × 6ft (40yd)
  40: { viewBoxWidth: 880, viewBoxHeight: 255, bodyWidth: 800, bodyHeight: 200, ribCount: 12 },
  // 24ft × 7.5ft (50yd)
  50: { viewBoxWidth: 880, viewBoxHeight: 305, bodyWidth: 800, bodyHeight: 250, ribCount: 12 },
};

export function DumpsterSilhouettePlain({ size = 20, className }: DumpsterSilhouettePlainProps) {
  const props = SIZE_PROPS[size] || SIZE_PROPS[20];
  const { viewBoxWidth, viewBoxHeight, bodyWidth, bodyHeight, ribCount } = props;
  
  // Calculate positions based on body dimensions
  const marginX = (viewBoxWidth - bodyWidth) / 2;
  const marginY = 15;
  const bodyTop = marginY;
  const bodyBottom = marginY + bodyHeight;
  
  // Front/rear angles
  const frontSlant = bodyHeight * 0.15;
  const rearSlant = bodyHeight * 0.12;
  
  // Skid positions
  const skidY1 = bodyBottom + 8;
  const skidY2 = bodyBottom + 18;
  
  // Generate rib positions
  const ribs: number[] = [];
  const ribStartX = marginX + 50;
  const ribEndX = marginX + bodyWidth - 40;
  const actualRibSpacing = (ribEndX - ribStartX) / (ribCount - 1);
  for (let i = 0; i < ribCount; i++) {
    ribs.push(ribStartX + i * actualRibSpacing);
  }
  
  // Seam positions (horizontal lines)
  const seamY1 = bodyTop + bodyHeight * 0.25;
  const seamY2 = bodyTop + bodyHeight * 0.50;
  const seamY3 = bodyTop + bodyHeight * 0.75;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight + 30}`}
      role="img" 
      aria-label={`${size} yard roll-off dumpster silhouette`}
      className={className || "w-full h-full"}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <style>
          {`
            .dsp-body { fill: #EFEFEF; }
            .dsp-outline { fill: none; stroke: #2B2B2B; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
            .dsp-rib { fill: none; stroke: #2B2B2B; stroke-width: 2; opacity: 0.65; stroke-linecap: round; }
            .dsp-seam { fill: none; stroke: #2B2B2B; stroke-width: 1.5; opacity: 0.30; stroke-linecap: round; }
            .dsp-skid { fill: none; stroke: #2B2B2B; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
            .dsp-detail { fill: none; stroke: #2B2B2B; stroke-width: 2; opacity: 0.65; stroke-linecap: round; stroke-linejoin: round; }
            .dsp-wear { fill: #2B2B2B; opacity: 0.04; }
          `}
        </style>
      </defs>

      {/* Subtle industrial wear */}
      <rect className="dsp-wear" x={marginX + 20} y={bodyBottom - 15} width={bodyWidth - 40} height={10} rx={2} />

      {/* Main body (trapezoid shape with rear rise) */}
      <path 
        className="dsp-body"
        d={`
          M ${marginX},${bodyTop + frontSlant}
          L ${marginX + 25},${bodyTop}
          L ${marginX + bodyWidth - 30},${bodyTop}
          L ${marginX + bodyWidth},${bodyTop + rearSlant}
          L ${marginX + bodyWidth},${bodyBottom - rearSlant}
          L ${marginX + bodyWidth - 30},${bodyBottom}
          L ${marginX + 25},${bodyBottom}
          L ${marginX},${bodyBottom - frontSlant}
          Z
        `}
      />

      {/* Outer outline */}
      <path 
        className="dsp-outline"
        d={`
          M ${marginX},${bodyTop + frontSlant}
          L ${marginX + 25},${bodyTop}
          L ${marginX + bodyWidth - 30},${bodyTop}
          L ${marginX + bodyWidth},${bodyTop + rearSlant}
          L ${marginX + bodyWidth},${bodyBottom - rearSlant}
          L ${marginX + bodyWidth - 30},${bodyBottom}
          L ${marginX + 25},${bodyBottom}
          L ${marginX},${bodyBottom - frontSlant}
          Z
        `}
      />

      {/* Top edge (reinforced rail) */}
      <path className="dsp-detail" d={`M ${marginX},${bodyTop + frontSlant} L ${marginX + 25},${bodyTop} L ${marginX + bodyWidth - 30},${bodyTop} L ${marginX + bodyWidth},${bodyTop + rearSlant}`} />

      {/* Bottom lip */}
      <path className="dsp-detail" d={`M ${marginX + 30},${bodyBottom - 5} L ${marginX + bodyWidth - 35},${bodyBottom - 5}`} />

      {/* Skids (roll-off rails) */}
      <path className="dsp-skid" d={`M ${marginX + 40},${skidY1} L ${marginX + bodyWidth - 45},${skidY1}`} />
      <path className="dsp-skid" d={`M ${marginX + 55},${skidY2} L ${marginX + bodyWidth - 60},${skidY2}`} />
      
      {/* Skid ends */}
      <path className="dsp-detail" d={`M ${marginX + 40},${skidY1} L ${marginX + 25},${skidY1 + 6}`} />
      <path className="dsp-detail" d={`M ${marginX + bodyWidth - 45},${skidY1} L ${marginX + bodyWidth - 30},${skidY1 + 6}`} />

      {/* Front hook-up / doghouse */}
      <path className="dsp-detail" d={`M ${marginX + 10},${bodyTop + bodyHeight * 0.6} L ${marginX + 50},${bodyTop + bodyHeight * 0.6} Q ${marginX + 70},${bodyTop + bodyHeight * 0.5} ${marginX + 75},${bodyTop + bodyHeight * 0.35}`} />
      <path className="dsp-detail" d={`M ${marginX + 75},${bodyTop + bodyHeight * 0.35} L ${marginX + 75},${bodyTop + bodyHeight * 0.2}`} />

      {/* Rear door frame */}
      <path className="dsp-outline" d={`M ${marginX + bodyWidth - 30},${bodyTop + 8} L ${marginX + bodyWidth - 30},${bodyBottom - 8}`} />
      <path className="dsp-detail" d={`M ${marginX + bodyWidth - 15},${bodyTop + rearSlant + 10} L ${marginX + bodyWidth - 15},${bodyBottom - rearSlant - 10}`} />

      {/* Rear door hinges */}
      <path className="dsp-detail" d={`M ${marginX + bodyWidth - 25},${bodyTop + bodyHeight * 0.3} L ${marginX + bodyWidth - 10},${bodyTop + bodyHeight * 0.3}`} />
      <path className="dsp-detail" d={`M ${marginX + bodyWidth - 25},${bodyTop + bodyHeight * 0.5} L ${marginX + bodyWidth - 10},${bodyTop + bodyHeight * 0.5}`} />
      <path className="dsp-detail" d={`M ${marginX + bodyWidth - 25},${bodyTop + bodyHeight * 0.7} L ${marginX + bodyWidth - 10},${bodyTop + bodyHeight * 0.7}`} />

      {/* Vertical ribs */}
      <g className="dsp-rib">
        {ribs.map((x, i) => (
          <path key={i} d={`M ${x},${bodyTop + 8} L ${x},${bodyBottom - 8}`} />
        ))}
      </g>

      {/* Horizontal seams */}
      <g className="dsp-seam">
        <path d={`M ${marginX + 30},${seamY1} L ${marginX + bodyWidth - 35},${seamY1}`} />
        <path d={`M ${marginX + 25},${seamY2} L ${marginX + bodyWidth - 30},${seamY2}`} />
        <path d={`M ${marginX + 30},${seamY3} L ${marginX + bodyWidth - 35},${seamY3}`} />
      </g>
    </svg>
  );
}

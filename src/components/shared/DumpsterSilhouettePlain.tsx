/**
 * Plain realistic roll-off dumpster silhouette SVG
 * Industrial gray steel with ribs, skids, hinges, and structural details
 * No logos, no green rail
 */
export function DumpsterSilhouettePlain() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 920 280" 
      role="img" 
      aria-label="Plain realistic roll-off dumpster silhouette"
      className="w-full h-full"
    >
      <defs>
        <style>
          {`
            .dump-body { fill: #EFEFEF; }
            .dump-outline { fill: none; stroke: #2B2B2B; stroke-width: 5.5; stroke-linecap: round; stroke-linejoin: round; }
            .dump-rib { fill: none; stroke: #2B2B2B; stroke-width: 2.4; opacity: 0.70; stroke-linecap: round; }
            .dump-seam { fill: none; stroke: #2B2B2B; stroke-width: 2; opacity: 0.35; stroke-linecap: round; }
            .dump-skid { fill: none; stroke: #2B2B2B; stroke-width: 6.2; stroke-linecap: round; stroke-linejoin: round; }
            .dump-detail { fill: none; stroke: #2B2B2B; stroke-width: 2.4; opacity: 0.7; stroke-linecap: round; stroke-linejoin: round; }
            .dump-wear { fill: #2B2B2B; opacity: 0.05; }
          `}
        </style>
      </defs>

      {/* Group positioned nicely inside viewbox */}
      <g transform="translate(45,35)">
        {/* Subtle industrial wear */}
        <path className="dump-wear" d="M70,190 h610 v12 h-610z"/>
        <path className="dump-wear" d="M105,75 h520 v10 h-520z"/>

        {/* Main body (realistic trapezoid + rear rise) */}
        <path 
          className="dump-body"
          d="M55,38 H705 L760,78 V178 L705,212 H85 L55,182 Z"
        />

        {/* Outer outline */}
        <path 
          className="dump-outline"
          d="M55,38 H705 L760,78 V178 L705,212 H85 L55,182 Z"
        />

        {/* Top edge (reinforced rail) */}
        <path className="dump-detail" d="M55,38 H705 L760,78" />

        {/* Bottom lip / floor hint */}
        <path className="dump-detail" d="M78,202 H712" />

        {/* Skids (roll-off rails) */}
        <path className="dump-skid" d="M110,218 H675"/>
        <path className="dump-skid" d="M125,232 H660"/>
        
        {/* Skid ends */}
        <path className="dump-detail" d="M110,218 l-20,10"/>
        <path className="dump-detail" d="M675,218 l20,10"/>
        <path className="dump-detail" d="M125,232 l-18,10"/>
        <path className="dump-detail" d="M660,232 l18,10"/>

        {/* Front hook-up / doghouse */}
        <path className="dump-detail" d="M75,150 H155 c25,0 40,-12 48,-32"/>
        <path className="dump-detail" d="M203,118 V92 c0,-10 -6,-16 -14,-20"/>
        <path className="dump-detail" d="M189,72 H145"/>

        {/* Rear door frame */}
        <path className="dump-outline" d="M705,56 V200"/>
        <path className="dump-detail" d="M730,74 V190"/>

        {/* Rear door hinge/lock hints */}
        <path className="dump-detail" d="M717,98 h18"/>
        <path className="dump-detail" d="M717,126 h18"/>
        <path className="dump-detail" d="M717,154 h18"/>
        <path className="dump-detail" d="M712,178 h22"/>

        {/* Vertical ribs (panel spacing) */}
        <g className="dump-rib">
          <path d="M125,58 V200"/>
          <path d="M175,58 V200"/>
          <path d="M225,58 V200"/>
          <path d="M275,58 V200"/>
          <path d="M325,58 V200"/>
          <path d="M375,58 V200"/>
          <path d="M425,58 V200"/>
          <path d="M475,58 V200"/>
          <path d="M525,58 V200"/>
          <path d="M575,58 V200"/>
          <path d="M625,58 V200"/>
          <path d="M675,58 V200"/>
        </g>

        {/* Horizontal seams / weld lines */}
        <g className="dump-seam">
          <path d="M95,92 H720"/>
          <path d="M88,132 H736"/>
          <path d="M78,170 H745"/>
        </g>

        {/* Side cutout / structural notch hint */}
        <path className="dump-seam" d="M110,205 c30,-8 55,-8 80,0" />
      </g>
    </svg>
  );
}

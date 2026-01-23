/**
 * Plain realistic roll-off dumpster silhouette SVG
 * No logos, no green rail - just industrial gray steel
 */
export function DumpsterSilhouettePlain() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 900 260" 
      role="img" 
      aria-label="Roll-off dumpster silhouette"
      className="w-full h-full"
    >
      <defs>
        <style>
          {`
            .dumpster-body { fill: #EDEDED; }
            .dumpster-outline { fill: none; stroke: #2B2B2B; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
            .dumpster-rib { fill: none; stroke: #2B2B2B; stroke-width: 2.5; opacity: 0.7; }
            .dumpster-skid { fill: none; stroke: #2B2B2B; stroke-width: 6; }
          `}
        </style>
      </defs>

      <g transform="translate(40,30)">
        {/* Body */}
        <path 
          className="dumpster-body" 
          d="M40,40 H700 L735,68 V178 L700,205 H60 L40,182 Z"
        />
        <path 
          className="dumpster-outline" 
          d="M40,40 H700 L735,68 V178 L700,205 H60 L40,182 Z"
        />

        {/* Skids */}
        <path className="dumpster-skid" d="M80,212 H660"/>
        <path className="dumpster-skid" d="M95,224 H645"/>

        {/* Rear door hint */}
        <path className="dumpster-rib" d="M690,60 V190"/>
        <path className="dumpster-rib" d="M712,78 V182"/>

        {/* Ribs */}
        <g className="dumpster-rib">
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
  );
}

/**
 * DumpsterSVG — Realistic 3D isometric dumpster diagram in Calsan brand colors
 * Renders inline SVG with size-specific proportions and orange dimension overlays.
 *
 * Brand: green #1a6b3c, orange #e85d04
 * Scale: 1ft ≈ 13px
 */

type Yards = 5 | 8 | 10 | 20 | 30 | 40 | 50;

interface DumpsterSVGProps {
  yards: Yards;
  className?: string;
}

const SIZE_DATA: Record<Yards, {
  bodyW: number;
  bodyH: number;
  depth: number;
  L: string;
  W: string;
  H: string;
  ribs: number;
}> = {
  5:  { bodyW: 156, bodyH: 50,  depth: 16, L: '12 ft', W: '5 ft',   H: '2.25 ft', ribs: 3 },
  8:  { bodyW: 156, bodyH: 65,  depth: 18, L: '12 ft', W: '6 ft',   H: '3 ft',    ribs: 3 },
  10: { bodyW: 156, bodyH: 65,  depth: 22, L: '12 ft', W: '7.5 ft', H: '3 ft',    ribs: 3 },
  20: { bodyW: 234, bodyH: 86,  depth: 22, L: '18 ft', W: '7.5 ft', H: '4 ft',    ribs: 4 },
  30: { bodyW: 234, bodyH: 130, depth: 22, L: '18 ft', W: '7.5 ft', H: '6 ft',    ribs: 4 },
  40: { bodyW: 286, bodyH: 130, depth: 22, L: '22 ft', W: '7.5 ft', H: '6 ft',    ribs: 4 },
  50: { bodyW: 312, bodyH: 162, depth: 22, L: '24 ft', W: '7.5 ft', H: '7.5 ft',  ribs: 4 },
};

export function DumpsterSVG({ yards, className }: DumpsterSVGProps) {
  const d = SIZE_DATA[yards];
  if (!d) return null;

  // Layout padding to accommodate dimension labels
  const padL = 38;   // left for height arrow
  const padR = 24;   // right
  const padT = 28;   // top for width arrow
  const padB = 36;   // bottom for length arrow

  const vbW = padL + d.bodyW + d.depth + padR;
  const vbH = padT + d.bodyH + d.depth + padB;

  // Body anchors
  const x0 = padL;
  const y0 = padT + d.depth; // front face top
  const frontX = x0;
  const frontY = y0;
  const frontW = d.bodyW;
  const frontH = d.bodyH;

  // Top face polygon (parallelogram)
  const topPts = [
    [frontX, frontY],
    [frontX + d.depth, frontY - d.depth],
    [frontX + frontW + d.depth, frontY - d.depth],
    [frontX + frontW, frontY],
  ].map(p => p.join(',')).join(' ');

  // Right side polygon
  const rightPts = [
    [frontX + frontW, frontY],
    [frontX + frontW + d.depth, frontY - d.depth],
    [frontX + frontW + d.depth, frontY + frontH - d.depth],
    [frontX + frontW, frontY + frontH],
  ].map(p => p.join(',')).join(' ');

  // Top rim (silver) overlay - 6px tall on the top face plane
  const rimH = 6;
  const rimPts = [
    [frontX, frontY],
    [frontX + d.depth, frontY - d.depth],
    [frontX + frontW + d.depth, frontY - d.depth],
    [frontX + frontW, frontY],
    [frontX + frontW, frontY + rimH],
    [frontX, frontY + rimH],
  ].map(p => p.join(',')).join(' ');

  // Vertical ribs
  const ribSpacing = frontW / (d.ribs + 1);
  const ribs = Array.from({ length: d.ribs }, (_, i) => frontX + ribSpacing * (i + 1));

  // Corner bolts
  const bolts = [
    [frontX + 6, frontY + rimH + 6],
    [frontX + frontW - 6, frontY + rimH + 6],
    [frontX + 6, frontY + frontH - 8],
    [frontX + frontW - 6, frontY + frontH - 8],
  ];

  // Dimension arrows
  const lenArrowY = frontY + frontH + 18;
  const heightArrowX = frontX - 14;
  const widthArrowY1 = frontY - d.depth - 8; // above top face

  const uid = `ds-${yards}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${vbW} ${vbH}`}
      role="img"
      aria-label={`${yards} yard dumpster diagram, ${d.L} long by ${d.W} wide by ${d.H} tall`}
      className={className || 'w-full h-auto'}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`${uid}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d7a48" />
          <stop offset="100%" stopColor="#0d3d20" />
        </linearGradient>
        <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a9966" />
          <stop offset="100%" stopColor="#2d7a48" />
        </linearGradient>
        <linearGradient id={`${uid}-right`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a6b3c" />
          <stop offset="100%" stopColor="#0a2d18" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.25" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#e85d04" />
        </marker>
      </defs>

      {/* Drop shadow ellipse */}
      <ellipse
        cx={frontX + frontW / 2 + d.depth / 2}
        cy={frontY + frontH + 6}
        rx={frontW / 2 + 8}
        ry={5}
        fill="#000"
        opacity="0.18"
      />

      <g filter={`url(#${uid}-shadow)`}>
        {/* Top face */}
        <polygon points={topPts} fill={`url(#${uid}-top)`} stroke="#0a2d18" strokeWidth="1" />
        {/* Right side */}
        <polygon points={rightPts} fill={`url(#${uid}-right)`} stroke="#0a2d18" strokeWidth="1" />
        {/* Front face */}
        <rect x={frontX} y={frontY} width={frontW} height={frontH} fill={`url(#${uid}-front)`} stroke="#0a2d18" strokeWidth="1" />

        {/* Vertical ribs on front */}
        {ribs.map((rx, i) => (
          <line
            key={i}
            x1={rx}
            y1={frontY + rimH + 2}
            x2={rx}
            y2={frontY + frontH - 4}
            stroke="#0a2d18"
            strokeWidth="1.5"
            opacity="0.55"
          />
        ))}

        {/* Top rim (silver/steel) */}
        <polygon points={rimPts} fill="#c8ddd2" stroke="#0a2d18" strokeWidth="0.75" />

        {/* Bottom rail */}
        <rect
          x={frontX}
          y={frontY + frontH - 4}
          width={frontW}
          height={4}
          fill="#0d3d20"
        />

        {/* Corner bolts */}
        {bolts.map((b, i) => (
          <circle key={i} cx={b[0]} cy={b[1]} r={2} fill="#8aab97" />
        ))}

        {/* CALSAN faint text */}
        <text
          x={frontX + frontW / 2}
          y={frontY + frontH / 2 + 4}
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontWeight="800"
          fontSize={Math.max(14, Math.min(28, frontW / 7))}
          fill="rgba(255,255,255,0.12)"
          letterSpacing="2"
        >
          CALSAN
        </text>
      </g>

      {/* ===== Dimension overlays (orange) ===== */}
      <g fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" fill="#e85d04">
        {/* Length arrow (below front face) */}
        <line
          x1={frontX}
          y1={lenArrowY}
          x2={frontX + frontW}
          y2={lenArrowY}
          stroke="#e85d04"
          strokeWidth="1.5"
          markerStart={`url(#${uid}-arrow)`}
          markerEnd={`url(#${uid}-arrow)`}
        />
        <line x1={frontX} y1={lenArrowY - 4} x2={frontX} y2={lenArrowY + 4} stroke="#e85d04" strokeWidth="1.5" />
        <line x1={frontX + frontW} y1={lenArrowY - 4} x2={frontX + frontW} y2={lenArrowY + 4} stroke="#e85d04" strokeWidth="1.5" />
        <text x={frontX + frontW / 2} y={lenArrowY + 14} textAnchor="middle">L: {d.L}</text>

        {/* Height arrow (left of front face) */}
        <line
          x1={heightArrowX}
          y1={frontY}
          x2={heightArrowX}
          y2={frontY + frontH}
          stroke="#e85d04"
          strokeWidth="1.5"
          markerStart={`url(#${uid}-arrow)`}
          markerEnd={`url(#${uid}-arrow)`}
        />
        <line x1={heightArrowX - 4} y1={frontY} x2={heightArrowX + 4} y2={frontY} stroke="#e85d04" strokeWidth="1.5" />
        <line x1={heightArrowX - 4} y1={frontY + frontH} x2={heightArrowX + 4} y2={frontY + frontH} stroke="#e85d04" strokeWidth="1.5" />
        <text
          x={heightArrowX - 6}
          y={frontY + frontH / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${heightArrowX - 6} ${frontY + frontH / 2})`}
        >
          H: {d.H}
        </text>

        {/* Width arrow (along top diagonal face) */}
        <line
          x1={frontX + 2}
          y1={widthArrowY1 + d.depth - 2}
          x2={frontX + d.depth + 2}
          y2={widthArrowY1 - 2}
          stroke="#e85d04"
          strokeWidth="1.5"
          markerStart={`url(#${uid}-arrow)`}
          markerEnd={`url(#${uid}-arrow)`}
        />
        <text
          x={frontX + d.depth + 8}
          y={widthArrowY1 + 2}
          textAnchor="start"
        >
          W: {d.W}
        </text>
      </g>
    </svg>
  );
}

export default DumpsterSVG;

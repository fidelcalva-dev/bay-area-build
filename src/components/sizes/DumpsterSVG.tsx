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
  5:  { bodyW: 156, bodyH: 44,  depth: 16, L: '12 ft', W: '5 ft',   H: '2.25 ft', ribs: 3 },
  8:  { bodyW: 156, bodyH: 58,  depth: 18, L: '12 ft', W: '6 ft',   H: '3 ft',    ribs: 3 },
  10: { bodyW: 156, bodyH: 58,  depth: 22, L: '12 ft', W: '7.5 ft', H: '3 ft',    ribs: 3 },
  20: { bodyW: 234, bodyH: 78,  depth: 22, L: '18 ft', W: '7.5 ft', H: '4 ft',    ribs: 4 },
  30: { bodyW: 234, bodyH: 110, depth: 22, L: '18 ft', W: '7.5 ft', H: '6 ft',    ribs: 4 },
  40: { bodyW: 286, bodyH: 110, depth: 22, L: '22 ft', W: '7.5 ft', H: '6 ft',    ribs: 4 },
  50: { bodyW: 312, bodyH: 138, depth: 22, L: '24 ft', W: '7.5 ft', H: '7.5 ft',  ribs: 4 },
};

export function DumpsterSVG({ yards, className }: DumpsterSVGProps) {
  const d = SIZE_DATA[yards];
  if (!d) return null;

  const padL = 48;
  const padR = 24;
  const padT = 28;
  const padB = 40;
  const wheelR = 5;

  const vbW = padL + d.bodyW + d.depth + padR;
  const vbH = padT + d.bodyH + d.depth + padB;

  const x0 = padL;
  const y0 = padT + d.depth;
  const frontX = x0;
  const frontY = y0;
  const frontW = d.bodyW;
  const frontH = d.bodyH;

  // Top face polygon
  const topPts = [
    [frontX, frontY],
    [frontX + d.depth, frontY - d.depth],
    [frontX + frontW + d.depth, frontY - d.depth],
    [frontX + frontW, frontY],
  ].map(p => p.join(',')).join(' ');

  // Open cavity inside top face (inset 4px)
  const inset = 4;
  const cavityPts = [
    [frontX + inset, frontY - inset * 0.2],
    [frontX + d.depth + inset * 0.5, frontY - d.depth + inset],
    [frontX + frontW + d.depth - inset * 0.5, frontY - d.depth + inset],
    [frontX + frontW - inset, frontY - inset * 0.2],
  ].map(p => p.join(',')).join(' ');

  // Right side polygon
  const rightPts = [
    [frontX + frontW, frontY],
    [frontX + frontW + d.depth, frontY - d.depth],
    [frontX + frontW + d.depth, frontY + frontH - d.depth],
    [frontX + frontW, frontY + frontH],
  ].map(p => p.join(',')).join(' ');

  // Top rim
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

  // Wheels
  const wheelY = frontY + frontH + wheelR;
  const wheels = [
    [frontX + 14, wheelY],
    [frontX + 34, wheelY],
    [frontX + frontW - 34, wheelY],
    [frontX + frontW - 14, wheelY],
  ];

  // Door latch
  const latchW = 20;
  const latchH = 6;
  const latchX = frontX + frontW / 2 - latchW / 2;
  const latchY = frontY + frontH * 0.66;

  // Dimension positions
  const lenArrowY = frontY + frontH + 22;
  const heightArrowX = frontX - 18;
  const widthCenterX = frontX + frontW / 2 + d.depth / 2;
  const widthCenterY = frontY - d.depth - 10;

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

      {/* Wheels */}
      {wheels.map((w, i) => (
        <ellipse key={`wh-${i}`} cx={w[0]} cy={w[1]} rx={wheelR} ry={3} fill="#1a1a1a" />
      ))}

      <g filter={`url(#${uid}-shadow)`}>
        {/* Top face */}
        <polygon points={topPts} fill={`url(#${uid}-top)`} stroke="#0a2d18" strokeWidth="1" />
        {/* Open cavity */}
        <polygon points={cavityPts} fill="rgba(0,0,0,0.3)" />
        {/* Right side */}
        <polygon points={rightPts} fill={`url(#${uid}-right)`} stroke="#0a2d18" strokeWidth="1" />
        {/* Front face */}
        <rect x={frontX} y={frontY} width={frontW} height={frontH} fill={`url(#${uid}-front)`} stroke="#0a2d18" strokeWidth="1" />

        {/* Vertical ribs */}
        {ribs.map((rx, i) => (
          <line key={i} x1={rx} y1={frontY + rimH + 2} x2={rx} y2={frontY + frontH - 4} stroke="#0a2d18" strokeWidth="1.5" opacity="0.55" />
        ))}

        {/* Top rim */}
        <polygon points={rimPts} fill="#c8ddd2" stroke="#0a2d18" strokeWidth="0.75" />

        {/* Bottom rail */}
        <rect x={frontX} y={frontY + frontH - 4} width={frontW} height={4} fill="#0d3d20" />

        {/* Door latch */}
        <rect x={latchX} y={latchY} width={latchW} height={latchH} rx={2} fill="#8aab97" />

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
      <g fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700" fill="#e85d04">
        {/* Length arrow (below) */}
        <line x1={frontX} y1={lenArrowY} x2={frontX + frontW} y2={lenArrowY} stroke="#e85d04" strokeWidth="1.5" markerStart={`url(#${uid}-arrow)`} markerEnd={`url(#${uid}-arrow)`} />
        <line x1={frontX} y1={lenArrowY - 4} x2={frontX} y2={lenArrowY + 4} stroke="#e85d04" strokeWidth="1.5" />
        <line x1={frontX + frontW} y1={lenArrowY - 4} x2={frontX + frontW} y2={lenArrowY + 4} stroke="#e85d04" strokeWidth="1.5" />
        <rect x={frontX + frontW / 2 - 20} y={lenArrowY + 3} width={40} height={13} rx={3} fill="white" opacity="0.9" />
        <text x={frontX + frontW / 2} y={lenArrowY + 13} textAnchor="middle">{d.L}</text>

        {/* Height arrow (left, centered, rotated) */}
        <line x1={heightArrowX} y1={frontY} x2={heightArrowX} y2={frontY + frontH} stroke="#e85d04" strokeWidth="1.5" markerStart={`url(#${uid}-arrow)`} markerEnd={`url(#${uid}-arrow)`} />
        <line x1={heightArrowX - 4} y1={frontY} x2={heightArrowX + 4} y2={frontY} stroke="#e85d04" strokeWidth="1.5" />
        <line x1={heightArrowX - 4} y1={frontY + frontH} x2={heightArrowX + 4} y2={frontY + frontH} stroke="#e85d04" strokeWidth="1.5" />
        <g transform={`translate(${heightArrowX - 8}, ${frontY + frontH / 2})`}>
          <rect x={-16} y={-7} width={32} height={13} rx={3} fill="white" opacity="0.9" transform="rotate(-90)" />
          <text textAnchor="middle" dy="3" transform="rotate(-90)">{d.H}</text>
        </g>

        {/* Width label (above top face, centered) */}
        <rect x={widthCenterX - 18} y={widthCenterY - 6} width={36} height={13} rx={3} fill="white" opacity="0.9" />
        <text x={widthCenterX} y={widthCenterY + 4} textAnchor="middle">{d.W}</text>
      </g>
    </svg>
  );
}

export default DumpsterSVG;

/**
 * DumpsterIllustration
 * Pure-SVG isometric roll-off dumpster illustration.
 * Realistic 3D look with metal ribbing, rear door, wheels, and scale reference.
 */

interface DumpsterIllustrationProps {
  yards: 5 | 8 | 10 | 20 | 30 | 40 | 50 | number;
  showDimensions?: boolean;
  showHuman?: boolean;
  width?: number;
  className?: string;
}

const DUMPSTER_SPECS: Record<number, { w: number; h: number; depth: number; label: string; widthFt: number; heightFt: number }> = {
  5:  { w: 120, h: 45,  depth: 40, label: "12' × 5' × 2.25'", widthFt: 12, heightFt: 2.25 },
  8:  { w: 120, h: 55,  depth: 42, label: "12' × 6' × 3'",    widthFt: 12, heightFt: 3 },
  10: { w: 130, h: 58,  depth: 45, label: "12' × 7.5' × 3'",  widthFt: 12, heightFt: 3 },
  20: { w: 165, h: 72,  depth: 52, label: "18' × 7.5' × 4'",  widthFt: 18, heightFt: 4 },
  30: { w: 175, h: 92,  depth: 55, label: "18' × 7.5' × 6'",  widthFt: 18, heightFt: 6 },
  40: { w: 220, h: 92,  depth: 58, label: "22' × 7.5' × 6'",  widthFt: 22, heightFt: 6 },
  50: { w: 230, h: 108, depth: 62, label: "24' × 7.5' × 7.5'",widthFt: 24, heightFt: 7.5 },
};

export function DumpsterIllustration({
  yards,
  showDimensions = true,
  showHuman = true,
  width = 280,
  className,
}: DumpsterIllustrationProps) {
  const spec = DUMPSTER_SPECS[yards] || DUMPSTER_SPECS[20];
  const { w, h, depth, widthFt, heightFt } = spec;

  // Layout padding
  const padL = showDimensions ? 40 : 20;
  const padR = showHuman ? 60 : 20;
  const padT = 25;
  const padB = showDimensions ? 55 : 35;

  // Box origin (front face top-left)
  const x0 = padL;
  const y0 = padT + depth * 0.4; // leave room for top face
  const x1 = x0 + w;
  const y1 = y0 + h;

  // Depth offset for isometric projection
  const dx = depth * 0.55;
  const dy = -depth * 0.4;

  // SVG canvas
  const svgW = padL + w + dx + padR;
  const svgH = padT + depth * 0.4 + h + padB;

  // Ribbing
  const ribCount = w > 180 ? 6 : w > 130 ? 5 : 4;
  const ribStart = x0 + w * 0.08;
  const ribEnd = x1 - w * 0.18; // leave room for rear door
  const ribStep = (ribEnd - ribStart) / (ribCount - 1);

  // Rear door
  const doorX = x1 - w * 0.13;

  // Wheels
  const wheelY = y1 + 6;
  const wheelRX = Math.max(5, w * 0.04);
  const wheelRY = wheelRX * 0.55;
  const wheelCount = w > 180 ? 4 : 3;
  const wheelGap = (w - wheelRX * 4) / (wheelCount - 1);
  const wheels = Array.from({ length: wheelCount }, (_, i) => x0 + wheelRX * 2 + i * wheelGap);

  // Text
  const textSize = Math.max(11, Math.min(22, w * 0.11));

  // Human (5'9" reference) — pixels per foot from container height
  const pxPerFt = h / heightFt;
  const humanH = 5.75 * pxPerFt;
  const humanW = humanH * 0.32;
  const humanX = x1 + dx + 18;
  const humanY = y1 - humanH;

  const uid = `dump-${yards}`;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={width}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${yards} yard roll-off dumpster, ${spec.label}`}
    >
      <title>{`${yards} Yard Dumpster — ${spec.label}`}</title>
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
        <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#388E3C" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
        <linearGradient id={`${uid}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1B5E20" />
          <stop offset="100%" stopColor="#0E3A12" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse
        cx={x0 + (w + dx) / 2}
        cy={wheelY + wheelRY + 4}
        rx={(w + dx) / 2 + 6}
        ry={5}
        fill="#000"
        opacity="0.18"
      />

      {/* Side face (right) */}
      <polygon
        points={`${x1},${y0} ${x1 + dx},${y0 + dy} ${x1 + dx},${y1 + dy} ${x1},${y1}`}
        fill={`url(#${uid}-side)`}
      />
      {/* Side face ribbing (subtle) */}
      {Array.from({ length: 3 }).map((_, i) => {
        const t = (i + 1) / 4;
        const sx = x1 + dx * t;
        const sy1 = y0 + dy * t;
        const sy2 = y1 + dy * t;
        return (
          <line
            key={`s${i}`}
            x1={sx}
            y1={sy1 + 3}
            x2={sx}
            y2={sy2 - 3}
            stroke="#000"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
        );
      })}

      {/* Top face */}
      <polygon
        points={`${x0},${y0} ${x1},${y0} ${x1 + dx},${y0 + dy} ${x0 + dx},${y0 + dy}`}
        fill={`url(#${uid}-top)`}
        stroke="#0E3A12"
        strokeWidth="0.5"
      />

      {/* Main front body */}
      <rect
        x={x0}
        y={y0}
        width={w}
        height={h}
        fill={`url(#${uid}-body)`}
        filter={`url(#${uid}-shadow)`}
      />

      {/* Top rail (lighter accent) */}
      <rect x={x0} y={y0} width={w} height={5} fill="#4CAF50" />
      {/* Top edge highlight */}
      <line x1={x0} y1={y0 + 0.5} x2={x1} y2={y0 + 0.5} stroke="#fff" strokeOpacity="0.4" strokeWidth="1" />

      {/* Vertical ribbing */}
      {Array.from({ length: ribCount }).map((_, i) => {
        const rx = ribStart + i * ribStep;
        return (
          <line
            key={i}
            x1={rx}
            y1={y0 + 7}
            x2={rx}
            y2={y1 - 9}
            stroke="#000"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
        );
      })}

      {/* CALSAN text */}
      <text
        x={x0 + (ribEnd - x0) / 2 + 4}
        y={y0 + h / 2 + textSize / 3}
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="bold"
        fontSize={textSize}
        letterSpacing="3"
        fill="#fff"
        fillOpacity="0.85"
      >
        CALSAN
      </text>

      {/* Rear door */}
      <line
        x1={doorX}
        y1={y0 + 7}
        x2={doorX}
        y2={y1 - 9}
        stroke="#fff"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      {/* Hinges */}
      <rect x={doorX - 3} y={y0 + 10} width={6} height={4} fill="#888" rx="1" />
      <rect x={doorX - 3} y={y0 + h / 2 - 2} width={6} height={4} fill="#888" rx="1" />
      <rect x={doorX - 3} y={y1 - 16} width={6} height={4} fill="#888" rx="1" />

      {/* Bottom rail */}
      <rect x={x0} y={y1 - 7} width={w} height={7} fill="#333" />

      {/* Corner bolts */}
      <circle cx={x0 + 5} cy={y0 + 5} r="2.5" fill="#555" />
      <circle cx={x1 - 5} cy={y0 + 5} r="2.5" fill="#555" />
      <circle cx={x0 + 5} cy={y1 - 11} r="2.5" fill="#555" />
      <circle cx={x1 - 5} cy={y1 - 11} r="2.5" fill="#555" />

      {/* Wheels */}
      {wheels.map((cx, i) => (
        <g key={i}>
          <ellipse cx={cx} cy={wheelY} rx={wheelRX} ry={wheelRY} fill="#222" />
          <ellipse cx={cx - wheelRX * 0.25} cy={wheelY - wheelRY * 0.3} rx={wheelRX * 0.4} ry={wheelRY * 0.3} fill="#555" opacity="0.7" />
        </g>
      ))}

      {/* Dimension arrows */}
      {showDimensions && (
        <g fontFamily="system-ui, sans-serif" fontSize="10" fill="#FF6B35" fontWeight="600">
          {/* Bottom width arrow */}
          <line x1={x0} y1={wheelY + wheelRY + 18} x2={x1} y2={wheelY + wheelRY + 18} stroke="#FF6B35" strokeWidth="1.5" />
          <polygon points={`${x0},${wheelY + wheelRY + 18} ${x0 + 6},${wheelY + wheelRY + 15} ${x0 + 6},${wheelY + wheelRY + 21}`} fill="#FF6B35" />
          <polygon points={`${x1},${wheelY + wheelRY + 18} ${x1 - 6},${wheelY + wheelRY + 15} ${x1 - 6},${wheelY + wheelRY + 21}`} fill="#FF6B35" />
          <text x={(x0 + x1) / 2} y={wheelY + wheelRY + 33} textAnchor="middle">{widthFt} ft</text>

          {/* Left height arrow */}
          <line x1={x0 - 14} y1={y0} x2={x0 - 14} y2={y1} stroke="#FF6B35" strokeWidth="1.5" />
          <polygon points={`${x0 - 14},${y0} ${x0 - 17},${y0 + 6} ${x0 - 11},${y0 + 6}`} fill="#FF6B35" />
          <polygon points={`${x0 - 14},${y1} ${x0 - 17},${y1 - 6} ${x0 - 11},${y1 - 6}`} fill="#FF6B35" />
          <text
            x={x0 - 20}
            y={(y0 + y1) / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${x0 - 20} ${(y0 + y1) / 2})`}
          >
            {heightFt} ft
          </text>
        </g>
      )}

      {/* Human silhouette for scale */}
      {showHuman && (
        <g transform={`translate(${humanX}, ${humanY})`}>
          {/* Head */}
          <circle cx={humanW / 2} cy={humanH * 0.07} r={humanW * 0.18} fill="#9E9E9E" />
          {/* Body */}
          <path
            d={`
              M ${humanW * 0.3},${humanH * 0.18}
              L ${humanW * 0.7},${humanH * 0.18}
              L ${humanW * 0.78},${humanH * 0.55}
              L ${humanW * 0.6},${humanH * 0.55}
              L ${humanW * 0.6},${humanH * 1.0}
              L ${humanW * 0.42},${humanH * 1.0}
              L ${humanW * 0.42},${humanH * 0.55}
              L ${humanW * 0.22},${humanH * 0.55}
              Z
            `}
            fill="#9E9E9E"
          />
          {/* Arms */}
          <path
            d={`M ${humanW * 0.3},${humanH * 0.2} L ${humanW * 0.1},${humanH * 0.5} L ${humanW * 0.2},${humanH * 0.55} L ${humanW * 0.4},${humanH * 0.28} Z`}
            fill="#9E9E9E"
          />
          <path
            d={`M ${humanW * 0.7},${humanH * 0.2} L ${humanW * 0.9},${humanH * 0.5} L ${humanW * 0.8},${humanH * 0.55} L ${humanW * 0.6},${humanH * 0.28} Z`}
            fill="#9E9E9E"
          />
          <text
            x={humanW / 2}
            y={humanH + 12}
            textAnchor="middle"
            fontSize="9"
            fontFamily="system-ui, sans-serif"
            fill="#666"
          >
            5'9"
          </text>
        </g>
      )}
    </svg>
  );
}

export default DumpsterIllustration;

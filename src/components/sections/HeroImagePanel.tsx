import { MapPin, Truck, Ruler } from 'lucide-react';

const BADGES = [
  { icon: MapPin, label: 'Local Bay Area Yards' },
  { icon: Truck, label: 'Same-Day Delivery' },
  { icon: Ruler, label: '5–50 Yard Sizes' },
];

interface HeroImagePanelProps {
  overlayOpacity?: number;
  badges?: { icon: typeof MapPin; label: string }[];
}

export function HeroImagePanel({
  overlayOpacity = 0.15,
  badges = BADGES,
}: HeroImagePanelProps) {
  return (
    <div className="relative w-full">
      <div className="relative rounded-2xl overflow-hidden shadow-lg h-[240px] md:h-[280px] lg:h-full lg:min-h-[480px]">
        <video
          src="/calsan-hero-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        />
        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/[var(--hero-overlay)] via-transparent to-transparent"
          style={{ '--hero-overlay': overlayOpacity } as React.CSSProperties}
        />

        {/* Floating badges */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
          {badges.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full text-xs font-semibold text-foreground shadow-sm border border-border/50"
            >
              <Icon className="w-3.5 h-3.5 text-primary" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

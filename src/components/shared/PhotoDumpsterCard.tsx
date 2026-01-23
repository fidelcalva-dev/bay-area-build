import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Weight, Truck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Use canonical dumpster image registry (single source of truth)
import { DUMPSTER_PHOTO_MAP } from '@/lib/canonicalDumpsterImages';

// Icon used in homepage lazy section (replaces photos in that section only)
import dumpsterIcon from '@/assets/icons/dumpster-icon-rect.jpeg';

// Reference canonical photos (extended to include all sizes)
const DUMPSTER_PHOTOS: Record<number, string> = DUMPSTER_PHOTO_MAP;

/**
 * CANONICAL SPECS (LOCKED) - W × L × H
 * 10: 7.5 × 12 × 3   | 20: 7.5 × 18 × 4
 * 30: 7.5 × 18 × 6   | 40: 7.5 × 24 × 6
 */
const DUMPSTER_SPECS: Record<number, {
  length: string;
  width: string;
  height: string;
  tons: number;
  loads: string;
  popular?: boolean;
}> = {
  10: { length: "12'", width: "7.5'", height: "3'",  tons: 1, loads: '4–5 loads' },
  20: { length: "18'", width: "7.5'", height: "4'",  tons: 2, loads: '6–8 loads', popular: true },
  30: { length: "18'", width: "7.5'", height: "6'",  tons: 3, loads: '9–12 loads' },
  40: { length: "24'", width: "7.5'", height: "6'",  tons: 4, loads: '12–16 loads' },
};

type DumpsterSize = 10 | 20 | 30 | 40;

interface PhotoDumpsterCardProps {
  size: DumpsterSize;
  ctaLink?: string;
  ctaLabel?: string;
  className?: string;
  imageMode?: 'photo' | 'icon';
}

export function PhotoDumpsterCard({
  size,
  ctaLink = '/#quote',
  ctaLabel = 'Get Quote',
  className,
  imageMode = 'photo',
}: PhotoDumpsterCardProps) {
  const photo = DUMPSTER_PHOTOS[size];
  const specs = DUMPSTER_SPECS[size];
  const isPopular = specs.popular;

  const imageSrc = imageMode === 'icon' ? dumpsterIcon : photo;
  const imageAlt =
    imageMode === 'icon'
      ? `${size} yard roll-off dumpster icon`
      : `${size} yard roll-off dumpster`;

  return (
    <div
      className={cn(
        'group relative bg-card rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl',
        isPopular
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-primary/30',
        className
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          POPULAR
        </div>
      )}

      {/* Photo Section */}
      <div className="relative aspect-[4/3] bg-gradient-to-b from-muted/30 to-muted/60 overflow-hidden">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className={cn(
            'w-full h-full object-contain transition-transform duration-500 group-hover:scale-105',
            // In icon mode the asset has lots of whitespace + a very light subject;
            // give it breathing room and a subtle shadow so it reads on the muted bg.
            imageMode === 'icon' && 'p-4 drop-shadow-sm'
          )}
        />

        {/* Overlays only for photo mode so the icon stays unobstructed */}
        {imageMode === 'photo' && (
          <>
            {/* Size Badge */}
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-background/95 backdrop-blur-sm rounded-lg shadow-sm">
              <span className="text-2xl font-black text-foreground">{size}</span>
              <span className="text-sm font-medium text-muted-foreground ml-1">YARD</span>
            </div>

            {/* Dimension Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-2 bg-background/90 backdrop-blur-sm rounded-lg text-xs">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">L: <span className="font-semibold text-foreground">{specs.length}</span></span>
                <span className="text-muted-foreground">W: <span className="font-semibold text-foreground">{specs.width}</span></span>
                <span className="text-muted-foreground">H: <span className="font-semibold text-foreground">{specs.height}</span></span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* In icon mode, move key labels below so the visual stays clean */}
        {imageMode === 'icon' && (
          <div className="flex items-end justify-between">
            <div className="leading-none">
              <span className="text-2xl font-black text-foreground">{size}</span>
              <span className="text-sm font-medium text-muted-foreground ml-1">YARD</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="mr-3">L: <span className="font-semibold text-foreground">{specs.length}</span></span>
              <span>H: <span className="font-semibold text-foreground">{specs.height}</span></span>
            </div>
          </div>
        )}

        {/* Specs Pills */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-md text-xs font-medium text-primary">
            <Weight className="w-3 h-3" />
            {specs.tons}T included
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground">
            <Truck className="w-3 h-3" />
            ≈ {specs.loads}
          </span>
        </div>

        {/* CTA */}
        <Button
          asChild
          variant={isPopular ? 'cta' : 'default'}
          size="sm"
          className="w-full"
        >
          <Link to={ctaLink}>
            {ctaLabel}
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

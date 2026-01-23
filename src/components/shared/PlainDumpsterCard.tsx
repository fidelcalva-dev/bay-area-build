import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Weight, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DumpsterSilhouettePlain } from './DumpsterSilhouettePlain';

// Canonical dimensions and data
export const DUMPSTER_SPECS = {
  6:  { lengthFt: 12, widthFt: 6, heightFt: 2.25, tonsIncluded: 0.5, pickupLoads: '2–3' },
  8:  { lengthFt: 12, widthFt: 6, heightFt: 3, tonsIncluded: 0.5, pickupLoads: '3–4' },
  10: { lengthFt: 12, widthFt: 7.5, heightFt: 3, tonsIncluded: 1, pickupLoads: '3–4' },
  20: { lengthFt: 18, widthFt: 7.5, heightFt: 4, tonsIncluded: 2, pickupLoads: '6–8' },
  30: { lengthFt: 18, widthFt: 7.5, heightFt: 6, tonsIncluded: 3, pickupLoads: '9–12' },
  40: { lengthFt: 22, widthFt: 7.5, heightFt: 8, tonsIncluded: 4, pickupLoads: '12–16' },
  50: { lengthFt: 24, widthFt: 7.5, heightFt: 7.5, tonsIncluded: 5, pickupLoads: '16–20' },
} as const;

export type DumpsterSizeYd = keyof typeof DUMPSTER_SPECS;

// CSS scale mapping for visual proportion
const SCALE_MAP: Record<DumpsterSizeYd, string> = {
  6:  'scale-x-[0.55] scale-y-[0.45]',
  8:  'scale-x-[0.55] scale-y-[0.55]',
  10: 'scale-x-[0.55] scale-y-[0.55]',
  20: 'scale-x-[0.82] scale-y-[0.72]',
  30: 'scale-x-[0.82] scale-y-[0.90]',
  40: 'scale-x-[1.00] scale-y-[1.00]',
  50: 'scale-x-[1.08] scale-y-[0.95]',
};

export interface PlainDumpsterCardProps {
  sizeYd: DumpsterSizeYd;
  description?: string;
  useCases?: string[];
  badge?: string;
  isPopular?: boolean;
  ctaLink?: string;
  ctaLabel?: string;
  variant?: 'general' | 'heavy';
  className?: string;
}

/**
 * Plain Dumpster Size Card with industrial silhouette
 * Uses consistent gray SVG with dimension overlays
 */
export function PlainDumpsterCard({
  sizeYd,
  description,
  useCases = [],
  badge,
  isPopular = false,
  ctaLink = '/pricing',
  ctaLabel,
  variant = 'general',
  className,
}: PlainDumpsterCardProps) {
  const specs = DUMPSTER_SPECS[sizeYd];
  const isHeavy = variant === 'heavy';

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
      {/* Badge */}
      {(isPopular || badge) && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg uppercase">
          {badge || 'Most Popular'}
        </div>
      )}

      {/* SVG Visual Section */}
      <div className="relative aspect-[4/3] bg-gradient-to-b from-muted/20 to-muted/60 p-4 overflow-hidden">
        {/* Silhouette with scale */}
        <div 
          className={cn(
            'w-full h-full flex items-center justify-center transition-transform duration-300 origin-center group-hover:scale-105',
            SCALE_MAP[sizeYd]
          )}
        >
          <DumpsterSilhouettePlain />
        </div>

        {/* Size Badge - Top Left */}
        <div className="absolute top-3 left-3 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-lg shadow-sm">
          <span className="text-2xl font-black text-foreground">{sizeYd}</span>
          <span className="text-sm font-medium text-muted-foreground ml-1">YARD</span>
        </div>

        {/* Dimension Labels Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          {/* Length */}
          <div className="px-2 py-1 bg-background/90 backdrop-blur-sm rounded text-xs font-medium text-muted-foreground">
            L: {specs.lengthFt}′
          </div>
          {/* Height */}
          <div className="px-2 py-1 bg-background/90 backdrop-blur-sm rounded text-xs font-medium text-muted-foreground">
            H: {specs.heightFt}′
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-5 space-y-4">
        {/* Stat Pills */}
        <div className="flex flex-wrap gap-2">
          <span className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
            isHeavy 
              ? 'bg-success/10 text-success' 
              : 'bg-primary/10 text-primary'
          )}>
            <Weight className="w-3.5 h-3.5" />
            {isHeavy ? 'Flat Fee' : `${specs.tonsIncluded}T included`}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-xs font-semibold text-muted-foreground">
            <Truck className="w-3.5 h-3.5" />
            ≈ {specs.pickupLoads} pickup loads
          </span>
        </div>

        {/* Dimensions Bar */}
        <div className="px-3 py-2 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{specs.lengthFt}′</span> L × 
          <span className="font-medium text-foreground ml-1">{specs.widthFt}′</span> W × 
          <span className="font-medium text-foreground ml-1">{specs.heightFt}′</span> H
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {/* Use Cases */}
        {useCases.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Perfect for
            </p>
            <ul className="space-y-1">
              {useCases.slice(0, 3).map((useCase) => (
                <li key={useCase} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    isHeavy ? 'bg-amber-500' : 'bg-primary'
                  )} />
                  {useCase}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <Button
          asChild
          variant={isPopular ? 'cta' : 'default'}
          className="w-full"
          size="lg"
        >
          <Link to={ctaLink}>
            {ctaLabel || `Choose ${sizeYd} Yard`}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

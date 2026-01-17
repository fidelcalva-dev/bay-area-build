import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Ruler, Weight, CheckCircle, Eye, EyeOff, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

// 3D render imports
import dumpster6yard from '@/assets/dumpsters/dumpster-6yard.png';
import dumpster6yardDims from '@/assets/dumpsters/dumpster-6yard-dims.png';
import dumpster8yard from '@/assets/dumpsters/dumpster-8yard.png';
import dumpster8yardDims from '@/assets/dumpsters/dumpster-8yard-dims.png';
import dumpster10yard from '@/assets/dumpsters/dumpster-10yard.png';
import dumpster10yardDims from '@/assets/dumpsters/dumpster-10yard-dims.png';
import dumpster20yard from '@/assets/dumpsters/dumpster-20yard.png';
import dumpster20yardDims from '@/assets/dumpsters/dumpster-20yard-dims.png';
import dumpster30yard from '@/assets/dumpsters/dumpster-30yard.png';
import dumpster30yardDims from '@/assets/dumpsters/dumpster-30yard-dims.png';
import dumpster40yard from '@/assets/dumpsters/dumpster-40yard.png';
import dumpster40yardDims from '@/assets/dumpsters/dumpster-40yard-dims.png';
import dumpster50yard from '@/assets/dumpsters/dumpster-50yard.png';
import dumpster50yardDims from '@/assets/dumpsters/dumpster-50yard-dims.png';

// Image map for dynamic loading
export const DUMPSTER_IMAGES: Record<number, { main: string; dims: string }> = {
  6: { main: dumpster6yard, dims: dumpster6yardDims },
  8: { main: dumpster8yard, dims: dumpster8yardDims },
  10: { main: dumpster10yard, dims: dumpster10yardDims },
  20: { main: dumpster20yard, dims: dumpster20yardDims },
  30: { main: dumpster30yard, dims: dumpster30yardDims },
  40: { main: dumpster40yard, dims: dumpster40yardDims },
  50: { main: dumpster50yard, dims: dumpster50yardDims },
};

export interface DumpsterSizeData {
  yards: number;
  dimensions: string;
  length: string;
  width: string;
  height: string;
  includedTons: number;
  useCases: string[];
  loads: string;
  description: string;
  priceFrom?: number;
  popular?: boolean;
}

interface DumpsterSizeCardProps {
  size: DumpsterSizeData;
  variant?: 'full' | 'compact' | 'preview';
  category?: 'heavy' | 'general';
  showDimensionToggle?: boolean;
  ctaLink?: string;
  ctaLabel?: string;
  className?: string;
}

/**
 * Canonical Dumpster Size Card component
 * Supports multiple variants for different contexts
 */
export function DumpsterSizeCard({
  size,
  variant = 'full',
  category = 'general',
  showDimensionToggle = true,
  ctaLink = '/pricing',
  ctaLabel,
  className,
}: DumpsterSizeCardProps) {
  const [showDims, setShowDims] = useState(false);
  const isHeavy = category === 'heavy';
  const images = DUMPSTER_IMAGES[size.yards];
  const accentColor = isHeavy ? 'text-amber-500' : 'text-primary';

  if (variant === 'preview') {
    return (
      <div
        className={cn(
          'group bg-card rounded-2xl border p-6 hover:shadow-card-hover transition-all duration-300',
          size.popular
            ? 'border-primary ring-1 ring-primary/20'
            : 'border-border hover:border-primary/30',
          className
        )}
      >
        {size.popular && (
          <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">
            Most Popular
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Package className="w-7 h-7" />
          </div>
          {size.priceFrom && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">From</div>
              <div className="text-2xl font-bold text-foreground">${size.priceFrom}</div>
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-1">{size.yards} Yard</h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Weight className="w-4 h-4" />
          <span>
            {size.includedTons}T included • {size.loads}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{size.description}</p>

        <Button
          asChild
          variant={size.popular ? 'default' : 'outline'}
          size="default"
          className="w-full"
        >
          <Link to={ctaLink}>{ctaLabel || `Choose ${size.yards} Yard`}</Link>
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'group bg-card rounded-xl border p-4 hover:shadow-md transition-all',
          size.popular ? 'border-primary' : 'border-border',
          className
        )}
      >
        <div className="flex items-center gap-4">
          {images && (
            <img
              src={images.main}
              alt={`${size.yards} yard dumpster`}
              className="w-20 h-16 object-contain"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{size.yards} Yard</span>
              {size.popular && (
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  POPULAR
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Weight className={cn('w-3.5 h-3.5', accentColor)} />
                {size.includedTons}T included
              </span>
              <span>•</span>
              <span>{size.loads}</span>
            </div>
          </div>
          {size.priceFrom && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">From</div>
              <div className="text-lg font-bold text-foreground">${size.priceFrom}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={cn(
        'group relative bg-card rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl',
        size.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30',
        className
      )}
    >
      {size.popular && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg">
          MOST POPULAR
        </div>
      )}

      {/* Image Section */}
      {images && (
        <div className="relative aspect-[4/3] bg-gradient-to-b from-muted/30 to-muted/80 p-6">
          <img
            src={showDims ? images.dims : images.main}
            alt={`${size.yards} yard dumpster${showDims ? ' with dimensions' : ''}`}
            className="w-full h-full object-contain transition-all duration-500 group-hover:scale-105"
          />

          {/* Dimension Toggle */}
          {showDimensionToggle && (
            <button
              onClick={() => setShowDims(!showDims)}
              className={cn(
                'absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                showDims
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/90 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background'
              )}
            >
              {showDims ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showDims ? 'Hide Dims' : 'Show Dims'}
            </button>
          )}

          {/* Size Badge */}
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-lg">
            <span className="text-2xl font-black text-foreground">{size.yards}</span>
            <span className="text-sm font-medium text-muted-foreground ml-1">YARD</span>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-5 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{size.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Weight className={cn('w-4 h-4', accentColor)} />
              <span className="text-lg font-bold text-foreground">{size.includedTons}T</span>
            </div>
            <p className="text-xs text-muted-foreground">Included</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Ruler className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{size.height}</span>
            </div>
            <p className="text-xs text-muted-foreground">Height</p>
          </div>
        </div>

        {/* Dimensions Bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 rounded-lg border border-border/50">
          <Ruler className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">L</span>
            <span className="font-medium text-foreground">{size.length}</span>
            <span className="text-muted-foreground">×</span>
            <span className="text-muted-foreground">W</span>
            <span className="font-medium text-foreground">{size.width}</span>
            <span className="text-muted-foreground">×</span>
            <span className="text-muted-foreground">H</span>
            <span className="font-medium text-foreground">{size.height}</span>
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Perfect for
          </p>
          <ul className="space-y-1.5">
            {size.useCases.map((useCase) => (
              <li key={useCase} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className={cn('w-4 h-4 shrink-0', accentColor)} />
                <span>{useCase}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Button
          asChild
          variant={size.popular ? 'cta' : 'default'}
          className="w-full mt-2"
          size="lg"
        >
          <Link to={ctaLink}>
            {ctaLabel || `Choose ${size.yards} Yard`}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

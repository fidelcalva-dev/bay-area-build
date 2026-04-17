/**
 * DumpsterSizeComparison
 * Visual side-by-side comparison of all dumpster sizes at the same scale,
 * so customers can instantly see how each size compares.
 *
 * - Horizontal scrollable on mobile (snap-x for smooth swiping)
 * - All sizes use DumpsterIllustration at the same vertical scale
 * - Highlights "Most Popular" (20yd)
 * - Bay Area focused copy
 */

import { Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DumpsterIllustration } from './DumpsterIllustration';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { BUSINESS_INFO } from '@/lib/seo';
import { cn } from '@/lib/utils';

const COMPARE_YARDS = [5, 8, 10, 20, 30, 40] as const;
const POPULAR_YARDS = 20;

// Reference heights in feet — used to keep relative scale across all sizes.
// These mirror DUMPSTER_SPECS.heightFt in DumpsterIllustration.
const HEIGHT_FT: Record<number, number> = {
  5: 2.25,
  8: 3,
  10: 3,
  20: 4,
  30: 6,
  40: 6,
};

// Pixel scale: feet × scale = component width (we feed `width` into DumpsterIllustration
// so the rendered height ends up proportional across sizes).
const FT_TO_WIDTH = 50;

export function DumpsterSizeComparison() {
  const sizes = DUMPSTER_SIZES_DATA.filter((s) => COMPARE_YARDS.includes(s.yards as any));

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-wide">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <h2 className="heading-lg text-foreground mb-3">
            Which size is right for your project?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Compare all sizes at a glance. Every size includes delivery, pickup, and 7-day rental
            across the Bay Area.
          </p>
        </div>

        {/* Mobile scroll indicator */}
        <div className="md:hidden text-center mb-3">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Scroll to compare
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Comparison row */}
        <div
          className="relative overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 -mx-4 px-4 md:mx-0 md:px-0"
          aria-label="Dumpster size comparison"
        >
          <div className="flex items-end gap-4 md:gap-6 min-w-max md:justify-center md:min-w-0">
            {sizes.map((size) => {
              const isPopular = size.yards === POPULAR_YARDS;
              const heightFt = HEIGHT_FT[size.yards] ?? 4;
              // Width derived from physical height keeps all containers at the same scale.
              const illustrationWidth = Math.round(heightFt * FT_TO_WIDTH) + 80;

              return (
                <div
                  key={size.yards}
                  className={cn(
                    'snap-center flex-shrink-0 flex flex-col items-center text-center relative',
                    'w-[160px] md:w-auto'
                  )}
                >
                  {/* Most Popular pointer */}
                  {isPopular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide shadow-md whitespace-nowrap">
                        ★ Most Popular
                      </div>
                    </div>
                  )}

                  {/* Illustration container — fixed bottom alignment so smaller dumpsters sit on the same baseline */}
                  <div
                    className={cn(
                      'flex items-end justify-center w-full',
                      'h-[180px] md:h-[240px]',
                      isPopular && 'pt-4'
                    )}
                  >
                    <DumpsterIllustration
                      yards={size.yards}
                      width={illustrationWidth}
                      showDimensions={false}
                      showHuman={false}
                      className="max-h-full w-auto"
                    />
                  </div>

                  {/* Label + price */}
                  <div
                    className={cn(
                      'mt-3 px-3 py-2 rounded-xl border w-full',
                      isPopular
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card'
                    )}
                  >
                    <div className="text-base md:text-lg font-bold text-foreground">
                      {size.yards} Yard
                    </div>
                    <div className="text-[11px] md:text-xs text-muted-foreground mb-1.5 leading-tight">
                      {size.height} tall
                    </div>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      From ${size.priceFrom}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scale reference note */}
        <p className="text-center text-xs text-muted-foreground mt-2 mb-8">
          All sizes shown to scale for accurate comparison.
        </p>

        {/* CTA */}
        <div className="text-center bg-card border border-border rounded-2xl p-5 md:p-6 max-w-xl mx-auto">
          <p className="text-sm md:text-base text-foreground mb-3">
            Not sure which size? Call{' '}
            <a
              href={`tel:${BUSINESS_INFO.phone.sales}`}
              className="font-semibold text-primary hover:underline"
            >
              {BUSINESS_INFO.phone.salesFormatted}
            </a>{' '}
            — we'll recommend the right size for free.
          </p>
          <Button asChild variant="cta" size="lg">
            <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
              <Phone className="w-4 h-4" />
              Call for free size advice
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

// V3 Step 4 — Recommended Size Selection
import {
  ChevronRight, Clock, Truck, Calendar, Scale, Star, Info,
  Navigation, Zap, Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DUMPSTER_PHOTO_MAP } from '@/lib/canonicalDumpsterImages';
import { INCLUDED_TONS_BY_SIZE } from '@/lib/shared-data';
import { AvailabilityMeter } from '../components/AvailabilityMeter';
import {
  HEAVY_SIZE_NOTE, HEAVY_FILL_LINE_TITLE, HEAVY_FILL_LINE_DESC, FLAT_FEE_LABEL,
} from '../copy';
import { StepTransition, BackButton } from './shared';
import type { SizeStepProps } from './types';

export function SizeStep({
  size, recommendedSize, availableSizes, alternativeSizes,
  isHeavy, selectedProject, customerType, etaDisplay, availability,
  showUpsellNudge, onSizeSelect, onAcceptUpsell, onDeclineUpsell, goBack,
}: SizeStepProps) {
  return (
    <StepTransition stepKey="size">
      <div className="space-y-5">
        <BackButton onClick={goBack} />

        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            Recommended Size
          </h4>
          <p className="text-sm text-muted-foreground">
            {selectedProject?.label} {isHeavy ? `— ${HEAVY_SIZE_NOTE}` : ''}
          </p>
        </div>

        {/* Urgency bar */}
        {availability.sameDayLikely && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
            <Zap className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs font-semibold text-primary">
              Same-day delivery available — limited slots remaining
            </p>
          </div>
        )}

        {/* Contractor perks banner */}
        {customerType === 'contractor' && (
          <div className="rounded-xl bg-muted/40 border border-border/60 p-3.5">
            <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">Contractor Benefits</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center text-center gap-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground font-medium">Priority Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground font-medium">Volume Pricing</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground font-medium">Dedicated Support</span>
              </div>
            </div>
          </div>
        )}

        {/* Hero card — recommended size */}
        <button
          onClick={() => onSizeSelect(recommendedSize)}
          className={cn(
            'w-full rounded-2xl border-2 transition-all duration-150 relative overflow-hidden text-left',
            size === recommendedSize ? 'border-primary shadow-md' : 'border-primary/30 hover:border-primary hover:shadow-sm'
          )}
        >
          <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wider">
              <Star className="w-3 h-3" />
              {recommendedSize === 20 ? 'Best Value' : 'Recommended'}
            </span>
            {recommendedSize === 20 && (
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Most Popular
              </span>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-16 flex items-center justify-center shrink-0">
                {DUMPSTER_PHOTO_MAP[recommendedSize] && (
                  <img
                    src={DUMPSTER_PHOTO_MAP[recommendedSize]}
                    alt={`${recommendedSize} yard dumpster`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {recommendedSize} <span className="text-sm font-normal text-muted-foreground">Yard</span>
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Truck className="w-3 h-3 text-primary" /> Delivery & Pickup
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-primary" /> 7 Days Rental
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Scale className="w-3 h-3 text-primary" />
                    {isHeavy
                      ? FLAT_FEE_LABEL
                      : `${INCLUDED_TONS_BY_SIZE[recommendedSize] || 2} Tons Included`}
                  </p>
                </div>
                {etaDisplay && (
                  <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Est. delivery: {etaDisplay}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-primary shrink-0" />
            </div>
          </div>
        </button>

        {/* Info note */}
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
          <span>
            {isHeavy
              ? `${HEAVY_FILL_LINE_TITLE}. ${HEAVY_FILL_LINE_DESC.split('.')[0]}.`
              : `Based on typical ${selectedProject?.label?.toLowerCase() || 'project'} volume. Most customers pick this size.`}
          </span>
        </div>

        {/* Alternatives */}
        {(alternativeSizes.smaller || alternativeSizes.larger) && (
          <div className="grid grid-cols-2 gap-3">
            {alternativeSizes.smaller && (
              <button
                onClick={() => onSizeSelect(alternativeSizes.smaller!)}
                className={cn(
                  'p-4 rounded-xl border text-center transition-all duration-150',
                  size === alternativeSizes.smaller ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
                )}
              >
                <div className="w-full h-10 flex items-center justify-center mb-2">
                  {DUMPSTER_PHOTO_MAP[alternativeSizes.smaller!] && (
                    <img src={DUMPSTER_PHOTO_MAP[alternativeSizes.smaller!]} alt="" className="h-full object-contain" loading="lazy" />
                  )}
                </div>
                <p className="text-xl font-bold text-foreground">{alternativeSizes.smaller}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mt-0.5">Yard</p>
                <p className="text-[10px] text-muted-foreground mt-1">Good for small projects</p>
              </button>
            )}
            {alternativeSizes.larger && (
              <button
                onClick={() => onSizeSelect(alternativeSizes.larger!)}
                className={cn(
                  'p-4 rounded-xl border text-center transition-all duration-150',
                  size === alternativeSizes.larger ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
                )}
              >
                <div className="w-full h-10 flex items-center justify-center mb-2">
                  {DUMPSTER_PHOTO_MAP[alternativeSizes.larger!] && (
                    <img src={DUMPSTER_PHOTO_MAP[alternativeSizes.larger!]} alt="" className="h-full object-contain" loading="lazy" />
                  )}
                </div>
                <p className="text-xl font-bold text-foreground">{alternativeSizes.larger}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mt-0.5">Yard</p>
                <p className="text-[10px] text-muted-foreground mt-1">For large jobs</p>
              </button>
            )}
          </div>
        )}

        {/* Upsell nudge: 10yd → 20yd */}
        {showUpsellNudge && !isHeavy && (
          <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">Upgrade to 20 Yard?</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  More space for your project. Less risk of overflow. Better value per cubic yard.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="cta"
                size="sm"
                className="rounded-xl text-xs font-semibold"
                onClick={onAcceptUpsell}
              >
                Yes, upgrade to 20 yd
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-semibold"
                onClick={onDeclineUpsell}
              >
                Keep 10 yd
              </Button>
            </div>
          </div>
        )}

        {/* Heavy fill-line warning */}
        {isHeavy && (
          <div className="rounded-xl bg-muted/40 border border-border/60 p-4">
            <div className="flex items-start gap-3">
              <Scale className="w-4 h-4 mt-0.5 shrink-0 text-foreground" />
              <div>
                <p className="font-semibold text-foreground text-sm">{HEAVY_FILL_LINE_TITLE}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{HEAVY_FILL_LINE_DESC}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StepTransition>
  );
}

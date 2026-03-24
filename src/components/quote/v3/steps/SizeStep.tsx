// V3 Step 4 — Redesigned Size Selection (selling cards with badges)
import {
  ChevronRight, Clock, Truck, Calendar, Scale, Star, Info,
  Navigation, Zap, Phone, Shield,
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

// Best-for guidance per size
const SIZE_GUIDANCE: Record<number, { bestFor: string; capacity: string }> = {
  5: { bestFor: 'Small cleanouts, single-room projects', capacity: '~2 pickup truck loads' },
  8: { bestFor: 'Bathroom remodel, small garage cleanup', capacity: '~3 pickup truck loads' },
  10: { bestFor: 'Deck removal, basement cleanout', capacity: '~4 pickup truck loads' },
  20: { bestFor: 'Kitchen remodel, whole-room renovation', capacity: '~8 pickup truck loads' },
  30: { bestFor: 'Roofing, large remodel, construction', capacity: '~12 pickup truck loads' },
  40: { bestFor: 'Full demo, commercial cleanout', capacity: '~16 pickup truck loads' },
  50: { bestFor: 'Major construction, warehouse cleanout', capacity: '~20 pickup truck loads' },
};

function getSizeBadge(size: number, recommendedSize: number, alternativeSizes: { smaller?: number; larger?: number }) {
  if (size === recommendedSize) return { label: 'Recommended', variant: 'primary' as const };
  if (size === alternativeSizes.smaller) return { label: 'Budget-Friendly', variant: 'secondary' as const };
  if (size === alternativeSizes.larger) return { label: 'More Capacity', variant: 'secondary' as const };
  return null;
}

export function SizeStep({
  size, recommendedSize, availableSizes, alternativeSizes,
  isHeavy, selectedProject, customerType, etaDisplay, availability,
  showUpsellNudge, onSizeSelect, onAcceptUpsell, onDeclineUpsell, goBack,
}: SizeStepProps) {
  // Show recommended + alternatives as selling cards
  const displaySizes = [
    alternativeSizes.smaller,
    recommendedSize,
    alternativeSizes.larger,
  ].filter((s): s is number => s !== undefined && availableSizes.includes(s));

  return (
    <StepTransition stepKey="size">
      <div className="space-y-5">
        <BackButton onClick={goBack} />

        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            Choose Your Dumpster Size
          </h4>
          <p className="text-sm text-muted-foreground">
            {selectedProject?.label ? `For ${selectedProject.label}` : 'Based on your project'}{isHeavy ? ` — ${HEAVY_SIZE_NOTE}` : ''}
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

        {/* Size selling cards */}
        <div className="space-y-3">
          {displaySizes.map((s) => {
            const badge = getSizeBadge(s, recommendedSize, alternativeSizes);
            const isRecommended = s === recommendedSize;
            const guidance = SIZE_GUIDANCE[s];
            const isSelected = size === s;

            return (
              <button
                key={s}
                onClick={() => onSizeSelect(s)}
                className={cn(
                  'w-full rounded-2xl border-2 transition-all duration-150 relative overflow-hidden text-left',
                  isRecommended
                    ? isSelected ? 'border-primary shadow-md' : 'border-primary/30 hover:border-primary hover:shadow-sm'
                    : isSelected ? 'border-primary shadow-sm' : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
                )}
              >
                {/* Badge header */}
                {badge && (
                  <div className={cn(
                    'px-4 py-2 border-b flex items-center justify-between',
                    isRecommended ? 'bg-primary/5 border-primary/10' : 'bg-muted/30 border-border/50'
                  )}>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider',
                      isRecommended ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {isRecommended && <Star className="w-3 h-3" />}
                      {badge.label}
                    </span>
                    {isRecommended && s === 20 && (
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-16 flex items-center justify-center shrink-0">
                      {DUMPSTER_PHOTO_MAP[s] && (
                        <img
                          src={DUMPSTER_PHOTO_MAP[s]}
                          alt={`${s} yard dumpster`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-foreground tracking-tight">
                        {s} <span className="text-sm font-normal text-muted-foreground">Yard</span>
                      </p>
                      <div className="mt-1.5 space-y-1">
                        {guidance && (
                          <p className="text-xs text-foreground font-medium">{guidance.bestFor}</p>
                        )}
                        {guidance && (
                          <p className="text-[11px] text-muted-foreground">{guidance.capacity}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Truck className="w-3 h-3 text-primary" /> Delivery & Pickup
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Scale className="w-3 h-3 text-primary" />
                            {isHeavy
                              ? FLAT_FEE_LABEL
                              : `${INCLUDED_TONS_BY_SIZE[s] || 2}T included`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-primary shrink-0" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Show all sizes link */}
        {availableSizes.length > displaySizes.length && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Other sizes available:</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.filter(s => !displaySizes.includes(s)).map(s => (
                <button
                  key={s}
                  onClick={() => onSizeSelect(s)}
                  className={cn(
                    'px-4 py-2 rounded-xl border text-sm font-semibold transition-all',
                    size === s
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border/60 text-muted-foreground hover:border-primary/40'
                  )}
                >
                  {s} yd
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
          <span>
            {isHeavy
              ? `${HEAVY_FILL_LINE_TITLE}. ${HEAVY_FILL_LINE_DESC.split('.')[0]}.`
              : 'Not sure about the size? Pick the recommended — most customers find it just right. You can always call us for help.'}
          </span>
        </div>

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
              <Button variant="cta" size="sm" className="rounded-xl text-xs font-semibold" onClick={onAcceptUpsell}>
                Yes, upgrade to 20 yd
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold" onClick={onDeclineUpsell}>
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

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-4 py-1">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
            <Shield className="w-3 h-3 text-primary" />
            No hidden fees
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
            <Phone className="w-3 h-3 text-primary" />
            Need help? Call us
          </span>
        </div>
      </div>
    </StepTransition>
  );
}

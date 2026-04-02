// V3 Step 6 — Price Moment (with Phase A: rental day selector)
import {
  ChevronLeft, ChevronRight, CheckCircle, Shield, Clock, Truck,
  Warehouse, Scale, Star, Zap, RotateCcw, Phone, MessageSquare, Loader2, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AvailabilityMeter } from '../components/AvailabilityMeter';
import { ServiceCycleBar } from '../components/ServiceCycleBar';
import { ServiceTimeBreakdown } from '../ServiceTimeBreakdown';
import {
  getPriceMomentCopy, HEAVY_MATERIAL_STRUCTURE, LIVE_LOAD_POLICY,
  SWAP_ACTIVE, SWAP_PROMPT, DELIVERY_TIME_FALLBACK,
} from '../copy';
import { StepTransition, BackButton } from './shared';
import type { PriceStepProps } from './types';

const RENTAL_OPTIONS = [
  { days: 3, label: '1–3 Days', extraCost: 0, note: 'Short project' },
  { days: 7, label: '7 Days', extraCost: 0, note: 'Standard', popular: true },
  { days: 10, label: '10 Days', extraCost: 45, note: '+3 extra days' },
  { days: 14, label: '14 Days', extraCost: 105, note: '+7 extra days' },
];

export function PriceStep({
  quote, size, getSizeLabel, customerType, isHeavy,
  wantsSwap, setWantsSwap, serviceTime, availability, etaDisplay,
  showInternalBreakdown, capturePartialLead, rentalDays, setRentalDays,
  goNext, goBack,
}: PriceStepProps) {
  if (!quote.isValid) {
    return (
      <StepTransition stepKey="price-fallback">
        <div className="space-y-5">
          <BackButton onClick={goBack} />
          <div className="p-6 rounded-xl bg-muted/30 border border-border/60 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-3" />
            <p className="font-semibold text-foreground">Calculating your price...</p>
            <p className="text-sm text-muted-foreground mt-1">
              We'll confirm pricing after reviewing your location.
            </p>
          </div>
          <Button variant="outline" className="w-full rounded-xl" onClick={goBack}>
            <ChevronLeft className="w-4 h-4" /> Go Back
          </Button>
        </div>
      </StepTransition>
    );
  }

  const copy = getPriceMomentCopy(customerType, isHeavy, quote.includedTons);
  const items = isHeavy ? copy.heavy.includedItems : copy.general.includedItems;

  return (
    <StepTransition stepKey="price">
      <div className="space-y-5">
        <BackButton onClick={goBack} />

        {/* Price card */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-md overflow-hidden">
          {/* Price hero */}
          <div className="p-6 text-center bg-gradient-to-b from-muted/20 to-transparent">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Your Price Range
            </p>
            <div className="text-5xl font-bold text-foreground tracking-tight">
              ${quote.subtotal.toLocaleString()} — ${quote.subtotalHigh.toLocaleString()}
            </div>
            <div className="mt-3 space-y-0.5">
              <p className="text-sm text-foreground font-medium">{getSizeLabel()} Dumpster</p>
              <p className="text-xs text-muted-foreground">
                {rentalDays}-Day Rental — Delivery & Pickup Included
              </p>
            </div>
          </div>

          {/* Rental Duration Selector — Phase A */}
          <div className="px-5 py-4 border-t border-border/50">
            <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Rental Period
            </p>
            <div className="grid grid-cols-4 gap-2">
              {RENTAL_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => setRentalDays(opt.days)}
                  className={cn(
                    'p-2.5 rounded-xl border text-center transition-all duration-150 relative',
                    rentalDays === opt.days
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/60 hover:border-primary/40'
                  )}
                >
                  {opt.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      Standard
                    </span>
                  )}
                  <p className="text-xs font-bold text-foreground">{opt.label}</p>
                  {opt.extraCost > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">+${opt.extraCost}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Included breakdown */}
          <div className="px-5 py-4 border-t border-border/50">
            <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-3">Included</p>
            <div className="space-y-2.5">
              {items.map((label, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Overage / Heavy rules */}
          {!quote.isFlatFee && (
            <div className="px-5 py-3 border-t border-border/50 bg-muted/20">
              <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-1">Overage</p>
              <p className="text-xs text-muted-foreground">{copy.general.overageNote}</p>
            </div>
          )}
          {isHeavy && (
            <div className="px-5 py-3 border-t border-border/50 bg-muted/20">
              <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">{HEAVY_MATERIAL_STRUCTURE.title}</p>
              <div className="space-y-1.5">
                {HEAVY_MATERIAL_STRUCTURE.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Scale className="w-3 h-3 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Cycle */}
          {serviceTime && (
            <div className="px-5 py-4 border-t border-border/50">
              <ServiceCycleBar
                estimate={serviceTime}
                showInternalLink={showInternalBreakdown}
                onToggleInternal={() => {
                  const el = document.getElementById('internal-breakdown');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                Service times are estimated and may vary based on traffic conditions, facility wait times, and on-site access.
              </p>
              {showInternalBreakdown && (
                <div id="internal-breakdown" className="mt-4">
                  <ServiceTimeBreakdown estimate={serviceTime} />
                </div>
              )}
            </div>
          )}

          {/* Availability Meter */}
          <div className="px-5 py-4 border-t border-border/50">
            <AvailabilityMeter
              confidence={availability.confidence}
              sameDayLikely={availability.sameDayLikely}
              loading={availability.loading}
            />
            <div className="mt-3 space-y-1.5">
              {availability.confidence === 'limited' && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  Limited availability in your area today
                </p>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Star className="w-3 h-3 text-primary" />
                Trusted by Bay Area homeowners and contractors since 2009
              </p>
            </div>
          </div>

          {/* Fallback if no service time data */}
          {!serviceTime && (
            <div className="px-5 py-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {etaDisplay ? `Delivery ETA: ${etaDisplay}` : DELIVERY_TIME_FALLBACK}
              </div>
            </div>
          )}

          {/* Swap */}
          <div className="px-5 py-3 border-t border-border/50">
            <button
              onClick={() => setWantsSwap(!wantsSwap)}
              className={cn(
                'flex items-center gap-2.5 w-full text-left text-xs rounded-lg p-2 -m-1 transition-colors duration-150',
                wantsSwap ? 'bg-primary/5 text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <RotateCcw className={cn('w-4 h-4 shrink-0', wantsSwap ? 'text-primary' : '')} />
              <span className="flex-1">{wantsSwap ? SWAP_ACTIVE : SWAP_PROMPT}</span>
              {wantsSwap && <CheckCircle className="w-3.5 h-3.5 text-success" />}
            </button>
          </div>

          {/* Live Load Policy */}
          {customerType === 'contractor' && (
            <div className="px-5 py-3 border-t border-border/50 bg-muted/20">
              <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">{LIVE_LOAD_POLICY.title}</p>
              <div className="space-y-1.5">
                {LIVE_LOAD_POLICY.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic">{LIVE_LOAD_POLICY.disclaimer}</p>
            </div>
          )}

          {/* Trust footer */}
          <div className="px-5 py-3 border-t border-border/50 bg-muted/20">
            <div className="flex items-center justify-center gap-5">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                <Warehouse className="w-3 h-3 text-primary" />
                Real local yard
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                <Shield className="w-3 h-3 text-primary" />
                Transparent pricing
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="cta"
          size="lg"
          className="w-full h-14 rounded-xl text-base font-semibold"
          onClick={goNext}
        >
          Continue Booking
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>

        {/* Follow-up options */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="default"
            className="rounded-xl text-xs"
            onClick={() => {
              capturePartialLead('text_quote_request');
            }}
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Text Me This Quote
          </Button>
          <Button
            variant="outline"
            size="default"
            className="rounded-xl text-xs"
            onClick={() => {
              capturePartialLead('call_request');
              window.open('tel:+15106802150', '_blank');
            }}
          >
            <Phone className="w-4 h-4 mr-1.5" />
            Call Me to Confirm
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          You'll review everything before confirming. No hidden fees.
        </p>
      </div>
    </StepTransition>
  );
}

// V3 Step 8 — Confirm / Order Summary (with Phase A: notes + rental days display)
import {
  CheckCircle, Shield, Clock, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getStepTitles, getButtons } from '../copy';
import { StepTransition, BackButton } from './shared';
import type { ConfirmStepProps } from './types';

export function ConfirmStep({
  quote, size, getSizeLabel, selectedProject, isHeavy,
  customerName, customerPhone, customerEmail, customerNotes, companyName,
  zip, addressResult, distanceCalc, accessData,
  termsAccepted, setTermsAccepted, isSubmitting, onConfirm,
  rentalDays, wantsSwap, goBack,
}: ConfirmStepProps) {
  return (
    <StepTransition stepKey="confirm">
      <div className="space-y-5">
        <BackButton onClick={goBack} />

        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            {getStepTitles().CONFIRM_STEP_TITLE}
          </h4>
          <p className="text-sm text-muted-foreground">{getButtons().CONFIRM_HELP}</p>
        </div>

        {/* Quote Summary */}
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {/* Dumpster Details */}
          <div className="p-4 border-b border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Dumpster Details</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dumpster Size</span>
                <span className="font-semibold text-foreground">{getSizeLabel()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Project Type</span>
                <span className="font-semibold text-foreground">{selectedProject?.label || 'General'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Material</span>
                <span className="font-semibold text-foreground">{isHeavy ? 'Heavy Material' : 'General Debris'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rental Period</span>
                <span className="font-semibold text-foreground">{rentalDays} days</span>
              </div>
              {!quote.isFlatFee && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weight Included</span>
                  <span className="font-semibold text-foreground">{quote.includedTons} tons</span>
                </div>
              )}
              {wantsSwap && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Swap Requested</span>
                  <span className="font-semibold text-primary">Yes</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="p-4 border-b border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Location</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ZIP Code</span>
                <span className="font-semibold text-foreground">{zip}</span>
              </div>
              {addressResult?.formattedAddress && (
                <div className="flex justify-between text-sm gap-4">
                  <span className="text-muted-foreground shrink-0">Address</span>
                  <span className="font-semibold text-foreground text-right">{addressResult.formattedAddress}</span>
                </div>
              )}
              {distanceCalc.distance && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nearest Yard</span>
                  <span className="font-semibold text-foreground">{distanceCalc.distance.yard.name} ({distanceCalc.distance.distanceMiles.toFixed(1)} mi)</span>
                </div>
              )}
              {accessData?.placementType && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Placement</span>
                  <span className="font-semibold text-foreground capitalize">{accessData.placementType}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 border-b border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Pricing</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span className="text-foreground">${quote.subtotal.toLocaleString()} — ${quote.subtotalHigh.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-success" /> Delivery & Pickup
                </span>
                <span className="text-success text-xs font-medium">Included</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-success" /> Disposal
                </span>
                <span className="text-success text-xs font-medium">Included</span>
              </div>
              {!quote.isFlatFee && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-success" /> {quote.includedTons}T Weight Allowance
                    </span>
                    <span className="text-success text-xs font-medium">Included</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
                    <span>Overage rate</span>
                    <span>$165/ton beyond {quote.includedTons}T</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="px-4 py-3 bg-primary/5 flex justify-between items-center">
            <span className="font-bold text-foreground">Total Estimate</span>
            <span className="font-bold text-foreground text-2xl">${quote.subtotal.toLocaleString()} — ${quote.subtotalHigh.toLocaleString()}</span>
          </div>
        </div>

        {/* Contact summary */}
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Contact</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-semibold text-foreground">{customerName}</span>
              </div>
              {companyName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-semibold text-foreground">{companyName}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-semibold text-foreground">{customerPhone}</span>
              </div>
              {customerEmail && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-semibold text-foreground">{customerEmail}</span>
                </div>
              )}
            </div>
          </div>
          {/* Customer notes display */}
          {customerNotes && (
            <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Customer Notes</p>
              <p className="text-xs text-foreground leading-relaxed">{customerNotes}</p>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/50">
          <Checkbox
            id="terms-v3"
            checked={termsAccepted}
            onCheckedChange={(c) => setTermsAccepted(c === true)}
            className="mt-0.5"
          />
          <label htmlFor="terms-v3" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
            {getButtons().TERMS_TEXT}
          </label>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 py-2">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
            <Shield className="w-3 h-3 text-primary" />
            Licensed & Insured
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
            <Clock className="w-3 h-3 text-primary" />
            15-min response
          </span>
        </div>

        <Button
          variant="cta"
          size="lg"
          className="w-full h-14 rounded-xl text-base font-semibold"
          onClick={onConfirm}
          disabled={isSubmitting || !customerName || !customerPhone || !termsAccepted}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {getButtons().PROCESSING}
            </>
          ) : (
            getButtons().CONFIRM_ORDER
          )}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center">{getButtons().CONFIRM_FINEPRINT}</p>
        <p className="text-[11px] text-muted-foreground text-center">
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Privacy Policy</a>
          {' · '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Terms of Service</a>
        </p>
      </div>
    </StepTransition>
  );
}

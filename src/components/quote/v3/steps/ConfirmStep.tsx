// V3 Step 9 — Proposal Summary / Confirm
import {
  CheckCircle, Shield, Clock, Loader2, RotateCcw, Zap, MapPin, Building, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getStepTitles, getButtons } from '../copy';
import { StepTransition, BackButton } from './shared';
import type { ConfirmStepProps } from './types';
import type { ServiceOptions } from './ServiceCustomizationStep';

interface ExtendedConfirmStepProps extends ConfirmStepProps {
  serviceOptions?: ServiceOptions;
  selectedMaterialLabel?: string;
}

export function ConfirmStep({
  quote, size, getSizeLabel, selectedProject, isHeavy,
  customerName, customerPhone, customerEmail, customerNotes, companyName,
  zip, addressResult, distanceCalc, accessData,
  termsAccepted, setTermsAccepted, isSubmitting, onConfirm,
  rentalDays, wantsSwap, goBack,
  serviceOptions, selectedMaterialLabel,
}: ExtendedConfirmStepProps) {
  const hasExtras = wantsSwap || serviceOptions?.wantsSameDay || serviceOptions?.specialPlacement || serviceOptions?.requiredDumpSite;

  return (
    <StepTransition stepKey="confirm">
      <div className="space-y-5">
        <BackButton onClick={goBack} />

        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            Your Proposal Summary
          </h4>
          <p className="text-sm text-muted-foreground">Review everything before confirming. No hidden fees.</p>
        </div>

        {/* Quote Summary Card */}
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {/* Line Item: Dumpster */}
          <div className="p-4 border-b border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Service Details</p>
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
                <span className="font-semibold text-foreground">{selectedMaterialLabel || (isHeavy ? 'Heavy Material' : 'General Debris')}</span>
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
            </div>
          </div>

          {/* Extras / Service Options */}
          {hasExtras && (
            <div className="p-4 border-b border-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Additional Services</p>
              <div className="space-y-2">
                {wantsSwap && (
                  <div className="flex items-center gap-2 text-sm">
                    <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-foreground">Swap — Dump & Return</span>
                  </div>
                )}
                {serviceOptions?.wantsSameDay && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-foreground">Same-Day Delivery Requested</span>
                  </div>
                )}
                {serviceOptions?.specialPlacement && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-foreground">Special Placement Needed</span>
                  </div>
                )}
                {serviceOptions?.requiredDumpSite && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-foreground">Required Dump Site: {serviceOptions.requiredDumpSite}</span>
                  </div>
                )}
              </div>
            </div>
          )}

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
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Customer Notes
              </p>
              <p className="text-xs text-foreground leading-relaxed">{customerNotes}</p>
            </div>
          )}
        </div>

        {/* Key Policies */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Key Policies</p>
          <p className="text-[11px] text-muted-foreground">• Standard {rentalDays}-day rental. Extra days at $15/day.</p>
          {!quote.isFlatFee && (
            <p className="text-[11px] text-muted-foreground">• Overage: $165/ton beyond included {quote.includedTons}T.</p>
          )}
          <p className="text-[11px] text-muted-foreground">• Do not exceed fill line. No hazardous materials.</p>
          <p className="text-[11px] text-muted-foreground">• Final price confirmed after location and material review.</p>
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

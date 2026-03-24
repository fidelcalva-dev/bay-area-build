// V3 Step 1 — ZIP / Address Entry
import {
  MapPin, ChevronRight, Loader2, CheckCircle, Clock, Warehouse,
  Award, Shield, Zap, Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AddressAutocomplete } from '../AddressAutocomplete';
import { AvailabilityMeter } from '../components/AvailabilityMeter';
import { ZIP_NOT_SERVICEABLE } from '../copy';
import { StepTransition } from './shared';
import type { ZipStepProps } from './types';

function TrustBlock({ className }: { className?: string }) {
  const items = [
    { icon: Shield, label: 'Licensed & Insured' },
    { icon: Warehouse, label: 'Real Local Yard' },
    { icon: Zap, label: 'Transparent Pricing' },
    { icon: Clock, label: 'Same-Day Available' },
  ];
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {items.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/50"
        >
          <Icon className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-medium text-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function ZipStep({
  zip, setZip, useAddress, setUseAddress, addressResult, setAddressResult,
  urlAddress, isCheckingZip, zoneResult, distanceCalc, etaDisplay, availability,
  autoDetectCityName, goNext,
}: ZipStepProps) {
  return (
    <StepTransition stepKey="zip">
      <div className="space-y-5">
        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            Where do you need service?
          </h4>
          <p className="text-sm text-muted-foreground">
            We automatically match you to the nearest local yard.
          </p>
        </div>

        {!useAddress ? (
          <>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                placeholder="Enter ZIP code"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                className="h-14 pl-12 text-lg font-semibold rounded-xl border-border/60 focus:border-primary"
                autoFocus
              />
              {isCheckingZip && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
              )}
            </div>
            <button
              type="button"
              onClick={() => { setUseAddress(true); setZip(''); }}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              Enter full address instead
            </button>
          </>
        ) : (
          <>
            <AddressAutocomplete
              initialValue={urlAddress}
              onAddressSelect={(result) => {
                setAddressResult(result);
                if (result.zip) setZip(result.zip);
              }}
              onClear={() => setAddressResult(null)}
            />
            {addressResult && (
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={addressResult.zip}
                  readOnly
                  className="h-11 pl-11 text-sm font-medium rounded-xl border-border/40 bg-muted/30 text-muted-foreground cursor-default"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => { setUseAddress(false); setAddressResult(null); }}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              Use ZIP code instead
            </button>
          </>
        )}

        {/* Yard match result */}
        {zoneResult && (
          <div className="rounded-xl bg-card border border-border/60 shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {addressResult?.city || autoDetectCityName || zoneResult.cityName || zoneResult.zoneName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {addressResult ? 'Address verified' : 'Service area confirmed'}
                  </p>
                </div>
              </div>
              {distanceCalc.distance && (
                <div className="space-y-2 pl-11">
                  <div className="flex items-center gap-2 text-xs text-foreground">
                    <Warehouse className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-medium">{distanceCalc.distance.yard.name}</span>
                    <span className="text-muted-foreground">({distanceCalc.distance.distanceMiles.toFixed(1)} mi)</span>
                  </div>
                  {etaDisplay && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Estimated delivery: {etaDisplay}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-4 py-2.5 bg-muted/30 border-t border-border/50">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Award className="w-3 h-3 text-primary shrink-0" />
                Local yard selected for faster delivery
              </p>
            </div>
          </div>
        )}

        {/* Availability Meter */}
        {zoneResult && distanceCalc.distance && (
          <AvailabilityMeter
            confidence={availability.confidence}
            sameDayLikely={availability.sameDayLikely}
            loading={availability.loading}
          />
        )}

        {zip.length === 5 && !zoneResult && !isCheckingZip && (
          <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-sm text-destructive">
            {ZIP_NOT_SERVICEABLE}
          </div>
        )}

        <TrustBlock />

        <Button
          variant="cta"
          size="lg"
          className="w-full h-14 rounded-xl text-base font-semibold"
          onClick={goNext}
          disabled={zip.length !== 5 || !zoneResult || isCheckingZip}
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </StepTransition>
  );
}

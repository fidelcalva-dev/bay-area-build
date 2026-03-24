// V3 Step 5 — Service Customization
import {
  Plus, RotateCcw, Calendar, Scale, MapPin, Camera,
  MessageSquare, Zap, Building, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { StepTransition, BackButton } from './shared';
import { useState } from 'react';

export interface ServiceOptions {
  wantsSwap: boolean;
  wantsDumpAndReturn: boolean;
  wantsSameDay: boolean;
  specialPlacement: boolean;
  accessLimitation: boolean;
  requiredDumpSite: string;
  customerNotes: string;
}

interface ServiceCustomizationStepProps {
  serviceOptions: ServiceOptions;
  onUpdate: (opts: Partial<ServiceOptions>) => void;
  rentalDays: number;
  setRentalDays: (d: number) => void;
  isHeavy: boolean;
  goNext: () => void;
  goBack: () => void;
}

const RENTAL_OPTIONS = [
  { days: 3, label: '1–3 Days', note: 'Short project' },
  { days: 7, label: '7 Days', note: 'Standard', popular: true },
  { days: 10, label: '10 Days', note: '+3 extra days' },
  { days: 14, label: '14 Days', note: '+7 extra days' },
];

export function ServiceCustomizationStep({
  serviceOptions, onUpdate, rentalDays, setRentalDays, isHeavy, goNext, goBack,
}: ServiceCustomizationStepProps) {
  const [showDumpSite, setShowDumpSite] = useState(!!serviceOptions.requiredDumpSite);

  return (
    <StepTransition stepKey="service-customization">
      <div className="space-y-5">
        <BackButton onClick={goBack} />

        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            Customize Your Service
          </h4>
          <p className="text-sm text-muted-foreground">
            Add extras or tell us about special needs — all optional.
          </p>
        </div>

        {/* Rental Duration */}
        <div>
          <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
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
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    Standard
                  </span>
                )}
                <p className="text-xs font-bold text-foreground">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{opt.note}</p>
              </button>
            ))}
          </div>
          {rentalDays > 7 && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Extra days at $15/day beyond 7-day standard.
            </p>
          )}
        </div>

        {/* Service toggles */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-primary" />
            Additional Services
          </p>

          <label className="flex items-start gap-3 px-3.5 py-3 rounded-xl border border-border/60 hover:border-primary/40 transition-colors cursor-pointer">
            <Checkbox
              checked={serviceOptions.wantsSwap}
              onCheckedChange={(v) => onUpdate({ wantsSwap: v === true })}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-primary" />
                Swap — Dump & Return
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                We pick up full dumpster, dump it, and bring it back same day.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 px-3.5 py-3 rounded-xl border border-border/60 hover:border-primary/40 transition-colors cursor-pointer">
            <Checkbox
              checked={serviceOptions.wantsSameDay}
              onCheckedChange={(v) => onUpdate({ wantsSameDay: v === true })}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
                Same-Day Delivery
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Subject to availability. Rush fees may apply.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 px-3.5 py-3 rounded-xl border border-border/60 hover:border-primary/40 transition-colors cursor-pointer">
            <Checkbox
              checked={serviceOptions.specialPlacement}
              onCheckedChange={(v) => onUpdate({ specialPlacement: v === true })}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Special Placement Needed
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tight access, backyard, alley, or specific location.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 px-3.5 py-3 rounded-xl border border-border/60 hover:border-primary/40 transition-colors cursor-pointer">
            <Checkbox
              checked={showDumpSite}
              onCheckedChange={(v) => {
                setShowDumpSite(v === true);
                if (!v) onUpdate({ requiredDumpSite: '' });
              }}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-primary" />
                Required Disposal Site
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                You need waste taken to a specific facility.
              </p>
            </div>
          </label>

          {showDumpSite && (
            <div className="pl-9">
              <Input
                placeholder="Facility name or location"
                value={serviceOptions.requiredDumpSite}
                onChange={(e) => onUpdate({ requiredDumpSite: e.target.value })}
                className="h-10 rounded-xl border-border/60 text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Pricing may be adjusted after review for custom dump sites.
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            Tell Us Anything That Helps
          </p>
          <Textarea
            placeholder="Examples: difficult access, mixed materials, second dumpster, exact timing, special disposal site, or anything unusual about the job."
            value={serviceOptions.customerNotes}
            onChange={(e) => onUpdate({ customerNotes: e.target.value })}
            className="rounded-xl border-border/60 min-h-[80px] text-sm resize-none"
            maxLength={500}
          />
          {serviceOptions.customerNotes.length > 0 && (
            <p className="text-[10px] text-muted-foreground text-right mt-1">
              {serviceOptions.customerNotes.length}/500
            </p>
          )}
        </div>

        <Button
          variant="cta"
          size="lg"
          className="w-full h-14 rounded-xl text-base font-semibold"
          onClick={goNext}
        >
          Continue
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>

        <button
          onClick={goNext}
          className="w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          Skip — no extras needed
        </button>
      </div>
    </StepTransition>
  );
}

// V3 Step 5 — Service Customization (extras, notes, dump site)
import {
  Plus, RotateCcw, Scale, MapPin, Camera,
  MessageSquare, Zap, Building, ChevronRight, Upload,
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

        {/* Service toggles */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-primary" />
            Additional Services
          </p>

          <ServiceToggle
            checked={serviceOptions.wantsSwap}
            onChange={(v) => onUpdate({ wantsSwap: v })}
            icon={RotateCcw}
            title="Swap — Dump & Return"
            desc="We pick up full dumpster, dump it, and bring it back same day."
          />

          <ServiceToggle
            checked={serviceOptions.wantsSameDay}
            onChange={(v) => onUpdate({ wantsSameDay: v })}
            icon={Zap}
            title="Same-Day Delivery"
            desc="Subject to availability. Rush fees may apply."
          />

          <ServiceToggle
            checked={serviceOptions.specialPlacement}
            onChange={(v) => onUpdate({ specialPlacement: v })}
            icon={MapPin}
            title="Special Placement Needed"
            desc="Tight access, backyard, alley, or specific location."
          />

          <ServiceToggle
            checked={showDumpSite}
            onChange={(v) => {
              setShowDumpSite(v);
              if (!v) onUpdate({ requiredDumpSite: '' });
            }}
            icon={Building}
            title="Required Disposal Site"
            desc="You need waste taken to a specific facility."
          />

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

        {/* Photo upload hint */}
        <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl border border-dashed border-border/60 hover:border-primary/40 transition-colors cursor-pointer bg-muted/10">
          <Upload className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Have a photo of the job site?</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Text it to (510) 680-2150 after submitting. It helps us recommend the right size and plan delivery.
            </p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            Tell Us Anything That Helps
          </p>
          <p className="text-[11px] text-muted-foreground mb-2">
            Examples: difficult access, mixed materials, second dumpster, exact timing, special disposal site, or anything unusual about the job.
          </p>
          <Textarea
            placeholder="Your notes help us give you a better price..."
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

// Reusable toggle row
function ServiceToggle({
  checked, onChange, icon: Icon, title, desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <label className="flex items-start gap-3 px-3.5 py-3 rounded-xl border border-border/60 hover:border-primary/40 transition-colors cursor-pointer">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        className="mt-0.5"
      />
      <div>
        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-primary" />
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </label>
  );
}

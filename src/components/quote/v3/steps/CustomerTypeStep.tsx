// V3 Step 2 — Customer Type Selection
import { Home, HardHat, Building2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStepTitles } from '../copy';
import { StepTransition, BackButton } from './shared';
import type { CustomerType } from '../types';
import type { CustomerTypeStepProps } from './types';

const TYPES: { type: CustomerType; icon: typeof Home; label: string; desc: string }[] = [
  { type: 'homeowner', icon: Home, label: 'Homeowner', desc: 'Cleanouts, remodels, yard work' },
  { type: 'contractor', icon: HardHat, label: 'Contractor', desc: 'Demo, concrete, excavation' },
  { type: 'commercial', icon: Building2, label: 'Commercial', desc: 'Warehouse, retail, ongoing' },
];

export function CustomerTypeStep({ customerType, onSelect, goBack }: CustomerTypeStepProps) {
  return (
    <StepTransition stepKey="customer-type">
      <div className="space-y-5">
        <BackButton onClick={goBack} />

        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            {getStepTitles().TYPE_STEP_TITLE}
          </h4>
          <p className="text-sm text-muted-foreground">{getStepTitles().TYPE_STEP_SUBTITLE}</p>
        </div>

        <div className="space-y-3">
          {TYPES.map(({ type, icon: Icon, label, desc }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 text-left group',
                customerType === type
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
              )}
            >
              <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors duration-150">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 group-hover:text-foreground transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </StepTransition>
  );
}

// V3 Step 3 — Material / Waste Type Selection
import { Package, Scale, HelpCircle, ChevronRight, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StepTransition, BackButton } from './shared';
import {
  GENERAL_DEBRIS_OPTIONS, HEAVY_MATERIAL_OPTIONS,
  type MaterialGroup, type MaterialOption,
} from '../materialTypes';
import { useState } from 'react';

interface MaterialStepProps {
  selectedMaterialGroup: MaterialGroup | null;
  selectedMaterial: MaterialOption | null;
  isProjectHeavy: boolean;
  onSelectGroup: (group: MaterialGroup) => void;
  onSelectMaterial: (material: MaterialOption) => void;
  goBack: () => void;
}

const GROUP_CARDS: { group: MaterialGroup; icon: typeof Package; label: string; desc: string }[] = [
  { group: 'general', icon: Package, label: 'General Debris', desc: 'Household, remodel, construction, yard waste' },
  { group: 'heavy', icon: Scale, label: 'Heavy Materials', desc: 'Concrete, soil, sand, rocks, tile, asphalt' },
  { group: 'unsure', icon: HelpCircle, label: "Not Sure / Need Help", desc: "We'll help you figure it out" },
];

export function MaterialStep({
  selectedMaterialGroup, selectedMaterial, isProjectHeavy,
  onSelectGroup, onSelectMaterial, goBack,
}: MaterialStepProps) {
  const [showDetails, setShowDetails] = useState(false);

  // If project is heavy, auto-suggest heavy group
  const effectiveGroup = selectedMaterialGroup || (isProjectHeavy ? 'heavy' : null);

  // Show group selection first
  if (!effectiveGroup || effectiveGroup === 'unsure') {
    return (
      <StepTransition stepKey="material-group">
        <div className="space-y-5">
          <BackButton onClick={goBack} />

          <div>
            <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
              What type of waste?
            </h4>
            <p className="text-sm text-muted-foreground">
              This determines pricing and which dumpster sizes are available.
            </p>
          </div>

          <div className="space-y-3">
            {GROUP_CARDS.map(({ group, icon: Icon, label, desc }) => (
              <button
                key={group}
                onClick={() => {
                  if (group === 'unsure') {
                    onSelectGroup('general');
                  } else {
                    onSelectGroup(group);
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 text-left group/card',
                  effectiveGroup === group
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
                )}
              >
                <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 group-hover/card:bg-primary/10 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              </button>
            ))}
          </div>

          {/* Help CTA */}
          <Button
            variant="outline"
            size="default"
            className="w-full rounded-xl text-xs"
            onClick={() => window.open('tel:+15106802150', '_blank')}
          >
            <Phone className="w-4 h-4 mr-1.5" />
            Not sure? Call us — we'll help
          </Button>
        </div>
      </StepTransition>
    );
  }

  // Show specific material options
  const options = effectiveGroup === 'heavy' ? HEAVY_MATERIAL_OPTIONS : GENERAL_DEBRIS_OPTIONS;
  const displayOptions = showDetails ? options : options.slice(0, 6);

  return (
    <StepTransition stepKey="material-detail">
      <div className="space-y-5">
        <BackButton onClick={() => onSelectGroup(null as any)} />

        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            {effectiveGroup === 'heavy' ? 'What heavy material?' : 'What type of debris?'}
          </h4>
          <p className="text-sm text-muted-foreground">
            Select the best match — or pick "Other" if unsure.
          </p>
        </div>

        {effectiveGroup === 'heavy' && (
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-200">
            <Scale className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Heavy materials are limited to 5, 8, or 10-yard dumpsters. Must not exceed fill line.</span>
          </div>
        )}

        <div className="space-y-2">
          {displayOptions.map((mat) => (
            <button
              key={mat.id}
              onClick={() => onSelectMaterial(mat)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left',
                selectedMaterial?.id === mat.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
              )}
            >
              {selectedMaterial?.id === mat.id ? (
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
              )}
              <span className="text-sm font-medium text-foreground">{mat.label}</span>
            </button>
          ))}
        </div>

        {!showDetails && options.length > 6 && (
          <button
            onClick={() => setShowDetails(true)}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-1"
          >
            Show all {options.length} options
          </button>
        )}
      </div>
    </StepTransition>
  );
}

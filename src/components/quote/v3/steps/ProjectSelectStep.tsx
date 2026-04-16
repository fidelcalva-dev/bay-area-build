// V3 Step 0 — "What are you working on?" Project Selector
// Shown before the existing ProjectTypeStep, auto-advances after selection

import { useState, useEffect } from 'react';
import {
  Home, UtensilsCrossed, HardHat, Warehouse, Mountain,
  Fence, Building2, Trees, Hammer, CheckCircle, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepTransition } from './shared';
import { DumpsterSVG } from '@/components/sizes/DumpsterSVG';

export interface ProjectSelectItem {
  id: string;
  label: string;
  icon: React.ElementType;
  recommendedSize: number;
}

const PROJECT_OPTIONS: ProjectSelectItem[] = [
  { id: 'home-cleanout',      label: 'Home Cleanout',      icon: Home,            recommendedSize: 20 },
  { id: 'kitchen-remodel',    label: 'Kitchen Remodel',    icon: UtensilsCrossed, recommendedSize: 20 },
  { id: 'roofing-debris',     label: 'Roofing Debris',     icon: HardHat,         recommendedSize: 20 },
  { id: 'garage-cleanout',    label: 'Garage Cleanout',    icon: Warehouse,       recommendedSize: 10 },
  { id: 'concrete-soil',      label: 'Concrete / Soil',    icon: Mountain,        recommendedSize: 8 },
  { id: 'deck-removal',       label: 'Deck Removal',       icon: Fence,           recommendedSize: 10 },
  { id: 'estate-cleanout',    label: 'Estate Cleanout',    icon: Home,            recommendedSize: 30 },
  { id: 'construction-site',  label: 'Construction Site',  icon: Hammer,          recommendedSize: 40 },
  { id: 'yard-debris',        label: 'Yard Debris',        icon: Trees,           recommendedSize: 10 },
  { id: 'commercial-project', label: 'Commercial Project', icon: Building2,       recommendedSize: 40 },
];

interface ProjectSelectStepProps {
  onSelect: (project: ProjectSelectItem) => void;
  onSkip: () => void;
}

export function ProjectSelectStep({ onSelect, onSkip }: ProjectSelectStepProps) {
  const [selected, setSelected] = useState<ProjectSelectItem | null>(null);
  const [autoAdvancing, setAutoAdvancing] = useState(false);

  // Auto-advance 800ms after selection
  useEffect(() => {
    if (!selected || autoAdvancing) return;
    setAutoAdvancing(true);
    const timer = setTimeout(() => onSelect(selected), 800);
    return () => clearTimeout(timer);
  }, [selected, onSelect, autoAdvancing]);

  return (
    <StepTransition stepKey="project-select">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            What are you working on?
          </h4>
          <p className="text-sm text-muted-foreground">
            We'll recommend the right size for your project
          </p>
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-2 gap-3">
          {PROJECT_OPTIONS.map((project) => {
            const Icon = project.icon;
            const isSelected = selected?.id === project.id;
            return (
              <button
                key={project.id}
                onClick={() => { setSelected(project); setAutoAdvancing(false); }}
                className={cn(
                  'min-h-[56px] p-3 rounded-xl border-2 text-left transition-all duration-150',
                  'flex items-center gap-3 group',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary hover:bg-primary/5'
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  isSelected ? 'bg-primary/20' : 'bg-muted/60 group-hover:bg-primary/10'
                )}>
                  <Icon className={cn(
                    'w-4.5 h-4.5',
                    isSelected ? 'text-primary' : 'text-foreground/70'
                  )} />
                </div>
                <span className={cn(
                  'text-sm font-semibold leading-tight',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}>
                  {project.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Inline confirmation */}
        {selected && (
          <div className="animate-fade-in rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  For {selected.label} we recommend a {selected.recommendedSize}-yard dumpster
                </p>
                {DumpsterSVG && (
                  <div className="mt-2 max-w-[180px]">
                    <DumpsterSVG yards={selected.recommendedSize} />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onSelect(selected)}
              className="mt-3 w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Looks good, continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Skip link */}
        <button
          onClick={onSkip}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          I already know my size &rarr; Skip
        </button>
      </div>
    </StepTransition>
  );
}

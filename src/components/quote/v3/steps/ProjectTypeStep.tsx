// V3 Step 1 — Universal Project Type Selection
import { Truck, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Warehouse, UtensilsCrossed, Home, Trees, Hammer, HardHat,
  Mountain, Construction, DoorOpen, Store, RefreshCw, Bath,
} from 'lucide-react';
import { StepTransition } from './shared';
import { getUniversalProjects, type UniversalProject } from '../projectTypes';

const ICON_MAP: Record<string, React.ElementType> = {
  'warehouse': Warehouse,
  'utensils-crossed': UtensilsCrossed,
  'home': Home,
  'trees': Trees,
  'hammer': Hammer,
  'hard-hat': HardHat,
  'mountain': Mountain,
  'construction': Construction,
  'door-open': DoorOpen,
  'store': Store,
  'refresh-cw': RefreshCw,
  'bath': Bath,
  'help-circle': HelpCircle,
};

interface ProjectTypeStepProps {
  selectedProject: UniversalProject | null;
  onSelect: (project: UniversalProject) => void;
}

export function ProjectTypeStep({ selectedProject, onSelect }: ProjectTypeStepProps) {
  const projects = getUniversalProjects();

  return (
    <StepTransition stepKey="project-type">
      <div className="space-y-5">
        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            What's your project?
          </h4>
          <p className="text-sm text-muted-foreground">
            Pick the closest match — we'll recommend the right dumpster.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {projects.map((project) => {
            const IconComp = ICON_MAP[project.icon] || Truck;
            const isSelected = selectedProject?.id === project.id;
            return (
              <button
                key={project.id}
                onClick={() => onSelect(project)}
                className={cn(
                  'p-4 rounded-xl border text-center transition-all duration-150 flex flex-col items-center gap-2 group',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-150">
                  <IconComp className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground text-sm leading-tight">{project.label}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{project.description}</p>
                {project.isHeavy && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                    5–10 yd only
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </StepTransition>
  );
}

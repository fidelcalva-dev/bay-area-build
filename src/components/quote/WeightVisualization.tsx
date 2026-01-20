// Weight Visualization Component
// Shows a simple visual indicator of typical weight usage

import { Weight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

interface WeightVisualizationProps {
  includedTons: number;
  materialType: 'general' | 'heavy';
  projectType?: string | null;
  className?: string;
}

export function WeightVisualization({ 
  includedTons, 
  materialType, 
  projectType,
  className 
}: WeightVisualizationProps) {
  // Calculate typical usage based on project type
  const getTypicalUsage = () => {
    if (materialType === 'heavy') return 85; // Heavy materials often use more
    
    switch (projectType) {
      case 'roofing': return 80;
      case 'demo': return 75;
      case 'concrete': return 90;
      case 'remodel': return 60;
      case 'garage': return 40;
      case 'landscaping': return 50;
      default: return 55;
    }
  };

  const usage = getTypicalUsage();
  
  // Determine color based on usage
  const getBarColor = () => {
    if (usage <= 50) return 'bg-success';
    if (usage <= 75) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  return (
    <div className={cn("p-3 bg-muted/50 rounded-lg", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Weight className="w-4 h-4 text-primary" />
          <span>Weight Allowance</span>
        </div>
        <span className="text-sm font-bold text-primary">{includedTons}T included</span>
      </div>
      
      {/* Visual bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", getBarColor())}
          style={{ width: `${Math.min(usage, 100)}%` }}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Based on typical {projectType ? `${projectType} ` : ''}jobs, this size includes enough weight for most projects.
      </p>
    </div>
  );
}

interface EducationalMicroCopyProps {
  className?: string;
}

export function EducationalMicroCopy({ className }: EducationalMicroCopyProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-left hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors">
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
            <Info className="w-4 h-4 shrink-0" />
            <span className="font-medium">How to avoid extra fees</span>
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {isOpen ? 'Hide' : 'Learn more'}
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 p-3 bg-background border border-border rounded-lg space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Most extra fees come from:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Overfilling the dumpster past the rim</li>
            <li>Exceeding the weight limit</li>
            <li>Mixing heavy materials with general debris</li>
          </ul>
          <p className="pt-2">
            <Link 
              to="/contractor-best-practices" 
              className="text-primary font-medium hover:underline"
            >
              Read our Contractor Best Practices guide →
            </Link>
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

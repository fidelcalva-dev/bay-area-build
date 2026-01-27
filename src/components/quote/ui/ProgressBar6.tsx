// ============================================================
// PROGRESS BAR 6 - Minimal 6-step progress indicator
// ============================================================
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProgressBar6Props {
  currentStep: number; // 1-6
  totalSteps?: number;
  stepLabels?: string[];
  className?: string;
}

export function ProgressBar6({ 
  currentStep, 
  totalSteps = 6,
  stepLabels,
  className 
}: ProgressBar6Props) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  return (
    <div className={cn('w-full', className)}>
      {/* Step indicators - minimal dots only */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step) => {
          const isComplete = step < currentStep;
          const isCurrent = step === currentStep;
          
          return (
            <div
              key={step}
              className={cn(
                'transition-all duration-300',
                isComplete && 'w-6 h-2 rounded-full bg-primary',
                isCurrent && 'w-8 h-2 rounded-full bg-primary',
                !isComplete && !isCurrent && 'w-2 h-2 rounded-full bg-muted-foreground/30'
              )}
              aria-label={stepLabels?.[step - 1] || `Step ${step}`}
              aria-current={isCurrent ? 'step' : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

// Alternative: Numbered minimal version
interface ProgressBar6NumberedProps {
  currentStep: number;
  totalSteps?: number;
  currentLabel?: string;
  className?: string;
}

export function ProgressBar6Numbered({ 
  currentStep, 
  totalSteps = 6,
  currentLabel,
  className 
}: ProgressBar6NumberedProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        {currentLabel && (
          <span className="text-xs font-semibold text-foreground">
            {currentLabel}
          </span>
        )}
      </div>
      <div className="relative h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar6;

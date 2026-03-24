// Step transition wrapper + shared UI pieces
import { ChevronLeft } from 'lucide-react';

export function StepTransition({ children, stepKey }: { children: React.ReactNode; stepKey: string }) {
  return (
    <div key={stepKey} className="animate-fade-in">
      {children}
    </div>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
    >
      <ChevronLeft className="w-4 h-4" />
      <span>Back</span>
    </button>
  );
}

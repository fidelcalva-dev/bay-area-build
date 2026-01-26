// Fill Line Required Badge Component
// Shows a prominent badge when heavy materials require fill-line compliance
// Now integrated with contextual help system

import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HelpTooltip } from '@/components/help';

interface FillLineRequiredProps {
  className?: string;
  variant?: 'badge' | 'banner';
  showHelpIcon?: boolean;
}

export function FillLineRequired({ className, variant = 'badge', showHelpIcon = true }: FillLineRequiredProps) {
  if (variant === 'banner') {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg",
        className
      )}>
        <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              Fill Line Required
            </p>
            {showHelpIcon && (
              <HelpTooltip helpKey="FILL_LINE_RULE" placement="tooltip" />
            )}
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Heavy materials cannot be filled to the top due to weight limits.
          </p>
        </div>
      </div>
    );
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-semibold rounded-full",
      className
    )}>
      <AlertTriangle className="w-3 h-3" />
      Fill Line Required
      {showHelpIcon && (
        <HelpTooltip helpKey="FILL_LINE_RULE" placement="tooltip" className="ml-0.5" />
      )}
    </span>
  );
}

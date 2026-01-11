import { Shield, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrivewayProtectionProps {
  className?: string;
}

export function DrivewayProtection({ className }: DrivewayProtectionProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Driveway Protection</h3>
            <p className="text-sm text-muted-foreground">Prevent damage before delivery</p>
          </div>
        </div>
      </div>

      {/* Visual comparison */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Do */}
        <div className="rounded-lg border-2 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Do</span>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• Use plywood boards</li>
            <li>• Place on flat, solid surface</li>
            <li>• Clear 20ft overhead</li>
            <li>• Mark sprinkler heads</li>
          </ul>
        </div>

        {/* Don't */}
        <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">Don't</span>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• Place on grass/lawn</li>
            <li>• Block sidewalks</li>
            <li>• Put under power lines</li>
            <li>• Cover utility boxes</li>
          </ul>
        </div>
      </div>

      {/* Pro tip */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Pro Tip:</strong> Place 3/4" plywood under each wheel contact point. 
            This distributes 10,000+ lbs and prevents cracks on older driveways.
          </p>
        </div>
      </div>

      {/* Board diagram */}
      <div className="p-4 border-t border-border">
        <div className="flex justify-center">
          <div className="relative">
            {/* Dumpster outline */}
            <div className="w-32 h-12 border-2 border-primary rounded-sm bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">Dumpster</span>
            </div>
            {/* Wheel boards */}
            <div className="absolute -bottom-2 left-1 w-8 h-2 bg-amber-600 rounded-sm" />
            <div className="absolute -bottom-2 right-1 w-8 h-2 bg-amber-600 rounded-sm" />
            {/* Labels */}
            <div className="absolute -bottom-6 left-0 text-[10px] text-muted-foreground">Plywood</div>
            <div className="absolute -bottom-6 right-0 text-[10px] text-muted-foreground">Plywood</div>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-6">
          We carry boards on request — just ask when ordering!
        </p>
      </div>
    </div>
  );
}

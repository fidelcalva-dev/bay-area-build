import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, AlertTriangle, TrendingUp, Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const SIZE_DATA = [
  { size: 5, tons: 0.5, color: 'from-green-500 to-green-600', fillPercent: 10, typical: 'Small cleanouts, yard debris' },
  { size: 8, tons: 0.5, color: 'from-emerald-500 to-emerald-600', fillPercent: 12.5, typical: 'Bathroom remodel, garage cleanout' },
  { size: 10, tons: 1.0, color: 'from-teal-500 to-teal-600', fillPercent: 25, typical: 'Light debris, small cleanouts' },
  { size: 20, tons: 2.0, color: 'from-cyan-500 to-cyan-600', fillPercent: 50, typical: 'Roof tear-off, room addition' },
  { size: 30, tons: 3.0, color: 'from-blue-500 to-blue-600', fillPercent: 75, typical: 'Large renovation, estate cleanout' },
  { size: 40, tons: 4.0, color: 'from-indigo-500 to-indigo-600', fillPercent: 100, typical: 'Commercial projects, new construction' },
  { size: 50, tons: 5.0, color: 'from-purple-500 to-purple-600', fillPercent: 125, typical: 'Industrial sites, warehouse cleanouts' },
];

const HEAVY_SIZE_DATA = [
  { size: 5, tons: 5.0, color: 'from-amber-500 to-amber-600', typical: 'Small concrete/dirt removal' },
  { size: 8, tons: 8.0, color: 'from-orange-500 to-orange-600', typical: 'Driveway demo, patio removal' },
  { size: 10, tons: 10.0, color: 'from-red-500 to-red-600', typical: 'Foundation work, large demo' },
];

interface WeightEducationProps {
  className?: string;
  compact?: boolean;
  selectedSize?: number;
  materialType?: 'general' | 'heavy';
}

export function WeightEducation({ className, compact = false, selectedSize, materialType = 'general' }: WeightEducationProps) {
  const [expanded, setExpanded] = useState(!compact);
  const [showHeavy, setShowHeavy] = useState(materialType === 'heavy');

  const currentData = showHeavy ? HEAVY_SIZE_DATA : SIZE_DATA;

  if (compact && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-lg",
          "bg-muted/50 hover:bg-muted/80 transition-colors",
          "text-sm text-muted-foreground",
          className
        )}
      >
        <span className="flex items-center gap-2">
          <Scale className="w-4 h-4" />
          Learn about weight limits & overage fees
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Weight & Overfill Guide</h3>
              <p className="text-sm text-muted-foreground">Avoid surprise fees — know your limits</p>
            </div>
          </div>
          {compact && (
            <button onClick={() => setExpanded(false)} className="p-1 hover:bg-muted rounded">
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Material Type Toggle */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex gap-2">
          <Button
            variant={!showHeavy ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHeavy(false)}
            className="flex-1"
          >
            General Debris
          </Button>
          <Button
            variant={showHeavy ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHeavy(true)}
            className="flex-1"
          >
            Heavy Materials
          </Button>
        </div>
      </div>

      {/* Visual Size Chart */}
      <div className="p-4 space-y-4">
        <div className="text-sm font-medium text-foreground mb-3">Included Tons by Size</div>
        
        <div className="space-y-3">
          {currentData.map((item) => (
            <div
              key={item.size}
              className={cn(
                "relative rounded-lg overflow-hidden transition-all",
                selectedSize === item.size && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              {/* Background bar */}
              <div className="h-14 bg-muted/50 rounded-lg relative overflow-hidden">
                {/* Filled portion */}
                <div
                  className={cn("absolute inset-y-0 left-0 bg-gradient-to-r", item.color)}
                  style={{ width: showHeavy ? '100%' : `${('fillPercent' in item ? item.fillPercent : 100)}%` }}
                />
                
                {/* Content overlay */}
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/90 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-foreground">{item.size}</span>
                    </div>
                    <div className="text-white drop-shadow-md">
                      <div className="font-semibold text-sm">{item.size} Yard</div>
                      <div className="text-xs opacity-90">{item.typical}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white drop-shadow-md">{item.tons}T</div>
                    <div className="text-xs text-white/80 drop-shadow">included</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overage Explanation */}
      <div className="p-4 border-t border-border bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">What if I go over?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              General debris dumpsters include base tonnage by size. Any weight beyond the included amount is billed at{' '}
              <span className="font-semibold text-foreground">$165 per ton</span>, based on scale ticket.
              Heavy material dumpsters are flat-fee with no extra weight charges.
            </p>
          </div>
        </div>
      </div>

      {/* Overfill Warning */}
      <div className="p-4 border-t border-border bg-destructive/5">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Overfill = Extra Trip Fee</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Debris must not exceed the top of the container. Overfilled dumpsters are{' '}
              <span className="font-semibold text-foreground">illegal to transport</span> and require a second haul.
              Keep it level to avoid additional fees.
            </p>
            
            {/* Visual overfill diagram */}
            <div className="mt-3 flex gap-4">
              {/* Good example */}
              <div className="flex-1 text-center">
                <div className="relative h-16 mb-2">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-10 border-2 border-emerald-500 rounded-t-sm bg-emerald-100/50 dark:bg-emerald-900/30">
                    <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-emerald-500" />
                    <div className="absolute inset-x-1 bottom-1 top-1 bg-emerald-500/30 rounded-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span>✓</span> Level = OK
                </div>
              </div>
              
              {/* Bad example */}
              <div className="flex-1 text-center">
                <div className="relative h-16 mb-2">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-10 border-2 border-destructive rounded-t-sm bg-destructive/10">
                    <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-destructive" />
                    <div className="absolute inset-x-1 bottom-1 -top-4 bg-destructive/30 rounded-t-lg" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs font-medium text-destructive">
                  <span>✗</span> Overfill = Fee
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Pro Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span><strong>Heavy materials</strong> (concrete, dirt, brick) fill up weight fast. Use smaller dumpsters.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span><strong>Light materials</strong> (cardboard, furniture) can fill a 40-yard and still be under weight.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Use our <strong>Debris Estimator</strong> to calculate your approximate weight before ordering.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Link to Best Practices */}
      <div className="p-4 border-t border-border bg-muted/30">
        <Link 
          to="/contractor-best-practices#weight" 
          className="flex items-center justify-between text-sm text-primary hover:underline"
        >
          <span className="flex items-center gap-2"><Info className="w-4 h-4" /> View Full Weight & Material Guidelines</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

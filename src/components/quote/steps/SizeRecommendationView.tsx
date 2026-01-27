// ============================================================
// SIZE RECOMMENDATION VIEW - Option B
// Clean hero display with pricing psychology optimizations
// ============================================================
import { ArrowRight, Edit2, Lightbulb, ThumbsUp, HelpCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DUMPSTER_PHOTO_MAP } from '@/lib/canonicalDumpsterImages';
import type { SizeRecommendation } from '../hooks/useSizeRecommendation';
import { BadgePill } from '../ui/BadgePill';
import { useState } from 'react';

interface SizeRecommendationViewProps {
  recommendation: SizeRecommendation;
  onAccept: (size: number) => void;
  onChangeSize: () => void;
  onEditItems: () => void;
  className?: string;
}

// Confidence icon based on score
function ConfidenceIndicator({ score }: { score: number }) {
  if (score >= 85) {
    return <ThumbsUp className="w-4 h-4 text-success" />;
  } else if (score >= 70) {
    return <Lightbulb className="w-4 h-4 text-primary" />;
  }
  return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
}

// Get category display label
function getCategoryLabel(category: string, forcesDebrisHeavy: boolean): string {
  if (forcesDebrisHeavy) return 'Yard Waste';
  switch (category) {
    case 'HEAVY_MATERIALS': return 'Heavy Materials';
    case 'CLEAN_RECYCLING': return 'Recycling';
    case 'YARD_WASTE': return 'Yard Waste';
    default: return 'General Debris';
  }
}

// Get confidence message based on score (Phase 2)
function getConfidenceMessage(score: number): string {
  if (score >= 85) {
    return 'Most customers with similar projects choose this size.';
  } else if (score >= 70) {
    return 'This size fits most projects like yours.';
  }
  return 'You can adjust the size if you\'re unsure.';
}

export function SizeRecommendationView({
  recommendation,
  onAccept,
  onChangeSize,
  onEditItems,
  className,
}: SizeRecommendationViewProps) {
  const {
    category,
    recommendedSize,
    alternativeSizes,
    reasonShort,
    confidenceScore,
    isHeavy,
    forcesDebrisHeavy,
    allowGreenHalo,
  } = recommendation;

  const [showSmallerWarning, setShowSmallerWarning] = useState(false);

  const image = DUMPSTER_PHOTO_MAP[recommendedSize];
  const categoryLabel = getCategoryLabel(category, forcesDebrisHeavy);
  const confidenceMessage = getConfidenceMessage(confidenceScore);

  // Phase 5: Limit alternatives to max 2 options
  const limitedAlternatives = alternativeSizes.slice(0, 2);

  // Phase 6: Handle smaller size selection with loss aversion hint
  const handleAlternativeClick = (size: number) => {
    if (size < recommendedSize && !showSmallerWarning) {
      setShowSmallerWarning(true);
    }
    onAccept(size);
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Recommendation header with "Best fit" badge (Phase 1) */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
          <ThumbsUp className="w-4 h-4" />
          Best fit for your project
        </div>
        <h4 className="text-2xl font-bold text-foreground">
          {recommendedSize} Yard Dumpster
        </h4>
        <p className="text-sm text-muted-foreground mt-1">
          {categoryLabel}
        </p>
      </div>

      {/* Primary recommendation card - visually dominant (Phase 1) */}
      <div className="relative p-1 rounded-2xl bg-gradient-to-b from-primary/20 to-primary/5">
        <div className="bg-background rounded-xl p-4">
          {/* Dumpster image */}
          <div className="flex justify-center">
            <div className="relative w-56 h-36">
              {image ? (
                <img
                  src={image}
                  alt={`${recommendedSize} yard dumpster`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-4xl font-bold text-muted-foreground">
                    {recommendedSize}yd
                  </span>
                </div>
              )}
              
              {/* Popular badge for 20yd standard debris */}
              {recommendedSize === 20 && !isHeavy && (
                <BadgePill 
                  variant="primary" 
                  className="absolute -top-2 left-1/2 -translate-x-1/2"
                >
                  Most Popular
                </BadgePill>
              )}
              
              {/* Heavy rated badge */}
              {isHeavy && !forcesDebrisHeavy && (
                <BadgePill 
                  variant="warning" 
                  className="absolute -top-2 left-1/2 -translate-x-1/2"
                >
                  Heavy Rated
                </BadgePill>
              )}

              {/* Green Halo badge for recycling */}
              {allowGreenHalo && (
                <BadgePill 
                  variant="success" 
                  className="absolute -top-2 left-1/2 -translate-x-1/2"
                >
                  Green Halo Eligible
                </BadgePill>
              )}
            </div>
          </div>

          {/* Confidence message - single line (Phase 2) */}
          <div className="mt-4 text-center">
            <div className="flex items-center gap-2 justify-center">
              <ConfidenceIndicator score={confidenceScore} />
              <p className="text-sm text-muted-foreground">
                {confidenceMessage}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <Button
        variant="cta"
        size="lg"
        className="w-full h-14"
        onClick={() => onAccept(recommendedSize)}
      >
        Use Recommendation
        <ArrowRight className="w-5 h-5 ml-1" />
      </Button>

      {/* Alternative sizes - smaller, limited to 2 (Phase 1 & 5) */}
      {limitedAlternatives.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Or choose a different size:</p>
          <div className="flex justify-center gap-2">
            {limitedAlternatives.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleAlternativeClick(size)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                {size < recommendedSize ? 'Smaller: ' : 'Larger: '}{size} yard
              </button>
            ))}
          </div>
          
          {/* Loss aversion hint (Phase 6) */}
          {showSmallerWarning && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              <span>Smaller dumpsters may require an additional haul.</span>
            </div>
          )}
        </div>
      )}

      {/* Secondary actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground"
          onClick={onChangeSize}
        >
          Change Size
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground"
          onClick={onEditItems}
        >
          <Edit2 className="w-3.5 h-3.5 mr-1" />
          Edit Items
        </Button>
      </div>
    </div>
  );
}

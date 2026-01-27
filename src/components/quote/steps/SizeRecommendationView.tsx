// ============================================================
// SIZE RECOMMENDATION VIEW
// Shows the recommended size based on material selections
// ============================================================
import { AlertTriangle, ArrowRight, Edit2, Lightbulb, ThumbsUp, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DUMPSTER_PHOTO_MAP } from '@/lib/canonicalDumpsterImages';
import type { SizeRecommendation } from '../hooks/useSizeRecommendation';
import { BadgePill } from '../ui/BadgePill';

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

export function SizeRecommendationView({
  recommendation,
  onAccept,
  onChangeSize,
  onEditItems,
  className,
}: SizeRecommendationViewProps) {
  const {
    recommendedSize,
    alternativeSizes,
    reasonShort,
    confidenceMessage,
    confidenceScore,
    isHeavy,
    forcesDebrisHeavy,
  } = recommendation;

  const image = DUMPSTER_PHOTO_MAP[recommendedSize];
  const showHeavyWarning = isHeavy || forcesDebrisHeavy;

  return (
    <div className={cn("space-y-5", className)}>
      {/* Recommendation header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium mb-3">
          <Lightbulb className="w-4 h-4" />
          Recommended for your project
        </div>
        <h4 className="text-xl font-bold text-foreground">
          {recommendedSize} Yard Dumpster
        </h4>
      </div>

      {/* Dumpster image */}
      <div className="flex justify-center">
        <div className="relative w-48 h-32">
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
          
          {/* Popular badge */}
          {recommendedSize === 20 && !isHeavy && (
            <BadgePill 
              variant="primary" 
              className="absolute -top-2 left-1/2 -translate-x-1/2"
            >
              Most Popular
            </BadgePill>
          )}
          
          {isHeavy && (
            <BadgePill 
              variant="warning" 
              className="absolute -top-2 left-1/2 -translate-x-1/2"
            >
              Heavy Rated
            </BadgePill>
          )}
        </div>
      </div>

      {/* Confidence message */}
      <div className="p-3 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center gap-2 justify-center mb-1">
          <ConfidenceIndicator score={confidenceScore} />
          <p className="text-sm font-medium text-foreground">
            {confidenceMessage}
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {reasonShort}
        </p>
      </div>

      {/* Heavy material warning */}
      {showHeavyWarning && (
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {forcesDebrisHeavy ? 'Debris Heavy Pricing' : 'Fill Line Required'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {forcesDebrisHeavy 
                ? 'Yard waste is priced as debris due to soil content. Overweight billed at $165/ton.'
                : 'Heavy materials must be loaded below the fill line to comply with weight limits.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Primary CTA */}
      <Button
        variant="cta"
        size="lg"
        className="w-full h-14"
        onClick={() => onAccept(recommendedSize)}
      >
        Use {recommendedSize} Yard
        <ArrowRight className="w-5 h-5 ml-1" />
      </Button>

      {/* Alternative sizes */}
      {alternativeSizes.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Or choose a different size:</p>
          <div className="flex justify-center gap-2">
            {alternativeSizes.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => onAccept(size)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                {size} yd
              </button>
            ))}
          </div>
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
          See all sizes
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground"
          onClick={onEditItems}
        >
          <Edit2 className="w-3.5 h-3.5 mr-1" />
          Edit items
        </Button>
      </div>
    </div>
  );
}

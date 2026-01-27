// ============================================================
// SIZE RECOMMENDATION VIEW - Option B
// Clean hero display with simplified warnings (no numbers)
// ============================================================
import { ArrowRight, Edit2, Lightbulb, ThumbsUp, HelpCircle, AlertTriangle, Leaf, Recycle } from 'lucide-react';
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
    confidenceMessage,
    confidenceScore,
    isHeavy,
    forcesDebrisHeavy,
    allowGreenHalo,
  } = recommendation;

  const image = DUMPSTER_PHOTO_MAP[recommendedSize];
  const categoryLabel = getCategoryLabel(category, forcesDebrisHeavy);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Recommendation header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium mb-3">
          <Lightbulb className="w-4 h-4" />
          Recommended for your project
        </div>
        <h4 className="text-2xl font-bold text-foreground">
          {recommendedSize} Yard Dumpster
        </h4>
        <p className="text-sm text-muted-foreground mt-1">
          {categoryLabel}
        </p>
      </div>

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

      {/* Confidence message - cleaner display */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
        <div className="flex items-center gap-2 justify-center mb-1">
          <ConfidenceIndicator score={confidenceScore} />
          <p className="text-sm font-medium text-foreground">
            {confidenceMessage}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {reasonShort}
        </p>
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

      {/* Alternative sizes - cleaner layout */}
      {alternativeSizes.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Or choose a different size:</p>
          <div className="flex justify-center gap-2">
            {alternativeSizes.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => onAccept(size)}
                className="px-5 py-2.5 text-sm font-medium rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                {size} yard
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

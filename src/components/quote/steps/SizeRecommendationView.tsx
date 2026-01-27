// ============================================================
// SIZE RECOMMENDATION VIEW - Enhanced with AI Integration
// Clean hero display with pricing psychology optimizations
// ============================================================
import { ArrowRight, Edit2, Lightbulb, ThumbsUp, HelpCircle, Info, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DUMPSTER_PHOTO_MAP } from '@/lib/canonicalDumpsterImages';
import type { SizeRecommendation } from '../hooks/useSizeRecommendation';
import type { AIRecommendationOutput, AIRecommendationNotice } from '../types/aiRecommendation';
import { BadgePill } from '../ui/BadgePill';
import { useState } from 'react';

interface SizeRecommendationViewProps {
  recommendation: SizeRecommendation;
  aiRecommendation?: AIRecommendationOutput | null;
  aiLoading?: boolean;
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
function getCategoryLabel(category: string, forcesDebrisHeavy?: boolean): string {
  if (forcesDebrisHeavy) return 'Yard Waste';
  switch (category) {
    case 'HEAVY_MATERIALS':
    case 'HEAVY': return 'Heavy Materials';
    case 'CLEAN_RECYCLING': return 'Recycling';
    case 'DEBRIS_HEAVY':
    case 'YARD_WASTE': return 'Yard Waste';
    default: return 'General Debris';
  }
}

// Get confidence message based on score
function getConfidenceMessage(score: number): string {
  if (score >= 85) {
    return 'Most customers with similar projects choose this size.';
  } else if (score >= 70) {
    return 'This size fits most projects like yours.';
  }
  return 'You can adjust the size if you\'re unsure.';
}

// Render AI notice
function AINoticeItem({ notice }: { notice: AIRecommendationNotice }) {
  return (
    <div className={cn(
      "flex items-start gap-2 p-2.5 rounded-lg text-xs",
      notice.type === 'WARNING' 
        ? "bg-warning/10 text-warning-foreground" 
        : "bg-muted/50 text-muted-foreground"
    )}>
      {notice.type === 'WARNING' ? (
        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      ) : (
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      )}
      <span>{notice.text}</span>
    </div>
  );
}

export function SizeRecommendationView({
  recommendation,
  aiRecommendation,
  aiLoading,
  onAccept,
  onChangeSize,
  onEditItems,
  className,
}: SizeRecommendationViewProps) {
  // Use AI recommendation if available, otherwise fall back to local recommendation
  const useAI = !!aiRecommendation;
  
  const recommendedSize = useAI 
    ? aiRecommendation.recommended_size_yd 
    : recommendation.recommendedSize;
  
  const alternativeSizes = useAI 
    ? aiRecommendation.alternatives 
    : recommendation.alternativeSizes;
  
  const confidenceScore = useAI 
    ? aiRecommendation.confidence_score 
    : recommendation.confidenceScore;
  
  const reasonShort = useAI 
    ? aiRecommendation.reason_short 
    : recommendation.reasonShort;
  
  const category = useAI 
    ? aiRecommendation.category 
    : recommendation.category;
  
  const isHeavy = useAI 
    ? (aiRecommendation.category === 'HEAVY' || aiRecommendation.category === 'DEBRIS_HEAVY')
    : recommendation.isHeavy;
  
  const forcesDebrisHeavy = useAI 
    ? aiRecommendation.must_enforce.force_debris_heavy 
    : recommendation.forcesDebrisHeavy;
  
  const allowGreenHalo = useAI 
    ? !aiRecommendation.must_enforce.hide_green_halo && aiRecommendation.service_type === 'GREEN_HALO'
    : recommendation.allowGreenHalo;
  
  const notices = useAI ? aiRecommendation.notices : [];
  const allowedSizes = useAI ? aiRecommendation.must_enforce.allowed_sizes : undefined;

  const [showSmallerWarning, setShowSmallerWarning] = useState(false);

  const image = DUMPSTER_PHOTO_MAP[recommendedSize];
  const categoryLabel = getCategoryLabel(category, forcesDebrisHeavy);
  const confidenceMessage = getConfidenceMessage(confidenceScore);

  // Limit alternatives to max 2 options
  const limitedAlternatives = alternativeSizes.slice(0, 2);

  // Handle smaller size selection with loss aversion hint
  const handleAlternativeClick = (size: number) => {
    if (size < recommendedSize && !showSmallerWarning) {
      setShowSmallerWarning(true);
    }
    onAccept(size);
  };

  // Loading state
  if (aiLoading) {
    return (
      <div className={cn("space-y-5", className)}>
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Analyzing your project...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      {/* Recommendation header with "Best fit" badge */}
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

      {/* Primary recommendation card - visually dominant */}
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

          {/* AI Reason or Confidence message */}
          <div className="mt-4 text-center">
            <div className="flex items-center gap-2 justify-center">
              <ConfidenceIndicator score={confidenceScore} />
              <p className="text-sm text-muted-foreground">
                {reasonShort || confidenceMessage}
              </p>
            </div>
          </div>

          {/* AI Notices */}
          {notices.length > 0 && (
            <div className="mt-4 space-y-2">
              {notices.map((notice, idx) => (
                <AINoticeItem key={idx} notice={notice} />
              ))}
            </div>
          )}
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

      {/* Alternative sizes - smaller, limited to 2 */}
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
          
          {/* Loss aversion hint */}
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

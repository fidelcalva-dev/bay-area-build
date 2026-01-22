import { Lightbulb, Check, X, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Recommendation } from '@/hooks/useAlerts';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept: (id: string) => Promise<boolean>;
  onDismiss: (id: string) => Promise<boolean>;
  onAction?: (recommendation: Recommendation) => void;
  className?: string;
}

export function RecommendationCard({
  recommendation,
  onAccept,
  onDismiss,
  onAction,
  className,
}: RecommendationCardProps) {
  const getTypeColor = (recType: string) => {
    switch (recType) {
      case 'prepay_upsell':
        return 'border-l-emerald-500 bg-emerald-50/50';
      case 'contractor_program':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'size_upgrade':
        return 'border-l-purple-500 bg-purple-50/50';
      case 'schedule_adjustment':
        return 'border-l-amber-500 bg-amber-50/50';
      default:
        return 'border-l-primary bg-primary/5';
    }
  };

  const getTypeLabel = (recType: string) => {
    switch (recType) {
      case 'prepay_upsell':
        return 'Revenue Opportunity';
      case 'contractor_program':
        return 'Customer Upgrade';
      case 'size_upgrade':
        return 'Upsell';
      case 'schedule_adjustment':
        return 'Operations';
      default:
        return 'Recommendation';
    }
  };

  return (
    <Card className={cn('border-l-4 overflow-hidden', getTypeColor(recommendation.rec_type), className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white shadow-sm">
            <Lightbulb className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {getTypeLabel(recommendation.rec_type)}
              </span>
            </div>
            <h4 className="font-medium text-foreground">{recommendation.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
            
            <div className="flex items-center gap-2 mt-3">
              {recommendation.action_label && onAction && (
                <Button 
                  size="sm" 
                  onClick={() => onAction(recommendation)}
                  className="gap-1"
                >
                  {recommendation.action_label}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                className="gap-1"
                onClick={() => onAccept(recommendation.id)}
              >
                <Check className="w-4 h-4" />
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="gap-1 text-muted-foreground"
                onClick={() => onDismiss(recommendation.id)}
              >
                <X className="w-4 h-4" />
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
  onAccept: (id: string) => Promise<boolean>;
  onDismiss: (id: string) => Promise<boolean>;
  onAction?: (recommendation: Recommendation) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function RecommendationsList({
  recommendations,
  onAccept,
  onDismiss,
  onAction,
  loading = false,
  emptyMessage = 'No recommendations at this time',
}: RecommendationsListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/4 mb-2" />
              <div className="h-5 bg-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map(rec => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          onAccept={onAccept}
          onDismiss={onDismiss}
          onAction={onAction}
        />
      ))}
    </div>
  );
}

// ============================================================
// SEO REVIEW PROOF — Compact social-proof strip for SEO pages
// Shows stars, review count, and verified badge
// ============================================================
import { Star, CheckCircle } from 'lucide-react';
import { REVIEW_STATS } from '@/data/reviews';
import { cn } from '@/lib/utils';

interface SeoReviewProofProps {
  variant?: 'light' | 'card';
  className?: string;
}

export function SeoReviewProof({ variant = 'light', className }: SeoReviewProofProps) {
  return (
    <div className={cn(
      'flex flex-wrap items-center justify-center gap-3 py-4 px-4 rounded-xl',
      variant === 'card' && 'bg-card border border-border',
      variant === 'light' && 'bg-primary/5',
      className,
    )}>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-4 h-4',
              i < Math.floor(REVIEW_STATS.averageRating)
                ? 'fill-accent text-accent'
                : 'fill-muted text-muted',
            )}
          />
        ))}
      </div>
      <span className="font-bold text-foreground">{REVIEW_STATS.averageRating}</span>
      <span className="text-sm text-muted-foreground">
        from {REVIEW_STATS.totalReviews}+ verified reviews
      </span>
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3 h-3" />
        Google & Facebook
      </span>
    </div>
  );
}

// ============================================================
// SEO TRUST BAR — Reusable trust badge bar for SEO pages
// Wraps existing TrustStrip with SEO-optimized defaults
// ============================================================
import { TrustStrip, type TrustBadgeKey } from '@/components/shared/TrustStrip';
import { cn } from '@/lib/utils';

interface SeoTrustBarProps {
  badges?: TrustBadgeKey[];
  className?: string;
}

const SEO_DEFAULT_BADGES: TrustBadgeKey[] = [
  'licensedInsured',
  'fiveStarReviews',
  'sameDayAvailable',
  'noHiddenFees',
];

export function SeoTrustBar({ badges = SEO_DEFAULT_BADGES, className }: SeoTrustBarProps) {
  return (
    <div className={cn('bg-muted/50 border-y border-border py-3', className)}>
      <div className="container-wide flex justify-center">
        <TrustStrip badges={badges} variant="muted" size="sm" />
      </div>
    </div>
  );
}

import { Shield, Award, CheckCircle, Star, Clock, Users, Percent, Sparkles, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Canonical trust badge definitions
export const TRUST_BADGES = {
  // Core badges
  googleGuaranteed: { icon: Shield, label: 'Google Guaranteed' },
  licensedInsured: { icon: Award, label: 'Licensed & Insured' },
  hablamosEspanol: { icon: CheckCircle, label: 'Hablamos Español' },
  reviews: { icon: Star, label: '500+ Reviews' },
  sameDayAvailable: { icon: Clock, label: 'Same-Day Available' },
  noHiddenFees: { icon: Sparkles, label: 'No Hidden Fees' },
  // Special badges
  contractorDiscount: { icon: Percent, label: '10% Contractor Discount' },
  fiveStarReviews: { icon: Star, label: '4.9★ (200+ Reviews)' },
} as const;

export type TrustBadgeKey = keyof typeof TRUST_BADGES;

interface TrustBadge {
  icon: LucideIcon;
  label: string;
}

interface TrustStripProps {
  badges?: TrustBadgeKey[];
  customBadges?: TrustBadge[];
  variant?: 'hero' | 'light' | 'primary' | 'muted';
  size?: 'sm' | 'default';
  className?: string;
}

/**
 * Canonical Trust Strip component
 * Use this everywhere trust badges are needed
 */
export function TrustStrip({ 
  badges = ['googleGuaranteed', 'licensedInsured', 'hablamosEspanol'],
  customBadges,
  variant = 'hero',
  size = 'default',
  className 
}: TrustStripProps) {
  const allBadges: TrustBadge[] = customBadges || badges.map(key => TRUST_BADGES[key]);

  const variantStyles = {
    hero: 'bg-primary-foreground/10 backdrop-blur text-primary-foreground/90',
    light: 'bg-primary/10 text-primary',
    primary: 'bg-primary-foreground/5 text-primary-foreground',
    muted: 'bg-muted text-muted-foreground',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    default: 'px-2.5 py-1 text-xs md:text-sm gap-1.5',
  };

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <div className={cn('flex flex-wrap items-center gap-2 sm:gap-3', className)}>
      {allBadges.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className={cn(
            'inline-flex items-center rounded-full font-medium',
            variantStyles[variant],
            sizeStyles[size]
          )}
        >
          <Icon className={cn(iconSize, variant === 'hero' && 'text-accent')} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

interface StarRatingProps {
  rating?: number;
  reviews?: number;
  variant?: 'hero' | 'light';
  showLink?: boolean;
  className?: string;
}

/**
 * Canonical Star Rating component
 * Use this for consistent star display
 */
export function StarRating({ 
  rating = 5.0, 
  reviews = 500,
  variant = 'hero',
  showLink = true,
  className 
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={cn(
              'w-5 h-5',
              i < Math.floor(rating) 
                ? 'fill-accent text-accent' 
                : 'fill-muted text-muted'
            )} 
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          'font-bold',
          variant === 'hero' ? 'text-primary-foreground' : 'text-foreground'
        )}>
          {rating.toFixed(1)}
        </span>
        <span className={cn(
          'text-sm',
          variant === 'hero' ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          from
        </span>
        {showLink ? (
          <a 
            href="#reviews" 
            className={cn(
              'font-semibold text-sm hover:underline underline-offset-2',
              variant === 'hero' ? 'text-accent' : 'text-primary'
            )}
          >
            {reviews}+ reviews
          </a>
        ) : (
          <span className={cn(
            'font-semibold text-sm',
            variant === 'hero' ? 'text-accent' : 'text-primary'
          )}>
            {reviews}+ reviews
          </span>
        )}
      </div>
    </div>
  );
}

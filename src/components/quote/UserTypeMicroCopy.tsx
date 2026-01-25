import { cn } from '@/lib/utils';

// Canonical micro-copy for each user type (Phase 2, Item 4)
export const USER_TYPE_HELPER_TEXT: Record<string, {
  tagline: string;
  bullets: string[];
}> = {
  homeowner: {
    tagline: 'Best value · Simple pricing · Ideal for cleanouts & remodels',
    bullets: ['Transparent pricing', 'Flexible scheduling', 'Same-day available'],
  },
  contractor: {
    tagline: 'Priority scheduling · Higher tonnage options · Faster swaps',
    bullets: ['Volume programs available', 'Priority dispatch', 'Net-30 terms available'],
  },
  business: {
    tagline: 'Compliance · Reporting · Multi-location support',
    bullets: ['Dedicated support', 'Recurring service', 'Custom agreements'],
  },
  preferred_contractor: {
    tagline: 'Preferred pricing · Priority dispatch',
    bullets: ['Volume discounts', 'Dedicated account rep', 'Priority scheduling'],
  },
  wholesaler_broker: {
    tagline: 'Volume-based pricing · Dedicated support',
    bullets: ['Custom agreements', 'Multi-site support', 'White-label options'],
  },
};

interface UserTypeMicroCopyProps {
  userType: string;
  className?: string;
  variant?: 'inline' | 'expanded';
}

export function UserTypeMicroCopy({ userType, className, variant = 'inline' }: UserTypeMicroCopyProps) {
  const helperText = USER_TYPE_HELPER_TEXT[userType];
  
  if (!helperText) return null;
  
  if (variant === 'inline') {
    return (
      <p className={cn(
        "text-xs text-muted-foreground mt-1.5 transition-all duration-200",
        className
      )}>
        {helperText.tagline}
      </p>
    );
  }
  
  return (
    <div className={cn("mt-2 space-y-1", className)}>
      <p className="text-xs text-muted-foreground font-medium">{helperText.tagline}</p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {helperText.bullets.map((bullet) => (
          <li key={bullet} className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary/50" />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Yard value explanation component (Phase 2, Item 5)
interface YardValueExplanationProps {
  className?: string;
}

export function YardValueExplanation({ className }: YardValueExplanationProps) {
  return (
    <p className={cn(
      "text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1",
      className
    )}>
      <span className="text-primary">💡</span>
      Local yard selected automatically for speed and availability
    </p>
  );
}

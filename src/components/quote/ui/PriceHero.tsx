// ============================================================
// PRICE HERO - Big centered price display with CTA
// Includes pricing psychology optimizations
// ============================================================
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Check, ChevronDown, MapPin, Shield, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface IncludedItem {
  label: string;
  icon?: LucideIcon;
}

interface PriceHeroProps {
  price: number;
  priceLabel?: string; // e.g. "Your recommended price"
  subtitle?: string;
  ctaLabel: string;
  ctaIcon?: LucideIcon;
  onCtaClick: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  includedItems?: IncludedItem[];
  whatsIncludedLabel?: string;
  className?: string;
  // Pricing psychology props (Phase 3, 4, 7)
  isRecommendedSize?: boolean;
  isHeavyOrYard?: boolean;
}

// Trust signals for Phase 7
const TRUST_SIGNALS = [
  'Local yards · Transparent pricing',
  'No hidden fees',
  'Trusted by homeowners and contractors',
];

export function PriceHero({
  price,
  priceLabel = 'Your instant quote',
  subtitle,
  ctaLabel,
  ctaIcon: CtaIcon,
  onCtaClick,
  ctaDisabled = false,
  ctaLoading = false,
  includedItems = [],
  whatsIncludedLabel = "What's included?",
  className,
  isRecommendedSize = true,
  isHeavyOrYard = false,
}: PriceHeroProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Phase 4: De-risking micro-copy
  const deRiskingCopy = isHeavyOrYard
    ? "We'll guide you if any adjustments are needed."
    : "Exact pricing based on your ZIP and availability.";

  // Phase 7: Rotate trust signals or pick one
  const trustSignal = TRUST_SIGNALS[0];

  return (
    <div className={cn(
      'rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden',
      className
    )}>
      {/* Price display */}
      <div className="p-6 text-center">
        {/* Phase 3: Value badge above price */}
        <div className="mb-2">
          {isRecommendedSize ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
              <Check className="w-3 h-3" />
              Best value for your selection
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
              Selected size
            </span>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground mb-1">{priceLabel}</div>
        <div className="text-5xl font-bold text-foreground tracking-tight">
          ${price.toLocaleString()}
        </div>
        {subtitle && (
          <div className="text-sm text-muted-foreground mt-2">
            {subtitle}
          </div>
        )}
        
        {/* Phase 4: De-risking micro-copy */}
        <div className="text-xs text-muted-foreground/80 mt-3">
          {deRiskingCopy}
        </div>
      </div>

      {/* What's included accordion */}
      {includedItems.length > 0 && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full px-5 py-3 bg-muted/30 border-t border-border flex items-center justify-between text-sm hover:bg-muted/50 transition-colors">
            <span className="text-muted-foreground">{whatsIncludedLabel}</span>
            <ChevronDown className={cn(
              'w-4 h-4 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-5 py-4 bg-muted/20 border-t border-border/50">
            <ul className="space-y-2">
              {includedItems.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  {item.icon ? (
                    <item.icon className="w-4 h-4 text-success shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-success shrink-0" />
                  )}
                  {item.label}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* CTA Button */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="cta"
          size="lg"
          className="w-full h-14 text-base"
          onClick={onCtaClick}
          disabled={ctaDisabled || ctaLoading}
        >
          {ctaLoading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>
              {CtaIcon && <CtaIcon className="w-5 h-5" />}
              {ctaLabel}
            </>
          )}
        </Button>
        
        {/* Phase 7: Trust signal below CTA */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70">
          <Shield className="w-3 h-3" />
          <span>{trustSignal}</span>
        </div>
      </div>
    </div>
  );
}

export default PriceHero;

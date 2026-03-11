// Reusable Pricing Policy Display Block
// Renders canonical pricing policies from pricingConfig.ts

import { AlertTriangle, Info, Shield, Weight } from 'lucide-react';
import { POLICIES, PRICING_CONFIG, formatPrice, getHeavySizeListLabel } from '@/config/pricingConfig';
import { cn } from '@/lib/utils';

interface PricingPolicyBlockProps {
  /** Which sections to show */
  show?: ('includedTons' | 'heavyRule' | 'contamination' | 'overweight' | 'misdeclared')[];
  /** Optional: specific size to show included tons for */
  sizeYards?: number;
  /** Compact mode for inline usage */
  compact?: boolean;
  className?: string;
}

export function PricingPolicyBlock({
  show = ['includedTons', 'heavyRule', 'contamination', 'overweight'],
  sizeYards,
  compact = false,
  className,
}: PricingPolicyBlockProps) {
  const items: { icon: typeof Info; label: string; text: string; variant: 'info' | 'warning' }[] = [];

  if (show.includes('includedTons')) {
    const sizeEntry = sizeYards
      ? PRICING_CONFIG.GENERAL_DEBRIS.sizes.find(s => s.size === sizeYards)
      : undefined;
    const tonsText = sizeEntry
      ? `${sizeEntry.size}-yard includes ${sizeEntry.includedTons} ton${sizeEntry.includedTons > 1 ? 's' : ''} of general debris.`
      : `Each dumpster includes a base weight allowance. Overage is ${formatPrice(POLICIES.overweightCostPerTon)}/ton.`;
    items.push({ icon: Weight, label: 'Included Weight', text: tonsText, variant: 'info' });
  }

  if (show.includes('overweight')) {
    items.push({
      icon: Info,
      label: 'Overweight Policy',
      text: POLICIES.generalDebrisOverageRule,
      variant: 'info',
    });
  }

  if (show.includes('heavyRule')) {
    items.push({
      icon: AlertTriangle,
      label: 'Heavy Material Rule',
      text: `${POLICIES.heavyMaterialRule} Available in ${getHeavySizeListLabel()} yard sizes only.`,
      variant: 'warning',
    });
  }

  if (show.includes('contamination')) {
    items.push({
      icon: Shield,
      label: 'Contamination Policy',
      text: POLICIES.contaminationRule,
      variant: 'warning',
    });
  }

  if (show.includes('misdeclared')) {
    items.push({
      icon: AlertTriangle,
      label: 'Misdeclared Material',
      text: POLICIES.misdeclaredRule,
      variant: 'warning',
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
            item.variant === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300'
              : 'bg-muted/50 text-muted-foreground',
            compact && 'text-xs px-2 py-1.5'
          )}
        >
          <item.icon className={cn('shrink-0 mt-0.5', compact ? 'w-3 h-3' : 'w-4 h-4')} />
          <div>
            {!compact && <span className="font-medium">{item.label}: </span>}
            {item.text}
          </div>
        </div>
      ))}
    </div>
  );
}

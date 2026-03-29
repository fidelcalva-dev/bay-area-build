import { Shield, Clock, DollarSign, HardHat } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Shield, label: 'CSLB #1152237' },
  { icon: Clock, label: 'Fast Response' },
  { icon: DollarSign, label: 'Clear Pricing' },
  { icon: HardHat, label: 'Contractor-Focused' },
];

export function CleanupTrustStrip() {
  return (
    <div className="bg-muted border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Icon className="w-3.5 h-3.5 text-primary" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

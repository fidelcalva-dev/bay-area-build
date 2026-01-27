// ============================================================
// SUMMARY CARD - Compact order summary display
// ============================================================
import { cn } from '@/lib/utils';
import { MapPin, Package, Calendar, DollarSign } from 'lucide-react';

interface SummaryItem {
  icon?: React.ReactNode;
  label: string;
  value: string;
}

interface SummaryCardProps {
  location?: string;
  material?: string;
  size?: string;
  price?: number;
  rentalDays?: number;
  items?: SummaryItem[];
  className?: string;
}

export function SummaryCard({
  location,
  material,
  size,
  price,
  rentalDays = 7,
  items,
  className,
}: SummaryCardProps) {
  // Default items from props
  const defaultItems: SummaryItem[] = [];
  
  if (location) {
    defaultItems.push({
      icon: <MapPin className="w-4 h-4 text-muted-foreground" />,
      label: 'Location',
      value: location,
    });
  }
  
  if (material) {
    defaultItems.push({
      icon: <Package className="w-4 h-4 text-muted-foreground" />,
      label: 'Material',
      value: material,
    });
  }
  
  if (size) {
    defaultItems.push({
      icon: <Package className="w-4 h-4 text-muted-foreground" />,
      label: 'Size',
      value: size,
    });
  }
  
  if (rentalDays) {
    defaultItems.push({
      icon: <Calendar className="w-4 h-4 text-muted-foreground" />,
      label: 'Rental',
      value: `${rentalDays} days`,
    });
  }

  const displayItems = items || defaultItems;

  return (
    <div className={cn(
      'rounded-xl border border-border bg-muted/30 overflow-hidden',
      className
    )}>
      {/* Items grid */}
      <div className="divide-y divide-border/50">
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <span className="font-medium text-foreground text-sm">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Price footer */}
      {price !== undefined && (
        <div className="flex items-center justify-between px-4 py-4 bg-muted/50 border-t border-border">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-2xl font-bold text-foreground">
            ${price.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

// Mini variant for inline display
interface SummaryCardMiniProps {
  size: string;
  material: string;
  price: number;
  rentalDays?: number;
  className?: string;
}

export function SummaryCardMini({
  size,
  material,
  price,
  rentalDays = 7,
  className,
}: SummaryCardMiniProps) {
  return (
    <div className={cn(
      'flex items-center justify-between rounded-xl bg-muted/50 p-4',
      className
    )}>
      <div>
        <div className="font-semibold text-foreground">{size}</div>
        <div className="text-sm text-muted-foreground">
          {material} • {rentalDays} days
        </div>
      </div>
      <div className="text-xl font-bold text-foreground">
        ${price.toLocaleString()}
      </div>
    </div>
  );
}

export default SummaryCard;

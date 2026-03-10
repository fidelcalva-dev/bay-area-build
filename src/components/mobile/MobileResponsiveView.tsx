/**
 * MobileResponsiveView — Switches between table (desktop) and card (mobile) views.
 * Wrap any data list with this to get automatic mobile card conversion.
 */
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileResponsiveViewProps<T> {
  data: T[];
  /** Rendered on desktop (md+) */
  renderTable: () => ReactNode;
  /** Rendered per item on mobile */
  renderCard: (item: T, index: number) => ReactNode;
  /** Empty state */
  emptyMessage?: string;
  className?: string;
}

export function MobileResponsiveView<T>({
  data,
  renderTable,
  renderCard,
  emptyMessage = 'No items found',
  className = '',
}: MobileResponsiveViewProps<T>) {
  const isMobile = useIsMobile();

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item, i) => renderCard(item, i))}
      </div>
    );
  }

  return <>{renderTable()}</>;
}

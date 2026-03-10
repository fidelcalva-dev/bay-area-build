/**
 * MobileScrollTabs — Horizontally scrollable tabs for mobile.
 * Replaces flex-wrap TabsList that overflows on small screens.
 */
import { ReactNode } from 'react';
import { TabsList } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileScrollTabsProps {
  children: ReactNode;
}

export function MobileScrollTabs({ children }: MobileScrollTabsProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <TabsList className="inline-flex w-max h-auto gap-1 bg-muted/50 p-1">
          {children}
        </TabsList>
      </div>
    );
  }

  return (
    <TabsList className="flex-wrap h-auto gap-1">
      {children}
    </TabsList>
  );
}

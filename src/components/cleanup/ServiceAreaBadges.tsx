/**
 * ServiceAreaBadges — Pills listing the active cleanup service areas.
 * Strictly limited to in-area markets per business policy.
 */

import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const AREAS = ['Oakland', 'San Jose', 'San Francisco', 'East Bay'];

interface ServiceAreaBadgesProps {
  className?: string;
  align?: 'start' | 'center';
}

export function ServiceAreaBadges({ className, align = 'center' }: ServiceAreaBadgesProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-2',
        align === 'center' ? 'justify-center' : 'justify-start',
        className,
      )}
    >
      {AREAS.map((area) => (
        <span
          key={area}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-semibold"
        >
          <MapPin className="w-3 h-3" />
          {area}
        </span>
      ))}
    </div>
  );
}

export default ServiceAreaBadges;

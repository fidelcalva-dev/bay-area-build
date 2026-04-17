/**
 * BeforeAfterStrip — Compact CSS-only "before / after" visual indicator
 * for cleanup service cards. No real photos required.
 *
 *   [ BEFORE — debris pattern (warm/red) ] [ AFTER — clean (green) ]
 */

import { Trash2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeAfterStripProps {
  className?: string;
}

export function BeforeAfterStrip({ className }: BeforeAfterStripProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 rounded-lg overflow-hidden border border-border h-16',
        className,
      )}
      aria-hidden="true"
    >
      {/* BEFORE — debris-textured warm panel */}
      <div className="relative flex items-center justify-center gap-1.5 bg-orange-100 text-orange-900 overflow-hidden">
        {/* debris speckle */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, #b45309 1.5px, transparent 2px), radial-gradient(circle at 70% 60%, #92400e 1.5px, transparent 2px), radial-gradient(circle at 40% 80%, #78350f 1px, transparent 1.5px), radial-gradient(circle at 85% 25%, #b45309 1px, transparent 1.5px)',
            backgroundSize: '24px 24px, 18px 18px, 14px 14px, 22px 22px',
          }}
        />
        <Trash2 className="w-3.5 h-3.5 relative z-10" />
        <span className="text-[10px] font-bold uppercase tracking-wider relative z-10">Before</span>
      </div>
      {/* AFTER — clean green panel */}
      <div className="relative flex items-center justify-center gap-1.5 bg-green-100 text-green-900">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">After</span>
      </div>
    </div>
  );
}

export default BeforeAfterStrip;

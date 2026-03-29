// ============================================================
// SEO SUPPORT SECTION — Materials / Permits / Same-Day strip
// Reusable across all SEO landing pages
// ============================================================
import { Package, FileText, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { trackServiceCTAClick } from '@/lib/analytics/seoTracking';

const SUPPORT_ITEMS = [
  {
    icon: Package,
    title: 'Materials Allowed',
    desc: 'Concrete, roofing, drywall, yard waste and more.',
    href: '/what-can-you-put-in-a-dumpster',
    linkLabel: 'See full list →',
  },
  {
    icon: FileText,
    title: 'Permit Help',
    desc: 'Street placement may need a permit. We guide you.',
    href: '/permits',
    linkLabel: 'Permit info →',
  },
  {
    icon: Zap,
    title: 'Same-Day Delivery',
    desc: 'Need it today? We offer same-day in many Bay Area cities.',
    href: '/quote',
    linkLabel: 'Check availability →',
  },
];

interface SeoSupportSectionProps {
  page?: string;
  className?: string;
}

export function SeoSupportSection({ page = '', className }: SeoSupportSectionProps) {
  return (
    <section className={cn('py-12 md:py-16 bg-muted/50', className)}>
      <div className="container-wide">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8 text-center">
          Everything you need to know
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUPPORT_ITEMS.map((item) => (
            <div
              key={item.title}
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-colors"
            >
              <item.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
              <Link
                to={item.href}
                onClick={() => trackServiceCTAClick(page, item.title)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {item.linkLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

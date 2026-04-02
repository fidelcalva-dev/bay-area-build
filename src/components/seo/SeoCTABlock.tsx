// ============================================================
// SEO CTA BLOCK — Repeatable hero/mid/end CTA section
// ============================================================
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BUSINESS_INFO } from '@/lib/seo';
import { trackQuoteClick, trackPhoneClick } from '@/lib/analytics/seoTracking';
import { cn } from '@/lib/utils';

interface SeoCTABlockProps {
  page: string;
  headline?: string;
  subline?: string;
  quoteHref?: string;
  showPhone?: boolean;
  variant?: 'primary' | 'muted' | 'card';
  className?: string;
}

export function SeoCTABlock({
  page,
  headline = 'Find the right dumpster for your project',
  subline = 'Check pricing in your area. No hidden fees. Local Bay Area service.',
  quoteHref = '/quote',
  showPhone = true,
  variant = 'primary',
  className,
}: SeoCTABlockProps) {
  const bg = {
    primary: 'bg-primary text-primary-foreground',
    muted: 'bg-muted text-foreground',
    card: 'bg-card border border-border text-foreground',
  };

  return (
    <section className={cn('py-10 md:py-14', bg[variant], className)}>
      <div className="container-wide text-center max-w-xl mx-auto space-y-4">
        <h2 className={cn(
          'text-xl md:text-2xl font-bold',
          variant === 'primary' ? 'text-primary-foreground' : 'text-foreground',
        )}>
          {headline}
        </h2>
        <p className={cn(
          'text-sm',
          variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground',
        )}>
          {subline}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to={quoteHref} onClick={() => trackQuoteClick(page)}>
            <Button
              variant={variant === 'primary' ? 'secondary' : 'cta'}
              size="lg"
              className="gap-2 w-full sm:w-auto"
            >
              Get Exact Price
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          {showPhone && (
            <a
              href={`tel:${BUSINESS_INFO.phone.sales.replace(/\D/g, '')}`}
              onClick={() => trackPhoneClick(page)}
            >
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  'gap-2 w-full sm:w-auto',
                  variant === 'primary' && 'border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10',
                )}
              >
                <Phone className="w-4 h-4" />
                {BUSINESS_INFO.phone.salesFormatted}
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

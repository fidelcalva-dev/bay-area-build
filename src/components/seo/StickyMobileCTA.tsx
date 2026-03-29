// ============================================================
// STICKY MOBILE CTA — Dual phone + quote buttons at bottom
// ============================================================
import { Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/seo';
import { trackPhoneClick, trackStickyCTAClick, trackQuoteClick } from '@/lib/analytics/seoTracking';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface StickyMobileCTAProps {
  page: string;
  quoteHref?: string;
  onQuoteClick?: () => void;
  showPhone?: boolean;
  showQuote?: boolean;
  className?: string;
}

export function StickyMobileCTA({
  page,
  quoteHref = '/quote',
  onQuoteClick,
  showPhone = true,
  showQuote = true,
  className,
}: StickyMobileCTAProps) {
  const handlePhone = () => {
    trackPhoneClick(page);
    trackStickyCTAClick(page, 'phone');
  };

  const handleQuote = () => {
    trackQuoteClick(page);
    trackStickyCTAClick(page, 'quote');
    onQuoteClick?.();
  };

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 md:hidden z-50',
      'bg-background/95 backdrop-blur-sm border-t border-border p-3',
      'safe-area-pb',
      className,
    )}>
      <div className="flex gap-2">
        {showPhone && (
          <a
            href={`tel:${BUSINESS_INFO.phone.sales.replace(/\D/g, '')}`}
            onClick={handlePhone}
            className="flex-1"
          >
            <Button variant="outline" className="w-full gap-2 h-12">
              <Phone className="w-4 h-4" />
              Call Now
            </Button>
          </a>
        )}
        {showQuote && (
          <Link to={quoteHref} onClick={handleQuote} className={showPhone ? 'flex-1' : 'w-full'}>
            <Button variant="cta" className="w-full gap-2 h-12">
              Get Quote
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

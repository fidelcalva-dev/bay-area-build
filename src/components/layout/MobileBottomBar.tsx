import { Phone, MessageCircle, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/seo';
import { CTA_LINKS } from '@/lib/shared-data';
import { ga4 } from '@/lib/analytics/ga4';

export function MobileBottomBar() {
  const location = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Shadow overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent -top-6 pointer-events-none" />
      
      <div className="relative bg-card border-t border-border shadow-2xl">
        <div className="grid grid-cols-3 divide-x divide-border">
          {/* Quote - Primary CTA */}
          <Link to="/quote" className="block" onClick={() => ga4.clickGetQuote({ page: location.pathname })}>
            <Button variant="mobileBarCta" className="w-full h-full rounded-none min-h-[56px]">
              <FileText className="w-5 h-5" strokeWidth={2} />
              <span className="text-xs font-bold">Quote</span>
            </Button>
          </Link>
          
          {/* Text */}
          <a href={`sms:${BUSINESS_INFO.phone.sales}`} className="block" onClick={() => ga4.clickSms({ page: location.pathname })}>
            <Button variant="mobileBar" className="w-full h-full rounded-none min-h-[56px] text-foreground hover:bg-muted">
              <MessageCircle className="w-5 h-5" strokeWidth={2} />
              <span className="text-xs font-semibold">Text</span>
            </Button>
          </a>
          
          {/* Call */}
          <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="block" onClick={() => ga4.clickCall({ page: location.pathname })}>
            <Button variant="mobileBar" className="w-full h-full rounded-none min-h-[56px] text-foreground hover:bg-muted">
              <Phone className="w-5 h-5" strokeWidth={2} />
              <span className="text-xs font-semibold">Call</span>
            </Button>
          </a>
        </div>
        
        {/* Safe area padding for notched phones */}
        <div className="h-[env(safe-area-inset-bottom)] bg-card" />
      </div>
    </div>
  );
}

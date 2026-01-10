import { Phone, MessageSquare, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function MobileBottomBar() {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Shadow overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent -top-4 pointer-events-none" />
      
      <div className="relative bg-card border-t-2 border-border shadow-2xl">
        <div className="flex items-stretch divide-x divide-border">
          {/* Quote - Primary CTA */}
          <Link to="/#quote" className="flex-1">
            <Button variant="mobileBarCta" className="w-full h-full rounded-none min-h-[60px]">
              <FileText className="w-5 h-5" />
              <span className="text-xs font-bold">{t('cta.quote')}</span>
            </Button>
          </Link>
          
          {/* Call */}
          <a href="tel:+15106802150" className="flex-1">
            <Button variant="mobileBar" className="w-full h-full rounded-none min-h-[60px] text-primary hover:bg-primary/5">
              <Phone className="w-5 h-5" />
              <span className="text-xs font-semibold">{t('cta.call')}</span>
            </Button>
          </a>
          
          {/* Text */}
          <a href="sms:+15106802150" className="flex-1">
            <Button variant="mobileBar" className="w-full h-full rounded-none min-h-[60px] text-primary hover:bg-primary/5">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-semibold">{t('cta.text')}</span>
            </Button>
          </a>
        </div>
        
        {/* Safe area padding for notched phones */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}

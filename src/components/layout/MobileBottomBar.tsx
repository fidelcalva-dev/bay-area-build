import { Phone, MessageSquare, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function MobileBottomBar() {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border shadow-lg">
      <div className="flex items-stretch">
        <Link to="/#quote" className="flex-1">
          <Button variant="mobileBarCta" className="w-full h-full rounded-none">
            <FileText className="w-5 h-5" />
            <span>{t('cta.quote')}</span>
          </Button>
        </Link>
        <a href="tel:+15106802150" className="flex-1">
          <Button variant="mobileBar" className="w-full h-full text-primary">
            <Phone className="w-5 h-5" />
            <span>{t('cta.call')}</span>
          </Button>
        </a>
        <a href="sms:+15106802150" className="flex-1">
          <Button variant="mobileBar" className="w-full h-full text-primary">
            <MessageSquare className="w-5 h-5" />
            <span>{t('cta.text')}</span>
          </Button>
        </a>
      </div>
    </div>
  );
}

import { Phone, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TRASHLAB_URL = 'https://app.trashlab.com';

export function MobileBottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Shadow overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent -top-6 pointer-events-none" />
      
      <div className="relative bg-card border-t border-border shadow-2xl">
        <div className="grid grid-cols-3 divide-x divide-border">
          {/* Quote - Primary CTA */}
          <a href={TRASHLAB_URL} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="mobileBarCta" className="w-full h-full rounded-none min-h-[56px]">
              <FileText className="w-5 h-5" />
              <span className="text-xs font-bold">Quote</span>
            </Button>
          </a>
          
          {/* Text */}
          <a href="sms:+15106802150" className="block">
            <Button variant="mobileBar" className="w-full h-full rounded-none min-h-[56px] text-foreground hover:bg-muted">
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-semibold">Text</span>
            </Button>
          </a>
          
          {/* Call */}
          <a href="tel:+15106802150" className="block">
            <Button variant="mobileBar" className="w-full h-full rounded-none min-h-[56px] text-foreground hover:bg-muted">
              <Phone className="w-5 h-5" />
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

// ============================================================
// PAGE SHELL PUBLIC - Uber-like container for public pages
// Clean, modern, mobile-first with consistent structure
// ============================================================
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Shield, Phone, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BUSINESS_INFO } from '@/lib/seo';


interface PageShellPublicProps {
  children: ReactNode;
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  backLabel?: string;
  backHref?: string;
  showTrustBar?: boolean;
  showPhoneCTA?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const TRUST_ITEMS = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: Clock, label: 'Same-Day Available' },
];

export function PageShellPublic({
  children,
  className,
  showBackButton = false,
  onBack,
  backLabel = 'Back',
  backHref,
  showTrustBar = true,
  showPhoneCTA = true,
  maxWidth = 'md',
}: PageShellPublicProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Trust bar - top strip */}
      {showTrustBar && (
        <div className="bg-primary/5 border-b border-border/50 py-2">
          <div className="container-wide">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container-wide py-6 md:py-8">
        <div className={cn('mx-auto', maxWidthClasses[maxWidth], className)}>
          {/* Back button */}
          {showBackButton && (
            <div className="mb-4">
              {backHref ? (
                <Link to={backHref}>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    {backLabel}
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-muted-foreground hover:text-foreground"
                  onClick={onBack}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {backLabel}
                </Button>
              )}
            </div>
          )}

          {/* Content */}
          {children}
        </div>
      </div>

      {/* Phone CTA - fixed bottom on mobile */}
      {showPhoneCTA && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background/95 backdrop-blur-lg border-t border-border p-3 z-40">
          <a href={`tel:${BUSINESS_INFO.phone.sales.replace(/\D/g, '')}`} className="block">
            <Button variant="outline" className="w-full gap-2">
              <Phone className="w-4 h-4" />
              Call {BUSINESS_INFO.phone.salesFormatted}
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}

export default PageShellPublic;

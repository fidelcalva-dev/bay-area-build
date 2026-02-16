import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CTA_CONFIG } from '@/components/shared';

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  variant?: 'primary' | 'secondary' | 'dark';
}

export function CTASection({ 
  title = 'Ready to get started?', 
  subtitle = 'Get an instant estimate in 60 seconds. Same-day delivery available.',
  variant = 'secondary'
}: CTASectionProps) {
  const bgClass = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    dark: 'bg-foreground text-background',
  }[variant];

  return (
    <section className={`py-16 md:py-20 ${bgClass}`}>
      <div className="container-narrow text-center">
        {/* Headline */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
          {title}
        </h2>
        <p className="text-lg opacity-70 max-w-xl mx-auto mb-8">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <Button asChild variant="cta" size="lg" className="group">
            <a href="#quote">
              Get instant estimate
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-transparent border-current hover:bg-white/10">
            <a href={`tel:${CTA_CONFIG.phone}`}>
              Call {CTA_CONFIG.phoneFormatted}
            </a>
          </Button>
        </div>

        <p className="text-sm opacity-50 flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Hablamos Español
        </p>
      </div>
    </section>
  );
}

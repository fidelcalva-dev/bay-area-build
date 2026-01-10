import { useState } from 'react';
import { ClipboardCheck, Truck, HardHat, PhoneCall, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function HowItWorksSection() {
  const { t } = useLanguage();
  const [videoOpen, setVideoOpen] = useState(false);

  const steps = [
    {
      icon: ClipboardCheck,
      number: '1',
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
    },
    {
      icon: Truck,
      number: '2',
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
    },
    {
      icon: HardHat,
      number: '3',
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
    },
    {
      icon: PhoneCall,
      number: '4',
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
    },
  ];

  return (
    <section className="section-padding bg-muted">
      <div className="container-wide">
        <div className="text-center mb-10">
          <h2 className="heading-lg text-foreground mb-3">{t('howItWorks.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* Video + Steps Layout */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-10 mb-10">
          {/* Video Embed */}
          <div className="lg:col-span-2 order-1">
            <div 
              className="relative aspect-video bg-foreground rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
              onClick={() => setVideoOpen(true)}
            >
              {/* Placeholder background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                  <p className="text-background font-semibold text-sm md:text-base px-4">
                    How Dumpster Rental Works
                  </p>
                  <p className="text-background/70 text-xs mt-1">
                    Calsan Dumpsters Pro
                  </p>
                </div>
              </div>

              {/* Placeholder notice */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-background/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center">
                  <span className="text-[10px] text-background/70">
                    📹 Replace with your explainer video
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="lg:col-span-3 order-2">
            <div className="grid sm:grid-cols-2 gap-4">
              {steps.map((step) => (
                <div key={step.title} className="relative">
                  <div className="relative z-10 bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-card-hover transition-all h-full">
                    {/* Step Number Badge */}
                    <div className="absolute -top-2.5 left-4 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {step.number}
                    </div>
                    
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                        <step.icon className="w-6 h-6" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-foreground mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild variant="cta" size="lg">
            <Link to="/#quote">
              {t('howItWorks.cta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <div className="aspect-video bg-foreground flex items-center justify-center">
            <div className="text-center text-background p-8">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-bold mb-2">How Dumpster Rental Works</p>
              <p className="text-base opacity-80 mb-1">Calsan Dumpsters Pro</p>
              <p className="text-sm opacity-50">
                Replace with YouTube/Vimeo embed
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
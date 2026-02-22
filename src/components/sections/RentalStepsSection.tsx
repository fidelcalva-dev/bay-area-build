import { Phone, Globe, Calendar, Truck, PackageCheck } from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
const rentalVideo = '/videos/calsan-rental-steps.mp4';

const steps = [
  {
    number: '1',
    icon: Phone,
    title: 'Contact Us',
    description: 'Call our team or request a quote online — we respond fast.',
  },
  {
    number: '2',
    icon: Globe,
    title: 'Get Your Quote',
    description: 'Tell us your project details and receive transparent pricing instantly.',
  },
  {
    number: '3',
    icon: Calendar,
    title: 'Schedule Delivery',
    description: 'Pick a date that works for you — same-day may be available.',
  },
  {
    number: '4',
    icon: Truck,
    title: 'We Drop It Off',
    description: 'Our driver delivers the dumpster right where you need it.',
  },
  {
    number: '5',
    icon: PackageCheck,
    title: 'Schedule Pickup',
    description: 'When you\'re done, let us know and we\'ll haul it away.',
  },
];

export function RentalStepsSection() {
  return (
    <section className="py-16 md:py-24 bg-[hsl(140,40%,95%)]">
      <div className="container-wide">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[hsl(140,50%,40%)]/10 rounded-full text-sm font-medium text-[hsl(140,50%,30%)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(140,50%,40%)]" />
            How it works
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            How to Rent a Dumpster
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            From your first call to final pickup — we make it simple.
          </p>
        </AnimatedSection>

        <StaggeredContainer className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 max-w-5xl mx-auto mb-12">
          {steps.map((step) => (
            <AnimatedItem key={step.title} variant="fadeUp">
              <div className="text-center group">
                <div className="relative mx-auto mb-3 w-14 h-14 md:w-16 md:h-16 rounded-full bg-card border-2 border-border flex items-center justify-center group-hover:border-[hsl(140,50%,40%)] transition-colors">
                  <step.icon className="w-6 h-6 md:w-7 md:h-7 text-[hsl(140,50%,35%)]" strokeWidth={1.75} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[hsl(140,50%,35%)] text-white rounded-full text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-sm md:text-base mb-1">{step.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-snug">{step.description}</p>
              </div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>

        <AnimatedSection delay={0.2} className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border bg-card">
            <video
              className="w-full aspect-video"
              controls
              playsInline
              preload="none"
            >
              <source src={rentalVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

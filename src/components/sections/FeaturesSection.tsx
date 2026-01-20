import { Truck, DollarSign, MessageSquare, Shield, Zap, MapPin } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant estimates',
    description: 'ZIP-based pricing. No calls needed.',
  },
  {
    icon: MapPin,
    title: 'Smart routing',
    description: 'Nearest yard auto-selected for faster delivery.',
  },
  {
    icon: DollarSign,
    title: 'Transparent pricing',
    description: 'All-inclusive. No surprise fees.',
  },
  {
    icon: MessageSquare,
    title: 'Text updates',
    description: 'Driver ETA, delivery confirmation, pickup reminder.',
  },
  {
    icon: Truck,
    title: 'Same-day available',
    description: 'Order by noon, delivered today.',
  },
  {
    icon: Shield,
    title: 'Google Guaranteed',
    description: 'Verified, licensed, and insured.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-wide">
        {/* Header - System style */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Platform features
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Built different
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Modern logistics technology, not a rental flyer.
          </p>
        </div>

        {/* Features Grid - Clean cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

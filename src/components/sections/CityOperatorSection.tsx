import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Megaphone, 
  Headphones, 
  TrendingUp,
  ChevronRight,
  MapPin
} from 'lucide-react';

const benefits = [
  {
    icon: Building2,
    title: 'No Dumpster Investment',
    description: 'We provide the roll-off containers — you focus on running the business.',
  },
  {
    icon: Megaphone,
    title: 'Established Brand',
    description: 'Leverage our reputation, reviews, and marketing from day one.',
  },
  {
    icon: Headphones,
    title: 'Centralized Dispatch & Billing',
    description: 'Our systems handle scheduling, payments, and customer support.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Opportunities',
    description: 'Expand into multiple cities as you grow your operations.',
  },
];

export const CityOperatorSection = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-secondary via-secondary to-secondary/95">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin className="h-4 w-4" />
              Now Expanding Across California
            </div>
            
            <h2 className="heading-lg text-secondary-foreground mb-6">
              Become a Local Dumpster Operator
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Calsan provides the dumpsters, yard, systems, branding, and marketing. 
              You focus on operations in your city. It's a turnkey opportunity for 
              entrepreneurs who want to own their local market.
            </p>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 bg-card/5 rounded-xl border border-border/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-foreground text-sm mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="cta" size="lg" asChild>
                <Link to="/careers#city-operators">
                  Apply to Become an Operator
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-border" asChild>
                <Link to="/careers">
                  View All Opportunities
                </Link>
              </Button>
            </div>
          </div>

          {/* Visual / Stats Card */}
          <div className="relative">
            <div className="bg-card rounded-2xl p-8 border border-border/30 shadow-xl">
              <h3 className="font-bold text-foreground text-xl mb-6 text-center">
                Expansion Cities
              </h3>
              
              <div className="space-y-3 mb-8">
                {[
                  { city: 'Sacramento', status: 'Opening Soon' },
                  { city: 'Stockton', status: 'Opening Soon' },
                  { city: 'Fresno', status: 'Seeking Operators' },
                  { city: 'Los Angeles', status: 'Seeking Operators' },
                  { city: 'San Diego', status: 'Seeking Operators' },
                  { city: 'Bakersfield', status: 'Seeking Operators' },
                ].map((item, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{item.city}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.status === 'Opening Soon' 
                        ? 'bg-primary/10 text-primary'
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-6 border-t border-border/30">
                <p className="text-sm text-muted-foreground mb-4">
                  Don't see your city? We're always open to new markets.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="tel:+15106802150">
                    Call to Discuss: (510) 680-2150
                  </a>
                </Button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

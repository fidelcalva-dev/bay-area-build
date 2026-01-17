import { Shield, Award, Star, ExternalLink, CheckCircle } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seo';

const trustBadges = [
  {
    id: 'google',
    icon: Shield,
    title: 'Google Guaranteed',
    subtitle: 'Verified Local Service',
    description: 'Google screens our background, licenses & insurance. If you\'re not satisfied, Google may reimburse up to $2,000.',
    link: BUSINESS_INFO.social.googleGuarantee,
    linkText: 'Learn about Google Guarantee',
    featured: true,
  },
  {
    id: 'bbb',
    icon: Award,
    title: 'BBB A+ Rating',
    subtitle: 'Accredited Business',
    description: 'Accredited by the Better Business Bureau with an A+ rating for trust, transparency, and customer service.',
    link: BUSINESS_INFO.social.bbb,
    linkText: 'View BBB Profile',
    featured: false,
  },
  {
    id: 'yelp',
    icon: Star,
    title: '5.0 on Yelp',
    subtitle: '200+ Reviews',
    description: 'Real customers, real reviews. See what Oakland and Bay Area customers say about their dumpster rental experience.',
    link: BUSINESS_INFO.social.yelp,
    linkText: 'Read Yelp Reviews',
    featured: false,
  },
];

export function TrustBadgesSection() {
  return (
    <section className="section-padding bg-card border-y border-border">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-semibold text-primary mb-6">
            <CheckCircle className="w-4 h-4" />
            <span>Trusted & Verified</span>
          </div>
          <h2 className="heading-lg text-foreground mb-4">
            Why Customers Choose Us
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Backed by industry-leading certifications and hundreds of 5-star reviews from Bay Area customers.
          </p>
        </div>

        {/* Trust Badges Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {trustBadges.map((badge) => (
            <div
              key={badge.id}
              className={`relative p-6 lg:p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                badge.featured
                  ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10'
                  : 'bg-background border-border'
              }`}
            >
              {/* Featured Label */}
              {badge.featured && (
                <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Featured
                </div>
              )}

              {/* Icon */}
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-xl mb-5 ${
                  badge.featured
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-primary'
                }`}
              >
                <badge.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-1">
                {badge.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {badge.subtitle}
              </p>
              <p className="text-foreground/80 text-sm leading-relaxed mb-5">
                {badge.description}
              </p>

              {/* Link */}
              <a
                href={badge.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-2"
              >
                {badge.linkText}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          <div className="text-center p-6 bg-muted/50 rounded-xl">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">500+</div>
            <div className="text-sm text-muted-foreground">5-Star Reviews</div>
          </div>
          <div className="text-center p-6 bg-muted/50 rounded-xl">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">15+</div>
            <div className="text-sm text-muted-foreground">Years in Business</div>
          </div>
          <div className="text-center p-6 bg-muted/50 rounded-xl">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">98%</div>
            <div className="text-sm text-muted-foreground">Would Recommend</div>
          </div>
          <div className="text-center p-6 bg-muted/50 rounded-xl">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">9</div>
            <div className="text-sm text-muted-foreground">Counties Served</div>
          </div>
        </div>
      </div>
    </section>
  );
}

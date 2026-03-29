import { Link, useParams, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { generateFAQSchema, generateBreadcrumbSchema, BUSINESS_INFO } from '@/lib/seo';
import { PageFAQ, InternalLinkCluster, type FAQItem } from '@/components/seo';
import { SeoTrustBar } from '@/components/seo/SeoTrustBar';
import { SeoReviewProof } from '@/components/seo/SeoReviewProof';
import { SeoSupportSection } from '@/components/seo/SeoSupportSection';
import { StickyMobileCTA } from '@/components/seo/StickyMobileCTA';
import { useSeoTracking } from '@/hooks/useSeoTracking';
import { 
  ArrowRight, Phone, CheckCircle, XCircle, 
  Truck, DollarSign, Ruler
} from 'lucide-react';
import { AnimatedSection } from '@/components/animations';

interface ComparisonData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  optionA: {
    name: string;
    pros: string[];
    cons: string[];
    bestFor: string;
    priceRange?: string;
    dimensions?: string;
    capacity?: string;
  };
  optionB: {
    name: string;
    pros: string[];
    cons: string[];
    bestFor: string;
    priceRange?: string;
    dimensions?: string;
    capacity?: string;
  };
  verdict: string;
  faqs: FAQItem[];
  relatedLinks: { to: string; label: string }[];
  serviceLinks: { to: string; label: string }[];
}

const COMPARISONS: Record<string, ComparisonData> = {
  'dumpster-rental-vs-junk-removal': {
    slug: 'dumpster-rental-vs-junk-removal',
    title: 'Dumpster Rental vs Junk Removal',
    metaTitle: 'Dumpster Rental vs Junk Removal | Which Is Right for You?',
    metaDescription: 'Compare dumpster rental vs junk removal service. Cost, convenience, and which is better for your Bay Area project. Real pricing and honest comparison.',
    h1: 'Dumpster Rental vs Junk Removal \u2014 Which Is Right for Your Project?',
    intro: 'Both options handle waste removal, but they serve different needs. Dumpster rental gives you time and capacity for bigger projects. Junk removal gives you labor and speed for smaller ones. Here is how they compare for Bay Area homeowners and contractors.',
    optionA: {
      name: 'Dumpster Rental',
      pros: [
        'Load on your own schedule \u2014 keep it for 7+ days',
        'Better value for large projects (renovations, cleanouts)',
        'You control what goes in and when',
        'Available in multiple sizes (5-50 yards)',
        'Flat-rate pricing with weight allowance included',
        'Can handle heavy materials (concrete, dirt) in dedicated sizes',
      ],
      cons: [
        'Requires space for placement (driveway or street)',
        'You do the loading yourself',
        'May need a permit for street placement',
      ],
      bestFor: 'Construction, renovations, roofing, large cleanouts, multi-day projects, and contractor jobs',
      priceRange: 'Starting at $350 for 7-day rental',
    },
    optionB: {
      name: 'Junk Removal Service',
      pros: [
        'Crew loads everything for you \u2014 no lifting',
        'Same-day pickup often available',
        'No driveway or street space needed',
        'Good for small, one-time cleanouts',
      ],
      cons: [
        'Significantly more expensive per cubic yard',
        'You pay for labor even if the load is small',
        'Limited to what the crew can take in one trip',
        'Less control over timing and scheduling',
        'Cannot handle heavy materials or large construction debris',
      ],
      bestFor: 'Small cleanouts, single-room jobs, or when you cannot do the loading yourself',
      priceRange: '$200-$800+ depending on volume',
    },
    verdict: 'For most construction, renovation, and large cleanout projects in the Bay Area, dumpster rental is the better value. You get more capacity, more time, and lower cost per cubic yard. Junk removal makes sense for small jobs where you need someone else to do the lifting. Many contractors keep a dumpster on-site for the duration of a project \u2014 it is simply more efficient.',
    faqs: [
      { question: 'Is a dumpster rental cheaper than junk removal?', answer: 'Yes, for most projects. A 20-yard dumpster rental costs roughly $450-$600 for 7 days and holds 6-8 pickup truck loads. Junk removal for the same volume would typically cost $1,200-$2,000+.' },
      { question: 'Can I use both for the same project?', answer: 'Absolutely. Some customers rent a dumpster for bulk construction debris and hire junk removal for specific items like appliances or furniture that need special handling or heavy lifting.' },
      { question: 'Which is faster for a home cleanout?', answer: 'Junk removal is faster for small jobs \u2014 the crew comes and takes everything in a few hours. For larger cleanouts (whole house, estate), a dumpster is more efficient because you can load over multiple days.' },
      { question: 'Do I need to be home when the dumpster is delivered?', answer: 'No. As long as we have clear access to your driveway or agreed placement spot, we can deliver while you are away. We will text you when the dumpster is placed.' },
    ],
    relatedLinks: [
      { to: '/pricing', label: 'Dumpster Rental Pricing' },
      { to: '/sizes', label: 'Dumpster Size Guide' },
      { to: '/what-can-you-put-in-a-dumpster', label: 'Accepted Materials' },
      { to: '/quote', label: 'Get a Quote' },
    ],
    serviceLinks: [
      { to: '/services/residential-dumpsters', label: 'Residential Dumpsters' },
      { to: '/services/construction-dumpsters', label: 'Construction Dumpsters' },
      { to: '/services/roofing-dumpsters', label: 'Roofing Dumpsters' },
    ],
  },
  '10-vs-20-yard-dumpster': {
    slug: '10-vs-20-yard-dumpster',
    title: '10 vs 20 Yard Dumpster',
    metaTitle: '10 vs 20 Yard Dumpster | Size Comparison Guide',
    metaDescription: 'Compare 10 yard vs 20 yard dumpsters. Dimensions, capacity, weight limits, and pricing. Which size fits your Bay Area project?',
    h1: '10 Yard vs 20 Yard Dumpster \u2014 Which Size Do You Need?',
    intro: 'The 10-yard and 20-yard are two of our most popular sizes. The right choice depends on your project scope, debris type, and available space. Here is a side-by-side comparison with real dimensions, capacity, and pricing.',
    optionA: {
      name: '10 Yard Dumpster',
      dimensions: "12' L x 7.5' W x 3' H",
      capacity: '4-5 pickup truck loads',
      pros: [
        'Fits in tight driveways and small spaces',
        'Perfect for single-room renovations',
        'Lower rental cost \u2014 best for budget-conscious projects',
        'Available for heavy materials (concrete, dirt, brick)',
        'Easier to fill without overloading',
      ],
      cons: [
        'May not be enough for larger projects',
        'Two loads cost more than one 20-yard rental',
      ],
      bestFor: 'Bathroom remodels, small kitchen renovations, garage cleanouts, concrete removal',
      priceRange: 'Starting around $350',
    },
    optionB: {
      name: '20 Yard Dumpster',
      dimensions: "18' L x 7.5' W x 4' H",
      capacity: '6-8 pickup truck loads',
      pros: [
        'Most popular size \u2014 handles most residential projects',
        'Holds 6-8 pickup truck loads of debris',
        'Cost-effective for medium to large projects',
        'Good for mixed debris and general construction waste',
        '2 tons included weight allowance',
      ],
      cons: [
        'Requires more driveway space (18ft length)',
        'Not rated for heavy materials like concrete or dirt',
        'Higher base rental cost than 10-yard',
      ],
      bestFor: 'Full kitchen or bathroom renovations, roofing tear-offs, whole-house cleanouts, deck removal',
      priceRange: 'Starting around $450',
    },
    verdict: 'The 10-yard is your best bet for small, focused projects or heavy material removal. The 20-yard is the go-to for most residential renovations and cleanouts. When in doubt, size up \u2014 the cost difference between a 10 and 20 is much less than ordering a second haul.',
    faqs: [
      { question: 'What if my project is between a 10 and 20 yard?', answer: 'When in doubt, go with the 20-yard. The cost difference is modest, and overfilling a smaller dumpster leads to overage charges or a second haul \u2014 both more expensive than sizing up.' },
      { question: 'Can I put concrete in a 20-yard dumpster?', answer: 'No, heavy materials like concrete, dirt, and asphalt require dedicated heavy-material dumpsters (5, 8, or 10 yard). This is a weight limit \u2014 20 yards of concrete would exceed truck capacity.' },
      { question: 'How many rooms of debris fit in a 10-yard dumpster?', answer: 'A 10-yard typically handles one room of renovation debris (bathroom or small kitchen). For a full kitchen remodel or multi-room project, step up to a 20-yard.' },
    ],
    relatedLinks: [
      { to: '/sizes', label: 'All Dumpster Sizes' },
      { to: '/capacity-guide', label: 'Capacity Guide' },
      { to: '/pricing', label: 'Full Pricing' },
      { to: '/quote', label: 'Get a Quote' },
    ],
    serviceLinks: [
      { to: '/services/construction-dumpsters', label: 'Construction Dumpsters' },
      { to: '/services/residential-dumpsters', label: 'Residential Dumpsters' },
      { to: '/services/concrete-dumpsters', label: 'Concrete Dumpsters' },
    ],
  },
  '20-vs-30-yard-dumpster': {
    slug: '20-vs-30-yard-dumpster',
    title: '20 vs 30 Yard Dumpster',
    metaTitle: '20 vs 30 Yard Dumpster | Size Comparison Guide',
    metaDescription: 'Compare 20 yard vs 30 yard dumpsters. Dimensions, capacity, weight limits, and pricing. Which size fits your Bay Area project?',
    h1: '20 Yard vs 30 Yard Dumpster \u2014 Which Size Do You Need?',
    intro: 'Deciding between a 20-yard and 30-yard dumpster usually comes down to project scope. The 20 is the residential workhorse. The 30 handles larger renovations and commercial jobs. Here is how to choose.',
    optionA: {
      name: '20 Yard Dumpster',
      dimensions: "18' L x 7.5' W x 4' H",
      capacity: '6-8 pickup truck loads',
      pros: [
        'Most popular residential size',
        'Fits in standard driveways',
        'Handles most single-room to whole-house projects',
        'Lower rental cost',
        '2 tons included weight',
      ],
      cons: [
        'May require a second haul for large renovations',
        'Not enough for multi-room or commercial jobs',
      ],
      bestFor: 'Kitchen remodels, single-story roofing, garage cleanouts, estate cleanouts',
      priceRange: 'Starting around $450',
    },
    optionB: {
      name: '30 Yard Dumpster',
      dimensions: "18' L x 7.5' W x 6' H",
      capacity: '9-12 pickup truck loads',
      pros: [
        'Handles large renovations and commercial cleanouts',
        'Reduces need for multiple hauls \u2014 saves on delivery fees',
        'Ideal for new construction debris',
        '3 tons included weight',
        'Cost-effective for high-volume projects',
      ],
      cons: [
        'Requires larger placement area',
        'Higher base rental cost',
        '6 feet tall \u2014 harder to throw debris over the sides',
      ],
      bestFor: 'Multi-room renovations, large roofing projects, commercial buildouts, new construction, warehouse cleanouts',
      priceRange: 'Starting around $550',
    },
    verdict: 'Choose the 20-yard for standard residential projects. The 30-yard makes sense when you know you will generate more than 6-8 pickup loads of debris. A single 30-yard is almost always cheaper than ordering two 20-yard hauls.',
    faqs: [
      { question: 'Is it better to get a 30-yard or two 20-yard loads?', answer: 'Usually a single 30-yard is more cost-effective. Two 20-yard hauls mean two delivery fees and two pickup fees. A 30-yard gives you 50% more capacity for roughly 20-25% more cost.' },
      { question: 'Will a 30-yard dumpster fit in my driveway?', answer: 'A 30-yard is 18ft long x 7.5ft wide x 6ft tall. Most standard driveways accommodate this, but measure your space first. Width is the same as a 20-yard \u2014 only height changes.' },
      { question: 'Can I mix construction and household debris in a 30-yard?', answer: 'Yes. General debris dumpsters accept mixed loads \u2014 construction materials, furniture, roofing, yard waste. Just no heavy materials (concrete, dirt) or prohibited items.' },
    ],
    relatedLinks: [
      { to: '/sizes', label: 'All Dumpster Sizes' },
      { to: '/compare/10-vs-20-yard-dumpster', label: '10 vs 20 Yard Comparison' },
      { to: '/pricing', label: 'Full Pricing' },
      { to: '/quote', label: 'Get a Quote' },
    ],
    serviceLinks: [
      { to: '/services/construction-dumpsters', label: 'Construction Dumpsters' },
      { to: '/services/roofing-dumpsters', label: 'Roofing Dumpsters' },
      { to: '/services/commercial-dumpsters', label: 'Commercial Dumpsters' },
    ],
  },
};

export default function ComparePage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? COMPARISONS[slug] : undefined;

  useSeoTracking({ pageType: 'blog', slug: slug || 'compare' });

  if (!data) {
    return <Navigate to="/sizes" replace />;
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Compare', url: `/compare/${data.slug}` },
    { name: data.title, url: `/compare/${data.slug}` },
  ];

  return (
    <Layout
      title={data.metaTitle}
      description={data.metaDescription}
      canonical={`/compare/${data.slug}`}
      schema={[
        generateBreadcrumbSchema(breadcrumbs),
        generateFAQSchema(data.faqs),
      ]}
    >
      <SeoTrustBar />
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container-wide">
          <nav className="text-sm text-primary-foreground/70 mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span>{data.title}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{data.h1}</h1>
          <p className="text-lg text-primary-foreground/85 max-w-2xl">{data.intro}</p>
        </div>
      </section>

      {/* Comparison Grid */}
      <AnimatedSection className="container-wide py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {[data.optionA, data.optionB].map((option) => (
            <div key={option.name} className="border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">{option.name}</h2>
              
              {(option.dimensions || option.capacity) && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {option.dimensions && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted px-3 py-1.5 rounded-full">
                      <Ruler className="w-3 h-3" /> {option.dimensions}
                    </span>
                  )}
                  {option.capacity && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted px-3 py-1.5 rounded-full">
                      <Truck className="w-3 h-3" /> {option.capacity}
                    </span>
                  )}
                </div>
              )}

              {option.priceRange && (
                <div className="flex items-center gap-2 mb-4 text-sm text-primary font-medium">
                  <DollarSign className="w-4 h-4" />
                  {option.priceRange}
                </div>
              )}

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Advantages</h3>
              <ul className="space-y-2 mb-6">
                {option.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Considerations</h3>
              <ul className="space-y-2 mb-6">
                {option.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm font-medium mb-1">Best For</p>
                <p className="text-sm text-muted-foreground">{option.bestFor}</p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Verdict */}
      <section className="bg-muted/30 py-12">
        <div className="container-wide max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">Our Recommendation</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">{data.verdict}</p>
          <Button asChild size="lg">
            <Link to="/quote">
              Get Your Quote Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Service Links */}
      {data.serviceLinks.length > 0 && (
        <section className="container-wide py-12">
          <h2 className="text-xl font-bold mb-6">Related Services</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.serviceLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-card-hover transition-all group"
              >
                <span className="font-medium text-foreground">{link.label}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <PageFAQ faqs={data.faqs} />
      <InternalLinkCluster exclude={[`/compare/${data.slug}`]} />

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-lg text-primary-foreground/80 mb-6">
            Get an instant quote with exact pricing for your ZIP code and project type.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">
                Get Instant Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                Call {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

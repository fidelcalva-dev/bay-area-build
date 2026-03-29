import { Link, useParams, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { generateFAQSchema, generateBreadcrumbSchema, BUSINESS_INFO } from '@/lib/seo';
import { 
  ArrowRight, Phone, CheckCircle, XCircle, 
  Truck, Clock, DollarSign, Scale
} from 'lucide-react';
import { AnimatedSection } from '@/components/animations';

interface ComparisonData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  optionA: {
    name: string;
    pros: string[];
    cons: string[];
    bestFor: string;
    priceRange?: string;
  };
  optionB: {
    name: string;
    pros: string[];
    cons: string[];
    bestFor: string;
    priceRange?: string;
  };
  verdict: string;
  faqs: { question: string; answer: string }[];
  relatedLinks: { to: string; label: string }[];
}

const COMPARISONS: Record<string, ComparisonData> = {
  'dumpster-rental-vs-junk-removal': {
    slug: 'dumpster-rental-vs-junk-removal',
    title: 'Dumpster Rental vs Junk Removal',
    metaTitle: 'Dumpster Rental vs Junk Removal | Which Is Right for You?',
    metaDescription: 'Compare dumpster rental vs junk removal service. Cost, convenience, and which is better for your project. Bay Area pricing and options.',
    h1: 'Dumpster Rental vs Junk Removal — Which Is Right for Your Project?',
    optionA: {
      name: 'Dumpster Rental',
      pros: [
        'Load on your own schedule — keep it for 7+ days',
        'Better value for large projects (renovations, cleanouts)',
        'You control what goes in and when',
        'Available in multiple sizes (5-50 yards)',
        'Flat-rate pricing with no surprises',
      ],
      cons: [
        'Requires space for placement (driveway or street)',
        'You do the loading',
        'May need a permit for street placement',
      ],
      bestFor: 'Construction, renovations, roofing, large cleanouts, and ongoing projects',
      priceRange: 'Starting at $350 for 7-day rental',
    },
    optionB: {
      name: 'Junk Removal Service',
      pros: [
        'Crew loads everything for you',
        'Same-day pickup available',
        'No driveway or street space needed',
        'Good for small, one-time cleanouts',
      ],
      cons: [
        'Significantly more expensive per cubic yard',
        'You pay for labor even if the load is small',
        'Limited to what the crew can take in one trip',
        'Less control over timing and scheduling',
      ],
      bestFor: 'Small cleanouts, single-room jobs, or when you cannot do the loading yourself',
      priceRange: '$200-$800+ depending on volume',
    },
    verdict: 'For most construction, renovation, and large cleanout projects in the Bay Area, dumpster rental is the better value. You get more capacity, more time, and lower cost per cubic yard. Junk removal makes sense for small jobs where you need someone else to do the lifting.',
    faqs: [
      { question: 'Is a dumpster rental cheaper than junk removal?', answer: 'Yes, for most projects. A 20-yard dumpster rental costs roughly $450-$600 for 7 days and holds the equivalent of 8-10 pickup truck loads. Junk removal for the same volume would typically cost $1,200-$2,000+.' },
      { question: 'Can I use both?', answer: 'Absolutely. Some customers rent a dumpster for bulk debris and hire junk removal for specific items like appliances or furniture that need special handling.' },
      { question: 'Which is faster?', answer: 'Junk removal is faster for small jobs — the crew comes and takes everything in a few hours. But for larger projects, a dumpster is more efficient because you can load at your own pace over multiple days.' },
    ],
    relatedLinks: [
      { to: '/pricing', label: 'Dumpster Rental Pricing' },
      { to: '/sizes', label: 'Dumpster Size Guide' },
      { to: '/residential-dumpster-rental', label: 'Residential Dumpsters' },
      { to: '/quote', label: 'Get a Quote' },
    ],
  },
  '10-vs-20-yard-dumpster': {
    slug: '10-vs-20-yard-dumpster',
    title: '10 vs 20 Yard Dumpster',
    metaTitle: '10 vs 20 Yard Dumpster | Size Comparison Guide',
    metaDescription: 'Compare 10 yard vs 20 yard dumpsters. Dimensions, capacity, pricing, and which size fits your project. Bay Area dumpster rental guide.',
    h1: '10 Yard vs 20 Yard Dumpster — Which Size Do You Need?',
    optionA: {
      name: '10 Yard Dumpster',
      pros: [
        'Fits in tight driveways and small spaces',
        'Perfect for single-room renovations',
        'Lower rental cost',
        'Available for heavy materials (concrete, dirt)',
        'Easier to fill without overloading',
      ],
      cons: [
        'May not be enough for larger projects',
        'Two loads cost more than one 20-yard rental',
      ],
      bestFor: 'Bathroom remodels, small kitchen renovations, garage cleanouts, concrete removal (up to 10 tons)',
      priceRange: 'Starting around $350',
    },
    optionB: {
      name: '20 Yard Dumpster',
      pros: [
        'Most popular size — handles most residential projects',
        'Holds ~6 pickup truck loads of debris',
        'Cost-effective for medium to large projects',
        'Good for mixed debris and general construction waste',
      ],
      cons: [
        'Requires more driveway space (22ft x 8ft)',
        'Not rated for heavy materials like concrete or dirt',
        'Higher base rental cost than 10-yard',
      ],
      bestFor: 'Full kitchen or bathroom renovations, roofing tear-offs, whole-house cleanouts, deck removal',
      priceRange: 'Starting around $450',
    },
    verdict: 'The 10-yard is your best bet for small, focused projects or heavy material removal. The 20-yard is the go-to for most residential renovations and cleanouts — it handles the majority of projects without needing a second haul.',
    faqs: [
      { question: 'What if my project is between a 10 and 20 yard?', answer: 'When in doubt, go with the 20-yard. The cost difference is modest, and overfilling a smaller dumpster leads to overage charges or a second haul — both more expensive than sizing up.' },
      { question: 'Can I put concrete in a 20-yard dumpster?', answer: 'No, heavy materials like concrete, dirt, and asphalt require dedicated heavy-material dumpsters (5, 8, or 10 yard). This is because of weight limits on the trucks.' },
    ],
    relatedLinks: [
      { to: '/10-yard-dumpster-rental', label: '10 Yard Dumpster Details' },
      { to: '/20-yard-dumpster-rental', label: '20 Yard Dumpster Details' },
      { to: '/sizes', label: 'All Dumpster Sizes' },
      { to: '/capacity-guide', label: 'Capacity Guide' },
      { to: '/quote', label: 'Get a Quote' },
    ],
  },
  '20-vs-30-yard-dumpster': {
    slug: '20-vs-30-yard-dumpster',
    title: '20 vs 30 Yard Dumpster',
    metaTitle: '20 vs 30 Yard Dumpster | Size Comparison Guide',
    metaDescription: 'Compare 20 yard vs 30 yard dumpsters. Dimensions, capacity, pricing, and which size fits your project. Bay Area dumpster rental guide.',
    h1: '20 Yard vs 30 Yard Dumpster — Which Size Do You Need?',
    optionA: {
      name: '20 Yard Dumpster',
      pros: [
        'Most popular residential size',
        'Fits in standard driveways',
        'Handles most single-room to whole-house projects',
        'Lower rental cost',
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
      pros: [
        'Handles large renovations and commercial cleanouts',
        'Reduces need for multiple hauls',
        'Ideal for new construction debris',
        'Cost-effective for high-volume projects',
      ],
      cons: [
        'Requires larger placement area',
        'Higher base rental cost',
        'May be more than needed for smaller projects',
      ],
      bestFor: 'Multi-room renovations, large roofing projects, commercial buildouts, new construction, warehouse cleanouts',
      priceRange: 'Starting around $550',
    },
    verdict: 'Choose the 20-yard for standard residential projects — it handles most jobs efficiently. The 30-yard makes sense when you know you\'ll generate more debris than a single 20-yard can hold, especially for commercial work or multi-room renovations.',
    faqs: [
      { question: 'Is it better to get a 30-yard or two 20-yard loads?', answer: 'Usually a single 30-yard is more cost-effective. Two 20-yard hauls mean two delivery fees and two pickup fees. A 30-yard gives you 50% more capacity for roughly 20-25% more cost.' },
      { question: 'Will a 30-yard dumpster fit in my driveway?', answer: 'A 30-yard dumpster is typically 22ft long x 8ft wide x 6ft tall. Most standard driveways can accommodate this, but measure your space before ordering. We can also place on the street with a permit.' },
    ],
    relatedLinks: [
      { to: '/20-yard-dumpster-rental', label: '20 Yard Dumpster Details' },
      { to: '/30-yard-dumpster-rental', label: '30 Yard Dumpster Details' },
      { to: '/sizes', label: 'All Dumpster Sizes' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/quote', label: 'Get a Quote' },
    ],
  },
};

export default function ComparePage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? COMPARISONS[slug] : undefined;

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
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container-wide">
          <nav className="text-sm text-primary-foreground/70 mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span>{data.title}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{data.h1}</h1>
        </div>
      </section>

      {/* Comparison Grid */}
      <AnimatedSection className="container-wide py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {[data.optionA, data.optionB].map((option) => (
            <div key={option.name} className="border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">{option.name}</h2>
              
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
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Considerations</h3>
              <ul className="space-y-2 mb-6">
                {option.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
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
          <p className="text-muted-foreground leading-relaxed">{data.verdict}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-wide py-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4 max-w-3xl">
          {data.faqs.map((faq, i) => (
            <details key={i} className="bg-background border border-border rounded-xl p-4 group">
              <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                {faq.question}
                <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Links + CTA */}
      <section className="container-wide py-12 border-t border-border">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1">
            <h3 className="font-bold mb-3">Related Pages</h3>
            <ul className="space-y-2">
              {data.relatedLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                    {link.label} <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-primary/5 rounded-2xl p-6 md:p-8 text-center md:w-80">
            <h3 className="font-bold text-lg mb-2">Ready to Order?</h3>
            <p className="text-sm text-muted-foreground mb-4">Get an instant quote with exact pricing for your ZIP code.</p>
            <Button asChild size="lg" className="w-full">
              <Link to="/quote">Get Dumpster Quote</Link>
            </Button>
            <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="block mt-3 text-sm text-primary hover:underline">
              Or call {BUSINESS_INFO.phone.salesFormatted}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}

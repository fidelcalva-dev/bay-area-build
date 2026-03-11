import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO, generateServiceSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo';
import { PRICING_POLICIES, DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { SERVICE_CITIES } from '@/lib/cityData';
import { ArrowRight, Phone, CheckCircle, AlertTriangle, Truck, Hammer, Leaf, Home as HomeIcon } from 'lucide-react';
import NotFound from './NotFound';

interface MaterialPageContent {
  slug: string;
  title: string;
  h1: string;
  description: string;
  metaDescription: string;
  intro: string;
  icon: typeof Hammer;
  sizes: number[];
  pricing: string;
  rules: string[];
  faqs: { question: string; answer: string }[];
  relatedLinks: { label: string; to: string }[];
}

const MATERIAL_PAGES: Record<string, MaterialPageContent> = {
  'concrete-dumpster-rental': {
    slug: 'concrete-dumpster-rental',
    title: 'Concrete Dumpster Rental | Flat-Fee Disposal',
    h1: 'Concrete Dumpster Rental',
    description: 'Flat-fee concrete dumpster rental in the Bay Area.',
    metaDescription: 'Rent a concrete dumpster with flat-fee pricing—no weight overage charges. 5, 8, and 10 yard sizes for concrete, brick, and block removal. Same-day delivery. Call (510) 680-2150.',
    intro: 'Need to dispose of concrete, brick, or block? Our heavy material dumpsters are designed for dense loads with flat-fee pricing—disposal included, no weight surprises. We route clean concrete to certified recycling facilities in the East Bay.',
    icon: Hammer,
    sizes: [5, 8, 10],
    pricing: 'Concrete dumpsters use FLAT FEE pricing. Disposal is included with no weight overage charges. This applies to clean loads only—mixing trash or general debris may result in reclassification.',
    rules: [
      'Only clean concrete, brick, block, and rebar-free material',
      'No mixing with general debris or trash',
      'Rebar must be cut below the fill line',
      'Dirt and soil can go in a separate heavy material dumpster',
      'Mixed loads may be reclassified as general debris with overage charges',
    ],
    faqs: [
      { question: 'How much does a concrete dumpster cost?', answer: 'Concrete dumpsters start at $495 for a 5-yard. Pricing is flat-fee—disposal is included with no weight overage charges, regardless of how heavy the load is.' },
      { question: 'Can I mix concrete with other materials?', answer: 'No. Concrete dumpsters are for clean loads only. Mixing with general debris or trash will result in reclassification and additional charges. Order a separate general debris dumpster for mixed waste.' },
      { question: 'Where does the concrete go?', answer: 'Clean concrete is routed to certified recycling facilities in the East Bay where it is crushed and reused as aggregate for road base and construction projects.' },
    ],
    relatedLinks: [
      { label: 'Dirt Dumpster', to: '/dirt-dumpster-rental' },
      { label: 'Construction Debris', to: '/construction-debris-dumpster' },
      { label: 'All Materials', to: '/materials' },
    ],
  },
  'dirt-dumpster-rental': {
    slug: 'dirt-dumpster-rental',
    title: 'Dirt & Soil Dumpster Rental | Flat-Fee Disposal',
    h1: 'Dirt & Soil Dumpster Rental',
    description: 'Flat-fee dirt disposal in the Bay Area.',
    metaDescription: 'Rent a dumpster for dirt and soil removal. Flat-fee pricing with no weight overage. 5-10 yard sizes. Clean fill dirt, topsoil, and gravel disposal. Call (510) 680-2150.',
    intro: 'Disposing of dirt, soil, gravel, or sand? Our heavy material dumpsters handle dense earth materials with flat-fee pricing. Clean fill dirt is routed to recycling and reuse facilities.',
    icon: Hammer,
    sizes: [5, 8, 10],
    pricing: 'Dirt and soil dumpsters use FLAT FEE pricing. No weight overage charges for clean loads of fill dirt, topsoil, gravel, or sand.',
    rules: [
      'Clean fill dirt, topsoil, gravel, and sand accepted',
      'No mixing with organic material, trash, or construction debris',
      'Contaminated soil requires special handling—call first',
      'Rock and gravel accepted in heavy material dumpsters',
      'Wet soil is significantly heavier—factor this into size selection',
    ],
    faqs: [
      { question: 'How much does a dirt dumpster cost?', answer: 'Dirt dumpsters start at $390 for a 6-yard container. Flat-fee pricing means no weight overage charges.' },
      { question: 'Can I put wet soil in the dumpster?', answer: 'Yes, but wet soil is much heavier. This won\'t affect your price (flat-fee), but ensure the dumpster isn\'t overfilled above the walls.' },
      { question: 'What about contaminated soil?', answer: 'Contaminated soil requires special handling and disposal. Call us to discuss your situation—we can arrange proper disposal if needed.' },
    ],
    relatedLinks: [
      { label: 'Concrete Dumpster', to: '/concrete-dumpster-rental' },
      { label: 'Construction Debris', to: '/construction-debris-dumpster' },
      { label: 'All Materials', to: '/materials' },
    ],
  },
  'construction-debris-dumpster': {
    slug: 'construction-debris-dumpster',
    title: 'Construction Debris Dumpster | All Sizes Available',
    h1: 'Construction Debris Dumpster Rental',
    description: 'Dumpsters for construction waste and renovation debris.',
    metaDescription: 'Construction debris dumpsters from 5-50 yards. For drywall, lumber, roofing, siding. Tonnage included, $165/ton overage. Same-day Bay Area delivery. Call (510) 680-2150.',
    intro: 'Renovation, remodel, or construction project? Our general debris dumpsters handle drywall, lumber, flooring, siding, insulation, and mixed construction waste. Available in all sizes from 5 to 50 yards.',
    icon: HomeIcon,
    sizes: [5, 8, 10, 20, 30, 40, 50],
    pricing: `Construction debris dumpsters include base tonnage by size (0.5T to 5T). Any weight beyond included tonnage is billed at $${PRICING_POLICIES.overagePerTonGeneral}/ton based on scale ticket.`,
    rules: [
      'Drywall, lumber, flooring, siding, insulation accepted',
      'Roofing shingles accepted (note: very heavy—consider weight)',
      'No hazardous materials, paint, or chemicals',
      'No mixing with pure heavy materials (concrete, dirt)',
      'Do not overfill above the dumpster walls',
    ],
    faqs: [
      { question: 'What size do I need for a renovation?', answer: 'A 20-yard dumpster is the most popular for full room renovations. For whole-house renovations, consider a 30 or 40-yard. Use our online calculator for a recommendation.' },
      { question: 'How much does overage cost?', answer: `General debris overage is $${PRICING_POLICIES.overagePerTonGeneral}/ton based on scale ticket. Tonnage is included by size: 5yd=0.5T, 8yd=0.5T, 10yd=1T, 20yd=2T, 30yd=3T, 40yd=4T, 50yd=5T.` },
      { question: 'Can I put roofing shingles in a construction dumpster?', answer: 'Yes! Roofing shingles go in general debris dumpsters. Note that shingles are very heavy—a 20-yard is recommended for roofing projects to stay within included tonnage.' },
    ],
    relatedLinks: [
      { label: 'Roofing Dumpster', to: '/roofing-dumpster-rental' },
      { label: 'Concrete Dumpster', to: '/concrete-dumpster-rental' },
      { label: 'All Materials', to: '/materials' },
    ],
  },
  'green-waste-dumpster': {
    slug: 'green-waste-dumpster',
    title: 'Green Waste & Yard Debris Dumpster Rental',
    h1: 'Green Waste Dumpster Rental',
    description: 'Dumpsters for yard waste and green debris.',
    metaDescription: 'Green waste dumpster rental for yard debris, branches, grass, and leaves. Routed to composting facilities. 5-50 yard sizes. Bay Area delivery. Call (510) 680-2150.',
    intro: 'Yard cleanups, tree trimming, and landscaping projects generate a lot of green waste. Our dumpsters handle branches, grass clippings, leaves, and other organic yard debris. Green waste is routed to composting and recycling facilities.',
    icon: Leaf,
    sizes: [5, 8, 10, 20, 30],
    pricing: `Green waste goes in general debris dumpsters. Tonnage included by size with overage at $${PRICING_POLICIES.overagePerTonGeneral}/ton. Green waste is lighter—you\'ll likely stay within included tonnage.`,
    rules: [
      'Branches, brush, grass clippings, and leaves accepted',
      'Small tree stumps accepted (under 12" diameter)',
      'No treated lumber or painted wood',
      'No dirt, rocks, or non-organic materials',
      'Green waste is routed for composting when possible',
    ],
    faqs: [
      { question: 'Is green waste cheaper to dispose of?', answer: 'Green waste goes in standard general debris dumpsters at the same pricing. However, green waste is much lighter than construction debris, so you\'re unlikely to exceed included tonnage.' },
      { question: 'Can I put tree stumps in a green waste dumpster?', answer: 'Small stumps (under 12" diameter) are fine. Larger stumps may require special handling—call us for guidance.' },
      { question: 'What about palm fronds and large branches?', answer: 'Yes, but cut branches to fit inside the dumpster. Materials must not extend above the walls for safe transport.' },
    ],
    relatedLinks: [
      { label: 'Construction Debris', to: '/construction-debris-dumpster' },
      { label: 'Dirt Dumpster', to: '/dirt-dumpster-rental' },
      { label: 'All Materials', to: '/materials' },
    ],
  },
  'roofing-dumpster-rental': {
    slug: 'roofing-dumpster-rental',
    title: 'Roofing Dumpster Rental | Shingle Disposal',
    h1: 'Roofing Dumpster Rental',
    description: 'Dumpsters sized for roofing tear-offs and shingle disposal.',
    metaDescription: 'Roofing dumpster rental for shingle tear-offs. 20-30 yard sizes recommended. Tonnage included, transparent pricing. Same-day Bay Area delivery. Call (510) 680-2150.',
    intro: 'Roofing tear-offs produce heavy, bulky waste. Our general debris dumpsters handle asphalt shingles, underlayment, flashing, and other roofing materials. We recommend 20-30 yard sizes for most residential roofing jobs.',
    icon: HomeIcon,
    sizes: [20, 30, 40],
    pricing: `Roofing dumpsters are general debris pricing with tonnage included by size. Overage at $${PRICING_POLICIES.overagePerTonGeneral}/ton. Note: roofing shingles are heavier than they look—a 20-yard with 2T included is usually sufficient for up to 30 squares.`,
    rules: [
      'Asphalt shingles, composite shingles, underlayment accepted',
      'Metal flashing, gutters, and nails accepted',
      'No mixing with heavy materials (concrete, dirt)',
      'Shingles are heavy—factor weight into size selection',
      'Do not overfill above the dumpster walls',
    ],
    faqs: [
      { question: 'What size dumpster for a roof?', answer: 'A 20-yard handles most residential roofs up to 30 squares. For larger roofs or multi-layer tear-offs, go with a 30-yard. Weight is usually the limiting factor, not volume.' },
      { question: 'How heavy are roofing shingles?', answer: 'A bundle of 3-tab shingles weighs about 60-80 lbs. A typical 20-square roof produces about 2-3 tons of waste. The 20-yard dumpster includes 2 tons.' },
      { question: 'Can I put old gutters and flashing in the dumpster?', answer: 'Yes! Metal gutters, flashing, drip edge, and roofing nails can all go in a general debris dumpster.' },
    ],
    relatedLinks: [
      { label: 'Construction Debris', to: '/construction-debris-dumpster' },
      { label: 'All Sizes', to: '/sizes' },
      { label: 'All Materials', to: '/materials' },
    ],
  },
  'construction-debris-dumpster-rental': {
    slug: 'construction-debris-dumpster-rental',
    title: 'Construction Debris Dumpster | All Sizes Available',
    h1: 'Construction Debris Dumpster Rental',
    description: 'Dumpsters for mixed construction and demolition waste.',
    metaDescription: 'Construction debris dumpster rental in the Bay Area. 10-40 yard sizes for remodels, demolition, and build projects. Transparent pricing, same-day delivery. Call (510) 680-2150.',
    intro: 'Renovation, demolition, and construction projects generate mixed debris—drywall, lumber, tile, metal, and more. Our general debris dumpsters handle it all with clear weight policies and transparent pricing.',
    icon: Hammer,
    sizes: [10, 20, 30, 40],
    pricing: 'Construction debris dumpsters include base tonnage with your rental. Overages are billed at scale-ticket weight. No hidden fees—your quote includes delivery, pickup, and disposal.',
    rules: [
      'Wood, drywall, tile, metal, and general construction waste accepted',
      'No hazardous materials (paint, solvents, asbestos)',
      'Do not mix heavy materials (concrete, dirt) with general debris',
      'Keep loads level with dumpster walls—no overfill',
    ],
    faqs: [
      { question: 'What size dumpster for construction debris?', answer: 'Most home renovations use a 20-yard. Larger demo projects or new construction may need a 30 or 40-yard. Call for a recommendation based on your project scope.' },
      { question: 'Can I put drywall in a dumpster?', answer: 'Yes. Drywall, lumber, tile, carpet, and most construction materials are accepted in general debris dumpsters.' },
    ],
    relatedLinks: [
      { label: 'Concrete Dumpster', to: '/concrete-dumpster-rental' },
      { label: 'Roofing Dumpster', to: '/roofing-dumpster-rental' },
      { label: 'All Materials', to: '/materials' },
    ],
  },
  'residential-dumpster-rental': {
    slug: 'residential-dumpster-rental',
    title: 'Residential Dumpster Rental | Home Projects',
    h1: 'Residential Dumpster Rental',
    description: 'Dumpster rental for homeowners and residential projects.',
    metaDescription: 'Residential dumpster rental in the Bay Area. Perfect for cleanouts, remodels, and yard projects. 10-30 yard sizes, transparent pricing. Same-day delivery. Call (510) 680-2150.',
    intro: 'Whether you are cleaning out a garage, renovating a bathroom, or tackling a major home project, our residential dumpsters make debris removal simple. Transparent pricing with delivery, pickup, and disposal included.',
    icon: HomeIcon,
    sizes: [10, 20, 30],
    pricing: 'Residential dumpsters include base tonnage. The 10-yard includes 1 ton, 20-yard includes 2 tons, and 30-yard includes 3 tons. Overages are billed per ton at scale-ticket weight.',
    rules: [
      'General household debris, furniture, and appliances accepted',
      'No hazardous materials (paint, chemicals, batteries)',
      'Electronics must be separated for proper recycling',
      'Mattresses and box springs accepted (1-2 per load)',
      'Keep loads level—do not overfill above dumpster walls',
    ],
    faqs: [
      { question: 'What size dumpster do I need for a home cleanout?', answer: 'A 10-yard handles most garage or single-room cleanouts. For whole-house cleanouts or estate cleanups, a 20-yard is recommended.' },
      { question: 'Can I put furniture in a dumpster?', answer: 'Yes. Couches, tables, chairs, desks, and most household furniture are accepted. Mattresses are also accepted.' },
      { question: 'How long can I keep a residential dumpster?', answer: 'Standard rental is 7 days. Extensions are available at a daily rate if you need more time.' },
    ],
    relatedLinks: [
      { label: 'Construction Debris', to: '/construction-debris-dumpster-rental' },
      { label: 'All Sizes', to: '/sizes' },
      { label: 'All Materials', to: '/materials' },
    ],
  },
};

export default function MaterialLandingPage() {
  const { materialSlug } = useParams<{ materialSlug: string }>();
  // Support both /:materialSlug param and static routes like /concrete-dumpster-rental
  const pathSlug = window.location.pathname.replace(/^\//, '');
  const slug = materialSlug || pathSlug;
  const content = slug ? MATERIAL_PAGES[slug] : undefined;

  if (!content) return <NotFound />;

  const serviceSchema = generateServiceSchema({
    name: content.h1,
    description: content.metaDescription,
  });
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Materials', url: '/materials' },
    { name: content.h1, url: `/${content.slug}` },
  ]);
  const faqSchema = generateFAQSchema(content.faqs);
  const Icon = content.icon;

  return (
    <Layout title={content.title} description={content.metaDescription}>
      <Helmet>
        <link rel="canonical" href={`${BUSINESS_INFO.url}/${content.slug}`} />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-3">
              <Link to="/" className="hover:text-primary-foreground">Home</Link>
              <span>/</span>
              <Link to="/materials" className="hover:text-primary-foreground">Materials</Link>
              <span>/</span>
              <span className="text-primary-foreground">{content.h1}</span>
            </div>
            <h1 className="heading-xl mb-4">{content.h1}</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">{content.intro}</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="cta" size="lg">
                <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                  <Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Available Sizes */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-6 text-center">Available Sizes</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {content.sizes.map(yards => {
              const size = DUMPSTER_SIZES_DATA.find(s => s.yards === yards);
              if (!size) return null;
              return (
                <Link
                  key={yards}
                  to={`/${yards}-yard-dumpster`}
                  className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/50 hover:shadow-md transition-all w-36"
                >
                  <div className="text-3xl font-black text-foreground">{yards}</div>
                  <div className="text-xs text-muted-foreground mb-2">YARD</div>
                  <div className="text-sm font-semibold text-primary">From ${size.priceFrom}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-4">Pricing</h2>
          <p className="text-muted-foreground mb-6">{content.pricing}</p>
        </div>
      </section>

      {/* Rules */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6">Rules & Guidelines</h2>
          <div className="space-y-3">
            {content.rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {content.faqs.map((faq, i) => (
              <details key={i} className="bg-card border border-border rounded-xl overflow-hidden group">
                <summary className="p-5 cursor-pointer font-semibold text-foreground hover:bg-muted/30 transition-colors list-none flex items-center justify-between">
                  {faq.question}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-muted-foreground">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h3 className="heading-md text-foreground mb-4 text-center">Related Pages</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {content.relatedLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Order?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Get an instant quote or call us for expert guidance.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

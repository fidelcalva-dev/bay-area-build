import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO, generateServiceSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { SERVICE_CITIES, getCanonicalCitySlug } from '@/lib/cityData';
import { ArrowRight, Phone, Building, Truck, CheckCircle, Warehouse, HardHat } from 'lucide-react';

interface CommercialPageContent {
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  icon: typeof Building;
  sizes: number[];
  useCases: { title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
}

const COMMERCIAL_PAGES: Record<string, CommercialPageContent> = {
  'commercial-dumpster-rental': {
    slug: 'commercial-dumpster-rental',
    h1: 'Commercial Dumpster Rental — Bay Area',
    metaTitle: 'Commercial Dumpster Rental Oakland & Bay Area | 20-50 Yard',
    metaDescription: 'Commercial dumpster rental in Oakland, San Jose & SF. 20-50 yard roll-off dumpsters for office buildouts, tenant improvements, commercial demolition. Same-day delivery. Call (510) 680-2150.',
    intro: 'Bay Area commercial projects demand reliable, large-capacity dumpster service. Our 20-50 yard roll-off dumpsters handle office buildouts, tenant improvements, retail renovations, and commercial demolition. Delivered from our Oakland and San Jose yards.',
    icon: Building,
    sizes: [20, 30, 40, 50],
    useCases: [
      { title: 'Office Buildouts', desc: 'Drywall, carpet, ceiling tiles, and mixed construction waste from commercial office renovations.' },
      { title: 'Tenant Improvements', desc: 'Complete interior demolition and renovation debris for retail and office spaces.' },
      { title: 'Restaurant Renovations', desc: 'Heavy equipment, kitchen fixtures, flooring, and mixed demo debris.' },
      { title: 'Property Management', desc: 'Multi-unit turnover cleanouts, common area renovations, and ongoing debris removal.' },
    ],
    faqs: [
      { question: 'What size dumpster for a commercial project?', answer: 'Most commercial projects use 30 or 40 yard dumpsters. Office buildouts typically need a 30-yard. Large demolitions and warehouse cleanouts may require 40 or 50 yard containers.' },
      { question: 'Do you offer volume discounts for commercial accounts?', answer: 'Yes. We offer volume discounts for contractors and property managers with ongoing needs. 3-5 services: 3% off, 6-10: 5% off, 11-20: 7% off, 20+: 10% off.' },
      { question: 'Can you deliver to loading docks?', answer: 'Yes. Our drivers are experienced with commercial loading dock deliveries and can coordinate timing with building management.' },
      { question: 'Do you handle construction debris recycling?', answer: `Yes. We route clean materials to certified recycling facilities. Mixed C&D debris includes base tonnage with overage at $${PRICING_POLICIES.overagePerTonGeneral}/ton.` },
    ],
  },
  'construction-dumpsters': {
    slug: 'construction-dumpsters',
    h1: 'Construction Dumpsters — Bay Area Job Sites',
    metaTitle: 'Construction Dumpsters Bay Area | Job Site Delivery | 6-50 Yard',
    metaDescription: 'Construction dumpsters for Bay Area job sites. 6-50 yard sizes for new builds, renovations, demolition. Flat-fee concrete. Same-day delivery from Oakland & San Jose yards.',
    intro: 'Construction job sites need reliable debris removal to stay on schedule. Our full range of 6-50 yard dumpsters handles everything from small residential remodels to large commercial builds. Heavy material dumpsters for concrete and dirt are flat-fee with no weight overage.',
    icon: HardHat,
    sizes: [5, 8, 10, 20, 30, 40, 50],
    useCases: [
      { title: 'New Construction', desc: 'Ongoing debris removal for residential and commercial new builds. Schedule regular pickups or swap-outs.' },
      { title: 'Demolition Projects', desc: 'High-capacity dumpsters for full and partial demolition. Separate heavy material containers available.' },
      { title: 'Renovation & Remodel', desc: 'Kitchen, bathroom, and whole-house renovation debris. 20-yard is most popular for residential remodels.' },
      { title: 'Concrete & Foundation', desc: 'Flat-fee heavy material dumpsters (5-10 yard) for concrete, rebar, and foundation demolition.' },
    ],
    faqs: [
      { question: 'What dumpster for a construction site?', answer: 'It depends on the project. Small remodels: 10-20 yard. New construction: 30-40 yard. Heavy materials (concrete, dirt): 5-10 yard at flat-fee pricing.' },
      { question: 'Do you offer swap-outs for ongoing projects?', answer: 'Yes. Call us when your dumpster is full and we swap it for an empty one, usually within 24 hours. Volume discounts apply for ongoing projects.' },
      { question: 'Is concrete disposal included?', answer: 'Yes. Heavy material dumpsters (5, 8, 10 yard) are flat-fee—disposal is included with no weight overage charges. Keep loads clean and unmixed.' },
      { question: 'What about job site permits?', answer: 'If the dumpster goes on the street, you need a permit from the city. On private property or your own job site, no permit needed. We can guide you through the process.' },
    ],
  },
  'warehouse-cleanout-dumpsters': {
    slug: 'warehouse-cleanout-dumpsters',
    h1: 'Warehouse Cleanout Dumpsters — Bay Area',
    metaTitle: 'Warehouse Cleanout Dumpsters Bay Area | 40-50 Yard Containers',
    metaDescription: 'Warehouse cleanout dumpsters in Oakland, San Jose & Bay Area. 40-50 yard containers for industrial cleanouts, inventory disposal, equipment removal. Same-day delivery.',
    intro: 'Warehouse and industrial cleanouts require maximum volume containers. Our 40 and 50 yard dumpsters are built for clearing out warehouses, factories, distribution centers, and large commercial spaces. Delivered from our Oakland and San Jose yards.',
    icon: Warehouse,
    sizes: [30, 40, 50],
    useCases: [
      { title: 'Warehouse Liquidation', desc: 'Clear out entire warehouses with multiple 40-50 yard containers. We coordinate phased pickups for large-scale cleanouts.' },
      { title: 'Industrial Equipment', desc: 'Remove old machinery, racking systems, and industrial equipment. Note: no hazardous materials.' },
      { title: 'Inventory Disposal', desc: 'Bulk disposal of obsolete inventory, packaging materials, and warehouse supplies.' },
      { title: 'Facility Renovation', desc: 'Complete facility gut-outs for repurposing warehouses and industrial spaces.' },
    ],
    faqs: [
      { question: 'What size for a warehouse cleanout?', answer: 'Most warehouse cleanouts use 40 or 50 yard dumpsters. For very large projects, we can deliver multiple containers and coordinate staggered pickups.' },
      { question: 'How many dumpsters do I need?', answer: 'It depends on the volume. A typical 10,000 sq ft warehouse cleanout may need 2-4 containers. We can assess your project and recommend the right quantity.' },
      { question: 'Can you handle e-waste and electronics?', answer: 'Electronics require special handling. We can coordinate e-waste recycling for commercial quantities. Contact us for a custom solution.' },
      { question: 'Do you serve industrial areas?', answer: 'Yes. We regularly deliver to industrial zones in Oakland, San Jose, Hayward, Fremont, and throughout the Bay Area.' },
    ],
  },
};

export default function CommercialLandingPage() {
  const slug = window.location.pathname.replace('/', '');
  const content = COMMERCIAL_PAGES[slug];

  if (!content) return <Layout><div className="min-h-screen" /></Layout>;

  const Icon = content.icon;
  const serviceSchema = generateServiceSchema({ name: content.h1, description: content.metaDescription });
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: content.h1, url: `/${content.slug}` },
  ]);
  const faqSchema = generateFAQSchema(content.faqs);

  return (
    <Layout title={content.metaTitle} description={content.metaDescription}>
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
          <h2 className="heading-lg text-foreground mb-8 text-center">Available Sizes</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {content.sizes.map(yards => {
              const size = DUMPSTER_SIZES_DATA.find(s => s.yards === yards);
              if (!size) return null;
              return (
                <Link key={yards} to={`/${yards}-yard-dumpster`}
                  className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/50 hover:shadow-md transition-all w-36 group">
                  <div className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{yards}</div>
                  <div className="text-xs text-muted-foreground mb-2">YARD</div>
                  <div className="text-sm font-semibold text-primary">From ${size.priceFrom}</div>
                  <div className="text-xs text-muted-foreground mt-1">{size.loads}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Common Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {content.useCases.map((uc, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5 text-primary shrink-0" />
                  <h3 className="font-semibold text-foreground">{uc.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-background">
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

      {/* Cities Served */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <h2 className="heading-md text-foreground mb-6 text-center">Serving These Bay Area Cities</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {SERVICE_CITIES.slice(0, 15).map(city => (
              <Link key={city.slug} to={`/dumpster-rental/${getCanonicalCitySlug(city.slug)}`}
                className="px-3 py-1.5 bg-card border border-border rounded-full text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Order?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Get an instant quote or call for commercial pricing.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}><Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-8 bg-muted/30 border-t border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/sizes" className="text-primary hover:underline">All Sizes</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/concrete-dumpster-rental" className="text-primary hover:underline">Concrete</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/construction-debris-dumpster" className="text-primary hover:underline">Construction Debris</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/dumpster-rental-east-bay" className="text-primary hover:underline">East Bay</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/dumpster-rental-south-bay" className="text-primary hover:underline">South Bay</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/contractors" className="text-primary hover:underline">Contractor Programs</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

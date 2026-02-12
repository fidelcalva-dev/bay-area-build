import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO, OPERATIONAL_YARDS, generateFAQSchema, generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { SERVICE_CITIES } from '@/lib/cityData';
import { ArrowRight, MapPin, Phone, Truck, Clock, Shield, CheckCircle } from 'lucide-react';
import NotFound from './NotFound';

interface RegionData {
  slug: string;
  name: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  yardId: string;
  counties: string[];
  citySlugs: string[];
  faqs: { question: string; answer: string }[];
}

const REGIONS: Record<string, RegionData> = {
  'dumpster-rental-east-bay': {
    slug: 'dumpster-rental-east-bay',
    name: 'East Bay',
    h1: 'Dumpster Rental East Bay — Local Yards, Same-Day Delivery',
    metaTitle: 'Dumpster Rental East Bay CA | 6-50 Yard Roll-Off | Local Yard',
    metaDescription: 'East Bay dumpster rental from our Oakland yard. Same-day delivery to Oakland, Berkeley, Hayward, Fremont & all Alameda/Contra Costa cities. 6-50 yard sizes. Call (510) 680-2150.',
    intro: 'The East Bay is our home turf. Our Oakland yard at 1000 46th Ave puts us minutes from your job site in Oakland, Berkeley, San Leandro, Hayward, and beyond. We deliver same-day to most Alameda and Contra Costa County addresses.',
    yardId: 'oakland',
    counties: ['Alameda County', 'Contra Costa County'],
    citySlugs: ['oakland-ca', 'berkeley-ca', 'san-leandro-ca', 'hayward-ca', 'fremont-ca', 'richmond-ca', 'concord-ca', 'walnut-creek-ca', 'alameda-ca', 'emeryville-ca', 'castro-valley-ca', 'union-city-ca', 'dublin-ca', 'pleasanton-ca', 'livermore-ca'],
    faqs: [
      { question: 'How much does a dumpster cost in the East Bay?', answer: `Dumpster rental in the East Bay starts at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard dumpster. Heavy materials (concrete, dirt) are flat-fee with no weight overage. General debris overage is $${PRICING_POLICIES.overagePerTonGeneral}/ton.` },
      { question: 'Can I get same-day delivery in the East Bay?', answer: 'Yes. Same-day delivery is available for most East Bay addresses when ordered before noon. Our Oakland yard ensures fast turnaround for Alameda and Contra Costa counties.' },
      { question: 'What areas do you cover in the East Bay?', answer: 'We serve all of Alameda County (Oakland, Berkeley, Hayward, Fremont, San Leandro, Pleasanton, Dublin, Livermore) and Contra Costa County (Richmond, Concord, Walnut Creek, San Ramon, Antioch).' },
      { question: 'Do you have a yard in the East Bay?', answer: 'Yes. Our primary East Bay yard is at 1000 46th Ave, Oakland, CA 94601. This is an operational yard—not a broker office—where our fleet is based.' },
    ],
  },
  'dumpster-rental-south-bay': {
    slug: 'dumpster-rental-south-bay',
    name: 'South Bay',
    h1: 'Dumpster Rental South Bay — San Jose Yard, Fast Delivery',
    metaTitle: 'Dumpster Rental South Bay CA | San Jose Yard | Same-Day Delivery',
    metaDescription: 'South Bay dumpster rental from our San Jose yard. Same-day delivery to San Jose, Santa Clara, Sunnyvale, Palo Alto & all Silicon Valley cities. 6-50 yard sizes. Call (510) 680-2150.',
    intro: 'Our San Jose yard at 2071 Ringwood Ave serves the entire South Bay and Silicon Valley. Same-day delivery is available for most San Jose, Santa Clara, Sunnyvale, and Palo Alto addresses when ordered before noon.',
    yardId: 'sanjose',
    counties: ['Santa Clara County', 'San Mateo County'],
    citySlugs: ['san-jose-ca', 'santa-clara-ca', 'sunnyvale-ca', 'milpitas-ca', 'palo-alto-ca', 'mountain-view-ca', 'cupertino-ca', 'campbell-ca', 'redwood-city-ca'],
    faqs: [
      { question: 'How much does a dumpster cost in the South Bay?', answer: `Dumpster rental in the South Bay starts at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard dumpster. Heavy materials are flat-fee. General debris overage is $${PRICING_POLICIES.overagePerTonGeneral}/ton.` },
      { question: 'Do you deliver to all of Silicon Valley?', answer: 'Yes. We cover San Jose, Santa Clara, Sunnyvale, Mountain View, Palo Alto, Cupertino, Campbell, Milpitas, and surrounding areas from our San Jose yard.' },
      { question: 'Where is your South Bay yard?', answer: 'Our San Jose yard is at 2071 Ringwood Ave, San Jose, CA 95131. This operational yard houses our fleet for fast South Bay delivery.' },
      { question: 'Can I get same-day delivery in San Jose?', answer: 'Yes. Same-day delivery is available for most South Bay addresses when you order before noon. Call (510) 680-2150 for urgent requests.' },
    ],
  },
};

export default function RegionalLandingPage() {
  const slug = window.location.pathname.replace('/', '');
  const region = REGIONS[slug];

  if (!region) return <NotFound />;

  const yard = OPERATIONAL_YARDS.find(y => y.id === region.yardId);
  const cities = region.citySlugs
    .map(s => SERVICE_CITIES.find(c => c.slug === s))
    .filter(Boolean);

  const serviceSchema = generateServiceSchema({
    name: `Dumpster Rental ${region.name}`,
    description: region.metaDescription,
    areaServed: region.counties,
  });
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: region.name, url: `/${region.slug}` },
  ]);
  const faqSchema = generateFAQSchema(region.faqs);

  return (
    <Layout title={region.metaTitle} description={region.metaDescription}>
      <Helmet>
        <link rel="canonical" href={`${BUSINESS_INFO.url}/${region.slug}`} />
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
              <span className="text-primary-foreground">{region.name}</span>
            </div>
            <h1 className="heading-xl mb-4">{region.h1}</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">{region.intro}</p>
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

      {/* Trust */}
      <section className="py-6 bg-muted/50 border-b border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span>Real Yard in {yard?.city}</span></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span>Same-Day Delivery</span></div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /><span>Not a Broker</span></div>
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /><span>6-50 Yard Sizes</span></div>
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Dumpster Sizes Available in the {region.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {DUMPSTER_SIZES_DATA.map(size => (
              <Link key={size.yards} to={`/${size.yards}-yard-dumpster`}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{size.yards}</div>
                <div className="text-xs text-muted-foreground mb-2">YARD</div>
                <div className="text-sm font-semibold text-primary">From ${size.priceFrom}</div>
                <div className="text-xs text-muted-foreground mt-1">{size.loads}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">{region.name} Cities We Serve</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map(city => city && (
              <Link key={city.slug} to={`/dumpster-rental/${city.slug}`}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{city.name}, CA</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{city.localIntro.slice(0, 120)}...</p>
                <div className="mt-3 text-xs text-primary font-medium">View {city.name} dumpsters →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Local Yard */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-6 text-center">Why Choose a Local Dumpster Rental Company</h2>
          <div className="space-y-4">
            {[
              { title: 'Real Local Yard', desc: `Our fleet is based at ${yard?.address}. We are not a broker—we own the trucks and the dumpsters.` },
              { title: 'Same-Day Delivery', desc: 'Order before noon and we deliver the same day. No waiting for a national company to find a subcontractor.' },
              { title: 'Transparent Pricing', desc: `Flat-fee pricing for heavy materials. General debris includes base tonnage with $${PRICING_POLICIES.overagePerTonGeneral}/ton overage. No hidden fees.` },
              { title: 'Local Knowledge', desc: `We know ${region.name} permit requirements, disposal facilities, and access challenges. We handle the logistics.` },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-5 bg-muted/30 border border-border rounded-xl">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-8 text-center">{region.name} Dumpster Rental FAQ</h2>
          <div className="space-y-4">
            {region.faqs.map((faq, i) => (
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

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Rent a Dumpster in the {region.name}?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Get an instant quote or call us now. Same-day delivery available.</p>
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
            <Link to="/materials" className="text-primary hover:underline">Materials</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/concrete-dumpster-rental" className="text-primary hover:underline">Concrete Dumpsters</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/commercial-dumpster-rental" className="text-primary hover:underline">Commercial</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/contractors" className="text-primary hover:underline">Contractors</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas" className="text-primary hover:underline">All Areas</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

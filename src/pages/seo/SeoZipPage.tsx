import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO, OPERATIONAL_YARDS, generateBreadcrumbSchema, generateFAQSchema, generateServiceSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { SEO_MATERIALS } from '@/lib/seo-engine';
import { getZipData } from '@/lib/seo-zips';
import { ArrowRight, MapPin, Phone, Truck, Clock, Shield, CheckCircle } from 'lucide-react';
import { useSeoTracking } from '@/hooks/useSeoTracking';
import { cityUrl, citySizeUrl, cityMaterialUrl, zipUrl } from '@/lib/seo-urls';
import NotFound from '../NotFound';

export default function SeoZipPage() {
  const { zip } = useParams<{ zip: string }>();
  const zipData = zip ? getZipData(zip) : undefined;

  if (!zipData) return <NotFound />;

  const yard = OPERATIONAL_YARDS.find(y => y.id === zipData.yardId);
  const { trackQuoteClick, trackCallClick } = useSeoTracking({ pageType: 'zip', city: zipData.city, zip: zipData.zip, slug: zipData.zip });
  const pageTitle = `Dumpster Rental ${zipData.zip} | ${zipData.city}, CA | Calsan`;
  const pageDescription = `Dumpster rental in ZIP ${zipData.zip} — ${zipData.city}, CA. Same-day delivery from our ${yard?.city || 'local'} yard. 5-50 yard sizes. Transparent pricing. Call (510) 680-2150.`;
  const canonicalPath = zipUrl(zipData.zip);
  const canonicalUrlFull = `${BUSINESS_INFO.url}${canonicalPath}`;

  const faqs = [
    { question: `How much is a dumpster rental in ${zipData.zip}?`, answer: `Dumpster rental in ${zipData.zip} (${zipData.city}) starts from $395 for a 5-yard container. Price depends on size and material type. Heavy materials are flat-fee. General debris overage is $${PRICING_POLICIES.overagePerTonGeneral}/ton.` },
    { question: `How fast can I get a dumpster in ${zipData.zip}?`, answer: `Same-day delivery to ${zipData.zip} (${zipData.neighborhoods.join(', ')}) is available when ordered before noon. Our ${yard?.name || 'local yard'} is close by for fast turnaround.` },
    { question: `Do I need a permit for a dumpster in ${zipData.zip}?`, answer: `If placing the dumpster on your private driveway, no permit is needed. Street placement in ${zipData.city} requires a permit from public works. We recommend driveway placement.` },
    { question: `What sizes are available for delivery to ${zipData.zip}?`, answer: `All sizes from 5 to 50 yards deliver to ${zipData.zip}. Heavy material containers (concrete, dirt) are available in 5, 8, and 10 yard sizes.` },
    { question: `Can I get a concrete dumpster in ${zipData.zip}?`, answer: `Yes. We deliver 5, 8, and 10 yard concrete dumpsters to ${zipData.zip}. Heavy materials are flat-fee pricing — disposal included, no weight overage charges.` },
    { question: `What areas does ${zipData.zip} cover?`, answer: `ZIP code ${zipData.zip} covers ${zipData.neighborhoods.join(', ')} in ${zipData.city}, CA. We deliver to all addresses within this ZIP.` },
    { question: `Is same-day delivery available to ${zipData.zip}?`, answer: `Yes, same-day delivery is typically available for ${zipData.zip} orders placed before noon. Our ${yard?.city || 'local'} yard is close enough for rapid dispatch.` },
    { question: `What is included in the rental price for ${zipData.zip}?`, answer: `Every rental includes delivery, pickup, and base tonnage (by size). Standard rental is ${PRICING_POLICIES.standardRentalDays} days. Extra days are $${PRICING_POLICIES.extraDayCost}/day.` },
  ];

  const schemas = [
    generateServiceSchema({
      name: `Dumpster Rental in ${zipData.zip} — ${zipData.city}, CA`,
      description: pageDescription,
      price: '$395',
      areaServed: [zipData.city, 'Bay Area', 'California'],
    }),
    generateFAQSchema(faqs),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: zipData.city, url: cityUrl(zipData.citySlug) },
      { name: zipData.zip, url: canonicalPath },
    ]),
  ];

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <Helmet>
        <link rel="canonical" href={canonicalUrlFull} />
        {schemas.map((schema, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
        ))}
      </Helmet>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-3">
              <Link to="/" className="hover:text-primary-foreground">Home</Link>
              <span>/</span>
              <Link to={cityUrl(zipData.citySlug)} className="hover:text-primary-foreground">{zipData.city}</Link>
              <span>/</span>
              <span className="text-primary-foreground">{zipData.zip}</span>
            </div>
            <h1 className="heading-xl mb-4">Dumpster Rental in {zipData.zip} — {zipData.city}, CA</h1>
            <p className="text-xl text-primary-foreground/85 mb-3">
              Real local yards. Transparent pricing. Serving {zipData.neighborhoods.join(', ')} and all addresses in {zipData.zip}.
            </p>
            <p className="text-primary-foreground/70 mb-6">
              Dispatched from our {yard?.name || 'local yard'} with same-day delivery available for orders placed before noon.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="cta" size="lg">
                <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}><Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-6 bg-muted/50 border-b border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span>Local Yard in {yard?.city || 'Bay Area'}</span></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span>Same-Day Delivery Available</span></div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /><span>Licensed & Insured</span></div>
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /><span>Hablamos Español</span></div>
          </div>
        </div>
      </section>

      {/* Local Context */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-4 text-center">Dumpster Service in {zipData.zip}</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            ZIP code {zipData.zip} includes {zipData.neighborhoods.join(', ')} in {zipData.city}, CA. 
            We deliver roll-off dumpsters to all residential and commercial addresses within this ZIP from our {yard?.name || 'local yard'}.
            Common projects in this area include home remodels, garage cleanouts, roofing tear-offs, concrete removal, and construction debris hauling.
          </p>
        </div>
      </section>

      {/* Sizes */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Dumpster Sizes for {zipData.zip}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {DUMPSTER_SIZES_DATA.map(size => (
              <Link key={size.yards} to={citySizeUrl(zipData.citySlug, size.yards)}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{size.yards}</div>
                <div className="text-xs text-muted-foreground mb-2">YARD</div>
                <div className="text-sm font-semibold text-primary">From ${size.priceFrom}</div>
                <div className="text-xs text-muted-foreground mt-1">{size.loads}</div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Exact pricing depends on ZIP, size, and material. <Link to="/quote" className="text-primary hover:underline">Get your exact price instantly</Link>.
          </p>
        </div>
      </section>

      {/* Materials */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-md text-foreground mb-6 text-center">Materials We Accept in {zipData.zip}</h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3">Heavy Materials (Flat Fee)</h3>
              <div className="space-y-2">
                {['Concrete', 'Dirt & Soil', 'Brick & Block', 'Asphalt', 'Rock'].map(m => (
                  <div key={m} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />{m}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Available in 5, 8, 10 yard. No weight overage.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3">General Debris</h3>
              <div className="space-y-2">
                {['Construction debris', 'Drywall & wood', 'Roofing shingles', 'Furniture & junk', 'Yard waste'].map(m => (
                  <div key={m} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />{m}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">All sizes 6-50 yard. Overage: ${PRICING_POLICIES.overagePerTonGeneral}/ton.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Calsan */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6 text-center">Why Calsan for {zipData.zip}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Real Local Yard', desc: `Our ${yard?.name || 'local yard'} means fast delivery, not a distant dispatch center.` },
              { title: 'Transparent Weight Rules', desc: 'Heavy materials are flat-fee. General debris overage is clearly posted. No surprises.' },
              { title: 'Professional Dispatch', desc: 'GPS-tracked trucks, experienced drivers, and morning/midday/afternoon delivery windows.' },
              { title: 'Bilingual Support', desc: 'Hablamos Español. Our team supports English and Spanish-speaking customers.' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6 text-center">Dumpster Rental FAQ — {zipData.zip}</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
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
          <h2 className="heading-lg mb-4">Ready to Rent in {zipData.zip}?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Get an instant quote for your {zipData.city} address. Same-day delivery available.</p>
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
            <Link to={cityUrl(zipData.citySlug)} className="text-primary hover:underline">All {zipData.city} Dumpsters</Link>
            <span className="text-muted-foreground hidden sm:inline">|</span>
            {SEO_MATERIALS.slice(0, 3).map(m => (
              <Link key={m.slug} to={cityMaterialUrl(zipData.citySlug, m.slug)} className="text-primary hover:underline">{m.name} in {zipData.city}</Link>
            ))}
            <span className="text-muted-foreground hidden sm:inline">|</span>
            <Link to="/sizes" className="text-primary hover:underline">All Sizes</Link>
            <Link to="/materials" className="text-primary hover:underline">Materials</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

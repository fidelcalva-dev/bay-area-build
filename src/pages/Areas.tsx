import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, CheckCircle, MapPin, Phone } from 'lucide-react';
import { CountySection } from '@/components/areas/CountySection';
import { serviceAreas } from '@/data/serviceAreas';
import { PAGE_SEO } from '@/lib/seo';

export default function Areas() {
  const [activeCounty, setActiveCounty] = useState(serviceAreas[0].slug);

  return (
    <Layout
      title={PAGE_SEO.areas.title}
      description={PAGE_SEO.areas.description}
      canonical={PAGE_SEO.areas.canonical}
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm mb-4">
              <MapPin className="w-4 h-4" />
              9 Counties • 100+ Cities
            </div>
            <h1 className="heading-xl mb-4">Dumpster Rental Near You</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              Serving the entire San Francisco Bay Area with same-day delivery. Select your county below to find service in your city.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="cta" size="lg">
                <Link to="/#quote">
                  Get Instant Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/20 hover:bg-white/20 text-primary-foreground">
                <a href="tel:+15106802150">
                  <Phone className="w-4 h-4" />
                  (510) 680-2150
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* County Tabs Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="heading-lg text-foreground mb-3">Select Your County</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Click on your county to see all cities we serve, with unique local information and FAQs for each area.
            </p>
          </div>

          <Tabs value={activeCounty} onValueChange={setActiveCounty} className="w-full">
            {/* Scrollable Tab List */}
            <div className="relative mb-8">
              <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                <TabsList className="inline-flex h-auto p-1 bg-muted rounded-xl gap-1 min-w-max">
                  {serviceAreas.map((county) => (
                    <TabsTrigger
                      key={county.slug}
                      value={county.slug}
                      className="px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                    >
                      {county.name.replace(' County', '')}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {/* Fade indicators */}
              <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
              <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
            </div>

            {/* Tab Content */}
            {serviceAreas.map((county) => (
              <TabsContent key={county.slug} value={county.slug} className="mt-0">
                <CountySection county={county} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Why Local Matters */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-lg text-foreground mb-6">Why Choose a Local Provider?</h2>
              <div className="space-y-4">
                {[
                  'Same-day delivery available in most areas',
                  'No long-distance fuel surcharges',
                  'Drivers who know your neighborhood',
                  'Quick response for pickups and swaps',
                  'Supporting local Bay Area business',
                  'Bilingual support (English & Spanish)',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="heading-sm text-foreground mb-4">Check Your Coverage</h3>
              <p className="text-muted-foreground mb-6">
                Enter your ZIP code to confirm service availability and get an instant quote.
              </p>
              <Button asChild variant="cta" size="lg" className="w-full">
                <Link to="/#quote">
                  Get Instant Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Or call <a href="tel:+15106802150" className="text-primary font-semibold">(510) 680-2150</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6 text-center">
            Bay Area Dumpster Rental Coverage
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p>
              Calsan Dumpsters Pro provides comprehensive roll-off dumpster rental service throughout the San Francisco Bay Area. 
              Our service area spans nine counties: <strong>Alameda</strong>, <strong>Contra Costa</strong>, <strong>Santa Clara</strong>, 
              <strong>San Francisco</strong>, <strong>San Mateo</strong>, <strong>Marin</strong>, <strong>Napa</strong>, <strong>Solano</strong>, 
              and <strong>Sonoma</strong> counties.
            </p>
            <p>
              Whether you're in Oakland, San Jose, San Francisco, or any of the 100+ cities we serve, you can count on same-day 
              or next-day dumpster delivery. Our experienced drivers know the Bay Area roads and can navigate everything from 
              downtown streets to hillside driveways.
            </p>
            <p>
              Looking for "dumpster rental near me" in the Bay Area? You've found your local provider. We offer transparent pricing, 
              flexible rental periods, and the full range of dumpster sizes from 8 to 40 yards. <strong>Hablamos español</strong> — 
              our bilingual team is ready to help.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Don't See Your City?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            We may still be able to serve you. Give us a call and we'll check if delivery is available in your area.
          </p>
          <Button asChild variant="cta" size="xl">
            <a href="tel:+15106802150">
              Call (510) 680-2150
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

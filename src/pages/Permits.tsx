import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { SeoJsonLd } from '@/components/seo/SeoJsonLd';
import { generateFAQSchema, generateBreadcrumbSchema, BUSINESS_INFO } from '@/lib/seo';
import { 
  FileText, MapPin, ArrowRight, Phone, AlertTriangle,
  CheckCircle, Clock, Building2, Home
} from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';

const CITY_PERMITS = [
  {
    city: 'Oakland',
    slug: '/dumpster-rental-oakland-ca',
    department: 'Oakland Public Works',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Street placement requires encroachment permit. Private property (driveways, parking lots) generally permit-free. Hill neighborhoods may need advance coordination.',
  },
  {
    city: 'San Jose',
    slug: '/dumpster-rental-san-jose-ca',
    department: 'San Jose Transportation Dept',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Encroachment permit required for street/sidewalk placement. Driveway placement typically does not require a permit.',
  },
  {
    city: 'San Francisco',
    slug: '/dumpster-rental-san-francisco-ca',
    department: 'SFMTA / DPW',
    streetPermit: true,
    processingDays: '5-10',
    privateExempt: true,
    notes: 'SF has strict street use regulations. Permits required for any public right-of-way placement. Expect longer processing times. Private property placement does not require a city permit.',
  },
  {
    city: 'Berkeley',
    slug: '/dumpster-rental/berkeley',
    department: 'Berkeley Public Works',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Street encroachment permit required. Contact Public Works at least 5 business days before delivery.',
  },
  {
    city: 'Hayward',
    slug: '/dumpster-rental/hayward',
    department: 'Hayward Public Works',
    streetPermit: true,
    processingDays: '2-3',
    privateExempt: true,
    notes: 'Residential street placement may require a temporary encroachment permit. Driveway placement typically exempt.',
  },
  {
    city: 'Fremont',
    slug: '/dumpster-rental/fremont',
    department: 'Fremont Public Works',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Permit required for public street or sidewalk placement. Private property generally does not require a permit.',
  },
];

const GENERAL_RULES = [
  { icon: Home, text: 'Private property (driveway, yard, parking lot) — usually no permit needed' },
  { icon: Building2, text: 'Public street or sidewalk — permit required in most Bay Area cities' },
  { icon: Clock, text: 'Apply 3-10 business days before delivery date' },
  { icon: FileText, text: 'We can guide you through the permit process for your city' },
];

const PERMIT_FAQS = [
  { question: 'Do I need a permit for a dumpster on my driveway?', answer: 'In most Bay Area cities, placing a dumpster on your own driveway or private property does not require a permit. Permits are typically only needed when a dumpster is placed on a public street, sidewalk, or right-of-way.' },
  { question: 'How long does it take to get a dumpster permit?', answer: 'Processing times vary by city. Oakland and San Jose typically take 3-5 business days. San Francisco can take 5-10 business days due to stricter regulations. We recommend applying at least one week before your planned delivery date.' },
  { question: 'Can Calsan help me get a dumpster permit?', answer: 'Yes. While we cannot apply for permits on your behalf, we provide guidance on the process for your specific city, including which department to contact, required documents, and typical timelines. Call us at (510) 680-2150 for help.' },
  { question: 'What happens if I place a dumpster without a permit?', answer: 'Placing a dumpster on a public street without a permit can result in fines from the city, mandatory removal, and towing charges. Always check your local requirements before scheduling delivery to a street location.' },
  { question: 'Do HOAs have separate rules for dumpster placement?', answer: 'Yes, many HOAs have their own rules about dumpster placement, duration, and screening requirements. Check with your HOA before ordering. We can often accommodate HOA requirements with flexible scheduling.' },
];

export default function Permits() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Permits & Rules', url: '/permits' },
  ];

  return (
    <Layout
      title="Dumpster Permit Guide | Bay Area City Rules"
      description="Do you need a permit for a dumpster? Bay Area permit rules by city — Oakland, San Jose, San Francisco. What you need, how long it takes, and how we help."
      canonical="/permits"
      schema={[
        generateBreadcrumbSchema(breadcrumbs),
        generateFAQSchema(PERMIT_FAQS),
      ]}
    >
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container-wide">
          <nav className="text-sm text-primary-foreground/70 mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span>Permits &amp; Rules</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Dumpster Permit Guide — Bay Area
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl">
            Most dumpster placements on private property don't need a permit. Street placement rules vary by city. Here's what you need to know.
          </p>
        </div>
      </section>

      {/* General Rules */}
      <AnimatedSection className="container-wide py-12">
        <h2 className="text-2xl font-bold mb-6">General Rules</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {GENERAL_RULES.map((rule, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
              <rule.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">{rule.text}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* City-by-City */}
      <section className="container-wide pb-12">
        <h2 className="text-2xl font-bold mb-6">Permit Rules by City</h2>
        <StaggeredContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CITY_PERMITS.map((city) => (
            <AnimatedItem key={city.city}>
              <div className="border border-border rounded-xl p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">{city.city}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{city.department}</p>
                <div className="space-y-2 text-sm mb-4 flex-1">
                  <div className="flex items-center gap-2">
                    {city.streetPermit ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    <span>Street permit: {city.streetPermit ? 'Required' : 'Not required'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Processing: {city.processingDays} business days</span>
                  </div>
                  {city.privateExempt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Private property: No permit needed</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-4">{city.notes}</p>
                <Link to={city.slug} className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
                  View {city.city} dumpster rental <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </AnimatedItem>
          ))}
        </StaggeredContainer>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-12">
        <div className="container-wide">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl">
            {PERMIT_FAQS.map((faq, i) => (
              <details key={i} className="bg-background border border-border rounded-xl p-4 group">
                <summary className="font-medium cursor-pointer list-none flex items-center justify-between">
                  {faq.question}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-wide py-12 text-center">
        <h2 className="text-2xl font-bold mb-3">Need Help with Permits?</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Call us and we'll walk you through the permit process for your city, or help you find a driveway placement that doesn't need one.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link to="/quote">Get Dumpster Quote</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
              <Phone className="w-4 h-4 mr-2" />
              {BUSINESS_INFO.phone.salesFormatted}
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

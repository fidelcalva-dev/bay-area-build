import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { generateFAQSchema, generateBreadcrumbSchema, BUSINESS_INFO } from '@/lib/seo';
import { PageFAQ, InternalLinkCluster, type FAQItem } from '@/components/seo';
import { 
  FileText, MapPin, ArrowRight, Phone, AlertTriangle,
  CheckCircle, Clock, Building2, Home, Shield, Truck, Info
} from 'lucide-react';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';

interface CityPermit {
  city: string;
  slug: string;
  department: string;
  streetPermit: boolean;
  processingDays: string;
  privateExempt: boolean;
  notes: string;
  featured?: boolean;
}

const CITY_PERMITS: CityPermit[] = [
  {
    city: 'Oakland',
    slug: '/dumpster-rental-oakland-ca',
    department: 'Oakland Public Works',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Street placement requires encroachment permit. Private property (driveways, parking lots) generally permit-free. Hill neighborhoods may need advance coordination due to narrow streets and fire access requirements.',
    featured: true,
  },
  {
    city: 'San Jose',
    slug: '/dumpster-rental-san-jose-ca',
    department: 'San Jose Transportation Dept',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Encroachment permit required for street/sidewalk placement. Driveway placement typically does not require a permit. Downtown San Jose and high-traffic areas may have additional restrictions.',
    featured: true,
  },
  {
    city: 'San Francisco',
    slug: '/dumpster-rental-san-francisco-ca',
    department: 'SFMTA / DPW',
    streetPermit: true,
    processingDays: '5-10',
    privateExempt: true,
    notes: 'SF has the strictest street-use regulations in the Bay Area. Permits required for any public right-of-way. Expect longer processing (5-10 days). Many neighborhoods lack driveways — plan for street placement and budget extra time for the permit.',
    featured: true,
  },
  {
    city: 'Berkeley',
    slug: '/dumpster-rental/berkeley',
    department: 'Berkeley Public Works',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Street encroachment permit required. Contact Public Works at least 5 business days before delivery. Hills areas have narrow streets that may require coordination.',
  },
  {
    city: 'Fremont',
    slug: '/dumpster-rental/fremont',
    department: 'Fremont Public Works',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Permit required for public street or sidewalk placement. Private property generally does not require a permit. Suburban driveways typically accommodate all sizes easily.',
  },
  {
    city: 'Hayward',
    slug: '/dumpster-rental/hayward',
    department: 'Hayward Public Works',
    streetPermit: true,
    processingDays: '2-3',
    privateExempt: true,
    notes: 'Residential street placement may require a temporary encroachment permit. Driveway placement typically exempt. Faster processing than most Bay Area cities.',
  },
  {
    city: 'San Leandro',
    slug: '/dumpster-rental/san-leandro',
    department: 'San Leandro Public Works',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Encroachment permit for street placement. Residential driveways are typically wide enough for all standard sizes.',
  },
  {
    city: 'Concord',
    slug: '/dumpster-rental/concord',
    department: 'Concord Engineering',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Street encroachment permit required. Most Concord properties have ample driveway space for private placement.',
  },
  {
    city: 'Walnut Creek',
    slug: '/dumpster-rental/walnut-creek',
    department: 'Walnut Creek Public Works',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Permit needed for street placement. HOA communities may have additional rules — check before ordering.',
  },
  {
    city: 'Palo Alto',
    slug: '/dumpster-rental/palo-alto',
    department: 'Palo Alto Public Works',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Street use requires encroachment permit. Residential neighborhoods may have parking restrictions that affect placement.',
  },
  {
    city: 'Santa Clara',
    slug: '/dumpster-rental/santa-clara',
    department: 'Santa Clara Public Works',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Permit required for public right-of-way. Most residential and commercial properties can accommodate driveway placement.',
  },
  {
    city: 'Sunnyvale',
    slug: '/dumpster-rental/sunnyvale',
    department: 'Sunnyvale Public Works',
    streetPermit: true,
    processingDays: '3-5',
    privateExempt: true,
    notes: 'Encroachment permit for street placement. Suburban lot sizes generally support private property placement for all dumpster sizes.',
  },
];

const GENERAL_RULES = [
  { icon: Home, text: 'Private property (driveway, yard, parking lot) — usually no permit needed' },
  { icon: Building2, text: 'Public street or sidewalk — permit required in most Bay Area cities' },
  { icon: Clock, text: 'Apply 3-10 business days before your scheduled delivery' },
  { icon: FileText, text: 'We can guide you through the permit process for your specific city' },
];

const PERMIT_FAQS: FAQItem[] = [
  { question: 'Do I need a permit for a dumpster on my driveway?', answer: 'In most Bay Area cities, placing a dumpster on your own driveway or private property does not require a permit. Permits are typically only needed when a dumpster is placed on a public street, sidewalk, or right-of-way.' },
  { question: 'How long does it take to get a dumpster permit?', answer: 'Processing times vary by city. Oakland and San Jose typically take 3-5 business days. San Francisco can take 5-10 business days due to stricter regulations. We recommend applying at least one week before your planned delivery date.' },
  { question: 'Can Calsan help me get a dumpster permit?', answer: 'Yes. While we cannot apply for permits on your behalf, we provide guidance on the process for your specific city, including which department to contact, required documents, and typical timelines. Call us at (510) 680-2150 for help.' },
  { question: 'What happens if I place a dumpster without a permit?', answer: 'Placing a dumpster on a public street without a permit can result in fines from the city, mandatory removal, and towing charges. Always check your local requirements before scheduling delivery to a street location.' },
  { question: 'Do HOAs have separate rules for dumpster placement?', answer: 'Yes, many HOAs have their own rules about dumpster placement, duration, and screening requirements. Check with your HOA before ordering. We can often accommodate HOA requirements with flexible scheduling.' },
  { question: 'Can I place a dumpster on a sloped driveway?', answer: 'Dumpsters need a reasonably level, firm surface. Slight slopes are usually fine — our driver will assess on delivery. Steep hills (common in Oakland and SF) may require alternative placement. Call us to discuss your specific site.' },
];

const featuredCities = CITY_PERMITS.filter(c => c.featured);
const otherCities = CITY_PERMITS.filter(c => !c.featured);

export default function Permits() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Permits & Placement Guide', url: '/permits' },
  ];

  return (
    <Layout
      title="Dumpster Permit Guide | Bay Area City-by-City Rules"
      description="Do you need a permit for a dumpster in the Bay Area? City-by-city rules for Oakland, San Jose, San Francisco, and 9 more cities. Street vs private property placement."
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
            <span>Permits &amp; Placement Guide</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Dumpster Permit &amp; Placement Guide — Bay Area
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl">
            Most dumpster placements on private property don't need a permit. Street placement rules vary by city. Here's what you need to know for 12 Bay Area cities.
          </p>
        </div>
      </section>

      {/* Street vs Private Property */}
      <section className="container-wide py-12">
        <h2 className="text-2xl font-bold mb-6">Street Placement vs. Private Property</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-success/5 border border-success/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Home className="w-6 h-6 text-success" />
              <h3 className="text-lg font-bold text-foreground">Private Property — Usually No Permit</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />Your driveway, yard, or parking lot</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />Construction sites with private access</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />Commercial properties with loading areas</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />HOAs may have additional rules — check first</li>
            </ul>
          </div>
          <div className="bg-warning/5 border border-warning/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-warning" />
              <h3 className="text-lg font-bold text-foreground">Street / Public Right-of-Way — Permit Required</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />City street in front of your property</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />Public sidewalks or alleys</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />Metered parking or public parking areas</li>
              <li className="flex items-start gap-2"><Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />Apply 3-10 business days before delivery</li>
            </ul>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GENERAL_RULES.map((rule, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
              <rule.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">{rule.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cities (Oakland, SJ, SF) */}
      <section className="bg-muted/30 py-12">
        <div className="container-wide">
          <h2 className="text-2xl font-bold mb-2">Major Cities — Detailed Guidance</h2>
          <p className="text-muted-foreground mb-8">Placement and permit details for Oakland, San Jose, and San Francisco.</p>
          <div className="grid lg:grid-cols-3 gap-6">
            {featuredCities.map((city) => (
              <div key={city.city} className="bg-card border-2 border-primary/20 rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">{city.city}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{city.department}</p>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span>Street permit: Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Processing: {city.processingDays} business days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Private property: No permit needed</span>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-lg p-4 mb-4 flex-1">
                  <p className="text-sm text-muted-foreground">{city.notes}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-warning/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-warning font-medium flex items-start gap-1.5">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    We recommend verifying current permit requirements with {city.department} before scheduling street delivery.
                  </p>
                </div>
                <Link to={city.slug} className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
                  View {city.city} dumpster rental <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Cities */}
      <section className="container-wide py-12">
        <h2 className="text-2xl font-bold mb-6">More Bay Area Cities</h2>
        <StaggeredContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherCities.map((city) => (
            <AnimatedItem key={city.city}>
              <div className="border border-border rounded-xl p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">{city.city}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{city.department}</p>
                <div className="space-y-2 text-sm mb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span>Street permit: Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Processing: {city.processingDays} business days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Private property: No permit needed</span>
                  </div>
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

      {/* When to Verify */}
      <section className="bg-muted/30 py-12">
        <div className="container-wide max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">When Should You Verify Permit Requirements?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-5">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Your dumpster will be on a public street</p>
                <p className="text-sm text-muted-foreground">Contact your city's public works department at least 5-10 business days before delivery.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-5">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">You live in an HOA community</p>
                <p className="text-sm text-muted-foreground">Many HOAs restrict dumpster placement, duration, or require screening. Check your CC&Rs before ordering.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-5">
              <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Your street is narrow or has limited access</p>
                <p className="text-sm text-muted-foreground">Hill neighborhoods in Oakland, Berkeley, and SF may have fire access or turning radius constraints. Call us to discuss placement options.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-5">
              <Building2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Your project is in a downtown or commercial zone</p>
                <p className="text-sm text-muted-foreground">Downtown areas in Oakland, SF, and San Jose may have loading zone restrictions or time-of-day placement rules.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageFAQ faqs={PERMIT_FAQS} />
      <InternalLinkCluster exclude={['/permits']} />

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Help with Permits or Placement?</h2>
          <p className="text-lg text-primary-foreground/80 mb-6">
            Call us and we'll walk you through the permit process for your city, or help you find a private placement that doesn't need one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">Get Dumpster Quote</Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-4 h-4 mr-2" />
                {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/seo';
import { ArrowRight, Phone, FileText, MapPin, Shield, Truck } from 'lucide-react';

const PERMIT_GUIDES = [
  {
    city: 'Oakland',
    slug: 'oakland',
    department: 'Oakland Public Works',
    details: 'Street placement in Oakland requires an encroachment permit from Oakland Public Works. Processing typically takes 3-5 business days. Dumpsters placed on private property (driveways, parking lots) generally do not require permits. For projects in the Oakland Hills, advance coordination for placement on steep grades is recommended.',
    tips: [
      'Apply at Oakland Public Works at least 5 business days before delivery',
      'Private property placement (driveway, parking lot) typically permit-free',
      'Hill neighborhoods may need advance placement coordination',
      'Keep permits visible on the dumpster during rental period',
    ],
  },
  {
    city: 'San Jose',
    slug: 'san-jose',
    department: 'San Jose Department of Transportation',
    details: 'San Jose requires a right-of-way permit for dumpsters placed on public streets or sidewalks. Apply through the Department of Transportation. Most residential driveway placements do not require a permit. HOA communities may have additional requirements -- check with your association before scheduling delivery.',
    tips: [
      'Right-of-way permits required for street placement',
      'Apply through San Jose DOT at least 5 business days ahead',
      'Driveway placements typically do not need permits',
      'HOA neighborhoods may have separate requirements',
    ],
  },
  {
    city: 'San Francisco',
    slug: 'san-francisco',
    department: 'San Francisco Public Works (SFPW)',
    details: 'San Francisco has strict street placement rules. All dumpsters on public streets require an SFPW encroachment permit. Due to limited parking and narrow streets, advance planning is essential. We coordinate the SFPW permit process for customers. Street cleaning schedules must be considered when selecting placement dates.',
    tips: [
      'SFPW encroachment permit required for all street placements',
      'We handle permit coordination for our customers',
      'Consider street cleaning schedules when planning delivery',
      'Tight access areas (narrow streets, steep hills) require experienced drivers',
      'Permit processing may take 5-10 business days in SF',
    ],
  },
];

const RESOURCES = [
  {
    title: 'Dumpster Size Guide for Contractors',
    description: 'Choose the right dumpster size for your project scope. From 6-yard concrete removal to 50-yard commercial demolition.',
    link: '/sizes',
    icon: Truck,
  },
  {
    title: 'Material Disposal Guide',
    description: 'Accepted materials, prohibited items, and special handling for concrete, dirt, roofing, and hazardous waste.',
    link: '/materials',
    icon: Shield,
  },
  {
    title: 'Service Areas Map',
    description: 'Our delivery coverage across the SF Bay Area. Oakland, San Jose, San Francisco, and 9 Bay Area counties.',
    link: '/areas',
    icon: MapPin,
  },
];

export default function ContractorResources() {
  return (
    <Layout
      title="Contractor Resource Hub | Permit Guides & Dumpster Planning"
      description="Contractor resources for dumpster rental in the Bay Area. Permit guides for Oakland, San Jose, and San Francisco. Sizing, materials, and project planning tools."
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">Contractor Resource Hub</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              Permit guides, sizing tools, and project planning resources for Bay Area contractors. Everything you need to manage dumpster logistics on your job sites.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="cta" size="lg">
                <Link to="/quote/contractor">Contractor Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}><Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Permit Guides */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-3 text-center">Dumpster Permit Guides by City</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Permit requirements vary by city. Use these guides to plan ahead and avoid delays on your project.
          </p>

          <div className="space-y-8 max-w-4xl mx-auto">
            {PERMIT_GUIDES.map(guide => (
              <div key={guide.slug} className="bg-card border border-border rounded-xl p-6 lg:p-8">
                <div className="flex items-start gap-3 mb-4">
                  <FileText className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{guide.city} Dumpster Permit Guide</h3>
                    <p className="text-sm text-muted-foreground">Issuing Authority: {guide.department}</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{guide.details}</p>
                <ul className="space-y-2 mb-4">
                  {guide.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/dumpster-rental/${guide.slug}-ca`}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  View all dumpster services in {guide.city}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Resources */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <h2 className="heading-md text-foreground mb-8 text-center">Planning Resources</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {RESOURCES.map(resource => (
              <Link
                key={resource.link}
                to={resource.link}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all group"
              >
                <resource.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{resource.title}</h3>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Outreach / Partnership */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-4 text-center">Partner With Us</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            We work with contractors, roofers, demolition crews, and home builders across the Bay Area. Volume programs, priority scheduling, and Net-30 terms available for qualified contractors.
          </p>
          <div className="bg-card border border-border rounded-xl p-6 lg:p-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Contractor Benefits</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Volume discounts up to 10%</li>
                  <li>Priority same-day scheduling</li>
                  <li>Dedicated account manager</li>
                  <li>Net-30 terms for qualified accounts</li>
                  <li>Multi-site coordination</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">Industries We Serve</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>General contractors</li>
                  <li>Roofing companies</li>
                  <li>Demolition contractors</li>
                  <li>Home builders and remodelers</li>
                  <li>Property management firms</li>
                  <li>Landscaping companies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Get a contractor quote in under 60 seconds. Volume pricing and priority scheduling available.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote/contractor">Contractor Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}><Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

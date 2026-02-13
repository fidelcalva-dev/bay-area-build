import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, HardHat, Truck, Clock, RefreshCw, Phone, CheckCircle, BookOpen } from 'lucide-react';
import { WeightEducation } from '@/components/quote/WeightEducation';
import { DrivewayProtection, CityPermitHelper } from '@/components/education';
import { ContractorTipsSection } from '@/components/sections/ContractorTipsSection';
import { PAGE_SEO, BUSINESS_INFO } from '@/lib/seo';
import { CTA_LINKS } from '@/lib/shared-data';

const benefits = [
  {
    icon: Clock,
    title: 'Priority Dispatch',
    description: 'Contractors get moved to the front of the line. Same-day delivery available (subject to availability).',
  },
  {
    icon: RefreshCw,
    title: 'Fast Replacements',
    description: 'Dumpster full? We can swap it out within 24 hours to keep your project moving (subject to availability).',
  },
  {
    icon: Truck,
    title: 'Multi-Dumpster Projects',
    description: 'Need multiple dumpsters at once? We handle large-scale jobs with coordinated delivery.',
  },
  {
    icon: Phone,
    title: 'Dedicated Support',
    description: 'Direct line to our contractor team. Skip the queue and get answers fast.',
  },
];

const services = [
  'New construction waste removal',
  'Renovation and remodel debris',
  'Roofing tear-offs',
  'Demolition projects',
  'Landscaping and excavation',
  'Commercial buildouts',
  'Multi-family property cleanouts',
  'Industrial waste disposal',
];

// Force rebuild - module import fix
export default function Contractors() {
  return (
    <Layout
      title={PAGE_SEO.contractors.title}
      description={PAGE_SEO.contractors.description}
      canonical={PAGE_SEO.contractors.canonical}
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full text-sm font-medium mb-6">
                <HardHat className="w-4 h-4" />
                <span>For Construction Professionals</span>
              </div>
              <h1 className="heading-xl mb-4">Contractor Services</h1>
              <p className="text-xl text-primary-foreground/85 mb-8">
                Priority dispatch. Faster swaps. Dedicated support. We keep your jobsite running on schedule.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="hero" size="xl">
                  <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                    Call Contractor Line
                    <Phone className="w-5 h-5" />
                  </a>
                </Button>
                <Button asChild variant="heroSecondary" size="xl">
                  <Link to="/quote">
                    Order Now
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <HardHat className="w-32 h-32 text-primary-foreground/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">Built for Contractors</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We understand construction timelines. That's why we offer services designed to keep your project on track.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-5">
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-lg text-foreground mb-6">Projects We Handle</h2>
              <p className="text-muted-foreground mb-8">
                From small renovations to large-scale construction, we provide the waste removal support you need.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {services.map((service) => (
                  <div key={service} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-foreground">{service}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="heading-sm text-foreground mb-4">Set Up a Contractor Account</h3>
              <p className="text-muted-foreground mb-6">
                Get priority scheduling, volume discounts, and dedicated support. Call us to set up your account.
              </p>
              <div className="space-y-4">
                <Button asChild variant="cta" size="lg" className="w-full">
                  <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                    <Phone className="w-4 h-4" />
                    {BUSINESS_INFO.phone.salesFormatted}
                  </a>
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Or email <a href={`mailto:${BUSINESS_INFO.email}`} className="text-primary font-semibold">{BUSINESS_INFO.email}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contractor Tips Quick Reference */}
      <ContractorTipsSection variant="compact" />

      {/* Educational Resources */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium text-muted-foreground mb-4">
              <BookOpen className="w-4 h-4" />
              <span>Contractor Resources</span>
            </div>
            <h2 className="heading-lg text-foreground mb-3">Know Before You Rent</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Avoid surprises with our quick guides on weight limits, driveway protection, and permits.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <WeightEducation compact className="h-fit" />
            <DrivewayProtection className="h-fit" />
            <CityPermitHelper className="h-fit lg:col-span-1 md:col-span-2 lg:max-w-none" />
          </div>
        </div>
      </section>
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Partner Up?</h2>
          <p className="text-lg text-secondary-foreground/80 mb-8">
            Join hundreds of Bay Area contractors who trust Calsan Dumpsters Pro for reliable waste removal.
          </p>
          <Button asChild variant="cta" size="xl">
            <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
              Call Now: {BUSINESS_INFO.phone.salesFormatted}
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

import { Link } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { HOMEPAGE, CORE_SERVICES, CLEANUP_BRAND, BRAND_CLARIFICATION } from '@/config/cleanup/content';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Phone, Camera, FileText, HardHat, Sparkles, Hammer, CalendarCheck, ChevronRight } from 'lucide-react';

const SERVICE_ICONS: Record<string, React.ElementType> = {
  'hard-hat': HardHat,
  'sparkles': Sparkles,
  'hammer': Hammer,
  'calendar-check': CalendarCheck,
};

export default function CleanupHome() {
  return (
    <CleanupLayout
      title="Construction Cleanup & Debris Removal in Oakland & Alameda | Calsan C&D Waste Removal"
      description="Calsan C&D Waste Removal provides construction cleanup, post-construction cleanup, demolition debris cleanup, and recurring jobsite cleanup in Oakland, Alameda, and the Bay Area. CSLB #1152237."
    >
      {/* ===== HERO ===== */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold bg-primary-foreground/10 px-3 py-1 rounded-full mb-4">
              <span>{CLEANUP_BRAND.license}</span>
              <span className="w-1 h-1 bg-accent rounded-full" />
              <span>Fast Response</span>
              <span className="w-1 h-1 bg-accent rounded-full" />
              <span>Clear Pricing</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight mb-4">
              {HOMEPAGE.hero.h1}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 max-w-2xl">
              {HOMEPAGE.hero.sub}
            </p>
            <ul className="space-y-2 mb-8">
              {HOMEPAGE.hero.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-primary-foreground/90 text-sm">
                  <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" variant="cta" className="text-base font-bold">
                <Link to="/cleanup/quote">
                  <FileText className="w-5 h-5 mr-2" />
                  Request a Quote
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <a href={`tel:${CLEANUP_BRAND.phone}`}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/cleanup/quote#photos">
                  <Camera className="w-5 h-5 mr-2" />
                  Upload Photos
                </Link>
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/60 mt-4">{HOMEPAGE.hero.supportLine}</p>
          </div>
        </div>
      </section>

      {/* ===== INTRO ===== */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{HOMEPAGE.intro.headline}</h2>
          <p className="text-muted-foreground leading-relaxed">{HOMEPAGE.intro.body}</p>
        </div>
      </section>

      {/* ===== CORE SERVICES ===== */}
      <section className="bg-muted py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Core Cleanup Services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_SERVICES.map((svc) => {
              const Icon = SERVICE_ICONS[svc.icon] || HardHat;
              return (
                <Link
                  key={svc.code}
                  to={`/cleanup/${svc.slug}`}
                  className="group bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{svc.name}</h3>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">{svc.tagline}</p>
                  <p className="text-sm font-semibold text-primary mb-3">{svc.startingPrice}</p>
                  <span className="text-sm font-medium text-accent group-hover:underline inline-flex items-center gap-1">
                    Learn More <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WHO WE SERVE ===== */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{HOMEPAGE.whoWeServe.headline}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{HOMEPAGE.whoWeServe.body}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {HOMEPAGE.whoWeServe.segments.map((seg) => (
              <span key={seg} className="bg-primary/5 text-primary text-sm font-medium px-4 py-2 rounded-full border border-primary/10">
                {seg}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="bg-muted py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">{HOMEPAGE.whyChoose.headline}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOMEPAGE.whyChoose.points.map((p) => (
              <div key={p.title} className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">{HOMEPAGE.howItWorks.headline}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOMEPAGE.howItWorks.steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DUMPSTER CROSSOVER ===== */}
      <section className="bg-foreground text-primary-foreground py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{HOMEPAGE.dumpsterCrossover.headline}</h2>
          <p className="text-primary-foreground/80 mb-6">{HOMEPAGE.dumpsterCrossover.body}</p>
          <Button asChild size="lg" variant="cta">
            <a href={CLEANUP_BRAND.legacy_url} target="_blank" rel="noopener noreferrer">
              {HOMEPAGE.dumpsterCrossover.cta} <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>
      </section>

      {/* ===== SERVICE AREAS ===== */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{HOMEPAGE.serviceAreas.headline}</h2>
          <p className="text-muted-foreground mb-6">{HOMEPAGE.serviceAreas.body}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/cleanup/oakland" className="text-sm font-medium text-primary hover:underline">Oakland →</Link>
            <Link to="/cleanup/alameda" className="text-sm font-medium text-primary hover:underline">Alameda →</Link>
            <Link to="/cleanup/bay-area" className="text-sm font-medium text-primary hover:underline">Bay Area →</Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ PREVIEW ===== */}
      <section className="bg-muted py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {HOMEPAGE.faqPreview.map((faq) => (
              <div key={faq.q} className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{HOMEPAGE.finalCta.headline}</h2>
          <p className="text-muted-foreground mb-6">{HOMEPAGE.finalCta.body}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg" variant="cta">
              <Link to="/cleanup/quote">Request a Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/cleanup/contact">Contact Us</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">{BRAND_CLARIFICATION}</p>
        </div>
      </section>
    </CleanupLayout>
  );
}

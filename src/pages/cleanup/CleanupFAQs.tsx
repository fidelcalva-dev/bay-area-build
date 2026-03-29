import { Link } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { Button } from '@/components/ui/button';

const FAQS = [
  // Services
  { cat: 'Services', q: 'What kinds of cleanup projects do you handle?', a: 'We handle construction cleanup, post-construction/final cleanup, demolition debris cleanup, recurring jobsite cleanup, material pickup, and labor-assisted cleanup for active jobsites across the Bay Area.' },
  { cat: 'Services', q: 'Do you do structural demolition?', a: 'No. We provide cleanup and debris support for material resulting from construction and demolition activity, not structural demolition work.' },
  { cat: 'Services', q: 'What is labor-assisted cleanup?', a: 'Labor-assisted cleanup provides workers ($95/hr per tech, 2-tech / 2-hr minimum) for loading, material movement, debris pickup, and cleanup support tied to active project phases.' },
  // Pricing
  { cat: 'Pricing', q: 'How is pricing determined?', a: 'Pricing is based on scope, labor, disposal requirements, and real site conditions. Send photos and project details for accurate pricing. Starting ranges are published on our pricing page.' },
  { cat: 'Pricing', q: 'Are there additional fees for rush or after-hours service?', a: 'Yes. Rush service is +20%, after-hours is +25%. Other surcharges may apply for stairs, poor access, or mixed heavy debris.' },
  // Scheduling
  { cat: 'Scheduling', q: 'How quickly can you start?', a: 'We offer fast response. After scope review, most projects can be scheduled within 1-3 business days. Rush scheduling is available.' },
  { cat: 'Scheduling', q: 'Do you offer recurring service?', a: 'Yes. We offer weekly, bi-weekly, and custom recurring cleanup plans for contractors with active projects. Plans start at $1,200/month.' },
  // Dumpster Rentals
  { cat: 'Dumpster Rentals', q: 'Do you still offer dumpster rentals?', a: 'Dumpster rentals continue through our sister brand, Calsan Dumpsters Pro. We can help connect you if your project needs both services.' },
  // Contractors
  { cat: 'Contractors', q: 'Do you work with general contractors?', a: 'Yes. General contractors, remodelers, ADU builders, and trade contractors are our primary clients. We offer recurring plans and phase-based cleanup.' },
  { cat: 'Contractors', q: 'Can I send photos for a faster quote?', a: 'Absolutely. Photos help us review scope faster and provide a more accurate recommendation. Use our quote form or text them to us.' },
  { cat: 'Contractors', q: 'What areas do you serve?', a: 'We serve Oakland, Alameda, and the greater Bay Area. Contact us to confirm availability for your project location.' },
  { cat: 'Contractors', q: 'How do I get started?', a: 'Use our quote form, call us, or send project details and photos. We review the scope and follow up with a recommendation and pricing.' },
];

const CATEGORIES = [...new Set(FAQS.map((f) => f.cat))];

export default function CleanupFAQs() {
  return (
    <CleanupLayout
      title="Frequently Asked Questions | Calsan C&D Waste Removal"
      description="Answers to common questions about construction cleanup, pricing, scheduling, recurring service, and the relationship to Calsan Dumpsters Pro."
    >
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-8">Frequently Asked Questions</h1>
          {CATEGORIES.map((cat) => (
            <div key={cat} className="mb-8">
              <h2 className="text-lg font-bold text-foreground mb-4">{cat}</h2>
              <div className="space-y-3">
                {FAQS.filter((f) => f.cat === cat).map((faq) => (
                  <div key={faq.q} className="bg-card rounded-xl border border-border p-5">
                    <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center mt-10">
            <p className="text-muted-foreground mb-4">Have another question? We're happy to help.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild size="lg" variant="cta">
                <Link to="/cleanup/quote">Request a Quote</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/cleanup/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </CleanupLayout>
  );
}

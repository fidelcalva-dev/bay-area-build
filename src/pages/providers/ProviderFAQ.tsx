import { Helmet } from 'react-helmet-async';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQS = [
  { q: 'What types of leads will I receive?', a: 'Leads are matched by service category, geographic area, and your plan. You may receive construction cleanup, post-construction, demolition debris, and material pickup leads.' },
  { q: 'How are leads delivered?', a: 'Leads are delivered via your provider dashboard and optional email/SMS notifications based on your delivery preferences.' },
  { q: 'Can I choose exclusive territories?', a: 'Yes, Growth and Pro plans support exclusive ZIP code add-ons for an additional monthly fee.' },
  { q: 'What is the cancellation policy?', a: 'You can cancel anytime. Your subscription will remain active until the end of the current billing period.' },
  { q: 'Do I need a contractor license?', a: 'We recommend having appropriate licensing for your service area. This builds trust with customers and may be required by local regulations.' },
  { q: 'How does lead routing work?', a: 'Our routing engine considers service match, geographic proximity, subscription tier, response SLA, QA score, and capacity to deliver leads to the best-fit provider.' },
];

export default function ProviderFAQ() {
  return (
    <>
      <Helmet>
        <title>Provider FAQ | Calsan Platform</title>
        <meta name="description" content="Frequently asked questions for providers joining the Calsan marketplace." />
      </Helmet>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground text-center mb-8">Provider FAQ</h1>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </>
  );
}

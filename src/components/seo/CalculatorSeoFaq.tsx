import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { BUSINESS_INFO, generateFAQSchema } from '@/lib/seo';
import { Helmet } from 'react-helmet-async';

const CALCULATOR_FAQS = [
  {
    question: 'How much does dumpster rental cost in the Bay Area?',
    answer: `Dumpster rental in the Bay Area starts from $${Math.min(...DUMPSTER_SIZES_DATA.map(s => s.priceFrom))} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard dumpster. Prices vary by size, material type, and location. All rentals include delivery, pickup, and a ${PRICING_POLICIES.standardRentalDays}-day rental period. Get an instant quote above by entering your ZIP code.`,
  },
  {
    question: 'What size dumpster do I need for my project?',
    answer: `For small cleanouts and bathroom remodels, a 6-8 yard dumpster works well. Kitchen and room renovations typically need a 10-20 yard dumpster. Major construction, roofing, or whole-house renovations usually require a 30-40 yard dumpster. Enter your project details in the calculator for a personalized recommendation.`,
  },
  {
    question: 'Are there hidden fees in dumpster rental pricing?',
    answer: `No. Our quoted price includes delivery, pickup, and your weight allowance. The only additional charge is a $${PRICING_POLICIES.overagePerTonGeneral}/ton overage fee if your load exceeds the included tonnage. Heavy materials (concrete, dirt) are flat-fee with no weight overage. We provide exact pricing before you book.`,
  },
  {
    question: 'Can I get same-day dumpster delivery?',
    answer: `Yes. Same-day delivery is available for most Bay Area addresses when ordered before noon. We serve Oakland, San Jose, San Francisco, and all 9 Bay Area counties from our local yards. Call ${BUSINESS_INFO.phone.salesFormatted} for urgent requests.`,
  },
  {
    question: 'What materials can I put in a dumpster?',
    answer: 'Accepted materials include construction debris, concrete, dirt, rock, wood, drywall, roofing shingles, yard waste, and general household junk. Prohibited items include hazardous waste, paint, chemicals, batteries, tires, and appliances with freon. Heavy materials (concrete, dirt, rock) require dedicated heavy-material dumpsters.',
  },
  {
    question: 'How long can I keep the dumpster?',
    answer: `Standard rental is ${PRICING_POLICIES.standardRentalDays} days, included in your quoted price. Extensions are available if you need more time. Contact us before your rental period ends to arrange an extension.`,
  },
];

export function CalculatorSeoFaq() {
  const priceRangeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Dumpster Rental - Bay Area',
    description: 'Roll-off dumpster rental service in the San Francisco Bay Area. Available in 6 to 50 yard sizes.',
    brand: { '@type': 'Brand', name: BUSINESS_INFO.name },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: Math.min(...DUMPSTER_SIZES_DATA.map(s => s.priceFrom)),
      highPrice: Math.max(...DUMPSTER_SIZES_DATA.map(s => s.priceFrom)),
      priceCurrency: 'USD',
      offerCount: DUMPSTER_SIZES_DATA.length,
    },
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(generateFAQSchema(CALCULATOR_FAQS))}</script>
        <script type="application/ld+json">{JSON.stringify(priceRangeSchema)}</script>
      </Helmet>

      <section className="section-padding bg-muted/30 border-t border-border">
        <div className="container-narrow">
          <h2 className="heading-md text-foreground mb-6 text-center">Dumpster Rental Pricing FAQ</h2>
          <div className="space-y-3">
            {CALCULATOR_FAQS.map((faq, i) => (
              <details key={i} className="bg-card border border-border rounded-xl overflow-hidden group">
                <summary className="p-5 cursor-pointer font-semibold text-foreground hover:bg-muted/30 transition-colors list-none flex items-center justify-between text-sm">
                  {faq.question}
                  <svg className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

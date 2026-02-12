import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { ArrowRight, Phone, Calendar, Clock, User } from 'lucide-react';
import NotFound from './NotFound';

interface BlogArticleData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  date: string;
  readTime: string;
  category: string;
  sections: { heading: string; body: string }[];
  faqs: { question: string; answer: string }[];
  relatedArticles: string[];
}

const ARTICLES: Record<string, BlogArticleData> = {
  'dumpster-cost-oakland': {
    slug: 'dumpster-cost-oakland',
    title: 'How Much Does a Dumpster Cost in Oakland?',
    metaTitle: 'How Much Does a Dumpster Cost in Oakland CA? [2026 Pricing]',
    metaDescription: 'Oakland dumpster rental costs from $390 for a 6-yard to $1,135 for a 50-yard. Real local pricing, no broker markups. Flat-fee concrete. Get your exact price.',
    h1: 'How Much Does a Dumpster Cost in Oakland?',
    date: 'February 10, 2026',
    readTime: '6 min read',
    category: 'Pricing',
    sections: [
      { heading: 'Oakland Dumpster Rental Pricing Overview', body: `Dumpster rental in Oakland starts at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard container and goes up to $${DUMPSTER_SIZES_DATA[DUMPSTER_SIZES_DATA.length - 1].priceFrom} for a ${DUMPSTER_SIZES_DATA[DUMPSTER_SIZES_DATA.length - 1].yards}-yard container. These prices include delivery, pickup, and a ${PRICING_POLICIES.standardRentalDays}-day rental period. Because we operate from our own yard at 1000 46th Ave in Oakland, there's no broker markup—you're getting direct-from-operator pricing.` },
      { heading: 'Price by Size', body: DUMPSTER_SIZES_DATA.map(s => `• ${s.yards} Yard: From $${s.priceFrom} — ${s.loads}, ${s.includedTons}T included`).join('\n') },
      { heading: 'Heavy Material Pricing (Concrete, Dirt, Rock)', body: 'Heavy material dumpsters (6, 8, and 10 yard) use FLAT FEE pricing. This means disposal is included with no weight overage charges, regardless of how heavy the load is. This is a significant advantage for concrete removal, foundation demolition, and driveway replacement projects in Oakland.' },
      { heading: 'General Debris Overage', body: `For general debris (construction waste, renovation materials, cleanout items), each size includes a base tonnage allowance. Any weight beyond the included amount is billed at $${PRICING_POLICIES.overagePerTonGeneral} per ton based on the disposal facility's scale ticket. This transparent approach means you only pay for what you actually dispose of.` },
      { heading: 'Why Oakland Pricing Is Competitive', body: 'Because our yard is physically located in Oakland, delivery distances are short. Short haul distances mean lower fuel costs, faster turnaround, and more competitive pricing. National brokers often subcontract to operators far from your address, adding markup and uncertainty.' },
      { heading: 'How to Get the Best Price', body: `1. Choose the right size — oversizing costs more, undersizing requires a second haul.\n2. Separate heavy materials — concrete in its own flat-fee dumpster saves money.\n3. Order in advance — same-day delivery has a $${PRICING_POLICIES.sameDayDelivery} premium.\n4. Ask about volume discounts if you need multiple dumpsters.` },
    ],
    faqs: [
      { question: 'What is the cheapest dumpster in Oakland?', answer: `The most affordable option is a 6-yard dumpster starting at $${DUMPSTER_SIZES_DATA[0].priceFrom}. This holds 2-3 pickup loads and is perfect for small cleanouts and concrete removal.` },
      { question: 'Are there hidden fees?', answer: `No. Our quoted price includes delivery, pickup, and your weight allowance. The only additional charge is $${PRICING_POLICIES.overagePerTonGeneral}/ton overage if your general debris load exceeds included tonnage. Heavy materials are flat-fee with no overage.` },
      { question: 'Is there a deposit required?', answer: 'No deposit is required for most residential rentals. Commercial accounts may have credit terms available.' },
    ],
    relatedArticles: ['concrete-disposal-bay-area', 'dumpster-sizes-guide', 'same-day-dumpster-delivery-bay-area'],
  },
  'concrete-disposal-bay-area': {
    slug: 'concrete-disposal-bay-area',
    title: 'Concrete Disposal in the Bay Area — What You Need to Know',
    metaTitle: 'Concrete Disposal Bay Area | Flat-Fee Dumpsters | Recycling Guide',
    metaDescription: 'Complete guide to concrete disposal in the Bay Area. Flat-fee dumpster pricing, recycling facilities, weight rules. Oakland, San Jose, SF. No weight overage.',
    h1: 'Concrete Disposal in the Bay Area',
    date: 'February 5, 2026',
    readTime: '5 min read',
    category: 'Materials',
    sections: [
      { heading: 'Why Concrete Disposal Is Different', body: 'Concrete is one of the heaviest materials you can put in a dumpster. A single cubic yard of concrete weighs about 4,000 lbs (2 tons). This means even a small 6-yard dumpster of concrete can weigh 5-10 tons. That\'s why we offer flat-fee pricing for concrete—no surprises on weight overage.' },
      { heading: 'Flat-Fee Concrete Dumpster Pricing', body: `Our heavy material dumpsters (6, 8, and 10 yard) are available for pure concrete loads at flat-fee pricing. Starting at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a 6-yard. Disposal is included regardless of weight. This is significantly cheaper than per-ton pricing for heavy loads.` },
      { heading: 'Rules for Concrete Dumpsters', body: '• Only clean concrete, brick, block, and masonry\n• No mixing with general debris, wood, or trash\n• Rebar must be cut below the fill line\n• Dirt and soil go in a separate heavy material container\n• Mixed loads are reclassified as general debris with overage charges' },
      { heading: 'Where Does Concrete Go?', body: 'Clean concrete from our dumpsters is routed to certified recycling facilities in the Bay Area. Facilities like Argent Materials in Oakland crush and process concrete into recycled aggregate for road base and new construction. This is better for the environment and keeps disposal costs low.' },
      { heading: 'Bay Area Concrete Recycling Facilities', body: '• Oakland: Argent Materials, Baldwin St\n• San Jose: Zanker Recycling\n• San Francisco: Recology SF\n• Hayward: Davis Street Transfer Station\n\nWe handle routing—you just fill the dumpster with clean concrete.' },
    ],
    faqs: [
      { question: 'How much concrete can I put in a 6-yard dumpster?', answer: 'A 6-yard dumpster can hold approximately 6 cubic yards of concrete, but weight is the limiting factor. Do not overfill above the walls. With flat-fee pricing, weight doesn\'t affect your cost.' },
      { question: 'Can I mix concrete and dirt?', answer: 'No. Concrete and dirt should go in separate heavy material dumpsters. Both qualify for flat-fee pricing, but they must be clean, unmixed loads.' },
      { question: 'What if I have concrete with rebar?', answer: 'Rebar must be cut so it doesn\'t extend above the fill line. Concrete with protruding rebar cannot be safely transported.' },
    ],
    relatedArticles: ['dumpster-cost-oakland', 'heavy-material-dumpsters-explained', 'dumpster-sizes-guide'],
  },
  'dumpster-permit-san-jose': {
    slug: 'dumpster-permit-san-jose',
    title: 'Dumpster Permit Rules in San Jose — Complete Guide',
    metaTitle: 'Dumpster Permit San Jose CA | Requirements & How to Apply [2026]',
    metaDescription: 'Do you need a permit for a dumpster in San Jose? Complete guide to permit requirements, fees, and application process. Private property vs. street placement.',
    h1: 'Dumpster Permit Rules in San Jose',
    date: 'January 28, 2026',
    readTime: '4 min read',
    category: 'Permits',
    sections: [
      { heading: 'Do You Need a Permit?', body: 'In San Jose, whether you need a permit depends on WHERE the dumpster is placed:\n\n• Private property (driveway, yard): NO permit needed\n• Public street or right-of-way: YES, you need an encroachment permit from San Jose DOT\n\nMost residential customers place dumpsters on their driveway and do not need a permit.' },
      { heading: 'How to Get a San Jose Dumpster Permit', body: '1. Apply online through the San Jose DOT portal\n2. Specify the location, duration, and dumpster size\n3. Allow 5-7 business days for processing\n4. Permit fees vary by location and duration\n5. The permit must be displayed on or near the dumpster' },
      { heading: 'Permit Costs', body: 'San Jose encroachment permit fees typically range from $50-$200 depending on location and duration. Fees are paid to the City of San Jose, not to us. Contact San Jose DOT for current fee schedules.' },
      { heading: 'Tips for San Jose Dumpster Placement', body: '• Place on your driveway when possible to avoid permit costs\n• Use plywood under the dumpster to protect your driveway surface\n• Keep the area around the dumpster clear of debris\n• Don\'t block sidewalks, fire hydrants, or mailboxes\n• In HOA communities, check with your HOA before delivery' },
      { heading: 'We Can Help', body: 'Our team is familiar with San Jose permit requirements and can guide you through the process. While we don\'t apply for permits on your behalf, we can point you in the right direction and recommend the best placement options for your property.' },
    ],
    faqs: [
      { question: 'Can I put a dumpster in my San Jose driveway without a permit?', answer: 'Yes. Dumpsters on private property (your driveway or yard) do not require a permit in San Jose.' },
      { question: 'How long does a San Jose dumpster permit take?', answer: 'San Jose DOT typically processes encroachment permits in 5-7 business days. Plan ahead if you need street placement.' },
      { question: 'What happens if I don\'t get a permit?', answer: 'Placing a dumpster on a public street without a permit can result in fines from the City of San Jose. Always get the proper permit for street placement.' },
    ],
    relatedArticles: ['dumpster-cost-oakland', 'dumpster-sizes-guide', 'same-day-dumpster-delivery-bay-area'],
  },
  'heavy-material-dumpsters-explained': {
    slug: 'heavy-material-dumpsters-explained',
    title: 'Heavy Material Dumpsters Explained — Flat-Fee Pricing',
    metaTitle: 'Heavy Material Dumpsters Explained | Flat-Fee Concrete & Dirt Disposal',
    metaDescription: 'Everything about heavy material dumpsters: flat-fee pricing, what qualifies, sizes available (6-10 yard), and rules. Concrete, dirt, rock, brick disposal guide.',
    h1: 'Heavy Material Dumpsters Explained',
    date: 'January 20, 2026',
    readTime: '5 min read',
    category: 'Materials',
    sections: [
      { heading: 'What Are Heavy Material Dumpsters?', body: 'Heavy material dumpsters are specifically designed for dense, heavy loads like concrete, dirt, rock, brick, and asphalt. They come in smaller sizes (6, 8, and 10 yard) because heavy materials reach weight limits quickly. The key advantage: FLAT FEE pricing with no weight overage charges.' },
      { heading: 'Flat-Fee vs. Per-Ton Pricing', body: `Standard general debris dumpsters include base tonnage and charge $${PRICING_POLICIES.overagePerTonGeneral}/ton for overage. Heavy material dumpsters eliminate this uncertainty—disposal is included in the flat fee regardless of weight. For a 6-yard dumpster of concrete that might weigh 8+ tons, flat-fee pricing can save hundreds of dollars compared to per-ton billing.` },
      { heading: 'What Qualifies as Heavy Material?', body: '✅ Accepted:\n• Concrete (with or without rebar cut below fill line)\n• Clean fill dirt and topsoil\n• Rock and gravel\n• Brick and block\n• Asphalt\n\n❌ NOT accepted in heavy material dumpsters:\n• Mixed loads (concrete + wood + trash)\n• Contaminated soil\n• General construction debris\n• Yard waste or green waste' },
      { heading: 'Available Sizes', body: DUMPSTER_SIZES_DATA.filter(s => s.category === 'both' || s.category === 'heavy').map(s => `• ${s.yards} Yard (${s.dimensions}): From $${s.priceFrom} — ${s.loads}`).join('\n') },
      { heading: 'The Mixed Load Warning', body: 'If trash, wood, or general debris is found in a heavy material dumpster, the entire load may be reclassified as general debris. This means standard per-ton overage charges apply instead of flat-fee pricing. Always keep heavy materials separate from other waste.' },
    ],
    faqs: [
      { question: 'Why are heavy material dumpsters smaller?', answer: 'Heavy materials like concrete weigh 4,000+ lbs per cubic yard. A 10-yard dumpster of concrete can weigh 20 tons. Smaller sizes keep total weight manageable for safe transport.' },
      { question: 'Can I get a 20-yard dumpster for concrete?', answer: 'No. Heavy material dumpsters are available in 6, 8, and 10 yard sizes only. For larger concrete projects, order multiple smaller containers.' },
      { question: 'What happens if I mix materials?', answer: `Mixed loads are reclassified as general debris with $${PRICING_POLICIES.overagePerTonGeneral}/ton overage charges. Keep heavy materials separate for flat-fee pricing.` },
    ],
    relatedArticles: ['concrete-disposal-bay-area', 'dumpster-cost-oakland', 'dumpster-sizes-guide'],
  },
  'dumpster-sizes-guide': {
    slug: 'dumpster-sizes-guide',
    title: 'Dumpster Sizes Guide — Which Size Do You Need?',
    metaTitle: 'Dumpster Sizes Guide | 6 to 50 Yard | Which Size Do I Need?',
    metaDescription: 'Complete dumpster size guide: 6, 8, 10, 20, 30, 40, 50 yard dimensions, capacity, pricing. Find the right size for your project. Bay Area delivery.',
    h1: 'Which Dumpster Size Do You Need?',
    date: 'January 15, 2026',
    readTime: '7 min read',
    category: 'Sizing',
    sections: [
      { heading: 'Quick Size Guide', body: '• Small cleanout or concrete removal → 6-8 yard\n• Bathroom/kitchen remodel → 10-20 yard\n• Full room renovation → 20 yard\n• Whole house renovation or roofing → 30 yard\n• Commercial project or demolition → 40 yard\n• Warehouse cleanout → 50 yard' },
      { heading: 'All Sizes Compared', body: DUMPSTER_SIZES_DATA.map(s => `${s.yards} YARD (${s.dimensions})\n  From $${s.priceFrom} | ${s.loads} | ${s.includedTons}T included\n  Best for: ${s.useCases.join(', ')}`).join('\n\n') },
      { heading: 'Heavy Material Sizes', body: 'For concrete, dirt, rock, and brick, only 6, 8, and 10 yard sizes are available. These are priced as flat-fee with disposal included. Heavy materials are too dense for larger containers.' },
      { heading: 'Most Popular Size', body: 'The 20-yard dumpster is our most popular size overall. It handles full room renovations, roofing projects, and large cleanouts. At 18 feet long and 4 feet tall, it fits most driveways and holds 6-8 pickup truck loads.' },
      { heading: 'Sizing Tips', body: '1. When in doubt, size up — a second haul costs more than a larger dumpster\n2. Separate heavy materials into their own container for flat-fee pricing\n3. Don\'t overfill above the walls — it\'s unsafe and may incur fees\n4. Use our online calculator for a personalized recommendation' },
    ],
    faqs: [
      { question: 'What\'s the most common dumpster size?', answer: 'The 20-yard dumpster is the most popular for residential projects. For concrete and heavy materials, the 8-yard is most popular.' },
      { question: 'Can I exchange for a different size?', answer: 'Yes, but it\'s most cost-effective to choose the right size upfront. If you need to swap, contact us and we\'ll coordinate an exchange.' },
      { question: 'How do I know if a dumpster will fit in my driveway?', answer: 'Measure your driveway length. A 10-yard is 12 feet long, a 20-yard is 18 feet, a 30/40-yard is 18-24 feet. All are 7.5 feet wide.' },
    ],
    relatedArticles: ['dumpster-cost-oakland', 'heavy-material-dumpsters-explained', 'same-day-dumpster-delivery-bay-area'],
  },
  'same-day-dumpster-delivery-bay-area': {
    slug: 'same-day-dumpster-delivery-bay-area',
    title: 'Same-Day Dumpster Delivery in the Bay Area — How It Works',
    metaTitle: 'Same-Day Dumpster Delivery Bay Area | Oakland & San Jose Yards',
    metaDescription: 'Get same-day dumpster delivery in the Bay Area. Order before noon for same-day service. Two local yards in Oakland & San Jose. Call (510) 680-2150.',
    h1: 'Same-Day Dumpster Delivery in the Bay Area',
    date: 'January 8, 2026',
    readTime: '4 min read',
    category: 'Service',
    sections: [
      { heading: 'How Same-Day Delivery Works', body: `Same-day delivery is available when you order before noon for most Bay Area addresses. Our two operational yards in Oakland (1000 46th Ave) and San Jose (2071 Ringwood Ave) position us for rapid response across the entire Bay Area. Same-day delivery carries a $${PRICING_POLICIES.sameDayDelivery} premium.` },
      { heading: 'Coverage Areas', body: 'From Oakland Yard: Oakland, Berkeley, Alameda, San Leandro, Hayward, Richmond, Concord, Walnut Creek, and all East Bay cities.\n\nFrom San Jose Yard: San Jose, Santa Clara, Sunnyvale, Mountain View, Palo Alto, Cupertino, Milpitas, Fremont, and all South Bay cities.' },
      { heading: 'Why Local Yards Matter', body: 'National dumpster rental companies operate call centers, not yards. When you call a broker, they search for a subcontractor with availability—which can take days. Our drivers start their routes from our own yards every morning, so we know exactly what\'s available and can commit to delivery windows.' },
      { heading: 'Delivery Windows', body: 'We offer three delivery windows:\n• Morning: 7:00 AM – 11:00 AM\n• Midday: 11:00 AM – 3:00 PM\n• Afternoon: 3:00 PM – 6:00 PM\n\nThese are estimated windows. We\'ll call before arrival.' },
      { heading: 'How to Qualify for Same-Day', body: '1. Order before noon (call or online)\n2. Have a clear delivery location ready\n3. Confirm the dumpster size and material type\n4. Ensure access for our roll-off truck (minimum 12-foot wide, no low-hanging obstacles)\n5. For urgent needs, call directly: (510) 680-2150' },
    ],
    faqs: [
      { question: 'Is same-day delivery guaranteed?', answer: 'Same-day delivery is subject to availability. Orders placed before noon are typically delivered the same day. We\'ll confirm timing when you order.' },
      { question: 'Is there an extra charge for same-day?', answer: `Yes, same-day delivery carries a $${PRICING_POLICIES.sameDayDelivery} premium over standard next-day delivery.` },
      { question: 'What if I need a dumpster this afternoon?', answer: `Call us directly at ${BUSINESS_INFO.phone.salesFormatted}. If a truck and dumpster are available, we'll make it happen.` },
    ],
    relatedArticles: ['dumpster-cost-oakland', 'dumpster-sizes-guide', 'dumpster-permit-san-jose'],
  },
};

const ALL_ARTICLE_SLUGS = Object.keys(ARTICLES);

export default function BlogArticle() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const article = articleSlug ? ARTICLES[articleSlug] : undefined;

  if (!article) return <NotFound />;

  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: article.title, url: `/blog/${article.slug}` },
  ]);
  const faqSchema = generateFAQSchema(article.faqs);

  const relatedArticles = article.relatedArticles
    .map(slug => ARTICLES[slug])
    .filter(Boolean);

  return (
    <Layout title={article.metaTitle} description={article.metaDescription}>
      <Helmet>
        <link rel="canonical" href={`${BUSINESS_INFO.url}/blog/${article.slug}`} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.h1,
          description: article.metaDescription,
          datePublished: new Date(article.date).toISOString(),
          author: { '@type': 'Organization', name: BUSINESS_INFO.name },
          publisher: { '@type': 'Organization', name: BUSINESS_INFO.name, url: BUSINESS_INFO.url },
        })}</script>
      </Helmet>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-narrow">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-3">
            <Link to="/" className="hover:text-primary-foreground">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-primary-foreground">Blog</Link>
            <span>/</span>
            <span className="text-primary-foreground">{article.category}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4">{article.h1}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/70">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{article.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{article.readTime}</span>
            <span className="flex items-center gap-1"><User className="w-4 h-4" />{BUSINESS_INFO.name}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="section-padding bg-background">
        <div className="container-narrow">
          <div className="prose prose-lg max-w-none">
            {article.sections.map((section, i) => (
              <div key={i} className="mb-10">
                <h2 className="text-xl font-bold text-foreground mb-3">{section.heading}</h2>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed">{section.body}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center my-10">
            <h3 className="text-xl font-bold text-foreground mb-3">Get Your Exact Price</h3>
            <p className="text-muted-foreground mb-4">Enter your ZIP code for instant pricing—no phone call required.</p>
            <Button asChild variant="cta" size="lg">
              <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>

          {/* FAQs */}
          {article.faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {article.faqs.map((faq, i) => (
                  <details key={i} className="bg-card border border-border rounded-xl overflow-hidden group">
                    <summary className="p-4 cursor-pointer font-semibold text-foreground hover:bg-muted/30 transition-colors list-none flex items-center justify-between text-sm">
                      {faq.question}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" />
                    </summary>
                    <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.answer}</div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-6">Related Articles</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {relatedArticles.map(a => (
                  <Link key={a.slug} to={`/blog/${a.slug}`}
                    className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all group">
                    <span className="text-xs text-primary font-medium">{a.category}</span>
                    <h3 className="font-semibold text-foreground text-sm mt-1 group-hover:text-primary transition-colors">{a.title}</h3>
                    <span className="text-xs text-muted-foreground mt-2 block">{a.readTime}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Internal Links */}
      <section className="py-8 bg-muted/30 border-t border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/quote" className="text-primary hover:underline">Get Quote</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/sizes" className="text-primary hover:underline">All Sizes</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/concrete-dumpster-rental" className="text-primary hover:underline">Concrete Dumpsters</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/dumpster-rental/oakland-ca" className="text-primary hover:underline">Oakland</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/dumpster-rental/san-jose-ca" className="text-primary hover:underline">San Jose</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/blog" className="text-primary hover:underline">All Articles</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

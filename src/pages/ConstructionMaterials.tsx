import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Phone, Truck, MapPin, CheckCircle, Recycle, Mountain } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seo';
import drainVirgin from '@/assets/supply/drain-rock-virgin.jpg';
import drainRecycled from '@/assets/supply/drain-rock-recycled.jpg';
import baseVirgin from '@/assets/supply/baserock-virgin.jpg';
import baseRecycled from '@/assets/supply/baserock-recycled.jpg';

const img = (n: string) => `/images/supply/${n}.webp`;
const phone = BUSINESS_INFO.phone.sales;
const tel = `tel:${phone.replace(/[^\d+]/g, '')}`;

const FEATURED = [
  {
    name: 'Virgin Drain Rock',
    image: drainVirgin,
    tag: 'Virgin',
    description: 'Clean, washed, quarried crushed rock with no fines. Consistent size and color for maximum water flow.',
    uses: ['French drains and perimeter drains', 'Retaining wall backfill', 'Under slabs and pavers', 'Septic and leach fields'],
  },
  {
    name: 'Recycled Drain Rock',
    image: drainRecycled,
    tag: 'Recycled',
    description: 'Crushed and screened recycled concrete. A cost-effective, sustainable option with excellent drainage.',
    uses: ['Site and yard drainage', 'Trench backfill', 'Temporary access areas', 'Green building projects'],
  },
  {
    name: 'Virgin Baserock (Class 2)',
    image: baseVirgin,
    tag: 'Virgin',
    description: 'Quarried aggregate blended with fines that compacts into a firm, stable base.',
    uses: ['Driveway and road base', 'Foundation and slab sub-base', 'Paver and patio base', 'Parking areas'],
  },
  {
    name: 'Recycled Baserock (Class 2)',
    image: baseRecycled,
    tag: 'Recycled',
    description: 'Crushed recycled concrete and asphalt that compacts well. Strong support at a lower cost.',
    uses: ['Driveways and walkways', 'Jobsite access roads', 'Utility trench backfill', 'Leveling and grading'],
  },
];

const CATEGORIES = [
  {
    title: 'Bark & Wood Chips',
    intro: 'Decorative ground cover in black, brown, red and natural tones. Holds moisture, controls weeds and finishes a landscape.',
    uses: 'Flower beds, tree rings, walkways, commercial landscaping and slopes.',
    photos: ['p1_1', 'p1_4', 'p2_1', 'p3_2', 'p4_1', 'p4_3', 'p5_2', 'p3_3'],
    items: [
      'Black walk on bark', 'Black small bark', 'Black mini bark', 'Black premium wood chips', 'Mini black premium wood chips',
      'Black eco mulch', 'Black gorilla hair', 'Brown eco mulch', 'Brown wood chips', 'Mini brown wood chips',
      'Brown colored mill chips', 'Mahogany wood chips', 'Red wood chips', 'Red colored mill chips', 'Redwood chips',
      'Shredded cedar bark', 'Shredded redwood bark', 'Walk on bark', 'Small fir bark', 'Medium fir bark', 'Mini fir bark',
      'West valley mids',
    ],
  },
  {
    title: 'Playground & Sport Surfaces',
    intro: 'Soft, uniform wood fiber made for impact areas and paths.',
    uses: 'Playgrounds, schools, parks, trails and equestrian areas.',
    photos: ['p5_3', 'p7_4'],
    items: ['Playground fiber', 'Fit fines'],
  },
  {
    title: 'Soil, Compost & Planter Mixes',
    intro: 'Nutrient-rich blends for planting, lawns and garden beds.',
    uses: 'Raised beds, new lawns, tree planting, grading and landscape installs.',
    photos: ['p6_1', 'p6_2', 'p6_4', 'p7_1'],
    items: ['Topsoil blend', 'Pro planter mix', 'Home harvest organic planter mix', 'Landscapers compost blend', 'Organic compost'],
  },
  {
    title: 'Sawdust & Fines',
    intro: 'Fine materials for soil amendment, stalls and specialty landscape use.',
    uses: 'Soil conditioning, animal bedding, pathways and top dressing.',
    photos: ['p7_2', 'p7_3'],
    items: ['Nitrified sawdust', 'Redwood sawdust', 'Clean white fines'],
  },
  {
    title: 'Mulch',
    intro: 'Natural mulches that protect soil, retain water and reduce weeds.',
    uses: 'Orchards, large landscapes, erosion control and water-wise gardens.',
    photos: ['p8_1', 'p8_2', 'p8_3'],
    items: ['Almond mulch (screened)', 'Almond mulch (non-screened)', 'Arbor mulch'],
  },
];

export default function ConstructionMaterials() {
  return (
    <Layout
      title="Construction & Landscape Materials Delivery | SF Bay Area"
      description="Drain rock, baserock (virgin and recycled), bark, soil, compost and mulch delivered across Oakland, San Jose, San Francisco and the Bay Area."
    >
      {/* Intro */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-14 md:py-20 max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">Materials Delivery</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold leading-tight">
            Construction & Landscape Materials, Delivered to Your Site
          </h1>
          <p className="mt-4 text-lg opacity-90 max-w-3xl">
            Drain rock, baserock, bark, soil and mulch delivered throughout the SF Bay Area, including Oakland, San Jose,
            San Francisco and surrounding cities. Delivery only.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <a href={tel}><Phone className="w-4 h-4 mr-2" />Call {phone}</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact">Request Materials</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm opacity-90">
            <span className="flex items-center gap-2"><Truck className="w-4 h-4" />Delivery only, no pickup</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />SF Bay Area</span>
            <span className="flex items-center gap-2"><Recycle className="w-4 h-4" />Virgin and recycled options</span>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-14 max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
            <Mountain className="w-4 h-4" />Our Main Materials
          </p>
          <h2 className="mt-2 text-2xl md:text-4xl font-bold text-foreground">Drain Rock & Baserock</h2>
          <p className="mt-3 text-muted-foreground">
            Our core products, available in virgin (quarried) and recycled versions. Choose virgin for a clean, consistent
            finish, or recycled for a lower-cost, sustainable alternative.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {FEATURED.map((m) => (
            <article key={m.name} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="relative">
                <img src={m.image} alt={m.name} width={1024} height={768} loading="lazy" className="w-full aspect-[4/3] object-cover" />
                <span className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
                  {m.tag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground">{m.name}</h3>
                <p className="mt-2 text-muted-foreground">{m.description}</p>
                <p className="mt-4 text-sm font-semibold text-foreground">Common uses</p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {m.uses.map((u) => (
                    <li key={u} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />{u}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <section className="bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 py-14 max-w-6xl">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground">Landscape Materials</h2>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            Beyond rock and base, we deliver a full range of bark, wood chips, soils and mulch for finishing any project.
          </p>
          <div className="mt-10 space-y-12">
            {CATEGORIES.map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-card p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">{c.title}</h3>
                <p className="mt-2 text-muted-foreground">{c.intro}</p>
                <p className="mt-1 text-sm text-foreground"><span className="font-semibold">Used for:</span> {c.uses}</p>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {c.photos.map((p) => (
                    <img key={p} src={img(p)} alt={`${c.title} sample`} width={300} height={300} loading="lazy"
                      className="w-full aspect-square object-cover rounded-xl" />
                  ))}
                </div>
                <p className="mt-5 text-sm font-semibold text-foreground">Available products</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {c.items.map((i) => (
                    <li key={i} className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery */}
      <section className="container mx-auto px-4 py-14 max-w-4xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Delivery Across the Bay Area</h2>
        <p className="mt-3 text-muted-foreground">
          We deliver to Oakland, San Jose, San Francisco, Berkeley, Fremont, Hayward, Santa Clara and surrounding cities.
          Tell us the material, quantity and address and we will confirm availability and delivery.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><a href={tel}><Phone className="w-4 h-4 mr-2" />Call {phone}</a></Button>
          <Button asChild size="lg" variant="outline"><Link to="/contact">Request Materials</Link></Button>
        </div>
      </section>
    </Layout>
  );
}

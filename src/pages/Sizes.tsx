import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, Ruler, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TRASHLAB_URL = 'https://app.trashlab.com';

const sizes = [
  {
    yards: 8,
    dimensions: "12' L x 6' W x 3' H",
    price: 350,
    perfectFor: ['Small garage cleanouts', 'Bathroom remodels', 'Small landscaping projects', 'Attic or basement cleaning'],
    loads: '2-3 pickup truck loads',
    weight: '1 ton included',
  },
  {
    yards: 10,
    dimensions: "14' L x 7' W x 3.5' H",
    price: 395,
    perfectFor: ['Garage cleanouts', 'Small kitchen remodels', 'Deck removal', 'Moving cleanouts'],
    loads: '3-4 pickup truck loads',
    weight: '2 tons included',
  },
  {
    yards: 15,
    dimensions: "16' L x 7.5' W x 4' H",
    price: 445,
    perfectFor: ['Kitchen remodels', 'Flooring projects', 'Medium landscaping', 'Estate cleanouts'],
    loads: '5-6 pickup truck loads',
    weight: '2 tons included',
  },
  {
    yards: 20,
    dimensions: "22' L x 7.5' W x 4.5' H",
    price: 495,
    perfectFor: ['Full room renovations', 'Roofing projects', 'Large cleanouts', 'Construction debris'],
    loads: '6-8 pickup truck loads',
    weight: '3 tons included',
    popular: true,
  },
  {
    yards: 30,
    dimensions: "22' L x 7.5' W x 6' H",
    price: 595,
    perfectFor: ['Major renovations', 'New construction', 'Commercial cleanouts', 'Large-scale demolition'],
    loads: '9-12 pickup truck loads',
    weight: '4 tons included',
  },
  {
    yards: 40,
    dimensions: "22' L x 7.5' W x 8' H",
    price: 695,
    perfectFor: ['Large construction sites', 'Commercial projects', 'Industrial waste', 'Major demolition'],
    loads: '12-16 pickup truck loads',
    weight: '5 tons included',
  },
];

export default function Sizes() {
  const { t } = useLanguage();

  return (
    <Layout
      title="Dumpster Sizes Guide | 8 to 40 Yard Dumpsters"
      description="Compare dumpster sizes from 8 to 40 yards. Find the perfect size for your project. Dimensions, capacity, and pricing for each size."
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">{t('sizes.title')}</h1>
            <p className="text-xl text-primary-foreground/85">
              {t('sizes.subtitle')}. From small cleanouts to major construction, we have the right size.
            </p>
          </div>
        </div>
      </section>

      {/* Size Guide */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="space-y-8">
            {sizes.map((size) => (
              <div
                key={size.yards}
                id={`${size.yards}-yard`}
                className={`bg-card rounded-2xl border p-6 md:p-8 ${
                  size.popular ? 'border-accent shadow-card-hover' : 'border-border'
                }`}
              >
                {size.popular && (
                  <div className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full mb-4">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left - Size Info */}
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary">
                        <Package className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-extrabold text-foreground">{size.yards} Yard</h2>
                        <p className="text-muted-foreground">{size.loads}</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{t('sizes.dimensions')}</span>
                        <span className="font-medium text-foreground">{size.dimensions}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="font-medium text-foreground">{size.weight}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle - Perfect For */}
                  <div>
                    <h3 className="font-bold text-foreground mb-3">{t('sizes.perfectFor')}</h3>
                    <ul className="space-y-2">
                      {size.perfectFor.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right - Price & CTA */}
                  <div className="flex flex-col justify-between">
                    <div className="mb-4">
                      <span className="text-sm text-muted-foreground">Starting at</span>
                      <div className="text-4xl font-extrabold text-foreground">${size.price}</div>
                      <span className="text-sm text-muted-foreground">7-day rental included</span>
                    </div>
                    <div className="space-y-2">
                      <Button asChild variant={size.popular ? 'cta' : 'default'} className="w-full">
                        <a href={TRASHLAB_URL} target="_blank" rel="noopener noreferrer">
                          {t('sizes.choose')}
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/#quote">Get Quote</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Choosing */}
      <section className="section-padding bg-muted">
        <div className="container-narrow text-center">
          <h2 className="heading-lg text-foreground mb-4">Not Sure Which Size?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our team can help you choose the right dumpster for your project. Call us for a free consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" size="lg">
              <a href="tel:+15106802150">
                Call (510) 680-2150
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/materials">
                View Allowed Materials
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

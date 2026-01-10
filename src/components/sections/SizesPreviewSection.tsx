import { Link } from 'react-router-dom';
import { ArrowRight, Ruler, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const sizes = [
  { yards: 8, price: 350, perfectFor: 'Small cleanouts, bathroom remodels', loads: '2-3 pickup loads' },
  { yards: 10, price: 395, perfectFor: 'Garage cleanouts, small renovations', loads: '3-4 pickup loads' },
  { yards: 15, price: 445, perfectFor: 'Kitchen remodels, flooring projects', loads: '5-6 pickup loads' },
  { yards: 20, price: 495, perfectFor: 'Full room renovations, roofing', loads: '6-8 pickup loads' },
  { yards: 30, price: 595, perfectFor: 'Major renovations, construction', loads: '9-12 pickup loads' },
  { yards: 40, price: 695, perfectFor: 'Large construction, commercial', loads: '12-16 pickup loads' },
];

export function SizesPreviewSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-muted">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <h2 className="heading-lg text-foreground mb-4">{t('sizes.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t('sizes.subtitle')}
            </p>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link to="/sizes">
              {t('sizes.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sizes.map((size) => (
            <div
              key={size.yards}
              className="group bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Package className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">{t('sizes.from')}</div>
                  <div className="text-2xl font-bold text-foreground">${size.price}</div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-2">
                {size.yards} {t('sizes.yards')}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Ruler className="w-4 h-4" />
                <span>{size.loads}</span>
              </div>

              <p className="text-muted-foreground mb-4">{size.perfectFor}</p>

              <Button asChild variant="outline" size="default" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                <Link to={`/sizes#${size.yards}-yard`}>
                  {t('sizes.choose')}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

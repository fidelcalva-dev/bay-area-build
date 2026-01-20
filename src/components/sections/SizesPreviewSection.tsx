// Sizes Preview Section - Shows dumpster sizes with consistent data
// Uses master data from shared-data.ts

import { Link } from 'react-router-dom';
import { ArrowRight, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { DUMPSTER_SIZES_DATA, CTA_LINKS, getOverageInfo } from '@/lib/shared-data';
import { DumpsterSizeCard } from '@/components/shared/DumpsterSizeCard';

// Show the most popular sizes for preview (general debris only)
const PREVIEW_SIZES = DUMPSTER_SIZES_DATA.filter(s => 
  [10, 20, 30, 40].includes(s.yards) && (s.category === 'general' || s.category === 'both')
);

export function SizesPreviewSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-muted">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 className="heading-lg text-foreground mb-3">{t('sizes.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              From small cleanouts to major construction projects.
            </p>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link to="/sizes">
              View All Sizes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PREVIEW_SIZES.map((size) => (
            <DumpsterSizeCard
              key={size.yards}
              size={size}
              variant="preview"
              category="general"
              ctaLink="/sizes"
              ctaLabel={`Choose ${size.yards} Yard`}
            />
          ))}
        </div>

        {/* Heavy Materials Callout */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Weight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-semibold text-foreground">Need a dumpster for concrete, dirt, or rock?</span>
              <span className="text-muted-foreground ml-2">
                We offer dedicated 6, 8, and 10 yard heavy material dumpsters with flat fee pricing—disposal included.
              </span>
              <Link to="/sizes" className="text-primary font-medium ml-2 hover:underline">
                View heavy material sizes →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

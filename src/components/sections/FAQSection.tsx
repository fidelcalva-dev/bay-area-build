// FAQ Section - Uses master FAQ data
// Single source of truth from shared-data.ts

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';
import { MASTER_FAQS, BUSINESS_INFO } from '@/lib/shared-data';

interface FAQSectionProps {
  /** Limit number of FAQs shown (default: all) */
  limit?: number;
  /** Filter by category */
  category?: 'general' | 'pricing' | 'materials' | 'scheduling';
  /** Show compact version */
  compact?: boolean;
}

export function FAQSection({ limit, category, compact = false }: FAQSectionProps) {
  const { t, language } = useLanguage();

  let faqs = MASTER_FAQS;
  
  if (category) {
    faqs = faqs.filter(faq => faq.category === category);
  }
  
  if (limit) {
    faqs = faqs.slice(0, limit);
  }

  return (
    <section className={compact ? 'py-8' : 'section-padding bg-background'}>
      <div className={compact ? 'container-wide' : 'container-narrow'}>
        {!compact && (
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">{t('faq.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('faq.subtitle')}
            </p>
          </div>
        )}

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left text-foreground font-semibold hover:no-underline py-5">
                {language === 'es' ? faq.questionEs : faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {language === 'es' ? faq.answerEs : faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {!compact && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">{t('faq.moreQuestions')}</p>
            <a
              href={`tel:${BUSINESS_INFO.phone.sales}`}
              className="text-lg font-semibold text-primary hover:underline"
            >
              {t('faq.callUs')} {BUSINESS_INFO.phone.salesFormatted}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

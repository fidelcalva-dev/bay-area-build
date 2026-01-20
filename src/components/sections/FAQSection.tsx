// FAQ Section - System-style with minimal design
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';
import { MASTER_FAQS, BUSINESS_INFO } from '@/lib/shared-data';
import { MessageCircle } from 'lucide-react';

interface FAQSectionProps {
  limit?: number;
  category?: 'general' | 'pricing' | 'materials' | 'scheduling';
  compact?: boolean;
}

export function FAQSection({ limit = 6, category, compact = false }: FAQSectionProps) {
  const { language } = useLanguage();

  let faqs = MASTER_FAQS;
  
  if (category) {
    faqs = faqs.filter(faq => faq.category === category);
  }
  
  faqs = faqs.slice(0, limit);

  return (
    <section className={compact ? 'py-8' : 'py-16 md:py-24 bg-background'}>
      <div className={compact ? 'container-wide' : 'container-narrow'}>
        {!compact && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Common questions
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Quick answers
            </h2>
          </div>
        )}

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-xl px-5 data-[state=open]:border-primary/30 transition-colors"
            >
              <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline py-4 text-sm md:text-base">
                {language === 'es' ? faq.questionEs : faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm pb-4 leading-relaxed">
                {language === 'es' ? faq.answerEs : faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {!compact && (
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-4 bg-muted/50 rounded-xl px-6 py-4">
              <MessageCircle className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Still have questions?</p>
                <a
                  href={`tel:${BUSINESS_INFO.phone.sales}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {BUSINESS_INFO.phone.salesFormatted}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

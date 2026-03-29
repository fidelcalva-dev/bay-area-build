import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SeoJsonLd } from './SeoJsonLd';

export interface FAQItem {
  question: string;
  answer: string;
}

interface PageFAQProps {
  faqs: FAQItem[];
  title?: string;
  className?: string;
  /** Include FAQ schema markup */
  includeSchema?: boolean;
}

export function PageFAQ({ faqs, title = 'Frequently Asked Questions', className = '', includeSchema = true }: PageFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section className={`py-12 md:py-16 bg-muted/30 ${className}`}>
      {includeSchema && <SeoJsonLd schema={schema} />}
      <div className="container-wide max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">{title}</h2>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-foreground text-sm pr-4">{faq.question}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

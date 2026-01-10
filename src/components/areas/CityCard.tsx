import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { CityData } from '@/data/serviceAreas';

interface CityCardProps {
  city: CityData;
  countySlug: string;
}

export function CityCard({ city, countySlug }: CityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-success" />
          <h3 className="font-bold text-foreground">{city.name}</h3>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border bg-muted/30">
          <div className="pt-4 space-y-4">
            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {city.description}
            </p>

            {/* Highlights */}
            <div className="flex flex-wrap gap-2">
              {city.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-success/10 text-success rounded-full"
                >
                  <CheckCircle className="w-3 h-3" />
                  {highlight}
                </span>
              ))}
            </div>

            {/* FAQs */}
            {city.faqs.length > 0 && (
              <Accordion type="single" collapsible className="w-full">
                {city.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border-border/50">
                    <AccordionTrigger className="text-sm text-left py-2 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button asChild variant="default" size="sm" className="flex-1">
                <Link to="/#quote">
                  Get Quote for {city.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="tel:+15106802150">Call Now</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

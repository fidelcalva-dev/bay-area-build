import { Helmet } from 'react-helmet-async';
import { BUSINESS_INFO, generateLocalBusinessSchema, generateFAQSchema, generateServiceSchema } from '@/lib/seo';
import { MASTER_FAQS, DUMPSTER_SIZES_DATA } from '@/lib/shared-data';

interface LocalSEOSchemaProps {
  cityName?: string;
  countyName?: string;
  includeFAQ?: boolean;
  includeService?: boolean;
  sizeYards?: number;
}

// Generates comprehensive local SEO schema for city/size pages
export function LocalSEOSchema({ 
  cityName, 
  countyName, 
  includeFAQ = true,
  includeService = true,
  sizeYards,
}: LocalSEOSchemaProps) {
  const schemas: object[] = [];
  
  // Always include LocalBusiness
  schemas.push(generateLocalBusinessSchema());
  
  // Add FAQ schema
  if (includeFAQ) {
    const faqs = MASTER_FAQS.slice(0, 5).map(faq => ({
      question: faq.question,
      answer: faq.answer,
    }));
    schemas.push(generateFAQSchema(faqs));
  }
  
  // Add Service schema for dumpster rental
  if (includeService) {
    const sizeData = sizeYards 
      ? DUMPSTER_SIZES_DATA.find(s => s.yards === sizeYards) 
      : DUMPSTER_SIZES_DATA.find(s => s.popular);
    
    const serviceName = sizeYards 
      ? `${sizeYards} Yard Dumpster Rental${cityName ? ` in ${cityName}` : ''}`
      : `Dumpster Rental${cityName ? ` in ${cityName}` : ''}`;
    
    const serviceDescription = sizeData
      ? `${sizeData.dimensions} dumpster rental. ${sizeData.description} Includes ${sizeData.includedTons} ton${sizeData.includedTons > 1 ? 's' : ''} and 7-day rental.`
      : 'Roll-off dumpster rental with delivery and pickup included. Sizes from 5 to 50 yards.';
    
    schemas.push(generateServiceSchema({
      name: serviceName,
      description: serviceDescription,
      price: sizeData ? `$${sizeData.priceFrom}` : undefined,
      areaServed: cityName ? [cityName, countyName || 'Bay Area', 'California'].filter(Boolean) : undefined,
    }));
  }
  
  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

// Generate SEO-optimized heading text
export function getLocalizedH1(cityName?: string): string {
  if (cityName) {
    return `Dumpster Rental in ${cityName}, CA — ZIP-Based with Local Yards`;
  }
  return 'Bay Area Dumpster Rental — ZIP-Based with Local Yards';
}

export function getLocalizedH2s(cityName?: string): string[] {
  const city = cityName || 'Your Area';
  return [
    `Dumpster Sizes Available in ${city}`,
    'Same-Day Dumpster Delivery Near You',
    'Why Choose a Local Dumpster Rental Company',
  ];
}

// Price transparency footer text (Phase 3, Item 8)
export function PriceTransparencyNote({ className }: { className?: string }) {
  return (
    <p className={className}>
      Final pricing depends on material, weight, and location.{' '}
      <a href="/materials" className="underline hover:text-primary transition-colors">
        What's included / What's not allowed
      </a>
    </p>
  );
}

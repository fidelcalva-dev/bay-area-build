import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
}

const DEFAULT_TITLE = 'Calsan Dumpsters Pro | Dumpster Rental SF Bay Area | Same-Day Delivery';
const DEFAULT_DESCRIPTION = 'Affordable dumpster rental in the SF Bay Area. Same-day delivery, transparent pricing, all sizes from 8 to 40 yards. Serving Alameda, San Francisco, Santa Clara, and more. Hablamos Español.';

export function SEOHead({ 
  title, 
  description = DEFAULT_DESCRIPTION, 
  canonical,
  type = 'website' 
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | Calsan Dumpsters Pro` : DEFAULT_TITLE;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://calsandumpsterspro.com",
    "name": "Calsan Dumpsters Pro",
    "image": "https://calsandumpsterspro.com/og-image.jpg",
    "telephone": "+1-510-680-2150",
    "email": "contact@calsandumpsterspro.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1930 12th Ave #201",
      "addressLocality": "Oakland",
      "addressRegion": "CA",
      "postalCode": "94606",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 37.7979,
      "longitude": -122.2369
    },
    "url": "https://calsandumpsterspro.com",
    "areaServed": [
      { "@type": "County", "name": "Alameda County" },
      { "@type": "County", "name": "San Francisco County" },
      { "@type": "County", "name": "Santa Clara County" },
      { "@type": "County", "name": "Contra Costa County" },
      { "@type": "County", "name": "San Mateo County" },
      { "@type": "County", "name": "Marin County" },
      { "@type": "County", "name": "Napa County" },
      { "@type": "County", "name": "Solano County" },
      { "@type": "County", "name": "Sonoma County" }
    ],
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "07:00",
      "closes": "18:00"
    },
    "sameAs": [],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Dumpster Rental Services",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "8 Yard Dumpster Rental" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "10 Yard Dumpster Rental" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "15 Yard Dumpster Rental" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "20 Yard Dumpster Rental" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "30 Yard Dumpster Rental" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "40 Yard Dumpster Rental" } }
      ]
    }
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="robots" content="index, follow" />
      <meta name="geo.region" content="US-CA" />
      <meta name="geo.placename" content="Oakland" />
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
    </Helmet>
  );
}

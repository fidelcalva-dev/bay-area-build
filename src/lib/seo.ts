// SEO Configuration - Centralized metadata and schema for all pages
// NAP: Name, Address, Phone - Keep consistent across all references

export const BUSINESS_INFO = {
  name: 'Calsan Dumpsters Pro',
  legalName: 'Calsan Dumpsters Pro LLC',
  description: 'Dumpster rental services in the San Francisco Bay Area',
  phone: {
    sales: '+1-510-680-2150',
    salesFormatted: '(510) 680-2150',
    support: '+1-415-846-5621',
    supportFormatted: '(415) 846-5621',
  },
  email: 'contact@calsandumpsterspro.com',
  address: {
    street: '1930 12th Ave #201',
    city: 'Oakland',
    state: 'CA',
    zip: '94606',
    country: 'US',
    full: '1930 12th Ave #201, Oakland, CA 94606',
  },
  geo: {
    latitude: 37.7979,
    longitude: -122.2369,
  },
  hours: {
    days: 'Monday - Saturday',
    hours: '7:00 AM - 6:00 PM',
    timezone: 'America/Los_Angeles',
  },
  social: {
    facebook: 'https://facebook.com/calsandumpsterspro',
    instagram: 'https://instagram.com/calsandumpsterspro',
    twitter: 'https://twitter.com/calsandumpsters',
    yelp: 'https://yelp.com/biz/calsan-dumpsters-pro-oakland',
    google: 'https://g.page/calsan-dumpsters-pro',
  },
  url: 'https://calsandumpsterspro.com',
} as const;

export const SERVICE_AREAS = [
  'Alameda County',
  'San Francisco County',
  'Santa Clara County',
  'Contra Costa County',
  'San Mateo County',
  'Marin County',
  'Napa County',
  'Solano County',
  'Sonoma County',
] as const;

export const DUMPSTER_SIZES = [
  '6 Yard Dumpster',
  '8 Yard Dumpster',
  '10 Yard Dumpster',
  '20 Yard Dumpster',
  '30 Yard Dumpster',
  '40 Yard Dumpster',
  '50 Yard Dumpster',
] as const;

// Page-specific SEO configurations
export const PAGE_SEO = {
  home: {
    title: 'Dumpster Rental SF Bay Area | Same-Day Delivery',
    description: 'Affordable dumpster rental in the SF Bay Area. Same-day delivery, transparent pricing, 6-50 yard sizes. Serving Oakland, San Francisco, San Jose & 9 counties. Hablamos Español.',
    canonical: '/',
  },
  pricing: {
    title: 'Dumpster Rental Prices | Transparent Pricing',
    description: 'Get instant dumpster rental pricing. No hidden fees, flat-rate pricing starting at $299. 6-50 yard sizes available across the Bay Area.',
    canonical: '/pricing',
  },
  sizes: {
    title: 'Dumpster Sizes Guide | 6 to 50 Yard Dumpsters',
    description: 'Compare dumpster sizes from 6 to 50 yards. Heavy material sizes for concrete and dirt. General debris sizes for renovations and cleanouts.',
    canonical: '/sizes',
  },
  areas: {
    title: 'Service Areas | Bay Area Dumpster Delivery',
    description: 'Dumpster delivery in 9 Bay Area counties: Alameda, SF, Santa Clara, Contra Costa, San Mateo, Marin, Napa, Solano, Sonoma. Same-day available.',
    canonical: '/areas',
  },
  materials: {
    title: 'Accepted Materials | What Can Go in a Dumpster',
    description: 'Learn what materials you can put in a dumpster. Guide to acceptable debris, prohibited items, and special disposal for concrete, dirt, and hazardous waste.',
    canonical: '/materials',
  },
  contractors: {
    title: 'Contractor Dumpster Rental | Volume Discounts',
    description: 'Contractor-friendly dumpster service with volume discounts, priority scheduling, and dedicated account support. Net-30 available for qualified contractors.',
    canonical: '/contractors',
  },
  about: {
    title: 'About Us | Local Bay Area Dumpster Company',
    description: 'Calsan Dumpsters Pro is a locally owned dumpster rental company serving the SF Bay Area. 15+ years experience, family operated, community focused.',
    canonical: '/about',
  },
  contact: {
    title: 'Contact Us | Get in Touch',
    description: 'Contact Calsan Dumpsters Pro. Call (510) 680-2150 for sales, text us, or email. Office in Oakland, CA. Hablamos Español.',
    canonical: '/contact',
  },
  blog: {
    title: 'Dumpster Rental Blog | Tips, Guides & News',
    description: 'Expert tips on dumpster rental, sizing guides, permit information, and waste disposal best practices for Bay Area residents and contractors.',
    canonical: '/blog',
  },
  careers: {
    title: 'Careers & Operator Opportunities',
    description: 'Join Calsan Dumpsters Pro. Driver positions, sales roles, and Owner Operator partnerships. Expanding across California.',
    canonical: '/careers',
  },
  quote: {
    title: 'Get Instant Dumpster Quote',
    description: 'Get an instant dumpster rental quote in 30 seconds. Enter your ZIP code for pricing. Same-day delivery available.',
    canonical: '/quote',
  },
  contractorQuote: {
    title: 'Contractor Quote | 10% Discount',
    description: 'Special contractor pricing with 10% discount. Get your quote for volume dumpster rental with priority service.',
    canonical: '/quote/contractor',
  },
  greenHalo: {
    title: 'Green Halo™ Sustainability Program',
    description: 'Track your recycling impact with verified data. Real-time dashboards, sustainability reports, and environmental certifications for your projects.',
    canonical: '/green-halo',
  },
  greenImpact: {
    title: 'Green Impact Map | Verified Recycling Projects',
    description: 'See verified recycling impact across California. Real project data showing tons diverted, CO₂ reduction, and environmental metrics.',
    canonical: '/green-impact',
  },
  thankYou: {
    title: 'Thank You | Quote Submitted',
    description: 'Your dumpster rental quote has been submitted. We will contact you shortly.',
    canonical: '/thank-you',
  },
} as const;

// Generate LocalBusiness schema
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BUSINESS_INFO.url}/#organization`,
    "name": BUSINESS_INFO.name,
    "legalName": BUSINESS_INFO.legalName,
    "description": BUSINESS_INFO.description,
    "image": `${BUSINESS_INFO.url}/og-image.jpg`,
    "logo": `${BUSINESS_INFO.url}/logo.png`,
    "telephone": BUSINESS_INFO.phone.sales,
    "email": BUSINESS_INFO.email,
    "url": BUSINESS_INFO.url,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BUSINESS_INFO.address.street,
      "addressLocality": BUSINESS_INFO.address.city,
      "addressRegion": BUSINESS_INFO.address.state,
      "postalCode": BUSINESS_INFO.address.zip,
      "addressCountry": BUSINESS_INFO.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": BUSINESS_INFO.geo.latitude,
      "longitude": BUSINESS_INFO.geo.longitude
    },
    "areaServed": SERVICE_AREAS.map(area => ({
      "@type": "AdministrativeArea",
      "name": area
    })),
    "priceRange": "$$",
    "currenciesAccepted": "USD",
    "paymentAccepted": "Cash, Credit Card, Check",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "07:00",
      "closes": "18:00"
    },
    "sameAs": Object.values(BUSINESS_INFO.social),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Dumpster Rental Services",
      "itemListElement": DUMPSTER_SIZES.map(size => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": `${size} Rental`
        }
      }))
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
}

// Generate BreadcrumbList schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${BUSINESS_INFO.url}${item.url}`
    }))
  };
}

// Generate FAQPage schema
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Generate Service schema
export function generateServiceSchema(service: {
  name: string;
  description: string;
  price?: string;
  areaServed?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Dumpster Rental",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "LocalBusiness",
      "@id": `${BUSINESS_INFO.url}/#organization`
    },
    "areaServed": (service.areaServed || SERVICE_AREAS).map(area => ({
      "@type": "AdministrativeArea",
      "name": area
    })),
    ...(service.price && {
      "offers": {
        "@type": "Offer",
        "price": service.price,
        "priceCurrency": "USD"
      }
    })
  };
}

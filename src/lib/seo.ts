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
    // Customer Service Hours
    customerService: {
      days: 'Monday - Sunday',
      hours: '6:00 AM - 9:00 PM',
      displayText: 'Customer Service: 6:00 AM – 9:00 PM, Monday through Sunday',
      displayTextEs: 'Servicio al Cliente: 6:00 AM – 9:00 PM, Lunes a Domingo',
    },
    // Operations/Delivery Windows
    operations: {
      days: 'Monday - Friday',
      weekendNote: 'Weekend service available by special request',
      weekendNoteEs: 'Servicio de fin de semana disponible por solicitud especial',
      timeWindows: [
        { name: 'Morning', hours: '7:00 AM – 11:00 AM' },
        { name: 'Midday', hours: '11:00 AM – 3:00 PM' },
        { name: 'Afternoon', hours: '3:00 PM – 6:00 PM' },
      ],
    },
    // After-hours messaging
    afterHours: {
      message: 'Messages and emails received after hours will be answered the next business window.',
      messageEs: 'Los mensajes y correos electrónicos recibidos fuera de horario serán respondidos en la próxima ventana de atención.',
    },
    timezone: 'America/Los_Angeles',
    // Legacy fields for backwards compatibility
    days: 'Monday - Sunday',
    hours: '6:00 AM - 9:00 PM',
  },
  social: {
    facebook: 'https://facebook.com/calsandumpsterspro',
    instagram: 'https://instagram.com/calsandumpsterspro',
    youtube: 'https://youtube.com/@calsandumpsterspro',
    yelp: 'https://yelp.com/biz/calsan-dumpsters-pro-oakland',
    google: 'https://g.page/calsan-dumpsters-pro',
    bbb: 'https://www.bbb.org/us/ca/oakland/profile/dumpster-rental/calsan-dumpsters-pro-1116-123456',
    googleGuarantee: 'https://support.google.com/google-ads/answer/7549288',
    linkedin: 'https://linkedin.com/company/calsan-dumpsters-pro',
    tiktok: 'https://tiktok.com/@calsandumpsterspro',
    twitter: 'https://x.com/calsandumpsters',
    pinterest: 'https://pinterest.com/calsandumpsterspro',
  },
  url: 'https://calsandumpsterspro.com',
} as const;

// ============================================================
// OPERATIONAL YARDS - Canonical Source of Truth
// ============================================================
export interface OperationalYard {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  directionsUrl: string;
  note: string;
  isActive: boolean;
}

export const OPERATIONAL_YARDS: OperationalYard[] = [
  {
    id: 'oakland',
    name: 'Oakland Yard',
    address: '1000 46th Ave, Oakland, CA 94601',
    city: 'Oakland',
    state: 'CA',
    zip: '94601',
    lat: 37.7692,
    lng: -122.2189,
    directionsUrl: 'https://maps.app.goo.gl/?q=1000+46th+Ave,+Oakland,+CA',
    note: 'Serves North/East Bay',
    isActive: true,
  },
  {
    id: 'sanjose',
    name: 'San Jose Yard',
    address: '2071 Ringwood Ave, San Jose, CA 95131',
    city: 'San Jose',
    state: 'CA',
    zip: '95131',
    lat: 37.3861,
    lng: -121.9187,
    directionsUrl: 'https://maps.app.goo.gl/83A528whCrgMyadQ7?g_st=ic',
    note: 'Serves South Bay',
    isActive: true,
  },
  {
    id: 'sanfrancisco',
    name: 'San Francisco Yard',
    address: '1200 17th St, San Francisco, CA 94107',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    lat: 37.7650,
    lng: -122.3964,
    directionsUrl: 'https://maps.app.goo.gl/?q=1200+17th+St,+San+Francisco,+CA',
    note: 'Serves SF / Peninsula',
    isActive: true,
  },
];

// Helper to get yard by ID
export const getYardById = (id: string) => OPERATIONAL_YARDS.find(y => y.id === id);

// Helper to get nearest yard (simple lat/lng comparison)
export const getNearestYard = (lat: number, lng: number) => {
  let nearest = OPERATIONAL_YARDS[0];
  let minDist = Infinity;
  
  for (const yard of OPERATIONAL_YARDS) {
    const dist = Math.sqrt(
      Math.pow(yard.lat - lat, 2) + Math.pow(yard.lng - lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = yard;
    }
  }
  
  return nearest;
};

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
  '5 Yard Dumpster',
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
    title: 'Bay Area Dumpster Rental | Same-Day Delivery | Calsan Dumpsters Pro',
    description: 'Rent a dumpster in Oakland, San Jose & San Francisco. 5–50 yard sizes, transparent all-inclusive pricing, same-day delivery. Local yards, not a broker.',
    canonical: '/',
    ogImage: '/og-image.jpg',
  },
  pricing: {
    title: 'Dumpster Rental Prices | Bay Area All-Inclusive Rates',
    description: 'Bay Area dumpster rental pricing from $399. Delivery, pickup & weight included. No hidden fees. 5–50 yard sizes for general debris and heavy materials.',
    canonical: '/pricing',
    ogImage: '/og-image.jpg',
  },
  sizes: {
    title: 'Dumpster Sizes: 5 to 50 Yard | Find the Right Size',
    description: 'Compare dumpster sizes from 5 to 50 yards with photos. See what fits, weight limits, and best-use projects. Bay Area delivery available.',
    canonical: '/sizes',
    ogImage: '/og-image.jpg',
  },
  areas: {
    title: 'Bay Area Dumpster Rental Service Areas | 9 Counties',
    description: 'Dumpster delivery across 9 Bay Area counties from local yards in Oakland, San Jose & SF. Same-day available. Check your ZIP for coverage.',
    canonical: '/areas',
    ogImage: '/og-image.jpg',
  },
  materials: {
    title: 'What Can Go in a Dumpster? | Accepted & Prohibited Materials',
    description: 'Guide to accepted and prohibited dumpster materials. Household debris, construction waste, concrete/dirt rules, and hazardous items to avoid.',
    canonical: '/materials',
    ogImage: '/og-image.jpg',
  },
  contractors: {
    title: 'Contractor Dumpster Rental | Priority Service & Volume Rates',
    description: 'Contractor-grade dumpster service with priority scheduling, heavy material support, and dedicated dispatch. Bay Area builders trust Calsan.',
    canonical: '/contractors',
    ogImage: '/og-image.jpg',
  },
  about: {
    title: 'About Calsan Dumpsters Pro | Bay Area Local Yard Operator',
    description: 'Locally owned dumpster rental company in Oakland, CA. Real yards, branded fleet, bilingual support. Serving 9 Bay Area counties with reliable service.',
    canonical: '/about',
    ogImage: '/og-image.jpg',
  },
  contact: {
    title: 'Contact Calsan Dumpsters | Call (510) 680-2150',
    description: 'Contact Calsan Dumpsters Pro. Call (510) 680-2150, text us, or email. Oakland HQ. Hablamos Español. Response within 15 minutes during business hours.',
    canonical: '/contact',
    ogImage: '/og-image.jpg',
  },
  blog: {
    title: 'Dumpster Rental Tips & Guides | Bay Area Resources',
    description: 'Expert dumpster rental tips, sizing guides, permit info, and waste disposal best practices for Bay Area residents and contractors.',
    canonical: '/blog',
    ogImage: '/og-image.jpg',
  },
  careers: {
    title: 'Careers & Operator Partnerships | Calsan Dumpsters Pro',
    description: 'Join Calsan: CDL drivers, owner operators, sales reps, and city operator partnerships. Growing across California with local yard infrastructure.',
    canonical: '/careers',
    ogImage: '/og-image.jpg',
  },
  quote: {
    title: 'Get Instant Dumpster Quote | 60-Second Pricing',
    description: 'Get an instant dumpster rental quote in 60 seconds. Enter your ZIP for all-inclusive pricing. Same-day delivery available in the Bay Area.',
    canonical: '/quote',
    ogImage: '/og-image.jpg',
  },
  contractorQuote: {
    title: 'Contractor Quote | Volume Programs',
    description: 'Exclusive contractor volume programs with priority scheduling, heavy material handling, and dedicated support for Bay Area contractors.',
    canonical: '/quote/contractor',
    ogImage: '/og-image.jpg',
  },
  greenHalo: {
    title: 'Green Halo™ | Recycling Documentation & Diversion Reports',
    description: 'Track recycling documentation for construction projects. Weight tickets, diversion reports, and WMP compliance support for Bay Area contractors.',
    canonical: '/green-halo',
    ogImage: '/og-image.jpg',
  },
  greenImpact: {
    title: 'Green Impact Map | Verified Recycling Projects',
    description: 'See verified recycling impact across California. Real project data showing tons diverted, CO₂ reduction, and environmental metrics.',
    canonical: '/green-impact',
    ogImage: '/og-image.jpg',
  },
  thankYou: {
    title: 'Thank You | Quote Submitted',
    description: 'Your dumpster rental quote has been submitted. We will contact you shortly.',
    canonical: '/thank-you',
    ogImage: '/og-image.jpg',
  },
  locations: {
    title: 'Locations | Oakland & San Jose Yards',
    description: 'Visit our operational yards in Oakland and San Jose. Same-day dumpster delivery across the Bay Area. Get directions to our nearest location.',
    canonical: '/locations',
    ogImage: '/og-image.jpg',
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms of service for Calsan Dumpsters Pro dumpster rental services in the San Francisco Bay Area.',
    canonical: '/terms',
    ogImage: '/og-image.jpg',
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Privacy policy for Calsan Dumpsters Pro. Learn how we collect, use, and protect your personal information.',
    canonical: '/privacy',
    ogImage: '/og-image.jpg',
  },
} as const;

// Generate LocalBusiness schema
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "additionalType": [
      "https://schema.org/ProfessionalService",
      "https://schema.org/WasteManagementService"
    ],
    "@id": `${BUSINESS_INFO.url}/#organization`,
    "name": BUSINESS_INFO.name,
    "legalName": BUSINESS_INFO.legalName,
    "serviceType": [
      "Roll-off Dumpster Rental",
      "Dumpster Rental Service",
      "Roll Off Dumpster Service",
      "Waste Management Service",
      "Debris Removal Service",
      "Construction Waste Removal"
    ],
    "description": "Calsan Dumpsters Pro provides professional dumpster rental services across the San Francisco Bay Area. Serving homeowners, contractors, and businesses with reliable delivery, transparent pricing, and clear rental terms. Specialized in roll-off dumpsters for construction, remodeling, roofing, and property cleanouts. Serving the Bay Area since 2009. Focused on dumpster rental since 2015.",
    "image": `${BUSINESS_INFO.url}/og-image.jpg`,
    "logo": `${BUSINESS_INFO.url}/logo.png`,
    "telephone": BUSINESS_INFO.phone.sales,
    "email": BUSINESS_INFO.email,
    "url": BUSINESS_INFO.url,
    "foundingDate": "2009",
    "knowsAbout": [
      "Dumpster Rental",
      "Roll-Off Container Service",
      "Construction Waste Removal",
      "Concrete Disposal",
      "Debris Removal",
      "Property Cleanout"
    ],
    "slogan": "Same-Day Dumpster Rental in the Bay Area",
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
    "areaServed": [
      ...SERVICE_AREAS.map(area => ({
        "@type": "AdministrativeArea",
        "name": area
      })),
      ...GBP_SERVICE_CITIES.map(city => ({
        "@type": "City",
        "name": `${city}, CA`
      }))
    ],
    "priceRange": "$$",
    "currenciesAccepted": "USD",
    "paymentAccepted": "Cash, Credit Card, Check",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "06:00",
      "closes": "21:00"
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
      "ratingValue": "4.9",
      "reviewCount": "200",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": GBP_SEED_REVIEWS.slice(0, 3).map(r => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": r.author },
      "reviewRating": { "@type": "Rating", "ratingValue": r.rating, "bestRating": "5" },
      "reviewBody": r.text,
      "datePublished": r.date
    }))
  };
}

// GBP Primary Service Cities (for schema areaServed)
export const GBP_SERVICE_CITIES = [
  "Oakland", "San Jose", "San Francisco", "Berkeley", "Hayward",
  "Fremont", "Livermore", "Walnut Creek", "Concord", "Pleasanton",
  "Dublin", "San Leandro", "Alameda", "Union City", "San Mateo",
  "Redwood City", "San Rafael", "Vallejo", "Napa", "Santa Clara",
  "Sunnyvale", "Mountain View", "Cupertino", "Los Gatos", "Milpitas",
  "Castro Valley", "Danville", "Orinda", "Lafayette", "Moraga"
] as const;

// GBP Seed Reviews for schema markup
export const GBP_SEED_REVIEWS = [
  { author: "Mike R.", rating: 5, text: "Excellent service and affordable prices. Same-day delivery for our Oakland renovation project.", date: "2025-11-15" },
  { author: "Sarah T.", rating: 5, text: "Professional team. The dumpster was delivered on time and picked up exactly when promised.", date: "2025-10-22" },
  { author: "Carlos M.", rating: 5, text: "Best dumpster rental company in the Bay Area. Transparent pricing with no hidden fees.", date: "2025-12-03" },
  { author: "Jennifer L.", rating: 5, text: "Used them for a concrete removal project. Flat-fee pricing saved us hundreds compared to competitors.", date: "2025-09-18" },
  { author: "David K.", rating: 5, text: "Contractor-ready service. We use Calsan for all our construction projects in San Jose.", date: "2025-11-28" },
] as const;

// GBP Q&A Seed Data (for website FAQ sections and GBP seeding)
export const GBP_QA_SEEDS = [
  { q: "What dumpster sizes do you offer?", a: "We offer 5, 8, 10, 20, 30, 40, and 50 yard dumpsters depending on your project. Heavy material sizes (concrete, dirt) are available in 5, 8, and 10 yard only. Our team can help you choose the right size." },
  { q: "Do you deliver dumpsters same day?", a: "Yes, same-day delivery is available depending on inventory and location. Most Bay Area addresses qualify for same-day or next-day delivery." },
  { q: "Do you offer dumpsters for contractors?", a: "Yes, many of our customers are contractors and construction professionals. We offer volume programs, priority scheduling, and Net-30 terms for qualified contractors." },
  { q: "What areas do you serve?", a: "We serve the entire San Francisco Bay Area including Oakland, San Jose, San Francisco, Berkeley, Hayward, Fremont, and 30+ additional cities across 9 counties." },
  { q: "Can I put concrete in a dumpster?", a: "Yes, we offer dedicated concrete and heavy material dumpsters with flat-fee pricing. No weight overage charges for clean concrete, dirt, or asphalt." },
  { q: "How long can I keep the dumpster?", a: "Standard rental is 7 days. Extensions are available at $35 per day. Just let us know before your rental period ends." },
] as const;

// GBP Google Post Templates
export const GBP_POST_TEMPLATES = [
  { title: "Dumpster Rental in Oakland", body: "Working on a renovation or cleanup project? Calsan Dumpsters Pro offers reliable dumpster rental across Oakland and the Bay Area. Same-day delivery available.", cta: "Get Instant Quote", url: "/quote" },
  { title: "Same-Day Dumpster Delivery", body: "Need a dumpster today? We offer same-day delivery across the Bay Area from our Oakland and San Jose yards. 5-50 yard sizes available.", cta: "Get Instant Quote", url: "/quote" },
  { title: "Contractor Dumpster Service", body: "Calsan Dumpsters Pro serves Bay Area contractors with volume discounts, priority scheduling, and reliable service for construction and remodeling projects.", cta: "Get Contractor Quote", url: "/quote/contractor" },
  { title: "Concrete Dumpster Rental", body: "Flat-fee concrete dumpster rental in the Bay Area. No weight overage charges for clean concrete, dirt, or asphalt. Professional dispatch coordination.", cta: "Get Instant Quote", url: "/quote" },
] as const;

// Local Citation NAP Data (canonical for all directory listings)
export const LOCAL_CITATION_NAP = {
  name: BUSINESS_INFO.name,
  phone: "(510) 680-2150",
  website: BUSINESS_INFO.url,
  address: BUSINESS_INFO.address.full,
  directories: [
    "Google Business Profile", "Apple Maps", "Bing Places", "Yelp",
    "Nextdoor", "BBB", "Angi", "HomeAdvisor", "YellowPages",
    "MapQuest", "Hotfrog", "Foursquare", "Chamber of Commerce"
  ]
} as const;

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
    "@type": ["Service", "WasteManagementService"],
    "serviceType": "Dumpster Rental",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "LocalBusiness",
      "@id": `${BUSINESS_INFO.url}/#organization`
    },
    "areaServed": (service.areaServed || SERVICE_AREAS as unknown as string[]).map(area => ({
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

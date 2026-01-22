import { Helmet } from 'react-helmet-async';
import { BUSINESS_INFO, generateLocalBusinessSchema } from '@/lib/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  noindex?: boolean;
  schema?: object | object[];
  ogImage?: string;
}

const DEFAULT_TITLE = `${BUSINESS_INFO.name} | Dumpster Rental SF Bay Area | Same-Day Delivery`;
const DEFAULT_DESCRIPTION = 'Affordable dumpster rental in the SF Bay Area. Same-day delivery, transparent pricing, all sizes from 6 to 50 yards. Serving Alameda, San Francisco, Santa Clara, and more. Hablamos Español.';

export function SEOHead({ 
  title, 
  description = DEFAULT_DESCRIPTION, 
  canonical,
  type = 'website',
  noindex = false,
  schema,
  ogImage = '/og-image.jpg'
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${BUSINESS_INFO.name}` : DEFAULT_TITLE;
  const canonicalUrl = canonical ? `${BUSINESS_INFO.url}${canonical}` : undefined;
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${BUSINESS_INFO.url}${ogImage}`;
  
  // Always include LocalBusiness schema
  const localBusinessSchema = generateLocalBusinessSchema();
  
  // Combine schemas
  const allSchemas = schema 
    ? Array.isArray(schema) 
      ? [localBusinessSchema, ...schema] 
      : [localBusinessSchema, schema]
    : [localBusinessSchema];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={BUSINESS_INFO.name} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="US-CA" />
      <meta name="geo.placename" content={BUSINESS_INFO.address.city} />
      <meta name="geo.position" content={`${BUSINESS_INFO.geo.latitude};${BUSINESS_INFO.geo.longitude}`} />
      <meta name="ICBM" content={`${BUSINESS_INFO.geo.latitude}, ${BUSINESS_INFO.geo.longitude}`} />
      
      {/* Additional SEO */}
      <meta name="author" content={BUSINESS_INFO.name} />
      <meta name="publisher" content={BUSINESS_INFO.name} />
      <meta name="copyright" content={BUSINESS_INFO.name} />
      
      {/* Structured Data */}
      {allSchemas.map((schemaItem, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schemaItem)}
        </script>
      ))}
    </Helmet>
  );
}

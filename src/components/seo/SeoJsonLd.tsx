import { Helmet } from 'react-helmet-async';

interface SeoJsonLdProps {
  /** One or more JSON-LD schema objects */
  schema: object | object[];
}

/**
 * Generic JSON-LD injection component.
 * Accepts any valid schema.org object(s) and renders them as <script type="application/ld+json">.
 * 
 * Usage:
 *   <SeoJsonLd schema={faqSchema} />
 *   <SeoJsonLd schema={[breadcrumbSchema, serviceSchema]} />
 */
export function SeoJsonLd({ schema }: SeoJsonLdProps) {
  const schemas = Array.isArray(schema) ? schema : [schema];

  return (
    <Helmet>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}

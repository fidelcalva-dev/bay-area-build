import { BUSINESS_INFO, OPERATIONAL_YARDS } from '@/lib/seo';

interface GoogleMapEmbedProps {
  yardId?: string;
  city?: string;
  className?: string;
  height?: string;
}

/**
 * Google Maps embed for location pages.
 * Shows nearest yard or general Bay Area service area.
 * Uses a free embed (no API key needed).
 */
export default function GoogleMapEmbed({ 
  yardId, 
  city, 
  className = '',
  height = '300'
}: GoogleMapEmbedProps) {
  const yard = yardId ? OPERATIONAL_YARDS.find(y => y.id === yardId) : OPERATIONAL_YARDS[0];
  
  // Build a search query for the embed
  const query = yard 
    ? encodeURIComponent(`${BUSINESS_INFO.name}, ${yard.address}`)
    : city 
      ? encodeURIComponent(`Dumpster Rental ${city} CA`)
      : encodeURIComponent(`${BUSINESS_INFO.name}, Oakland CA`);

  return (
    <div className={`w-full rounded-lg overflow-hidden border border-border ${className}`}>
      <iframe
        title={`${BUSINESS_INFO.name} location${city ? ` near ${city}` : ''}`}
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

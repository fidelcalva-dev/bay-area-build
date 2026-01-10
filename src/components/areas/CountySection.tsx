import { MapPin } from 'lucide-react';
import { CityCard } from './CityCard';
import type { CountyData } from '@/data/serviceAreas';

interface CountySectionProps {
  county: CountyData;
}

export function CountySection({ county }: CountySectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{county.name}</h2>
          <p className="text-sm text-muted-foreground">
            {county.cities.length} cities served • Same-day delivery available
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {county.cities.map((city) => (
          <CityCard key={city.slug} city={city} countySlug={county.slug} />
        ))}
      </div>
    </div>
  );
}

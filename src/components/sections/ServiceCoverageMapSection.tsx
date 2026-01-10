import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, ChevronRight, CheckCircle2, Clock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
// Mapbox public access token - safe to embed in frontend
// Get your token at: https://account.mapbox.com/access-tokens/
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface City {
  id: string;
  name: string;
  status: 'active' | 'coming-soon';
  cities: string[];
  coordinates: [number, number]; // [lng, lat]
}

const serviceLocations: City[] = [
  // Bay Area - Active
  {
    id: 'san-francisco',
    name: 'San Francisco',
    status: 'active',
    cities: ['Downtown SF', 'SOMA', 'Mission', 'Marina'],
    coordinates: [-122.4194, 37.7749],
  },
  {
    id: 'oakland',
    name: 'Oakland',
    status: 'active',
    cities: ['Downtown Oakland', 'Lake Merritt', 'Rockridge', 'Jack London Square'],
    coordinates: [-122.2711, 37.8044],
  },
  {
    id: 'san-jose',
    name: 'San Jose',
    status: 'active',
    cities: ['Downtown SJ', 'Willow Glen', 'Santana Row', 'Evergreen'],
    coordinates: [-121.8863, 37.3382],
  },
  {
    id: 'fremont',
    name: 'Fremont',
    status: 'active',
    cities: ['Fremont', 'Newark', 'Union City'],
    coordinates: [-121.9886, 37.5485],
  },
  {
    id: 'hayward',
    name: 'Hayward',
    status: 'active',
    cities: ['Hayward', 'Castro Valley', 'San Leandro'],
    coordinates: [-122.0808, 37.6688],
  },
  {
    id: 'concord',
    name: 'Concord',
    status: 'active',
    cities: ['Concord', 'Walnut Creek', 'Pleasant Hill', 'Martinez'],
    coordinates: [-122.0311, 37.9780],
  },
  {
    id: 'santa-rosa',
    name: 'Santa Rosa',
    status: 'active',
    cities: ['Santa Rosa', 'Petaluma', 'Rohnert Park'],
    coordinates: [-122.7141, 38.4404],
  },
  {
    id: 'napa',
    name: 'Napa',
    status: 'active',
    cities: ['Napa', 'Yountville', 'St. Helena'],
    coordinates: [-122.2869, 38.2975],
  },
  {
    id: 'vallejo',
    name: 'Vallejo',
    status: 'active',
    cities: ['Vallejo', 'Fairfield', 'Benicia'],
    coordinates: [-122.2566, 38.1041],
  },
  // Coming Soon
  {
    id: 'sacramento',
    name: 'Sacramento',
    status: 'coming-soon',
    cities: ['Sacramento', 'Elk Grove', 'Roseville', 'Folsom'],
    coordinates: [-121.4944, 38.5816],
  },
  {
    id: 'stockton',
    name: 'Stockton',
    status: 'coming-soon',
    cities: ['Stockton', 'Tracy', 'Manteca', 'Lodi'],
    coordinates: [-121.2908, 37.9577],
  },
  {
    id: 'fresno',
    name: 'Fresno',
    status: 'coming-soon',
    cities: ['Fresno', 'Clovis', 'Madera'],
    coordinates: [-119.7871, 36.7378],
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    status: 'coming-soon',
    cities: ['Los Angeles', 'Long Beach', 'Pasadena', 'Glendale'],
    coordinates: [-118.2437, 34.0522],
  },
  {
    id: 'san-diego',
    name: 'San Diego',
    status: 'coming-soon',
    cities: ['San Diego', 'Chula Vista', 'Oceanside', 'Carlsbad'],
    coordinates: [-117.1611, 32.7157],
  },
  {
    id: 'bakersfield',
    name: 'Bakersfield',
    status: 'coming-soon',
    cities: ['Bakersfield', 'Delano', 'Wasco'],
    coordinates: [-119.0187, 35.3733],
  },
];

// Bay Area center for initial view
const BAY_AREA_CENTER = {
  longitude: -122.2,
  latitude: 37.7,
  zoom: 8.5,
};

// California bounds for max extent
const CALIFORNIA_BOUNDS: [[number, number], [number, number]] = [
  [-124.5, 32.5], // Southwest
  [-114.0, 42.0], // Northeast
];

export const ServiceCoverageMapSection = () => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Lazy load map when section becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsMapVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleMarkerClick = useCallback((city: City) => {
    setSelectedCity(prev => (prev?.id === city.id ? null : city));
  }, []);

  const activeLocations = useMemo(
    () => serviceLocations.filter(l => l.status === 'active'),
    []
  );
  const comingSoonLocations = useMemo(
    () => serviceLocations.filter(l => l.status === 'coming-soon'),
    []
  );

  const markers = useMemo(
    () =>
      serviceLocations.map(city => (
        <Marker
          key={city.id}
          longitude={city.coordinates[0]}
          latitude={city.coordinates[1]}
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            handleMarkerClick(city);
          }}
        >
          <div
            className={`relative cursor-pointer transition-transform duration-200 hover:scale-110 ${
              selectedCity?.id === city.id ? 'scale-125 z-10' : ''
            }`}
          >
            {/* Pin */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 ${
                city.status === 'active'
                  ? 'bg-primary border-primary-foreground'
                  : 'bg-accent border-accent-foreground'
              }`}
            >
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            {/* Pulse animation for active */}
            {city.status === 'active' && (
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            )}
          </div>
        </Marker>
      )),
    [selectedCity, handleMarkerClick]
  );

  return (
    <section ref={sectionRef} className="section-padding bg-background">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="heading-lg text-foreground mb-3">Service Coverage Map</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tap any pin to see service details. Green pins have same-day delivery available.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
              <div className="relative w-full" style={{ height: 'min(600px, 70vh)' }}>
                {!MAPBOX_TOKEN ? (
                  // Token missing - show setup message
                  <div className="w-full h-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
                    <div className="text-center max-w-md px-6">
                      <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        Interactive Map Coming Soon
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add your Mapbox public token to enable the satellite map view.
                      </p>
                      <div className="bg-card border border-border rounded-lg p-3 text-left">
                        <p className="text-xs text-muted-foreground mb-1">Add to your environment:</p>
                        <code className="text-xs text-primary break-all">
                          VITE_MAPBOX_TOKEN=pk.your_token_here
                        </code>
                      </div>
                    </div>
                  </div>
                ) : isMapVisible ? (
                  <Map
                    mapboxAccessToken={MAPBOX_TOKEN}
                    initialViewState={BAY_AREA_CENTER}
                    mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                    maxBounds={CALIFORNIA_BOUNDS}
                    minZoom={5}
                    maxZoom={12}
                    attributionControl={false}
                    onClick={() => setSelectedCity(null)}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <NavigationControl position="top-right" />

                    {markers}

                    {/* Popup for selected city */}
                    {selectedCity && (
                      <Popup
                        longitude={selectedCity.coordinates[0]}
                        latitude={selectedCity.coordinates[1]}
                        anchor="bottom"
                        offset={45}
                        closeButton={false}
                        closeOnClick={false}
                        className="mapbox-popup-custom"
                      >
                        <div className="p-4 min-w-[220px] max-w-[280px]">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-base text-foreground">
                                {selectedCity.name}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${
                                  selectedCity.status === 'active'
                                    ? 'text-primary'
                                    : 'text-accent'
                                }`}
                              >
                                {selectedCity.status === 'active' ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3" /> Active Service
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3" /> Coming Soon
                                  </>
                                )}
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedCity(null)}
                              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 -mt-1 -mr-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1.5">Areas served:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedCity.cities.slice(0, 4).map(city => (
                                <span
                                  key={city}
                                  className="text-xs bg-muted px-2 py-0.5 rounded-full text-foreground"
                                >
                                  {city}
                                </span>
                              ))}
                            </div>
                          </div>

                          {selectedCity.status === 'active' ? (
                            <Button variant="cta" className="w-full" size="sm" asChild>
                              <Link to="/pricing">
                                Get a Quote
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Link>
                            </Button>
                          ) : (
                            <Button variant="outline" className="w-full" size="sm" asChild>
                              <a href="tel:+15106802150">
                                <Phone className="mr-2 h-4 w-4" />
                                Request Early Access
                              </a>
                            </Button>
                          )}
                        </div>
                      </Popup>
                    )}
                  </Map>
                ) : (
                  // Loading placeholder
                  <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
                      <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-8 py-4 border-t border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary shadow-sm" />
                  <span className="text-sm text-foreground">Active Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-accent shadow-sm" />
                  <span className="text-sm text-foreground">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Quick Links - Active */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Active Regions ({activeLocations.length})
              </h4>
              <div className="space-y-1 mb-4">
                {activeLocations.map(location => (
                  <button
                    key={location.id}
                    onClick={() => setSelectedCity(location)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      selectedCity?.id === location.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {location.name}
                  </button>
                ))}
              </div>

              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Expanding Soon ({comingSoonLocations.length})
              </h4>
              <div className="space-y-1">
                {comingSoonLocations.map(location => (
                  <button
                    key={location.id}
                    onClick={() => setSelectedCity(location)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      selectedCity?.id === location.id
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-5 text-center">
              <p className="text-sm text-foreground mb-3">
                Don't see your area? We may still serve you.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="tel:+15106802150">
                  <Phone className="mr-2 h-4 w-4" />
                  Check Coverage
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom popup styles */}
      <style>{`
        .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
          background: hsl(var(--card)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: hsl(var(--card)) !important;
        }
        .mapboxgl-ctrl-group {
          background: hsl(var(--card)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        .mapboxgl-ctrl-group button {
          background: transparent !important;
        }
        .mapboxgl-ctrl-group button + button {
          border-top: 1px solid hsl(var(--border)) !important;
        }
      `}</style>
    </section>
  );
};

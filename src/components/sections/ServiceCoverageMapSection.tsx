import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, ChevronRight, CheckCircle2, Clock, X, Satellite, Map as MapIcon, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

interface City {
  id: string;
  name: string;
  status: 'active' | 'coming-soon';
  cities: string[];
  coordinates: [number, number]; // [lat, lng] for Leaflet
}

const serviceLocations: City[] = [
  // Bay Area - Active
  {
    id: 'san-francisco',
    name: 'San Francisco',
    status: 'active',
    cities: ['Downtown SF', 'SOMA', 'Mission', 'Marina'],
    coordinates: [37.7749, -122.4194],
  },
  {
    id: 'oakland',
    name: 'Oakland',
    status: 'active',
    cities: ['Downtown Oakland', 'Lake Merritt', 'Rockridge', 'Jack London Square'],
    coordinates: [37.8044, -122.2711],
  },
  {
    id: 'san-jose',
    name: 'San Jose',
    status: 'active',
    cities: ['Downtown SJ', 'Willow Glen', 'Santana Row', 'Evergreen'],
    coordinates: [37.3382, -121.8863],
  },
  {
    id: 'fremont',
    name: 'Fremont',
    status: 'active',
    cities: ['Fremont', 'Newark', 'Union City'],
    coordinates: [37.5485, -121.9886],
  },
  {
    id: 'hayward',
    name: 'Hayward',
    status: 'active',
    cities: ['Hayward', 'Castro Valley', 'San Leandro'],
    coordinates: [37.6688, -122.0808],
  },
  {
    id: 'concord',
    name: 'Concord',
    status: 'active',
    cities: ['Concord', 'Walnut Creek', 'Pleasant Hill', 'Martinez'],
    coordinates: [37.9780, -122.0311],
  },
  {
    id: 'santa-rosa',
    name: 'Santa Rosa',
    status: 'active',
    cities: ['Santa Rosa', 'Petaluma', 'Rohnert Park'],
    coordinates: [38.4404, -122.7141],
  },
  {
    id: 'napa',
    name: 'Napa',
    status: 'active',
    cities: ['Napa', 'Yountville', 'St. Helena'],
    coordinates: [38.2975, -122.2869],
  },
  {
    id: 'vallejo',
    name: 'Vallejo',
    status: 'active',
    cities: ['Vallejo', 'Fairfield', 'Benicia'],
    coordinates: [38.1041, -122.2566],
  },
  // Coming Soon
  {
    id: 'sacramento',
    name: 'Sacramento',
    status: 'coming-soon',
    cities: ['Sacramento', 'Elk Grove', 'Roseville', 'Folsom'],
    coordinates: [38.5816, -121.4944],
  },
  {
    id: 'stockton',
    name: 'Stockton',
    status: 'coming-soon',
    cities: ['Stockton', 'Tracy', 'Manteca', 'Lodi'],
    coordinates: [37.9577, -121.2908],
  },
  {
    id: 'fresno',
    name: 'Fresno',
    status: 'coming-soon',
    cities: ['Fresno', 'Clovis', 'Madera'],
    coordinates: [36.7378, -119.7871],
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    status: 'coming-soon',
    cities: ['Los Angeles', 'Long Beach', 'Pasadena', 'Glendale'],
    coordinates: [34.0522, -118.2437],
  },
  {
    id: 'san-diego',
    name: 'San Diego',
    status: 'coming-soon',
    cities: ['San Diego', 'Chula Vista', 'Oceanside', 'Carlsbad'],
    coordinates: [32.7157, -117.1611],
  },
  {
    id: 'bakersfield',
    name: 'Bakersfield',
    status: 'coming-soon',
    cities: ['Bakersfield', 'Delano', 'Wasco'],
    coordinates: [35.3733, -119.0187],
  },
];

// California center for initial view (shows entire state)
const CALIFORNIA_CENTER: [number, number] = [37.0, -119.5];
const CALIFORNIA_ZOOM = 6;

// Tile layer configurations
const TILE_LAYERS = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

// Create custom marker icons with distinct styling
const createIcon = (status: 'active' | 'coming-soon', isSelected: boolean) => {
  const isActive = status === 'active';
  const size = isSelected ? 44 : 36;
  
  // Active: solid green with pulse | Coming Soon: orange/amber dashed outline
  const activeStyles = `
    background: linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 71%, 45%));
    border: 3px solid white;
  `;
  const comingSoonStyles = `
    background: linear-gradient(135deg, hsl(38, 92%, 50%), hsl(32, 95%, 44%));
    border: 3px dashed white;
    opacity: 0.85;
  `;
  
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="marker-container ${isSelected ? 'selected' : ''}" style="width: ${size}px; height: ${size}px;">
        ${isActive ? '<div class="marker-pulse-active"></div>' : ''}
        <div class="marker-pin-new" style="${isActive ? activeStyles : comingSoonStyles}">
          ${isActive 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size * 0.45}" height="${size * 0.45}" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="0">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="2"/>
              </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="${size * 0.45}" height="${size * 0.45}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>`
          }
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Map controller for flying to locations
function FlyToCity({ city }: { city: City | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (city) {
      map.flyTo(city.coordinates, 10, { duration: 1 });
    }
  }, [city, map]);
  
  return null;
}

export const ServiceCoverageMapSection = () => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'street'>('satellite');
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
                {/* Map Style Toggle */}
                <div className="absolute top-4 right-4 z-[1000] flex gap-2">
                  <Button
                    variant={mapStyle === 'satellite' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setMapStyle('satellite')}
                    className="gap-1.5 shadow-lg"
                  >
                    <Satellite className="w-4 h-4" />
                    <span className="hidden sm:inline">Satellite</span>
                  </Button>
                  <Button
                    variant={mapStyle === 'street' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setMapStyle('street')}
                    className="gap-1.5 shadow-lg"
                  >
                    <MapIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Street</span>
                  </Button>
                </div>

                {isMapVisible ? (
                  <MapContainer
                    center={CALIFORNIA_CENTER}
                    zoom={CALIFORNIA_ZOOM}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                    style={{ background: 'hsl(var(--muted))' }}
                  >
                    <TileLayer
                      key={mapStyle}
                      url={TILE_LAYERS[mapStyle].url}
                      attribution={TILE_LAYERS[mapStyle].attribution}
                    />
                    
                    <FlyToCity city={selectedCity} />
                    
                    {serviceLocations.map((city) => (
                      <Marker
                        key={city.id}
                        position={city.coordinates}
                        icon={createIcon(city.status, selectedCity?.id === city.id)}
                        eventHandlers={{
                          click: () => handleMarkerClick(city),
                        }}
                      >
                        <Popup className="custom-leaflet-popup">
                          <div className="p-4 min-w-[220px] max-w-[280px]">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-bold text-base text-foreground">
                                  {city.name}
                                </h3>
                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${
                                    city.status === 'active'
                                      ? 'text-primary'
                                      : 'text-accent'
                                  }`}
                                >
                                  {city.status === 'active' ? (
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
                                {city.cities.slice(0, 4).map(area => (
                                  <span
                                    key={area}
                                    className="text-xs bg-muted px-2 py-0.5 rounded-full text-foreground"
                                  >
                                    {area}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {city.status === 'active' ? (
                              <Button variant="cta" className="w-full" size="sm" asChild>
                                <Link to="/quote">
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
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  // Loading placeholder
                  <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                    <div className="text-center">
                      <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
                      <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-8 py-4 border-t border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full shadow-sm flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 71%, 45%))' }}>
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-foreground font-medium">Active Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full shadow-sm flex items-center justify-center border-2 border-dashed border-amber-500" style={{ background: 'linear-gradient(135deg, hsl(38, 92%, 50%), hsl(32, 95%, 44%))' }}>
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-foreground font-medium">Coming Soon</span>
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

      {/* Custom Leaflet Styles */}
      <style>{`
        .custom-leaflet-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .marker-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .marker-container.selected {
          z-index: 1000 !important;
        }
        
        .marker-pin-new {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        
        .marker-pin-new:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
        }
        
        .marker-pulse-active {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: hsl(142, 76%, 36%);
          opacity: 0.4;
          animation: leaflet-pulse 2s ease-out infinite;
        }
        
        @keyframes leaflet-pulse {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
          background: hsl(var(--card)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
          color: hsl(var(--foreground));
        }
        
        .leaflet-popup-tip-container {
          display: none;
        }
        
        .leaflet-popup-close-button {
          display: none !important;
        }
        
        .leaflet-container {
          font-family: inherit;
        }
        
        .leaflet-control-zoom {
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        
        .leaflet-control-zoom a {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        
        .leaflet-control-zoom a:last-child {
          border-bottom: none !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: hsl(var(--muted)) !important;
        }
        
        .leaflet-control-attribution {
          background: hsl(var(--background) / 0.8) !important;
          color: hsl(var(--muted-foreground)) !important;
          font-size: 10px;
        }
        
        .leaflet-control-attribution a {
          color: hsl(var(--primary)) !important;
        }
      `}</style>
    </section>
  );
};

import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Phone, Clock, Shield, Award, Truck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OPERATIONAL_YARDS, BUSINESS_INFO } from '@/lib/seo';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import 'leaflet/dist/leaflet.css';

// Create custom icons for the yards
const createYardIcon = () => L.divIcon({
  className: 'custom-yard-marker',
  html: `
    <div style="
      background: hsl(142.1, 76.2%, 36.3%);
      border: 3px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Create icon for HQ
const createHQIcon = () => L.divIcon({
  className: 'custom-hq-marker',
  html: `
    <div style="
      background: hsl(221.2, 83.2%, 53.3%);
      border: 3px solid white;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// Map center (between Oakland and San Jose)
const MAP_CENTER: [number, number] = [37.55, -122.05];

export default function Locations() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Layout
      title="Locations | Oakland & San Jose Yards | CALSAN Dumpsters"
      description="Visit our operational yards in Oakland and San Jose. Same-day dumpster delivery across the Bay Area. Get directions to our nearest location."
      canonical="/locations"
    >
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <AnimatedSection>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 rounded-full text-sm mb-4">
                <MapPin className="w-4 h-4" />
                <span>2 Operational Yards</span>
              </div>
              <h1 className="heading-xl mb-4">Our Locations</h1>
              <p className="text-xl text-primary-foreground/85">
                Two strategically located yards serving the entire Bay Area. 
                Get same-day delivery from the location nearest you.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-padding bg-background" ref={mapRef}>
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Yard Cards */}
            <div className="lg:col-span-1 space-y-6">
              <StaggeredContainer className="space-y-6">
                {OPERATIONAL_YARDS.map((yard, index) => (
                  <AnimatedItem key={yard.id}>
                    <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{yard.name}</h3>
                          <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                            Active Yard
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{yard.address}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">{yard.note}</span>
                        </div>
                      </div>
                      
                      <a
                        href={yard.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </AnimatedItem>
                ))}

                {/* HQ Card */}
                <AnimatedItem>
                  <div className="bg-muted/50 rounded-2xl border border-border p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary text-secondary-foreground">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">Mailing Address (HQ)</h3>
                        <span className="text-xs text-muted-foreground">Administrative office</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>{BUSINESS_INFO.address.full}</p>
                      <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Phone className="w-4 h-4" />
                        {BUSINESS_INFO.phone.salesFormatted}
                      </a>
                    </div>
                  </div>
                </AnimatedItem>
              </StaggeredContainer>
            </div>

            {/* Interactive Map */}
            <div className="lg:col-span-2">
              <AnimatedSection>
                <div className="bg-card rounded-2xl border border-border overflow-hidden h-[500px] lg:h-[600px]">
                  {mapLoaded ? (
                    <MapContainer
                      center={MAP_CENTER}
                      zoom={9}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; Esri'
                      />
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                        attribution=''
                      />
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                        attribution=''
                      />

                      {/* Yard Markers */}
                      {OPERATIONAL_YARDS.map((yard) => (
                        <Marker
                          key={yard.id}
                          position={[yard.lat, yard.lng]}
                          icon={createYardIcon()}
                        >
                          <Popup>
                            <div className="p-2 min-w-[200px]">
                              <h4 className="font-bold text-base mb-1">{yard.name}</h4>
                              <p className="text-sm text-muted-foreground mb-3">{yard.address}</p>
                              <a
                                href={yard.directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                              >
                                <Navigation className="w-3 h-3" />
                                Get Directions
                              </a>
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                      {/* HQ Marker */}
                      <Marker
                        position={[BUSINESS_INFO.geo.latitude, BUSINESS_INFO.geo.longitude]}
                        icon={createHQIcon()}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h4 className="font-bold text-base mb-1">Headquarters</h4>
                            <p className="text-sm text-muted-foreground">{BUSINESS_INFO.address.full}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-muted">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                        <p className="text-muted-foreground">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedSection>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  <span>Operational Yard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-secondary" />
                  <span>Headquarters</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="heading-lg text-foreground mb-4">Trust & Compliance</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Licensed, insured, and ready to serve the Bay Area
              </p>
            </div>
          </AnimatedSection>

          <StaggeredContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedItem>
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <Award className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-1">BBB A+ Accredited</h3>
                <p className="text-sm text-muted-foreground">Oakland HQ</p>
              </div>
            </AnimatedItem>
            
            <AnimatedItem>
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <Shield className="w-10 h-10 text-accent mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-1">Google Guaranteed</h3>
                <p className="text-sm text-muted-foreground">Local Services</p>
              </div>
            </AnimatedItem>
            
            <AnimatedItem>
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <Truck className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-1">DMV Motor Carrier</h3>
                <p className="text-sm text-muted-foreground">MCP Licensed & Active</p>
              </div>
            </AnimatedItem>
            
            <AnimatedItem>
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <Shield className="w-10 h-10 text-success mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-1">Fully Insured</h3>
                <p className="text-sm text-muted-foreground">Licensed & Bonded</p>
              </div>
            </AnimatedItem>
          </StaggeredContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <AnimatedSection>
            <h2 className="heading-lg mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-primary-foreground/85 mb-8 max-w-2xl mx-auto">
              Enter your ZIP code to see which yard will serve your location
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-lg px-8"
            >
              <a href="/quote">Get Instant Quote</a>
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}

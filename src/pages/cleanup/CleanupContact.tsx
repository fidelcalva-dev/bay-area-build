import { Link } from 'react-router-dom';
import { CleanupLayout } from '@/components/cleanup/CleanupLayout';
import { CLEANUP_BRAND, BRAND_CLARIFICATION } from '@/config/cleanup/content';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, FileText } from 'lucide-react';

export default function CleanupContact() {
  return (
    <CleanupLayout
      title="Contact Calsan C&D Waste Removal | Construction Cleanup"
      description="Contact Calsan C&D Waste Removal for construction cleanup, post-construction cleanup, and recurring jobsite service in Oakland, Alameda, and the Bay Area."
    >
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mb-10">
            Tell us about your project and we'll help you choose the right cleanup service.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cleanup Contact */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Cleanup Support</h2>
              <p className="text-sm text-muted-foreground mb-4">
                For construction cleanup, post-construction cleanup, demolition debris cleanup, or recurring jobsite service.
              </p>
              <div className="space-y-3 mb-6">
                <a href={`tel:${CLEANUP_BRAND.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Phone className="w-4 h-4" /> {CLEANUP_BRAND.phone}
                </a>
                <a href={`mailto:${CLEANUP_BRAND.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Mail className="w-4 h-4" /> {CLEANUP_BRAND.email}
                </a>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" /> Oakland, Alameda & Bay Area
                </div>
              </div>
              <Button asChild className="w-full">
                <Link to="/cleanup/quote">
                  <FileText className="w-4 h-4 mr-2" /> Request a Cleanup Quote
                </Link>
              </Button>
            </div>

            {/* Dumpster Crossover */}
            <div className="bg-muted rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Dumpster Rentals</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Dumpster rentals are handled through our sister brand, Calsan Dumpsters Pro.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href={CLEANUP_BRAND.legacy_url} target="_blank" rel="noopener noreferrer">
                  Visit Calsan Dumpsters Pro →
                </a>
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8">{BRAND_CLARIFICATION}</p>
        </div>
      </section>
    </CleanupLayout>
  );
}

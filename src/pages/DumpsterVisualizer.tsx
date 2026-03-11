/**
 * Dumpster Visualizer Page
 * Standalone page for size comparison and "Will it fit?" calculator
 */
import { Layout } from '@/components/layout/Layout';
import { DumpsterSizeVisualizer, DumpsterSize } from '@/components/visualizer';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';

export default function DumpsterVisualizer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get initial size from URL params
  const sizeParam = searchParams.get('size');
  const initialSize = sizeParam ? (parseInt(sizeParam, 10) as DumpsterSize) : 20;
  
  const handleSelectSize = (size: DumpsterSize) => {
    // Update URL without navigation
    const newParams = new URLSearchParams(searchParams);
    newParams.set('size', size.toString());
    navigate(`?${newParams.toString()}`, { replace: true });
  };
  
  return (
    <Layout
      title="Dumpster Size Visualizer | Compare Dimensions & Capacity"
      description="Visual tool to compare dumpster sizes and dimensions. See how dumpsters compare to a pickup truck or garage door. Calculate if your debris will fit."
      canonical="/visualizer"
    >
      {/* Back navigation */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container-wide py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/sizes" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Sizes
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Hero */}
      <section className="bg-background py-8 sm:py-12 border-b border-border">
        <div className="container-narrow text-center">
          <h1 className="heading-lg text-foreground mb-3">
            Dumpster Size Visualizer
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compare dumpster dimensions to everyday objects and calculate if your debris will fit.
          </p>
        </div>
      </section>
      
      {/* Main Visualizer */}
      <section className="section-padding bg-muted/20">
        <div className="container-narrow">
          <DumpsterSizeVisualizer 
            initialSize={initialSize}
            onSelectSize={handleSelectSize}
            showQuoteLink={true}
          />
        </div>
      </section>
      
      {/* Help CTA */}
      <section className="py-8 bg-background border-t border-border">
        <div className="container-narrow text-center">
          <p className="text-muted-foreground mb-4">
            Still not sure which size? Try our AI photo analysis or talk to our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <Link to="/waste-vision" className="gap-2">
                📸 Scan Your Debris
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="tel:+15106802150" className="gap-2">
                <Phone className="w-4 h-4" />
                Call (510) 680-2150
              </a>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/capacity-guide">
                View Capacity Guide
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

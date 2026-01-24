/**
 * Waste Vision AI Page
 * Standalone page for AI-powered debris/waste photo analysis
 */
import { Layout } from '@/components/layout/Layout';
import { WasteVisionAnalyzer } from '@/components/vision';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Calculator } from 'lucide-react';
import type { AnalysisResult } from '@/components/vision/types';

export default function WasteVisionPage() {
  const navigate = useNavigate();

  const handleApplyToQuote = (result: AnalysisResult) => {
    // Navigate to quote with prefilled data
    const params = new URLSearchParams();
    params.set('material', result.recommended_flow.waste_type === 'heavy' ? 'heavy' : 'general');
    params.set('size', result.recommended_flow.recommended_size.toString());
    params.set('ai_analysis_id', result.analysisId || '');
    
    navigate(`/quote?${params.toString()}`);
  };

  const handleSendToCS = (result: AnalysisResult) => {
    // Open phone dialer for now
    window.location.href = 'tel:+15106802150';
  };

  return (
    <Layout
      title="Waste Vision AI | Photo-Based Debris Analysis"
      description="Upload photos of your debris for instant AI-powered dumpster size recommendations. Detect materials, estimate volume, and get accurate pricing."
    >
      {/* Back navigation */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container-wide py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/quote" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Quote
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-background py-8 sm:py-12 border-b border-border">
        <div className="container-narrow text-center">
          <h1 className="heading-lg text-foreground mb-3">
            Waste Vision AI
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Not sure what size you need? Upload photos of your debris and our AI 
            will estimate volume, detect materials, and recommend the right dumpster.
          </p>
        </div>
      </section>

      {/* Main Analyzer */}
      <section className="section-padding bg-muted/20">
        <div className="container-narrow max-w-2xl">
          <WasteVisionAnalyzer
            onApplyToQuote={handleApplyToQuote}
            onSendToCS={handleSendToCS}
            showQuoteButton={true}
          />
        </div>
      </section>

      {/* Help CTA */}
      <section className="py-8 bg-background border-t border-border">
        <div className="container-narrow text-center">
          <p className="text-muted-foreground mb-4">
            Prefer to talk to someone? Our team is ready to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <a href="tel:+15106802150" className="gap-2">
                <Phone className="w-4 h-4" />
                Call (510) 680-2150
              </a>
            </Button>
            <Button asChild>
              <Link to="/quote" className="gap-2">
                <Calculator className="w-4 h-4" />
                Manual Quote Calculator
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Safety Disclaimer */}
      <section className="py-6 bg-muted/30">
        <div className="container-narrow">
          <div className="text-xs text-muted-foreground text-center max-w-2xl mx-auto space-y-1">
            <p>
              <strong>Important:</strong> AI estimates are based on visual analysis and may vary 
              from actual volume and weight. Final billing is determined by disposal scale ticket.
            </p>
            <p>
              Hazard detection is not a diagnosis. For potentially hazardous materials, 
              contact our Customer Service team before booking.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
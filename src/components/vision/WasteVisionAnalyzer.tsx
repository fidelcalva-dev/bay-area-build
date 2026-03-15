/**
 * Photo-Based Size Recommendation Component
 * Analyzes debris photos and recommends dumpster sizes
 */
import { useState, useRef, useCallback } from 'react';
import { 
  Upload, X, AlertTriangle, CheckCircle, 
  Loader2, Package, ArrowRight, Phone, 
  Truck, Clock, MapPin, Recycle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO } from '@/lib/seo';
import type { AnalysisResult } from './types';

// ============================================================
// HELPERS
// ============================================================

function getConfidenceWord(level: string): string {
  if (level === 'high') return 'High';
  if (level === 'medium') return 'Medium';
  return 'Low';
}

async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================
// SERVICE CYCLE BAR
// ============================================================

function ServiceCycleBar() {
  const steps = [
    { label: 'Delivery', icon: Truck },
    { label: 'On-site', icon: Clock },
    { label: 'Pickup', icon: MapPin },
    { label: 'Disposal', icon: Recycle },
  ];
  return (
    <div className="mt-4">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
        Typical service cycle
      </p>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <step.icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="h-px bg-border flex-shrink-0 w-4 -mt-3" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// RESULT DISPLAY
// ============================================================

function ResultDisplay({
  result,
  onApplyToQuote,
  onChooseDifferent,
  onSendToCS,
  onReset,
  showQuoteButton,
  isCreatingTicket,
}: {
  result: AnalysisResult;
  onApplyToQuote: () => void;
  onChooseDifferent: () => void;
  onSendToCS: () => void;
  onReset: () => void;
  showQuoteButton: boolean;
  isCreatingTicket: boolean;
}) {
  const isHeavy = result.recommended_flow.waste_type === 'heavy';
  const confidence = getConfidenceWord(result.overall_confidence);
  const visibleMats = result.materials.slice(0, 3);
  const extraCount = Math.max(0, result.materials.length - 3);

  return (
    <div className="space-y-5">
      {/* Hazard warning (non-alarming) */}
      {result.hazard_review_required && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Review required</p>
              <p className="text-xs text-muted-foreground mt-1">
                Potential concerns detected. Please contact our team before booking.
              </p>
              <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="text-xs font-medium text-primary mt-2 inline-flex items-center gap-1">
                <Phone className="w-3 h-3" /> Call {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main assessment card */}
      <div className="bg-muted/40 rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background">
          <h3 className="text-sm font-semibold text-foreground">Project Size Assessment</h3>
          <span className={cn(
            "text-[11px] font-medium px-2.5 py-1 rounded-full",
            confidence === 'High' && 'bg-primary/10 text-primary',
            confidence === 'Medium' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
            confidence === 'Low' && 'bg-muted text-muted-foreground',
          )}>
            Confidence: {confidence}
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Recommendation */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Recommended Size</p>
            <p className="text-2xl font-bold text-foreground">
              {result.recommended_flow.recommended_size}-Yard Dumpster
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Based on your photo, here's the recommended dumpster size.
            </p>
          </div>

          {/* Materials observed */}
          {visibleMats.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Materials observed
              </p>
              <div className="flex flex-wrap gap-1.5">
                {visibleMats.map((m) => (
                  <span key={m.id} className="px-2.5 py-1 bg-background border border-border rounded-full text-xs text-foreground">
                    {m.label}
                  </span>
                ))}
                {extraCount > 0 && (
                  <span className="px-2.5 py-1 bg-background border border-border rounded-full text-xs text-muted-foreground">
                    +{extraCount} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* What's included */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              What's included
            </p>
            {[
              'Delivery and pickup included',
              'Standard rental period included',
              'Disposal based on size and material',
            ].map((line) => (
              <div key={line} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs text-foreground">{line}</span>
              </div>
            ))}
          </div>

          <ServiceCycleBar />
        </div>
      </div>

      {/* Heavy material notice */}
      {isHeavy && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Heavy material detected
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Heavy materials require smaller dumpsters due to weight limits. Recommended sizes: 5, 8, or 10 yard.
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Fill-line rules may apply for safe transport.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {showQuoteButton && !result.hazard_review_required && (
          <Button onClick={onApplyToQuote} className="w-full" size="lg">
            Use Recommended Size
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {(result.hazard_review_required || result.overall_confidence === 'low') && (
          <Button 
            onClick={onSendToCS} 
            variant="outline" 
            className="w-full"
            size="lg"
            disabled={isCreatingTicket}
          >
            {isCreatingTicket ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Talk to dispatch
              </>
            )}
          </Button>
        )}
        <button
          onClick={onChooseDifferent}
          className="text-sm text-muted-foreground hover:text-foreground w-full text-center transition-colors py-1"
        >
          Choose a different size
        </button>
        <button
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground w-full text-center transition-colors py-1"
        >
          Upload a different photo
        </button>
      </div>
    </div>
  );
}

// ============================================================
// FALLBACK DISPLAY
// ============================================================

function FallbackDisplay({
  error,
  onManualSelect,
  onCallDispatch,
}: {
  error: string;
  onManualSelect: () => void;
  onCallDispatch: () => void;
}) {
  return (
    <div className="bg-muted/40 rounded-xl border border-border p-6 text-center space-y-4">
      <Package className="w-10 h-10 text-muted-foreground mx-auto" strokeWidth={1.5} />
      <div>
        <p className="text-sm font-semibold text-foreground">Photo unclear</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error || "We couldn't confidently recommend a size from this photo."}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={onManualSelect} className="w-full" size="lg">
          Choose size manually
        </Button>
        <Button onClick={onCallDispatch} variant="outline" className="w-full" size="lg">
          <Phone className="w-4 h-4 mr-2" />
          Talk to dispatch
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

interface WasteVisionAnalyzerProps {
  onApplyToQuote?: (result: AnalysisResult) => void;
  onSendToCS?: (result: AnalysisResult) => void;
  showQuoteButton?: boolean;
  className?: string;
}

export function WasteVisionAnalyzer({
  onApplyToQuote,
  onSendToCS,
  showQuoteButton = true,
  className,
}: WasteVisionAnalyzerProps) {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const newImages: { file: File; preview: string }[] = [];
    for (let i = 0; i < Math.min(files.length, 8 - images.length); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview });
      }
    }
    setImages(prev => [...prev, ...newImages]);
    setResult(null);
    setError(null);
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
    setResult(null);
  }, []);

  const analyzeImages = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const base64Images = await Promise.all(
        images.map(img => imageToBase64(img.file))
      );
      const sessionId = `vision_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      const { data, error: fnError } = await supabase.functions.invoke('analyze-waste', {
        body: { images: base64Images, sessionId },
      });

      if (fnError) throw new Error(fnError.message || 'Analysis failed');
      if (!data.success) throw new Error(data.error || 'Analysis failed');

      // Low confidence → fallback
      if (data.overall_confidence === 'low') {
        setError("We couldn't confidently recommend a size from this photo.");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze images');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setResult(null);
    setError(null);
  };

  const handleApplyToQuote = () => {
    if (result && onApplyToQuote) onApplyToQuote(result);
  };

  const handleChooseDifferent = () => {
    if (onApplyToQuote) {
      // Navigate to quote without prefilled size
      onApplyToQuote({ ...result!, recommended_flow: { ...result!.recommended_flow, recommended_size: 0 } });
    }
  };

  const handleSendToCS = async () => {
    if (!result) return;
    setIsCreatingTicket(true);
    try {
      if (result.analysisId) {
        await supabase
          .from('waste_vision_analyses')
          .update({
            hazard_review_status: 'pending',
            hazard_review_required: true,
            recommendation_notes: [
              ...(result.recommended_flow.notes || []),
              'Customer requested human review',
            ],
          })
          .eq('id', result.analysisId);
      }
      if (onSendToCS) {
        onSendToCS(result);
      } else {
        window.location.href = `tel:${BUSINESS_INFO.phone.sales}`;
      }
    } catch {
      window.location.href = `tel:${BUSINESS_INFO.phone.sales}`;
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleCallDispatch = () => {
    window.location.href = `tel:${BUSINESS_INFO.phone.sales}`;
  };

  const handleManualSelect = () => {
    if (onApplyToQuote) {
      // Signal to parent to go to manual flow
      handleChooseDifferent();
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">
          Upload a Photo
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload photos of your debris for a size recommendation
        </p>
      </div>

      {/* Upload Area */}
      {!result && !error && (
        <div className="bg-card rounded-xl border border-border p-6">
          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                  <img 
                    src={img.preview} 
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {images.length < 8 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                "hover:border-primary/50 hover:bg-muted/30",
                images.length > 0 ? "border-muted" : "border-border"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium text-foreground">
                {images.length > 0 ? 'Add more photos' : 'Upload photos of your debris'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Up to 8 photos — JPG, PNG accepted
              </p>
            </div>
          )}

          {/* Analyze Button */}
          {images.length > 0 && (
            <Button 
              onClick={analyzeImages} 
              disabled={isAnalyzing}
              className="w-full mt-4"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reviewing photo...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Get Size Recommendation
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Error / Fallback */}
      {!result && error && (
        <FallbackDisplay
          error={error}
          onManualSelect={handleManualSelect}
          onCallDispatch={handleCallDispatch}
        />
      )}

      {/* Results */}
      {result && (
        <ResultDisplay
          result={result}
          onApplyToQuote={handleApplyToQuote}
          onChooseDifferent={handleChooseDifferent}
          onSendToCS={handleSendToCS}
          onReset={handleReset}
          showQuoteButton={showQuoteButton}
          isCreatingTicket={isCreatingTicket}
        />
      )}
    </div>
  );
}

export default WasteVisionAnalyzer;

import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Package, ArrowRight, AlertTriangle, Truck, Clock, MapPin, Recycle, CheckCircle, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface PhotoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AnalysisResult {
  recommendedSize: number;
  heavyOrGeneral: string;
  confidenceScore: number;
  confidenceLabel: string;
  materials: { label: string; percentage: number }[];
  analysisId?: string;
  leadId?: string;
  supportingLine?: string;
}

const PHOTO_AI_DRAFT_KEY = 'calsan_photo_ai_draft';

function savePhotoDraft(result: AnalysisResult) {
  try {
    localStorage.setItem(PHOTO_AI_DRAFT_KEY, JSON.stringify({ ...result, savedAt: Date.now() }));
  } catch { /* quota exceeded */ }
}

function getConfidenceLabel(score: number): string {
  if (score >= 0.75) return 'High';
  if (score >= 0.5) return 'Medium';
  return 'Low';
}

// ── Service Cycle Bar ──────────────────────────────────────

function ServiceCycleBar() {
  const steps = [
    { label: 'Delivery', icon: Truck },
    { label: 'On-site', icon: Clock },
    { label: 'Pickup', icon: MapPin },
    { label: 'Disposal', icon: Recycle },
  ];
  return (
    <div className="mt-5">
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

// ── Result Card ────────────────────────────────────────────

function ResultCard({
  result,
  onUseRecommended,
  onChooseDifferent,
  onUploadAnother,
}: {
  result: AnalysisResult;
  onUseRecommended: () => void;
  onChooseDifferent: () => void;
  onUploadAnother: () => void;
}) {
  const isHeavy = result.heavyOrGeneral === 'heavy';
  const visibleMaterials = result.materials.slice(0, 3);
  const extraCount = Math.max(0, result.materials.length - 3);

  return (
    <div className="space-y-5">
      {/* Card */}
      <div className="bg-muted/40 rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background">
          <h3 className="text-sm font-semibold text-foreground">Project Size Assessment</h3>
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
            result.confidenceLabel === 'High'
              ? 'bg-primary/10 text-primary'
              : result.confidenceLabel === 'Medium'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              : 'bg-muted text-muted-foreground'
          }`}>
            Confidence: {result.confidenceLabel}
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Main recommendation */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Recommended Size</p>
            <p className="text-2xl font-bold text-foreground">
              {result.recommendedSize}-Yard Dumpster
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">
              {result.supportingLine || 'For debris of this type and estimated volume.'}
            </p>
          </div>

          {/* Material chips */}
          {visibleMaterials.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Materials observed
              </p>
              <div className="flex flex-wrap gap-1.5">
                {visibleMaterials.map((m, i) => (
                  <span key={i} className="px-2.5 py-1 bg-background border border-border rounded-full text-xs text-foreground">
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

          {/* Service cycle bar */}
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
                Heavy materials require smaller dumpsters due to weight limits. Recommended sizes: 6, 8, or 10 yard.
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Fill-line rules may apply for safe transport.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <Button onClick={onUseRecommended} className="w-full" size="lg">
        Use Recommended Size
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <button
        onClick={onChooseDifferent}
        className="text-sm text-muted-foreground hover:text-foreground w-full text-center transition-colors"
      >
        Choose a different size
      </button>

      <button
        onClick={onUploadAnother}
        className="text-xs text-muted-foreground hover:text-foreground w-full text-center transition-colors"
      >
        Upload a different photo
      </button>
    </div>
  );
}

// ── Fallback Card (low confidence / error) ─────────────────

function FallbackCard({
  message,
  onManualSelect,
  onCallDispatch,
}: {
  message: string;
  onManualSelect: () => void;
  onCallDispatch: () => void;
}) {
  return (
    <div className="bg-muted/40 rounded-xl border border-border p-6 text-center space-y-4">
      <Package className="w-10 h-10 text-muted-foreground mx-auto" strokeWidth={1.5} />
      <div>
        <p className="text-sm font-semibold text-foreground">Photo unclear</p>
        <p className="text-sm text-muted-foreground mt-1">
          {message || "We couldn't confidently recommend a size from this photo."}
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

// ── Main Modal ─────────────────────────────────────────────

export function PhotoUploadModal({ open, onOpenChange }: PhotoUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'analyzing' | 'done' | 'error' | 'fallback'>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter(f =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    ).slice(0, 3);

    if (validFiles.length === 0) return;

    setFiles(prev => [...prev, ...validFiles].slice(0, 3));
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string].slice(0, 3));
      };
      reader.readAsDataURL(file);
    });
    setError(null);
    setResult(null);
    setPhase('idle');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setResult(null);
    setPhase('idle');
  };

  const analyzePhotos = async () => {
    if (files.length === 0) return;
    setPhase('uploading');
    setError(null);

    try {
      // Step 1: Upload to storage (non-blocking)
      let storagePath: string | null = null;
      try {
        const fileName = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
        await supabase.storage.from('waste-uploads').upload(fileName, files[0], {
          contentType: files[0].type,
          upsert: false,
        });
        storagePath = fileName;
      } catch { /* non-blocking */ }

      setPhase('analyzing');

      // Step 2: Convert files to base64
      const images = await Promise.all(
        files.map(file => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = (e.target?.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(file);
        }))
      );

      // Step 3: Call analyze-waste
      const { data, error: fnError } = await supabase.functions.invoke('analyze-waste', {
        body: {
          images,
          image_storage_path: storagePath,
        },
      });

      if (fnError) throw fnError;

      // Handle ok=false with fallback
      if (data?.ok === false) {
        setError(data.fallback?.message || data.error || 'Analysis failed');
        setPhase('fallback');
        return;
      }

      // Extract from standardized or legacy response
      const recommendedSize = data?.recommended_size || data?.recommendation?.recommendedSize || 20;
      const heavyFlag = data?.heavy_flag ?? (data?.recommendation?.materialCategory === 'heavy');
      const confidence = data?.confidence || data?.recommendation?.confidence || 0.7;
      const materials = data?.analysis?.materials?.map((m: any) => ({
        label: m.label || m.name,
        percentage: m.percentage,
      })) || [];

      const confidenceLabel = getConfidenceLabel(confidence);

      // Low confidence → fallback
      if (confidenceLabel === 'Low') {
        setError("We couldn't confidently recommend a size from this photo.");
        setPhase('fallback');
        return;
      }

      const analysisResult: AnalysisResult = {
        recommendedSize,
        heavyOrGeneral: heavyFlag ? 'heavy' : 'general',
        confidenceScore: confidence,
        confidenceLabel,
        materials,
        analysisId: data?.analysisId,
        leadId: data?.lead_id,
        supportingLine: data?.supporting_line,
      };

      setResult(analysisResult);
      setPhase('done');

      // Persist to localStorage
      savePhotoDraft(analysisResult);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError("We couldn't confidently recommend a size from this photo.");
      setPhase('fallback');
    }
  };

  const handleUseRecommended = () => {
    if (!result) return;
    const params = new URLSearchParams({
      v3: '1',
      size: String(result.recommendedSize),
      material: result.heavyOrGeneral,
      from: 'photo-assessment',
      ...(result.analysisId ? { ai_analysis_id: result.analysisId } : {}),
    });
    onOpenChange(false);
    navigate(`/quote?${params.toString()}`);
  };

  const handleChooseDifferent = () => {
    onOpenChange(false);
    navigate('/quote?v3=1');
  };

  const handleCallDispatch = () => {
    window.location.href = 'tel:+15106802150';
  };

  const resetModal = () => {
    setFiles([]);
    setPreviews([]);
    setResult(null);
    setError(null);
    setPhase('idle');
  };

  const phaseLabel = phase === 'uploading' ? 'Uploading...' : phase === 'analyzing' ? 'Reviewing photo...' : 'Get Size Recommendation';

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetModal(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Upload a Photo
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            We'll review your debris and recommend the right dumpster size.
          </p>
        </DialogHeader>

        {phase === 'done' && result ? (
          <ResultCard
            result={result}
            onUseRecommended={handleUseRecommended}
            onChooseDifferent={handleChooseDifferent}
            onUploadAnother={resetModal}
          />
        ) : phase === 'fallback' ? (
          <FallbackCard
            message={error || ''}
            onManualSelect={handleChooseDifferent}
            onCallDispatch={handleCallDispatch}
          />
        ) : (
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-medium text-foreground text-sm">
                Drag and drop your photo here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse — JPG, PNG accepted
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="flex gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-background/80 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={analyzePhotos}
              disabled={files.length === 0 || phase === 'uploading' || phase === 'analyzing'}
              className="w-full"
              size="lg"
            >
              {(phase === 'uploading' || phase === 'analyzing') ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {phaseLabel}
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Get Size Recommendation
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

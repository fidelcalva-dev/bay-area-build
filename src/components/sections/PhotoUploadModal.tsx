import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Camera, Loader2, Package, ArrowRight, AlertTriangle } from 'lucide-react';
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

export function PhotoUploadModal({ open, onOpenChange }: PhotoUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'analyzing' | 'done' | 'error'>('idle');
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
        setPhase('error');
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

      const analysisResult: AnalysisResult = {
        recommendedSize,
        heavyOrGeneral: heavyFlag ? 'heavy' : 'general',
        confidenceScore: confidence,
        confidenceLabel: getConfidenceLabel(confidence),
        materials,
        analysisId: data?.analysisId,
        leadId: data?.lead_id,
      };

      setResult(analysisResult);
      setPhase('done');

      // Persist to localStorage
      savePhotoDraft(analysisResult);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError('Could not analyze the photo. Please select size manually or contact us.');
      setPhase('error');
    }
  };

  const handleSeePrice = () => {
    if (!result) return;
    const params = new URLSearchParams({
      v3: '1',
      size: String(result.recommendedSize),
      material: result.heavyOrGeneral,
      from: 'waste-vision',
      ...(result.analysisId ? { ai_analysis_id: result.analysisId } : {}),
    });
    onOpenChange(false);
    navigate(`/quote?${params.toString()}`);
  };

  const handleManualSelect = () => {
    onOpenChange(false);
    navigate('/quote?v3=1');
  };

  const resetModal = () => {
    setFiles([]);
    setPreviews([]);
    setResult(null);
    setError(null);
    setPhase('idle');
  };

  const phaseLabel = phase === 'uploading' ? 'Uploading...' : phase === 'analyzing' ? 'Analyzing...' : 'Analyze Photo';

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetModal(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Upload Your Project Photo
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            We'll review your debris and recommend the right dumpster size.
          </p>
        </DialogHeader>

        {phase !== 'done' ? (
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

            {/* Error with fallback */}
            {phase === 'error' && error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
                <Button onClick={handleManualSelect} variant="outline" size="sm" className="w-full">
                  Select Size Manually
                </Button>
              </div>
            )}

            {phase !== 'error' && (
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
                    <Camera className="w-4 h-4 mr-2" />
                    Analyze Photo
                  </>
                )}
              </Button>
            )}
          </div>
        ) : result ? (
          <div className="space-y-5">
            {/* Result card */}
            <div className="bg-muted/50 rounded-xl p-6 text-center border border-border">
              <Package className="w-10 h-10 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground mb-1">Recommended</p>
              <p className="text-3xl font-bold text-foreground">
                {result.recommendedSize}-Yard Dumpster
              </p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                  {result.heavyOrGeneral}
                </span>
                <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                  {result.confidenceLabel} confidence
                </span>
              </div>
            </div>

            {/* Materials detected */}
            {result.materials.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Materials Detected
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.materials.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 bg-card border border-border rounded-full text-xs text-foreground">
                      {m.label} ({m.percentage}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Heavy material notice */}
            {result.heavyOrGeneral === 'heavy' && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Heavy Materials:</strong> Restricted to 6, 8, or 10 yard containers with fill-line compliance required.
                </p>
              </div>
            )}

            <Button onClick={handleSeePrice} className="w-full" size="lg">
              See Exact Price
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <button
              onClick={resetModal}
              className="text-sm text-muted-foreground hover:text-foreground w-full text-center transition-colors"
            >
              Upload a different photo
            </button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
